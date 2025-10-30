# Production-Level File Structure Refactoring Script
# Run this from the client/ directory
# Usage: .\refactor-script.ps1

$ErrorActionPreference = "Stop"
$baseDir = "src/app"

Write-Host "Starting file structure refactoring..." -ForegroundColor Green
Write-Host "Base directory: $baseDir" -ForegroundColor Cyan

# Create backup
$backupDir = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Write-Host "`nCreating backup in $backupDir..." -ForegroundColor Yellow
Copy-Item -Path $baseDir -Destination $backupDir -Recurse -Force
Write-Host "Backup created successfully!" -ForegroundColor Green

# Step 1: Create new directory structure
Write-Host "`nStep 1: Creating new directories..." -ForegroundColor Cyan

$newDirs = @(
    "$baseDir/components/layout",
    "$baseDir/components/home",
    "$baseDir/components/product",
    "$baseDir/components/search",
    "$baseDir/contexts",
    "$baseDir/services/api",
    "$baseDir/lib",
    "$baseDir/styles"
)

foreach ($dir in $newDirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  Created: $dir" -ForegroundColor Green
    } else {
        Write-Host "  Exists: $dir" -ForegroundColor Yellow
    }
}

# Step 2: Move and rename component files
Write-Host "`nStep 2: Moving and renaming component files..." -ForegroundColor Cyan

$componentMoves = @(
    # Layout components
    @{From="$baseDir/components/Navbar.jsx"; To="$baseDir/components/layout/Navbar.jsx"},
    @{From="$baseDir/components/Footer.jsx"; To="$baseDir/components/layout/Footer.jsx"},
    
    # Home components
    @{From="$baseDir/components/layouts/Hero.jsx"; To="$baseDir/components/home/HeroSection.jsx"},
    @{From="$baseDir/components/layouts/DesignCat.jsx"; To="$baseDir/components/home/CategoryShowcase.jsx"},
    @{From="$baseDir/components/layouts/FullWCategory.jsx"; To="$baseDir/components/home/FullWidthCategories.jsx"},
    @{From="$baseDir/components/layouts/InfoCat.jsx"; To="$baseDir/components/home/InfoSection.jsx"},
    @{From="$baseDir/components/layouts/ProductCarousel.jsx"; To="$baseDir/components/home/ProductCarousel.jsx"},
    @{From="$baseDir/components/layouts/CategoryCarousel.jsx"; To="$baseDir/components/home/CategoryCarousel.jsx"},
    
    # Product components
    @{From="$baseDir/components/layouts/ItemCard.jsx"; To="$baseDir/components/product/ProductCard.jsx"},
    @{From="$baseDir/components/shared/ProductListingPage.jsx"; To="$baseDir/components/product/ProductList.jsx"},
    
    # Search components
    @{From="$baseDir/components/layouts/CatHeader.jsx"; To="$baseDir/components/search/CategoryHeader.jsx"},
    @{From="$baseDir/components/layouts/Searchbar.jsx"; To="$baseDir/components/search/SearchBar.jsx"},
    
    # Shared components
    @{From="$baseDir/components/Info.jsx"; To="$baseDir/components/shared/InfoBanner.jsx"},
    @{From="$baseDir/components/shared/LoadingSkeletons.jsx"; To="$baseDir/components/shared/LoadingSkeleton.jsx"},
    
    # Providers
    @{From="$baseDir/components/providers/SearchProviderWrapper.jsx"; To="$baseDir/components/providers/SearchProvider.jsx"}
)

foreach ($move in $componentMoves) {
    if (Test-Path $move.From) {
        Move-Item -Path $move.From -Destination $move.To -Force
        Write-Host "  Moved: $($move.From) -> $($move.To)" -ForegroundColor Green
    } else {
        Write-Host "  Not found: $($move.From)" -ForegroundColor Red
    }
}

# Step 3: Move and rename context files
Write-Host "`nStep 3: Moving context files to contexts/..." -ForegroundColor Cyan

$contextFiles = @(
    "AuthContext.js",
    "CartContext.js",
    "WishlistContext.js",
    "CheckoutContext.js",
    "SearchContext.js",
    "UIContext.js"
)

foreach ($file in $contextFiles) {
    $from = "$baseDir/context/$file"
    $to = "$baseDir/contexts/$($file -replace '\.js$', '.jsx')"
    
    if (Test-Path $from) {
        Move-Item -Path $from -Destination $to -Force
        Write-Host "  Moved: $from -> $to" -ForegroundColor Green
    } else {
        Write-Host "  Not found: $from" -ForegroundColor Red
    }
}

# Step 4: Move and rename service files
Write-Host "`nStep 4: Organizing service files..." -ForegroundColor Cyan

$serviceMoves = @(
    @{From="$baseDir/services/api.js"; To="$baseDir/services/api/apiClient.js"},
    @{From="$baseDir/services/productService.js"; To="$baseDir/services/api/productService.js"}
)

foreach ($move in $serviceMoves) {
    if (Test-Path $move.From) {
        Move-Item -Path $move.From -Destination $move.To -Force
        Write-Host "  Moved: $($move.From) -> $($move.To)" -ForegroundColor Green
    } else {
        Write-Host "  Not found: $($move.From)" -ForegroundColor Red
    }
}

# Step 5: Move config files to lib/
Write-Host "`nStep 5: Moving config files to lib/..." -ForegroundColor Cyan

$configMoves = @(
    @{From="$baseDir/constant/constant.js"; To="$baseDir/lib/constants.js"},
    @{From="$baseDir/config/config.js"; To="$baseDir/lib/config.js"}
)

foreach ($move in $configMoves) {
    if (Test-Path $move.From) {
        Move-Item -Path $move.From -Destination $move.To -Force
        Write-Host "  Moved: $($move.From) -> $($move.To)" -ForegroundColor Green
    } else {
        Write-Host "  Not found: $($move.From)" -ForegroundColor Red
    }
}

# Step 6: Rename data files
Write-Host "`nStep 6: Renaming data files..." -ForegroundColor Cyan

$dataRenames = @(
    @{From="$baseDir/data/Aitems.json"; To="$baseDir/data/featuredItemsA.json"},
    @{From="$baseDir/data/Bitems.json"; To="$baseDir/data/featuredItemsB.json"},
    @{From="$baseDir/data/items.json"; To="$baseDir/data/allProducts.json"},
    @{From="$baseDir/data/Placecategories.json"; To="$baseDir/data/placeCategories.json"},
    @{From="$baseDir/data/designData.json"; To="$baseDir/data/designShowcase.json"}
)

foreach ($rename in $dataRenames) {
    if (Test-Path $rename.From) {
        Move-Item -Path $rename.From -Destination $rename.To -Force
        Write-Host "  Renamed: $($rename.From) -> $($rename.To)" -ForegroundColor Green
    } else {
        Write-Host "  Not found: $($rename.From)" -ForegroundColor Red
    }
}

# Step 7: Move globals.css to styles/
Write-Host "`nStep 7: Moving globals.css to styles/..." -ForegroundColor Cyan

if (Test-Path "$baseDir/globals.css") {
    Move-Item -Path "$baseDir/globals.css" -Destination "$baseDir/styles/globals.css" -Force
    Write-Host "  Moved: globals.css -> styles/globals.css" -ForegroundColor Green
}

# Step 8: Rename script file
Write-Host "`nStep 8: Renaming script files..." -ForegroundColor Cyan

if (Test-Path "$baseDir/scripts/generate-icons.js") {
    Move-Item -Path "$baseDir/scripts/generate-icons.js" -Destination "$baseDir/scripts/generateIcons.js" -Force
    Write-Host "  Renamed: generate-icons.js -> generateIcons.js" -ForegroundColor Green
}

# Step 9: Clean up empty directories
Write-Host "`nStep 9: Cleaning up empty directories..." -ForegroundColor Cyan

$emptyDirs = @(
    "$baseDir/components/layouts",
    "$baseDir/context",
    "$baseDir/constant",
    "$baseDir/config"
)

foreach ($dir in $emptyDirs) {
    if ((Test-Path $dir) -and ((Get-ChildItem $dir).Count -eq 0)) {
        Remove-Item -Path $dir -Force
        Write-Host "  Removed empty: $dir" -ForegroundColor Green
    }
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Refactoring completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Create index.js files for barrel exports" -ForegroundColor White
Write-Host "2. Update all import statements throughout the codebase" -ForegroundColor White
Write-Host "3. Update layout.js with new import paths" -ForegroundColor White
Write-Host "4. Test all pages and features" -ForegroundColor White
Write-Host "5. Delete backup folder after verification" -ForegroundColor White
Write-Host "`nBackup location: $backupDir" -ForegroundColor Cyan
