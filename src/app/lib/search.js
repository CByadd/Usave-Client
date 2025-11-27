// Simple search module - no context needed
import { apiService } from '../services/api/apiClient';

// Search state (local)
let searchQuery = '';
let searchResults = [];
let suggestions = [];

// Perform search with advanced filters
export const performSearch = async (query, filterOptions = {}, advancedFilters = {}) => {
  // Allow empty query if category filter is provided, or require at least 2 characters
  const hasCategoryFilter = filterOptions.category || (advancedFilters.category);
  if ((!query || query.trim().length < 2) && !hasCategoryFilter) {
    // Special case: allow "*" as a wildcard query for category-only searches
    if (query === '*') {
      query = '';
    } else {
      searchResults = [];
      return [];
    }
  }

  try {
    searchQuery = query || '';
    
    // Merge filter options with advanced filters
    const allFilters = { ...filterOptions };
    
    // Add advanced filter params
    // Price filters - check for empty strings and null/undefined
    if (advancedFilters.minPrice !== undefined && advancedFilters.minPrice !== null && advancedFilters.minPrice !== '' && advancedFilters.minPrice !== 'null') {
      allFilters.minPrice = advancedFilters.minPrice;
    }
    if (advancedFilters.maxPrice !== undefined && advancedFilters.maxPrice !== null && advancedFilters.maxPrice !== '' && advancedFilters.maxPrice !== 'null') {
      allFilters.maxPrice = advancedFilters.maxPrice;
    }
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
    
    // Map sortBy to API format (price_asc -> price-low, price_desc -> price-high, etc.)
    const sortMap = {
      'relevance': null, // No sort parameter for relevance (default server sorting)
      'price_asc': 'price-low',
      'price_desc': 'price-high',
      'rating': 'rating',
      'newest': 'newest',
      'oldest': 'oldest',
    };
    
    // Get sortBy from advancedFilters (preferred) or allFilters
    const sortByValue = advancedFilters.sortBy || allFilters.sortBy;
    const apiSort = sortByValue ? sortMap[sortByValue] : null;
    
    // Build search params
    const searchParams = {
      category: allFilters.category || undefined,
      subcategory: allFilters.subcategory || undefined,
      limit: allFilters.limit || 100, // Increased default limit to show more products
      offset: allFilters.offset || 0,
    };
    
    // Add sort if not relevance (relevance uses default server sorting)
    if (apiSort !== null) {
      searchParams.sort = apiSort;
    }
    
    // Add price filters if they exist (convert to number for API)
    if (allFilters.minPrice !== undefined && allFilters.minPrice !== null && allFilters.minPrice !== '' && allFilters.minPrice !== 'null') {
      const minPriceNum = parseFloat(String(allFilters.minPrice));
      if (!isNaN(minPriceNum) && minPriceNum >= 0) {
        searchParams.minPrice = minPriceNum;
      }
    }
    if (allFilters.maxPrice !== undefined && allFilters.maxPrice !== null && allFilters.maxPrice !== '' && allFilters.maxPrice !== 'null') {
      const maxPriceNum = parseFloat(String(allFilters.maxPrice));
      if (!isNaN(maxPriceNum) && maxPriceNum >= 0) {
        searchParams.maxPrice = maxPriceNum;
      }
    }
    
    // Add other filters
    if (allFilters.color) {
      searchParams.color = allFilters.color;
    }
    if (allFilters.inStock !== undefined && allFilters.inStock !== null) {
      searchParams.inStock = allFilters.inStock;
    }
    
    // Pass query and filters to search API
    const response = await apiService.products.search(query, searchParams);
    
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

