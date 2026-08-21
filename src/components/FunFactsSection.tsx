import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Music, Smile, Eye, Utensils, Ticket, Flame, RotateCw, Ghost, Sparkles } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { SectionHeader } from './SectionHeader';

export const FunFactsSection: React.FC = () => {
  const { funFacts, sectionHeaders } = useAppData();
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const iconMap: Record<string, React.ElementType> = {
    Music,
    Smile,
    Eye,
    Utensils,
    Ticket,
    Flame,
    Sparkles,
  };

  const handleCardFlip = (id: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section id="fun-facts" className="relative py-24 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          badge={sectionHeaders.funFacts.badge}
          chineseSymbol={sectionHeaders.funFacts.chineseSymbol}
          titlePrefix={sectionHeaders.funFacts.titlePrefix}
          titleHighlight={sectionHeaders.funFacts.titleHighlight}
          subtitle={sectionHeaders.funFacts.subtitle}
        />

        {/* 6 Flip Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {funFacts.map((fact, index) => {
            const Icon = iconMap[fact.iconName] || Sparkles;
            const isFlipped = !!flippedCards[fact.id];

            return (
              <motion.div
                key={fact.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                onClick={() => handleCardFlip(fact.id)}
                className="h-72 sm:h-64 perspective-1000 cursor-pointer group"
              >
                <div
                  className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
                    isFlipped ? '[transform:rotateY(180deg)]' : ''
                  }`}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* FRONT side */}
                  <div className="absolute inset-0 w-full h-full glass-card glass-card-hover rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-red-500/30 flex flex-col justify-between overflow-hidden backface-hidden">
                    <div className="flex items-center justify-between gap-1">
                      <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg shrink-0">
                        <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-red-950 border border-amber-400/40 text-amber-300 truncate max-w-[90px] sm:max-w-none">
                        {fact.badge}
                      </span>
                    </div>

                    <div className="my-auto">
                      <h3 className="font-display font-bold text-sm sm:text-xl text-white mb-1 sm:mb-2 group-hover:text-amber-300 transition-colors line-clamp-1 sm:line-clamp-none">
                        {fact.title}
                      </h3>
                      <p className="text-rose-100/80 text-[11px] sm:text-xs md:text-sm leading-relaxed line-clamp-3">
                        {fact.fact}
                      </p>
                    </div>

                    <div className="pt-2 sm:pt-3 border-t border-red-500/20 flex items-center justify-between text-[10px] sm:text-xs text-amber-300/80">
                      <span className="flex items-center gap-1 font-semibold">
                        <RotateCw className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
                        Flip card
                      </span>
                      <Ghost className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 animate-bounce" />
                    </div>
                  </div>

                  {/* BACK side */}
                  <div
                    className="absolute inset-0 w-full h-full bg-gradient-to-br from-red-950 via-[#200a0e] to-amber-950 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border-2 border-amber-400/80 shadow-2xl flex flex-col justify-between [transform:rotateY(180deg)] backface-hidden"
                    style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs font-display font-bold text-amber-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Secret Lore
                      </span>
                      <Ghost className="w-4 h-4 text-amber-300 animate-pulse" />
                    </div>

                    <div className="my-auto text-center">
                      <p className="text-[9px] sm:text-xs text-rose-200 uppercase font-semibold tracking-wider mb-1">Did you know?</p>
                      <p className="font-display font-bold text-xs sm:text-base text-amber-200 leading-snug">
                        &quot;{fact.secretDetail}&quot;
                      </p>
                    </div>

                    <div className="pt-2 sm:pt-3 border-t border-amber-500/30 flex items-center justify-center text-[10px] sm:text-xs text-amber-300">
                      <span>Flip back</span>
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
