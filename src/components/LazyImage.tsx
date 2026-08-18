import React, { useState, useEffect } from 'react';
import { IMAGES } from '../data';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  fallbackSrc?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  fallbackSrc = IMAGES.hero,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setHasFailed(false);
    setIsLoaded(false);
  }, [src]);

  // Resolve legacy string paths to bundled Vite assets
  let resolvedSrc = currentSrc;
  if (typeof resolvedSrc === 'string' && (resolvedSrc.startsWith('/src/assets/') || resolvedSrc.startsWith('/src/'))) {
    if (resolvedSrc.includes('hutao_gallery_poetry')) resolvedSrc = IMAGES.galleryPoetry;
    else if (resolvedSrc.includes('hutao_gallery_wuwang')) resolvedSrc = IMAGES.galleryWuwang;
    else if (resolvedSrc.includes('hutao_ghost_spirit')) resolvedSrc = IMAGES.ghostCompanion;
    else resolvedSrc = IMAGES.hero;
  }

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Animated Skeleton Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#2a0b10] via-[#1a080c] to-[#2a0b10] animate-pulse flex items-center justify-center z-10">
          <div className="w-6 h-6 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
        </div>
      )}

      <img
        src={resolvedSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={(e) => {
          setIsLoaded(true);
          if (onLoad) onLoad(e);
        }}
        onError={(e) => {
          if (!hasFailed && fallbackSrc && resolvedSrc !== fallbackSrc) {
            setHasFailed(true);
            setCurrentSrc(fallbackSrc);
          } else {
            setIsLoaded(true);
          }
          if (onError) onError(e);
        }}
        className={`${className} transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
};
