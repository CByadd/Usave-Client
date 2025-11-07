"use client";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, ShoppingBag, ShoppingCart, Minus, Plus, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationStore } from '../../stores/useAnimationStore';
import OptimizedImage from '../shared/OptimizedImage';
import { useRouter } from 'next/navigation';
import { openCartDrawer, showToast } from '../../lib/ui';
import { useWishlist } from '../../stores/useWishlistStore';
import { useCart } from '../../stores/useCartStore';

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const router = useRouter();
  const { getAnimationConfig, animationsEnabled } = useAnimationStore();
  const modalConfig = getAnimationConfig('modal');
  const { toggleWishlist, isInWishlist, isLoading: isWishlistLoading } = useWishlist();
  const { addToCart, cartItems, isInCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product?.color || product?.colors?.[0] || '');
  const [selectedSize, setSelectedSize] = useState(product?.size || product?.sizes?.[0] || 'M');

  const productImages = product?.images?.length ? product.images : product?.image ? [product.image] : [];
  const colors = product?.colors || (product?.color ? [product.color] : ['Beige', 'Brown']);
  const sizes = product?.sizes || ['XS', 'S', 'M', 'L', 'XL'];

  // Cart is managed by Zustand store, no need to load manually

  useEffect(() => {
    if (isOpen && product) {
      setCurrentImageIndex(0);
      setQuantity(1);
      // Reset selections when product or modal opens
      const defaultColor = product?.color || product?.colors?.[0] || (product?.colors?.length ? product.colors[0] : '');
      const defaultSize = product?.size || product?.sizes?.[0] || (product?.sizes?.length ? product.sizes[0] : 'M');
      setSelectedColor(defaultColor);
      setSelectedSize(defaultSize);
    }
  }, [isOpen, product]);

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
  const handleQuantityChange = (d) => setQuantity((p) => Math.max(1, Math.min(p + d, product?.maxQuantity || 10)));

  const handleQuickShop = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!product || product?.inStock === false) {
      showToast('This product is out of stock', 'error');
      return;
    }

    try {
      const productId = product?.id || product?.productId;
      if (!productId) {
        showToast('Invalid product ID', 'error');
        return;
      }
      
      // Prepare options with selected color and size (normalize to string values)
      const options = {};
      if (selectedColor) {
        options.color = typeof selectedColor === 'string' ? selectedColor : (selectedColor.value || selectedColor.name || selectedColor);
      }
      if (selectedSize) {
        options.size = typeof selectedSize === 'string' ? selectedSize : (selectedSize.value || selectedSize.label || selectedSize);
      }
      
      const result = await addToCart(product, quantity, options);
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
    
    if (!product || product?.inStock === false) {
      showToast('This product is out of stock', 'error');
      return;
    }

    try {
      const productId = product?.id || product?.productId;
      if (!productId) {
        showToast('Invalid product ID', 'error');
        return;
      }
      
      // Prepare options with selected color and size (normalize to string values)
      const options = {};
      if (selectedColor) {
        options.color = typeof selectedColor === 'string' ? selectedColor : (selectedColor.value || selectedColor.name || selectedColor);
      }
      if (selectedSize) {
        options.size = typeof selectedSize === 'string' ? selectedSize : (selectedSize.value || selectedSize.label || selectedSize);
      }
      
      const result = await addToCart(product, quantity, options);
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
    if (!product?.id) return;
    onClose();
    router.push(`/products/${product?.id}`);
  };

  const handleWishlistToggle = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!product) {
      showToast('Product information is missing', 'error');
      return;
    }

    try {
      const result = await toggleWishlist(product);
      if (result?.success) {
        const isInWishlistNow = isInWishlist(product?.id || product?.productId);
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

  const currentImage = productImages[currentImageIndex] || product?.image || '';
  const rating = product?.rating || 0;
  const reviews = product?.reviews || 0;
  const inStock = product?.inStock !== false;
  const productId = product?.id || product?.productId;
  
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

  const originalPrice = product?.originalPrice || product?.regularPrice || product?.price || 0;
  const discountedPrice = product?.discountedPrice || product?.salePrice || product?.price || 0;

  if (!isOpen || !product) return null;

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
            {/* Wishlist button */}
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
            <div className="relative bg-transparent rounded-lg overflow-hidden group flex-shrink-0" style={{ aspectRatio: '1 / 1', maxHeight: '50vh' }}>
              {productImages.length ? (
                <OptimizedImage
                  src={currentImage}
                  alt={product?.title || product?.name || 'Product'}
                  width={600}
                  height={600}
                  className="w-full h-full object-contain"
                  fill
                />
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
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 line-clamp-2">{product?.title || product?.name || 'Product'}</h1>

              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {originalPrice > discountedPrice && (
                  <span className="text-sm sm:text-base text-gray-500 line-through">${originalPrice.toFixed(2)}</span>
                )}
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">${discountedPrice.toFixed(2)}</span>
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

            {/* Quantity */}
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

            {/* Colors */}
            <div className="flex-shrink-0 mb-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Choose Color</label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 ml-1">
                {colors.map((color) => {
                  const colorValue = typeof color === 'string' ? color : color.value || '#000';
                  const colorName = typeof color === 'string' ? color : color.name || color;
                  // Compare color values for selection state
                  const currentColorValue = typeof selectedColor === 'string' ? selectedColor : (selectedColor?.value || selectedColor?.name || selectedColor);
                  const isSelected = colorValue === currentColorValue || colorName === currentColorValue || JSON.stringify(color) === JSON.stringify(selectedColor);
                  
                  return (
                    <button
                      key={colorName}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedColor(color);
                      }}
                      className={`relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg border-2 transition ${
                        isSelected ? 'border-[#0B4866] ring-1 ring-[#0B4866]' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      aria-label={`Select color ${colorName}`}
                    >
                      <div
                        className="w-full h-full rounded-lg"
                        style={{ backgroundColor: colorValue }}
                      />
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
            </div>

            {/* Sizes */}
            <div className="flex-shrink-0 mb-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Choose Size</label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {sizes.map((size) => {
                  const sizeValue = typeof size === 'string' ? size : size.value || size;
                  const sizeLabel = typeof size === 'string' ? size : size.label || size;
                  // Compare size values for selection state
                  const currentSizeValue = typeof selectedSize === 'string' ? selectedSize : (selectedSize?.value || selectedSize?.label || selectedSize);
                  const isSelected = sizeValue === currentSizeValue || sizeLabel === currentSizeValue || JSON.stringify(size) === JSON.stringify(selectedSize);
                  
                  return (
                    <button
                      key={sizeValue}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedSize(size);
                      }}
                      className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg text-xs sm:text-sm font-medium border-2 transition ${
                        isSelected
                          ? 'bg-[#0B4866] text-white border-[#0B4866]'
                          : 'border-gray-300 hover:border-[#0B4866]'
                      }`}
                      aria-label={`Select size ${sizeLabel}`}
                    >
                      {sizeLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Buttons */}
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
