// Personality Voice Audio Storage Engine — Cloudinary hosting + Firestore metadata + IndexedDB caching.
// (Previously used Firebase Storage, which requires the paid Blaze plan; audio silently failed to
// upload and stayed device-local only. Cloudinary is free and gives a real cross-device URL.)
import { getIDBItem, setIDBItem, removeIDBItem } from './idbStorage';
import { db, isFirestoreQuotaExceeded, markFirestoreQuotaExceeded, isQuotaError } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, getDoc, getDocs, onSnapshot, writeBatch } from 'firebase/firestore';
import { uploadAudioToCloudinary } from './cloudinaryUpload';

/**
 * Saves a personality trait's audio to Cloudinary (permanent cross-device URL) and
 * lightweight metadata to Firestore, plus an instant local IndexedDB cache.
 */
export async function savePersonalityAudioToCloud(traitId: string, audioUrl: string): Promise<void> {
  if (!traitId) return;

  try {
    await setIDBItem(`hu_tao_personality_audio_${traitId}`, audioUrl);
  } catch (err) {
    console.warn('IDB personality audio save warning:', err);
  }

  try {
    let downloadUrl = audioUrl;

    if (audioUrl.startsWith('data:')) {
      try {
        downloadUrl = await uploadAudioToCloudinary(audioUrl);
        await setIDBItem(`hu_tao_personality_audio_${traitId}`, downloadUrl);
      } catch (cloudErr) {
        console.warn('Personality audio Cloudinary upload failed (staying local-only for now):', cloudErr);
        return;
      }
    }

    if (!isFirestoreQuotaExceeded()) {
      const docRef = doc(db, 'personalityAudio', traitId);
      await setDoc(
        docRef,
        {
          traitId,
          audioUrl: downloadUrl,
          isChunked: false,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    if (isQuotaError(err)) markFirestoreQuotaExceeded();
    console.warn('Failed to save personality audio to Firestore (local storage active):', err);
  }
}

/**
 * Deletes personality audio from Firestore and IndexedDB.
 */
export async function deletePersonalityAudioFromCloud(traitId: string): Promise<void> {
  if (!traitId) return;

  try {
    await removeIDBItem(`hu_tao_personality_audio_${traitId}`);
  } catch (e) {}

  try {
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
 * Fetch a single personality trait's audio URL from Firestore (works on any device).
 */
export async function fetchPersonalityAudioFromCloud(traitId: string): Promise<string | null> {
  try {
    const docRef = doc(db, 'personalityAudio', traitId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;

    const data = snap.data();
    let audioUrl = data.audioUrl || '';

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
 * Realtime listener for all personality audios in Firestore.
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
