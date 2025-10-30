# Step-by-Step Execution Guide

## 🎯 Complete Refactoring Process

Follow these steps in order to safely refactor your codebase to production-level standards.

---

## Phase 1: Preparation (5 minutes)

### Step 1.1: Review Documentation
- [ ] Read `REFACTORING_SUMMARY.md`
- [ ] Review `QUICK_REFERENCE.md`
- [ ] Check `REFACTOR_GUIDE.md` for details

### Step 1.2: Commit Current State
```bash
git add .
git commit -m "Pre-refactoring commit"
git branch refactor-backup
```

### Step 1.3: Close Development Server
- [ ] Stop any running dev servers
- [ ] Close all file watchers

---

## Phase 2: Execute Refactoring (10 minutes)

### Step 2.1: Run the Refactoring Script
```powershell
cd x:\StackXX\Usave\client
.\refactor-script.ps1
```

**Expected Output:**
- ✅ Backup created
- ✅ New directories created
- ✅ Files moved and renamed
- ✅ Empty directories cleaned

### Step 2.2: Verify File Moves
Check that files exist in new locations:
```powershell
# Check home components
Test-Path "src/app/components/home/HeroSection.jsx"
Test-Path "src/app/components/home/CategoryShowcase.jsx"

# Check contexts
Test-Path "src/app/contexts/AuthContext.jsx"
Test-Path "src/app/contexts/CartContext.jsx"

# Check services
Test-Path "src/app/services/api/apiClient.js"
```

---

## Phase 3: Create Index Files (15 minutes)

### Step 3.1: Create Component Index Files

**components/layout/index.js**
```javascript
export { default as Navbar } from './Navbar';
export { default as Footer } from './Footer';
```

**components/home/index.js**
```javascript
export { default as HeroSection } from './HeroSection';
export { default as CategoryShowcase } from './CategoryShowcase';
export { default as FullWidthCategories } from './FullWidthCategories';
export { default as ProductCarousel } from './ProductCarousel';
export { default as CategoryCarousel } from './CategoryCarousel';
export { default as InfoSection } from './InfoSection';
```

**components/product/index.js**
```javascript
export { default as ProductCard } from './ProductCard';
export { default as ProductList } from './ProductList';
```

**components/search/index.js**
```javascript
export { default as SearchBar } from './SearchBar';
export { default as CategoryHeader } from './CategoryHeader';
```

**components/shared/index.js**
```javascript
export { default as LoadingSpinner } from './LoadingSpinner';
export { default as LoadingSkeleton } from './LoadingSkeleton';
export { default as OptimizedImage } from './OptimizedImage';
export { default as InfoBanner } from './InfoBanner';
```

### Step 3.2: Create Context Index File

**contexts/index.js**
```javascript
export { AuthProvider, useAuth } from './AuthContext';
export { CartProvider, useCart } from './CartContext';
export { WishlistProvider, useWishlist } from './WishlistContext';
export { CheckoutProvider, useCheckout } from './CheckoutContext';
export { SearchProvider, useSearch } from './SearchContext';
export { UIProvider, useUI } from './UIContext';
```

### Step 3.3: Create Service Index Files

**services/api/index.js**
```javascript
export { default as apiService } from './apiClient';
export * from './productService';
```

**services/index.js**
```javascript
export * from './api';
```

### Step 3.4: Create Other Index Files

**lib/index.js**
```javascript
export * from './constants';
export * from './config';
```

**data/index.js**
```javascript
export { default as categories } from './categories.json';
export { default as products } from './products.json';
export { default as designShowcase } from './designShowcase.json';
export { default as placeCategories } from './placeCategories.json';
export { default as featuredItemsA } from './featuredItemsA.json';
export { default as featuredItemsB } from './featuredItemsB.json';
export { default as allProducts } from './allProducts.json';
```

---

## Phase 4: Update Import Statements (30 minutes)

### Step 4.1: Update layout.js

**Find and replace in layout.js:**

```javascript
// OLD IMPORTS
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SearchProviderWrapper from "./components/providers/SearchProviderWrapper";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CheckoutProvider } from "./context/CheckoutContext";
import { UIProvider } from "./context/UIContext";

// NEW IMPORTS
import { Navbar, Footer } from "./components/layout";
import { SearchProvider } from "./components/providers";
import {
  AuthProvider,
  CartProvider,
  WishlistProvider,
  CheckoutProvider,
  UIProvider
} from "./contexts";
```

Update the component usage:
```javascript
// OLD
<SearchProviderWrapper>

// NEW
<SearchProvider>
```

Update styles import:
```javascript
// OLD
import "./globals.css";

// NEW
import "./styles/globals.css";
```

### Step 4.2: Update Home Page (page.js)

Use VS Code Find in Files (Ctrl+Shift+F):

**Pattern 1: Context imports**
```
Find: from './context/
Replace: from './contexts/

Find: from '../context/
Replace: from '../contexts/
```

**Pattern 2: Component imports**
```
Find: from './components/layouts/Hero'
Replace: from './components/home/HeroSection'

Find: from './components/layouts/DesignCat'
Replace: from './components/home/CategoryShowcase'

Find: from './components/layouts/FullWCategory'
Replace: from './components/home/FullWidthCategories'

Find: from './components/layouts/ProductCarousel'
Replace: from './components/home/ProductCarousel'

Find: from './components/layouts/CategoryCarousel'
Replace: from './components/home/CategoryCarousel'

Find: from './components/layouts/InfoCat'
Replace: from './components/home/InfoSection'
```

**Pattern 3: Component names in JSX**
```
Find: <Hero
Replace: <HeroSection

Find: <DesignCat
Replace: <CategoryShowcase

Find: <FullWCategory
Replace: <FullWidthCategories

Find: <InfoCat
Replace: <InfoSection
```

### Step 4.3: Update Product Components

**In all files using ItemCard:**
```
Find: from './layouts/ItemCard'
Replace: from './product/ProductCard'

Find: from '../layouts/ItemCard'
Replace: from '../product/ProductCard'

Find: from '../../components/layouts/ItemCard'
Replace: from '../../components/product/ProductCard'

Find: <ItemCard
Replace: <ProductCard
```

**In files using ProductListingPage:**
```
Find: from './shared/ProductListingPage'
Replace: from './product/ProductList'

Find: <ProductListingPage
Replace: <ProductList
```

### Step 4.4: Update Search Components

```
Find: from './layouts/Searchbar'
Replace: from './search/SearchBar'

Find: from './layouts/CatHeader'
Replace: from './search/CategoryHeader'

Find: <Searchbar
Replace: <SearchBar

Find: <CatHeader
Replace: <CategoryHeader
```

### Step 4.5: Update Data Imports

```
Find: from './data/Aitems.json'
Replace: from './data/featuredItemsA.json'

Find: from './data/Bitems.json'
Replace: from './data/featuredItemsB.json'

Find: from './data/items.json'
Replace: from './data/allProducts.json'

Find: from './data/Placecategories.json'
Replace: from './data/placeCategories.json'

Find: from './data/designData.json'
Replace: from './data/designShowcase.json'
```

### Step 4.6: Update Constants/Config Imports

```
Find: from '../constant/constant'
Replace: from '../lib/constants'

Find: from './constant/constant'
Replace: from './lib/constants'

Find: from '../config/config'
Replace: from '../lib/config'
```

### Step 4.7: Update Service Imports

```
Find: from '../services/api'
Replace: from '../services/api/apiClient'

Find: from './services/api'
Replace: from './services/api/apiClient'
```

---

## Phase 5: Testing (20 minutes)

### Step 5.1: Start Development Server
```bash
npm run dev
```

### Step 5.2: Test All Pages
- [ ] Home page (/)
- [ ] Products page (/products)
- [ ] Product detail page (/products/[id])
- [ ] Cart page (/cart)
- [ ] Wishlist page (/wishlist)
- [ ] Search page (/search)
- [ ] Checkout page (/checkout)
- [ ] Contact page (/contact)
- [ ] Orders page (/orders)
- [ ] Admin page (/admin)

### Step 5.3: Test All Features
- [ ] Navigation works
- [ ] Search functionality
- [ ] Add to cart
- [ ] Add to wishlist
- [ ] Cart operations (add, remove, update quantity)
- [ ] Wishlist operations
- [ ] Login/Register modals
- [ ] Product filtering
- [ ] Category navigation

### Step 5.4: Check Console
- [ ] No import errors
- [ ] No module not found errors
- [ ] No runtime errors

### Step 5.5: Test Build
```bash
npm run build
```

---

## Phase 6: Cleanup (5 minutes)

### Step 6.1: Remove Old Empty Directories
```powershell
# These should already be removed by the script, but double-check
Remove-Item "src/app/components/layouts" -Force -ErrorAction SilentlyContinue
Remove-Item "src/app/context" -Force -ErrorAction SilentlyContinue
Remove-Item "src/app/constant" -Force -ErrorAction SilentlyContinue
Remove-Item "src/app/config" -Force -ErrorAction SilentlyContinue
```

### Step 6.2: Delete Backup (After Full Verification)
```powershell
# Only after everything works perfectly!
Remove-Item "backup_*" -Recurse -Force
```

### Step 6.3: Commit Changes
```bash
git add .
git commit -m "refactor: reorganize file structure for production

- Renamed components with descriptive names
- Organized components by feature/domain
- Moved contexts to contexts/ directory
- Created barrel exports via index.js files
- Updated all import statements
- Follows production-level best practices"
```

---

## 🎉 Success Checklist

- [ ] All files moved to new locations
- [ ] All index.js files created
- [ ] layout.js updated
- [ ] All import statements updated
- [ ] All pages load without errors
- [ ] All features work correctly
- [ ] Build succeeds
- [ ] No console errors
- [ ] Backup deleted
- [ ] Changes committed

---

## ⚠️ Troubleshooting

### Issue: Module not found error
**Solution:**
1. Check if the file exists in the new location
2. Verify the import path is correct
3. Ensure index.js file exists in the directory

### Issue: Component not rendering
**Solution:**
1. Check if component name was updated in JSX
2. Verify export/import syntax
3. Check for typos in component names

### Issue: Build fails
**Solution:**
1. Check all file extensions (.jsx vs .js)
2. Verify all imports are updated
3. Check for circular dependencies

### Issue: Context not working
**Solution:**
1. Verify contexts/index.js exports correctly
2. Check Provider names in layout.js
3. Ensure all context files have .jsx extension

---

## 📞 Need Help?

If you encounter issues:
1. Check the backup folder
2. Review QUICK_REFERENCE.md
3. Restore from git if needed: `git checkout .`
4. Run script again after fixing issues

---

## 🎯 Final Result

A clean, organized, production-ready codebase with:
- ✅ Proper naming conventions
- ✅ Feature-based organization
- ✅ Clean imports
- ✅ Scalable structure
- ✅ Industry best practices
