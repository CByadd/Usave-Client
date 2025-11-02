/**
 * Centralized Application Configuration
 * All URLs, API endpoints, and environment variables should be defined here
 * for easy production deployment and management
 */

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Server Configuration
const getServerUrl = () => {
  // Check for explicit environment variable first
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Development: use HTTP (no SSL) for localhost
  if (isDevelopment) {
    return 'http://localhost:3001/api';
  }
  
  // Production: use HTTPS
  return 'https://usave-server.vercel.app/api';
};

// Application configuration
export const config = {
  // Environment
  env: {
    isDevelopment,
    isProduction,
    current: process.env.NODE_ENV || 'development',
  },

  // API Configuration
  api: {
    baseURL: getServerUrl(),
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Application URLs
  urls: {
    // Base URLs
    client: process.env.NEXT_PUBLIC_CLIENT_URL || 
            (isDevelopment ? 'http://localhost:3000' : 'https://usave-client.vercel.app'),
    server: getServerUrl().replace('/api', ''),
    
    // Page Routes
    home: '/',
    login: '/auth/login',
    register: '/auth/register',
    cart: '/cart',
    checkout: '/checkout',
    orders: '/orders',
    wishlist: '/wishlist',
    search: '/search',
    contact: '/contact',
    admin: '/admin',
    adminLogin: '/admin/login',
    adminDashboard: '/admin/dashboard',
    
    // Dynamic Routes
    product: (id) => `/products/${id}`,
    category: (category) => `/categories/${category}`,
    payment: (orderId) => `/payment/${orderId}`,
    paymentSuccess: (orderId) => `/payment/${orderId}/success`,
    
    // External Services
    cloudinary: 'https://res.cloudinary.com',
  },

  // API Endpoints (relative to baseURL)
  endpoints: {
    // Authentication
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
      me: '/auth/me',
      profile: '/auth/profile',
      verifyToken: '/auth/verify-token',
    },
    
    // Products
    products: {
      list: '/products',
      detail: (id) => `/products/${id}`,
      search: '/products/search',
      suggestions: '/products/suggestions',
      categories: '/products/categories',
      featured: '/products/featured',
    },
    
    // Cart
    cart: {
      get: '/cart',
      add: '/cart/add',
      update: '/cart/update',
      remove: '/cart/remove',
      clear: '/cart/clear',
    },
    
    // Orders
    orders: {
      list: '/orders',
      create: '/orders',
      detail: (id) => `/orders/${id}`,
      update: (id) => `/orders/${id}`,
      approve: (id) => `/orders/${id}/approve`,
      reject: (id) => `/orders/${id}/reject`,
      resubmit: (id) => `/orders/${id}/resubmit`,
      payment: (id) => `/orders/${id}/payment`,
      items: (id) => `/orders/${id}/items`,
      editItems: (id) => `/orders/${id}/edit-items`,
      editAddresses: (id) => `/orders/${id}/edit-addresses`,
      requestApproval: '/orders/request-approval',
    },
    
    // User
    user: {
      profile: '/user/profile',
      addresses: '/user/addresses',
      wishlist: '/user/wishlist',
    },
    
    // Admin
    admin: {
      products: {
        list: '/admin/products',
        detail: (id) => `/admin/products/${id}`,
        create: '/admin/products',
        update: (id) => `/admin/products/${id}`,
        delete: (id) => `/admin/products/${id}`,
        bulk: '/admin/products/bulk',
        categories: '/admin/products/categories',
        stats: '/admin/products/stats',
      },
      orders: {
        list: '/admin/orders',
        detail: (id) => `/admin/orders/${id}`,
      },
    },
    
    // Health Check
    health: '/api/health',
  },

  // Image Configuration
  images: {
    cloudinary: {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dvmuf6jfj',
      baseURL: 'https://res.cloudinary.com',
    },
    quality: 75,
    formats: ['webp', 'avif'],
    placeholder: 'blur',
  },

  // Application Settings
  app: {
    name: 'USave',
    version: '1.0.0',
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@usave.com',
    adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@usave.com',
  },

  // Feature Flags
  features: {
    useMockAPI: isDevelopment && !process.env.NEXT_PUBLIC_API_URL,
    enableAnalytics: isProduction,
    enableErrorReporting: isProduction,
    enableConsoleLogs: isDevelopment,
  },

  // Pagination
  pagination: {
    defaultPageSize: 12,
    maxPageSize: 50,
  },

  // Cart Configuration
  cart: {
    maxItems: 100,
    freeShippingThreshold: 200,
    taxRate: 0.1, // 10% GST
    defaultShippingCost: 29.95,
  },

  // Shipping Options
  shipping: {
    deliveryOnly: { id: 'delivery-only', label: 'Delivery only', price: 18 },
    deliveryInstallation: { id: 'delivery-installation', label: 'Delivery & Installation', price: 25 },
    installation: { id: 'installation', label: 'Installation', price: 7 },
    pickup: { id: 'pickup', label: 'Pick up on my own', price: 0 },
  },

  // Warranty Options
  warranty: {
    none: { id: '', label: 'No warranty', price: 0 },
    oneYear: { id: '1-year', label: '1 Year warranty', price: 25 },
    twoYear: { id: '2-year', label: '2 Year warranty', price: 25 },
  },

  // Search Configuration
  search: {
    debounceDelay: 300,
    minQueryLength: 2,
    maxResults: 100,
  },

  // Authentication
  auth: {
    tokenKey: 'authToken',
    userKey: 'userData',
    refreshThreshold: 5 * 60 * 1000, // 5 minutes
  },

  // Payment Configuration
  payment: {
    methods: ['card', 'paypal', 'bank_transfer'],
    simulateDelay: isDevelopment ? 2000 : 0, // ms
  },

  // Performance
  performance: {
    imageLazyLoad: true,
    prefetchPages: ['/search', '/categories'],
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
  },

  // Validation Rules
  validation: {
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address',
    },
    phone: {
      pattern: /^[\d\s()+-]+$/,
      message: 'Please enter a valid phone number',
    },
    postalCode: {
      pattern: /^\d{4,10}$/,
      message: 'Please enter a valid postal code',
    },
    cardNumber: {
      minLength: 13,
      maxLength: 19,
      message: 'Card number must be between 13-19 digits',
    },
    cvv: {
      minLength: 3,
      maxLength: 4,
      message: 'CVV must be 3 or 4 digits',
    },
  },
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  // Remove /api if already present in baseURL
  const base = config.api.baseURL.endsWith('/api') 
    ? config.api.baseURL 
    : `${config.api.baseURL}/api`;
  return `${base}/${cleanEndpoint}`.replace(/([^:]\/)\/+/g, '$1');
};

// Helper function to get full page URL
export const getPageUrl = (path) => {
  const base = config.urls.client;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};

export default config;
