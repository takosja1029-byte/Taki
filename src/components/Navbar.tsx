import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Ghost,
  Menu,
  X,
  Lock,
  Sparkles,
  Music,
  Volume2,
  VolumeX,
  User as UserIcon,
  Flame,
  ChevronRight,
  Quote,
  Heart,
  Image as ImageIcon,
  HelpCircle,
  Home,
  SkipForward,
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { ambientMusic } from '../utils/ambientMusic';

interface NavbarProps {
  onOpenAdmin: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAdmin, onOpenAuth }) => {
  const { aboutContent } = useAppData();
  const { user, userProfile } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [musicPlaying, setMusicPlaying] = useState<boolean>(() => ambientMusic.getIsPlaying());
  const [musicMode, setMusicMode] = useState<'synth' | 'custom'>(() => ambientMusic.getMode());
  const [currentTrack, setCurrentTrack] = useState(() => ambientMusic.getCurrentTrack());
  const [playlistCount, setPlaylistCount] = useState<number>(() => ambientMusic.getPlaylist().length);

  useEffect(() => {
    const updateMusicState = () => {
      setMusicPlaying(ambientMusic.getIsPlaying());
      setMusicMode(ambientMusic.getMode());
      setCurrentTrack(ambientMusic.getCurrentTrack());
      setPlaylistCount(ambientMusic.getPlaylist().length);
    };
    const unsubscribe = ambientMusic.subscribe(() => {
      updateMusicState();
    });
    return () => unsubscribe();
  }, []);

  const handleToggleMusic = () => {
    ambientMusic.toggle();
    ambientMusic.attemptUnlockAudio();
  };

  const handleNextTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    ambientMusic.nextTrack();
    ambientMusic.attemptUnlockAudio();
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      // ScrollSpy
      const sections = ['home', 'about', 'quotes', 'personality', 'gallery', 'fun-facts'];
      const scrollPos = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'Home', href: '#home', icon: Home },
    { name: 'About', href: '#about', icon: Flame },
    { name: 'Quotes', href: '#quotes', icon: Quote },
    { name: 'Personality', href: '#personality', icon: Heart },
    { name: 'Gallery', href: '#gallery', icon: ImageIcon },
    { name: 'Fun Facts', href: '#fun-facts', icon: HelpCircle },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-nav py-3 shadow-2xl' : 'bg-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Ghost Companion */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('#home');
            }}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-red-600 via-amber-500 to-rose-500 p-0.5 shadow-[0_0_15px_rgba(230,57,70,0.5)] group-hover:scale-110 transition-transform">
              <div className="w-full h-full bg-[#180a0b] rounded-full flex items-center justify-center">
                <Ghost className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-bounce group-hover:text-red-400 transition-colors" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg sm:text-xl tracking-wide bg-gradient-to-r from-red-400 via-amber-300 to-amber-200 bg-clip-text text-transparent group-hover:text-glow">
                {aboutContent.brandTitle !== undefined && aboutContent.brandTitle !== '' ? aboutContent.brandTitle : 'Tak'}
              </span>
              {(aboutContent.brandSubtitle !== undefined && aboutContent.brandSubtitle !== '') && (
                <span className="text-[9px] sm:text-[10px] text-amber-200/70 font-sans tracking-widest uppercase -mt-1">
                  {aboutContent.brandSubtitle}
                </span>
              )}
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#1a0b0d]/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-red-500/20 shadow-inner">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.substring(1);
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                    isActive
                      ? 'text-amber-200 font-bold bg-gradient-to-r from-red-700/80 to-amber-700/80 shadow-[0_0_12px_rgba(230,57,70,0.4)]'
                      : 'text-rose-200/70 hover:text-amber-300 hover:bg-white/5'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-400 rounded-full blur-[2px] animate-ping" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Action Buttons: Ambient Music & Admin Login (Desktop) */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Ambient Oriental Flute / Custom Music Toggle */}
            <div className="inline-flex items-center gap-1">
              <button
                onClick={handleToggleMusic}
                className={`group relative inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-full border transition-all duration-200 cursor-pointer text-xs font-semibold ${
                  musicPlaying
                    ? 'bg-amber-950/80 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(247,127,0,0.5)]'
                    : 'bg-[#1e0a0c]/80 border-red-500/30 text-rose-200/70 hover:text-amber-200 hover:border-amber-500/40'
                }`}
                title={
                  musicPlaying
                    ? musicMode === 'custom' && currentTrack
                      ? `Now Playing: ${currentTrack.name} (Click to pause)`
                      : 'Mute Ambient Oriental Music'
                    : 'Play Background Music'
                }
              >
                {musicPlaying ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span className="text-amber-300 font-bold max-w-[140px] truncate">
                      {musicMode === 'custom' && currentTrack ? currentTrack.name : 'Ambient Music'}
                    </span>
                    {/* Glowing Equalizer Bars Animation */}
                    <span className="flex items-center gap-0.5 ml-0.5 h-3">
                      <span className="w-0.5 h-2.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-0.5 h-3.5 bg-amber-300 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-0.5 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-rose-300/60 group-hover:text-amber-300" />
                    <span>Music Off</span>
                  </>
                )}
              </button>

              {musicPlaying && musicMode === 'custom' && playlistCount > 1 && (
                <button
                  type="button"
                  onClick={handleNextTrack}
                  className="p-2 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 hover:bg-amber-900/90 hover:text-amber-100 transition-colors cursor-pointer shadow-sm"
                  title="Next Song"
                >
                  <SkipForward className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              onClick={onOpenAdmin}
              className="group relative inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-red-700 via-amber-600 to-red-700 hover:from-red-600 hover:via-amber-500 hover:to-red-600 border border-amber-400/40 text-white font-display font-bold text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(230,57,70,0.4)] hover:shadow-[0_0_22px_rgba(247,127,0,0.6)] hover:scale-[1.03] active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              <Lock className="w-3.5 h-3.5 text-amber-200 group-hover:text-white transition-colors group-hover:scale-110" />
              <span className="bg-gradient-to-r from-amber-100 to-white bg-clip-text text-transparent">Admin Login</span>
              <Sparkles className="w-3 h-3 text-amber-300/80 group-hover:text-amber-200 transition-colors" />
            </button>
          </div>

          {/* Mobile Header Right Controls: Compact Music Button & Hamburger Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Quick Ambient Music Button on Mobile Header */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleToggleMusic}
                className={`p-2.5 rounded-xl border active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-md min-w-[44px] min-h-[44px] ${
                  musicPlaying
                    ? 'bg-amber-950/90 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(247,127,0,0.5)]'
                    : 'bg-red-950/80 border-red-500/30 text-rose-300/70 hover:text-amber-200'
                }`}
                title={
                  musicPlaying
                    ? musicMode === 'custom' && currentTrack
                      ? `Now Playing: ${currentTrack.name}`
                      : 'Mute Ambient Music'
                    : 'Play Ambient Music'
                }
                aria-label={musicPlaying ? 'Mute Ambient Music' : 'Play Ambient Music'}
              >
                {musicPlaying ? (
                  <span className="flex items-center gap-1">
                    <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
                  </span>
                ) : (
                  <VolumeX className="w-4 h-4 text-rose-300/60" />
                )}
              </button>

              {musicPlaying && musicMode === 'custom' && playlistCount > 1 && (
                <button
                  type="button"
                  onClick={handleNextTrack}
                  className="p-2.5 rounded-xl bg-red-950/80 border border-amber-500/40 text-amber-300 hover:bg-red-900 transition-colors cursor-pointer shadow-md min-w-[40px] min-h-[44px] flex items-center justify-center"
                  title="Next Song"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Hamburger Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2.5 rounded-xl border active:scale-95 transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center shadow-md ${
                mobileMenuOpen
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 border-amber-400 text-white shadow-[0_0_18px_rgba(230,57,70,0.6)]'
                  : 'bg-red-950/90 border-red-500/40 text-amber-200 hover:text-white hover:bg-red-900/90'
              }`}
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 animate-in spin-in-90 duration-200" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer / Overlay Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md lg:hidden"
            />

            {/* Mobile Navigation Drawer */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed inset-x-3 top-16 z-50 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-3xl bg-gradient-to-b from-[#1e0a0c] via-[#140608] to-black border-2 border-red-500/40 p-5 shadow-[0_0_50px_rgba(230,57,70,0.5)] lg:hidden text-white"
            >
              {/* Drawer Header Badge */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-red-500/20">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-red-950 border border-amber-400/40 text-amber-300">
                    <Ghost className="w-4 h-4 animate-bounce" />
                  </div>
                  <div>
                    <span className="font-display font-bold text-sm text-white block">Navigation Menu</span>
                    <span className="text-[10px] text-amber-300/80 font-sans tracking-wider uppercase block">Wangsheng Parlor Directory</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-rose-200 hover:text-white cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Nav Links List */}
              <div className="space-y-2 mb-5">
                {navLinks.map((link) => {
                  const isActive = activeSection === link.href.substring(1);
                  const IconComponent = link.icon;
                  const isHome = link.name === 'Home' || link.href === '#hero';
                  return (
                    <React.Fragment key={link.name}>
                      <a
                        href={link.href}
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavClick(link.href);
                        }}
                        className={`group flex items-center justify-between px-4 py-3 rounded-2xl transition-all text-sm font-semibold cursor-pointer min-h-[48px] ${
                          isActive
                            ? 'bg-gradient-to-r from-red-800/90 via-amber-900/80 to-red-950 text-amber-200 border border-amber-400/50 shadow-[0_0_15px_rgba(230,57,70,0.3)]'
                            : 'bg-red-950/30 hover:bg-red-900/40 text-rose-100/90 border border-red-500/10 hover:border-red-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-xl transition-colors ${
                              isActive ? 'bg-amber-400 text-black' : 'bg-red-950 border border-red-500/30 text-amber-400 group-hover:text-amber-200'
                            }`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-sm">{link.name}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isActive && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-[10px] text-amber-300 font-bold uppercase">
                              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
                              Active
                            </span>
                          )}
                          <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isActive ? 'text-amber-300' : 'text-rose-400/40'}`} />
                        </div>
                      </a>

                      {/* Ambient Music Player Card placed directly under Home button */}
                      {isHome && (
                        <div className="my-1.5 p-3.5 rounded-2xl bg-gradient-to-r from-[#2a0e12] via-[#1a080a] to-[#2a0e12] border-2 border-amber-400/70 shadow-lg flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              type="button"
                              onClick={handleToggleMusic}
                              className={`p-2.5 rounded-xl shrink-0 cursor-pointer transition-all ${
                                musicPlaying
                                  ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                                  : 'bg-red-950 border border-amber-500/40 text-amber-300 hover:bg-red-900'
                              }`}
                            >
                              <Music className="w-4 h-4" />
                            </button>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white font-display truncate">
                                  Ambient Music & Sound
                                </span>
                                {musicPlaying && (
                                  <span className="flex items-end gap-0.5 h-3 shrink-0">
                                    <span className="w-0.5 h-2.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0ms]" />
                                    <span className="w-0.5 h-3 bg-amber-300 rounded-full animate-bounce [animation-delay:150ms]" />
                                    <span className="w-0.5 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:300ms]" />
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-amber-200/80 block truncate">
                                {musicPlaying ? 'Playing auto background melody' : 'Tap to turn on background music'}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleToggleMusic}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                              musicPlaying
                                ? 'bg-amber-400 text-black shadow-md'
                                : 'bg-red-950 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {musicPlaying ? 'ON' : 'OFF'}
                          </button>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Mobile Quick Action Cards Section */}
              <div className="pt-4 border-t border-red-500/20 space-y-2.5">
                <span className="text-[10px] font-bold text-amber-300/80 font-sans tracking-widest uppercase block px-1">
                  Quick Actions
                </span>

                {/* Ambient Music Player Card */}
                <button
                  type="button"
                  onClick={handleToggleMusic}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer min-h-[48px] ${
                    musicPlaying
                      ? 'bg-gradient-to-r from-amber-950 via-red-950 to-amber-950 border-amber-400 text-amber-200 shadow-md'
                      : 'bg-[#18080a] border-red-500/30 hover:border-amber-400/40 text-rose-100/90'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${musicPlaying ? 'bg-amber-400 text-black' : 'bg-red-950 border border-red-500/30 text-amber-400'}`}>
                      <Music className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-white flex items-center gap-2">
                        <span>Ambient Flute Music</span>
                        {musicPlaying && (
                          <span className="flex items-center gap-0.5 h-2.5">
                            <span className="w-0.5 h-2.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0ms]" />
                            <span className="w-0.5 h-3 bg-amber-300 rounded-full animate-bounce [animation-delay:150ms]" />
                            <span className="w-0.5 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:300ms]" />
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-rose-200/60 block">
                        {musicPlaying ? 'Playing relaxing oriental melody' : 'Click to toggle background flute music'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${
                      musicPlaying
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400'
                        : 'bg-red-950 text-rose-300/60 border-red-500/20'
                    }`}
                  >
                    {musicPlaying ? 'ON' : 'OFF'}
                  </span>
                </button>

                {/* Director's Admin Portal Button */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:from-red-500 hover:to-amber-500 border border-amber-300/50 text-white font-display text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(230,57,70,0.4)] cursor-pointer min-h-[48px]"
                >
                  <Lock className="w-4 h-4 text-amber-200" />
                  <span>Admin Login & Upload Portal</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </button>
              </div>

              {/* Footer Note in Drawer */}
              <div className="mt-4 pt-3 border-t border-red-500/10 text-center">
                <span className="text-[10px] text-rose-300/50 font-sans tracking-widest uppercase flex items-center justify-center gap-1.5">
                  <Flame className="w-3 h-3 text-amber-400/70" />
                  <span>77th Director • Wangsheng Funeral Parlor</span>
                  <Flame className="w-3 h-3 text-amber-400/70" />
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

