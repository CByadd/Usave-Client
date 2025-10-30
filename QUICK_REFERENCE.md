# Quick Reference: File Renaming Map

## 🎯 Quick Lookup Table

### Components

| Old Path | New Path |
|----------|----------|
| `components/Navbar.jsx` | `components/layout/Navbar.jsx` |
| `components/Footer.jsx` | `components/layout/Footer.jsx` |
| `components/Info.jsx` | `components/shared/InfoBanner.jsx` |
| `components/layouts/Hero.jsx` | `components/home/HeroSection.jsx` |
| `components/layouts/DesignCat.jsx` | `components/home/CategoryShowcase.jsx` |
| `components/layouts/FullWCategory.jsx` | `components/home/FullWidthCategories.jsx` |
| `components/layouts/InfoCat.jsx` | `components/home/InfoSection.jsx` |
| `components/layouts/ProductCarousel.jsx` | `components/home/ProductCarousel.jsx` |
| `components/layouts/CategoryCarousel.jsx` | `components/home/CategoryCarousel.jsx` |
| `components/layouts/ItemCard.jsx` | `components/product/ProductCard.jsx` |
| `components/layouts/CatHeader.jsx` | `components/search/CategoryHeader.jsx` |
| `components/layouts/Searchbar.jsx` | `components/search/SearchBar.jsx` |
| `components/shared/ProductListingPage.jsx` | `components/product/ProductList.jsx` |
| `components/shared/LoadingSkeletons.jsx` | `components/shared/LoadingSkeleton.jsx` |
| `components/providers/SearchProviderWrapper.jsx` | `components/providers/SearchProvider.jsx` |

### Contexts (context/ → contexts/)

| Old Path | New Path |
|----------|----------|
| `context/AuthContext.js` | `contexts/AuthContext.jsx` |
| `context/CartContext.js` | `contexts/CartContext.jsx` |
| `context/WishlistContext.js` | `contexts/WishlistContext.jsx` |
| `context/CheckoutContext.js` | `contexts/CheckoutContext.jsx` |
| `context/SearchContext.js` | `contexts/SearchContext.jsx` |
| `context/UIContext.js` | `contexts/UIContext.jsx` |

### Services

| Old Path | New Path |
|----------|----------|
| `services/api.js` | `services/api/apiClient.js` |
| `services/productService.js` | `services/api/productService.js` |

### Data Files

| Old Path | New Path |
|----------|----------|
| `data/Aitems.json` | `data/featuredItemsA.json` |
| `data/Bitems.json` | `data/featuredItemsB.json` |
| `data/items.json` | `data/allProducts.json` |
| `data/Placecategories.json` | `data/placeCategories.json` |
| `data/designData.json` | `data/designShowcase.json` |

### Config & Constants

| Old Path | New Path |
|----------|----------|
| `constant/constant.js` | `lib/constants.js` |
| `config/config.js` | `lib/config.js` |

### Styles

| Old Path | New Path |
|----------|----------|
| `globals.css` | `styles/globals.css` |

### Scripts

| Old Path | New Path |
|----------|----------|
| `scripts/generate-icons.js` | `scripts/generateIcons.js` |

## 🔍 Import Path Changes

### Contexts
```javascript
// Old
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

// New
import { useCart, useWishlist } from '@/contexts';
```

### Components
```javascript
// Old
import ItemCard from './layouts/ItemCard';
import Hero from './layouts/Hero';
import Navbar from './components/Navbar';

// New
import { ProductCard } from '@/components/product';
import { HeroSection } from '@/components/home';
import { Navbar } from '@/components/layout';
```

### Services
```javascript
// Old
import { apiService } from '../services/api';
import { getProducts } from '../services/productService';

// New
import { apiService, getProducts } from '@/services';
```

### Data
```javascript
// Old
import categories from './data/Placecategories.json';
import items from './data/Aitems.json';

// New
import { placeCategories, featuredItemsA } from '@/data';
```

### Constants
```javascript
// Old
import { LOGO_WHITE_BG } from '../constant/constant';

// New
import { LOGO_WHITE_BG } from '@/lib/constants';
```

## 📦 Component Exports

### Home Components
```javascript
import {
  HeroSection,
  CategoryShowcase,
  FullWidthCategories,
  ProductCarousel,
  CategoryCarousel,
  InfoSection
} from '@/components/home';
```

### Product Components
```javascript
import {
  ProductCard,
  ProductList
} from '@/components/product';
```

### Layout Components
```javascript
import {
  Navbar,
  Footer
} from '@/components/layout';
```

### Search Components
```javascript
import {
  SearchBar,
  CategoryHeader
} from '@/components/search';
```

### Shared Components
```javascript
import {
  LoadingSpinner,
  LoadingSkeleton,
  OptimizedImage,
  InfoBanner
} from '@/components/shared';
```

## 🚀 Quick Start

1. **Run the script:**
   ```powershell
   .\refactor-script.ps1
   ```

2. **Create index files** from `index-files-template.md`

3. **Update imports** using find-and-replace

4. **Test everything**

5. **Delete backup** after verification

## 📋 Checklist

- [ ] Backup created
- [ ] Script executed successfully
- [ ] Index files created
- [ ] layout.js updated
- [ ] All imports updated
- [ ] Development server runs
- [ ] All pages load correctly
- [ ] All features work
- [ ] Build succeeds
- [ ] Backup deleted

## 💡 Tips

- Use VS Code's "Find in Files" (Ctrl+Shift+F) for bulk updates
- Update one directory at a time
- Test after each major change
- Keep the backup until fully verified
- Use path aliases (@/) for cleaner imports
