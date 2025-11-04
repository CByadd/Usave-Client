"use client";

import { create } from 'zustand';

// UI Store for client-side state: modals, drawers, filters, etc.
export const useUIStore = create((set) => ({
  // Drawer states
  isCartDrawerOpen: false,
  isAuthDrawerOpen: false,
  isSearchDrawerOpen: false,
  
  // Modal states
  isQuickViewModalOpen: false,
  quickViewProduct: null,
  
  // Filter states
  productFilters: {
    category: null,
    subcategory: null,
    minPrice: null,
    maxPrice: null,
    inStock: null,
    sortBy: null,
    featured: false,
  },
  
  // Search state
  searchQuery: '',
  
  // Actions - Drawers
  openCartDrawer: () => set({ isCartDrawerOpen: true }),
  closeCartDrawer: () => set({ isCartDrawerOpen: false }),
  toggleCartDrawer: () => set((state) => ({ isCartDrawerOpen: !state.isCartDrawerOpen })),
  
  openAuthDrawer: () => set({ isAuthDrawerOpen: true }),
  closeAuthDrawer: () => set({ isAuthDrawerOpen: false }),
  toggleAuthDrawer: () => set((state) => ({ isAuthDrawerOpen: !state.isAuthDrawerOpen })),
  
  openSearchDrawer: () => set({ isSearchDrawerOpen: true }),
  closeSearchDrawer: () => set({ isSearchDrawerOpen: false }),
  toggleSearchDrawer: () => set((state) => ({ isSearchDrawerOpen: !state.isSearchDrawerOpen })),
  
  // Actions - Modals
  openQuickViewModal: (product) => set({ 
    isQuickViewModalOpen: true, 
    quickViewProduct: product 
  }),
  closeQuickViewModal: () => set({ 
    isQuickViewModalOpen: false, 
    quickViewProduct: null 
  }),
  
  // Actions - Filters
  setProductFilters: (filters) => set((state) => ({
    productFilters: { ...state.productFilters, ...filters }
  })),
  resetProductFilters: () => set({
    productFilters: {
      category: null,
      subcategory: null,
      minPrice: null,
      maxPrice: null,
      inStock: null,
      sortBy: null,
      featured: false,
    }
  }),
  updateProductFilter: (key, value) => set((state) => ({
    productFilters: { ...state.productFilters, [key]: value }
  })),
  
  // Actions - Search
  setSearchQuery: (query) => set({ searchQuery: query }),
  clearSearchQuery: () => set({ searchQuery: '' }),
}));

