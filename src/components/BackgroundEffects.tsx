import React, { useMemo } from 'react';

interface Petal {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
}

interface Ember {
  id: number;
  left: number;
  duration: number;
  delay: number;
  size: number;
}

interface Lantern {
  id: number;
  left: number;
  delay: number;
  scale: number;
}

export const BackgroundEffects: React.FC = () => {
  // Generate stable random items for performance (moderated count for 120fps smooth scrolling)
  const petals = useMemo<Petal[]>(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: Math.random() * 98,
      size: 10 + Math.random() * 14,
      duration: 10 + Math.random() * 10,
      delay: Math.random() * 6,
    }));
  }, []);

  const embers = useMemo<Ember[]>(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 6 + Math.random() * 7,
      delay: Math.random() * 5,
      size: 3 + Math.random() * 4,
    }));
  }, []);

  const lanterns = useMemo<Lantern[]>(() => {
    return Array.from({ length: 4 }).map((_, i) => ({
      id: i,
      left: 8 + i * 24 + Math.random() * 5,
      delay: i * 2,
      scale: 0.7 + Math.random() * 0.4,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ transform: 'translateZ(0)' }}>
      {/* Dark crimson gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#180a0b] via-[#120808] to-[#0c0404] opacity-90" />

      {/* Hardware accelerated soft radial glow spots */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-900/15 rounded-full blur-[80px]"
        style={{ willChange: 'transform' }}
      />
      <div
        className="absolute top-3/4 left-1/4 w-[400px] h-[400px] bg-amber-900/15 rounded-full blur-[70px]"
        style={{ willChange: 'transform' }}
      />
      <div
        className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-rose-900/20 rounded-full blur-[80px]"
        style={{ willChange: 'transform' }}
      />

      {/* Floating Plum Blossom Petals */}
      {petals.map((petal) => (
        <div
          key={`petal-${petal.id}`}
          className="absolute text-rose-500/60"
          style={{
            left: `${petal.left}%`,
            width: `${petal.size}px`,
            height: `${petal.size}px`,
            animation: `petal-fall ${petal.duration}s linear infinite`,
            animationDelay: `${petal.delay}s`,
            willChange: 'transform, opacity',
          }}
        >
          {/* SVG Plum Blossom Petal */}
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full drop-shadow-[0_0_6px_rgba(230,57,70,0.5)]">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      ))}

      {/* Drifting Ember Particles */}
      {embers.map((ember) => (
        <div
          key={`ember-${ember.id}`}
          className="absolute rounded-full bg-gradient-to-t from-amber-500 to-red-500 shadow-[0_0_8px_#f77f00]"
          style={{
            left: `${ember.left}%`,
            width: `${ember.size}px`,
            height: `${ember.size}px`,
            animation: `ember-rise ${ember.duration}s ease-in-out infinite`,
            animationDelay: `${ember.delay}s`,
            willChange: 'transform, opacity',
          }}
        />
      ))}

      {/* Ambient Floating Red Paper Lanterns */}
      {lanterns.map((lantern) => (
        <div
          key={`lantern-${lantern.id}`}
          className="absolute animate-float opacity-30 hover:opacity-80 transition-opacity duration-500 pointer-events-auto cursor-pointer"
          style={{
            left: `${lantern.left}%`,
            top: `${12 + (lantern.id % 3) * 28}%`,
            transform: `scale(${lantern.scale})`,
            animationDelay: `${lantern.delay}s`,
            willChange: 'transform',
          }}
          title="Click to light the spirit lantern!"
        >
          <div className="relative flex flex-col items-center">
            <div className="w-1 h-8 bg-amber-700/60" />
            <div className="w-10 h-14 bg-gradient-to-b from-red-600 via-rose-700 to-red-900 rounded-2xl border border-amber-500/40 shadow-[0_0_20px_rgba(247,127,0,0.5)] flex items-center justify-center">
              <div className="w-4 h-6 bg-amber-300 rounded-full blur-[2px] animate-pulse" />
              <span className="absolute text-[9px] text-amber-200/90 font-bold select-none">往生</span>
            </div>
            <div className="w-2 h-5 bg-amber-600/70 rounded-b-md" />
            <div className="w-1 h-6 bg-red-500/50" />
          </div>
        </div>
      ))}
    </div>
  );
};
