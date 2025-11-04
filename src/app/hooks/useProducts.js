"use client";

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import productService from '../services/api/productService';

// Query keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id) => [...productKeys.details(), id] as const,
  search: (query, filters) => [...productKeys.all, 'search', query, filters] as const,
  featured: () => [...productKeys.all, 'featured'] as const,
  category: (category, filters) => [...productKeys.all, 'category', category, filters] as const,
  related: (id) => [...productKeys.all, 'related', id] as const,
  categories: () => [...productKeys.all, 'categories'] as const,
};

// Get all products with filters
export function useProducts(filters = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: async () => {
      const response = await productService.getAllProducts(filters);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch products');
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get products with infinite scroll
export function useInfiniteProducts(filters = {}) {
  return useInfiniteQuery({
    queryKey: productKeys.list(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await productService.getAllProducts({
        ...filters,
        page: pageParam,
        limit: filters.limit || 12,
      });
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch products');
      }
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
  });
}

// Get product by ID
export function useProduct(id) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const response = await productService.getProductById(id);
      if (!response.success) {
        throw new Error(response.error || 'Product not found');
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Search products
export function useSearchProducts(query, filters = {}) {
  return useQuery({
    queryKey: productKeys.search(query, filters),
    queryFn: async () => {
      const response = await productService.searchProducts(query, filters);
      if (!response.success) {
        throw new Error(response.error || 'Search failed');
      }
      return response.data;
    },
    enabled: !!query && query.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get featured products
export function useFeaturedProducts(limit = 8) {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: async () => {
      const response = await productService.getFeaturedProducts(limit);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch featured products');
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Get products by category
export function useProductsByCategory(category, filters = {}) {
  return useQuery({
    queryKey: productKeys.category(category, filters),
    queryFn: async () => {
      const response = await productService.getProductsByCategory(category, filters);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch products');
      }
      return response.data;
    },
    enabled: !!category,
    staleTime: 1000 * 60 * 5,
  });
}

// Get related products
export function useRelatedProducts(productId, limit = 4) {
  return useQuery({
    queryKey: productKeys.related(productId),
    queryFn: async () => {
      const response = await productService.getRelatedProducts(productId, limit);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch related products');
      }
      return response.data;
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  });
}

// Get categories
export function useCategories() {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: async () => {
      const response = await productService.getCategories();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch categories');
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes - categories don't change often
  });
}

// Get search suggestions
export function useSearchSuggestions(query, limit = 10) {
  return useQuery({
    queryKey: [...productKeys.all, 'suggestions', query],
    queryFn: async () => {
      const response = await productService.getSearchSuggestions(query, limit);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch suggestions');
      }
      return response.data;
    },
    enabled: !!query && query.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

