"use client";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, ShoppingBag, ShoppingCart, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationStore } from '../../stores/useAnimationStore';
import OptimizedImage from '../shared/OptimizedImage';
import { addToCart, fetchCart, getCartItems, isInCart } from '../../lib/cart';
import { useRouter } from 'next/navigation';
import { openCartDrawer, showToast } from '../../lib/ui';

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const router = useRouter();
  const { getAnimationConfig, animationsEnabled } = useAnimationStore();
  const modalConfig = getAnimationConfig('modal');
  const [cartItems, setCartItems] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product?.color || product?.colors?.[0] || '');
  const [selectedSize, setSelectedSize] = useState(product?.size || product?.sizes?.[0] || 'M');

  const productImages = product?.images?.length ? product.images : product?.image ? [product.image] : [];
  const colors = product?.colors || (product?.color ? [product.color] : ['Beige', 'Brown']);
  const sizes = product?.sizes || ['XS', 'S', 'M', 'L', 'XL'];

  useEffect(() => {
    // Load cart status
    const loadCart = async () => {
      await fetchCart();
      setCartItems(getCartItems());
    };
    if (isOpen) {
      loadCart();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && product) {
      setCurrentImageIndex(0);
      setQuantity(1);
      setSelectedColor(product?.color || colors[0]);
      setSelectedSize(product?.size || sizes[0]);
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
      const result = await addToCart(productId, quantity);
      if (result?.success) {
        const { items } = await fetchCart();
        setCartItems(items);
        showToast('Item added to cart', 'success');
        router.push('/cart');
        if (onClose) {
          onClose();
        }
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
      const result = await addToCart(productId, quantity);
      if (result?.success) {
        const { items } = await fetchCart();
        setCartItems(items);
        openCartDrawer();
        showToast('Item added to cart', 'success');
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

  const handleViewFullDetails = () => {
    if (!product?.id) return;
    router.push(`/products/${product?.id}`);
    onClose();
  };

  const currentImage = productImages[currentImageIndex] || product?.image || '';
  const rating = product?.rating || 0;
  const reviews = product?.reviews || 0;
  const inStock = product?.inStock !== false;
  const productInCart = cartItems.some(c => c.productId === product?.id || c.product?.id === product?.id);

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
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} className="sm:w-[22px] sm:h-[22px]" />
          </button>
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
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="p-1.5 sm:p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <Minus size={14} className="sm:w-[16px] sm:h-[16px]" />
                </button>
                <span className="text-sm sm:text-base font-medium w-8 sm:w-10 text-center">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= (product?.maxQuantity || 10)}
                  className="p-1.5 sm:p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
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
                  const isSelected = selectedColor === color;
                  const colorValue = typeof color === 'string' ? color : color.value || '#000';
                  const colorName = typeof color === 'string' ? color : color.name || color;
                  return (
                    <button
                      key={colorName}
                      onClick={() => setSelectedColor(color)}
                      className={`relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg border-2 transition ${
                        isSelected ? 'border-[#0B4866] ring-1 ring-[#0B4866]' : 'border-gray-300 hover:border-gray-400'
                      }`}
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
                  const isSelected = selectedSize === size;
                  const sizeValue = typeof size === 'string' ? size : size.value || size;
                  const sizeLabel = typeof size === 'string' ? size : size.label || size;
                  return (
                    <button
                      key={sizeValue}
                      onClick={() => setSelectedSize(size)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg text-xs sm:text-sm font-medium border-2 transition ${
                        isSelected
                          ? 'bg-[#0B4866] text-white border-[#0B4866]'
                          : 'border-gray-300 hover:border-[#0B4866]'
                      }`}
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

            <div className="text-center pb-1 sm:pb-2 flex-shrink-0">              <button
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
