import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  Music,
  Radio,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Disc3,
  Sliders,
  Flame,
} from 'lucide-react';
import { ambientMusic, MusicTrack } from '../utils/ambientMusic';

interface FloatingMusicPlayerProps {
  onOpenAdmin?: () => void;
}

export const FloatingMusicPlayer: React.FC<FloatingMusicPlayerProps> = ({ onOpenAdmin }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(ambientMusic.getIsPlaying());
  const [isAudioBlocked, setIsAudioBlocked] = useState<boolean>(ambientMusic.getIsAudioBlocked());
  const [mode, setMode] = useState<'synth' | 'custom'>(ambientMusic.getMode());
  const [volume, setVolumeState] = useState<number>(ambientMusic.getVolume());
  const [playlist, setPlaylist] = useState<MusicTrack[]>(ambientMusic.getPlaylist());
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(ambientMusic.getCurrentTrack());
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [prevVolume, setPrevVolume] = useState<number>(0.35);

  useEffect(() => {
    const handleUpdate = () => {
      setIsPlaying(ambientMusic.getIsPlaying());
      setIsAudioBlocked(ambientMusic.getIsAudioBlocked());
      setMode(ambientMusic.getMode());
      setVolumeState(ambientMusic.getVolume());
      setPlaylist(ambientMusic.getPlaylist());
      setCurrentTrack(ambientMusic.getCurrentTrack());
    };

    const unsubscribe = ambientMusic.subscribe(handleUpdate);
    return () => unsubscribe();
  }, []);

  const handleTogglePlay = () => {
    ambientMusic.toggle();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolumeState(newVol);
    ambientMusic.setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleToggleMute = () => {
    if (isMuted || volume === 0) {
      const restoreVol = prevVolume > 0 ? prevVolume : 0.35;
      setIsMuted(false);
      setVolumeState(restoreVol);
      ambientMusic.setVolume(restoreVol);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      setVolumeState(0);
      ambientMusic.setVolume(0);
    }
  };

  const handleNextTrack = () => {
    ambientMusic.nextTrack();
  };

  const handlePrevTrack = () => {
    ambientMusic.prevTrack();
  };

  const handleSwitchMode = (newMode: 'synth' | 'custom') => {
    ambientMusic.setMode(newMode);
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 select-none">
      <AnimatePresence>
        {/* Expanded Soundtrack Studio Panel */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-3 w-80 sm:w-96 rounded-2xl glass-card border-2 border-amber-500/50 shadow-[0_15px_45px_rgba(0,0,0,0.85)] p-4 bg-[#180a0c]/95 backdrop-blur-xl text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-red-500/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-red-950/80 border border-red-500/40 text-amber-300">
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-xs sm:text-sm text-amber-200">
                    Hu Tao Ambient Soundtrack
                  </h4>
                  <p className="text-[10px] text-rose-200/60">
                    {mode === 'synth' ? 'Live Oriental Synthesizer' : 'Soundtrack Playlist'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-1.5 rounded-full text-rose-200/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Collapse Player"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/50 rounded-xl my-3 border border-red-500/20">
              <button
                type="button"
                onClick={() => handleSwitchMode('synth')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'synth'
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                    : 'text-rose-200/70 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Oriental Flute</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchMode('custom')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'custom'
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                    : 'text-rose-200/70 hover:text-white'
                }`}
              >
                <Radio className="w-3 h-3 text-amber-300" />
                <span>Custom Playlist</span>
              </button>
            </div>

            {/* Now Playing Banner */}
            <div className="p-3 rounded-xl bg-black/60 border border-amber-500/30 flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div
                  className={`p-2 rounded-full shrink-0 ${
                    isPlaying
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-400/40 animate-spin [animation-duration:6s]'
                      : 'bg-red-950 text-rose-300'
                  }`}
                >
                  <Disc3 className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-display font-bold text-xs text-white truncate">
                    {mode === 'synth'
                      ? 'Wangsheng Bamboo Flute & Guzheng'
                      : currentTrack
                      ? currentTrack.name
                      : 'No Tracks in Playlist'}
                  </p>
                  <p className="text-[10px] text-amber-400/80 truncate">
                    {isAudioBlocked
                      ? 'Click anywhere to unlock browser audio'
                      : isPlaying
                      ? mode === 'synth'
                        ? 'Continuous Polyphonic Melody'
                        : 'Auto-advancing'
                      : 'Paused'}
                  </p>
                </div>
              </div>

              {/* Animated Waveform Indicator */}
              {isPlaying && (
                <div className="flex items-end gap-0.5 h-4 shrink-0">
                  <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:0ms] h-3" />
                  <span className="w-1 bg-amber-300 rounded-full animate-bounce [animation-delay:150ms] h-4" />
                  <span className="w-1 bg-red-400 rounded-full animate-bounce [animation-delay:300ms] h-2.5" />
                  <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:450ms] h-3.5" />
                </div>
              )}
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-4 my-2">
              {mode === 'custom' && playlist.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevTrack}
                  className="p-2 rounded-full bg-black/60 text-amber-300 hover:text-white hover:bg-amber-900/60 transition-all cursor-pointer border border-amber-500/30 active:scale-95"
                  title="Previous Song"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={handleTogglePlay}
                className="p-3 rounded-full bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white font-bold shadow-[0_0_20px_rgba(247,127,0,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title={isPlaying ? 'Pause Music' : 'Play Soundtrack'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              {mode === 'custom' && playlist.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextTrack}
                  className="p-2 rounded-full bg-black/60 text-amber-300 hover:text-white hover:bg-amber-900/60 transition-all cursor-pointer border border-amber-500/30 active:scale-95"
                  title="Next Song"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Volume Slider */}
            <div className="flex items-center gap-2 pt-2 mt-2 border-t border-red-500/20">
              <button
                type="button"
                onClick={handleToggleMute}
                className="text-amber-300 hover:text-white transition-colors cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full accent-amber-400 h-1.5 bg-black/60 rounded-lg cursor-pointer"
                title={`Volume: ${Math.round(volume * 100)}%`}
              />
              <span className="text-[10px] font-mono text-amber-300/80 w-8 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>

            {/* Preset Load & Upload helper */}
            <div className="mt-3 pt-2 border-t border-red-500/20 flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={async () => {
                  await ambientMusic.loadDefaultPresetTracks();
                }}
                className="text-amber-400 hover:text-amber-200 underline underline-offset-2 cursor-pointer font-semibold"
              >
                + Load 3 Preset Tracks
              </button>

              {onOpenAdmin && (
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="text-rose-300 hover:text-white flex items-center gap-1 cursor-pointer font-semibold"
                >
                  <Sliders className="w-3 h-3" />
                  <span>Admin Music Hub</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed Compact Floating Bar */}
      <div className="flex items-center gap-2">
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-full border shadow-[0_10px_30px_rgba(0,0,0,0.85)] cursor-pointer transition-all duration-300 backdrop-blur-xl ${
            isPlaying
              ? 'bg-[#1e0a0c]/90 border-amber-400/60 shadow-[0_0_20px_rgba(247,127,0,0.35)]'
              : 'bg-[#140708]/90 border-red-500/30 hover:border-amber-500/40'
          }`}
          onClick={handleTogglePlay}
        >
          {/* Play/Pause icon */}
          <div
            className={`p-1.5 rounded-full flex items-center justify-center transition-colors ${
              isPlaying
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white'
                : 'bg-red-950/80 text-rose-300 border border-red-500/30'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </div>

          {/* Track Name / Status */}
          <div className="flex flex-col text-left">
            <span className="font-display font-bold text-xs text-white max-w-[130px] sm:max-w-[180px] truncate flex items-center gap-1">
              {isPlaying && !isAudioBlocked && <Flame className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
              {mode === 'synth'
                ? 'Oriental Ambient'
                : currentTrack
                ? currentTrack.name
                : 'Custom Soundtrack'}
            </span>
            <span className={`text-[9px] font-semibold ${isAudioBlocked ? 'text-amber-400 animate-pulse font-bold' : 'text-amber-300/70'}`}>
              {isAudioBlocked
                ? 'Click anywhere to start music'
                : isPlaying
                ? 'Soundtrack Active'
                : 'Click to Play'}
            </span>
          </div>

          {/* Equalizer Wave / Mute Icon */}
          {isPlaying ? (
            <div className="flex items-end gap-0.5 h-3 pl-1">
              <span className="w-0.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0ms] h-2.5" />
              <span className="w-0.5 bg-amber-300 rounded-full animate-bounce [animation-delay:150ms] h-3.5" />
              <span className="w-0.5 bg-amber-400 rounded-full animate-bounce [animation-delay:300ms] h-2" />
            </div>
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-rose-400/60" />
          )}

          {/* Expand Settings Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded((prev) => !prev);
            }}
            className="p-1 rounded-full text-rose-200/70 hover:text-white hover:bg-white/10 transition-colors ml-1 border-l border-red-500/20 pl-1.5"
            title={isExpanded ? 'Hide Controls' : 'Soundtrack Settings'}
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </motion.div>
      </div>
    </div>
  );
};
