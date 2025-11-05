// Simple search module - no context needed
import { apiService } from '../services/api/apiClient';

// Search state (local)
let searchQuery = '';
let searchResults = [];
let suggestions = [];

// Perform search with advanced filters
export const performSearch = async (query, filterOptions = {}, advancedFilters = {}) => {
  if (!query || query.trim().length < 2) {
    searchResults = [];
    return [];
  }

  try {
    searchQuery = query;
    
    // Merge filter options with advanced filters
    const allFilters = { ...filterOptions };
    
    // Add advanced filter params
    if (advancedFilters.minPrice) allFilters.minPrice = advancedFilters.minPrice;
    if (advancedFilters.maxPrice) allFilters.maxPrice = advancedFilters.maxPrice;
    if (advancedFilters.category) allFilters.category = advancedFilters.category;
    if (Array.isArray(advancedFilters.categories) && advancedFilters.categories.length > 0) {
      allFilters.categories = advancedFilters.categories.join(',');
    }
    if (advancedFilters.minRating > 0) allFilters.minRating = advancedFilters.minRating;
    if (advancedFilters.inStock !== null) allFilters.inStock = advancedFilters.inStock;
    if (advancedFilters.sortBy && advancedFilters.sortBy !== 'relevance') {
      allFilters.sortBy = advancedFilters.sortBy;
    }
    if (Array.isArray(advancedFilters.tags) && advancedFilters.tags.length > 0) {
      allFilters.tags = advancedFilters.tags.join(',');
    }
    if (advancedFilters.color) allFilters.color = advancedFilters.color;
    if (advancedFilters.size) allFilters.size = advancedFilters.size;
    if (advancedFilters.featured !== null) allFilters.featured = advancedFilters.featured;
    if (advancedFilters.onSale !== null) allFilters.onSale = advancedFilters.onSale;
    if (advancedFilters.topSeller !== null) allFilters.topSeller = advancedFilters.topSeller;
    
    const response = await apiService.products.search(query, allFilters);
    
    if (response.success && response.data) {
      searchResults = response.data.products || [];
      return searchResults;
    } else {
      searchResults = [];
      return [];
    }
  } catch (err) {
    console.error('Search error:', err);
    searchResults = [];
    return [];
  }
};

// Get suggestions
export const getSuggestions = async (query, limit = 10) => {
  if (!query || query.trim().length < 1) {
    suggestions = [];
    return [];
  }

  try {
    const response = await apiService.products.getSuggestions(query.trim(), limit);
    
    if (response.success && response.data) {
      suggestions = response.data.suggestions || [];
      return suggestions;
    } else {
      suggestions = [];
      return [];
    }
  } catch (err) {
    console.error('Suggestions error:', err);
    suggestions = [];
    return [];
  }
};

// Get search results
export const getSearchResults = () => searchResults;

// Get suggestions
export const getSuggestionsList = () => suggestions;

// Get search query
export const getSearchQuery = () => searchQuery;

