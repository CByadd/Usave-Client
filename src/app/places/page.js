"use client";
import React, { Suspense } from 'react';
import ProductListingPage from '../components/product/ProductList';

export default function PlacesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B4866] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ProductListingPage 
        title="Shop by Places"
        subtitle="Explore products organized by rooms and spaces"
      />
    </Suspense>
  );
}

