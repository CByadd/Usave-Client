"use client";
import React, { useEffect } from 'react';
import OptimizedImage from '../../components/shared/OptimizedImage';
import { ProductDetailSkeleton } from '../../components/shared/LoadingSkeleton';
import { Heart, ShoppingCart, ShoppingBag, ChevronLeft, ChevronRight, ArrowRight, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { showToast } from '../../lib/ui';
import useProductStore from '../../stores/useProductStore';
import { useCartStore } from '../../stores/useCartStore';
import { useWishlistStore } from '../../stores/useWishlistStore';
import { useUIStore } from '../../stores/useUIStore';
import ProductCard from '../../components/product/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id;

  // Product Store
  const {
    product,
    relatedProducts,
    productReviews,
    reviewStats,
    isLoading,
    error,
    selectedImage,
    quantity,
    selectedColor,
    selectedSize,
    includeInstallation,
    activeTab,
    fetchProduct,
    setSelectedImage,
    setQuantity,
    incrementQuantity,
    decrementQuantity,
    setSelectedColor,
    setSelectedSize,
    setIncludeInstallation,
    setActiveTab,
    nextImage,
    prevImage,
    resetProduct,
  } = useProductStore();

  // Cart Store
  const {
    addToCart,
    isInCart,
    getItemQuantity,
    loadCart,
  } = useCartStore();

  // Wishlist Store
  const {
    toggleWishlist,
    isInWishlist,
    loadWishlist,
  } = useWishlistStore();

  // Auth Store
  // UI Store
  const { openCartDrawer } = useUIStore();

  // Load cart and wishlist on mount
  useEffect(() => {
    loadCart();
    loadWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch product when productId changes
  useEffect(() => {
    if (productId) {
      fetchProduct(productId);
    }

    // Cleanup on unmount
    return () => {
      resetProduct();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // Log product data structure
  useEffect(() => {
    if (product) {
      console.log('=== PRODUCT DATA STRUCTURE ===');
      console.log('Full Product Object:', product);
      console.log('Product Keys:', Object.keys(product));
      console.log('Product Dimensions:', product.dimensions);
      console.log('Product Dimensions Type:', typeof product.dimensions);
      if (product.dimensions && typeof product.dimensions === 'object') {
        console.log('Dimensions Entries:', Object.entries(product.dimensions));
        console.log('Dimensions Values:', Object.values(product.dimensions));
      }
      console.log('Product Color Variants:', product.colorVariants);
      console.log('Product Size Variants:', product.sizeVariants);
      console.log('============================');
    }
  }, [product]);

  // Get variants from product
  const colorVariants = product?.colorVariants || [];
  const sizeVariants = product?.sizeVariants || [];
  
  // Include base product as Variant 1 in color options
  const allColorOptions = [];
  if (product?.color) {
    // Add base product as Variant 1 option (always include if product has a color)
    allColorOptions.push({
      id: 'base-variant-1',
      title: product.title || 'Variant 1',
      color: product.color,
      colorCode: null,
      colorSwatchImage: product.colorImage || product.image, // Use colorImage or main image as swatch
      image: product.image,
      images: product.images || [],
      originalPrice: product.originalPrice,
      discountedPrice: product.discountedPrice,
      stockQuantity: product.stockQuantity,
      inStock: product.inStock,
      isBaseVariant: true,
    });
  }
  // Add additional color variants (Variant 2, 3, etc.)
  allColorOptions.push(...colorVariants.map(v => ({ ...v, isBaseVariant: false })));
  
  // Include base product as Variant 1 in size options
  const allSizeOptions = [];
  // Always add base product as Variant 1 size option
  const baseSize = product?.dimensions?.width && product?.dimensions?.height 
    ? `${product.dimensions.width}x${product.dimensions.height}`
    : product?.dimensions?.width 
    ? `${product.dimensions.width}`
    : 'Standard';
  allSizeOptions.push({
    id: 'base-variant-1',
    title: product?.title || 'Variant 1',
    size: baseSize,
    image: product?.image,
    images: product?.images || [],
    originalPrice: product?.originalPrice,
    discountedPrice: product?.discountedPrice,
    stockQuantity: product?.stockQuantity,
    inStock: product?.inStock,
    isBaseVariant: true,
  });
  // Add additional size variants (Variant 2, 3, etc.)
  allSizeOptions.push(...sizeVariants.map(v => ({ ...v, isBaseVariant: false })));
  
  // Show color variants only if we have 2+ color options (hide if only one color)
  const hasColorVariants = allColorOptions.length > 1;
  // Only show size section if size variants are enabled in the product settings
  const hasSizeVariants = product?.hasSizeVariants === true && allSizeOptions.length > 1;
  const hasInstallation = product?.hasInstallation || false;
  
  // Debug: Log color variants to check data structure
  if (process.env.NODE_ENV === 'development') {
    console.log('Product color variants check:', {
      hasColorVariantsFlag: product?.hasColorVariants,
      colorVariantsCount: colorVariants.length,
      willShowColorVariants: hasColorVariants,
      colorVariants: colorVariants
    });
    if (colorVariants.length > 0) {
      colorVariants.forEach((variant, idx) => {
        console.log(`Variant ${idx}:`, {
          id: variant.id,
          color: variant.color,
          colorSwatchImage: variant.colorSwatchImage,
          image: variant.image,
          hasColorSwatchImage: !!variant.colorSwatchImage
        });
      });
    }
  }
  
  // Get selected variant data - improved matching logic
  const selectedColorVariant = React.useMemo(() => {
    if (!selectedColor || allColorOptions.length === 0) {
      return allColorOptions.length === 1 ? allColorOptions[0] : null;
    }
    
    // Normalize selectedColor for comparison
    const normalizedSelected = String(selectedColor).trim().toLowerCase();
    
    // Try multiple matching strategies
    const found = allColorOptions.find(v => {
      const variantId = v.id ? String(v.id).trim().toLowerCase() : null;
      const variantColor = v.color ? String(v.color).trim().toLowerCase() : null;
      const variantIdOrColor = variantId || variantColor;
      
      // Match by ID, color, or normalized comparison
      return (variantId && variantId === normalizedSelected) ||
             (variantColor && variantColor === normalizedSelected) ||
             (variantIdOrColor && variantIdOrColor === normalizedSelected) ||
             (v.id === selectedColor) ||
             (v.color === selectedColor) ||
             (variantIdOrColor === normalizedSelected);
    });
    
    const result = found || (allColorOptions.length > 0 ? allColorOptions[0] : null);
    
    if (process.env.NODE_ENV === 'development' && result) {
      console.log('[ProductDetail] Found color variant:', {
        selectedColor,
        normalizedSelected,
        found: {
          id: result.id,
          color: result.color,
          image: result.image,
          images: result.images,
          imagesLength: result.images?.length || 0
        }
      });
    }
    
    return result;
  }, [selectedColor, allColorOptions]);
  
  const selectedSizeVariant = React.useMemo(() => {
    if (!selectedSize || allSizeOptions.length === 0) {
      return allSizeOptions.length === 1 ? allSizeOptions[0] : null;
    }
    
    return allSizeOptions.find(v => v.id === selectedSize || v.size === selectedSize) || 
           (allSizeOptions.length > 0 ? allSizeOptions[0] : null);
  }, [selectedSize, allSizeOptions]);
  
  // Determine displayed product data - improved image handling
  const displayProduct = React.useMemo(() => {
    if (!product) return {};
    
    // Get images from selected color variant
    let variantImages = [];
    let variantImage = null;
    
    if (selectedColorVariant) {
      variantImage = selectedColorVariant.image;
      
      // Priority: images array > single image
      if (selectedColorVariant.images && Array.isArray(selectedColorVariant.images) && selectedColorVariant.images.length > 0) {
        variantImages = [...selectedColorVariant.images]; // Create copy to avoid mutation
      } 
      // If variant has a single image, create array from it
      else if (selectedColorVariant.image) {
        variantImages = [selectedColorVariant.image];
      }
    }
    
    // If no variant images, try size variant
    if (variantImages.length === 0 && selectedSizeVariant) {
      if (selectedSizeVariant.images && Array.isArray(selectedSizeVariant.images) && selectedSizeVariant.images.length > 0) {
        variantImages = [...selectedSizeVariant.images];
        variantImage = variantImage || selectedSizeVariant.image;
      } else if (selectedSizeVariant.image) {
        variantImages = [selectedSizeVariant.image];
        variantImage = variantImage || selectedSizeVariant.image;
      }
    }
    
    // Fallback to product images
    if (variantImages.length === 0) {
      if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
        variantImages = [...product.images];
        variantImage = variantImage || product?.image;
      } else if (product?.image) {
        variantImages = [product.image];
        variantImage = variantImage || product.image;
      }
    }
    
    const result = {
      ...product,
      image: variantImage || selectedColorVariant?.image || selectedSizeVariant?.image || product?.image,
      images: variantImages,
      originalPrice: selectedColorVariant?.originalPrice ?? selectedSizeVariant?.originalPrice ?? product?.originalPrice,
      discountedPrice: selectedColorVariant?.discountedPrice ?? selectedSizeVariant?.discountedPrice ?? product?.discountedPrice,
      stockQuantity: selectedColorVariant?.stockQuantity ?? selectedSizeVariant?.stockQuantity ?? product?.stockQuantity,
      inStock: selectedColorVariant?.inStock ?? selectedSizeVariant?.inStock ?? product?.inStock,
    };
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('[ProductDetail] displayProduct computed:', {
        selectedColor,
        selectedColorVariantId: selectedColorVariant?.id,
        selectedColorVariantColor: selectedColorVariant?.color,
        variantImage,
        variantImages: variantImages,
        variantImagesLength: variantImages.length,
        resultImage: result.image,
        resultImages: result.images,
        resultImagesLength: result.images.length
      });
    }
    
    return result;
  }, [product, selectedColorVariant, selectedSizeVariant, selectedColor]);
  
  // Initialize selected variants on product load
  // If only one color exists, automatically set it as default without showing the section
  React.useEffect(() => {
    if (product && !selectedColor) {
      if (hasColorVariants && allColorOptions.length > 1) {
        // Multiple colors: set first one and show selection UI
        setSelectedColor(allColorOptions[0].id || allColorOptions[0].color);
      } else if (allColorOptions.length === 1) {
        // Single color: set it as default but don't show the UI section
        setSelectedColor(allColorOptions[0].id || allColorOptions[0].color);
      }
    }
    if (product && !selectedSize) {
      if (hasSizeVariants && allSizeOptions.length > 1) {
        // Multiple sizes: set first one and show selection UI
        setSelectedSize(allSizeOptions[0].id || allSizeOptions[0].size);
      } else if (allSizeOptions.length === 1) {
        // Single size: set it as default but don't show the UI section
        setSelectedSize(allSizeOptions[0].id || allSizeOptions[0].size);
      }
    }
  }, [product, hasColorVariants, hasSizeVariants, allColorOptions.length, allSizeOptions.length]);
  
  // Update images when variant changes - reset to first image
  React.useEffect(() => {
    if (selectedColor || selectedSize) {
      setSelectedImage(0);
    }
  }, [selectedColor, selectedSize, setSelectedImage]);
  
  // Debug: Log when images change
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && displayProduct) {
      console.log('[ProductDetail] Image update:', {
        selectedColor,
        selectedColorVariant: selectedColorVariant ? {
          id: selectedColorVariant.id,
          color: selectedColorVariant.color,
          image: selectedColorVariant.image,
          images: selectedColorVariant.images,
          imagesLength: selectedColorVariant.images?.length || 0
        } : null,
        displayProductImage: displayProduct?.image,
        displayProductImages: displayProduct?.images,
        displayProductImagesLength: displayProduct?.images?.length || 0,
        selectedImage
      });
    }
  }, [selectedColor, selectedColorVariant, displayProduct, selectedImage]);

  const handleQuickShop = async () => {
    if (!product) return;
    
    // Check if product is in stock before attempting to add
    if (!product.inStock) {
      showToast('This product is out of stock', 'error');
      return;
    }
    
    const result = await addToCart(displayProduct, quantity, {
      color: selectedColorVariant ? selectedColorVariant.color : selectedColor,
      size: selectedSizeVariant ? selectedSizeVariant.size : selectedSize,
      colorVariantId: selectedColorVariant?.id,
      sizeVariantId: selectedSizeVariant?.id,
      includeInstallation,
      installationPrice: includeInstallation ? product.installationPrice : undefined,
    });
    
    if (result?.success) {
      await loadCart();
      showToast('Item added to cart', 'success');
      router.push('/cart');
    } else if (result?.error) {
      showToast(result.error, 'error');
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    // Check if product is in stock before attempting to add
    if (!product.inStock) {
      showToast('This product is out of stock', 'error');
      return;
    }
    
    const result = await addToCart(displayProduct, quantity, {
      color: selectedColorVariant ? selectedColorVariant.color : selectedColor,
      size: selectedSizeVariant ? selectedSizeVariant.size : selectedSize,
      colorVariantId: selectedColorVariant?.id,
      sizeVariantId: selectedSizeVariant?.id,
      includeInstallation,
      installationPrice: includeInstallation ? product.installationPrice : undefined,
    });
    
    if (result?.success) {
      await loadCart();
      openCartDrawer();
      showToast('Item added to cart', 'success');
    } else if (result?.error) {
      showToast(result.error, 'error');
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;

    const wasInWishlist = isInWishlist(product.id);

    const result = await toggleWishlist(product);
    if (result?.success) {
      await loadWishlist();
      showToast(
        wasInWishlist
          ? 'Removed from wishlist'
          : 'Added to wishlist',
        'success'
      );
    } else if (result?.error) {
      showToast(result.error, 'error');
    }
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            {error || 'Product not found'}
          </h1>
          <p className="text-gray-600 mb-4">
            {error ? 'Something went wrong while loading the product.' : "The product you're looking for doesn't exist."}
          </p>
          <Link href="/" className="text-[#0B4866] hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  const productImages = displayProduct?.images || (displayProduct?.image ? [displayProduct.image] : []);
  const rating = Number(reviewStats?.averageRating || product.rating || 0);
  const reviews = Number(reviewStats?.totalReviews || product.reviewCount || product.reviews || 0);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 overflow-x-auto w-full">
          <Link href="/" className="hover:text-[#0B4866] whitespace-nowrap">Home</Link>
          <span>/</span>
          <Link href={`/categories/${product.category || 'products'}`} className="hover:text-[#0B4866] capitalize whitespace-nowrap">
            {product.category || 'Products'}
          </Link>
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-12 w-full">
          {/* Left: Product Image Gallery */}
          <div className="relative w-full overflow-hidden">
            {/* Top Seller Badge */}
            {product.topSeller && (
              <div className="absolute top-4 left-4 bg-pink-600 text-white text-xs font-semibold px-3 py-1.5 z-10">
                Top seller
              </div>
            )}
            
            {/* Wishlist Button */}
            <button
              onClick={handleWishlistToggle}
              className="absolute top-4 right-4 p-2 text-gray-600 hover:text-red-500 transition-colors z-10"
            >
              {isInWishlist(product.id) ? (
                <Heart size={24} className="fill-red-500 text-red-500" />
              ) : (
                <Heart size={24} />
              )}
            </button>

            {/* Main Image */}
            <div className="relative bg-gray-50 rounded-lg overflow-hidden group mb-4 w-full flex items-center justify-center" style={{ minHeight: '400px', maxHeight: '600px' }}>
              <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-8">
                <OptimizedImage
                  src={productImages[selectedImage] || displayProduct?.image || ''}
                  alt={product.title || 'Product'}
                  width={800}
                  height={800}
                  className="w-auto h-auto max-w-full max-h-full object-contain"
                  priority
                />
              </div>
              
              {/* Navigation Arrows */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails with Titles */}
            <div className="w-full">
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 w-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className="flex-shrink-0 flex flex-col items-center gap-2 group"
                  >
                    <div
                      className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 bg-gray-50 transition flex items-center justify-center ${
                        selectedImage === index ? 'border-[#0B4866] ring-2 ring-[#0B4866]' : 'border-gray-200 group-hover:border-gray-300'
                      }`}
                    >
                      <div className="relative w-full h-full flex items-center justify-center p-1.5">
                        <OptimizedImage
                          src={image || ''}
                          alt={`${product.title || 'Product'} ${index + 1}`}
                          width={80}
                          height={80}
                          className="w-auto h-auto max-w-full max-h-full object-contain"
                        />
                      </div>
                    </div>
                    <span
                      className={`text-xs text-center max-w-[80px] line-clamp-2 transition-colors ${
                        selectedImage === index
                          ? 'text-[#0B4866] font-medium'
                          : 'text-gray-600 group-hover:text-gray-900'
                      }`}
                      title={`Image ${index + 1}`}
                    >
                      {product.title || 'Product'} {index + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="space-y-6 w-full overflow-hidden">
            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#0B4866] break-words">{product.title || 'Product'}</h1>

            {/* Price */}
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              {displayProduct.originalPrice && displayProduct.discountedPrice && displayProduct.originalPrice > displayProduct.discountedPrice && (
                <span className="text-lg sm:text-xl text-gray-500 line-through">${(displayProduct.originalPrice || 0).toFixed(2)}</span>
              )}
              <span className="text-2xl sm:text-3xl font-bold text-[#0B4866]">
                ${(displayProduct.discountedPrice || displayProduct.originalPrice || 0).toFixed(2)}
                {includeInstallation && product.installationPrice && (
                  <span className="text-lg text-gray-600 ml-2">
                    + ${product.installationPrice.toFixed(2)} installation
                  </span>
                )}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-2xl">{i < Math.floor(rating) ? '★' : '☆'}</span>
                ))}
              </div>
              <span className="text-gray-600">({reviews || 0})</span>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${displayProduct.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`font-medium ${displayProduct.inStock ? 'text-green-600' : 'text-red-600'}`}>
                {displayProduct.inStock ? 'In Stock' : 'Out of Stock'}
                {displayProduct.stockQuantity > 0 && displayProduct.inStock && (
                  <span className="text-gray-600 ml-2">({displayProduct.stockQuantity} available)</span>
                )}
              </span>
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                <button
                  onClick={decrementQuantity}
                  className="px-3 py-2 hover:bg-gray-50 border-r border-gray-300"
                >
                  <Minus size={18} />
                </button>
                <span className="px-6 py-2 text-lg font-medium w-16 text-center">{quantity}</span>
                <button
                  onClick={incrementQuantity}
                  className="px-3 py-2 hover:bg-gray-50 border-l border-gray-300"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Choose Color */}
            {hasColorVariants && (
              <div className="w-full overflow-hidden">
                <label className="block text-sm font-medium text-gray-700 mb-3">Choose Color</label>
                <div className="flex gap-2 sm:gap-3 flex-wrap">
                  {allColorOptions.map((variant) => {
                    const variantId = variant.id || variant.color;
                    const isSelected = selectedColor === variantId || selectedColor === variant.color;
                    // Use colorCode if available, otherwise map color name
                    const colorValue = variant.colorCode || 
                      (variant.color?.toLowerCase().includes('beige') ? '#F5F5DC' :
                       variant.color?.toLowerCase().includes('brown') ? '#8B4513' :
                       variant.color?.toLowerCase().includes('black') ? '#000000' :
                       variant.color?.toLowerCase().includes('white') ? '#FFFFFF' :
                       variant.color?.toLowerCase().includes('gray') ? '#808080' :
                       '#CCCCCC');
                    
                    // Check for color swatch image (with fallback)
                    const swatchImage = (variant.colorSwatchImage && variant.colorSwatchImage.trim()) 
                      || (variant.colorSwatchimage && variant.colorSwatchimage.trim()) 
                      || null;
                    const mainImage = (variant.image && variant.image.trim()) || null;
                    
                    // Debug in development
                    if (process.env.NODE_ENV === 'development') {
                      console.log(`[Color Picker] Variant ${variantId}:`, {
                        swatchImage,
                        mainImage,
                        willUseSwatch: !!swatchImage,
                        willUseMain: !swatchImage && !!mainImage
                      });
                    }
                    
                    return (
                      <button
                        key={variantId}
                        onClick={() => {
                          console.log('[ProductDetail] Color variant clicked:', {
                            variantId,
                            variant: variant,
                            variantImage: variant.image,
                            variantImages: variant.images,
                            variantImagesLength: variant.images?.length || 0,
                            currentSelectedColor: selectedColor
                          });
                          setSelectedColor(variantId);
                          setSelectedImage(0); // Reset to first image when color changes
                        }}
                        className={`relative flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg border-2 transition overflow-hidden flex items-center justify-center ${isSelected ? 'border-[#0B4866] ring-2 ring-[#0B4866]' : 'border-gray-300'}`}
                        title={variant.title || variant.color}
                      >
                        {swatchImage && swatchImage.trim() ? (
                          <div className="relative w-full h-full flex items-center justify-center p-1">
                            <OptimizedImage
                              src={swatchImage}
                              alt={variant.title || variant.color}
                              width={64}
                              height={64}
                              className="w-auto h-auto max-w-full max-h-full object-contain rounded"
                            />
                          </div>
                        ) : mainImage && mainImage.trim() ? (
                          <div className="relative w-full h-full flex items-center justify-center p-1">
                            <OptimizedImage
                              src={mainImage}
                              alt={variant.title || variant.color}
                              width={64}
                              height={64}
                              className="w-auto h-auto max-w-full max-h-full object-contain rounded"
                            />
                          </div>
                        ) : (
                          <div
                            className="w-full h-full rounded-lg"
                            style={{ backgroundColor: colorValue }}
                          />
                        )}
                        {isSelected && (
                          <svg className="absolute inset-0 m-auto w-6 h-6 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedColorVariant && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      Selected Color:
                    </span>
                    <span className="text-sm text-gray-700">
                      {selectedColorVariant.color || selectedColorVariant.title}
                    </span>
                    {!selectedColorVariant.inStock && (
                      <span className="text-xs text-red-600 font-medium">(Out of Stock)</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Choose Size */}
            {hasSizeVariants && (
              <div className="w-full overflow-hidden">
                <label className="block text-sm font-medium text-gray-700 mb-3">Choose Size</label>
                <div className="flex gap-2 flex-wrap">
                  {allSizeOptions.map((variant) => {
                    const variantId = variant.id || variant.size;
                    const isSelected = selectedSize === variantId || selectedSize === variant.size;
                    const isOutOfStock = !variant.inStock;
                    
                    return (
                      <button
                        key={variantId}
                        onClick={() => !isOutOfStock && setSelectedSize(variantId)}
                        disabled={isOutOfStock}
                        className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg text-xs sm:text-sm font-medium border-2 transition ${
                          isSelected
                            ? 'border-[#0B4866] bg-[#0B4866] text-white'
                            : isOutOfStock
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        title={variant.title || variant.size}
                      >
                        {variant.size}
                      </button>
                    );
                  })}
                </div>
                {selectedSizeVariant && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      Selected Size:
                    </span>
                    <span className="text-sm text-gray-700">
                      {selectedSizeVariant.title || selectedSizeVariant.size}
                    </span>
                    {!selectedSizeVariant.inStock && (
                      <span className="text-xs text-red-600 font-medium">(Out of Stock)</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Installation Option */}
            {hasInstallation && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Installation Service</h4>
                    <p className="text-sm text-gray-600">
                      Add professional installation service
                      {product.installationPrice && (
                        <span className="font-semibold text-[#0B4866] ml-1">
                          (+${product.installationPrice.toFixed(2)})
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => setIncludeInstallation(!includeInstallation)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      includeInstallation ? 'bg-[#0B4866]' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        includeInstallation ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full">
              <button
                onClick={handleQuickShop}
                disabled={!displayProduct.inStock}
                className="w-full sm:flex-1 border border-[#0B4866] bg-white text-[#0B4866] py-3 px-4 sm:px-6 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <ShoppingBag size={18} className="sm:w-5 sm:h-5" />
                <span className="whitespace-nowrap">Quick Shop</span>
              </button>
              <button
                onClick={handleAddToCart}
                disabled={!displayProduct.inStock}
                className={`w-full sm:flex-1 py-3 px-4 sm:px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition text-sm sm:text-base ${
                  !product.inStock
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : isInCart(product.id)
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-[#0B4866] text-white hover:bg-[#0a3d55]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <ShoppingCart size={18} className="sm:w-5 sm:h-5" />
                <span className="whitespace-nowrap">{!product.inStock ? 'Out of Stock' : isInCart(product.id) ? `In Cart (${getItemQuantity(product.id)})` : 'Add to cart'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Product Information Tabs */}
        <div className="mb-12 w-full overflow-hidden">
          <div className="border-b border-gray-200 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <nav className="flex gap-4 sm:gap-8 min-w-max sm:min-w-0">
              {[
                { id: 'details', label: 'Product Details' },
                { id: 'reviews', label: 'Product Reviews' },
                { id: 'dimensions', label: 'Dimensions' },
                { id: 'warranty', label: 'Warranty' },
                { id: 'delivery', label: 'Delivery' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#0B4866] text-[#0B4866]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8 w-full overflow-hidden">
            {activeTab === 'details' && (
              <div className="space-y-6 w-full overflow-hidden">
                <p className="text-gray-700 leading-relaxed break-words whitespace-pre-line">{product.description || 'No description available.'}</p>
                {product.features && Array.isArray(product.features) && product.features.length > 0 && (
                  <ul className="space-y-3">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-[#0B4866] text-xl">•</span>
                        <span className="text-gray-700">{String(feature || '')}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              productReviews && productReviews.length > 0 ? (
                <div className="space-y-6">
                  {productReviews.map((review) => {
                    const reviewerName = [review.user?.firstName, review.user?.lastName]
                      .filter(Boolean)
                      .join(" ")
                      .trim();
                    const displayName = reviewerName || "Verified Customer";
                    return (
                      <div key={review.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-3">
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className="text-lg">
                                    {i < Math.floor(review.rating) ? "★" : "☆"}
                                  </span>
                                ))}
                              </div>
                              <span className="text-sm font-medium text-gray-900">{displayName}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {review.title && (
                            <p className="text-base font-semibold text-gray-900">{review.title}</p>
                          )}
                          {review.comment && (
                            <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
                </div>
              )
            )}

            {activeTab === 'dimensions' && product.dimensions && (
              <div className="space-y-4">
                <p className="text-lg font-medium text-gray-900">Dimensions</p>
                {typeof product.dimensions === 'object' ? (
                  <div className="text-gray-700 whitespace-pre-line">
                    {Object.entries(product.dimensions).map(([key, value]) => {
                      // Skip showing the key if it's "text", just show the value
                      const isTextKey = key.toLowerCase() === 'text';
                      
                      // Remove "text:" prefix from value if present (case-insensitive)
                      let displayValue = String(value || 0)
                        .replace(/^text:\s*/i, "")  // Remove "text:" at start
                        .replace(/\s*text:\s*/gi, "")  // Remove "text:" anywhere else
                        .trim();
                      
                      // Check if unit is already included
                      const hasUnit = /cm|in|mm|m\s*$/i.test(displayValue);
                      // Add unit if not present
                      if (!hasUnit && displayValue && displayValue !== '0') {
                        displayValue += ' cm';
                      }
                      
                      return (
                        <div key={key} className="mb-2">
                          {!isTextKey && (
                            <span className="capitalize font-medium">{String(key || '')}: </span>
                          )}
                          <span>{displayValue}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-700">{String(product.dimensions)
                    .replace(/^text:\s*/i, "")  // Remove "text:" at start
                    .replace(/\s*text:\s*/gi, "")  // Remove "text:" anywhere else
                    .trim()}</p>
                )}
              </div>
            )}

            {activeTab === 'warranty' && (
              <div className="space-y-4">
                <p className="text-lg font-medium text-gray-900">Warranty Information</p>
                <p className="text-gray-700">
                  {product.warranty || '1 year warranty included with every purchase. Our commitment to quality ensures your satisfaction.'}
                </p>
              </div>
            )}

            {activeTab === 'delivery' && (
              <div className="space-y-4">
                <p className="text-lg font-medium text-gray-900">Delivery Information</p>
                <p className="text-gray-700">
                  Free shipping on orders over $100. Standard delivery takes 5-7 business days. Express delivery available for an additional fee.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Related Products</h2>
              <Link
                href={`/categories/${product.category || 'products'}`}
                className="flex items-center gap-2 text-[#0B4866] hover:text-[#0a3d55] font-medium"
              >
                View All
                <ArrowRight size={18} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} variant="grid" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
