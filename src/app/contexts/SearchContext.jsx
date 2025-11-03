"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import productService from '../services/api/productService';

const SearchContext = createContext();

// Default values for SSR/prerendering
const defaultSearchValue = {
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  isLoading: false,
  suggestions: [],
  showSuggestions: false,
  hasSearched: false,
  filters: {
    category: '',
    priceRange: { min: 0, max: 10000 },
    sortBy: 'relevance',
    inStock: false
  },
  updateFilters: () => {},
  performSearch: async () => {},
  getSuggestions: async () => {},
  hideSuggestions: () => {},
  clearSearch: () => {},
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  // Return default values during SSR/prerendering when context isn't available
  if (!context) {
    return defaultSearchValue;
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: { min: 0, max: 10000 },
    sortBy: 'relevance',
    inStock: false
  });
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize search query from URL params
  useEffect(() => {
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const sort = searchParams.get('sort');
    
    if (query && query !== searchQuery) setSearchQuery(query);
    if (category && category !== filters.category) setFilters(prev => ({ ...prev, category }));
    if (sort && sort !== filters.sortBy) setFilters(prev => ({ ...prev, sortBy: sort }));
  }, [searchParams, searchQuery, filters.category, filters.sortBy]);

  const performSearch = async (query, searchFilters = filters) => {
    setIsSearching(true);
    setHasSearched(true);
    setShowSuggestions(false);
    
    try {
      let results;
      
      if (query) {
        // Perform search with query
        const response = await productService.searchProducts(query, {
          category: searchFilters.category,
          minPrice: searchFilters.priceRange.min,
          maxPrice: searchFilters.priceRange.max,
          inStock: searchFilters.inStock,
          sortBy: searchFilters.sortBy
        });
        results = response.data.products || [];
      } else {
        // Get all products with filters
        const response = await productService.getAllProducts({
          category: searchFilters.category,
          minPrice: searchFilters.priceRange.min,
          maxPrice: searchFilters.priceRange.max,
          inStock: searchFilters.inStock,
          sortBy: searchFilters.sortBy
        });
        results = response.data.products || [];
      }
      
      setSearchResults(results);
      
      // Update URL with search parameters
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (searchFilters.category) params.set('category', searchFilters.category);
      if (searchFilters.sortBy !== 'relevance') params.set('sort', searchFilters.sortBy);
      
      const newUrl = `/search?${params.toString()}`;
      router.push(newUrl);
      
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const getSuggestions = async (query) => {
    if (!query || query.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    try {
      const response = await productService.getSearchSuggestions(query, 8);
      setSuggestions(response.data.suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Suggestions error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    if (searchQuery) {
      performSearch(searchQuery, updatedFilters);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSuggestions([]);
    setShowSuggestions(false);
    setHasSearched(false);
    setFilters({
      category: '',
      priceRange: { min: 0, max: 10000 },
      sortBy: 'relevance',
      inStock: false
    });
    router.push('/');
  };

  const hideSuggestions = () => {
    setShowSuggestions(false);
  };

  const value = {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    isLoading,
    suggestions,
    showSuggestions,
    hasSearched,
    filters,
    updateFilters,
    performSearch,
    getSuggestions,
    hideSuggestions,
    clearSearch
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

