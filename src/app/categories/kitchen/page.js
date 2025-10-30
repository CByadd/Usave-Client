"use client";
import React, { useEffect } from 'react';
import { useSearch } from '../../contexts/SearchContext';
import ProductListingPage from '../../components/shared/ProductListingPage';

export default function KitchenPage() {
  const { performSearch, updateFilters } = useSearch();

  useEffect(() => {
    // Set category filter and perform search
    updateFilters({ category: 'kitchen' });
    performSearch('', { category: 'kitchen' });
  }, [performSearch, updateFilters]);

  return <ProductListingPage />;
}
