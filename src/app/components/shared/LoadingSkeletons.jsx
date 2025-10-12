"use client";
import React from 'react';

// Base skeleton component
const Skeleton = ({ className = "", ...props }) => (
  <div
    className={`animate-pulse bg-gray-200 rounded ${className}`}
    {...props}
  />
);

// Product card skeleton
export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <Skeleton className="h-48 w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  </div>
);

// Product grid skeleton
export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

// Product detail skeleton
export const ProductDetailSkeleton = () => (
  <div className="min-h-screen bg-white">
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-2" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-2" />
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image skeleton */}
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="w-20 h-20 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Product info skeleton */}
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <div className="flex items-center gap-4 mb-4">
              <div className="flex space-x-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="w-5 h-5 rounded" />
                ))}
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>

          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-4 w-full" />
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-12" />
            <Skeleton className="h-12 w-12" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Search page skeleton
export const SearchPageSkeleton = () => (
  <div className="min-h-screen bg-white">
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters skeleton */}
        <div className="lg:w-64 space-y-6">
          <div>
            <Skeleton className="h-6 w-20 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results skeleton */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-32" />
          </div>
          <ProductGridSkeleton count={12} />
        </div>
      </div>
    </div>
  </div>
);

// Category page skeleton
export const CategoryPageSkeleton = () => (
  <div className="min-h-screen bg-white">
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Category header skeleton */}
      <div className="mb-8">
        <Skeleton className="h-12 w-64 mb-4" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Filters and results */}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-64 space-y-6">
          <div>
            <Skeleton className="h-6 w-20 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-32" />
          </div>
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    </div>
  </div>
);

// Landing page skeleton
export const LandingPageSkeleton = () => (
  <div className="min-h-screen bg-white">
    {/* Hero section skeleton */}
    <div className="relative h-96 bg-gray-100">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-96 mx-auto" />
          <Skeleton className="h-6 w-64 mx-auto" />
          <Skeleton className="h-10 w-32 mx-auto" />
        </div>
      </div>
    </div>

    {/* Categories skeleton */}
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Skeleton className="h-8 w-48 mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="text-center space-y-3">
            <Skeleton className="h-24 w-24 mx-auto rounded-lg" />
            <Skeleton className="h-4 w-16 mx-auto" />
          </div>
        ))}
      </div>
    </div>

    {/* Featured products skeleton */}
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Skeleton className="h-8 w-48 mb-8" />
      <ProductGridSkeleton count={8} />
    </div>
  </div>
);

// Checkout page skeleton
export const CheckoutPageSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Skeleton className="h-8 w-32 mb-8" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout form skeleton */}
        <div className="space-y-6">
          <div>
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Order summary skeleton */}
        <div className="bg-white p-6 rounded-lg shadow">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Skeleton className="h-16 w-16 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
          <div className="border-t pt-4 mt-4 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-10" />
            </div>
            <div className="flex justify-between font-bold">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Navbar skeleton
export const NavbarSkeleton = () => (
  <header className="top-0 z-50 w-full bg-white shadow-sm">
    <div className="mx-auto flex h-[70px] w-[90%] items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-6 w-[60%]">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-10 w-64" />
      </div>
      <div className="hidden md:flex gap-4 items-center">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-16" />
        ))}
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-6" />
      </div>
    </div>
  </header>
);

// Page wrapper skeleton
export const PageSkeleton = ({ type = "default" }) => {
  switch (type) {
    case "product-detail":
      return <ProductDetailSkeleton />;
    case "search":
      return <SearchPageSkeleton />;
    case "category":
      return <CategoryPageSkeleton />;
    case "landing":
      return <LandingPageSkeleton />;
    case "checkout":
      return <CheckoutPageSkeleton />;
    default:
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center space-y-4">
            <Skeleton className="h-12 w-12 mx-auto rounded-full" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        </div>
      );
  }
};

export default Skeleton;




