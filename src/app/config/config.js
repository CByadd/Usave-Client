// Application configuration
export const config = {
  // API Configuration
  api: {
    // baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://usave-server.vercel.app/api',

    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
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
    environment: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
  },

  // Feature Flags
  features: {
    useMockAPI: process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL,
    enableAnalytics: process.env.NODE_ENV === 'production',
    enableErrorReporting: process.env.NODE_ENV === 'production',
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

  // Performance
  performance: {
    imageLazyLoad: true,
    prefetchPages: ['/search', '/categories'],
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
  },
};

export default config;










