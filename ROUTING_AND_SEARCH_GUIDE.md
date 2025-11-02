# Routing and Search Functionality Guide

This document outlines the implemented routing and search functionality for the Usave Commercial application.

## 🚀 Features Implemented

### 1. **Global Search Context**
- **File**: `src/app/context/SearchContext.js`
- **Purpose**: Manages global search state across the application
- **Features**:
  - Search query management
  - Search results storage
  - Filter management (category, price, sort, stock status)
  - URL parameter synchronization
  - Mock search API integration

### 2. **Page Routing Structure**

#### **Category Pages**
- `/categories/living` - Living room furniture
- `/categories/dining` - Dining room furniture  
- `/categories/bedroom` - Bedroom furniture
- `/categories/kitchen` - Kitchen furniture
- `/categories/electronics` - Electronic appliances

#### **Product Pages**
- `/products/[id]` - Individual product detail pages
- Dynamic routing for product IDs
- Comprehensive product information display

#### **Search Pages**
- `/search` - Search results page
- URL parameters: `?q=query&category=category&sort=sort`

#### **Other Pages**
- `/contact` - Contact page with form
- `/` - Home page (Landing)

### 3. **Search Functionality**

#### **Search Bar Integration**
- **File**: `src/app/components/layouts/Searchbar.jsx`
- **Features**:
  - Real-time search input
  - Search context integration
  - Loading states
  - Form submission handling

#### **Search Results**
- **File**: `src/app/pages/SearchResultsPage.jsx`
- **Features**:
  - Dynamic result display
  - Search query display
  - Result count
  - Product linking
  - Category filtering

#### **Product Listing**
- **File**: `src/app/pages/ProductListingPage.jsx`
- **Features**:
  - Category-specific filtering
  - Search context integration
  - Product grid display
  - Individual product links

### 4. **Navigation Updates**

#### **Navbar Integration**
- **File**: `src/app/components/Navbar.jsx`
- **Updates**:
  - Category links point to proper routes
  - Search integration
  - Contact page link

#### **Layout Provider**
- **File**: `src/app/layout.js`
- **Updates**:
  - SearchProvider wrapper
  - Global context availability

## 🔧 Technical Implementation

### **Search Context API**

```javascript
const {
  searchQuery,        // Current search query
  setSearchQuery,      // Update search query
  searchResults,       // Array of search results
  isSearching,         // Loading state
  filters,            // Current filters object
  updateFilters,      // Update filter values
  performSearch,      // Execute search
  clearSearch         // Clear search state
} = useSearch();
```

### **URL Parameter Support**

- `?q=sofa` - Search query
- `?category=living` - Category filter
- `?sort=price-low` - Sort option
- `?sort=price-high` - Sort option
- `?sort=rating` - Sort option
- `?sort=newest` - Sort option

### **Filter Options**

```javascript
const filters = {
  category: 'living',           // Category filter
  priceRange: { min: 0, max: 10000 }, // Price range
  sortBy: 'relevance',          // Sort method
  inStock: false               // Stock filter
};
```

## 📱 User Experience

### **Search Flow**
1. User types in search bar
2. Search query is stored in context
3. URL is updated with search parameters
4. Search results are displayed
5. Users can filter and sort results
6. Users can navigate to product details

### **Navigation Flow**
1. Users can browse by category
2. Category pages show filtered products
3. Product cards link to detail pages
4. Search results link to products
5. Breadcrumb navigation for context

### **Product Detail Flow**
1. Users click on product cards
2. Navigate to `/products/[id]`
3. View comprehensive product information
4. Add to cart functionality
5. Related products and specifications

## 🎯 Key Features

### **Search Features**
- ✅ Real-time search input
- ✅ URL parameter synchronization
- ✅ Category filtering
- ✅ Price range filtering
- ✅ Sort options (price, rating, newest)
- ✅ Stock status filtering
- ✅ Search result count
- ✅ Loading states

### **Routing Features**
- ✅ Dynamic category pages
- ✅ Individual product pages
- ✅ Search results page
- ✅ Contact page
- ✅ Breadcrumb navigation
- ✅ Back navigation

### **Product Features**
- ✅ Product image galleries
- ✅ Detailed specifications
- ✅ Price display with discounts
- ✅ Stock status indicators
- ✅ Rating and reviews
- ✅ Add to cart functionality
- ✅ Wishlist functionality

## 🔄 Integration Points

### **Search Context Integration**
- All search-related components use the global context
- URL parameters are automatically synchronized
- Search state persists across navigation
- Filter changes trigger new searches

### **Component Integration**
- SearchBar integrates with context
- ProductListingPage uses search results
- SearchResultsPage displays filtered results
- Product cards link to detail pages
- Navigation links to category pages

## 🚀 Future Enhancements

### **Potential Improvements**
1. **Real API Integration**
   - Replace mock search with actual API calls
   - Implement pagination for large result sets
   - Add search suggestions and autocomplete

2. **Advanced Filtering**
   - Color filtering
   - Brand filtering
   - Size filtering
   - Material filtering

3. **Search Analytics**
   - Track popular searches
   - Search result click tracking
   - User behavior analytics

4. **Performance Optimization**
   - Search result caching
   - Lazy loading for images
   - Virtual scrolling for large lists

## 📝 Usage Examples

### **Basic Search**
```javascript
// In any component
const { performSearch, searchQuery } = useSearch();

// Perform search
performSearch('sofa');

// Get current query
console.log(searchQuery);
```

### **Category Navigation**
```javascript
// Navigate to category
router.push('/categories/living');

// Navigate to product
router.push('/products/123');
```

### **Filter Updates**
```javascript
// Update filters
updateFilters({ 
  category: 'living',
  priceRange: { min: 500, max: 2000 },
  sortBy: 'price-low'
});
```

This implementation provides a comprehensive search and routing system that enhances user experience and makes the application more navigable and searchable.











