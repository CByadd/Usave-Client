"use client";
import React, { useEffect } from 'react';
import { useSearch } from '../../context/SearchContext';
import ProductListingPage from '../../components/shared/ProductListingPage';

export default function BedroomPage() {
  const { performSearch, updateFilters } = useSearch();

  useEffect(() => {
    // Set category filter and perform search
    updateFilters({ category: 'bedroom' });
    performSearch('', { category: 'bedroom' });
  }, [performSearch, updateFilters]);

  return <ProductListingPage />;
}
