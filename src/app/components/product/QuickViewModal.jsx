"use client";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, ShoppingBag, ShoppingCart, Minus, Plus, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationStore } from '../../stores/useAnimationStore';
import { useRouter } from 'next/navigation';
import { openCartDrawer, showToast } from '../../lib/ui';
import { useWishlist } from '../../stores/useWishlistStore';
import { useCart } from '../../stores/useCartStore';

const QuickViewModal = ({ product, isOpen, onClose, previewOnly = false }) => {
  const router = useRouter();
  const { getAnimationConfig, animationsEnabled } = useAnimationStore();
  const modalConfig = getAnimationConfig('modal');
  const { toggleWishlist, isInWishlist, isLoading: isWishlistLoading } = useWishlist();
  const { addToCart, cartItems, isInCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product?.color || product?.colors?.[0] || '');
  const [selectedSize, setSelectedSize] = useState(product?.size || product?.sizes?.[0] || 'M');
  const [includeInstallation, setIncludeInstallation] = useState(false);
  const [fullProduct, setFullProduct] = useState(product);
  const [loadingProduct, setLoadingProduct] = useState(false);

  // Fetch full product data if variants are missing
  useEffect(() => {
    if (isOpen && product?.id) {
      // Always fetch full product data to ensure we have all variants
      setLoadingProduct(true);
      // Use absolute URL to ensure we hit the Express server directly
      const apiUrl = process.env.NEXT_PUBLIC_API_URL 
        ? `${process.env.NEXT_PUBLIC_API_URL}/products/${product.id}`
        : `http://localhost:3001/api/products/${product.id}`;
      console.log('[QuickViewModal] Fetching from:', apiUrl);
      fetch(apiUrl)
        .then(res => {
          console.log('[QuickViewModal] API Response status:', res.status);
          return res.json();
        })
        .then(data => {
          console.log('[QuickViewModal] API Response data:', data);
          if (data.success && data.data?.product) {
            const fetchedProduct = data.data.product;
            console.log('[QuickViewModal] Fetched full product:', {
              id: fetchedProduct.id,
              hasColorVariants: fetchedProduct.hasColorVariants,
              colorVariantsCount: fetchedProduct.colorVariants?.length || 0,
              colorVariants: fetchedProduct.colorVariants,
              colorVariantsArray: Array.isArray(fetchedProduct.colorVariants) ? fetchedProduct.colorVariants : [],
              productKeys: Object.keys(fetchedProduct),
              hasColorVariantsField: 'hasColorVariants' in fetchedProduct,
              hasColorVariantsValue: fetchedProduct.hasColorVariants,
              colorVariantsField: 'colorVariants' in fetchedProduct,
              colorVariantsValue: fetchedProduct.colorVariants
            });
            // Ensure colorVariants is an array
            if (!Array.isArray(fetchedProduct.colorVariants)) {
              console.warn('[QuickViewModal] colorVariants is not an array:', fetchedProduct.colorVariants);
              fetchedProduct.colorVariants = [];
            }
            // Ensure hasColorVariants is set
            if (fetchedProduct.hasColorVariants === undefined) {
              console.warn('[QuickViewModal] hasColorVariants is undefined, checking database value');
            }
            setFullProduct(fetchedProduct);
          } else {
            console.error('[QuickViewModal] API response not successful:', data);
            if (product) {
              // Fallback to original product if fetch fails
              setFullProduct(product);
            }
          }
        })
        .catch(err => {
          console.error('Failed to fetch full product data:', err);
          // Fallback to original product on error
          if (product) {
            setFullProduct(product);
          }
        })
        .finally(() => {
          setLoadingProduct(false);
        });
    } else if (isOpen && product) {
      setFullProduct(product);
    }
  }, [isOpen, product?.id]);

  // Use fullProduct if available, otherwise use product
  // Always fall back to product to ensure we have data
  const productData = fullProduct || product;

  // Get variants from product - ensure we're getting the array correctly
  const colorVariants = React.useMemo(() => {
    const variants = productData?.colorVariants;
    if (Array.isArray(variants)) {
      return variants;
    }
    if (variants && typeof variants === 'object') {
      // If it's an object, try to convert to array
      return Object.values(variants);
    }
    return [];
  }, [productData?.colorVariants]);
  
  const sizeVariants = React.useMemo(() => {
    const variants = productData?.sizeVariants;
    if (Array.isArray(variants)) {
      return variants;
    }
    if (variants && typeof variants === 'object') {
      return Object.values(variants);
    }
    return [];
  }, [productData?.sizeVariants]);
  
  // Include base product as Variant 1 in color options
  const allColorOptions = React.useMemo(() => {
    const options = [];
    if (productData?.color) {
      // Add base product as Variant 1 option (always include if product has a color)
      options.push({
        id: 'base-variant-1',
        title: productData.title || 'Variant 1',
        color: productData.color,
        colorCode: null,
        colorSwatchImage: productData.colorImage || productData.image, // Use colorImage or main image as swatch
        image: productData.image,
        images: productData.images || [],
        originalPrice: productData.originalPrice,
        discountedPrice: productData.discountedPrice,
        stockQuantity: productData.stockQuantity,
        inStock: productData.inStock,
        isBaseVariant: true,
      });
    }
    // Add additional color variants (Variant 2, 3, etc.)
    if (colorVariants && colorVariants.length > 0) {
      options.push(...colorVariants.map(v => ({ ...v, isBaseVariant: false })));
    }
    return options;
  }, [productData, colorVariants]);
  
  // Include base product as Variant 1 in size options
  const allSizeOptions = React.useMemo(() => {
    const options = [];
    // Always add base product as Variant 1 size option
    const baseSize = productData?.dimensions?.width && productData?.dimensions?.height 
      ? `${productData.dimensions.width}x${productData.dimensions.height}`
      : productData?.dimensions?.width 
      ? `${productData.dimensions.width}`
      : 'Standard';
    options.push({
      id: 'base-variant-1',
      title: productData?.title || 'Variant 1',
      size: baseSize,
      image: productData?.image,
      images: productData?.images || [],
      originalPrice: productData?.originalPrice,
      discountedPrice: productData?.discountedPrice,
      stockQuantity: productData?.stockQuantity,
      inStock: productData?.inStock,
      isBaseVariant: true,
    });
    // Add additional size variants (Variant 2, 3, etc.)
    if (sizeVariants && sizeVariants.length > 0) {
      options.push(...sizeVariants.map(v => ({ ...v, isBaseVariant: false })));
    }
    return options;
  }, [productData, sizeVariants]);
  
  // Show color variants only if we have more than 1 color option
  const hasColorVariants = allColorOptions.length > 1;
  // Only show size section if size variants are enabled in the product settings
  const hasSizeVariants = productData?.hasSizeVariants === true && allSizeOptions.length > 0;
  const hasInstallation = productData?.hasInstallation || false;
  
  // Debug: Log color variants to check data structure
  if (process.env.NODE_ENV === 'development') {
    console.log('[QuickViewModal] Product color variants check:', {
      productId: productData?.id,
      hasColorVariantsFlag: productData?.hasColorVariants,
      colorVariantsCount: colorVariants.length,
      allColorOptionsCount: allColorOptions.length,
      willShowColorVariants: hasColorVariants,
      colorVariants: colorVariants,
      allColorOptions: allColorOptions,
      productDataHasColorVariants: productData?.hasColorVariants,
      loadingProduct: loadingProduct,
      fullProductSet: !!fullProduct,
      productDataColorVariants: productData?.colorVariants,
      productDataColorVariantsType: typeof productData?.colorVariants,
      productDataColorVariantsIsArray: Array.isArray(productData?.colorVariants)
    });
    if (colorVariants.length > 0) {
      colorVariants.forEach((variant, idx) => {
        console.log(`[QuickViewModal] Variant ${idx}:`, {
          id: variant.id,
          color: variant.color,
          colorSwatchImage: variant.colorSwatchImage,
          image: variant.image,
          hasColorSwatchImage: !!variant.colorSwatchImage
        });
      });
    } else {
      console.warn('[QuickViewModal] No color variants found, but hasColorVariants is:', productData?.hasColorVariants);
    }
    if (allColorOptions.length > 0) {
      console.log('[QuickViewModal] All color options:', allColorOptions.map(v => ({
        id: v.id,
        color: v.color,
        isBaseVariant: v.isBaseVariant,
        colorSwatchImage: v.colorSwatchImage,
        image: v.image,
        hasColorSwatchImage: !!v.colorSwatchImage
      })));
    }
  }
  
  // Get selected variant data - improved matching logic
  const selectedColorVariant = React.useMemo(() => {
    if (!hasColorVariants || !selectedColor || allColorOptions.length === 0) {
      return null;
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
    
    if (process.env.NODE_ENV === 'development' && found) {
      console.log('[QuickView] Found color variant:', {
        selectedColor,
        normalizedSelected,
        found: {
          id: found.id,
          color: found.color,
          image: found.image,
          images: found.images,
          imagesLength: found.images?.length || 0
        }
      });
    }
    
    return found;
  }, [hasColorVariants, selectedColor, allColorOptions]);
  
  const selectedSizeVariant = hasSizeVariants && selectedSize
    ? allSizeOptions.find(v => v.id === selectedSize || v.size === selectedSize)
    : null;
  
  // Determine displayed product data - improved image handling
  const displayProduct = React.useMemo(() => {
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
      if (productData?.images && Array.isArray(productData.images) && productData.images.length > 0) {
        variantImages = [...productData.images];
        variantImage = variantImage || productData?.image;
      } else if (productData?.image) {
        variantImages = [productData.image];
        variantImage = variantImage || productData.image;
      }
    }
    
    const result = {
      ...productData,
      image: variantImage || selectedColorVariant?.image || selectedSizeVariant?.image || productData?.image,
      images: variantImages,
      originalPrice: selectedColorVariant?.originalPrice ?? selectedSizeVariant?.originalPrice ?? productData?.originalPrice,
      discountedPrice: selectedColorVariant?.discountedPrice ?? selectedSizeVariant?.discountedPrice ?? productData?.discountedPrice,
      stockQuantity: selectedColorVariant?.stockQuantity ?? selectedSizeVariant?.stockQuantity ?? productData?.stockQuantity,
      inStock: selectedColorVariant?.inStock ?? selectedSizeVariant?.inStock ?? productData?.inStock,
    };
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('[QuickView] displayProduct computed:', {
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
  }, [productData, selectedColorVariant, selectedSizeVariant, selectedColor]);
  
  const productImages = displayProduct.images || [];
  
  // Initialize selected variants on product load
  React.useEffect(() => {
    if (productData && !selectedColor && hasColorVariants && allColorOptions.length > 0) {
      setSelectedColor(allColorOptions[0].id || allColorOptions[0].color);
    }
    if (productData && !selectedSize && hasSizeVariants && allSizeOptions.length > 0) {
      setSelectedSize(allSizeOptions[0].id || allSizeOptions[0].size);
    }
  }, [productData, hasColorVariants, hasSizeVariants, allColorOptions, allSizeOptions]);

  // Cart is managed by Zustand store, no need to load manually

  useEffect(() => {
    if (isOpen && productData) {
      setCurrentImageIndex(0);
      setQuantity(1);
      // Reset selections when product or modal opens
      const defaultColor = productData?.color || productData?.colors?.[0] || (allColorOptions.length > 0 ? (allColorOptions[0].id || allColorOptions[0].color) : '');
      const defaultSize = productData?.size || productData?.sizes?.[0] || (allSizeOptions.length > 0 ? (allSizeOptions[0].id || allSizeOptions[0].size) : 'M');
      setSelectedColor(defaultColor);
      setSelectedSize(defaultSize);
    }
  }, [isOpen, productData, allColorOptions, allSizeOptions]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const handleEscape = (e) => e.key === 'Escape' && onClose();
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isOpen, onClose]);

  const handleNextImage = () => setCurrentImageIndex((p) => (p + 1) % productImages.length);
  const handlePrevImage = () => setCurrentImageIndex((p) => (p - 1 + productImages.length) % productImages.length);
  const handleQuantityChange = (d) => setQuantity((p) => Math.max(1, Math.min(p + d, productData?.maxQuantity || 10)));

  const handleQuickShop = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!productData || displayProduct?.inStock === false) {
      showToast('This product is out of stock', 'error');
      return;
    }

    try {
      const productId = productData?.id || productData?.productId;
      if (!productId) {
        showToast('Invalid product ID', 'error');
        return;
      }
      
      // Prepare options with selected color and size
      const options = {
        color: selectedColorVariant ? selectedColorVariant.color : selectedColor,
        size: selectedSizeVariant ? selectedSizeVariant.size : selectedSize,
        colorVariantId: selectedColorVariant?.id,
        sizeVariantId: selectedSizeVariant?.id,
        includeInstallation,
        installationPrice: includeInstallation ? productData.installationPrice : undefined,
      };
      
      const result = await addToCart(displayProduct, quantity, options);
      if (result?.success) {
        showToast('Item added to cart', 'success');
        if (onClose) {
          onClose();
        }
        router.push('/cart');
      } else if (result?.error) {
        showToast(result.error, 'error');
      }
    } catch (err) {
      console.error('[QuickViewModal] Quick shop error:', err);
      showToast(err.message || 'Failed to add item to cart', 'error');
    }
  };

  const handleAddToCart = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!productData || displayProduct?.inStock === false) {
      showToast('This product is out of stock', 'error');
      return;
    }

    try {
      const productId = productData?.id || productData?.productId;
      if (!productId) {
        showToast('Invalid product ID', 'error');
        return;
      }
      
      // Prepare options with selected color and size
      const options = {
        color: selectedColorVariant ? selectedColorVariant.color : selectedColor,
        size: selectedSizeVariant ? selectedSizeVariant.size : selectedSize,
        colorVariantId: selectedColorVariant?.id,
        sizeVariantId: selectedSizeVariant?.id,
        includeInstallation,
        installationPrice: includeInstallation ? productData.installationPrice : undefined,
      };
      
      const result = await addToCart(displayProduct, quantity, options);
      if (result?.success) {
        showToast('Item added to cart', 'success');
        openCartDrawer();
        if (onClose) {
          onClose();
        }
      } else if (result?.error) {
        showToast(result.error, 'error');
      }
    } catch (err) {
      console.error('[QuickViewModal] Add to cart error:', err);
      showToast(err.message || 'Failed to add item to cart', 'error');
    }
  };

  const handleViewFullDetails = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!productData?.id) return;
    onClose();
    router.push(`/products/${productData?.id}`);
  };

  const handleWishlistToggle = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!productData) {
      showToast('Product information is missing', 'error');
      return;
    }

    try {
      const result = await toggleWishlist(productData);
      if (result?.success) {
        const isInWishlistNow = isInWishlist(productData?.id || productData?.productId);
        showToast(
          isInWishlistNow ? 'Added to wishlist' : 'Removed from wishlist',
          'success'
        );
      } else if (result?.error) {
        showToast(result.error, 'error');
      }
    } catch (err) {
      console.error('[QuickViewModal] Wishlist error:', err);
      showToast(err.message || 'Failed to update wishlist', 'error');
    }
  };

  // Debug: Log when images change
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[QuickView] Image update:', {
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
        productImages: productImages,
        productImagesLength: productImages.length,
        currentImageIndex,
        currentImage: productImages[currentImageIndex]
      });
    }
  }, [selectedColor, selectedColorVariant, displayProduct, productImages, currentImageIndex]);
  
  const currentImage = productImages[currentImageIndex] || displayProduct?.image || productData?.image || '';
  const rating = productData?.rating || 0;
  const reviews = productData?.reviews || 0;
  const inStock = displayProduct?.inStock !== false;
  const productId = productData?.id || productData?.productId;
  
  // Normalize selected color and size for comparison
  const normalizedSelectedColor = selectedColor ? (typeof selectedColor === 'string' ? selectedColor : (selectedColor.value || selectedColor.name || selectedColor)) : null;
  const normalizedSelectedSize = selectedSize ? (typeof selectedSize === 'string' ? selectedSize : (selectedSize.value || selectedSize.label || selectedSize)) : null;
  
  // Check if product is in cart with same options
  const productInCart = cartItems.some(item => {
    const sameProduct = item.productId === productId || item.product?.id === productId;
    if (!sameProduct) return false;
    // Check if options match (normalize stored values too)
    const itemColor = item.color || item.options?.color;
    const itemSize = item.size || item.options?.size;
    const normalizedItemColor = itemColor ? (typeof itemColor === 'string' ? itemColor : (itemColor.value || itemColor.name || itemColor)) : null;
    const normalizedItemSize = itemSize ? (typeof itemSize === 'string' ? itemSize : (itemSize.value || itemSize.label || itemSize)) : null;
    const sameColor = (!normalizedSelectedColor && !normalizedItemColor) || (normalizedSelectedColor === normalizedItemColor);
    const sameSize = (!normalizedSelectedSize && !normalizedItemSize) || (normalizedSelectedSize === normalizedItemSize);
    return sameColor && sameSize;
  });
  
  const productInWishlist = productId ? isInWishlist(productId) : false;

  const rawOriginalPrice = Number(
    displayProduct?.originalPrice ?? product?.originalPrice ?? product?.regularPrice ?? product?.price ?? 0
  );
  const rawDiscountedPrice = Number(
    displayProduct?.discountedPrice ?? product?.discountedPrice ?? product?.salePrice ?? product?.price ?? rawOriginalPrice
  );
  const originalPrice = Number.isFinite(rawOriginalPrice) ? rawOriginalPrice : 0;
  const discountedPrice = Number.isFinite(rawDiscountedPrice) ? rawDiscountedPrice : 0;
  const hasDiscount = discountedPrice < originalPrice - 0.01;
  const displayPrice = hasDiscount ? discountedPrice : originalPrice;

  if (!isOpen || !productData) return null;

  // Render to document.body using Portal to avoid parent container constraints
  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop - moved to parent level for full screen coverage */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: modalConfig.backdrop.duration, 
              ease: modalConfig.backdrop.ease 
            }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            style={{ willChange: 'opacity' }}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[51] flex items-center justify-center p-2 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 15 }}
              transition={modalConfig.content}
              className="relative bg-white rounded-lg sm:rounded-2xl shadow-2xl w-full max-w-[95vw] h-[95vh] sm:h-auto sm:max-h-[90vh] sm:max-w-5xl mx-auto overflow-hidden flex flex-col pointer-events-auto"
              style={{ willChange: 'transform, opacity' }}
              onClick={(e) => e.stopPropagation()}
            >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Quick View</h2>
          <div className="flex items-center gap-2">
            {/* Wishlist button - only show if not preview only */}
            {!previewOnly && (
              <button
                onClick={handleWishlistToggle}
                disabled={isWishlistLoading}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                aria-label={productInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart 
                  size={20} 
                  className={`sm:w-[22px] sm:h-[22px] ${productInWishlist ? 'fill-red-500 text-red-500' : ''}`} 
                />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} className="sm:w-[22px] sm:h-[22px]" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-2 sm:p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 md:gap-6 flex-1 min-h-0">
          {/* Left: Product Images */}
          <div className="flex flex-col min-h-0">
            <div className="relative bg-transparent rounded-lg overflow-hidden group flex-shrink-0 flex items-center justify-center" style={{ aspectRatio: '1 / 1', maxHeight: '50vh' }}>
              {productImages.length ? (
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  <img
                    src={currentImage}
                    alt={productData?.title || productData?.name || 'Product'}
                    className="w-auto h-auto max-w-full max-h-full object-contain"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-transparent flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-white/90 hover:bg-white rounded-full shadow opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition z-10"
                  >
                    <ChevronLeft size={18} className="sm:w-[22px] sm:h-[22px]" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-white/90 hover:bg-white rounded-full shadow opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition z-10"
                  >
                    <ChevronRight size={18} className="sm:w-[22px] sm:h-[22px]" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col min-h-0 overflow-hidden">
            <div className="flex-shrink-0 mb-2">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 line-clamp-2">{productData?.title || productData?.name || 'Product'}</h1>

              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {hasDiscount && (
                  <span className="text-sm sm:text-base text-gray-500 line-through">${originalPrice.toFixed(2)}</span>
                )}
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                  ${displayPrice.toFixed(2)}
                  {includeInstallation && productData.installationPrice && (
                    <span className="text-sm text-gray-600 ml-1">
                      (+${productData.installationPrice.toFixed(2)})
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <div className="flex text-yellow-400 text-xs sm:text-sm">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>{i < Math.floor(rating) ? '★' : '☆'}</span>
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-gray-600">({reviews})</span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`}
                />
                <span
                  className={`text-xs sm:text-sm font-medium ${inStock ? 'text-green-600' : 'text-red-600'}`}
                >
                  {inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Quantity - only show if not preview only */}
            {!previewOnly && (
              <div className="flex-shrink-0 mb-2">
                <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-700">Quantity</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleQuantityChange(-1);
                    }}
                    disabled={quantity <= 1}
                    className="p-1.5 sm:p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} className="sm:w-[16px] sm:h-[16px]" />
                  </button>
                  <span className="text-sm sm:text-base font-medium w-8 sm:w-10 text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleQuantityChange(1);
                    }}
                    disabled={quantity >= (product?.maxQuantity || 10)}
                    className="p-1.5 sm:p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} className="sm:w-[16px] sm:h-[16px]" />
                  </button>
                </div>
              </div>
            )}

            {/* Colors - Only show if more than 1 color option and not preview only */}
            {!previewOnly && hasColorVariants && allColorOptions.length > 1 && (
              <div className="flex-shrink-0 mb-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Choose Color</label>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 ml-1">
                    {allColorOptions.map((variant) => {
                      const variantId = variant.id || variant.color;
                      const isSelected = selectedColor === variantId || selectedColor === variant.color;
                      const colorValue = variant.colorCode || 
                        (variant.color?.toLowerCase().includes('beige') ? '#F5F5DC' :
                         variant.color?.toLowerCase().includes('brown') ? '#8B4513' :
                         variant.color?.toLowerCase().includes('black') ? '#000000' :
                         variant.color?.toLowerCase().includes('white') ? '#FFFFFF' :
                         variant.color?.toLowerCase().includes('gray') ? '#808080' :
                         '#CCCCCC');
                      
                      // Check for color swatch image (with fallback)
                      const swatchImage = variant.colorSwatchImage 
                        ? (typeof variant.colorSwatchImage === 'string' ? variant.colorSwatchImage.trim() : null)
                        : null;
                      const mainImage = variant.image 
                        ? (typeof variant.image === 'string' ? variant.image.trim() : null)
                        : null;
                      
                      // Debug in development
                      if (process.env.NODE_ENV === 'development') {
                        console.log(`[QuickView Color Picker] Variant ${variantId}:`, {
                          variant: variant,
                          colorSwatchImage: variant.colorSwatchImage,
                          swatchImage,
                          mainImage,
                          willUseSwatch: !!swatchImage,
                          willUseMain: !swatchImage && !!mainImage,
                          hasColorSwatchImage: !!variant.colorSwatchImage
                        });
                      }
                      
                      return (
                        <button
                          key={variantId}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('[QuickView] Color variant clicked:', {
                              variantId,
                              variant: variant,
                              variantImage: variant.image,
                              variantImages: variant.images,
                              variantImagesLength: variant.images?.length || 0,
                              currentSelectedColor: selectedColor
                            });
                            // Update selected color first
                            setSelectedColor(variantId);
                            // Reset image index when color changes
                            setCurrentImageIndex(0);
                          }}
                          className={`relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg border-2 transition overflow-hidden flex items-center justify-center ${
                            isSelected ? 'border-[#0B4866] ring-1 ring-[#0B4866]' : 'border-gray-300 hover:border-gray-400'
                          }`}
                          aria-label={`Select color ${variant.title || variant.color}`}
                          title={variant.title || variant.color}
                        >
                          {swatchImage ? (
                            <div className="relative w-full h-full flex items-center justify-center p-0.5">
                              <img
                                src={swatchImage}
                                alt={variant.title || variant.color}
                                className="w-auto h-auto max-w-full max-h-full object-contain rounded"
                                loading="lazy"
                              />
                            </div>
                          ) : mainImage ? (
                            <div className="relative w-full h-full flex items-center justify-center p-0.5">
                              <img
                                src={mainImage}
                                alt={variant.title || variant.color}
                                className="w-auto h-auto max-w-full max-h-full object-contain rounded"
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            <div
                              className="w-full h-full rounded-lg"
                              style={{ backgroundColor: colorValue }}
                            />
                          )}
                          {isSelected && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-[#0B4866] rounded-full flex items-center justify-center">
                              <svg className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                  );
                })}
                  </div>
                  {selectedColorVariant && hasColorVariants && allColorOptions.length > 1 && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-medium text-gray-900">
                        Selected Color:
                      </span>
                      <span className="text-xs sm:text-sm text-gray-700">
                        {selectedColorVariant.color || selectedColorVariant.title}
                      </span>
                      {!selectedColorVariant.inStock && (
                        <span className="text-xs text-red-600 font-medium">(Out of Stock)</span>
                      )}
                    </div>
                  )}
              </div>
            )}

            {/* Sizes - only show if not preview only */}
            {!previewOnly && (
              <div className="flex-shrink-0 mb-2">
                {hasSizeVariants && (
                <>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Choose Size</label>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {allSizeOptions.map((variant) => {
                      const variantId = variant.id || variant.size;
                      const isSelected = selectedSize === variantId || selectedSize === variant.size;
                      const isOutOfStock = !variant.inStock;
                      
                      return (
                        <button
                          key={variantId}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isOutOfStock) {
                              setSelectedSize(variantId);
                              setCurrentImageIndex(0);
                            }
                          }}
                          disabled={isOutOfStock}
                          className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg text-xs sm:text-sm font-medium border-2 transition ${
                            isSelected
                              ? 'bg-[#0B4866] text-white border-[#0B4866]'
                              : isOutOfStock
                              ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'border-gray-300 hover:border-[#0B4866]'
                          }`}
                          title={variant.title || variant.size}
                          aria-label={`Select size ${variant.title || variant.size}`}
                        >
                          {variant.size}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
              </div>
            )}

            {/* Installation Option - only show if not preview only */}
            {!previewOnly && hasInstallation && (
              <div className="flex-shrink-0 mb-2 border border-gray-200 rounded-lg p-2 sm:p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900">Installation Service</h4>
                    <p className="text-xs text-gray-600">
                      Add professional installation
                      {productData.installationPrice && (
                        <span className="font-semibold text-[#0B4866] ml-1">
                          (+${productData.installationPrice.toFixed(2)})
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIncludeInstallation(!includeInstallation);
                    }}
                    className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                      includeInstallation ? 'bg-[#0B4866]' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                        includeInstallation ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Buttons - only show if not preview only */}
            {!previewOnly && (
              <>
                <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 mt-auto pt-2 sm:pt-3 border-t border-gray-200 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleQuickShop}
                    disabled={!inStock}
                    className="flex-1 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1 sm:gap-2 cursor-pointer disabled:cursor-not-allowed text-xs sm:text-sm md:text-base"
                  >
                    <ShoppingBag size={12} className="sm:w-[14px] sm:h-[14px] md:w-[16px] md:h-[16px]" /> 
                    <span className="hidden sm:inline">Quick Shop</span>
                    <span className="sm:hidden">Quick</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!inStock || productInCart}
                    className={`flex-1 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-lg text-white flex items-center justify-center gap-1 sm:gap-2 transition text-xs sm:text-sm md:text-base ${
                      !inStock
                        ? 'bg-gray-400'
                        : productInCart
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-[#0F4C81] hover:bg-[#0D3F6A]'
                    }`}
                  >
                    <ShoppingCart size={12} className="sm:w-[14px] sm:h-[14px] md:w-[16px] md:h-[16px]" />
                    <span className="hidden sm:inline">{!inStock ? 'Out of Stock' : productInCart ? 'In Cart' : 'Add to Cart'}</span>
                    <span className="sm:hidden">{!inStock ? 'Out' : productInCart ? 'In Cart' : 'Add'}</span>
                  </button>
                </div>

                <div className="text-center pb-1 sm:pb-2 flex-shrink-0 mt-5">
                  <button
                    onClick={handleViewFullDetails}
                    className="text-[#0F4C81] hover:text-[#0D3F6A] text-xs sm:text-sm underline font-medium"
                  >
                    View Full Detail Page
                  </button>
                </div>
              </>
            )}
          </div>
          </div>
        </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  // Render to document.body using Portal to avoid parent container constraints
  if (typeof window === 'undefined') {
    return null;
  }

  return createPortal(modalContent, document.body);
};

export default QuickViewModal;
