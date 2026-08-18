import React from 'react';
import { motion } from 'motion/react';
import { Flame, Ghost, Flower2, Sparkles } from 'lucide-react';

interface SectionHeaderProps {
  badge?: string;
  chineseSymbol?: string; // e.g. "蝶", "桃", "堂", "炎", "魂", "画", "趣", "诗"
  titlePrefix?: string;
  titleHighlight?: string;
  titleSuffix?: string;
  subtitle?: string;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  chineseSymbol = '蝶',
  titlePrefix,
  titleHighlight,
  titleSuffix,
  subtitle,
  className = '',
}) => {
  return (
    <div className={`text-center relative mb-12 sm:mb-16 select-none ${className}`}>
      {/* Background Calligraphy Watermark Symbol */}
      {chineseSymbol && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl sm:text-9xl font-serif text-red-500/10 pointer-events-none select-none blur-[1px] tracking-widest z-0">
          {chineseSymbol}
        </div>
      )}

      {/* Top Eyebrow Badge / Chinese Seal Stamp Tag */}
      {badge && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-950/90 via-amber-950/70 to-red-950/90 border border-amber-500/50 text-amber-300 text-xs font-semibold shadow-[0_0_20px_rgba(247,127,0,0.2)] mb-3.5 group hover:border-amber-400 transition-colors"
        >
          {/* Chinese Seal Accent */}
          {chineseSymbol && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-red-900 border border-amber-400/60 font-serif text-[10px] text-amber-200 font-bold shadow-sm">
              {chineseSymbol}
            </span>
          )}
          <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="font-display tracking-widest uppercase text-[11px] font-bold">{badge}</span>
          <Ghost className="w-3.5 h-3.5 text-rose-300/80 group-hover:rotate-12 transition-transform" />
        </motion.div>
      )}

      {/* Main Heading with Animated Flame Icons & Tak Brush-Stroke Calligraphy */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative z-10 font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap"
      >
        {/* Left Tak Flame */}
        <span className="inline-flex items-center text-amber-400 drop-shadow-[0_0_12px_rgba(247,127,0,0.9)] transform -scale-x-100">
          <Flame className="w-6 h-6 sm:w-8 sm:h-8 animate-bounce" style={{ animationDuration: '2.8s' }} />
        </span>

        {titlePrefix && <span className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{titlePrefix}</span>}

        {titleHighlight && (
          <span className="relative bg-gradient-to-r from-amber-300 via-amber-400 to-rose-400 bg-clip-text text-transparent italic font-serif px-1.5 drop-shadow-[0_2px_14px_rgba(220,38,38,0.6)]">
            {titleHighlight}
          </span>
        )}

        {titleSuffix && <span className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{titleSuffix}</span>}

        {/* Right Tak Flame */}
        <span className="inline-flex items-center text-amber-400 drop-shadow-[0_0_12px_rgba(247,127,0,0.9)]">
          <Flame className="w-6 h-6 sm:w-8 sm:h-8 animate-bounce" style={{ animationDuration: '2.3s' }} />
        </span>
      </motion.h2>

      {/* Tak Decorative Brush Stroke / Butterfly & Plum Blossom Accent */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="relative z-10 flex items-center justify-center gap-3 mt-4"
      >
        {/* Left Brush Taper Line */}
        <div className="h-[2px] w-14 sm:w-28 bg-gradient-to-r from-transparent via-amber-500/90 to-red-600 rounded-full shadow-[0_0_8px_#f59e0b]" />
        <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b]" />
        
        {/* Center Plum Blossom / Flame Emblem */}
        <div className="relative flex items-center justify-center">
          <Flower2 className="w-5 h-5 text-rose-400 transform rotate-45 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
          <Sparkles className="w-3 h-3 text-amber-300 absolute -top-1 -right-1 animate-ping [animation-duration:3s]" />
        </div>

        <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b]" />
        {/* Right Brush Taper Line */}
        <div className="h-[2px] w-14 sm:w-28 bg-gradient-to-l from-transparent via-amber-500/90 to-red-600 rounded-full shadow-[0_0_8px_#f59e0b]" />
      </motion.div>

      {/* Subtitle */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative z-10 text-rose-200/85 max-w-2xl mx-auto mt-4 text-sm sm:text-base leading-relaxed px-4 font-sans drop-shadow-sm"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};
