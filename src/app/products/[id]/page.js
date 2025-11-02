"use client";
import React, { useState, useEffect } from 'react';
import OptimizedImage from '../../components/shared/OptimizedImage';
import { LoadingSpinner, PageLoader } from '../../components/shared/LoadingSpinner';
import { ProductDetailSkeleton } from '../../components/shared/LoadingSkeleton';
import { Heart, ShoppingCart, Star, ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCart } from '../../contexts/CartContext';
import { useUI } from '../../contexts/UIContext';
import productService from '../../services/api/productService';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id;
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [includeInstallation, setIncludeInstallation] = useState(false);
  const [installationFee] = useState(49.99); // Default installation fee
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const { openCartDrawer } = useUI();

  // Calculate total price including installation fee
  const totalPrice = includeInstallation 
    ? (product?.discountedPrice * quantity) + installationFee 
    : product?.discountedPrice * quantity;

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await productService.getProductById(productId);
        if (response.success) {
          setProduct(response.data);
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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-[#0B4866]">Home</Link>
          <span>/</span>
          <Link href={`/categories/${product.category}`} className="hover:text-[#0B4866] capitalize">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-gray-800">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
              <OptimizedImage
                src={product.images[selectedImage]}
                alt={product.title}
                width={600}
                height={600}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
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

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">{product.title}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={20} fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                  <span className="text-gray-600 ml-2">({product.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600">
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-gray-900">${product.discountedPrice}</span>
                {product.originalPrice > product.discountedPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">${product.originalPrice}</span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                      Save ${product.originalPrice - product.discountedPrice}
                    </span>
                  </>
                )}
              </div>
              
              {/* Installation Fee Toggle */}
              <div className="flex items-center mt-4">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={includeInstallation}
                      onChange={(e) => setIncludeInstallation(e.target.checked)}
                    />
                    <div className={`block w-12 h-6 rounded-full ${includeInstallation ? 'bg-[#0B4866]' : 'bg-gray-300'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${includeInstallation ? 'translate-x-6' : ''}`}></div>
                  </div>
                  <div className="ml-3 text-gray-700 font-medium">
                    Include Installation: <span className="font-bold">${installationFee.toFixed(2)}</span>
                  </div>
                </label>
              </div>
              
              {/* Total Price */}
              <div className="pt-2 border-t border-gray-200 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total:</span>
                  <span className="text-xl font-bold text-[#0B4866]">
                    ${totalPrice.toFixed(2)}
                    {includeInstallation && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        (includes ${installationFee.toFixed(2)} installation)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Key Features</h3>
              <ul className="space-y-1">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-600">
                    <span className="text-green-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 border-x border-gray-300">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => { 
                  addToCart(
                    { 
                      ...product, 
                      includeInstallation,
                      installationFee: includeInstallation ? installationFee : 0,
                      totalPrice: includeInstallation 
                        ? (product.discountedPrice * quantity) + installationFee 
                        : product.discountedPrice * quantity
                    }, 
                    quantity 
                  ); 
                  openCartDrawer(); 
                }}
                disabled={!product.inStock}
                className={`flex-1 py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 ${
                  !product.inStock 
                    ? 'bg-gray-400 cursor-not-allowed text-white' 
                    : isInCart(product.id) 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-[#0B4866] hover:bg-[#094058] text-white'
                }`}
              >
                <ShoppingCart size={20} />
                {!product.inStock ? 'Out of Stock' : isInCart(product.id) ? `In Cart (${getItemQuantity(product.id)})` : 'Add to Cart'}
              </button>
              <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Heart size={20} />
              </button>
              <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                <span className="font-medium text-gray-700 capitalize">{key}:</span>
                <span className="text-gray-600">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
