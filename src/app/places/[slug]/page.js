"use client";
import React, { Suspense, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import ProductListingPage from '../../components/product/ProductList';

function PlacePageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params?.slug || '';
  
  // Convert slug to place name (e.g., "living-room" -> "Living Room")
  const placeName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Convert slug to place parameter (e.g., "living-room" -> "living", "bedroom" -> "bedroom", "office" -> "office")
  const placeParam = slug
    .replace('-room', '')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '');

  useEffect(() => {
    // If there's no place param in search params, add it
    if (!searchParams?.get('place')) {
      const newSearchParams = new URLSearchParams(searchParams?.toString() || '');
      newSearchParams.set('place', placeParam);
      router.replace(`/places/${slug}?${newSearchParams.toString()}`);
    }
  }, [slug, placeParam, searchParams, router]);

  return (
    <ProductListingPage 
      title={`Products for ${placeName}`}
      subtitle={`Explore products for ${placeName}`}
    />
  );
}

export default function PlacePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B4866] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PlacePageContent />
    </Suspense>
  );
}

