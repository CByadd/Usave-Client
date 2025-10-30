# Index Files for Barrel Exports

Create these index.js files after running the refactor script:

## components/layout/index.js
```javascript
export { default as Navbar } from './Navbar';
export { default as Footer } from './Footer';
```

## components/home/index.js
```javascript
export { default as HeroSection } from './HeroSection';
export { default as CategoryShowcase } from './CategoryShowcase';
export { default as FullWidthCategories } from './FullWidthCategories';
export { default as ProductCarousel } from './ProductCarousel';
export { default as CategoryCarousel } from './CategoryCarousel';
export { default as InfoSection } from './InfoSection';
```

## components/product/index.js
```javascript
export { default as ProductCard } from './ProductCard';
export { default as ProductList } from './ProductList';
```

## components/search/index.js
```javascript
export { default as SearchBar } from './SearchBar';
export { default as CategoryHeader } from './CategoryHeader';
```

## components/shared/index.js
```javascript
export { default as LoadingSpinner } from './LoadingSpinner';
export { default as LoadingSkeleton } from './LoadingSkeleton';
export { default as OptimizedImage } from './OptimizedImage';
export { default as InfoBanner } from './InfoBanner';
```

## components/cart/index.js
```javascript
export { default as CartDrawer } from './CartDrawer';
export { default as CartModal } from './CartModal';
```

## components/auth/index.js
```javascript
export { default as LoginModal } from './LoginModal';
export { default as RegisterModal } from './RegisterModal';
```

## components/providers/index.js
```javascript
export { default as SearchProvider } from './SearchProvider';
```

## contexts/index.js
```javascript
export { AuthProvider, useAuth } from './AuthContext';
export { CartProvider, useCart } from './CartContext';
export { WishlistProvider, useWishlist } from './WishlistContext';
export { CheckoutProvider, useCheckout } from './CheckoutContext';
export { SearchProvider, useSearch } from './SearchContext';
export { UIProvider, useUI } from './UIContext';
```

## services/api/index.js
```javascript
export { default as apiService } from './apiClient';
export * from './productService';
```

## services/index.js
```javascript
export * from './api';
```

## lib/index.js
```javascript
export * from './constants';
export * from './config';
```

## data/index.js
```javascript
export { default as categories } from './categories.json';
export { default as products } from './products.json';
export { default as designShowcase } from './designShowcase.json';
export { default as placeCategories } from './placeCategories.json';
export { default as featuredItemsA } from './featuredItemsA.json';
export { default as featuredItemsB } from './featuredItemsB.json';
export { default as allProducts } from './allProducts.json';
```

## utils/index.js
```javascript
export * from './logger';
```

## Usage Examples

### Before Refactoring:
```javascript
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ItemCard from './layouts/ItemCard';
import Navbar from './components/Navbar';
import { apiService } from '../services/api';
```

### After Refactoring:
```javascript
import { useCart, useWishlist } from '@/contexts';
import { ProductCard } from '@/components/product';
import { Navbar } from '@/components/layout';
import { apiService } from '@/services';
```

## Path Alias Configuration

Add to `jsconfig.json` or `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/app/*"],
      "@/components/*": ["./src/app/components/*"],
      "@/contexts/*": ["./src/app/contexts/*"],
      "@/services/*": ["./src/app/services/*"],
      "@/lib/*": ["./src/app/lib/*"],
      "@/utils/*": ["./src/app/utils/*"],
      "@/data/*": ["./src/app/data/*"]
    }
  }
}
```
