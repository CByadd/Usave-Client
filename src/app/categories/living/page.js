"use client";
import React, { useEffect } from 'react';
import { useSearch } from '../../contexts/SearchContext';
import ProductListingPage from '../../components/product/ProductList';

export default function LivingPage() {
  const { performSearch, updateFilters } = useSearch();

  useEffect(() => {
    // Set category filter and perform search
    updateFilters({ category: 'living' });
    performSearch('', { category: 'living' });
  }, [performSearch, updateFilters]);

  return <ProductListingPage />;
}
