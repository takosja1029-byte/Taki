import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Sparkles,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Ghost,
  Tag,
} from 'lucide-react';

export interface ImageViewerData {
  src: string;
  alt?: string;
  title?: string;
  caption?: string;
  tags?: string[];
}

interface ImageViewerModalProps {
  isOpen: boolean;
  image: ImageViewerData | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  currentIndex?: number;
  totalImages?: number;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  isOpen,
  image,
  onClose,
  onPrev,
  onNext,
  currentIndex,
  totalImages,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
    }
  }, [isOpen, image]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrev, onNext]);

  if (!isOpen || !image) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.3, 3.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.3, 0.7));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.src;
    link.download = (image.title || 'hu-tao-picture').toLowerCase().replace(/\s+/g, '-') + '.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    typeof document !== 'undefined'
      ? createPortal(
          <AnimatePresence>
            <div
              className="fixed inset-0 z-[99999] flex flex-col items-center justify-between p-3 sm:p-6 bg-black/95 backdrop-blur-2xl overflow-hidden select-none"
              onClick={onClose}
            >
              {/* Top Control Bar */}
              <div
                className="w-full max-w-6xl flex items-center justify-between z-30 py-2 px-4 rounded-2xl bg-[#180a0c]/80 border border-amber-500/30 backdrop-blur-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2">
                  <Ghost className="w-5 h-5 text-amber-400 animate-bounce" />
                  <span className="font-display font-bold text-sm text-amber-200 truncate max-w-xs sm:max-w-md">
                    {image.title || 'Tak Fullsize Picture'}
                  </span>
                  {typeof currentIndex === 'number' && typeof totalImages === 'number' && (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-950 border border-red-500/40 text-rose-200 ml-2">
                      {currentIndex + 1} / {totalImages}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    className="p-2 rounded-xl bg-black/60 text-amber-300 hover:text-white hover:bg-amber-600/80 transition-colors cursor-pointer border border-amber-500/30"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleZoomIn}
                    className="p-2 rounded-xl bg-black/60 text-amber-300 hover:text-white hover:bg-amber-600/80 transition-colors cursor-pointer border border-amber-500/30"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleRotate}
                    className="p-2 rounded-xl bg-black/60 text-amber-300 hover:text-white hover:bg-amber-600/80 transition-colors cursor-pointer border border-amber-500/30"
                    title="Rotate Image"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="p-2 rounded-xl bg-black/60 text-amber-300 hover:text-white hover:bg-amber-600/80 transition-colors cursor-pointer border border-amber-500/30"
                    title="Download Picture"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="p-2 rounded-xl bg-black/60 text-amber-300 hover:text-white hover:bg-amber-600/80 transition-colors cursor-pointer border border-amber-500/30 hidden sm:flex"
                    title="Toggle Fullscreen"
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer shadow-lg ml-2"
                    title="Close Viewer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Fullscreen Image Area */}
              <div
                className="relative w-full flex-1 flex items-center justify-center my-4 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Prev Navigation Button */}
                {onPrev && (
                  <button
                    type="button"
                    onClick={onPrev}
                    className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-4 rounded-full bg-black/80 text-amber-300 hover:text-white hover:bg-amber-600 transition-all cursor-pointer shadow-2xl border border-amber-500/40 hover:scale-110"
                    title="Previous Image (Left Arrow)"
                  >
                    <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                  </button>
                )}

                {/* Picture Container */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="relative max-w-full max-h-[82vh] flex items-center justify-center p-2"
                >
                  <img
                    src={image.src}
                    alt={image.alt || image.title || 'Full Picture'}
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      transition: 'transform 0.25s ease-out',
                    }}
                    className="max-w-full max-h-[78vh] object-contain rounded-2xl border-2 border-amber-500/30 shadow-[0_0_50px_rgba(247,127,0,0.3)] cursor-zoom-in"
                    onClick={() => setZoom((prev) => (prev > 1.2 ? 1 : 1.8))}
                  />
                </motion.div>

                {/* Next Navigation Button */}
                {onNext && (
                  <button
                    type="button"
                    onClick={onNext}
                    className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-4 rounded-full bg-black/80 text-amber-300 hover:text-white hover:bg-amber-600 transition-all cursor-pointer shadow-2xl border border-amber-500/40 hover:scale-110"
                    title="Next Image (Right Arrow)"
                  >
                    <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                  </button>
                )}
              </div>

              {/* Bottom Caption Bar */}
              {(image.title || image.caption || (image.tags && image.tags.length > 0)) && (
                <div
                  className="w-full max-w-4xl z-30 p-4 rounded-2xl bg-[#180a0c]/85 border border-amber-500/30 backdrop-blur-md text-center space-y-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {image.title && (
                    <h4 className="font-display font-bold text-lg text-amber-200">
                      {image.title}
                    </h4>
                  )}
                  {image.caption && (
                    <p className="text-xs sm:text-sm text-rose-100/80 max-w-2xl mx-auto">
                      {image.caption}
                    </p>
                  )}
                  {image.tags && image.tags.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                      {image.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-red-950 border border-red-500/30 text-amber-300"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          <span>#{tag}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </AnimatePresence>,
          document.body
        )
      : null
  );
};
