"use client";
import React, { useEffect } from 'react';
import { useSearch } from '../../contexts/SearchContext';
import ProductListingPage from '../../components/product/ProductList';

export default function ElectronicsPage() {
  const { performSearch, updateFilters } = useSearch();

  useEffect(() => {
    // Set category filter and perform search
    updateFilters({ category: 'electronics' });
    performSearch('', { category: 'electronics' });
  }, [performSearch, updateFilters]);

  return <ProductListingPage />;
}
