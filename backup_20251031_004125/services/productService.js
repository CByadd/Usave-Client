import { apiService } from './api';
import productsData from '../data/products.json';

// Mock API service for development (replace with real API calls)
class ProductService {
  constructor() {
    this.products = productsData;
    this.useMockAPI = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL;
  }

  // Simulate API delay
  async delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get all products with optional filtering
  async getAllProducts(filters = {}) {
    if (this.useMockAPI) {
      await this.delay();
      
      let filteredProducts = [...this.products];
      
      // Apply filters
      if (filters.category) {
        filteredProducts = filteredProducts.filter(
          product => product.category === filters.category
        );
      }
      
      if (filters.subcategory) {
        filteredProducts = filteredProducts.filter(
          product => product.subcategory === filters.subcategory
        );
      }
      
      if (filters.inStock !== undefined) {
        filteredProducts = filteredProducts.filter(
          product => product.inStock === filters.inStock
        );
      }
      
      if (filters.minPrice) {
        filteredProducts = filteredProducts.filter(
          product => product.discountedPrice >= filters.minPrice
        );
      }
      
      if (filters.maxPrice) {
        filteredProducts = filteredProducts.filter(
          product => product.discountedPrice <= filters.maxPrice
        );
      }
      
      if (filters.featured) {
        filteredProducts = filteredProducts.filter(
          product => product.isFeatured === true
        );
      }
      
      // Apply sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price-low':
            filteredProducts.sort((a, b) => a.discountedPrice - b.discountedPrice);
            break;
          case 'price-high':
            filteredProducts.sort((a, b) => b.discountedPrice - a.discountedPrice);
            break;
          case 'rating':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
          case 'newest':
            filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
          case 'popular':
            filteredProducts.sort((a, b) => b.reviews - a.reviews);
            break;
          default:
            // Keep original order
            break;
        }
      }
      
      // Apply pagination
      const page = filters.page || 1;
      const limit = filters.limit || 12;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: {
          products: paginatedProducts,
          total: filteredProducts.length,
          page,
          limit,
          totalPages: Math.ceil(filteredProducts.length / limit)
        }
      };
    }
    
    // Real API call
    return await apiService.products.getAll(filters);
  }

  // Get product by ID
  async getProductById(id) {
    if (this.useMockAPI) {
      await this.delay();
      
      const product = this.products.find(p => p.id === parseInt(id));
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      return {
        success: true,
        data: product
      };
    }
    
    // Real API call
    return await apiService.products.getById(id);
  }

  // Search products
  async searchProducts(query, filters = {}) {
    if (this.useMockAPI) {
      await this.delay();
      
      if (!query) {
        return await this.getAllProducts(filters);
      }
      
      const searchQuery = query.toLowerCase();
      let filteredProducts = this.products.filter(product => 
        product.title.toLowerCase().includes(searchQuery) ||
        product.description.toLowerCase().includes(searchQuery) ||
        product.category.toLowerCase().includes(searchQuery) ||
        product.subcategory.toLowerCase().includes(searchQuery) ||
        product.brand.toLowerCase().includes(searchQuery) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery))
      );
      
      // Apply additional filters
      if (filters.category) {
        filteredProducts = filteredProducts.filter(
          product => product.category === filters.category
        );
      }
      
      if (filters.minPrice) {
        filteredProducts = filteredProducts.filter(
          product => product.discountedPrice >= filters.minPrice
        );
      }
      
      if (filters.maxPrice) {
        filteredProducts = filteredProducts.filter(
          product => product.discountedPrice <= filters.maxPrice
        );
      }
      
      if (filters.inStock !== undefined) {
        filteredProducts = filteredProducts.filter(
          product => product.inStock === filters.inStock
        );
      }
      
      // Apply sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price-low':
            filteredProducts.sort((a, b) => a.discountedPrice - b.discountedPrice);
            break;
          case 'price-high':
            filteredProducts.sort((a, b) => b.discountedPrice - a.discountedPrice);
            break;
          case 'rating':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
          case 'newest':
            filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
          default:
            // Keep original order
            break;
        }
      }
      
      return {
        success: true,
        data: {
          products: filteredProducts,
          total: filteredProducts.length,
          query
        }
      };
    }
    
    // Real API call
    return await apiService.products.search(query, filters);
  }

  // Get featured products
  async getFeaturedProducts(limit = 8) {
    if (this.useMockAPI) {
      await this.delay();
      
      const featuredProducts = this.products
        .filter(product => product.isFeatured)
        .slice(0, limit);
      
      return {
        success: true,
        data: featuredProducts
      };
    }
    
    // Real API call
    return await apiService.products.getFeatured();
  }

  // Get products by category
  async getProductsByCategory(category, filters = {}) {
    return await this.getAllProducts({ ...filters, category });
  }

  // Get categories
  async getCategories() {
    if (this.useMockAPI) {
      await this.delay();
      
      const categories = [
        { id: 'living', name: 'Living Room', count: this.products.filter(p => p.category === 'living').length },
        { id: 'dining', name: 'Dining Room', count: this.products.filter(p => p.category === 'dining').length },
        { id: 'bedroom', name: 'Bedroom', count: this.products.filter(p => p.category === 'bedroom').length },
        { id: 'kitchen', name: 'Kitchen', count: this.products.filter(p => p.category === 'kitchen').length },
        { id: 'electronics', name: 'Electronics', count: this.products.filter(p => p.category === 'electronics').length }
      ];
      
      return {
        success: true,
        data: categories
      };
    }
    
    // Real API call
    return await apiService.products.getCategories();
  }

  // Get search suggestions
  async getSearchSuggestions(query, limit = 10) {
    if (this.useMockAPI) {
      await this.delay();
      
      if (!query || query.length < 1) {
        return {
          success: true,
          data: {
            suggestions: [],
            query: query || ''
          }
        };
      }
      
      const searchQuery = query.toLowerCase();
      const suggestions = new Set();
      
      // Extract suggestions from products
      this.products.forEach(product => {
        // Title suggestions
        if (product.title.toLowerCase().includes(searchQuery)) {
          suggestions.add(product.title);
        }
        
        // Category suggestions
        if (product.category.toLowerCase().includes(searchQuery)) {
          suggestions.add(product.category);
        }
        
        // Brand suggestions
        if (product.brand.toLowerCase().includes(searchQuery)) {
          suggestions.add(product.brand);
        }
        
        // Material suggestions
        if (product.material.toLowerCase().includes(searchQuery)) {
          suggestions.add(product.material);
        }
        
        // Tag suggestions
        product.tags.forEach(tag => {
          if (tag.toLowerCase().includes(searchQuery)) {
            suggestions.add(tag);
          }
        });
      });
      
      const suggestionsArray = Array.from(suggestions).slice(0, limit);
      
      return {
        success: true,
        data: {
          suggestions: suggestionsArray,
          query
        }
      };
    }
    
    // Real API call
    return await apiService.products.getSuggestions(query, limit);
  }

  // Get related products
  async getRelatedProducts(productId, limit = 4) {
    if (this.useMockAPI) {
      await this.delay();
      
      const product = this.products.find(p => p.id === parseInt(productId));
      if (!product) {
        return { success: true, data: [] };
      }
      
      const relatedProducts = this.products
        .filter(p => p.id !== parseInt(productId) && p.category === product.category)
        .slice(0, limit);
      
      return {
        success: true,
        data: relatedProducts
      };
    }
    
    // Real API call would go here
    return { success: true, data: [] };
  }

  // Update product stock (for cart operations)
  async updateProductStock(productId, quantity) {
    if (this.useMockAPI) {
      await this.delay();
      
      const product = this.products.find(p => p.id === parseInt(productId));
      if (product) {
        product.stockQuantity = Math.max(0, product.stockQuantity - quantity);
        product.inStock = product.stockQuantity > 0;
      }
      
      return {
        success: true,
        data: product
      };
    }
    
    // Real API call would go here
    return { success: true, data: null };
  }
}

export default new ProductService();


