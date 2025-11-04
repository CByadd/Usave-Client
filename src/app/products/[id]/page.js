"use client";
import React, { useState, useEffect } from 'react';
import OptimizedImage from '../../components/shared/OptimizedImage';
import { ProductDetailSkeleton } from '../../components/shared/LoadingSkeleton';
import { Heart, ShoppingCart, ShoppingBag, ChevronLeft, ChevronRight, ArrowRight, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { fetchCart, getCartItems, addToCart, isInCart, getItemQuantity } from '../../lib/cart';
import { openCartDrawer, openAuthDrawer, showToast } from '../../lib/ui';
import { getCurrentUser, isAuthenticated } from '../../lib/auth';
import { fetchWishlist, getWishlistItems, toggleWishlist, isInWishlist } from '../../lib/wishlist';
import productService from '../../services/api/productService';
import ProductCard from '../../components/product/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id;
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [includeInstallation, setIncludeInstallation] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  
  useEffect(() => {
    const loadStatus = async () => {
      await fetchCart();
      await fetchWishlist();
      setCartItems(getCartItems());
      setWishlistItems(getWishlistItems());
    };
    loadStatus();
  }, []);
  
  const isInCartLocal = (productId) => isInCart(productId);
  const getItemQuantityLocal = (productId) => getItemQuantity(productId);
  const isInWishlistLocal = (productId) => isInWishlist(productId);

  // Mock colors and sizes for products
  const colors = product?.colors || ['Beige', 'Brown'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await productService.getProductById(productId);
        if (response.success) {
          setProduct(response.data);
          const productColors = response.data?.colors || ['Beige', 'Brown'];
          setSelectedColor(productColors[0]);
        } else {
          setError('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  useEffect(() => {
    const fetchRelated = async () => {
      if (product?.category) {
        try {
          const response = await productService.getRelatedProducts(productId, 4);
          if (response.success) {
            setRelatedProducts(response.data);
          }
        } catch (error) {
          console.error('Error fetching related products:', error);
        }
      }
    };
    fetchRelated();
  }, [product, productId]);

  const handleNextImage = () => {
    if (product?.images) {
      setSelectedImage((prev) => (prev + 1) % product.images.length);
    }
  };

  const handlePrevImage = () => {
    if (product?.images) {
      setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const handleQuickShop = async () => {
    if (!isAuthenticated()) {
      openAuthDrawer('login');
      return;
    }
    
    // Check if product is in stock before attempting to add
    if (!product.inStock) {
      showToast('This product is out of stock', 'error');
      return;
    }
    
    const result = await addToCart(product.id || productId, quantity);
    
    if (result?.success) {
      await fetchCart();
      setCartItems(getCartItems());
    router.push('/cart');
    } else if (result?.error) {
      showToast(result.error, 'error');
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      openAuthDrawer('login');
      return;
    }
    
    // Check if product is in stock before attempting to add
    if (!product.inStock) {
      showToast('This product is out of stock', 'error');
      return;
    }
    
    const result = await addToCart(product.id || productId, quantity);
    
    if (result?.success) {
      await fetchCart();
      setCartItems(getCartItems());
      openCartDrawer();
      showToast('Item added to cart', 'success');
    } else if (result?.error) {
      showToast(result.error, 'error');
    }
  };

  const handleWishlistToggle = async () => {
    const result = await toggleWishlist(product);
    if (result?.success) {
      await fetchWishlist();
      setWishlistItems(getWishlistItems());
      showToast('Wishlist updated', 'success');
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

  const productImages = product.images || [product.image];
  const rating = product.rating || 0;
  const reviews = product.reviews || 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-[#0B4866]">Home</Link>
          <span>/</span>
          <Link href={`/categories/${product.category}`} className="hover:text-[#0B4866] capitalize">
            {product.category}
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
              {isInWishlistLocal(product.id) ? (
                <Heart size={24} className="fill-red-500 text-red-500" />
              ) : (
                <Heart size={24} />
              )}
            </button>

            {/* Main Image */}
            <div className="relative bg-gray-50 rounded-lg aspect-square overflow-hidden group mb-4">
              <OptimizedImage
                src={productImages[selectedImage]}
                alt={product.title}
                width={800}
                height={800}
                className="w-full h-full object-contain"
                priority
              />
              
              {/* Navigation Arrows */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={handleNextImage}
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
                    src={image}
                    alt={`${product.title} ${index + 1}`}
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
            <h1 className="text-3xl md:text-4xl font-semibold text-[#0B4866]">{product.title}</h1>

            {/* Price */}
            <div className="flex items-center gap-4">
              {product.originalPrice && product.originalPrice > product.discountedPrice && (
                <span className="text-xl text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
              )}
              <span className="text-3xl font-bold text-[#0B4866]">${product.discountedPrice.toFixed(2)}</span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-2xl">{i < Math.floor(rating) ? '★' : '☆'}</span>
                ))}
              </div>
              <span className="text-gray-600">({reviews})</span>
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
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-50 border-r border-gray-300"
                >
                  <Minus size={18} />
                </button>
                <span className="px-6 py-2 text-lg font-medium w-16 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:bg-gray-50 border-l border-gray-300"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Choose Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Choose Color</label>
              <div className="flex gap-4 flex-wrap">
                {colors.map((color) => {
                  const isSelected = selectedColor === color;
                  const colorValue = color.toLowerCase() === 'beige' ? '#F5F5DC' : color.toLowerCase() === 'brown' ? '#8B4513' : color;
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
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#0B4866] rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
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
              <div className="flex gap-3 flex-wrap">
                {sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-lg text-sm font-medium border-2 transition ${
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

            {/* Installation Option */}
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm font-medium text-gray-900">Include Installation</span>
                  <p className="text-xs text-gray-500 mt-1">Professional installation service</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[#0B4866]">$49.99</span>
                  <button
                    type="button"
                    onClick={() => setIncludeInstallation(!includeInstallation)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      includeInstallation ? 'bg-[#0B4866]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        includeInstallation ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </label>
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
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : isInCartLocal(product.id)
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-[#0B4866] hover:bg-[#094058] text-white'
                }`}
              >
                <ShoppingCart size={20} />
                {!product.inStock ? 'Out of Stock' : isInCartLocal(product.id) ? `In Cart (${getItemQuantityLocal(product.id)})` : 'Add to cart'}
              </button>
            </div>
          </div>
        </div>

        {/* Product Information Tabs */}
        <div className="mb-12">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
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
                      : 'border-transparent text-gray-600 hover:text-gray-900'
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
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
                {product.features && (
                  <ul className="space-y-3">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-[#0B4866] text-xl">•</span>
                        <span className="text-gray-700">{feature}</span>
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

            {activeTab === 'dimensions' && product.dimensions && (
              <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(product.dimensions).map(([key, value]) => (
                  <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#0B4866]">{value}cm</div>
                    <div className="text-sm text-gray-600 capitalize mt-1">{key}</div>
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
                  Free delivery on all orders. Standard delivery takes 3-5 business days. Express delivery available for an additional fee.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* You May Also Like Section */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-[#0B4866]">You may also like</h2>
              <Link href={`/categories/${product.category}`} className="text-[#0B4866] hover:underline flex items-center gap-1 font-medium">
                See all products
                <ArrowRight size={20} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.slice(0, 3).map((item) => (
                <ProductCard key={item.id} item={item} variant="grid" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
