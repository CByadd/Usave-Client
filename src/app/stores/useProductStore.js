"use client";

import { create } from 'zustand';
import productService from '../services/api/productService';
import { apiService } from '../services/api/apiClient';

const useProductStore = create((set, get) => ({
  // Product detail state
  product: null,
  relatedProducts: [],
  productReviews: [],
  reviewStats: { averageRating: 0, totalReviews: 0 },
  isLoading: false,
  error: null,
  
  // UI state for product detail page
  selectedImage: 0,
  quantity: 1,
  selectedColor: null,
  selectedSize: 'M',
  includeInstallation: false,
  activeTab: 'details',
  
  // Actions
  fetchProduct: async (productId) => {
    if (!productId) return;
    
    set({ isLoading: true, error: null });
    
    try {
      const response = await productService.getProductById(productId);
      console.log('ProductService response:', response);
      
      // Handle different response formats
      let product = null;
      
      if (response && response.success) {
        // Standard format: { success: true, data: { product: {...} } } or { success: true, data: {...} }
        product = response.data?.product || response.data;
      } else if (response && response.data) {
        // Alternative format: { data: { product: {...} } } or { data: {...} }
        product = response.data.product || response.data;
      } else if (response && response.id) {
        // Direct product object
        product = response;
      }
      
      if (product && product.id) {
        const productColors = product?.colors || ['Beige', 'Brown'];
        
        console.log('Setting product:', product);
        
        set({
          product,
          selectedColor: productColors[0] || null,
          isLoading: false,
          error: null,
        });
        
        // Fetch related products if category exists
        if (product?.category) {
          get().fetchRelatedProducts(productId);
        }

        get().loadProductReviews(product.id);
      } else {
        console.error('Product not found, response:', response);
        set({
          isLoading: false,
          error: response?.message || response?.error || 'Product not found',
          product: null,
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      set({
        isLoading: false,
        error: error?.response?.data?.message || error?.message || 'Failed to load product details',
        product: null,
      });
    }
  },
  
  fetchRelatedProducts: async (productId, limit = 4) => {
    const { product } = get();
    if (!product?.category || !productId) return;

    try {
      const response = await productService.getRelatedProducts(productId, limit);
      if (response.success) {
        set({ relatedProducts: response.data || [] });
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  },

  loadProductReviews: async (productId) => {
    if (!productId) return;

    try {
      const response = await apiService.reviews.getProductReviews(productId);
      const reviewsData = response?.data || {};
      set({
        productReviews: reviewsData.reviews || [],
        reviewStats: {
          averageRating: Number(reviewsData.averageRating) || 0,
          totalReviews: reviewsData.totalReviews || (reviewsData.reviews?.length || 0),
        },
      });
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      set({
        productReviews: [],
        reviewStats: { averageRating: 0, totalReviews: 0 },
      });
    }
  },
  
  setSelectedImage: (index) => set({ selectedImage: index }),
  
  setQuantity: (quantity) => set({ quantity: Math.max(1, quantity) }),
  
  incrementQuantity: () => {
    const { quantity } = get();
    set({ quantity: quantity + 1 });
  },
  
  decrementQuantity: () => {
    const { quantity } = get();
    set({ quantity: Math.max(1, quantity - 1) });
  },
  
  setSelectedColor: (color) => set({ selectedColor: color }),
  
  setSelectedSize: (size) => set({ selectedSize: size }),
  
  setIncludeInstallation: (include) => set({ includeInstallation: include }),
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  resetProduct: () => set({
    product: null,
    relatedProducts: [],
    productReviews: [],
    reviewStats: { averageRating: 0, totalReviews: 0 },
    selectedImage: 0,
    quantity: 1,
    selectedColor: null,
    selectedSize: 'M',
    includeInstallation: false,
    activeTab: 'details',
    error: null,
  }),
  
  nextImage: () => {
    const { product, selectedImage } = get();
    if (product?.images) {
      const nextIndex = (selectedImage + 1) % product.images.length;
      set({ selectedImage: nextIndex });
    }
  },
  
  prevImage: () => {
    const { product, selectedImage } = get();
    if (product?.images) {
      const prevIndex = (selectedImage - 1 + product.images.length) % product.images.length;
      set({ selectedImage: prevIndex });
    }
  },
}));

export default useProductStore;

