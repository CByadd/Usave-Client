"use client";

import { create } from 'zustand';

const SEARCH_STORAGE_KEY = 'usave_search';

// Load search state from localStorage
const loadSearchFromStorage = () => {
  if (typeof window === 'undefined') {
    return {
      query: '',
      filters: {},
      history: [],
    };
  }
  
  try {
    const stored = localStorage.getItem(SEARCH_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Error loading search from localStorage:', err);
  }
  
  return {
    query: '',
    filters: {},
    history: [],
  };
};

// Save search state to localStorage
const saveSearchToStorage = (state) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify({
      query: state.query,
      filters: state.filters,
      history: state.history,
    }));
  } catch (err) {
    console.error('Error saving search to localStorage:', err);
  }
};

export const useSearchStore = create((set, get) => {
  // Initialize from localStorage
  const initialSearch = loadSearchFromStorage();
  
  return {
    // Search state
    query: initialSearch.query || '',
    filters: initialSearch.filters || {},
    history: initialSearch.history || [],
    suggestions: [],
    isSearching: false,
    searchResults: [],
    activeFilters: {
      sort: false,
      price: false,
      color: false,
      size: false,
      collection: false,
      category: false,
    },

    // Set search query
    setQuery: (query) => {
      set({ query });
      saveSearchToStorage({ ...get(), query });
    },

    // Clear search query
    clearQuery: () => {
      set({ query: '' });
      saveSearchToStorage({ ...get(), query: '' });
    },

    // Set filters
    setFilters: (filters) => {
      const newFilters = { ...get().filters, ...filters };
      set({ filters: newFilters });
      saveSearchToStorage({ ...get(), filters: newFilters });
    },

    // Reset filters
    resetFilters: () => {
      set({ filters: {} });
      saveSearchToStorage({ ...get(), filters: {} });
    },

    // Update a single filter
    updateFilter: (key, value) => {
      const filters = { ...get().filters, [key]: value };
      set({ filters });
      saveSearchToStorage({ ...get(), filters });
    },

    // Remove a filter
    removeFilter: (key) => {
      const filters = { ...get().filters };
      delete filters[key];
      set({ filters });
      saveSearchToStorage({ ...get(), filters });
    },

    // Set active filters (for UI)
    setActiveFilters: (activeFilters) => {
      set({ activeFilters });
    },

    // Toggle active filter
    toggleActiveFilter: (filterName) => {
      const { activeFilters } = get();
      set({
        activeFilters: {
          ...activeFilters,
          [filterName]: !activeFilters[filterName],
        },
      });
    },

    // Set search suggestions
    setSuggestions: (suggestions) => {
      set({ suggestions });
    },

    // Clear suggestions
    clearSuggestions: () => {
      set({ suggestions: [] });
    },

    // Set search results
    setSearchResults: (results) => {
      set({ searchResults: results });
    },

    // Set is searching
    setIsSearching: (isSearching) => {
      set({ isSearching });
    },

    // Add to search history
    addToHistory: (query) => {
      if (!query || !query.trim()) return;
      
      const { history } = get();
      const newHistory = [query, ...history.filter(q => q !== query)].slice(0, 10); // Keep last 10
      set({ history: newHistory });
      saveSearchToStorage({ ...get(), history: newHistory });
    },

    // Clear search history
    clearHistory: () => {
      set({ history: [] });
      saveSearchToStorage({ ...get(), history: [] });
    },

    // Remove from history
    removeFromHistory: (query) => {
      const { history } = get();
      const newHistory = history.filter(q => q !== query);
      set({ history: newHistory });
      saveSearchToStorage({ ...get(), history: newHistory });
    },
  };
});

// Export a hook that matches a simple API
export const useSearch = () => {
  const query = useSearchStore((state) => state.query);
  const filters = useSearchStore((state) => state.filters);
  const history = useSearchStore((state) => state.history);
  const suggestions = useSearchStore((state) => state.suggestions);
  const isSearching = useSearchStore((state) => state.isSearching);
  const searchResults = useSearchStore((state) => state.searchResults);
  const activeFilters = useSearchStore((state) => state.activeFilters);
  
  const setQuery = useSearchStore((state) => state.setQuery);
  const clearQuery = useSearchStore((state) => state.clearQuery);
  const setFilters = useSearchStore((state) => state.setFilters);
  const resetFilters = useSearchStore((state) => state.resetFilters);
  const updateFilter = useSearchStore((state) => state.updateFilter);
  const removeFilter = useSearchStore((state) => state.removeFilter);
  const setActiveFilters = useSearchStore((state) => state.setActiveFilters);
  const toggleActiveFilter = useSearchStore((state) => state.toggleActiveFilter);
  const setSuggestions = useSearchStore((state) => state.setSuggestions);
  const clearSuggestions = useSearchStore((state) => state.clearSuggestions);
  const setSearchResults = useSearchStore((state) => state.setSearchResults);
  const setIsSearching = useSearchStore((state) => state.setIsSearching);
  const addToHistory = useSearchStore((state) => state.addToHistory);
  const clearHistory = useSearchStore((state) => state.clearHistory);
  const removeFromHistory = useSearchStore((state) => state.removeFromHistory);

  return {
    query,
    filters,
    history,
    suggestions,
    isSearching,
    searchResults,
    activeFilters,
    setQuery,
    clearQuery,
    setFilters,
    resetFilters,
    updateFilter,
    removeFilter,
    setActiveFilters,
    toggleActiveFilter,
    setSuggestions,
    clearSuggestions,
    setSearchResults,
    setIsSearching,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
};

