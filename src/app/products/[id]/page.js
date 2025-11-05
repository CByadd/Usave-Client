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
import { useAuthStore } from '../../stores/useAuthStore';
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
  const { isAuthenticated } = useAuthStore();

  // UI Store
  const { openCartDrawer, openAuthDrawer } = useUIStore();

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

  // Mock colors and sizes for products
  const colors = product?.colors || ['Beige', 'Brown'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];

  const handleQuickShop = async () => {
    if (!isAuthenticated) {
      openAuthDrawer();
      return;
    }
    
    if (!product) return;
    
    // Check if product is in stock before attempting to add
    if (!product.inStock) {
      showToast('This product is out of stock', 'error');
      return;
    }
    
    const result = await addToCart(product, quantity);
    
    if (result?.success) {
      await loadCart();
      showToast('Item added to cart', 'success');
      router.push('/cart');
    } else if (result?.error) {
      showToast(result.error, 'error');
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      openAuthDrawer();
      return;
    }
    
    if (!product) return;
    
    // Check if product is in stock before attempting to add
    if (!product.inStock) {
      showToast('This product is out of stock', 'error');
      return;
    }
    
    const result = await addToCart(product, quantity);
    
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
    
    const result = await toggleWishlist(product);
    if (result?.success) {
      await loadWishlist();
      showToast(
        isInWishlist(product.id) 
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

  const productImages = product.images || [product.image || ''];
  const rating = Number(product.rating) || 0;
  const reviews = Number(product.reviewCount || product.reviews) || 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-[#0B4866]">Home</Link>
          <span>/</span>
          <Link href={`/categories/${product.category || 'products'}`} className="hover:text-[#0B4866] capitalize">
            {product.category || 'Products'}
          </Link>
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-12">
          {/* Left: Product Image Gallery */}
          <div className="relative">
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
            <div className="relative bg-gray-50 rounded-lg aspect-square overflow-hidden group mb-4">
              <OptimizedImage
                src={productImages[selectedImage] || product.image || ''}
                alt={product.title || 'Product'}
                width={800}
                height={800}
                className="w-full h-full object-contain"
                priority
              />
              
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

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                    selectedImage === index ? 'border-[#0B4866]' : 'border-gray-200'
                  }`}
                >
                  <OptimizedImage
                    src={image || ''}
                    alt={`${product.title || 'Product'} ${index + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="space-y-6">
            {/* Product Title */}
            <h1 className="text-3xl md:text-4xl font-semibold text-[#0B4866]">{product.title || 'Product'}</h1>

            {/* Price */}
            <div className="flex items-center gap-4">
              {product.originalPrice && product.discountedPrice && product.originalPrice > product.discountedPrice && (
                <span className="text-xl text-gray-500 line-through">${(product.originalPrice || 0).toFixed(2)}</span>
              )}
              <span className="text-3xl font-bold text-[#0B4866]">${(product.discountedPrice || product.originalPrice || 0).toFixed(2)}</span>
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
              <div className={`h-2 w-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Choose Color</label>
              <div className="flex gap-3 flex-wrap">
                {colors.map((color) => {
                  const isSelected = selectedColor === color;
                  // Simple color mapping for display
                  const colorValue = color.toLowerCase().includes('beige') ? '#F5F5DC' :
                                    color.toLowerCase().includes('brown') ? '#8B4513' :
                                    color.toLowerCase().includes('black') ? '#000000' :
                                    color.toLowerCase().includes('white') ? '#FFFFFF' :
                                    color.toLowerCase().includes('gray') ? '#808080' :
                                    '#CCCCCC';
                  
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`relative w-16 h-16 rounded-lg border-2 transition ${isSelected ? 'border-[#0B4866] ring-2 ring-[#0B4866]' : 'border-gray-300'}`}
                    >
                      <div
                        className="w-full h-full rounded-lg"
                        style={{ backgroundColor: colorValue }}
                      />
                      {isSelected && (
                        <svg className="absolute inset-0 m-auto w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
              {selectedColor && (
                <span className="text-sm text-gray-600 mt-2 block">{selectedColor}</span>
              )}
            </div>

            {/* Choose Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Choose Size</label>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-lg text-sm font-medium border-2 transition ${
                      selectedSize === size
                        ? 'border-[#0B4866] bg-[#0B4866] text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Installation Option */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Installation Service</h4>
                  <p className="text-sm text-gray-600">Add professional installation service</p>
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleQuickShop}
                disabled={!product.inStock}
                className="flex-1 border border-[#0B4866] bg-white text-[#0B4866] py-3 px-6 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={20} />
                Quick Shop
              </button>
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex-1 py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition ${
                  !product.inStock
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : isInCart(product.id)
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-[#0B4866] text-white hover:bg-[#0a3d55]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <ShoppingCart size={20} />
                {!product.inStock ? 'Out of Stock' : isInCart(product.id) ? `In Cart (${getItemQuantity(product.id)})` : 'Add to cart'}
              </button>
            </div>
          </div>
        </div>

        {/* Product Information Tabs */}
        <div className="mb-12">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8">
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
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
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

          <div className="py-8">
            {activeTab === 'details' && (
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">{product.description || 'No description available.'}</p>
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
              <div className="text-center py-12">
                <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
              </div>
            )}

            {activeTab === 'dimensions' && product.dimensions && typeof product.dimensions === 'object' && (
              <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(product.dimensions).map(([key, value]) => (
                  <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#0B4866]">{String(value || 0)}cm</div>
                    <div className="text-sm text-gray-600 capitalize mt-1">{String(key || '')}</div>
                  </div>
                ))}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
