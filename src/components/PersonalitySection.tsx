import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Zap,
  BookOpen,
  Heart,
  Ghost,
  Flame,
  Crown,
  Star,
  Shield,
  Flower2,
  Feather,
  Gem,
  Moon,
  Wand2,
  Music,
  Quote as QuoteIcon,
  RotateCw,
  Volume2,
  Square,
} from 'lucide-react';
import { PersonalityTrait } from '../types';
import { playGhostGiggle, playChime, playFlameWhoosh } from '../utils/audio';
import { useAppData } from '../context/AppDataContext';
import { SectionHeader } from './SectionHeader';
import { fetchPersonalityAudioFromCloud } from '../utils/personalityAudioStorage';

export const PersonalitySection: React.FC = () => {
  const { personalityTraits, sectionHeaders } = useAppData();
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [playingTraitId, setPlayingTraitId] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const iconMap: Record<string, React.ElementType> = {
    Sparkles,
    Zap,
    BookOpen,
    Heart,
    Ghost,
    Flame,
    Crown,
    Star,
    Shield,
    Flower2,
    Feather,
    Gem,
    Moon,
    Wand2,
    Music,
  };

  const userStoppedRef = useRef(false);

  const stopCurrentAudio = (isUserAction = true) => {
    if (isUserAction) {
      userStoppedRef.current = true;
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setPlayingTraitId(null);
  };

  const playVoiceAtIndex = async (index: number) => {
    if (index < 0 || index >= personalityTraits.length) {
      setPlayingTraitId(null);
      return;
    }

    stopCurrentAudio(false);
    userStoppedRef.current = false;

    const trait = personalityTraits[index];
    setPlayingTraitId(trait.id);

    let activeAudioUrl = trait.audioUrl;
    if (activeAudioUrl === '[FIREBASE_AUDIO]' || (!activeAudioUrl && trait.id)) {
      try {
        const cloudAudio = await fetchPersonalityAudioFromCloud(trait.id);
        if (cloudAudio) {
          activeAudioUrl = cloudAudio;
        }
      } catch (err) {
        console.warn('Error fetching personality audio from cloud:', err);
      }
    }

    if (activeAudioUrl && activeAudioUrl !== '[FIREBASE_AUDIO]') {
      const audio = new Audio(activeAudioUrl);
      currentAudioRef.current = audio;

      audio.onended = () => {
        currentAudioRef.current = null;
        setPlayingTraitId(null);
      };

      audio.onerror = () => {
        console.warn('Audio play failed, falling back to speech synthesis');
        speakFallbackAtIndex(index);
      };

      audio.play().catch((err) => {
        console.warn('Audio playback error', err);
        speakFallbackAtIndex(index);
      });
    } else {
      speakFallbackAtIndex(index);
    }
  };

  const speakFallbackAtIndex = (index: number) => {
    const trait = personalityTraits[index];
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const textToSpeak = trait.quote || trait.description;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.pitch = 1.35;
      utterance.rate = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          v.lang.startsWith('ja') ||
          v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('zira') ||
          v.name.toLowerCase().includes('samantha')
      );
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onend = () => {
        setPlayingTraitId(null);
      };
      utterance.onerror = () => {
        setPlayingTraitId(null);
      };

      setPlayingTraitId(trait.id);
      window.speechSynthesis.speak(utterance);
    } else {
      if (trait.id === 'playful') playGhostGiggle();
      else if (trait.id === 'energetic') playFlameWhoosh();
      else playChime();

      setTimeout(() => {
        setPlayingTraitId(null);
      }, 1500);
    }
  };

  const handlePlayVoice = (e: React.MouseEvent, trait: PersonalityTrait) => {
    e.stopPropagation();

    if (playingTraitId === trait.id) {
      stopCurrentAudio(true);
      return;
    }

    userStoppedRef.current = false;
    const index = personalityTraits.findIndex((t) => t.id === trait.id);
    if (index !== -1) {
      playVoiceAtIndex(index);
    }
  };

  const handleCardClick = (trait: PersonalityTrait) => {
    setFlippedCards((prev) => ({
      ...prev,
      [trait.id]: !prev[trait.id],
    }));

    if (trait.id === 'playful') playGhostGiggle();
    else if (trait.id === 'energetic') playFlameWhoosh();
    else playChime();
  };

  return (
    <section id="personality" className="relative py-24 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          badge={sectionHeaders.personality.badge}
          chineseSymbol={sectionHeaders.personality.chineseSymbol}
          titlePrefix={sectionHeaders.personality.titlePrefix}
          titleHighlight={sectionHeaders.personality.titleHighlight}
          subtitle={sectionHeaders.personality.subtitle}
        />

        {/* 4 Flip Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {personalityTraits.map((trait, index) => {
            const Icon = iconMap[trait.iconName] || Sparkles;
            const isFlipped = !!flippedCards[trait.id];
            const isPlaying = playingTraitId === trait.id;

            return (
              <motion.div
                key={trait.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                onClick={() => handleCardClick(trait)}
                className="h-[330px] sm:h-[360px] perspective-1000 cursor-pointer group"
              >
                <div
                  className={`relative w-full h-full transition-transform duration-700 ${
                    isFlipped ? '[transform:rotateY(180deg)]' : ''
                  }`}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* FRONT SIDE */}
                  <div
                    className="absolute inset-0 w-full h-full glass-card glass-card-hover rounded-2xl sm:rounded-3xl p-3 sm:p-6 border border-red-500/30 flex flex-col justify-between overflow-hidden"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    {/* Top Gradient Bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${trait.color}`} />

                    <div>
                      {/* Icon & Voice Badge */}
                      <div className="flex items-center justify-between gap-1 mb-2 sm:mb-3">
                        <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-gradient-to-tr ${trait.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform shrink-0 p-1.5 sm:p-2 overflow-hidden`}>
                          {trait.customIconUrl ? (
                            <img
                              src={trait.customIconUrl}
                              alt={trait.title}
                              className="w-full h-full object-contain filter drop-shadow"
                            />
                          ) : (
                            <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
                          )}
                        </div>

                        {/* Play Voice Button */}
                        <button
                          type="button"
                          onClick={(e) => handlePlayVoice(e, trait)}
                          className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-all shadow-md cursor-pointer shrink-0 z-10 ${
                            isPlaying
                              ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.8)] animate-pulse'
                              : 'bg-red-950/80 hover:bg-red-800 text-amber-300 border border-amber-500/40'
                          }`}
                          title={isPlaying ? 'Stop Audio' : 'Play Voice Line'}
                        >
                          {isPlaying ? (
                            <>
                              <Square className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                              <span className="hidden xs:inline sm:inline">Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              <span>{trait.audioUrl ? 'Voice' : 'Listen'}</span>
                            </>
                          )}
                        </button>
                      </div>

                      <h3 className="font-display font-bold text-xs sm:text-xl text-white mb-0.5 group-hover:text-amber-200 transition-colors line-clamp-1">
                        {trait.title}
                      </h3>
                      <p className="text-[9px] sm:text-xs font-semibold text-amber-400/90 mb-2 sm:mb-3 tracking-wide uppercase line-clamp-1 flex items-center gap-1">
                        <span className="truncate">{trait.subtitle}</span>
                      </p>

                      <p className="text-rose-100/80 text-[11px] sm:text-sm leading-tight sm:leading-relaxed line-clamp-4 sm:line-clamp-4">
                        {trait.description}
                      </p>
                    </div>

                    {/* Bottom Prompt */}
                    <div className="pt-2 sm:pt-3 border-t border-red-500/20 flex items-center justify-between text-[10px] sm:text-xs text-amber-300/80">
                      <span className="flex items-center gap-1 font-semibold">
                        <RotateCw className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
                        Flip card
                      </span>
                      <Ghost className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                    </div>
                  </div>

                  {/* BACK SIDE */}
                  <div
                    className="absolute inset-0 w-full h-full bg-gradient-to-br from-red-950 via-[#200a0e] to-amber-950 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border-2 border-amber-400/80 shadow-2xl flex flex-col justify-between"
                    style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                      <span className="text-[10px] sm:text-xs font-display font-bold text-amber-300 flex items-center gap-1 uppercase tracking-wider">
                        <QuoteIcon className="w-3 h-3 text-amber-400" /> Voice
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-950 border border-amber-400/50 text-amber-200 truncate max-w-[80px] sm:max-w-none">
                        {trait.subtitle}
                      </span>
                    </div>

                    {/* Quote Content */}
                    <div className="my-auto text-center px-0.5 space-y-1.5">
                      <p className="font-display font-bold text-xs sm:text-base text-amber-200 leading-snug italic line-clamp-5">
                        &quot;{trait.quote}&quot;
                      </p>
                    </div>

                    {/* Voice Player & Flip Back Footer */}
                    <div className="pt-2 sm:pt-3 border-t border-amber-500/30 space-y-1.5">
                      <button
                        type="button"
                        onClick={(e) => handlePlayVoice(e, trait)}
                        className={`w-full py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isPlaying
                            ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                            : 'bg-red-950/90 hover:bg-red-800 text-amber-300 border border-amber-400/50'
                        }`}
                      >
                        {isPlaying ? (
                          <>
                            <Square className="w-3 h-3 fill-current" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>Listen Voice</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-amber-300/80 pt-0.5">
                        <span className="flex items-center gap-1">
                          <RotateCw className="w-3 h-3" /> Flip back
                        </span>
                        <Ghost className="w-3 h-3 text-amber-300 animate-bounce" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};


