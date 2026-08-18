import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Crop,
  X,
  RotateCw,
  Check,
  RefreshCw,
  Eye,
  Grid,
  Sparkles,
  Maximize2,
  Sliders,
  Layers,
} from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
  title?: string;
  aspectRatioPreset?: number;
}

type AspectPreset = 'free' | 'original' | '1:1' | '16:9' | '4:3' | '3:4';

interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImgRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type DragMode =
  | 'move'
  | 'nw'
  | 'n'
  | 'ne'
  | 'e'
  | 'se'
  | 's'
  | 'sw'
  | 'w'
  | null;

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageUrl,
  onClose,
  onCropComplete,
  title = 'Crop & Refine Image',
  aspectRatioPreset,
}) => {
  const [aspect, setAspect] = useState<AspectPreset>('free');
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const [imgRect, setImgRect] = useState<ImgRect>({ x: 0, y: 0, width: 0, height: 0 });
  const [cropBox, setCropBox] = useState<CropBox>({ x: 0, y: 0, width: 0, height: 0 });
  const [croppedDimensions, setCroppedDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const [dragMode, setDragMode] = useState<DragMode>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    startBox: CropBox;
  }>({
    startX: 0,
    startY: 0,
    startBox: { x: 0, y: 0, width: 0, height: 0 },
  });

  // Calculate Aspect Numeric Ratio
  const getAspectNumeric = useCallback(
    (preset: AspectPreset, effImgAspect: number): number | null => {
      if (preset === 'free') return null;
      if (preset === 'original') return effImgAspect;
      if (preset === '1:1') return 1;
      if (preset === '16:9') return 16 / 9;
      if (preset === '4:3') return 4 / 3;
      if (preset === '3:4') return 3 / 4;
      return null;
    },
    []
  );

  // Calculate Displayed Image Rect inside Container
  const computeImgRect = useCallback(
    (containerW: number, containerH: number, natW: number, natH: number, rot: number): ImgRect => {
      if (!containerW || !containerH || !natW || !natH) {
        return { x: 0, y: 0, width: 0, height: 0 };
      }

      const effW = rot === 90 || rot === 270 ? natH : natW;
      const effH = rot === 90 || rot === 270 ? natW : natH;

      const padding = 24;
      const availW = Math.max(80, containerW - padding * 2);
      const availH = Math.max(80, containerH - padding * 2);

      const imgAspect = effW / effH;
      const availAspect = availW / availH;

      let renderW = availW;
      let renderH = availH;

      if (imgAspect > availAspect) {
        renderH = availW / imgAspect;
      } else {
        renderW = availH * imgAspect;
      }

      const renderX = (containerW - renderW) / 2;
      const renderY = (containerH - renderH) / 2;

      return { x: renderX, y: renderY, width: renderW, height: renderH };
    },
    []
  );

  // Calculate Default Crop Box
  const computeDefaultCropBox = useCallback(
    (rect: ImgRect, preset: AspectPreset, natW: number, natH: number, rot: number): CropBox => {
      if (!rect.width || !rect.height) {
        return { x: 0, y: 0, width: 100, height: 100 };
      }

      const effW = rot === 90 || rot === 270 ? natH : natW;
      const effH = rot === 90 || rot === 270 ? natW : natH;
      const effImgAspect = effW / effH;

      const targetRatio = getAspectNumeric(preset, effImgAspect);

      if (targetRatio === null) {
        const boxW = rect.width * 0.85;
        const boxH = rect.height * 0.85;
        return {
          x: rect.x + (rect.width - boxW) / 2,
          y: rect.y + (rect.height - boxH) / 2,
          width: boxW,
          height: boxH,
        };
      }

      const rectAspect = rect.width / rect.height;
      let boxW = rect.width * 0.85;
      let boxH = rect.height * 0.85;

      if (targetRatio > rectAspect) {
        boxW = rect.width * 0.85;
        boxH = boxW / targetRatio;
        if (boxH > rect.height * 0.85) {
          boxH = rect.height * 0.85;
          boxW = boxH * targetRatio;
        }
      } else {
        boxH = rect.height * 0.85;
        boxW = boxH * targetRatio;
        if (boxW > rect.width * 0.85) {
          boxW = rect.width * 0.85;
          boxH = boxW / targetRatio;
        }
      }

      return {
        x: rect.x + (rect.width - boxW) / 2,
        y: rect.y + (rect.height - boxH) / 2,
        width: boxW,
        height: boxH,
      };
    },
    [getAspectNumeric]
  );

  // Reset or initialize modal state
  useEffect(() => {
    if (isOpen) {
      setRotation(0);
      setImageLoaded(false);
      setShowGrid(true);

      if (aspectRatioPreset) {
        if (Math.abs(aspectRatioPreset - 1) < 0.05) setAspect('1:1');
        else if (Math.abs(aspectRatioPreset - 16 / 9) < 0.05) setAspect('16:9');
        else if (Math.abs(aspectRatioPreset - 4 / 3) < 0.05) setAspect('4:3');
        else if (Math.abs(aspectRatioPreset - 3 / 4) < 0.05) setAspect('3:4');
        else setAspect('free');
      } else {
        setAspect('free');
      }
    }
  }, [isOpen, imageUrl, aspectRatioPreset]);

  // Recalculate dimensions on image load or container resize
  const setupLayout = useCallback(() => {
    if (!containerRef.current || !naturalSize.width) return;
    const container = containerRef.current;
    const rect = computeImgRect(
      container.clientWidth,
      container.clientHeight,
      naturalSize.width,
      naturalSize.height,
      rotation
    );
    setImgRect(rect);

    const initialBox = computeDefaultCropBox(
      rect,
      aspect,
      naturalSize.width,
      naturalSize.height,
      rotation
    );
    setCropBox(initialBox);
  }, [naturalSize, rotation, aspect, computeImgRect, computeDefaultCropBox]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    setImageLoaded(true);
  };

  useEffect(() => {
    if (imageLoaded) {
      setupLayout();
    }
  }, [imageLoaded, setupLayout]);

  // Handle Container Resize with ResizeObserver
  useEffect(() => {
    if (!containerRef.current || !imageLoaded) return;
    const container = containerRef.current;

    const observer = new ResizeObserver(() => {
      const rect = computeImgRect(
        container.clientWidth,
        container.clientHeight,
        naturalSize.width,
        naturalSize.height,
        rotation
      );
      setImgRect(rect);
      setCropBox((prev) => {
        if (!prev.width) return computeDefaultCropBox(rect, aspect, naturalSize.width, naturalSize.height, rotation);
        // Constrain existing cropBox within new imgRect
        const w = Math.min(prev.width, rect.width);
        const h = Math.min(prev.height, rect.height);
        const x = Math.max(rect.x, Math.min(prev.x, rect.x + rect.width - w));
        const y = Math.max(rect.y, Math.min(prev.y, rect.y + rect.height - h));
        return { x, y, width: w, height: h };
      });
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [imageLoaded, naturalSize, rotation, aspect, computeImgRect, computeDefaultCropBox]);

  // Handle Preset Changes
  const handleAspectChange = (preset: AspectPreset) => {
    setAspect(preset);
    if (imgRect.width) {
      const newBox = computeDefaultCropBox(
        imgRect,
        preset,
        naturalSize.width,
        naturalSize.height,
        rotation
      );
      setCropBox(newBox);
    }
  };

  // Handle Rotate
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Handle Reset
  const handleReset = () => {
    setRotation(0);
    setAspect('free');
    if (containerRef.current && naturalSize.width) {
      const container = containerRef.current;
      const rect = computeImgRect(
        container.clientWidth,
        container.clientHeight,
        naturalSize.width,
        naturalSize.height,
        0
      );
      setImgRect(rect);
      setCropBox(computeDefaultCropBox(rect, 'free', naturalSize.width, naturalSize.height, 0));
    }
  };

  // Live Canvas Preview Generator
  const updateLivePreview = useCallback(() => {
    if (!previewCanvasRef.current || !imageRef.current || !imgRect.width || !cropBox.width) return;

    const img = imageRef.current;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const effW = rotation === 90 || rotation === 270 ? naturalSize.height : naturalSize.width;
    const effH = rotation === 90 || rotation === 270 ? naturalSize.width : naturalSize.height;

    const relX = Math.max(0, (cropBox.x - imgRect.x) / imgRect.width);
    const relY = Math.max(0, (cropBox.y - imgRect.y) / imgRect.height);
    const relW = Math.min(1 - relX, cropBox.width / imgRect.width);
    const relH = Math.min(1 - relY, cropBox.height / imgRect.height);

    const srcX = relX * effW;
    const srcY = relY * effH;
    const srcW = relW * effW;
    const srcH = relH * effH;

    const displayMax = 220;
    let targetW = srcW;
    let targetH = srcH;
    if (targetW > displayMax || targetH > displayMax) {
      if (targetW > targetH) {
        targetH = (displayMax * targetH) / targetW;
        targetW = displayMax;
      } else {
        targetW = (displayMax * targetW) / targetH;
        targetH = displayMax;
      }
    }

    canvas.width = Math.max(1, Math.round(targetW));
    canvas.height = Math.max(1, Math.round(targetH));

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (rotation === 0) {
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height);
    } else {
      const rotCanvas = document.createElement('canvas');
      rotCanvas.width = effW;
      rotCanvas.height = effH;
      const rotCtx = rotCanvas.getContext('2d');
      if (rotCtx) {
        rotCtx.translate(effW / 2, effH / 2);
        rotCtx.rotate((rotation * Math.PI) / 180);
        rotCtx.drawImage(img, -naturalSize.width / 2, -naturalSize.height / 2);
        ctx.drawImage(rotCanvas, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height);
      }
    }

    setCroppedDimensions({
      width: Math.round(srcW),
      height: Math.round(srcH),
    });
  }, [cropBox, imgRect, rotation, naturalSize]);

  useEffect(() => {
    if (imageLoaded) {
      updateLivePreview();
    }
  }, [cropBox, imgRect, rotation, imageLoaded, updateLivePreview]);

  // Pointer Dragging for Crop Box & Handles
  const handlePointerDown = (e: React.PointerEvent, mode: DragMode) => {
    e.preventDefault();
    e.stopPropagation();

    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setDragMode(mode);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startBox: { ...cropBox },
    };
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragMode) return;

      const deltaX = e.clientX - dragStartRef.current.startX;
      const deltaY = e.clientY - dragStartRef.current.startY;
      const startBox = dragStartRef.current.startBox;

      const effW = rotation === 90 || rotation === 270 ? naturalSize.height : naturalSize.width;
      const effH = rotation === 90 || rotation === 270 ? naturalSize.width : naturalSize.height;
      const targetRatio = getAspectNumeric(aspect, effW / effH);

      const MIN_SIZE = 36;

      if (dragMode === 'move') {
        let newX = startBox.x + deltaX;
        let newY = startBox.y + deltaY;

        newX = Math.max(imgRect.x, Math.min(newX, imgRect.x + imgRect.width - startBox.width));
        newY = Math.max(imgRect.y, Math.min(newY, imgRect.y + imgRect.height - startBox.height));

        setCropBox({
          x: newX,
          y: newY,
          width: startBox.width,
          height: startBox.height,
        });
        return;
      }

      let newX = startBox.x;
      let newY = startBox.y;
      let newW = startBox.width;
      let newH = startBox.height;

      if (targetRatio === null) {
        // Freeform resizing
        if (dragMode.includes('e')) {
          newW = Math.max(MIN_SIZE, Math.min(startBox.width + deltaX, imgRect.x + imgRect.width - startBox.x));
        }
        if (dragMode.includes('s')) {
          newH = Math.max(MIN_SIZE, Math.min(startBox.height + deltaY, imgRect.y + imgRect.height - startBox.y));
        }
        if (dragMode.includes('w')) {
          const maxLeftShift = startBox.x - imgRect.x;
          const leftShift = Math.min(maxLeftShift, Math.max(deltaX, -(startBox.width - MIN_SIZE)));
          newX = startBox.x + leftShift;
          newW = startBox.width - leftShift;
        }
        if (dragMode.includes('n')) {
          const maxTopShift = startBox.y - imgRect.y;
          const topShift = Math.min(maxTopShift, Math.max(deltaY, -(startBox.height - MIN_SIZE)));
          newY = startBox.y + topShift;
          newH = startBox.height - topShift;
        }
      } else {
        // Aspect Ratio Preserved Resizing
        if (dragMode === 'se') {
          newW = Math.max(MIN_SIZE, startBox.width + deltaX);
          newH = newW / targetRatio;
          if (startBox.x + newW > imgRect.x + imgRect.width) {
            newW = imgRect.x + imgRect.width - startBox.x;
            newH = newW / targetRatio;
          }
          if (startBox.y + newH > imgRect.y + imgRect.height) {
            newH = imgRect.y + imgRect.height - startBox.y;
            newW = newH * targetRatio;
          }
        } else if (dragMode === 'sw') {
          newW = Math.max(MIN_SIZE, startBox.width - deltaX);
          newH = newW / targetRatio;
          let leftShift = startBox.width - newW;
          if (startBox.x + leftShift < imgRect.x) {
            leftShift = imgRect.x - startBox.x;
            newW = startBox.width - leftShift;
            newH = newW / targetRatio;
          }
          if (startBox.y + newH > imgRect.y + imgRect.height) {
            newH = imgRect.y + imgRect.height - startBox.y;
            newW = newH * targetRatio;
            leftShift = startBox.width - newW;
          }
          newX = startBox.x + leftShift;
        } else if (dragMode === 'ne') {
          newW = Math.max(MIN_SIZE, startBox.width + deltaX);
          newH = newW / targetRatio;
          if (startBox.x + newW > imgRect.x + imgRect.width) {
            newW = imgRect.x + imgRect.width - startBox.x;
            newH = newW / targetRatio;
          }
          let topShift = startBox.height - newH;
          if (startBox.y + topShift < imgRect.y) {
            topShift = imgRect.y - startBox.y;
            newH = startBox.height - topShift;
            newW = newH * targetRatio;
          }
          newY = startBox.y + topShift;
        } else if (dragMode === 'nw') {
          newW = Math.max(MIN_SIZE, startBox.width - deltaX);
          newH = newW / targetRatio;
          let leftShift = startBox.width - newW;
          let topShift = startBox.height - newH;
          if (startBox.x + leftShift < imgRect.x) {
            leftShift = imgRect.x - startBox.x;
            newW = startBox.width - leftShift;
            newH = newW / targetRatio;
            topShift = startBox.height - newH;
          }
          if (startBox.y + topShift < imgRect.y) {
            topShift = imgRect.y - startBox.y;
            newH = startBox.height - topShift;
            newW = newH * targetRatio;
            leftShift = startBox.width - newW;
          }
          newX = startBox.x + leftShift;
          newY = startBox.y + topShift;
        } else if (dragMode === 'e' || dragMode === 'w') {
          const scaleSign = dragMode === 'e' ? 1 : -1;
          newW = Math.max(MIN_SIZE, startBox.width + deltaX * scaleSign);
          newH = newW / targetRatio;
          if (dragMode === 'w') {
            newX = startBox.x + (startBox.width - newW);
          }
          if (newY + newH > imgRect.y + imgRect.height) {
            newH = imgRect.y + imgRect.height - newY;
            newW = newH * targetRatio;
            if (dragMode === 'w') newX = startBox.x + (startBox.width - newW);
          }
        } else if (dragMode === 'n' || dragMode === 's') {
          const scaleSign = dragMode === 's' ? 1 : -1;
          newH = Math.max(MIN_SIZE, startBox.height + deltaY * scaleSign);
          newW = newH * targetRatio;
          if (dragMode === 'n') {
            newY = startBox.y + (startBox.height - newH);
          }
          if (newX + newW > imgRect.x + imgRect.width) {
            newW = imgRect.x + imgRect.width - newX;
            newH = newW / targetRatio;
            if (dragMode === 'n') newY = startBox.y + (startBox.height - newH);
          }
        }
      }

      setCropBox({
        x: Math.max(imgRect.x, newX),
        y: Math.max(imgRect.y, newY),
        width: Math.max(MIN_SIZE, newW),
        height: Math.max(MIN_SIZE, newH),
      });
    },
    [dragMode, imgRect, rotation, naturalSize, aspect, getAspectNumeric]
  );

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragMode) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignore if pointer capture already released
      }
      setDragMode(null);
    }
  };

  // Perform Final High-Res Crop Execution
  const handleCrop = async () => {
    if (!imageRef.current || !naturalSize.width || !cropBox.width) return;
    setIsProcessing(true);

    try {
      const img = imageRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      const effW = rotation === 90 || rotation === 270 ? naturalSize.height : naturalSize.width;
      const effH = rotation === 90 || rotation === 270 ? naturalSize.width : naturalSize.height;

      const relX = Math.max(0, (cropBox.x - imgRect.x) / imgRect.width);
      const relY = Math.max(0, (cropBox.y - imgRect.y) / imgRect.height);
      const relW = Math.min(1 - relX, cropBox.width / imgRect.width);
      const relH = Math.min(1 - relY, cropBox.height / imgRect.height);

      const srcX = relX * effW;
      const srcY = relY * effH;
      const srcW = relW * effW;
      const srcH = relH * effH;

      canvas.width = Math.max(1, Math.round(srcW));
      canvas.height = Math.max(1, Math.round(srcH));

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (rotation === 0) {
        ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height);
      } else {
        const rotCanvas = document.createElement('canvas');
        rotCanvas.width = effW;
        rotCanvas.height = effH;
        const rotCtx = rotCanvas.getContext('2d');
        if (rotCtx) {
          rotCtx.translate(effW / 2, effH / 2);
          rotCtx.rotate((rotation * Math.PI) / 180);
          rotCtx.drawImage(img, -naturalSize.width / 2, -naturalSize.height / 2);
          ctx.drawImage(rotCanvas, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height);
        }
      }

      let dataUrl = '';
      try {
        dataUrl = canvas.toDataURL('image/png', 0.95);
      } catch (corsErr) {
        console.warn('Canvas export tainted by CORS, using fallback image URL:', corsErr);
        dataUrl = imageUrl;
      }

      onCropComplete(dataUrl);
      setIsProcessing(false);
      onClose();
    } catch (err) {
      console.error('Cropping error:', err);
      setIsProcessing(false);
      onCropComplete(imageUrl);
      onClose();
    }
  };

  if (!isOpen) return null;

  return typeof document !== 'undefined'
    ? createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-xl overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative max-w-4xl w-full glass-card rounded-3xl overflow-hidden border-2 border-amber-500/50 shadow-[0_25px_60px_rgba(0,0,0,0.9)] bg-[#180a0c] my-auto flex flex-col max-h-[92vh]"
            >
              {/* Modal Header */}
              <div className="p-3.5 sm:p-4 border-b border-red-500/30 flex items-center justify-between bg-[#1f0d0f]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-md">
                    <Crop className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-white">
                      {title}
                    </h3>
                    <p className="text-[11px] text-rose-200/70">
                      Drag selection box & handles to crop any side, center, top, or bottom accurately
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowGrid((prev) => !prev)}
                    className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                      showGrid
                        ? 'bg-amber-500/20 border-amber-400/60 text-amber-300'
                        : 'bg-red-950/60 border-red-500/30 text-rose-300'
                    }`}
                    title="Toggle Rule-of-Thirds Grid Overlay"
                  >
                    <Grid className="w-4 h-4" />
                    <span className="hidden sm:inline font-semibold">Grid</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-full bg-black/60 text-amber-300 hover:text-white hover:bg-red-600 transition-colors cursor-pointer border border-amber-500/30"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Workspace (Workspace Canvas + Live Preview Sidebar) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-b border-red-500/20 bg-[#0c0506] overflow-hidden">
                {/* Main Cropper Interactive Viewport */}
                <div
                  ref={containerRef}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className="md:col-span-2 relative h-[320px] sm:h-[400px] bg-[#080304] flex items-center justify-center overflow-hidden select-none border-r border-red-500/20"
                >
                  {/* Subtle Background Pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(#f77f00_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

                  {/* Rendered Source Image */}
                  {imageLoaded && imgRect.width > 0 && (
                    <img
                      ref={imageRef}
                      src={imageUrl}
                      alt="Crop Source"
                      crossOrigin="anonymous"
                      onLoad={handleImageLoad}
                      style={{
                        position: 'absolute',
                        left: `${imgRect.x}px`,
                        top: `${imgRect.y}px`,
                        width: `${imgRect.width}px`,
                        height: `${imgRect.height}px`,
                        transform: `rotate(${rotation}deg)`,
                        transformOrigin: 'center center',
                      }}
                      className="pointer-events-none shadow-2xl object-fill"
                    />
                  )}

                  {/* Hidden Image for Load Event */}
                  {!imageLoaded && (
                    <img
                      src={imageUrl}
                      alt="Hidden Loader"
                      crossOrigin="anonymous"
                      onLoad={handleImageLoad}
                      className="hidden"
                    />
                  )}

                  {/* Dark Translucent Backdrop Overlay outside Crop Box */}
                  {imageLoaded && cropBox.width > 0 && (
                    <div className="absolute inset-0 pointer-events-none z-10">
                      {/* Top Mask */}
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          right: 0,
                          height: `${cropBox.y}px`,
                        }}
                        className="bg-black/75 backdrop-blur-[1px]"
                      />
                      {/* Bottom Mask */}
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: `${cropBox.y + cropBox.height}px`,
                          right: 0,
                          bottom: 0,
                        }}
                        className="bg-black/75 backdrop-blur-[1px]"
                      />
                      {/* Left Mask */}
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: `${cropBox.y}px`,
                          width: `${cropBox.x}px`,
                          height: `${cropBox.height}px`,
                        }}
                        className="bg-black/75 backdrop-blur-[1px]"
                      />
                      {/* Right Mask */}
                      <div
                        style={{
                          position: 'absolute',
                          left: `${cropBox.x + cropBox.width}px`,
                          top: `${cropBox.y}px`,
                          right: 0,
                          height: `${cropBox.height}px`,
                        }}
                        className="bg-black/75 backdrop-blur-[1px]"
                      />
                    </div>
                  )}

                  {/* Interactive Selection Crop Box & Handles */}
                  {imageLoaded && cropBox.width > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        left: `${cropBox.x}px`,
                        top: `${cropBox.y}px`,
                        width: `${cropBox.width}px`,
                        height: `${cropBox.height}px`,
                      }}
                      className="z-20 border-2 border-amber-400 shadow-[0_0_20px_rgba(247,127,0,0.6)] cursor-move group touch-none"
                      onPointerDown={(e) => handlePointerDown(e, 'move')}
                    >
                      {/* Rule-of-Thirds Grid Overlay */}
                      {showGrid && (
                        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
                          <div className="w-full h-1/3 border-b border-amber-300/35" />
                          <div className="w-full h-1/3 border-b border-amber-300/35" />
                          <div className="absolute inset-0 flex justify-between">
                            <div className="w-1/3 h-full border-r border-amber-300/35" />
                            <div className="w-1/3 h-full border-r border-amber-300/35" />
                          </div>
                        </div>
                      )}

                      {/* Corner Bracket Decorations */}
                      <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-300 pointer-events-none" />
                      <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-300 pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-300 pointer-events-none" />
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-300 pointer-events-none" />

                      {/* 8 Draggable Corner & Edge Touch Handles */}
                      {/* Top-Left Handle */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, 'nw')}
                        className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-amber-400 border-2 border-black rounded-full shadow-lg cursor-nwse-resize z-30 flex items-center justify-center hover:scale-125 transition-transform"
                      />
                      {/* Top-Center Handle */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, 'n')}
                        className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-2.5 bg-amber-400 border border-black rounded-full shadow-lg cursor-ns-resize z-30 hover:scale-110 transition-transform"
                      />
                      {/* Top-Right Handle */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, 'ne')}
                        className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-amber-400 border-2 border-black rounded-full shadow-lg cursor-nesw-resize z-30 flex items-center justify-center hover:scale-125 transition-transform"
                      />
                      {/* Right-Center Handle */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, 'e')}
                        className="absolute top-1/2 -right-2 -translate-y-1/2 w-2.5 h-8 bg-amber-400 border border-black rounded-full shadow-lg cursor-ew-resize z-30 hover:scale-110 transition-transform"
                      />
                      {/* Bottom-Right Handle */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, 'se')}
                        className="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-amber-400 border-2 border-black rounded-full shadow-lg cursor-nwse-resize z-30 flex items-center justify-center hover:scale-125 transition-transform"
                      />
                      {/* Bottom-Center Handle */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, 's')}
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-2.5 bg-amber-400 border border-black rounded-full shadow-lg cursor-ns-resize z-30 hover:scale-110 transition-transform"
                      />
                      {/* Bottom-Left Handle */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, 'sw')}
                        className="absolute -bottom-2.5 -left-2.5 w-5 h-5 bg-amber-400 border-2 border-black rounded-full shadow-lg cursor-nesw-resize z-30 flex items-center justify-center hover:scale-125 transition-transform"
                      />
                      {/* Left-Center Handle */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, 'w')}
                        className="absolute top-1/2 -left-2 -translate-y-1/2 w-2.5 h-8 bg-amber-400 border border-black rounded-full shadow-lg cursor-ew-resize z-30 hover:scale-110 transition-transform"
                      />
                    </div>
                  )}

                  {!imageLoaded && (
                    <div className="flex flex-col items-center gap-2 text-rose-200/60">
                      <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                      <span className="text-xs font-semibold">Loading image preview...</span>
                    </div>
                  )}
                </div>

                {/* Live Preview & Resolution Info Sidebar */}
                <div className="p-4 bg-[#140809] flex flex-col items-center justify-between gap-3 border-t md:border-t-0 md:border-l border-red-500/20">
                  <div className="w-full text-center space-y-2">
                    <div className="flex items-center justify-center gap-1.5 text-amber-300 font-display text-xs font-bold uppercase tracking-wider">
                      <Eye className="w-4 h-4 text-amber-400" />
                      <span>Live Crop Preview</span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-[#0c0405] border border-amber-500/30 flex items-center justify-center min-h-[160px] shadow-inner relative overflow-hidden">
                      <canvas
                        ref={previewCanvasRef}
                        className="max-w-full max-h-[180px] object-contain rounded-lg shadow-md border border-amber-400/20"
                      />
                    </div>

                    {/* Output Pixel Resolution Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-rose-200 text-[11px] font-mono font-bold shadow-sm">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>
                        {croppedDimensions.width} × {croppedDimensions.height} px
                      </span>
                    </div>
                  </div>

                  <div className="w-full text-[11px] text-rose-200/60 bg-red-950/40 p-2.5 rounded-xl border border-red-500/20 space-y-1">
                    <p className="flex items-center gap-1 font-semibold text-amber-300">
                      <Maximize2 className="w-3 h-3" /> Tip:
                    </p>
                    <p>Drag box center to reposition. Drag handles to expand/shrink any side accurately.</p>
                  </div>
                </div>
              </div>

              {/* Controls Toolbar & Action Footer */}
              <div className="p-3.5 sm:p-4 bg-[#140809] space-y-3">
                {/* Aspect Ratio Selector Pills */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-200/80">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>Aspect Ratio:</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(['free', 'original', '1:1', '16:9', '4:3', '3:4'] as AspectPreset[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleAspectChange(p)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                          aspect === p
                            ? 'bg-amber-500 text-black shadow-md scale-105'
                            : 'bg-red-950/80 text-rose-200 border border-red-500/30 hover:border-amber-400/50'
                        }`}
                      >
                        {p === 'free' ? 'Free-form' : p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Secondary Action Toolbar & Footer Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-red-500/20 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRotate}
                      className="px-3 py-2 rounded-xl bg-red-950/80 border border-red-500/40 text-rose-200 text-xs font-semibold hover:text-amber-300 hover:border-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Rotate image 90 degrees clockwise"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Rotate ({rotation}°)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-3 py-2 rounded-xl bg-red-950/80 border border-red-500/40 text-rose-200 text-xs font-semibold hover:text-amber-300 hover:border-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Reset crop selection to default"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  </div>

                  {/* Primary Footer Actions: Cancel & Confirm */}
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2 rounded-xl bg-red-950/80 text-rose-200 text-xs font-semibold hover:bg-red-900 border border-red-500/40 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleCrop}
                      disabled={isProcessing || !imageLoaded}
                      className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white font-display text-xs font-bold shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Save & Apply Image</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )
    : null;
};
