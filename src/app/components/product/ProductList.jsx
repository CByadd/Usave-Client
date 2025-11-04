"use client";
import React, { useState, useEffect } from 'react';
import OptimizedImage from './OptimizedImage';
import { Heart, ShoppingCart, Search, ChevronDown, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '../../stores/useCartStore';
import { useSearch } from '../../stores/useSearchStore';
import { openCartDrawer, showToast } from '../../lib/ui';
import { ProductGridSkeleton } from './LoadingSkeletons';
import productService from '../../services/api/productService';
import QuickViewModal from './QuickViewModal';
import { useRouter } from 'next/navigation';

const ProductListingPage = () => {
  const { cartItems, addToCart, isInCart } = useCart();
  const { activeFilters, isSearching, toggleActiveFilter, setIsSearching } = useSearch();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const fallbackProducts = [
    {
      id: 1,
      title: "City Lounge 2 Seater",
      image: "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1759806308/Usave/CityLounger2Seater_400x400_1_1_e2odgl-removebg-preview_mur0jb.png",
      originalPrice: 800,
      discountedPrice: 699,
      rating: 4.5,
      reviews: 13,
      inStock: true,
      badge: "Top seller",
      badgeColor: "bg-pink-600"
    },
    {
      id: 2,
      title: "City Lounge RHF Chase 2 Seater",
      image: "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1759806308/Usave/CitylLoungeRHFchase2_400x400_1_oafcia-removebg-preview_nebksz.png",
      originalPrice: 800,
      discountedPrice: 1649,
      rating: 4.5,
      reviews: 13,
      inStock: true,
      badge: "Top seller",
      badgeColor: "bg-pink-600"
    },
    {
      id: 3,
      title: "Hasting 3 Seater Lounge with chaise",
      image: "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1759806308/Usave/Hasting3SeaterLounge_Chaise_2_400x400_1_g5gov0-removebg-preview_vcxoy0.png",
      originalPrice: 2699,
      discountedPrice: 2599,
      rating: 4.5,
      reviews: 3,
      inStock: true,
      badge: "2% New",
      badgeColor: "bg-yellow-500"
    },
    {
      id: 4,
      title: "Rose Accent Chair",
      image: "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1759806308/Usave/CityLounger2Seater_400x400_1_1_e2odgl-removebg-preview_mur0jb.png",
      originalPrice: 800,
      discountedPrice: 699,
      rating: 4.5,
      reviews: 13,
      inStock: true
    },
    {
      id: 5,
      title: "Melrose Chair",
      image: "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1759806308/Usave/CitylLoungeRHFchase2_400x400_1_oafcia-removebg-preview_nebksz.png",
      originalPrice: 800,
      discountedPrice: 699,
      rating: 4.5,
      reviews: 13,
      outOfStock: true
    },
    {
      id: 6,
      title: "Beth Head Board",
      image: "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1759806308/Usave/Hasting3SeaterLounge_Chaise_2_400x400_1_g5gov0-removebg-preview_vcxoy0.png",
      originalPrice: 800,
      discountedPrice: 699,
      rating: 4.5,
      reviews: 13,
      lowStock: true
    },
    {
      id: 7,
      title: "Rose Accent Chair",
      image: "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1759806308/Usave/CityLounger2Seater_400x400_1_1_e2odgl-removebg-preview_mur0jb.png",
      originalPrice: 800,
      discountedPrice: 699,
      rating: 4.5,
      reviews: 13,
      inStock: true
    },
    {
      id: 8,
      title: "Rose Accent Chair",
      image: "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1759806308/Usave/CitylLoungeRHFchase2_400x400_1_oafcia-removebg-preview_nebksz.png",
      originalPrice: 800,
      discountedPrice: 699,
      rating: 4.5,
      reviews: 13,
      inStock: true
    },
    {
      id: 9,
      title: "Rose Accent Chair",
      image: "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1759806308/Usave/Hasting3SeaterLounge_Chaise_2_400x400_1_g5gov0-removebg-preview_vcxoy0.png",
      originalPrice: 800,
      discountedPrice: 699,
      rating: 4.5,
      reviews: 13,
      inStock: true
    }
  ];

  useEffect(() => {
    // initialize with fallback products
    setProducts(fallbackProducts);
    setTotalPages(1);
    setPage(1);
  }, []);

  const loadMore = async () => {
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await productService.getAllProducts({ page: nextPage, limit: 12 });
      const newItems = response.data.products || [];
      setProducts(prev => [...prev, ...newItems]);
      setPage(nextPage);
      setTotalPages(response.data.totalPages || nextPage);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const toggleFilter = (filterName) => {
    toggleActiveFilter(filterName);
  };

  // Show loading skeleton while searching
  if (isSearching) {
    return <ProductGridSkeleton count={12} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-normal text-gray-800 mb-2">
            Search results for <span className="font-medium">"All Products"</span>
          </h1>
          <p className="text-sm md:text-base text-gray-600">{products.length} results</p>
        </div>

        <div className="flex flex-wrap gap-2 md:gap-3 mb-6 md:mb-8 items-center overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => toggleFilter('sort')}
            className="px-3 md:px-4 py-2 border border-gray-300 rounded-md text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1 md:gap-2 whitespace-nowrap"
          >
            Sort <ChevronDown size={14} className="md:w-4 md:h-4" />
          </button>
          <button
            onClick={() => toggleFilter('price')}
            className="px-3 md:px-4 py-2 border border-gray-300 rounded-md text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1 md:gap-2 whitespace-nowrap"
          >
            Price <ChevronDown size={14} className="md:w-4 md:h-4" />
          </button>
          <button
            onClick={() => toggleFilter('color')}
            className="px-3 md:px-4 py-2 border border-gray-300 rounded-md text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1 md:gap-2 whitespace-nowrap"
          >
            Color <ChevronDown size={14} className="md:w-4 md:h-4" />
          </button>
          <button
            onClick={() => toggleFilter('size')}
            className="px-3 md:px-4 py-2 border border-gray-300 rounded-md text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1 md:gap-2 whitespace-nowrap"
          >
            Size <ChevronDown size={14} className="md:w-4 md:h-4" />
          </button>
          <button
            onClick={() => toggleFilter('collection')}
            className="px-3 md:px-4 py-2 border border-gray-300 rounded-md text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1 md:gap-2 whitespace-nowrap"
          >
            Collection <ChevronDown size={14} className="md:w-4 md:h-4" />
          </button>
          <button
            onClick={() => toggleFilter('category')}
            className="px-3 md:px-4 py-2 border border-gray-300 rounded-md text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1 md:gap-2 whitespace-nowrap"
          >
            Category <ChevronDown size={14} className="md:w-4 md:h-4" />
          </button>
          <button className="ml-auto px-3 md:px-4 py-2 border border-gray-300 rounded-md text-xs md:text-sm font-medium text-[#0B4866] hover:bg-gray-50 flex items-center gap-1 md:gap-2 whitespace-nowrap">
            <SlidersHorizontal size={14} className="md:w-4 md:h-4" />
            <span className="hidden sm:inline">All Filters</span>
          </button>
        </div>

        {/* Mobile: horizontal carousel showing 2 cards at a time */}
        <div className="md:hidden -mx-4 px-4">
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 scrollbar-hide">
            {products.map((product) => (
              <div key={product.id} className="min-w-[calc(50%-0.5rem)] snap-center">
                <div className="group bg-white rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="relative bg-gray-50 p-6 aspect-square flex items-center justify-center">
                    {product.badge && (
                      <div className={`${product.badgeColor} absolute top-3 left-3 text-white text-xs font-semibold px-3 py-1 rounded`}>
                        {product.badge}
                      </div>
                    )}
                    <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 transition">
                      <Heart size={20} />
                    </button>
                    <OptimizedImage
                      src={product.image}
                      alt={product.title}
                      width={300}
                      height={300}
                      className="object-contain max-h-[250px] w-auto"
                    />
                    <button onClick={(e) => {
                      e.stopPropagation();
                      setQuickViewProduct(product);
                    }} className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-lg">
                      <Search size={16} />
                      Quick View
                    </button>
                  </div>
                  <div className="p-4">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="text-base font-medium text-gray-800 mb-2 hover:text-[#0B4866] cursor-pointer">
                        {product.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-gray-500 line-through text-sm">${product.originalPrice}.00</span>
                      <span className="text-xl font-semibold text-gray-900">${product.discountedPrice}.00</span>
                      {product.originalPrice > product.discountedPrice && (
                        <span className="text-green-600 text-xs font-medium">
                          Save {Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mb-3">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>{i < Math.floor(product.rating) ? '★' : '☆'}</span>
                        ))}
                      </div>
                      <span className="text-gray-500 text-xs ml-1">({product.reviews})</span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`h-2 w-2 rounded-full ${product.inStock ? 'bg-green-500' : product.outOfStock ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                      <span className="text-sm text-gray-600">
                        {product.inStock ? 'In Stock' : product.outOfStock ? 'Out Of Stock' : 'Low Stock'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={async (e) => {
                          console.log('[ProductList] Quick Shop clicked - product:', product?.id, product?.title);
                          if (e) {
                            e.preventDefault();
                            e.stopPropagation();
                          }
                          console.log('[ProductList] Quick Shop - addToCart type:', typeof addToCart);
                          try {
                            await addToCart(product);
                            console.log('[ProductList] Quick Shop - addToCart completed, navigating to cart');
                            router.push('/cart');
                          } catch (err) {
                            console.error('[ProductList] Quick Shop error:', err);
                          }
                        }} 
                        className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                      >
                        <Search size={16} />
                        Quick Shop
                      </button>
                      <button 
                        type="button"
                        onClick={async (e) => {
                          console.log('[ProductList] Add to Cart clicked - product:', product?.id, product?.title);
                          if (e) {
                            e.preventDefault();
                            e.stopPropagation();
                          }
                          console.log('[ProductList] Add to Cart - addToCart type:', typeof addToCart);
                          console.log('[ProductList] Add to Cart - openCartDrawer type:', typeof openCartDrawer);
                          try {
                            const result = await addToCart(product);
                            console.log('[ProductList] Add to Cart - addToCart result:', result);
                            console.log('[ProductList] Add to Cart - calling openCartDrawer');
                            if (typeof openCartDrawer === 'function') {
                              openCartDrawer();
                              console.log('[ProductList] Add to Cart - openCartDrawer called');
                            }
                            if (typeof document !== 'undefined') {
                              try {
                                document.body.dispatchEvent(new CustomEvent('usave:openCart'));
                                console.log('[ProductList] Dispatched usave:openCart event');
                              } catch (err) {
                                console.error('[ProductList] Error dispatching open event:', err);
                              }
                            }
                          } catch (err) {
                            console.error('[ProductList] Add to Cart error:', err);
                          }
                        }}
                        disabled={!product.inStock}
                        className={`flex-1 py-2.5 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
                          !product.inStock 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : isInCart(product.id) 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'bg-[#0B4866] hover:bg-[#094058]'
                        }`}
                      >
                        <ShoppingCart size={16} />
                        {!product.inStock ? 'Out of Stock' : isInCart(product.id) ? 'In Cart' : 'Add to cart'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop and tablet grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative bg-gray-50 p-6 aspect-square flex items-center justify-center">
                {product.badge && (
                  <div className={`absolute top-3 left-3 ${product.badgeColor} text-white text-xs font-semibold px-3 py-1 rounded`}>
                    {product.badge}
                  </div>
                )}
                <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 transition">
                  <Heart size={20} />
                </button>
                <OptimizedImage
                  src={product.image}
                  alt={product.title}
                  width={300}
                  height={300}
                  className="object-contain max-h-[250px] w-auto"
                />
                <button onClick={(e) => {
                  e.stopPropagation();
                  setQuickViewProduct(product);
                }} className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-lg">
                  <Search size={16} />
                  Quick View
                </button>
              </div>

              <div className="p-4">
                <Link href={`/products/${product.id}`}>
                  <h3 className="text-base font-medium text-gray-800 mb-2 hover:text-[#0B4866] cursor-pointer">
                    {product.title}
                  </h3>
                </Link>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-500 line-through text-sm">${product.originalPrice}.00</span>
                  <span className="text-xl font-semibold text-gray-900">${product.discountedPrice}.00</span>
                  {product.originalPrice > product.discountedPrice && (
                    <span className="text-green-600 text-xs font-medium">
                      Save {Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100)}%
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 mb-3">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>{i < Math.floor(product.rating) ? '★' : '☆'}</span>
                    ))}
                  </div>
                  <span className="text-gray-500 text-xs ml-1">({product.reviews})</span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className={`h-2 w-2 rounded-full ${product.inStock ? 'bg-green-500' : product.outOfStock ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                  <span className="text-sm text-gray-600">
                    {product.inStock ? 'In Stock' : product.outOfStock ? 'Out Of Stock' : 'Low Stock'}
                  </span>
                </div>

                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={async (e) => {
                          console.log('[ProductList-Desktop] Quick Shop clicked - product:', product?.id, product?.title);
                          if (e) {
                            e.preventDefault();
                            e.stopPropagation();
                          }
                          console.log('[ProductList-Desktop] Quick Shop - addToCart type:', typeof addToCart);
                          try {
                            const result = await addToCart(product);
                            console.log('[ProductList-Desktop] Quick Shop - addToCart result:', result);
                            console.log('[ProductList-Desktop] Quick Shop - navigating to cart');
                            router.push('/cart');
                          } catch (err) {
                            console.error('[ProductList-Desktop] Quick shop error:', err);
                          }
                        }} 
                        className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Search size={16} />
                        Quick Shop
                      </button>
                      <button 
                        type="button"
                        onClick={async (e) => {
                          console.log('[ProductList-Desktop] Add to Cart clicked - product:', product?.id, product?.title);
                          if (e) {
                            e.preventDefault();
                            e.stopPropagation();
                          }
                          console.log('[ProductList-Desktop] Add to Cart - addToCart type:', typeof addToCart);
                          console.log('[ProductList-Desktop] Add to Cart - openCartDrawer type:', typeof openCartDrawer);
                          try {
                            const result = await addToCart(product);
                            console.log('[ProductList-Desktop] Add to Cart - addToCart result:', result);
                            console.log('[ProductList-Desktop] Add to Cart - calling openCartDrawer');
                            if (typeof openCartDrawer === 'function') {
                              openCartDrawer();
                              console.log('[ProductList-Desktop] Add to Cart - openCartDrawer called');
                            }
                            if (typeof document !== 'undefined') {
                              try {
                                document.body.dispatchEvent(new CustomEvent('usave:openCart'));
                                console.log('[ProductList-Desktop] Dispatched usave:openCart event');
                              } catch (err) {
                                console.error('[ProductList-Desktop] Error dispatching open event:', err);
                              }
                            }
                          } catch (err) {
                            console.error('[ProductList-Desktop] Add to cart error:', err);
                          }
                        }}
                        disabled={!product.inStock}
                        className={`flex-1 py-2.5 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed ${
                          !product.inStock
                            ? 'bg-gray-400 cursor-not-allowed'
                            : isInCart(product.id)
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-[#0B4866] hover:bg-[#094058]'
                        }`}
                      >
                        <ShoppingCart size={16} />
                        {!product.inStock ? 'Out of Stock' : isInCart(product.id) ? 'In Cart' : 'Add to cart'}
                      </button>
                    </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 md:mt-12 flex justify-center">
          <button
            onClick={loadMore}
            disabled={isLoadingMore || page >= totalPages}
            className="px-6 md:px-8 py-2.5 md:py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {isLoadingMore ? 'Loading…' : (page >= totalPages ? 'No more items' : 'Load More')}
          </button>
        </div>

        <div className="mt-12 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 py-8 md:py-12 border-t border-b border-gray-200">
          <div className="text-center">
            <div className="text-[#0B4866] mb-2 md:mb-3 flex justify-center">
              <svg className="w-8 h-8 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 text-xs md:text-sm">SHOP BY PLACES</h3>
            <p className="text-xs md:text-sm text-gray-600">Rentals</p>
          </div>
          <div className="text-center">
            <div className="text-[#0B4866] mb-2 md:mb-3 flex justify-center">
              <svg className="w-8 h-8 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h18M9 3v2m6-2v2M5 9h14m-7 4h.01M8 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 text-xs md:text-sm">LIVING</h3>
            <p className="text-xs md:text-sm text-gray-600">Lounges</p>
          </div>
          <div className="text-center">
            <div className="text-[#0B4866] mb-2 md:mb-3 flex justify-center">
              <svg className="w-8 h-8 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 text-xs md:text-sm">DINING</h3>
            <p className="text-xs md:text-sm text-gray-600">BBQ</p>
          </div>
          <div className="text-center">
            <div className="text-[#0B4866] mb-2 md:mb-3 flex justify-center">
              <svg className="w-8 h-8 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 text-xs md:text-sm">BEDROOM</h3>
            <p className="text-xs md:text-sm text-gray-600">Beds</p>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal 
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

export default ProductListingPage;







