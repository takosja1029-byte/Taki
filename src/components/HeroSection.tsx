import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { Ghost, Sparkles, ChevronDown, Flame, Heart, Image as ImageIcon, Maximize2 } from 'lucide-react';
import { IMAGES } from '../data';
import { useAppData } from '../context/AppDataContext';
import { LazyImage } from './LazyImage';
import { ImageViewerModal } from './ImageViewerModal';

export const HeroSection: React.FC = () => {
  const { subtitles: contextSubtitles, siteImages } = useAppData();
  const subtitles = contextSubtitles && contextSubtitles.length > 0
    ? contextSubtitles
    : ['Director of Wangsheng Funeral Parlor 👻'];

  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [ghostHeartCount, setGhostHeartCount] = useState(77);
  const [ghostGlow, setGhostGlow] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Parallax scroll setup
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Parallax transforms for background depth layers
  const bgSpotlightY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const bgSpotlightOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.15]);

  const orbLeftY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const orbLeftRotate = useTransform(scrollYProgress, [0, 1], [0, 40]);

  const orbRightY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const orbRightRotate = useTransform(scrollYProgress, [0, 1], [0, -35]);

  const spiritRingY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const spiritRingRotate = useTransform(scrollYProgress, [0, 1], [0, 75]);

  const floatingEmberY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const floatingEmberScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.2, 0.7]);

  // Typewriter effect
  useEffect(() => {
    const safeIndex = currentSubtitleIndex % subtitles.length;
    const currentFullText = subtitles[safeIndex] || subtitles[0] || '';
    let timeout: NodeJS.Timeout;

    if (isTyping) {
      if (displayText.length < currentFullText.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentFullText.slice(0, displayText.length + 1));
        }, 80);
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2200);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, displayText.length - 1));
        }, 40);
      } else {
        setIsTyping(true);
        setCurrentSubtitleIndex((prev) => (prev + 1) % subtitles.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, currentSubtitleIndex, subtitles]);

  const handleGhostClick = () => {
    setGhostHeartCount((prev) => prev + 1);
    setGhostGlow(true);
    setTimeout(() => setGhostGlow(false), 800);
  };

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative min-h-screen pt-28 pb-16 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Parallax Layer 1: Background central radial spotlight */}
      <motion.div
        style={{ y: bgSpotlightY, opacity: bgSpotlightOpacity, willChange: 'transform, opacity' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[750px] h-[600px] sm:h-[750px] bg-gradient-to-tr from-red-600/25 via-amber-600/15 to-rose-600/20 rounded-full blur-[70px] pointer-events-none z-0"
      />

      {/* Parallax Layer 2: Top-Left Floating Crimson Glow */}
      <motion.div
        style={{ y: orbLeftY, rotate: orbLeftRotate, willChange: 'transform' }}
        className="absolute -top-12 left-0 sm:left-10 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-br from-red-600/20 via-rose-500/10 to-transparent rounded-full blur-[50px] pointer-events-none z-0"
      />

      {/* Parallax Layer 3: Bottom-Right Floating Amber Aura */}
      <motion.div
        style={{ y: orbRightY, rotate: orbRightRotate, willChange: 'transform' }}
        className="absolute bottom-10 right-0 sm:right-10 w-80 h-80 sm:w-96 sm:h-96 bg-gradient-to-tl from-amber-500/20 via-red-500/10 to-transparent rounded-full blur-[60px] pointer-events-none z-0"
      />

      {/* Parallax Layer 4: Rotating Spirit Ring Emblem */}
      <motion.div
        style={{ y: spiritRingY, rotate: spiritRingRotate }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] sm:w-[650px] h-[450px] sm:h-[650px] rounded-full border border-amber-500/15 border-dashed pointer-events-none z-0 flex items-center justify-center"
      >
        <div className="w-[85%] h-[85%] rounded-full border border-red-500/10 border-dotted" />
      </motion.div>

      {/* Parallax Layer 5: Fast Floating Ember & Spirit Orbs */}
      <motion.div
        style={{ y: floatingEmberY, scale: floatingEmberScale }}
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      >
        <div className="absolute top-1/4 left-1/6 w-3 h-3 rounded-full bg-amber-400/50 blur-[2px] animate-pulse" />
        <div className="absolute top-1/3 right-1/5 w-4 h-4 rounded-full bg-red-500/40 blur-[3px] animate-pulse [animation-delay:500ms]" />
        <div className="absolute bottom-1/3 left-1/4 w-2 h-2 rounded-full bg-rose-300/60 blur-[1px] animate-pulse [animation-delay:1000ms]" />
        <div className="absolute top-1/2 right-1/3 w-3 h-3 rounded-full bg-amber-300/50 blur-[2px] animate-pulse [animation-delay:1500ms]" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 flex flex-col items-center text-center">
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-950/80 via-amber-950/80 to-red-950/80 border border-red-500/40 text-amber-300 text-xs font-semibold shadow-[0_0_20px_rgba(230,57,70,0.3)] mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>Wangsheng Funeral Parlor</span>
          <Flame className="w-3.5 h-3.5 text-red-400" />
        </motion.div>

        {/* Large Animated Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-4"
        >
          Welcome to{' '}
          <span className="bg-gradient-to-r from-red-500 via-amber-400 to-amber-200 bg-clip-text text-transparent text-glow">
            Tak&apos;s
          </span>{' '}
          World
        </motion.h1>

        {/* Subtitle with Typewriter Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="h-10 flex items-center justify-center font-display text-lg sm:text-2xl text-amber-200/90 mb-8"
        >
          <span className="border-b-2 border-amber-400 pb-1">
            {displayText}
          </span>
          <span className="w-0.5 h-6 bg-amber-400 ml-1 animate-pulse" />
        </motion.div>

        {/* Centered Large Artwork of Tak + Floating Ghost Companion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="relative max-w-md sm:max-w-lg lg:max-w-xl w-full my-6 group"
        >
          {/* Main Frame Glow Effect */}
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-red-600 via-amber-500 to-rose-600 opacity-60 blur-xl group-hover:opacity-90 transition-opacity duration-500" />

          {/* Centered Tak Artwork Card */}
          <div
            onClick={() => setIsViewerOpen(true)}
            className="relative rounded-3xl overflow-hidden border-2 border-amber-500/40 bg-[#1e0a0c]/80 shadow-[0_20px_50px_rgba(0,0,0,0.8)] aspect-[3/4] sm:aspect-[4/5] max-h-[500px] mx-auto flex items-center justify-center cursor-pointer group/img"
          >
            <LazyImage
              src={siteImages.hero}
              alt="Tak Official Artwork"
              className="w-full h-full object-cover object-top transition-transform duration-700 group-hover/img:scale-105"
              containerClassName="w-full h-full"
            />

            {/* Dark gradient overlay at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#140808] via-transparent to-transparent opacity-80" />

            {/* Hover Full Screen Indicator */}
            <div className="absolute top-3 right-3 p-2 rounded-full bg-black/75 backdrop-blur-md text-amber-300 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 border border-amber-500/40 hover:scale-110 flex items-center gap-1.5 px-3 py-1.5 shadow-xl">
              <Maximize2 className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Full View</span>
            </div>
          </div>




        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-6"
        >
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white font-display font-bold text-sm shadow-[0_0_25px_rgba(230,57,70,0.6)] hover:shadow-[0_0_35px_rgba(247,127,0,0.8)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <span>Meet Tak</span>
            <Sparkles className="w-4 h-4 text-amber-200" />
          </a>

          <a
            href="#gallery"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#gallery')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-3.5 rounded-full glass-card text-amber-200 font-display font-bold text-sm border-2 border-amber-500/40 hover:bg-red-950/80 hover:text-white hover:border-amber-400 shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>Explore Gallery</span>
          </a>
        </motion.div>

        {/* Bouncing Scroll Down Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-12 flex flex-col items-center"
        >
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group flex flex-col items-center text-rose-300/70 hover:text-amber-300 transition-colors cursor-pointer"
          >
            <span className="text-xs font-sans tracking-widest uppercase mb-1">Scroll Down</span>
            <div className="w-8 h-8 rounded-full bg-red-950/60 border border-red-500/30 flex items-center justify-center animate-bounce group-hover:border-amber-400">
              <ChevronDown className="w-4 h-4 text-amber-300" />
            </div>
          </a>
        </motion.div>
      </div>

      {/* Full Picture Viewer Modal */}
      <ImageViewerModal
        isOpen={isViewerOpen}
        image={{
          src: siteImages.hero,
          title: 'Tak Main Artwork',
          caption: 'Director of the Wangsheng Funeral Parlor in Liyue Harbor',
          tags: ['Tak', 'Wangsheng', 'Genshin Impact', 'Pyro'],
        }}
        onClose={() => setIsViewerOpen(false)}
      />
    </section>
  );
};
