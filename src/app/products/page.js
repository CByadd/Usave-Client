"use client";
import React, { Suspense } from 'react';
import ProductListingPage from '../components/product/ProductList';
import { ProductGridSkeleton } from '../components/product/LoadingSkeletons';

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton count={12} />}>
      <ProductListingPage />
    </Suspense>
  );
}
