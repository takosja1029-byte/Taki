import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Maximize2,
  Minimize2,
  X,
  Tag,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  Info,
} from 'lucide-react';
import { GalleryItem } from '../types';
import { useAppData } from '../context/AppDataContext';
import { LazyImage } from './LazyImage';
import { SectionHeader } from './SectionHeader';

export const GallerySection: React.FC = () => {
  const { galleryItems, galleryCategories, sectionHeaders } = useAppData();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeLightboxItem, setActiveLightboxItem] = useState<GalleryItem | null>(null);

  // Zoom & Pan states
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showInfo, setShowInfo] = useState<boolean>(true);
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);

  // Touch handling (pinch & swipe)
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartZoomRef = useRef<number>(1);
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchSwipeStartXRef = useRef<number | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const lightboxContainerRef = useRef<HTMLDivElement>(null);

  const selectedCatObj = galleryCategories.find((c) => c.id === selectedCategory);

  const filteredItems =
    selectedCategory === 'all' || selectedCategory === 'All'
      ? galleryItems
      : galleryItems.filter((item) => {
          const itemCatLower = (item.category || '').toLowerCase();
          const selCatLower = selectedCategory.toLowerCase();
          const catLabelLower = (selectedCatObj?.label || '').toLowerCase();
          return itemCatLower === selCatLower || itemCatLower === catLabelLower;
        });

  const currentIndex = activeLightboxItem
    ? filteredItems.findIndex((item) => item.id === activeLightboxItem.id)
    : -1;

  const handleOpenLightbox = (item: GalleryItem) => {
    setActiveLightboxItem(item);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setIsImageLoaded(false);
  };

  const handleCloseLightbox = () => {
    setActiveLightboxItem(null);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handlePrevItem = useCallback(
    (e?: React.MouseEvent | TouchEvent) => {
      if (e && 'stopPropagation' in e) e.stopPropagation();
      if (currentIndex !== -1 && filteredItems.length > 0) {
        const prevIdx = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
        setActiveLightboxItem(filteredItems[prevIdx]);
        setZoomLevel(1);
        setPanPosition({ x: 0, y: 0 });
        setIsImageLoaded(false);
      }
    },
    [currentIndex, filteredItems]
  );

  const handleNextItem = useCallback(
    (e?: React.MouseEvent | TouchEvent) => {
      if (e && 'stopPropagation' in e) e.stopPropagation();
      if (currentIndex !== -1 && filteredItems.length > 0) {
        const nextIdx = (currentIndex + 1) % filteredItems.length;
        setActiveLightboxItem(filteredItems[nextIdx]);
        setZoomLevel(1);
        setPanPosition({ x: 0, y: 0 });
        setIsImageLoaded(false);
      }
    },
    [currentIndex, filteredItems]
  );

  const handleZoomIn = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setZoomLevel((prev) => Math.min(Number((prev + 0.5).toFixed(1)), 4));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setZoomLevel((prev) => {
      const next = Math.max(Number((prev - 0.5).toFixed(1)), 1);
      if (next === 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  // Double Click / Double Tap to toggle Zoom (1x <-> 2.5x)
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (zoomLevel > 1) {
      setZoomLevel(1);
      setPanPosition({ x: 0, y: 0 });
    } else {
      setZoomLevel(2.5);
      // Optional subtle offset towards click point
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left - rect.width / 2;
      const clickY = e.clientY - rect.top - rect.height / 2;
      setPanPosition({ x: -clickX * 0.5, y: -clickY * 0.5 });
    }
  };

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.deltaY < 0) {
      // Zoom in
      setZoomLevel((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 4));
    } else {
      // Zoom out
      setZoomLevel((prev) => {
        const next = Math.max(Number((prev - 0.25).toFixed(2)), 1);
        if (next === 1) setPanPosition({ x: 0, y: 0 });
        return next;
      });
    }
  };

  // Mouse Drag / Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      e.preventDefault();
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Handlers (Pinch-to-zoom, Double-tap, Drag-pan, Swipe)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch to zoom start
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
      touchStartZoomRef.current = zoomLevel;
    } else if (e.touches.length === 1) {
      // Check for double tap
      const now = Date.now();
      if (now - lastTapTimeRef.current < 300) {
        // Double tap trigger
        if (zoomLevel > 1) {
          setZoomLevel(1);
          setPanPosition({ x: 0, y: 0 });
        } else {
          setZoomLevel(2.5);
        }
        lastTapTimeRef.current = 0;
        return;
      }
      lastTapTimeRef.current = now;

      // 1 Finger pan or swipe
      touchSwipeStartXRef.current = e.touches[0].clientX;
      touchStartPosRef.current = {
        x: e.touches[0].clientX - panPosition.x,
        y: e.touches[0].clientY - panPosition.y,
      };
      if (zoomLevel > 1) {
        setIsDragging(true);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      // Pinch Zooming
      e.preventDefault();
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scaleChange = currentDist / touchStartDistRef.current;
      const newZoom = Math.min(Math.max(touchStartZoomRef.current * scaleChange, 1), 4);
      setZoomLevel(Number(newZoom.toFixed(2)));
      if (newZoom === 1) setPanPosition({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && zoomLevel > 1 && isDragging) {
      // 1 finger panning when zoomed in
      e.preventDefault();
      setPanPosition({
        x: e.touches[0].clientX - touchStartPosRef.current.x,
        y: e.touches[0].clientY - touchStartPosRef.current.y,
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartDistRef.current !== null) {
      touchStartDistRef.current = null;
    }
    setIsDragging(false);

    // Swipe detection when at zoomLevel === 1
    if (zoomLevel === 1 && touchSwipeStartXRef.current !== null && e.changedTouches.length > 0) {
      const deltaX = e.changedTouches[0].clientX - touchSwipeStartXRef.current;
      if (deltaX > 60) {
        handlePrevItem();
      } else if (deltaX < -60) {
        handleNextItem();
      }
    }
    touchSwipeStartXRef.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeLightboxItem) return;
      if (e.key === 'Escape') {
        handleCloseLightbox();
      } else if (e.key === 'ArrowLeft') {
        handlePrevItem();
      } else if (e.key === 'ArrowRight') {
        handleNextItem();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleResetZoom();
      } else if (e.key === 'i' || e.key === 'I') {
        setShowInfo((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxItem, handlePrevItem, handleNextItem]);

  const activeCategoryLabel = activeLightboxItem
    ? galleryCategories.find(
        (c) =>
          c.id === activeLightboxItem.category ||
          c.label.toLowerCase() === (activeLightboxItem.category || '').toLowerCase()
      )?.label || activeLightboxItem.category
    : '';

  return (
    <section id="gallery" className="relative py-24 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          badge={sectionHeaders.gallery.badge}
          chineseSymbol={sectionHeaders.gallery.chineseSymbol}
          titlePrefix={sectionHeaders.gallery.titlePrefix}
          titleHighlight={sectionHeaders.gallery.titleHighlight}
          subtitle={sectionHeaders.gallery.subtitle}
        />

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 overflow-x-auto no-scrollbar max-w-full py-1">
          {galleryCategories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-display font-semibold transition-all duration-200 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-[0_0_15px_rgba(230,57,70,0.5)] scale-105'
                    : 'glass-card text-rose-200/70 hover:text-amber-300 hover:border-amber-400/40'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35 }}
                onClick={() => handleOpenLightbox(item)}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden glass-card border border-red-500/20 hover:border-amber-400/60 shadow-lg hover:shadow-[0_12px_35px_rgba(230,57,70,0.3)] transition-all duration-300 cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-black/60">
                  <LazyImage
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    containerClassName="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#140808] via-transparent to-transparent opacity-75 group-hover:opacity-40 transition-opacity" />

                  {/* Clean hover expand hint badge */}
                  <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                    <div className="p-2 rounded-full bg-black/80 backdrop-blur-md text-amber-300 border border-amber-400/50 shadow-xl">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Content info at bottom */}
                <div className="p-3 sm:p-5">
                  <h3 className="font-display font-bold text-sm sm:text-lg text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-rose-200/70 text-[11px] sm:text-xs line-clamp-2 mt-0.5 sm:mt-1">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-2 sm:mt-3">
                    {item.tags.slice(0, 2).map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500/30 text-amber-300"
                      >
                        <Tag className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Professional Full Picture & Zoom Lightbox Modal */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {activeLightboxItem && (
              <motion.div
                ref={lightboxContainerRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#070203]/98 backdrop-blur-2xl overflow-hidden select-none"
                onClick={handleCloseLightbox}
                onWheel={handleWheel}
              >
                {/* 1. Sleek Top Bar (Floating, Transparent, Minimal) */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-3 sm:p-5 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none"
                >
                  {/* Left: Info Title Pill */}
                  <div className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-xs font-semibold shadow-2xl">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span className="max-w-[160px] sm:max-w-xs truncate text-white font-display font-bold">
                      {activeLightboxItem.title}
                    </span>
                    {filteredItems.length > 1 && currentIndex !== -1 && (
                      <span className="text-amber-300/80 font-mono text-[11px] border-l border-white/10 pl-2">
                        {currentIndex + 1} / {filteredItems.length}
                      </span>
                    )}
                  </div>

                  {/* Right: Zoom & Action Toolbar */}
                  <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
                    {/* Zoom In / Out / Reset Group */}
                    <div className="flex items-center gap-0.5 sm:gap-1 bg-black/70 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-2xl">
                      <button
                        type="button"
                        onClick={handleZoomOut}
                        disabled={zoomLevel <= 1}
                        className="p-1.5 rounded-full text-rose-200/80 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 cursor-pointer"
                        title="Zoom Out (-)"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={handleResetZoom}
                        className="px-2 py-0.5 text-[11px] font-mono text-amber-300 font-bold hover:text-white transition-colors cursor-pointer"
                        title="Click to reset zoom (0)"
                      >
                        {Math.round(zoomLevel * 100)}%
                      </button>

                      <button
                        type="button"
                        onClick={handleZoomIn}
                        disabled={zoomLevel >= 4}
                        className="p-1.5 rounded-full text-rose-200/80 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 cursor-pointer"
                        title="Zoom In (+)"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>

                      {zoomLevel > 1 && (
                        <button
                          type="button"
                          onClick={handleResetZoom}
                          className="p-1.5 rounded-full text-amber-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer border-l border-white/10 pl-1.5 ml-0.5"
                          title="Reset 100% Zoom"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Toggle Info Overlay */}
                    <button
                      type="button"
                      onClick={() => setShowInfo((prev) => !prev)}
                      className={`p-2 rounded-full border backdrop-blur-md transition-all cursor-pointer shadow-2xl ${
                        showInfo
                          ? 'bg-amber-950/80 border-amber-400/50 text-amber-300'
                          : 'bg-black/70 border-white/10 text-rose-200/60 hover:text-white'
                      }`}
                      title="Toggle Description Info (I)"
                    >
                      <Info className="w-4 h-4" />
                    </button>

                    {/* Open Original Full Resolution File */}
                    <a
                      href={activeLightboxItem.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-black/70 backdrop-blur-md text-rose-200/80 hover:text-white hover:bg-amber-600 transition-colors cursor-pointer shadow-2xl border border-white/10"
                      title="Open Original Image in New Tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    {/* Close Lightbox */}
                    <button
                      type="button"
                      onClick={handleCloseLightbox}
                      className="p-2 rounded-full bg-red-950/90 text-rose-200 hover:text-white hover:bg-red-600 transition-all cursor-pointer shadow-2xl border border-red-500/40 hover:scale-105 active:scale-95"
                      title="Close (Esc)"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 2. Main Full Resolution Picture Canvas */}
                <div
                  onClick={(e) => {
                    // Click on canvas (outside image) closes
                    if (e.target === e.currentTarget && zoomLevel === 1) {
                      handleCloseLightbox();
                    }
                  }}
                  className="relative w-full h-full flex items-center justify-center overflow-hidden p-2 sm:p-6"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={{
                    cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
                  }}
                >
                  <div
                    className="relative flex items-center justify-center transition-transform duration-100 ease-out"
                    style={{
                      transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                      transformOrigin: 'center center',
                    }}
                    onDoubleClick={handleDoubleClick}
                  >
                    {/* Spinner placeholder while loading */}
                    {!isImageLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
                      </div>
                    )}

                    <img
                      key={activeLightboxItem.id}
                      src={activeLightboxItem.imageUrl}
                      alt={activeLightboxItem.title}
                      onLoad={() => setIsImageLoaded(true)}
                      className={`max-w-[96vw] max-h-[86vh] sm:max-h-[90vh] object-contain rounded-lg sm:rounded-xl drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)] transition-opacity duration-300 ${
                        isImageLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      draggable={false}
                    />
                  </div>
                </div>

                {/* 3. Left / Right Navigation Controls */}
                {filteredItems.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevItem}
                      className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-40 p-3 sm:p-3.5 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-rose-100 hover:text-amber-300 hover:border-amber-400/60 transition-all cursor-pointer shadow-2xl border border-white/10 hover:scale-110 active:scale-95"
                      title="Previous Image (Left Arrow / Swipe Right)"
                    >
                      <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
                    </button>

                    <button
                      type="button"
                      onClick={handleNextItem}
                      className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 p-3 sm:p-3.5 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-rose-100 hover:text-amber-300 hover:border-amber-400/60 transition-all cursor-pointer shadow-2xl border border-white/10 hover:scale-110 active:scale-95"
                      title="Next Image (Right Arrow / Swipe Left)"
                    >
                      <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
                    </button>
                  </>
                )}

                {/* 4. Sleek Floating Bottom Caption (Togglable) */}
                <AnimatePresence>
                  {showInfo && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.25 }}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute bottom-4 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-auto sm:max-w-xl mx-auto z-40 p-3.5 sm:p-4 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl text-center"
                    >
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 bg-red-950/80 border border-red-500/30 px-2 py-0.5 rounded-full">
                          {activeCategoryLabel}
                        </span>
                        <h4 className="text-white font-display font-bold text-sm sm:text-base">
                          {activeLightboxItem.title}
                        </h4>
                      </div>

                      <p className="text-rose-200/80 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                        {activeLightboxItem.description}
                      </p>

                      <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5">
                        {activeLightboxItem.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-rose-200/80"
                          >
                            #{tag}
                          </span>
                        ))}
                        <span className="text-[10px] text-amber-400/60 ml-2 hidden sm:inline">
                          Tip: Double-click or scroll to zoom
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </section>
  );
};
