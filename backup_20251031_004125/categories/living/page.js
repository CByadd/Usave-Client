"use client";
import React, { useEffect } from 'react';
import { useSearch } from '../../context/SearchContext';
import ProductListingPage from '../../components/shared/ProductListingPage';

export default function LivingPage() {
  const { performSearch, updateFilters } = useSearch();

  useEffect(() => {
    // Set category filter and perform search
    updateFilters({ category: 'living' });
    performSearch('', { category: 'living' });
  }, [performSearch, updateFilters]);

  return <ProductListingPage />;
}
