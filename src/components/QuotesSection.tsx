import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote as QuoteIcon, ChevronLeft, ChevronRight, Sparkles, Ghost, Flower2 } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { SectionHeader } from './SectionHeader';

export const QuotesSection: React.FC = () => {
  const { quotes } = useAppData();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset index if list changes
  useEffect(() => {
    if (currentIndex >= quotes.length && quotes.length > 0) {
      setCurrentIndex(0);
    }
  }, [quotes, currentIndex]);

  useEffect(() => {
    if (quotes.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quotes.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [quotes.length]);

  if (quotes.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % quotes.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + quotes.length) % quotes.length);
  };

  const currentQuote = quotes[currentIndex] || quotes[0];

  return (
    <section id="quotes" className="relative py-24 z-10 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-red-900/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          badge="Memorable Lines & Poems"
          chineseSymbol="诗"
          titlePrefix="Famous"
          titleHighlight="Tak Quotes"
          subtitle="Reflections on life, death, poetry, and funeral parlor wisdom."
        />

        {/* Quote Carousel Card */}
        <div className="relative glass-card rounded-3xl p-5 sm:p-12 border-2 border-amber-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
          {/* Decorative Corner Flowers */}
          <Flower2 className="absolute top-4 left-4 w-5 h-5 sm:w-6 sm:h-6 text-red-500/40 rotate-12" />
          <Flower2 className="absolute bottom-4 right-4 w-5 h-5 sm:w-6 sm:h-6 text-amber-500/40 -rotate-12" />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuote.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center text-center my-4"
            >
              <QuoteIcon className="w-12 h-12 text-amber-400 mb-6 drop-shadow-[0_0_12px_rgba(252,191,73,0.6)]" />

              <p className="font-display text-xl sm:text-3xl font-bold text-white leading-relaxed max-w-3xl mb-6">
                &quot;{currentQuote.text}&quot;
              </p>

              {currentQuote.japaneseText && (
                <p className="text-amber-300/80 font-sans text-sm sm:text-base italic mb-4">
                  {currentQuote.japaneseText}
                </p>
              )}

              <div className="flex items-center gap-3 mt-2">
                <span className="px-4 py-1.5 rounded-full bg-red-950 border border-red-500/40 text-amber-300 font-display text-xs font-semibold">
                  {currentQuote.context}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-8 border-t border-red-500/20 mt-6">
            <button
              onClick={handlePrev}
              className="p-3 rounded-full bg-red-950/80 border border-red-500/40 text-amber-300 hover:bg-red-900 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Pagination Indicators */}
            <div className="flex items-center gap-1.5 max-w-[160px] sm:max-w-none overflow-x-auto py-1 px-1">
              {quotes.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                  }}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx
                      ? 'w-8 bg-amber-400 shadow-[0_0_10px_#fcbf49]'
                      : 'w-2.5 bg-rose-950 hover:bg-amber-500/50'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="p-3 rounded-full bg-red-950/80 border border-red-500/40 text-amber-300 hover:bg-red-900 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
