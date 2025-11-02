"use client";
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ShoppingBag, ShoppingCart, Minus, Plus } from 'lucide-react';
import OptimizedImage from '../shared/OptimizedImage';
import { useCart } from '../../contexts/CartContext';
import { useRouter } from 'next/navigation';
import { useUI } from '../../contexts/UIContext';
import Link from 'next/link';

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const router = useRouter();
  const { addToCart, isInCart } = useCart();
  const { openCartDrawer } = useUI();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product?.color || product?.colors?.[0] || '');
  const [selectedSize, setSelectedSize] = useState(product?.size || product?.sizes?.[0] || 'M');

  // Product images - use product images array or single image
  const productImages = product?.images && product.images.length > 0 
    ? product.images 
    : product?.image 
    ? [product.image] 
    : [];

  const colors = product?.colors || product?.color ? [product.color] : ['Beige', 'Brown'];
  const sizes = product?.sizes || ['XS', 'S', 'M', 'L', 'XL'];

  useEffect(() => {
    if (isOpen && product) {
      setCurrentImageIndex(0);
      setQuantity(1);
      setSelectedColor(product?.color || colors[0] || '');
      setSelectedSize(product?.size || sizes[0] || 'M');
    }
  }, [isOpen, product]);

  useEffect(() => {
    // Close on ESC key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, product.maxQuantity || 10)));
  };

  const handleQuickShop = async () => {
    const productWithOptions = {
      ...product,
      quantity,
      selectedColor,
      selectedSize
    };
    await addToCart(productWithOptions);
    router.push('/cart');
    onClose();
  };

  const handleAddToCart = async () => {
    const productWithOptions = {
      ...product,
      quantity,
      selectedColor,
      selectedSize
    };
    await addToCart(productWithOptions);
    openCartDrawer();
  };

  const handleViewFullDetails = () => {
    router.push(`/products/${product.id}`);
    onClose();
  };

  const currentImage = productImages[currentImageIndex] || product.image;
  const rating = product.rating || 0;
  const reviews = product.reviews || 0;
  const inStock = product.inStock !== false;
  
  // Handle different price field names
  const originalPrice = product.originalPrice || product.regularPrice || product.price || 0;
  const discountedPrice = product.discountedPrice || product.salePrice || product.price || 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick view</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid md:grid-cols-2 gap-6 p-6">
              {/* Left Side - Product Images */}
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative bg-gray-50 rounded-lg aspect-square overflow-hidden group">
                  {productImages.length > 0 ? (
                    <OptimizedImage
                      src={currentImage}
                      alt={product.title}
                      width={600}
                      height={600}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}

                  {/* Image Navigation Arrows */}
                  {productImages.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={24} className="text-gray-700" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Next image"
                      >
                        <ChevronRight size={24} className="text-gray-700" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  {productImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-xs rounded-full">
                      {currentImageIndex + 1} / {productImages.length}
                    </div>
                  )}
                </div>

                {/* Thumbnail Images */}
                {productImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {productImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === currentImageIndex 
                            ? 'border-[#0F4C81] ring-2 ring-[#0F4C81] ring-offset-2' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <OptimizedImage
                          src={img}
                          alt={`${product.title} ${index + 1}`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Side - Product Details */}
              <div className="space-y-6">
                {/* Product Name */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
                  
                  {/* Price */}
                  <div className="flex items-center gap-3 mb-3">
                    {originalPrice > discountedPrice && (
                      <span className="text-lg text-gray-500 line-through">
                        ${originalPrice.toFixed(2)}
                      </span>
                    )}
                    <span className="text-3xl font-bold text-gray-900">
                      ${discountedPrice.toFixed(2)}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-lg">
                          {i < Math.floor(rating) ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({reviews})</span>
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`h-2 w-2 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={`text-sm font-medium ${inStock ? 'text-green-600' : 'text-red-600'}`}>
                      {inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={20} />
                    </button>
                    <span className="text-lg font-medium text-gray-900 w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= (product.maxQuantity || 10)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                {/* Color Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose Color
                  </label>
                  <div className="flex gap-3">
                    {colors.map((color) => {
                      const colorName = typeof color === 'string' ? color : color.name || color;
                      const colorImage = typeof color === 'object' ? color.image : null;
                      const isSelected = selectedColor === colorName;

                      return (
                        <button
                          key={colorName}
                          onClick={() => setSelectedColor(colorName)}
                          className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            isSelected 
                              ? 'border-[#0F4C81] ring-2 ring-[#0F4C81] ring-offset-2 scale-105' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          title={colorName}
                        >
                          {colorImage ? (
                            <OptimizedImage
                              src={colorImage}
                              alt={colorName}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div 
                              className="w-full h-full"
                              style={{ 
                                backgroundColor: colorName.toLowerCase() === 'beige' ? '#F5F5DC' : 
                                               colorName.toLowerCase() === 'brown' ? '#8B4513' : 
                                               '#D3D3D3' 
                              }}
                            />
                          )}
                          {isSelected && (
                            <div className="absolute inset-0 bg-black/10" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">Selected: {selectedColor}</p>
                </div>

                {/* Size Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose Size
                  </label>
                  <div className="flex gap-2">
                    {sizes.map((size) => {
                      const sizeValue = typeof size === 'string' ? size : size.value || size;
                      const isSelected = selectedSize === sizeValue;

                      return (
                        <button
                          key={sizeValue}
                          onClick={() => setSelectedSize(sizeValue)}
                          className={`w-12 h-12 rounded-full border-2 font-medium transition-all ${
                            isSelected
                              ? 'bg-[#0F4C81] text-white border-[#0F4C81] scale-110'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-[#0F4C81] hover:text-[#0F4C81]'
                          }`}
                        >
                          {sizeValue}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleQuickShop}
                    disabled={!inStock}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={20} />
                    Quick Shop
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={!inStock}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-2 ${
                      !inStock
                        ? 'bg-gray-400 cursor-not-allowed'
                        : isInCart(product.id)
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-[#0F4C81] hover:bg-[#0D3F6A]'
                    }`}
                  >
                    <ShoppingCart size={20} />
                    {!inStock ? 'Out of Stock' : isInCart(product.id) ? 'In Cart' : 'Add to cart'}
                  </button>
                </div>

                {/* View Full Details Link */}
                <div className="text-center">
                  <button
                    onClick={handleViewFullDetails}
                    className="text-[#0F4C81] hover:text-[#0D3F6A] font-medium text-sm underline"
                  >
                    View Full Detail Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;

