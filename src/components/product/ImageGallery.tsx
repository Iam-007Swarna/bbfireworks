"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface ImageGalleryProps {
  images: { id: string }[];
  productName: string;
  inStock: boolean;
}

export function ImageGallery({ images, productName, inStock }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setZoomLevel(1); // Reset zoom when changing images
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setZoomLevel(1); // Reset zoom when changing images
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setZoomLevel(1);
  };

  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 0.5));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Preload adjacent images
  useEffect(() => {
    if (images.length <= 1) return;

    const nextIndex = (currentIndex + 1) % images.length;
    const prevIndex = (currentIndex - 1 + images.length) % images.length;

    // Preload next and previous images
    const preloadNext = new Image();
    const preloadPrev = new Image();
    preloadNext.src = `/api/images/${images[nextIndex].id}`;
    preloadPrev.src = `/api/images/${images[prevIndex].id}`;
  }, [currentIndex, images]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "+" || e.key === "=") {
        zoomIn();
      } else if (e.key === "-" || e.key === "_") {
        zoomOut();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLightboxOpen, currentIndex, images.length, zoomLevel]);

  if (images.length === 0) {
    return (
      <div className="h-96 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <span className="text-gray-400">No images available</span>
      </div>
    );
  }

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <>
      {/* Main Gallery */}
      <div className="space-y-3">
        {/* Main Image */}
        <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden group">
          <button
            onClick={() => openLightbox(currentIndex)}
            className="w-full h-full cursor-zoom-in"
            aria-label="Click to enlarge image"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/images/${images[currentIndex].id}`}
              alt={`${productName} - Image ${currentIndex + 1}`}
              className={`w-full h-full object-contain ${inStock ? "" : "grayscale"}`}
            />
          </button>

          {/* Navigation arrows - only show if multiple images */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* Click to enlarge hint */}
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <ZoomIn size={14} />
            Click to enlarge
          </div>
        </div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, index) => (
              <button
                key={img.id}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-400"
                }`}
                aria-label={`View image ${index + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/images/${img.id}`}
                  alt={`${productName} thumbnail ${index + 1}`}
                  className={`w-full h-full object-cover ${inStock ? "" : "grayscale"}`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Top Controls */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              className="text-white hover:text-gray-300 w-10 h-10 flex items-center justify-center bg-black/50 rounded"
              aria-label="Toggle fullscreen"
              title="Fullscreen (F)"
            >
              <Maximize2 size={20} />
            </button>
            <button
              onClick={closeLightbox}
              className="text-white hover:text-gray-300 w-10 h-10 flex items-center justify-center bg-black/50 rounded"
              aria-label="Close lightbox"
              title="Close (ESC)"
            >
              <X size={24} />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                zoomIn();
              }}
              className="text-white hover:text-gray-300 w-10 h-10 flex items-center justify-center bg-black/50 rounded"
              aria-label="Zoom in"
              title="Zoom In (+)"
              disabled={zoomLevel >= 3}
            >
              <ZoomIn size={20} />
            </button>
            <div className="text-white text-xs text-center bg-black/50 rounded px-2 py-1">
              {Math.round(zoomLevel * 100)}%
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                zoomOut();
              }}
              className="text-white hover:text-gray-300 w-10 h-10 flex items-center justify-center bg-black/50 rounded"
              aria-label="Zoom out"
              title="Zoom Out (-)"
              disabled={zoomLevel <= 0.5}
            >
              <ZoomOut size={20} />
            </button>
          </div>

          {/* Lightbox Image with Zoom */}
          <div
            className="relative overflow-auto max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/images/${images[currentIndex].id}`}
              alt={`${productName} - Image ${currentIndex + 1}`}
              className="w-auto h-auto object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
            />

            {/* Navigation in lightbox */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full w-12 h-12 flex items-center justify-center"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full w-12 h-12 flex items-center justify-center"
                  aria-label="Next image"
                >
                  <ChevronRight size={32} />
                </button>

                {/* Counter in lightbox */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-2 rounded">
                  {currentIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Keyboard hint */}
          <div className="absolute bottom-4 right-4 text-white/70 text-xs bg-black/50 px-3 py-2 rounded">
            <div className="flex gap-4">
              <span>ESC: Close</span>
              <span>←→: Navigate</span>
              <span>+−: Zoom</span>
              <span>F: Fullscreen</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
