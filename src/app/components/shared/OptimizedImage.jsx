"use client";
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Loader2, ImageIcon } from 'lucide-react';

// Generate a simple blur placeholder data URL
const generateBlurDataURL = (width = 10, height = 10) => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Create a subtle gray placeholder
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, width, height);
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error generating blur data URL:', error);
    return null;
  }
};

const OptimizedImage = ({
  src,
  alt = 'Product image',
  width,
  height,
  className = '',
  priority = false,
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  fill = false,
  sizes,
  style,
  onLoad,
  onError,
  fallbackSrc,
  loading = 'lazy',
  objectFit = 'cover',
  objectPosition = 'center',
  ...props
}) => {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(!priority);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Start with true if priority
  const [currentSrc, setCurrentSrc] = useState(null);
  const [generatedBlurDataURL, setGeneratedBlurDataURL] = useState(null);

  // Normalize and validate src
  const normalizedSrc = useMemo(() => {
    if (!src || typeof src !== 'string' || src.trim() === '') {
      return fallbackSrc || '/images/placeholder-product.png';
    }
    return src.trim();
  }, [src, fallbackSrc]);

  const normalizedAlt = useMemo(() => {
    if (!alt || typeof alt !== 'string' || alt.trim() === '') {
      return 'Product image';
    }
    return alt.trim();
  }, [alt]);

  // Update currentSrc when normalizedSrc changes
  useEffect(() => {
    setCurrentSrc(normalizedSrc);
    setHasError(false);
    if (!priority) {
      setIsLoading(true);
    }
  }, [normalizedSrc, priority]);

  // Generate blur placeholder if not provided and on client
  useEffect(() => {
    if (blurDataURL || typeof window === 'undefined') return;
    
    const w = width || 400;
    const h = height || 400;
    const generated = generateBlurDataURL(Math.min(w, 10), Math.min(h, 10));
    if (generated) {
      setGeneratedBlurDataURL(generated);
    }
  }, [blurDataURL, width, height]);

  // Intersection Observer for lazy loading (only if not priority)
  useEffect(() => {
    if (priority || isInView || typeof window === 'undefined' || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.01,
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [priority, isInView]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    const fallback = fallbackSrc || '/images/placeholder-product.png';
    if (currentSrc !== fallback) {
      setCurrentSrc(fallback);
    }
    onError?.();
  }, [currentSrc, fallbackSrc, onError]);

  // Determine if we should use Next.js Image or regular img tag
  const isDataURI = currentSrc?.startsWith('data:');
  const isExternalURL = currentSrc?.startsWith('http') && !currentSrc?.includes(process.env.NEXT_PUBLIC_APP_DOMAIN || '');
  
  // Don't render if no valid src
  if (!currentSrc) {
    return (
      <div 
        className={`relative overflow-hidden bg-gray-100 flex items-center justify-center ${className}`} 
        style={{ 
          width: fill ? '100%' : (width || 400), 
          height: fill ? '100%' : (height || 400), 
          ...style 
        }}
        ref={containerRef}
      >
        <div className="text-center text-gray-400">
          <ImageIcon className="w-8 h-8 mx-auto mb-2" />
          <p className="text-xs">No image</p>
        </div>
      </div>
    );
  }

  // Use regular img tag for data URIs or if lazy loading not supported
  if (isDataURI || (isExternalURL && !priority)) {
    return (
      <div 
        className={`relative overflow-hidden ${className}`} 
        style={style}
        ref={containerRef}
      >
        {!isInView && !priority && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
        )}
        <img
          src={isInView || priority ? currentSrc : undefined}
          alt={normalizedAlt}
          width={fill ? undefined : (width || 400)}
          height={fill ? undefined : (height || 400)}
          loading={loading}
          className={`transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          } ${hasError ? 'object-cover' : ''} ${className}`}
          style={{
            objectFit,
            objectPosition,
            width: fill ? '100%' : undefined,
            height: fill ? '100%' : undefined,
            ...style
          }}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        )}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center text-gray-400">
              <ImageIcon className="w-8 h-8 mx-auto mb-2" />
              <p className="text-xs">Failed to load</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default sizes for responsive images if not provided
  const defaultSizes = sizes || (fill ? '100vw' : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw');
  
  const finalBlurDataURL = blurDataURL || generatedBlurDataURL;
  const shouldUseBlur = placeholder === 'blur' && finalBlurDataURL;

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`} 
      style={{
        width: fill ? '100%' : (width || 400),
        height: fill ? '100%' : (height || 400),
        backgroundColor: isLoading ? '#f3f4f6' : 'transparent',
        ...style
      }}
    >
      {!isInView && !priority && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      
      {(isInView || priority) && (
        <>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          )}
          
          <Image
            src={currentSrc}
            alt={normalizedAlt}
            width={fill ? undefined : (width || 400)}
            height={fill ? undefined : (height || 400)}
            fill={fill}
            className={`transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            style={{
              objectFit,
              objectPosition,
            }}
            priority={priority}
            quality={quality}
            loading={priority ? undefined : loading}
            sizes={defaultSizes}
            {...(shouldUseBlur ? {
              placeholder: 'blur',
              blurDataURL: finalBlurDataURL,
            } : {})}
            onLoad={handleLoad}
            onError={handleError}
            {...props}
          />
        </>
      )}
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-400">
            <ImageIcon className="w-8 h-8 mx-auto mb-2" />
            <p className="text-xs">Failed to load</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
