"use client";
import React, { useEffect } from 'react';
import { useSearch } from '../../contexts/SearchContext';
import ProductListingPage from '../../components/product/ProductList';

export default function BedroomPage() {
  const { performSearch, updateFilters } = useSearch();

  useEffect(() => {
    // Set category filter and perform search
    updateFilters({ category: 'bedroom' });
    performSearch('', { category: 'bedroom' });
  }, [performSearch, updateFilters]);

  return <ProductListingPage />;
}
