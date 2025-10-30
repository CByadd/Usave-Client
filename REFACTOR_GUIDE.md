# Production-Level File Structure Refactoring Guide

## Overview
This guide outlines the refactoring plan to reorganize the codebase with proper naming conventions and efficient structure for production use.

## Naming Conventions

### Files
- **React Components**: PascalCase with `.jsx` extension (e.g., `ProductCard.jsx`)
- **Utilities/Services**: camelCase with `.js` extension (e.g., `apiClient.js`)
- **Contexts**: PascalCase with `Context.jsx` suffix (e.g., `AuthContext.jsx`)
- **Pages**: lowercase with `.js` extension (Next.js convention) (e.g., `page.js`)
- **Data files**: camelCase with `.json` extension (e.g., `featuredProducts.json`)

### Directories
- **Components**: Organized by feature/domain (e.g., `product/`, `cart/`, `auth/`)
- **Contexts**: Renamed to `contexts/` (plural)
- **Shared**: Common components used across features

## File Rename Mapping

### Components (layouts/ → Organized by feature)

| Current Path | New Path | Reason |
|-------------|----------|--------|
| `components/layouts/Hero.jsx` | `components/home/HeroSection.jsx` | More descriptive, feature-based |
| `components/layouts/DesignCat.jsx` | `components/home/CategoryShowcase.jsx` | Clearer purpose |
| `components/layouts/FullWCategory.jsx` | `components/home/FullWidthCategories.jsx` | No abbreviations |
| `components/layouts/InfoCat.jsx` | `components/home/InfoSection.jsx` | Descriptive name |
| `components/layouts/ItemCard.jsx` | `components/product/ProductCard.jsx` | Domain-specific |
| `components/layouts/CatHeader.jsx` | `components/search/CategoryHeader.jsx` | Feature-based |
| `components/layouts/Searchbar.jsx` | `components/search/SearchBar.jsx` | PascalCase consistency |
| `components/layouts/ProductCarousel.jsx` | `components/home/ProductCarousel.jsx` | Feature-based |
| `components/layouts/CategoryCarousel.jsx` | `components/home/CategoryCarousel.jsx` | Feature-based |

### Shared Components

| Current Path | New Path | Reason |
|-------------|----------|--------|
| `components/shared/ProductListingPage.jsx` | `components/product/ProductList.jsx` | Simpler name |
| `components/shared/LoadingSkeletons.jsx` | `components/shared/LoadingSkeleton.jsx` | Singular form |
| `components/Info.jsx` | `components/shared/InfoBanner.jsx` | More descriptive |

### Layout Components

| Current Path | New Path | Reason |
|-------------|----------|--------|
| `components/Navbar.jsx` | `components/layout/Navbar.jsx` | Organized |
| `components/Footer.jsx` | `components/layout/Footer.jsx` | Organized |

### Contexts

| Current Path | New Path | Reason |
|-------------|----------|--------|
| `context/AuthContext.js` | `contexts/AuthContext.jsx` | Plural dir, .jsx extension |
| `context/CartContext.js` | `contexts/CartContext.jsx` | Plural dir, .jsx extension |
| `context/WishlistContext.js` | `contexts/WishlistContext.jsx` | Plural dir, .jsx extension |
| `context/CheckoutContext.js` | `contexts/CheckoutContext.jsx` | Plural dir, .jsx extension |
| `context/SearchContext.js` | `contexts/SearchContext.jsx` | Plural dir, .jsx extension |
| `context/UIContext.js` | `contexts/UIContext.jsx` | Plural dir, .jsx extension |

### Services

| Current Path | New Path | Reason |
|-------------|----------|--------|
| `services/api.js` | `services/api/apiClient.js` | More descriptive |
| `services/productService.js` | `services/api/productService.js` | Organized under api/ |

### Data Files

| Current Path | New Path | Reason |
|-------------|----------|--------|
| `data/Aitems.json` | `data/featuredItemsA.json` | Descriptive name |
| `data/Bitems.json` | `data/featuredItemsB.json` | Descriptive name |
| `data/items.json` | `data/allProducts.json` | Clearer purpose |
| `data/Placecategories.json` | `data/placeCategories.json` | camelCase |
| `data/designData.json` | `data/designShowcase.json` | More descriptive |

### Config & Constants

| Current Path | New Path | Reason |
|-------------|----------|--------|
| `constant/constant.js` | `lib/constants.js` | Standard lib folder |
| `config/config.js` | `lib/config.js` | Standard lib folder |

### Providers

| Current Path | New Path | Reason |
|-------------|----------|--------|
| `components/providers/SearchProviderWrapper.jsx` | `components/providers/SearchProvider.jsx` | Simpler name |

### Scripts

| Current Path | New Path | Reason |
|-------------|----------|--------|
| `scripts/generate-icons.js` | `scripts/generateIcons.js` | camelCase |

## New Directory Structure

```
src/app/
├── components/
│   ├── layout/              # NEW: Layout components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── index.js
│   ├── home/                # NEW: Home page components
│   │   ├── HeroSection.jsx
│   │   ├── CategoryShowcase.jsx
│   │   ├── FullWidthCategories.jsx
│   │   ├── ProductCarousel.jsx
│   │   ├── CategoryCarousel.jsx
│   │   ├── InfoSection.jsx
│   │   └── index.js
│   ├── product/             # NEW: Product components
│   │   ├── ProductCard.jsx
│   │   ├── ProductList.jsx
│   │   └── index.js
│   ├── search/              # NEW: Search components
│   │   ├── SearchBar.jsx
│   │   ├── CategoryHeader.jsx
│   │   └── index.js
│   ├── cart/
│   ├── auth/
│   ├── shared/
│   ├── admin/
│   ├── orders/
│   └── providers/
├── contexts/                # RENAMED from context/
│   ├── AuthContext.jsx
│   ├── CartContext.jsx
│   ├── WishlistContext.jsx
│   ├── CheckoutContext.jsx
│   ├── SearchContext.jsx
│   ├── UIContext.jsx
│   └── index.js             # NEW: Barrel export
├── services/
│   ├── api/                 # NEW: API services grouped
│   │   ├── apiClient.js
│   │   ├── productService.js
│   │   └── index.js
│   └── index.js
├── lib/                     # NEW: Config and constants
│   ├── constants.js
│   └── config.js
├── data/
├── utils/
└── styles/                  # RENAMED from root globals.css
    └── globals.css
```

## Implementation Steps

### Step 1: Create New Directories
```powershell
# Run from client/src/app/
New-Item -ItemType Directory -Path "components/layout" -Force
New-Item -ItemType Directory -Path "components/home" -Force
New-Item -ItemType Directory -Path "components/product" -Force
New-Item -ItemType Directory -Path "components/search" -Force
New-Item -ItemType Directory -Path "contexts" -Force
New-Item -ItemType Directory -Path "services/api" -Force
New-Item -ItemType Directory -Path "lib" -Force
New-Item -ItemType Directory -Path "styles" -Force
```

### Step 2: Move and Rename Files
See `refactor-script.ps1` for automated migration

### Step 3: Create Index Files
Each feature directory should have an `index.js` for clean imports:

**Example: components/home/index.js**
```javascript
export { default as HeroSection } from './HeroSection';
export { default as CategoryShowcase } from './CategoryShowcase';
export { default as FullWidthCategories } from './FullWidthCategories';
export { default as ProductCarousel } from './ProductCarousel';
export { default as CategoryCarousel } from './CategoryCarousel';
export { default as InfoSection } from './InfoSection';
```

**Example: contexts/index.js**
```javascript
export { AuthProvider, useAuth } from './AuthContext';
export { CartProvider, useCart } from './CartContext';
export { WishlistProvider, useWishlist } from './WishlistContext';
export { CheckoutProvider, useCheckout } from './CheckoutContext';
export { SearchProvider, useSearch } from './SearchContext';
export { UIProvider, useUI } from './UIContext';
```

### Step 4: Update Import Statements
After moving files, update all imports throughout the codebase.

**Before:**
```javascript
import { useCart } from '../context/CartContext';
import ItemCard from './layouts/ItemCard';
```

**After:**
```javascript
import { useCart } from '@/contexts';
import { ProductCard } from '@/components/product';
```

## Benefits

1. **Clear Organization**: Components grouped by feature/domain
2. **No Abbreviations**: Descriptive, self-documenting names
3. **Consistent Naming**: PascalCase for components, camelCase for utilities
4. **Better Imports**: Barrel exports via index.js files
5. **Scalability**: Easy to add new features
6. **Production Ready**: Follows industry best practices

## Migration Checklist

- [ ] Create new directory structure
- [ ] Move and rename component files
- [ ] Move and rename context files
- [ ] Move and rename service files
- [ ] Move and rename data files
- [ ] Move config files to lib/
- [ ] Create all index.js barrel exports
- [ ] Update all import statements
- [ ] Update layout.js with new paths
- [ ] Test all pages and features
- [ ] Update any build scripts
- [ ] Update documentation

## Notes

- Keep the old structure until all imports are updated
- Test thoroughly after each major change
- Use find-and-replace for import updates
- Consider using a codemod tool for large-scale refactoring
