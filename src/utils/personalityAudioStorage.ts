// Personality Voice Audio Storage Engine with Firebase Storage & Firestore Cloud Sync & IndexedDB Caching
import { getIDBItem, setIDBItem, removeIDBItem } from './idbStorage';
import {
  db,
  storage,
  isFirestoreQuotaExceeded,
  markFirestoreQuotaExceeded,
  isQuotaError,
} from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import {
  ref as storageRef,
  uploadString,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

/**
 * Saves a personality trait's audio to Firebase Storage and metadata to Firestore & IndexedDB.
 */
export async function savePersonalityAudioToCloud(traitId: string, audioUrl: string): Promise<void> {
  if (!traitId) return;

  // 1. Immediately cache locally in IndexedDB for instant offline and cross-tab access
  try {
    await setIDBItem(`hu_tao_personality_audio_${traitId}`, audioUrl);
  } catch (err) {
    console.warn('IDB personality audio save warning:', err);
  }

  // 2. Persist to Firebase Storage & Firestore
  try {
    let downloadUrl = audioUrl;
    let storagePath = `personalityAudio/${traitId}.mp3`;

    if (audioUrl.startsWith('data:')) {
      try {
        const fileRef = storageRef(storage, storagePath);
        await uploadString(fileRef, audioUrl, 'data_url');
        downloadUrl = await getDownloadURL(fileRef);
        // Cache download URL to IDB
        await setIDBItem(`hu_tao_personality_audio_${traitId}`, downloadUrl);
      } catch (storageErr) {
        console.warn('Personality audio Firebase Storage upload notice:', storageErr);
      }
    }

    if (!isFirestoreQuotaExceeded()) {
      const docRef = doc(db, 'personalityAudio', traitId);
      const isDataTooLarge = downloadUrl.startsWith('data:') && downloadUrl.length > 50000;

      await setDoc(docRef, {
        traitId,
        audioUrl: isDataTooLarge ? '' : downloadUrl,
        storagePath,
        isChunked: false,
        size: `${Math.round(audioUrl.length / 1024)} KB`,
        updatedAt: Date.now(),
      }, { merge: true });
    }
  } catch (err) {
    if (isQuotaError(err)) markFirestoreQuotaExceeded();
    console.warn('Failed to save personality audio to Firestore (local storage active):', err);
  }
}

/**
 * Deletes personality audio from Firebase Storage, Firestore and IndexedDB.
 */
export async function deletePersonalityAudioFromCloud(traitId: string): Promise<void> {
  if (!traitId) return;

  try {
    await removeIDBItem(`hu_tao_personality_audio_${traitId}`);
  } catch (e) {}

  try {
    // 1. Delete from Firebase Storage
    try {
      const fileRef = storageRef(storage, `personalityAudio/${traitId}.mp3`);
      await deleteObject(fileRef);
    } catch (e) {}

    // 2. Clean legacy chunks if present and quota not exceeded
    if (!isFirestoreQuotaExceeded()) {
      const docRef = doc(db, 'personalityAudio', traitId);
      try {
        const chunksColl = collection(db, 'personalityAudio', traitId, 'chunks');
        const chunksSnap = await getDocs(chunksColl);
        if (!chunksSnap.empty) {
          const batch = writeBatch(db);
          chunksSnap.docs.forEach((cDoc) => batch.delete(cDoc.ref));
          await batch.commit();
        }
      } catch (e) {}

      await deleteDoc(docRef);
    }
  } catch (err) {
    if (isQuotaError(err)) markFirestoreQuotaExceeded();
    console.warn('Failed to delete personality audio from Firestore:', err);
  }
}

/**
 * Load personality audio from local IndexedDB cache.
 */
export async function loadPersonalityAudioFromLocal(traitId: string): Promise<string | null> {
  try {
    return await getIDBItem(`hu_tao_personality_audio_${traitId}`);
  } catch (e) {
    return null;
  }
}

/**
 * Fetch a single personality trait audio from Firebase Storage / Firestore.
 */
export async function fetchPersonalityAudioFromCloud(traitId: string): Promise<string | null> {
  try {
    const docRef = doc(db, 'personalityAudio', traitId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;

    const data = snap.data();
    let audioUrl = data.audioUrl || '';

    if (!audioUrl && data.storagePath) {
      try {
        const fileRef = storageRef(storage, data.storagePath);
        audioUrl = await getDownloadURL(fileRef);
      } catch (e) {}
    }

    if (!audioUrl && data.isChunked && data.chunksCount) {
      const chunksColl = collection(db, 'personalityAudio', traitId, 'chunks');
      const chunksSnap = await getDocs(chunksColl);
      const chunksMap = new Map<number, string>();
      chunksSnap.forEach((cDoc) => {
        const cData = cDoc.data();
        chunksMap.set(cData.index, cData.data);
      });

      let fullUrl = '';
      for (let i = 0; i < data.chunksCount; i++) {
        fullUrl += chunksMap.get(i) || '';
      }
      audioUrl = fullUrl;
    }

    if (audioUrl) {
      await setIDBItem(`hu_tao_personality_audio_${traitId}`, audioUrl);
      return audioUrl;
    }
    return null;
  } catch (err) {
    console.warn(`Failed to fetch audio for trait ${traitId} from Firestore:`, err);
    return null;
  }
}

/**
 * Realtime listener for all personality audios in Firebase Firestore.
 */
export function subscribePersonalityAudios(
  onUpdate: (audioMap: Record<string, string>) => void
): () => void {
  try {
    const audioColl = collection(db, 'personalityAudio');
    const unsubscribe = onSnapshot(
      audioColl,
      async (snapshot) => {
        const audioMap: Record<string, string> = {};

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          const traitId = data.traitId || docSnap.id;
          let audioUrl = data.audioUrl || '';

          if (!audioUrl && data.storagePath) {
            try {
              const fileRef = storageRef(storage, data.storagePath);
              audioUrl = await getDownloadURL(fileRef);
            } catch (e) {}
          }

          if (!audioUrl && data.isChunked && data.chunksCount) {
            try {
              const chunksColl = collection(db, 'personalityAudio', traitId, 'chunks');
              const chunksSnap = await getDocs(chunksColl);
              const chunksMap = new Map<number, string>();
              chunksSnap.forEach((cDoc) => {
                const cData = cDoc.data();
                chunksMap.set(cData.index, cData.data);
              });

              let fullUrl = '';
              for (let i = 0; i < data.chunksCount; i++) {
                fullUrl += chunksMap.get(i) || '';
              }
              audioUrl = fullUrl;
            } catch (chunkErr) {
              console.warn('Error reading personality audio chunks:', chunkErr);
            }
          }

          if (audioUrl) {
            audioMap[traitId] = audioUrl;
            // Cache to IndexedDB for rapid subsequent tab opening
            setIDBItem(`hu_tao_personality_audio_${traitId}`, audioUrl).catch(() => {});
          }
        }

        if (Object.keys(audioMap).length > 0) {
          onUpdate(audioMap);
        }
      },
      (error) => {
        console.info('Firestore personality audio subscription notice:', error.message);
      }
    );

    return unsubscribe;
  } catch (e) {
    console.warn('Failed to subscribe to personality audios:', e);
    return () => {};
  }
}
