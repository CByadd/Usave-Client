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
  
  // Alert Modal state
  alertModal: {
    isOpen: false,
    title: null,
    message: null,
    type: 'info',
    confirmText: 'OK',
    cancelText: null,
    onConfirm: null,
    onCancel: null,
  },
  
  // Loading state
  isLoading: false,
  loadingMessage: 'Loading...',
  loadingProgress: 0, // 0-100 for progress indication
  
  // Redirect path after auth (used for checkout flow)
  authRedirectPath: null,
  
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
  
  openAuthDrawer: (redirectPath = null) => set({ isAuthDrawerOpen: true, authRedirectPath: redirectPath }),
  closeAuthDrawer: () => set({ isAuthDrawerOpen: false, authRedirectPath: null }),
  toggleAuthDrawer: () => set((state) => ({ isAuthDrawerOpen: !state.isAuthDrawerOpen })),
  setAuthRedirectPath: (path) => set({ authRedirectPath: path }),
  
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
  
  // Actions - Alert Modal
  showAlert: (config) => set({
    alertModal: {
      isOpen: true,
      title: config.title || null,
      message: config.message || null,
      type: config.type || 'info',
      confirmText: config.confirmText || 'OK',
      cancelText: config.cancelText || null,
      onConfirm: config.onConfirm || null,
      onCancel: config.onCancel || null,
    }
  }),
  closeAlert: () => set({
    alertModal: {
      isOpen: false,
      title: null,
      message: null,
      type: 'info',
      confirmText: 'OK',
      cancelText: null,
      onConfirm: null,
      onCancel: null,
    }
  }),
  
  // Actions - Loading
  setLoading: (isLoading, message = 'Loading...', progress = 0) => set({
    isLoading,
    loadingMessage: message,
    loadingProgress: progress,
  }),
  setLoadingProgress: (progress) => set((state) => ({
    loadingProgress: Math.max(0, Math.min(100, progress)),
  })),
  
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

