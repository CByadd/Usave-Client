"use client";
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ShoppingBag, ShoppingCart, Minus, Plus } from 'lucide-react';
import OptimizedImage from '../shared/OptimizedImage';
import { addToCart, fetchCart, getCartItems, isInCart } from '../../lib/cart';
import { useRouter } from 'next/navigation';
import { openCartDrawer, showToast } from '../../lib/ui';

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const router = useRouter();
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

  if (!isOpen || !product) return null;

  const handleNextImage = () => setCurrentImageIndex((p) => (p + 1) % productImages.length);
  const handlePrevImage = () => setCurrentImageIndex((p) => (p - 1 + productImages.length) % productImages.length);
  const handleQuantityChange = (d) => setQuantity((p) => Math.max(1, Math.min(p + d, product.maxQuantity || 10)));

  const handleQuickShop = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (product.inStock === false) {
      showToast('This product is out of stock', 'error');
      return;
    }

    try {
      const productId = product.id || product.productId;
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
    
    if (product.inStock === false) {
      showToast('This product is out of stock', 'error');
      return;
    }

    try {
      const productId = product.id || product.productId;
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
    router.push(`/products/${product.id}`);
    onClose();
  };

  const currentImage = productImages[currentImageIndex] || product.image;
  const rating = product.rating || 0;
  const reviews = product.reviews || 0;
  const inStock = product.inStock !== false;
  const productInCart = cartItems.some(c => c.productId === product.id || c.product?.id === product.id);

  const originalPrice = product.originalPrice || product.regularPrice || product.price || 0;
  const discountedPrice = product.discountedPrice || product.salePrice || product.price || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-none sm:rounded-2xl shadow-2xl w-full h-full sm:h-auto sm:max-w-5xl mx-auto overflow-hidden flex flex-col">
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
        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-60px)] sm:max-h-[80vh]">
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Left: Product Images */}
          <div className="space-y-3 sm:space-y-4">
            <div className="relative bg-gray-50 rounded-lg aspect-square overflow-hidden group">
              {productImages.length ? (
                <OptimizedImage
                  src={currentImage}
                  alt={product.title}
                  width={600}
                  height={600}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
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
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{product.title}</h1>

              <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                {originalPrice > discountedPrice && (
                  <span className="text-base sm:text-lg text-gray-500 line-through">${originalPrice.toFixed(2)}</span>
                )}
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">${discountedPrice.toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>{i < Math.floor(rating) ? '★' : '☆'}</span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">({reviews})</span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`h-2 w-2 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`}
                />
                <span
                  className={`text-sm font-medium ${inStock ? 'text-green-600' : 'text-red-600'}`}
                >
                  {inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Quantity</label>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="p-2 sm:p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <Minus size={18} className="sm:w-[18px] sm:h-[18px]" />
                </button>
                <span className="text-base sm:text-lg font-medium w-10 text-center">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= (product.maxQuantity || 10)}
                  className="p-2 sm:p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <Plus size={18} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Choose Color</label>
              <div className="flex gap-2 sm:gap-4 flex-wrap">
                {colors.map((color) => {
                  const colorName = typeof color === 'string' ? color : color.name;
                  const isSelected = selectedColor === colorName;
                  const colorValue = colorName.toLowerCase() === 'beige' ? '#F5F5DC' : colorName.toLowerCase() === 'brown' ? '#8B4513' : colorName;
                  return (
                    <button
                      key={colorName}
                      onClick={() => setSelectedColor(colorName)}
                      className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg border-2 transition ${
                        isSelected ? 'border-[#0B4866] ring-2 ring-[#0B4866]' : 'border-gray-300'
                      }`}
                    >
                      <div
                        className="w-full h-full rounded-lg"
                        style={{ backgroundColor: colorValue }}
                      />
                      {isSelected && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-[#0B4866] rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {selectedColor && (
                <span className="text-xs sm:text-sm text-gray-600 mt-2 block">{selectedColor}</span>
              )}
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Choose Size</label>
              <div className="flex gap-2 sm:gap-3 flex-wrap">
                {sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg text-xs sm:text-sm font-medium border-2 transition ${
                        isSelected
                          ? 'bg-[#0B4866] text-white border-[#0B4866]'
                          : 'border-gray-300 hover:border-[#0B4866]'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleQuickShop}
                disabled={!inStock}
                className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <ShoppingBag size={16} className="sm:w-[18px] sm:h-[18px]" /> Quick Shop
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!inStock || productInCart}
                className={`flex-1 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg text-white flex items-center justify-center gap-2 transition text-sm sm:text-base ${
                  !inStock
                    ? 'bg-gray-400'
                    : productInCart
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-[#0F4C81] hover:bg-[#0D3F6A]'
                }`}
              >
                <ShoppingCart size={16} className="sm:w-[18px] sm:h-[18px]" />
                {!inStock ? 'Out of Stock' : productInCart ? 'In Cart' : 'Add to Cart'}
              </button>
            </div>

            <div className="text-center pb-2 sm:pb-0">
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
      </div>
    </div>
  );
};

export default QuickViewModal;
