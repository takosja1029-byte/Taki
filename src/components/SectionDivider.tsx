import React from 'react';
import { motion } from 'motion/react';
import { Flame, Sparkles, Ghost } from 'lucide-react';

interface SectionDividerProps {
  variant?: 'talisman' | 'flame' | 'butterfly' | 'lantern';
  className?: string;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({
  variant = 'talisman',
  className = '',
}) => {
  return (
    <div
      className={`relative w-full max-w-5xl mx-auto my-6 px-4 py-2 flex items-center justify-center overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      {/* Left Gradient Divider Line with Filigree Notch */}
      <div className="relative flex-1 h-[2px] bg-gradient-to-r from-transparent via-red-600/60 to-amber-500/80">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 bg-amber-400/90 shadow-[0_0_8px_rgba(247,127,0,0.8)]" />
      </div>

      {/* Central Decorative Emblem / Talisman Node */}
      <div className="relative mx-4 sm:mx-6 flex items-center justify-center shrink-0">
        {/* Soft Ambient Radial Glow */}
        <div className="absolute w-20 h-20 bg-amber-500/20 blur-xl rounded-full animate-pulse" />

        {variant === 'talisman' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0.8 }}
            whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
            transition={{ duration: 0.4 }}
            className="relative cursor-pointer group"
          >
            {/* Paper Talisman Card Frame */}
            <div className="relative w-11 h-16 sm:w-12 sm:h-18 bg-gradient-to-b from-[#e6c687] via-[#cfa052] to-[#b38237] rounded-sm p-[2px] shadow-[0_0_18px_rgba(247,127,0,0.35)] border border-amber-300/60 flex flex-col items-center justify-between py-1.5 overflow-hidden">
              {/* Talisman Top Notch */}
              <div className="w-5 h-1 bg-red-900/60 rounded-full" />

              {/* Stylized Red Cinnabar Seal & Symbols */}
              <div className="flex flex-col items-center space-y-0.5 my-auto">
                <span className="text-[11px] font-bold text-red-950 font-serif leading-none tracking-widest">
                  敕
                </span>
                <div className="w-4 h-4 rounded-full bg-red-800/80 border border-amber-300/80 flex items-center justify-center shadow-inner my-0.5">
                  <Flame className="w-2.5 h-2.5 text-amber-200" />
                </div>
                <span className="text-[10px] font-bold text-red-900 font-serif leading-none">
                  堂
                </span>
              </div>

              {/* Bottom Hanging Ribbon Accent */}
              <div className="w-3 h-1.5 bg-red-800/80 rounded-b-sm" />

              {/* Flame Glow Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-red-600/30 via-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Orbiting Ember Spirits */}
            <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-amber-400 blur-[1px] animate-ping" />
            <span className="absolute -bottom-1 -left-2 w-1.5 h-1.5 rounded-full bg-rose-400 blur-[1px] animate-bounce" />
          </motion.div>
        )}

        {variant === 'flame' && (
          <motion.div
            whileHover={{ scale: 1.15 }}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-red-950 via-red-900 to-amber-950 border border-amber-500/60 shadow-[0_0_20px_rgba(247,127,0,0.4)] flex items-center justify-center cursor-pointer group"
          >
            <Flame className="w-6 h-6 text-amber-400 group-hover:text-amber-200 transition-colors drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse" />
          </motion.div>
        )}

        {variant === 'butterfly' && (
          <motion.div
            whileHover={{ scale: 1.1, rotate: 12 }}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-red-950/90 to-amber-950/90 border border-amber-400/50 shadow-[0_0_18px_rgba(217,119,6,0.35)] flex items-center justify-center cursor-pointer group"
          >
            {/* Stylized Pyro Butterfly SVG */}
            <svg
              className="w-7 h-7 text-amber-300 group-hover:text-rose-200 transition-colors drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 12c-1.5-3-4-5-7-4.5C2 8 1 11 3 14c2 3 5.5 3 9-2c3.5 5 7 5 9 2c2-3 1-6-2-6.5c-3-.5-5.5 1.5-7 4.5z" />
              <path d="M12 12c-1-2-2.5-3.5-4.5-3c-1.5.3-2 2-1 3.5c1 1.5 3.5 2 5.5-.5z" opacity="0.7" />
              <path d="M12 12c1-2 2.5-3.5 4.5-3c1.5.3 2 2 1 3.5c-1 1.5-3.5 2-5.5-.5z" opacity="0.7" />
            </svg>
          </motion.div>
        )}

        {variant === 'lantern' && (
          <motion.div
            whileHover={{ y: -3 }}
            className="w-11 h-13 rounded-xl bg-gradient-to-b from-red-950 via-red-900 to-amber-950 border border-amber-400/60 shadow-[0_0_20px_rgba(247,127,0,0.4)] flex flex-col items-center justify-center p-2 cursor-pointer group"
          >
            <Ghost className="w-5 h-5 text-amber-300 group-hover:text-rose-200 transition-colors animate-bounce" />
            <Sparkles className="w-2.5 h-2.5 text-amber-400 mt-0.5" />
          </motion.div>
        )}
      </div>

      {/* Right Gradient Divider Line with Filigree Notch */}
      <div className="relative flex-1 h-[2px] bg-gradient-to-l from-transparent via-red-600/60 to-amber-500/80">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 bg-amber-400/90 shadow-[0_0_8px_rgba(247,127,0,0.8)]" />
      </div>
    </div>
  );
};
