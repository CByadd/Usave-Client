"use client";
import React, { useEffect } from 'react';
import { useSearch } from '../../context/SearchContext';
import ProductListingPage from '../../components/shared/ProductListingPage';

export default function ElectronicsPage() {
  const { performSearch, updateFilters } = useSearch();

  useEffect(() => {
    // Set category filter and perform search
    updateFilters({ category: 'electronics' });
    performSearch('', { category: 'electronics' });
  }, [performSearch, updateFilters]);

  return <ProductListingPage />;
}
