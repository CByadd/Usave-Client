# Tech Stack Implementation

## State Management Architecture

### Server-Synced Data (TanStack Query)
**Use for:** Products, categories, search results, etc.

**Files:**
- `src/app/hooks/useProducts.js` - Product query hooks
- `src/app/providers.jsx` - TanStack Query provider setup

**Hooks Available:**
- `useProducts(filters)` - Get all products with filters
- `useInfiniteProducts(filters)` - Infinite scroll for products
- `useProduct(id)` - Get single product by ID
- `useSearchProducts(query, filters)` - Search products
- `useFeaturedProducts(limit)` - Get featured products
- `useProductsByCategory(category, filters)` - Get products by category
- `useRelatedProducts(productId, limit)` - Get related products
- `useCategories()` - Get all categories
- `useSearchSuggestions(query, limit)` - Get search suggestions

**Example Usage:**
```jsx
import { useProducts, useProduct } from '@/app/hooks/useProducts';

function ProductList() {
  const { data, isLoading, error } = useProducts({ 
    category: 'living',
    page: 1,
    limit: 12 
  });
  
  if (isLoading) return <Loading />;
  if (error) return <Error />;
  
  return <div>{data?.products.map(...)}</div>;
}
```

### Client-Side State (Zustand)
**Use for:** Cart, modals, drawers, filters, UI state

**Stores:**
- `src/app/stores/useCartStore.js` - Cart management
- `src/app/stores/useUIStore.js` - UI state (drawers, modals, filters)

**Cart Store:**
```jsx
import { useCart } from '@/app/stores/useCartStore';

const { 
  cartItems, 
  totals, 
  addToCart, 
  removeFromCart,
  updateQuantity,
  clearCart 
} = useCart();
```

**UI Store:**
```jsx
import { useUIStore } from '@/app/stores/useUIStore';

// Drawers
const isCartDrawerOpen = useUIStore((state) => state.isCartDrawerOpen);
const openCartDrawer = useUIStore((state) => state.openCartDrawer);
const closeCartDrawer = useUIStore((state) => state.closeCartDrawer);

// Filters
const productFilters = useUIStore((state) => state.productFilters);
const setProductFilters = useUIStore((state) => state.setProductFilters);
const updateProductFilter = useUIStore((state) => state.updateProductFilter);

// Search
const searchQuery = useUIStore((state) => state.searchQuery);
const setSearchQuery = useUIStore((state) => state.setSearchQuery);
```

## Migration Guide

### Migrating from productService to TanStack Query

**Before:**
```jsx
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const loadProducts = async () => {
    setLoading(true);
    const response = await productService.getAllProducts();
    setProducts(response.data.products);
    setLoading(false);
  };
  loadProducts();
}, []);
```

**After:**
```jsx
import { useProducts } from '@/app/hooks/useProducts';

const { data, isLoading } = useProducts();
const products = data?.products || [];
```

### Migrating UI State to Zustand

**Before:**
```jsx
const [isOpen, setIsOpen] = useState(false);
const openDrawer = () => setIsOpen(true);
const closeDrawer = () => setIsOpen(false);
```

**After:**
```jsx
import { useUIStore } from '@/app/stores/useUIStore';

const isOpen = useUIStore((state) => state.isCartDrawerOpen);
const openDrawer = useUIStore((state) => state.openCartDrawer);
const closeDrawer = useUIStore((state) => state.closeCartDrawer);
```

## Benefits

### TanStack Query
- ✅ Automatic caching
- ✅ Background refetching
- ✅ Pagination support
- ✅ SSR-safe
- ✅ Optimistic updates
- ✅ Request deduplication

### Zustand
- ✅ Lightweight (< 1KB)
- ✅ No provider needed
- ✅ Fast performance
- ✅ TypeScript support
- ✅ DevTools support
- ✅ Simple API

