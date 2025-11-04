// Simple search module - no context needed
import { apiService } from '../services/api/apiClient';

// Search state (local)
let searchQuery = '';
let searchResults = [];
let suggestions = [];

// Perform search
export const performSearch = async (query, filterOptions = {}) => {
  if (!query || query.trim().length < 2) {
    searchResults = [];
    return [];
  }

  try {
    searchQuery = query;
    const response = await apiService.products.search(query, filterOptions);
    
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

