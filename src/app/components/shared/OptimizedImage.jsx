"use client";
import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

const OptimizedImage = ({
  src,
  alt = 'Product image',
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  fill = false,
  sizes,
  style,
  onLoad,
  onError,
  fallbackSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==', // Data URI for placeholder
  ...props
}) => {
  // Validate and normalize src
  const normalizedSrc = src && typeof src === 'string' && src.trim() !== '' 
    ? src.trim() 
    : fallbackSrc;
  
  const normalizedAlt = alt && typeof alt === 'string' && alt.trim() !== ''
    ? alt.trim()
    : 'Product image';

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(normalizedSrc);
  const [generatedBlurDataURL, setGeneratedBlurDataURL] = useState(blurDataURL || null);
  
  // Update currentSrc when src prop changes
  useEffect(() => {
    const newSrc = src && typeof src === 'string' && src.trim() !== '' 
      ? src.trim() 
      : fallbackSrc;
    setCurrentSrc(newSrc);
    setHasError(false);
    setIsLoading(true);
  }, [src, fallbackSrc]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
    onError?.();
  }, [currentSrc, fallbackSrc, onError]);

  // Generate blur data URL if not provided (only on client side)
  useEffect(() => {
    if (blurDataURL || typeof document === 'undefined') return;
    
    const generateBlurDataURL = (w, h) => {
      try {
        // Create a simple neutral blur placeholder (no blue gradient)
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        
        // Create a fully transparent placeholder - no background color at all
        // Just return a transparent data URL
        ctx.clearRect(0, 0, w, h);
        
        // Return transparent PNG data URL
        return canvas.toDataURL('image/png');
      } catch (error) {
        console.error('Error generating blur data URL:', error);
        return null;
      }
    };

    const generated = generateBlurDataURL(width || 400, height || 400);
    if (generated) {
      setGeneratedBlurDataURL(generated);
    }
  }, [blurDataURL, width, height]);

  const defaultBlurDataURL = blurDataURL || generatedBlurDataURL;
  // Only use blur placeholder if we have a blurDataURL
  const imagePlaceholder = defaultBlurDataURL ? placeholder : undefined;

  // Check if src is a data URI or external URL that Next.js Image doesn't support
  const isDataURI = currentSrc && currentSrc.startsWith('data:');
  const isEmpty = !currentSrc || currentSrc.trim() === '';
  
  // Don't render if we don't have a valid src
  if (isEmpty || (hasError && isDataURI)) {
    return (
      <div className={`relative overflow-hidden bg-transparent flex items-center justify-center ${className}`} style={{ width: width || 400, height: height || 400, ...style }}>
        <div className="text-center text-gray-500">
          <div className="w-12 h-12 mx-auto mb-2 bg-transparent rounded flex items-center justify-center">
            <span className="text-xs">No Image</span>
          </div>
          <p className="text-xs">Image unavailable</p>
        </div>
      </div>
    );
  }
  
  // For data URIs, use regular img tag instead of Next.js Image
  if (isDataURI) {
    return (
      <div className={`relative overflow-hidden ${className}`} style={style}>
        <img
          src={currentSrc}
          alt={normalizedAlt}
          width={width || 400}
          height={height || 400}
          className={`transition-all duration-300 ${
            isLoading ? 'opacity-0 blur-md' : 'opacity-100 blur-0'
          } ${className}`}
          style={{ 
            filter: isLoading ? 'blur(8px)' : 'blur(0px)',
            ...style 
          }}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden bg-transparent ${className}`} 
      style={{
        filter: isLoading ? 'blur(8px)' : 'blur(0px)',
        transition: 'filter 0.3s ease-in-out',
        backgroundColor: 'transparent',
        ...style
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent z-10">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}
      
      <Image
        src={currentSrc}
        alt={normalizedAlt}
        width={fill ? undefined : (width || 400)}
        height={fill ? undefined : (height || 400)}
        fill={fill}
        className={`transition-opacity duration-300 bg-transparent ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${hasError ? 'object-cover' : ''}`}
        style={{ backgroundColor: 'transparent' }}
        priority={priority}
        quality={quality}
        {...(imagePlaceholder && defaultBlurDataURL ? {
          placeholder: imagePlaceholder,
          blurDataURL: defaultBlurDataURL,
        } : {})}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
      
      {hasError && currentSrc === fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent">
          <div className="text-center text-gray-500">
            <div className="w-12 h-12 mx-auto mb-2 bg-transparent rounded flex items-center justify-center">
              <span className="text-xs">No Image</span>
            </div>
            <p className="text-xs">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
