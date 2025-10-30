"use client";
import React, { Suspense } from 'react';
import { SearchProvider } from '../../context/SearchContext';
import { NavbarSkeleton } from '../shared/LoadingSkeletons';

export default function SearchProviderWrapper({ children }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <NavbarSkeleton />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B4866] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <SearchProvider>
        {children}
      </SearchProvider>
    </Suspense>
  );
}
