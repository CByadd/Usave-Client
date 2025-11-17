"use client";
import React from 'react';

// ProductCardSkeleton component - defined first so it can be used in ProductGridSkeleton
export const ProductCardSkeleton = ({ variant = 'grid' }) => {
  if (variant === 'carousel') {
    return (
      <div className="group min-w-[85vw] sm:min-w-[calc(50%-0.75rem)] md:min-w-0 w-[85vw] sm:w-[45vw] md:w-[28dvw] snap-center relative transition flex flex-col items-center overflow-visible rounded-b-4xl mb-5 max-h-[400px] animate-pulse">
        <div className="w-full flex items-center justify-center flex-col relative">
          {/* Image Section for carousel */}
          <div className="relative flex aspect-[4/3] items-center justify-center w-full rounded-2xl cursor-pointer overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 p-6">
            {/* Wishlist button skeleton */}
            <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-gray-200"></div>
            
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="flex h-full w-full items-center justify-center rounded-[24px] bg-white/70">
                <div className="h-full w-full bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick View Button skeleton */}
        <div className="w-[80%] sm:w-[70%] mt-3 mb-4 h-[44px] sm:h-[50px] bg-gray-200 rounded-4xl"></div>

        {/* Product Info */}
        <div className="w-full bg-white flex flex-col flex-1">
          <div className="p-3 flex flex-col flex-1">
            {/* Title skeleton */}
            <div className="mt-3 mb-2">
              <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>

            {/* Price section skeleton */}
            <div className="mt-1 flex items-center gap-2 text-sm">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-5 bg-gray-200 rounded w-20"></div>
            </div>

            {/* Ratings skeleton */}
            <div className="mt-1 flex items-center gap-1 text-yellow-500 text-sm">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-3 h-3 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="h-3 bg-gray-200 rounded w-12 ml-1"></div>
            </div>

            {/* Stock Status skeleton */}
            <div className="mt-2 flex items-center gap-2 flex-shrink-0">
              <div className="h-2 w-2 rounded-full bg-gray-200"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>

          {/* Buttons skeleton */}
          <div className="flex gap-2 sm:gap-3 mt-auto flex-col sm:flex-row flex-shrink-0 p-3">
            <div className="flex-1 h-10 sm:h-12 bg-gray-200 rounded-4xl"></div>
            <div className="flex-1 h-10 sm:h-12 bg-gray-200 rounded-4xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full w-full animate-pulse">
      {/* Image Container */}
      <div className="relative flex aspect-[4/3] items-center justify-center w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 p-6">
        <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-gray-200"></div>
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="flex h-full w-full items-center justify-center rounded-[24px] bg-white/70">
            <div className="h-full w-full bg-gray-200 rounded-lg"></div>
          </div>
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-gray-200 rounded-md"></div>
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-2">
          <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-6 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="flex items-center gap-1 mb-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-3 h-3 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-3 bg-gray-200 rounded w-12 ml-1"></div>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-2 w-2 rounded-full bg-gray-200"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="flex gap-2 mt-auto">
          <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
          <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton = ({ count = 12 }) => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Mobile: horizontal carousel skeleton */}
        <div className="md:hidden -mx-4 mb-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide">
          {Array.from({ length: Math.min(count, 3) }).map((_, index) => (
            <div key={`mobile-${index}`} className="min-w-[80%] snap-center">
              <ProductCardSkeleton variant="carousel" />
            </div>
          ))}
        </div>

        {/* Desktop and tablet grid skeleton */}
        <div className="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: count }).map((_, index) => (
            <ProductCardSkeleton key={index} variant="grid" />
          ))}
        </div>
      </div>
    </div>
  );
};
