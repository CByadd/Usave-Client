"use client";
import React, { useEffect } from 'react';
import { useSearch } from '../../contexts/SearchContext';
import ProductListingPage from '../../components/shared/ProductListingPage';

export default function DiningPage() {
  const { performSearch, updateFilters } = useSearch();

  useEffect(() => {
    // Set category filter and perform search
    updateFilters({ category: 'dining' });
    performSearch('', { category: 'dining' });
  }, [performSearch, updateFilters]);

  return <ProductListingPage />;
}
