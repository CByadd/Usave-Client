"use client";

import { create } from 'zustand';

const SEARCH_STORAGE_KEY = 'usave_search';

// Default advanced filter values
const defaultAdvancedFilters = {
  // Price range
  minPrice: '',
  maxPrice: '',
  
  // Category
  category: '',
  categories: [],
  
  // Rating
  minRating: 0,
  
  // Stock status
  inStock: null, // null = all, true = in stock only, false = out of stock only
  
  // Sorting
  sortBy: 'relevance', // relevance, price_asc, price_desc, rating, newest, oldest
  
  // Additional filters
  tags: [],
  color: '',
  size: '',
  
  // Boolean filters
  featured: null,
  onSale: null,
  topSeller: null,
};

// Load search state from localStorage
const loadSearchFromStorage = () => {
  if (typeof window === 'undefined') {
    return {
      query: '',
      filters: {},
      advancedFilters: { ...defaultAdvancedFilters },
      history: [],
    };
  }
  
  try {
    const stored = localStorage.getItem(SEARCH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        query: parsed.query || '',
        filters: parsed.filters || {},
        advancedFilters: { ...defaultAdvancedFilters, ...(parsed.advancedFilters || {}) },
        history: parsed.history || [],
      };
    }
  } catch (err) {
    console.error('Error loading search from localStorage:', err);
  }
  
  return {
    query: '',
    filters: {},
    advancedFilters: { ...defaultAdvancedFilters },
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
      advancedFilters: state.advancedFilters,
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
    advancedFilters: initialSearch.advancedFilters || { ...defaultAdvancedFilters },
    history: initialSearch.history || [],
    suggestions: [],
    isSearching: false,
    searchResults: [],
    totalResults: 0,
    currentPage: 1,
    resultsPerPage: 20,
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

    // ===== Advanced Search Methods =====
    
    // Update advanced filter
    updateAdvancedFilter: (key, value) => {
      const advancedFilters = { ...get().advancedFilters, [key]: value };
      set({ advancedFilters });
      saveSearchToStorage({ ...get(), advancedFilters });
    },
    
    // Update multiple advanced filters at once
    updateAdvancedFilters: (newFilters) => {
      const advancedFilters = { ...get().advancedFilters, ...newFilters };
      set({ advancedFilters });
      saveSearchToStorage({ ...get(), advancedFilters });
    },
    
    // Reset all advanced filters
    resetAdvancedFilters: () => {
      const advancedFilters = { ...defaultAdvancedFilters };
      set({ advancedFilters });
      saveSearchToStorage({ ...get(), advancedFilters });
    },
    
    // Reset specific advanced filter
    resetAdvancedFilter: (key) => {
      const advancedFilters = { ...get().advancedFilters };
      if (key in defaultAdvancedFilters) {
        advancedFilters[key] = defaultAdvancedFilters[key];
        set({ advancedFilters });
        saveSearchToStorage({ ...get(), advancedFilters });
      }
    },
    
    // Add category to advanced filters
    addCategory: (category) => {
      const { advancedFilters } = get();
      const categories = Array.isArray(advancedFilters.categories) ? advancedFilters.categories : [];
      if (!categories.includes(category)) {
        const newAdvancedFilters = { ...advancedFilters, categories: [...categories, category] };
        set({ advancedFilters: newAdvancedFilters });
        saveSearchToStorage({ ...get(), advancedFilters: newAdvancedFilters });
      }
    },
    
    // Remove category from advanced filters
    removeCategory: (category) => {
      const { advancedFilters } = get();
      const categories = Array.isArray(advancedFilters.categories) ? advancedFilters.categories : [];
      const newAdvancedFilters = { ...advancedFilters, categories: categories.filter(c => c !== category) };
      set({ advancedFilters: newAdvancedFilters });
      saveSearchToStorage({ ...get(), advancedFilters: newAdvancedFilters });
    },
    
    // Add tag to advanced filters
    addTag: (tag) => {
      const { advancedFilters } = get();
      const tags = Array.isArray(advancedFilters.tags) ? advancedFilters.tags : [];
      if (!tags.includes(tag)) {
        const newAdvancedFilters = { ...advancedFilters, tags: [...tags, tag] };
        set({ advancedFilters: newAdvancedFilters });
        saveSearchToStorage({ ...get(), advancedFilters: newAdvancedFilters });
      }
    },
    
    // Remove tag from advanced filters
    removeTag: (tag) => {
      const { advancedFilters } = get();
      const tags = Array.isArray(advancedFilters.tags) ? advancedFilters.tags : [];
      const newAdvancedFilters = { ...advancedFilters, tags: tags.filter(t => t !== tag) };
      set({ advancedFilters: newAdvancedFilters });
      saveSearchToStorage({ ...get(), advancedFilters: newAdvancedFilters });
    },
    
    // Get active advanced filter count
    getActiveAdvancedFilterCount: () => {
      const { advancedFilters } = get();
      let count = 0;
      
      if (advancedFilters.minPrice || advancedFilters.maxPrice) count++;
      if (advancedFilters.category || (Array.isArray(advancedFilters.categories) && advancedFilters.categories.length > 0)) count++;
      if (advancedFilters.minRating > 0) count++;
      if (advancedFilters.inStock !== null) count++;
      if (advancedFilters.sortBy !== 'relevance') count++;
      if (Array.isArray(advancedFilters.tags) && advancedFilters.tags.length > 0) count++;
      if (advancedFilters.color) count++;
      if (advancedFilters.size) count++;
      if (advancedFilters.featured !== null) count++;
      if (advancedFilters.onSale !== null) count++;
      if (advancedFilters.topSeller !== null) count++;
      
      return count;
    },
    
    // Check if any advanced filter is active
    hasActiveAdvancedFilters: () => {
      return get().getActiveAdvancedFilterCount() > 0;
    },
    
    // Get advanced filters as query params for API
    getAdvancedFiltersAsParams: () => {
      const { advancedFilters } = get();
      const params = {};
      
      if (advancedFilters.minPrice) params.minPrice = advancedFilters.minPrice;
      if (advancedFilters.maxPrice) params.maxPrice = advancedFilters.maxPrice;
      if (advancedFilters.category) params.category = advancedFilters.category;
      if (Array.isArray(advancedFilters.categories) && advancedFilters.categories.length > 0) {
        params.categories = advancedFilters.categories.join(',');
      }
      if (advancedFilters.minRating > 0) params.minRating = advancedFilters.minRating;
      if (advancedFilters.inStock !== null) params.inStock = advancedFilters.inStock;
      if (advancedFilters.sortBy !== 'relevance') params.sortBy = advancedFilters.sortBy;
      if (Array.isArray(advancedFilters.tags) && advancedFilters.tags.length > 0) {
        params.tags = advancedFilters.tags.join(',');
      }
      if (advancedFilters.color) params.color = advancedFilters.color;
      if (advancedFilters.size) params.size = advancedFilters.size;
      if (advancedFilters.featured !== null) params.featured = advancedFilters.featured;
      if (advancedFilters.onSale !== null) params.onSale = advancedFilters.onSale;
      if (advancedFilters.topSeller !== null) params.topSeller = advancedFilters.topSeller;
      
      return params;
    },
    
    // Perform advanced search with all filters
    performAdvancedSearch: async (query, additionalParams = {}) => {
      const { getAdvancedFiltersAsParams } = get();
      const filterParams = getAdvancedFiltersAsParams();
      const allParams = { ...filterParams, ...additionalParams };
      
      // This will be used by the search API call
      return allParams;
    },
    
    // Set search results with total count
    setSearchResultsWithTotal: (results, total = 0) => {
      set({ 
        searchResults: results,
        totalResults: total,
        isSearching: false,
      });
    },
    
    // Set current page
    setCurrentPage: (page) => set({ currentPage: page }),
    
    // Set results per page
    setResultsPerPage: (perPage) => set({ resultsPerPage: perPage }),
  };
});

// Export a hook that matches a simple API
export const useSearch = () => {
  const query = useSearchStore((state) => state.query);
  const filters = useSearchStore((state) => state.filters);
  const advancedFilters = useSearchStore((state) => state.advancedFilters);
  const history = useSearchStore((state) => state.history);
  const suggestions = useSearchStore((state) => state.suggestions);
  const isSearching = useSearchStore((state) => state.isSearching);
  const searchResults = useSearchStore((state) => state.searchResults);
  const totalResults = useSearchStore((state) => state.totalResults);
  const currentPage = useSearchStore((state) => state.currentPage);
  const resultsPerPage = useSearchStore((state) => state.resultsPerPage);
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
  const setSearchResultsWithTotal = useSearchStore((state) => state.setSearchResultsWithTotal);
  const setIsSearching = useSearchStore((state) => state.setIsSearching);
  const addToHistory = useSearchStore((state) => state.addToHistory);
  const clearHistory = useSearchStore((state) => state.clearHistory);
  const removeFromHistory = useSearchStore((state) => state.removeFromHistory);

  // Advanced search methods
  const updateAdvancedFilter = useSearchStore((state) => state.updateAdvancedFilter);
  const updateAdvancedFilters = useSearchStore((state) => state.updateAdvancedFilters);
  const resetAdvancedFilters = useSearchStore((state) => state.resetAdvancedFilters);
  const resetAdvancedFilter = useSearchStore((state) => state.resetAdvancedFilter);
  const addCategory = useSearchStore((state) => state.addCategory);
  const removeCategory = useSearchStore((state) => state.removeCategory);
  const addTag = useSearchStore((state) => state.addTag);
  const removeTag = useSearchStore((state) => state.removeTag);
  const getActiveAdvancedFilterCount = useSearchStore((state) => state.getActiveAdvancedFilterCount);
  const hasActiveAdvancedFilters = useSearchStore((state) => state.hasActiveAdvancedFilters);
  const getAdvancedFiltersAsParams = useSearchStore((state) => state.getAdvancedFiltersAsParams);
  const performAdvancedSearch = useSearchStore((state) => state.performAdvancedSearch);
  const setCurrentPage = useSearchStore((state) => state.setCurrentPage);
  const setResultsPerPage = useSearchStore((state) => state.setResultsPerPage);

  return {
    query,
    filters,
    advancedFilters,
    history,
    suggestions,
    isSearching,
    searchResults,
    totalResults,
    currentPage,
    resultsPerPage,
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
    setSearchResultsWithTotal,
    setIsSearching,
    addToHistory,
    clearHistory,
    removeFromHistory,
    // Advanced search methods
    updateAdvancedFilter,
    updateAdvancedFilters,
    resetAdvancedFilters,
    resetAdvancedFilter,
    addCategory,
    removeCategory,
    addTag,
    removeTag,
    getActiveAdvancedFilterCount,
    hasActiveAdvancedFilters,
    getAdvancedFiltersAsParams,
    performAdvancedSearch,
    setCurrentPage,
    setResultsPerPage,
  };
};

