import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Ghost, Sparkles, Award, Scroll, Feather, MapPin, Maximize2 } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { LazyImage } from './LazyImage';
import { ImageViewerModal } from './ImageViewerModal';
import { SectionHeader } from './SectionHeader';

const LORE_ICON_MAP: Record<string, React.ElementType> = {
  Scroll,
  Feather,
  Sparkles,
  Ghost,
  Award,
  MapPin,
};

const LORE_COLOR_THEMES = [
  { bg: 'bg-red-950/80', border: 'border-red-500/30', text: 'text-amber-400' },
  { bg: 'bg-amber-950/80', border: 'border-amber-500/30', text: 'text-amber-300' },
  { bg: 'bg-rose-950/80', border: 'border-rose-500/30', text: 'text-rose-300' },
];

export const AboutSection: React.FC = () => {
  const { siteImages, aboutContent, loreBoxes } = useAppData();
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const stats = [
    { label: 'Title', value: aboutContent?.statTitle || 'Director', icon: Award, color: 'text-amber-400' },
    { label: 'Affiliation', value: aboutContent?.statAffiliation || 'Wangsheng Funeral Parlor', icon: MapPin, color: 'text-rose-400' },
  ];

  return (
    <section id="about" className="relative py-24 z-10 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-96 h-96 bg-red-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          badge={aboutContent?.badgeText || '77th Director • Wangsheng Funeral Parlor'}
          chineseSymbol="堂"
          titlePrefix={aboutContent?.titlePrefix || 'About'}
          titleHighlight={aboutContent?.titleName || 'Tak'}
          subtitle={aboutContent?.description}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Side Decorative Card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 relative"
          >
            {/* Glass Container */}
            <div className="glass-card rounded-3xl p-8 border border-red-500/30 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-4 mb-6">
                <div
                  onClick={() => setIsViewerOpen(true)}
                  className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow-lg shadow-red-600/40 shrink-0 bg-red-950 cursor-pointer group/avatar"
                  title="Click to view full portrait"
                >
                  <LazyImage
                    src={siteImages.aboutAvatar}
                    alt="Portrait"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/avatar:scale-110"
                    containerClassName="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-amber-300">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-white">{aboutContent?.characterName || 'Tak'}</h3>
                  <p className="text-xs text-amber-300 font-sans tracking-wide">{aboutContent?.characterRole || 'Director • Versatile Poet'}</p>
                </div>
              </div>

              <p className="text-rose-100/80 text-sm leading-relaxed mb-6 font-sans">
                {aboutContent?.characterBio}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-red-500/20">
                {stats.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="bg-[#140808]/80 p-3 rounded-2xl border border-red-500/15 flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                      <div>
                        <p className="text-[10px] text-rose-300/60 uppercase font-bold">{stat.label}</p>
                        <p className="text-xs font-display font-semibold text-white">{stat.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Decorative Floating Ghost */}
            <div
              className="absolute bottom-0 right-0 sm:-bottom-6 sm:-right-6 w-20 h-20 sm:w-24 sm:h-24 animate-float-slow hover:scale-110 transition-transform pointer-events-auto z-10"
              title="Ghost companion"
            >
              <div className="w-full h-full glass-card rounded-full flex items-center justify-center border-amber-400/40 shadow-[0_0_20px_rgba(247,127,0,0.4)]">
                <Ghost className="w-12 h-12 text-amber-300" />
              </div>
            </div>
          </motion.div>

          {/* Right Side Lore & Details */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 flex flex-col gap-6"
          >
            {loreBoxes.map((box, index) => {
              const Icon = LORE_ICON_MAP[box.iconName] || Sparkles;
              const theme = LORE_COLOR_THEMES[index % LORE_COLOR_THEMES.length];
              return (
                <div
                  key={box.id}
                  className="glass-card rounded-3xl p-6 border border-red-500/20 hover:border-amber-400/40 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl ${theme.bg} border ${theme.border} ${theme.text}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-lg text-amber-200 mb-1">{box.title}</h4>
                      <p className="text-rose-100/75 text-sm leading-relaxed">{box.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Full Picture Viewer Modal */}
      <ImageViewerModal
        isOpen={isViewerOpen}
        image={{
          src: siteImages.aboutAvatar,
          title: aboutContent?.characterName || 'Tak',
          caption: `${aboutContent?.characterRole || '77th Director'} - Wangsheng Funeral Parlor`,
          tags: ['About', 'Portrait', 'Tak'],
        }}
        onClose={() => setIsViewerOpen(false)}
      />
    </section>
  );
};
