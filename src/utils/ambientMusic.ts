// Background Ambient Audio Engine with Firebase Storage Sync & Autoplay Unlock
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
  onSnapshot,
} from 'firebase/firestore';
import {
  ref,
  uploadString,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

export interface MusicTrack {
  id: string;
  name: string;
  url: string;
  size?: string;
  addedAt: number;
}

type Listener = (isPlaying: boolean) => void;

// Default high quality fallback background tracks (peaceful Genshin / Hu Tao oriental ambient music)
export const DEFAULT_ORIENTAL_TRACKS: MusicTrack[] = [
  {
    id: 'default_track_1',
    name: 'Wangsheng Twilight Flute',
    url: 'https://raw.githubusercontent.com/mdn/webaudio-examples/main/audio-analyser/viper.mp3',
    size: 'Preset',
    addedAt: 1,
  },
  {
    id: 'default_track_2',
    name: 'Liyue Nightfall Guqin',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    size: 'Preset',
    addedAt: 2,
  },
  {
    id: 'default_track_3',
    name: 'Silk Flower Serenade',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    size: 'Preset',
    addedAt: 3,
  },
];

const DEFAULT_AMBIENT_URL = DEFAULT_ORIENTAL_TRACKS[0].url;

class AmbientMusicEngine {
  private isPlaying: boolean = false;
  private listeners: Set<Listener> = new Set();
  private volume: number = 0.35;
  private customAudioElement: HTMLAudioElement | null = null;
  private mode: 'synth' | 'custom' = 'synth';
  private playlist: MusicTrack[] = [];
  private currentTrackIndex: number = 0;

  private currentAudioSrc: string = '';
  private isTransitioningTrack: boolean = false;
  private trackSessionCounter: number = 0;

  // Autoplay gesture tracking
  private isAudioBlocked: boolean = false;
  private gestureListenersAttached: boolean = false;
  private removeGestureListeners: (() => void) | null = null;

  // Web Audio Synth properties for Oriental Bamboo Flute
  private synthCtx: AudioContext | null = null;
  private synthTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    try {
      const savedVol = localStorage.getItem('hu_tao_ambient_music_volume');
      if (savedVol) {
        this.volume = parseFloat(savedVol);
      }
      const savedMode = localStorage.getItem('hu_tao_ambient_music_mode');
      if (savedMode === 'custom' || savedMode === 'synth') {
        this.mode = savedMode;
      }
    } catch (e) {
      console.warn('localStorage read error:', e);
    }

    // Load saved playlist from IndexedDB asynchronously
    this.initLocalPlaylist();

    // Setup Firestore realtime listener for music tracks
    this.initFirestoreSync();

    // Check saved persistence state (default auto-play on unless explicitly muted by user)
    try {
      const savedState = localStorage.getItem('hu_tao_ambient_music_enabled');
      if (savedState !== 'false') {
        this.start();
      }
    } catch (e) {
      console.warn('localStorage read error:', e);
    }

    // Always setup global gesture listener to unlock audio on first interaction
    this.setupGestureListeners();
  }

  private setupGestureListeners() {
    if (this.gestureListenersAttached) return;
    this.gestureListenersAttached = true;

    const handleUserGesture = () => {
      if (this.isPlaying) {
        this.attemptUnlockAudio();
      }
    };

    const removeListeners = () => {
      window.removeEventListener('click', handleUserGesture);
      window.removeEventListener('pointerdown', handleUserGesture);
      window.removeEventListener('touchstart', handleUserGesture);
      window.removeEventListener('mousedown', handleUserGesture);
      window.removeEventListener('keydown', handleUserGesture);
      this.gestureListenersAttached = false;
      this.removeGestureListeners = null;
    };

    this.removeGestureListeners = removeListeners;

    window.addEventListener('click', handleUserGesture, { passive: true });
    window.addEventListener('pointerdown', handleUserGesture, { passive: true });
    window.addEventListener('touchstart', handleUserGesture, { passive: true });
    window.addEventListener('mousedown', handleUserGesture, { passive: true });
    window.addEventListener('keydown', handleUserGesture, { passive: true });
  }

  public attemptUnlockAudio() {
    if (!this.isPlaying) return;

    if (this.mode === 'synth') {
      if (!this.synthCtx) {
        this.playSynthMelody();
      } else if (this.synthCtx.state === 'suspended') {
        this.synthCtx
          .resume()
          .then(() => {
            this.isAudioBlocked = false;
            if (this.removeGestureListeners) this.removeGestureListeners();
            this.notifyListeners();
          })
          .catch(() => {});
      } else {
        this.isAudioBlocked = false;
        if (this.removeGestureListeners) this.removeGestureListeners();
        this.notifyListeners();
      }
      if (!this.synthTimer) {
        this.playSynthMelody();
      }
    } else if (this.mode === 'custom') {
      const audioEl = this.ensureAudioElement();
      if (audioEl.paused) {
        const playPromise = audioEl.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.isAudioBlocked = false;
              if (this.removeGestureListeners) this.removeGestureListeners();
              this.notifyListeners();
            })
            .catch((err) => {
              console.warn('Unlock audio play blocked:', err);
              this.isAudioBlocked = true;
              this.notifyListeners();
            });
        }
      } else {
        this.isAudioBlocked = false;
        if (this.removeGestureListeners) this.removeGestureListeners();
        this.notifyListeners();
      }
    }
  }

  private migrateLegacyFreesoundTracks(tracks: MusicTrack[]): { tracks: MusicTrack[]; hasMigrated: boolean } {
    let hasMigrated = false;
    const migrated = tracks.map((t) => {
      if (t.url && t.url.includes('freesound.org')) {
        hasMigrated = true;
        if (t.id === 'default_track_2' || t.name?.includes('Liyue Nightfall') || t.url.includes('563148')) {
          return { ...t, url: DEFAULT_ORIENTAL_TRACKS[1].url, name: t.name || DEFAULT_ORIENTAL_TRACKS[1].name };
        }
        if (t.id === 'default_track_3' || t.name?.includes('Silk Flower') || t.url.includes('464902')) {
          return { ...t, url: DEFAULT_ORIENTAL_TRACKS[2].url, name: t.name || DEFAULT_ORIENTAL_TRACKS[2].name };
        }
        return { ...t, url: DEFAULT_ORIENTAL_TRACKS[1].url };
      }
      return t;
    });
    return { tracks: migrated, hasMigrated };
  }

  private async initLocalPlaylist() {
    try {
      const raw = await getIDBItem('hu_tao_music_playlist');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const { tracks, hasMigrated } = this.migrateLegacyFreesoundTracks(parsed);
          this.playlist = tracks;
          if (hasMigrated) {
            this.savePlaylistToLocal();
          }
        }
      }

      // Check legacy single url storage fallback
      if (this.playlist.length === 0) {
        const legacyUrl =
          (await getIDBItem('hu_tao_ambient_music_custom_url')) ||
          localStorage.getItem('hu_tao_ambient_music_custom_url');
        if (legacyUrl && legacyUrl !== '[IDB_STORED]') {
          this.playlist.push({
            id: 'track_' + Date.now(),
            name: 'Custom Track 1',
            url: legacyUrl,
            addedAt: Date.now(),
          });
          await setIDBItem('hu_tao_music_playlist', JSON.stringify(this.playlist));
        }
      }
    } catch (e) {
      console.warn('Error loading playlist from IDB:', e);
    }

    if (this.playlist.length > 0) {
      const savedModeChoice = localStorage.getItem('hu_tao_ambient_music_mode');
      if (!savedModeChoice || savedModeChoice === 'custom') {
        this.mode = 'custom';
      }
    }

    if (this.isPlaying && this.mode === 'custom') {
      this.playCurrentTrack();
    }
    this.notifyListeners();
  }

  private initFirestoreSync() {
    try {
      const tracksColl = collection(db, 'musicTracks');
      onSnapshot(
        tracksColl,
        (snapshot) => {
          const fetchedTracks: MusicTrack[] = [];

          for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            const trackUrl = data.url || '';

            if (trackUrl) {
              fetchedTracks.push({
                id: data.id || docSnap.id,
                name: data.name || 'Cloud Track',
                url: trackUrl,
                size: data.size || '',
                addedAt: data.addedAt || Date.now(),
              });
            }
          }

          if (fetchedTracks.length > 0) {
            const { tracks: cleanedFetched, hasMigrated } = this.migrateLegacyFreesoundTracks(fetchedTracks);
            // Merge with local playlist so locally added tracks are never prematurely wiped out
            const trackMap = new Map<string, MusicTrack>();
            for (const t of this.playlist) {
              if (t.url) trackMap.set(t.id, t);
            }
            for (const t of cleanedFetched) {
              if (t.url) trackMap.set(t.id, t);
            }
            const merged = Array.from(trackMap.values());
            merged.sort((a, b) => a.addedAt - b.addedAt);
            this.playlist = merged;
            this.savePlaylistToLocal();

            if (hasMigrated) {
              for (const t of cleanedFetched) {
                if (t.url && !t.url.includes('freesound.org')) {
                  this.saveTrackToFirestore(t).catch(() => {});
                }
              }
            }
          }

          // If custom tracks exist, default mode to custom
          if (this.playlist.length > 0) {
            const savedModeChoice = localStorage.getItem('hu_tao_ambient_music_mode');
            if (!savedModeChoice || savedModeChoice === 'custom') {
              this.mode = 'custom';
            }
          }

          if (this.isPlaying && this.mode === 'custom') {
            if (!this.customAudioElement || this.customAudioElement.paused || !this.currentAudioSrc) {
              this.playCurrentTrack(false);
            }
          }
          this.notifyListeners();
        },
        (error) => {
          console.info('Firestore music snapshot notice:', error.message);
        }
      );

      // Listen to music config for volume & mode (without overriding active local track position)
      const configDoc = doc(db, 'appData', 'musicConfig');
      onSnapshot(
        configDoc,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            let modeChanged = false;

            if (data.mode === 'synth' || data.mode === 'custom') {
              const savedModeChoice = localStorage.getItem('hu_tao_ambient_music_mode');
              const targetMode =
                this.playlist.length > 0 && savedModeChoice !== 'synth' ? 'custom' : data.mode;
              if (this.mode !== targetMode) {
                this.mode = targetMode;
                modeChanged = true;
              }
            }

            if (typeof data.volume === 'number') {
              this.volume = Math.max(0, Math.min(1, data.volume));
              if (this.customAudioElement) {
                this.customAudioElement.volume = this.volume;
              }
            }

            if (modeChanged && this.isPlaying) {
              this.stopCurrentEngine();
              this.startCurrentEngine();
            }

            this.notifyListeners();
          } else if (!this.hasAttemptedConfigSeed && !isFirestoreQuotaExceeded()) {
            // Seed initial music config to Firestore once if not quota exhausted
            this.hasAttemptedConfigSeed = true;
            setDoc(configDoc, { mode: this.mode, volume: this.volume }, { merge: true }).catch((err) => {
              if (isQuotaError(err)) markFirestoreQuotaExceeded();
            });
          }
        },
        (error) => {
          if (isQuotaError(error)) markFirestoreQuotaExceeded();
          console.info('Firestore music config notice:', error.message);
        }
      );
    } catch (e) {
      console.warn('Firestore music sync initialization skipped:', e);
    }
  }

  private hasAttemptedConfigSeed: boolean = false;
  private configSyncTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingMusicConfig: Record<string, unknown> = {};

  private syncMusicConfigToFirestore(partialConfig: Record<string, unknown>) {
    if (isFirestoreQuotaExceeded()) return;
    this.pendingMusicConfig = { ...this.pendingMusicConfig, ...partialConfig };
    if (this.configSyncTimer) clearTimeout(this.configSyncTimer);
    this.configSyncTimer = setTimeout(() => {
      try {
        if (isFirestoreQuotaExceeded()) return;
        if (Object.keys(this.pendingMusicConfig).length === 0) return;
        const configToSync = { ...this.pendingMusicConfig };
        this.pendingMusicConfig = {};
        const configDoc = doc(db, 'appData', 'musicConfig');
        setDoc(configDoc, configToSync, { merge: true }).catch((err) => {
          if (isQuotaError(err)) markFirestoreQuotaExceeded();
          console.info('Music config sync notice:', err);
        });
      } catch (e) {}
    }, 1000);
  }

  private async uploadTrackToStorage(track: MusicTrack): Promise<string> {
    if (!track.url || track.url.startsWith('http://') || track.url.startsWith('https://')) {
      return track.url;
    }
    const fileRef = ref(storage, 'musicTracks/' + track.id);
    await uploadString(fileRef, track.url, 'data_url');
    return await getDownloadURL(fileRef);
  }

  private async saveTrackToFirestore(track: MusicTrack) {
    try {
      let downloadUrl = track.url;

      // If uploaded as a base64 data URL, upload to Firebase Storage
      if (track.url && track.url.startsWith('data:')) {
        try {
          downloadUrl = await this.uploadTrackToStorage(track);

          // Update the local playlist entry to the short Storage URL
          track.url = downloadUrl;
          const match = this.playlist.find((t) => t.id === track.id);
          if (match) {
            match.url = downloadUrl;
          }
          await this.savePlaylistToLocal();
          this.notifyListeners();
        } catch (storageErr) {
          console.warn('Firebase Storage upload notice (local playback remains active):', storageErr);
        }
      }

      // Save only {id, name, url, size, addedAt} to Firestore if quota not exceeded
      if (!isFirestoreQuotaExceeded()) {
        const trackRef = doc(db, 'musicTracks', track.id);
        await setDoc(trackRef, {
          id: track.id,
          name: track.name,
          url: downloadUrl,
          size: track.size || '',
          addedAt: track.addedAt,
        });

        // Update config
        this.syncMusicConfigToFirestore({ mode: this.mode, volume: this.volume });
      }
    } catch (err) {
      if (isQuotaError(err)) markFirestoreQuotaExceeded();
      console.warn('Failed to save track to Firestore (local playback active):', err);
    }
  }

  private async deleteTrackFromFirestore(trackId: string) {
    try {
      // 1. Delete Storage object via deleteObject()
      try {
        const fileRef = ref(storage, 'musicTracks/' + trackId);
        await deleteObject(fileRef);
      } catch (e) {
        // Ignore if storage object doesn't exist
      }

      // 2. Delete Firestore document if quota not exceeded
      if (!isFirestoreQuotaExceeded()) {
        const trackRef = doc(db, 'musicTracks', trackId);
        await deleteDoc(trackRef);
      }
    } catch (err) {
      if (isQuotaError(err)) markFirestoreQuotaExceeded();
      console.warn('Failed to delete track from Firestore:', err);
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.isPlaying));
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsAudioBlocked(): boolean {
    return this.isAudioBlocked;
  }

  public getMode(): 'synth' | 'custom' {
    return this.mode;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getPlaylist(): MusicTrack[] {
    return this.playlist;
  }

  public getCurrentTrackIndex(): number {
    return this.currentTrackIndex;
  }

  public getCurrentTrack(): MusicTrack | null {
    if (this.playlist.length === 0) return null;
    return this.playlist[this.currentTrackIndex % this.playlist.length] || null;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('hu_tao_ambient_music_volume', this.volume.toString());
    } catch (e) {}
    if (this.customAudioElement) {
      this.customAudioElement.volume = this.volume;
    }
    if (this.masterSynthGain && this.synthCtx) {
      this.masterSynthGain.gain.setValueAtTime(this.volume, this.synthCtx.currentTime);
    }
    // Sync to Firestore debounced
    this.syncMusicConfigToFirestore({ volume: this.volume });
  }

  public setMode(mode: 'synth' | 'custom') {
    this.mode = mode;
    try {
      localStorage.setItem('hu_tao_ambient_music_mode', mode);
    } catch (e) {}

    if (this.isPlaying) {
      this.stopCurrentEngine();
      this.startCurrentEngine();
    }
    this.notifyListeners();

    // Sync to Firestore debounced
    this.syncMusicConfigToFirestore({ mode: this.mode });
  }

  public async addTrack(name: string, url: string, size?: string): Promise<MusicTrack> {
    // 15MB upload size guard
    if (size && size.toLowerCase().includes('mb')) {
      const numMb = parseFloat(size);
      if (!isNaN(numMb) && numMb > 15) {
        throw new Error('Audio file exceeds the 15MB limit. Please choose a smaller track.');
      }
    }
    if (url.startsWith('data:') && url.length > 15 * 1024 * 1024 * 1.4) {
      throw new Error('Audio file exceeds the 15MB limit. Please choose a smaller track.');
    }

    const newTrack: MusicTrack = {
      id: 'track_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: name || `Track ${this.playlist.length + 1}`,
      url,
      size,
      addedAt: Date.now(),
    };

    // 1. Instantly update local playlist and set custom mode
    this.playlist.push(newTrack);
    this.mode = 'custom';
    this.currentTrackIndex = this.playlist.length - 1;

    try {
      localStorage.setItem('hu_tao_ambient_music_mode', 'custom');
    } catch (e) {}

    // Save to local storage asynchronously
    this.savePlaylistToLocal();

    // Sync mode to Cloud Firestore
    this.syncMusicConfigToFirestore({
      mode: 'custom',
      volume: this.volume,
    });

    // 2. Play newly added track immediately
    if (this.isPlaying) {
      this.playCurrentTrack(true);
    } else {
      this.start();
    }

    this.notifyListeners();

    // 3. Save track to Firebase Storage and Firestore in background (non-blocking)
    this.saveTrackToFirestore(newTrack).catch((err) => {
      console.warn('Background Firebase save notice:', err);
    });

    return newTrack;
  }

  public async removeTrack(id: string): Promise<void> {
    const index = this.playlist.findIndex((t) => t.id === id);
    if (index === -1) return;

    this.playlist.splice(index, 1);
    if (this.currentTrackIndex >= this.playlist.length) {
      this.currentTrackIndex = Math.max(0, this.playlist.length - 1);
    }

    await this.savePlaylistToLocal();
    await this.deleteTrackFromFirestore(id);

    if (this.isPlaying && this.mode === 'custom') {
      this.playCurrentTrack(true);
    }
    this.notifyListeners();
  }

  public async clearAllCustomTracks(): Promise<void> {
    const tracksToDelete = [...this.playlist];
    this.playlist = [];
    this.currentTrackIndex = 0;

    await removeIDBItem('hu_tao_music_playlist');
    await removeIDBItem('hu_tao_ambient_music_custom_url');
    try {
      localStorage.removeItem('hu_tao_ambient_music_custom_url');
    } catch (e) {}

    for (const track of tracksToDelete) {
      await this.deleteTrackFromFirestore(track.id);
    }

    if (this.isPlaying && this.mode === 'custom') {
      this.playCurrentTrack(true);
    }
    this.notifyListeners();
  }

  private async savePlaylistToLocal() {
    try {
      await setIDBItem('hu_tao_music_playlist', JSON.stringify(this.playlist));
    } catch (err) {
      console.warn('Failed to save playlist to IDB:', err);
    }
  }

  public playTrackAtIndex(index: number) {
    if (this.playlist.length === 0) return;
    this.currentTrackIndex = (index + this.playlist.length) % this.playlist.length;
    this.mode = 'custom';
    try {
      localStorage.setItem('hu_tao_ambient_music_mode', 'custom');
    } catch (e) {}

    if (this.isPlaying) {
      this.playCurrentTrack(true);
    } else {
      this.start();
    }
    this.notifyListeners();
  }

  public advanceToNextTrack(fromSessionId?: number) {
    // If called with a specific session ID, reject if it does not match the active session to prevent double-advancing
    if (fromSessionId !== undefined && fromSessionId !== this.trackSessionCounter) {
      return;
    }

    if (this.isTransitioningTrack) return;
    this.isTransitioningTrack = true;

    if (this.playlist.length === 0) {
      // Loop default ambient audio
      if (this.isPlaying && this.mode === 'custom') {
        this.playCurrentTrack(true);
      }
      setTimeout(() => {
        this.isTransitioningTrack = false;
      }, 300);
      return;
    }

    // Always advance to the NEXT sequential track (e.g. track 0 -> track 1 -> track 2)
    const nextIdx = (this.currentTrackIndex + 1) % this.playlist.length;
    this.currentTrackIndex = nextIdx;

    if (this.isPlaying && this.mode === 'custom') {
      this.playCurrentTrack(true);
    }
    this.notifyListeners();

    setTimeout(() => {
      this.isTransitioningTrack = false;
    }, 350);
  }

  public nextTrack() {
    this.advanceToNextTrack();
  }

  public prevTrack() {
    this.previousTrack();
  }

  public previousTrack() {
    if (this.playlist.length === 0) return;
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
    if (this.isPlaying && this.mode === 'custom') {
      this.playCurrentTrack(true);
    }
    this.notifyListeners();
  }

  public async loadDefaultPresetTracks(): Promise<void> {
    for (const track of DEFAULT_ORIENTAL_TRACKS) {
      const existingIdx = this.playlist.findIndex(
        (p) => p.id === track.id || p.name === track.name || (p.url && p.url.includes('freesound.org'))
      );
      if (existingIdx !== -1) {
        this.playlist[existingIdx] = { ...track };
        await this.saveTrackToFirestore(track);
      } else if (!this.playlist.some((p) => p.url === track.url)) {
        await this.addTrack(track.name, track.url, track.size);
      }
    }
    await this.savePlaylistToLocal();
    this.mode = 'custom';
    try {
      localStorage.setItem('hu_tao_ambient_music_mode', 'custom');
    } catch (e) {}
    if (!this.isPlaying) {
      this.start();
    } else {
      this.playCurrentTrack(true);
    }
    this.notifyListeners();
  }

  private ensureAudioElement(): HTMLAudioElement {
    if (!this.customAudioElement) {
      this.customAudioElement = new Audio();
      this.customAudioElement.loop = false;
      this.customAudioElement.preload = 'auto';
    }

    this.customAudioElement.loop = false;
    this.customAudioElement.volume = this.volume;
    return this.customAudioElement;
  }

  private playCurrentTrack(forceRestart: boolean = false) {
    this.clearSynthAudio();

    const track = this.getCurrentTrack();
    const audioSrc = track ? track.url : DEFAULT_AMBIENT_URL;

    const audioEl = this.ensureAudioElement();

    if (!this.isPlaying || this.mode !== 'custom') return;

    // Increment session counter so any late events from previous song are completely discarded
    const currentSession = ++this.trackSessionCounter;
    this.isTransitioningTrack = false;

    // Enforce no-looping and proper volume
    audioEl.loop = false;
    audioEl.volume = this.volume;

    const onTrackFinished = () => {
      if (this.isPlaying && this.mode === 'custom' && this.trackSessionCounter === currentSession) {
        this.advanceToNextTrack(currentSession);
      }
    };

    // 1. Natural onended event
    audioEl.onended = () => {
      onTrackFinished();
    };

    // 2. High precision timeupdate fallback (catches data URLs or streaming tracks that stop at the end)
    audioEl.ontimeupdate = () => {
      if (
        this.isPlaying &&
        this.mode === 'custom' &&
        this.trackSessionCounter === currentSession &&
        !this.isTransitioningTrack &&
        audioEl.duration > 0 &&
        !isNaN(audioEl.duration) &&
        audioEl.currentTime >= audioEl.duration - 0.25 &&
        !audioEl.paused
      ) {
        onTrackFinished();
      }
    };

    // 3. Error fallback
    audioEl.onerror = () => {
      console.warn('Audio element error on track index:', this.currentTrackIndex);
      if (this.trackSessionCounter !== currentSession) return;
      if (this.playlist.length > 1 && this.isPlaying && this.mode === 'custom') {
        setTimeout(() => {
          if (this.isPlaying && this.mode === 'custom' && this.trackSessionCounter === currentSession) {
            this.advanceToNextTrack(currentSession);
          }
        }, 300);
      } else if (this.isPlaying) {
        this.setMode('synth');
      }
    };

    const isNewSrc = this.currentAudioSrc !== audioSrc || !audioEl.src;
    if (isNewSrc || forceRestart) {
      this.currentAudioSrc = audioSrc;
      try {
        audioEl.src = audioSrc;
        audioEl.currentTime = 0;
        audioEl.load();
      } catch (e) {}
    } else if (audioEl.paused || audioEl.ended) {
      try {
        audioEl.currentTime = 0;
      } catch (e) {}
    }

    const playPromise = audioEl.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isAudioBlocked = false;
          if (this.removeGestureListeners) this.removeGestureListeners();
          this.notifyListeners();
        })
        .catch((err) => {
          console.warn('Audio playback notice:', err);
          if (err.name === 'NotAllowedError') {
            this.isAudioBlocked = true;
            this.setupGestureListeners();
          }
          this.notifyListeners();
        });
    }
  }

  // Multi-Voice Oriental Soundtrack Synthesizer Engine (Xiao Flute, Guzheng, Singing Bowl & Bells)
  private masterSynthGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;

  private initSynthContext() {
    if (!this.synthCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.synthCtx = new AudioContextClass();
      }
    }
    if (this.synthCtx && !this.masterSynthGain) {
      this.masterSynthGain = this.synthCtx.createGain();
      this.masterSynthGain.gain.setValueAtTime(this.volume, this.synthCtx.currentTime);
      this.masterSynthGain.connect(this.synthCtx.destination);
    }
  }

  private startSingingBowlDrone() {
    if (!this.synthCtx || !this.masterSynthGain) return;
    if (this.droneOsc1) return; // Already running

    try {
      const now = this.synthCtx.currentTime;
      this.droneGain = this.synthCtx.createGain();
      this.droneGain.gain.setValueAtTime(0, now);
      this.droneGain.gain.linearRampToValueAtTime(0.08, now + 2.0);

      // Low soothing D2 / A2 fundamental frequencies
      this.droneOsc1 = this.synthCtx.createOscillator();
      this.droneOsc1.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(146.83, now); // D3

      this.droneOsc2 = this.synthCtx.createOscillator();
      this.droneOsc2.type = 'triangle';
      this.droneOsc2.frequency.setValueAtTime(220.00, now); // A3

      const droneFilter = this.synthCtx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(350, now);

      this.droneOsc1.connect(droneFilter);
      this.droneOsc2.connect(droneFilter);
      droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.masterSynthGain);

      this.droneOsc1.start(now);
      this.droneOsc2.start(now);
    } catch (e) {
      console.warn('Drone start notice:', e);
    }
  }

  private stopSingingBowlDrone() {
    if (this.droneGain && this.synthCtx) {
      try {
        const now = this.synthCtx.currentTime;
        this.droneGain.gain.linearRampToValueAtTime(0.0001, now + 0.5);
        setTimeout(() => {
          if (this.droneOsc1) {
            try { this.droneOsc1.stop(); this.droneOsc1.disconnect(); } catch (e) {}
            this.droneOsc1 = null;
          }
          if (this.droneOsc2) {
            try { this.droneOsc2.stop(); this.droneOsc2.disconnect(); } catch (e) {}
            this.droneOsc2 = null;
          }
        }, 550);
      } catch (e) {}
    }
  }

  private playSynthMelody() {
    if (!this.isPlaying || this.mode !== 'synth') return;

    this.initSynthContext();
    if (!this.synthCtx || !this.masterSynthGain) return;

    if (this.synthCtx.state === 'suspended') {
      this.synthCtx
        .resume()
        .then(() => {
          this.isAudioBlocked = false;
          this.startSingingBowlDrone();
        })
        .catch(() => {
          this.isAudioBlocked = true;
          this.setupGestureListeners();
        });
    } else {
      this.startSingingBowlDrone();
    }

    if (this.masterSynthGain) {
      this.masterSynthGain.gain.setValueAtTime(this.volume, this.synthCtx.currentTime);
    }

    // Chinese D-Minor Pentatonic Scales (D, F, G, A, C across octaves)
    const fluteNotes = [
      293.66, // D4
      349.23, // F4
      392.00, // G4
      440.00, // A4
      523.25, // C5
      587.33, // D5
      698.46, // F5
      783.99, // G5
      880.00, // A5
      1046.50 // C6
    ];

    const guzhengNotes = [
      146.83, // D3
      174.61, // F3
      196.00, // G3
      220.00, // A3
      261.63, // C4
      293.66, // D4
      349.23, // F4
      392.00, // G4
      440.00, // A4
      523.25, // C5
    ];

    const now = this.synthCtx.currentTime;
    const voiceType = Math.random();

    if (voiceType < 0.45) {
      // Voice 1: Expressive Bamboo Flute (Xiao) with Vibrato
      const note = fluteNotes[Math.floor(Math.random() * fluteNotes.length)];
      const osc = this.synthCtx.createOscillator();
      const gain = this.synthCtx.createGain();
      const filter = this.synthCtx.createBiquadFilter();

      // Vibrato LFO
      const lfo = this.synthCtx.createOscillator();
      const lfoGain = this.synthCtx.createGain();
      lfo.frequency.setValueAtTime(5.0, now); // 5Hz vibrato
      lfoGain.gain.setValueAtTime(4.5, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now + 0.2);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(3.0, now);

      const duration = 1.2 + Math.random() * 1.4;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterSynthGain);

      osc.start(now);
      osc.stop(now + duration);
      lfo.stop(now + duration);
    } else if (voiceType < 0.85) {
      // Voice 2: Plucked Guzheng / Pipa Arpeggio
      const note = guzhengNotes[Math.floor(Math.random() * guzhengNotes.length)];
      const osc1 = this.synthCtx.createOscillator();
      const osc2 = this.synthCtx.createOscillator();
      const gain = this.synthCtx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(note, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(note * 2, now); // Harmonics

      const duration = 0.9 + Math.random() * 0.8;
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterSynthGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    } else {
      // Voice 3: Ethereal Temple Bell / Wind Chime
      const note = fluteNotes[fluteNotes.length - 1 - Math.floor(Math.random() * 4)];
      const osc = this.synthCtx.createOscillator();
      const gain = this.synthCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note * 1.5, now);

      const duration = 2.0;
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterSynthGain);

      osc.start(now);
      osc.stop(now + duration);
    }

    const nextNoteDelay = 550 + Math.random() * 850;
    this.synthTimer = setTimeout(() => {
      if (this.isPlaying && this.mode === 'synth') {
        this.playSynthMelody();
      }
    }, nextNoteDelay);
  }

  private clearSynthAudio() {
    if (this.synthTimer) {
      clearTimeout(this.synthTimer);
      this.synthTimer = null;
    }
    this.stopSingingBowlDrone();
  }

  private stopCurrentEngine() {
    if (this.customAudioElement) {
      this.customAudioElement.pause();
      this.customAudioElement.currentTime = 0;
    }
    this.clearSynthAudio();
  }

  private startCurrentEngine() {
    if (this.mode === 'synth') {
      this.playSynthMelody();
    } else {
      this.playCurrentTrack();
    }
  }

  public start() {
    try {
      this.isPlaying = true;
      try {
        localStorage.setItem('hu_tao_ambient_music_enabled', 'true');
      } catch (e) {}
      this.notifyListeners();

      this.setupGestureListeners();
      this.startCurrentEngine();
    } catch (e) {
      console.warn('Failed to start ambient music:', e);
    }
  }

  public stop() {
    this.isPlaying = false;
    try {
      localStorage.setItem('hu_tao_ambient_music_enabled', 'false');
    } catch (e) {}
    this.notifyListeners();

    this.stopCurrentEngine();
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    return this.isPlaying;
  }
}

export const ambientMusic = new AmbientMusicEngine();


