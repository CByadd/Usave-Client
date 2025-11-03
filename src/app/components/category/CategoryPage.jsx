"use client";
import React, { useState, useEffect } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '../../contexts/CartContext';
import { useUI } from '../../contexts/UIContext';
import { ProductGridSkeleton } from '../product/LoadingSkeletons';
import productService from '../../services/api/productService';
import QuickViewModal from '../product/QuickViewModal';
import ItemCard from '../product/ProductCard';

const CategoryPage = ({ categoryName, categoryLabel }) => {
  const [activeFilters, setActiveFilters] = useState({
    sort: false,
    price: false,
    color: false,
    size: false,
    collection: false,
    category: false
  });
  
  const { addToCart, isInCart } = useCart();
  const { openCart } = useUI();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedSort, setSelectedSort] = useState('relevance');
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);

  useEffect(() => {
    fetchCategoryProducts();
  }, [categoryName, selectedSort, selectedPriceRange]);

  const fetchCategoryProducts = async () => {
    try {
      setIsLoading(true);
      const filters = {
        category: categoryName.toLowerCase(),
        page: 1,
        limit: 12
      };

      if (selectedPriceRange) {
        filters.minPrice = selectedPriceRange.min;
        filters.maxPrice = selectedPriceRange.max;
      }

      if (selectedSort !== 'relevance') {
        filters.sortBy = selectedSort;
      }

      const response = await productService.getAllProducts(filters);
      const fetchedProducts = response.data?.products || [];
      
      // Filter to only show available products (in stock)
      const availableProducts = fetchedProducts.filter(product => 
        product.inStock !== false && 
        product.inStock !== undefined &&
        (product.stockQuantity === undefined || product.stockQuantity > 0)
      );
      
      // Apply client-side sorting if needed
      let sortedProducts = [...availableProducts];
      if (selectedSort === 'price-low') {
        sortedProducts.sort((a, b) => (a.discountedPrice || a.price || 0) - (b.discountedPrice || b.price || 0));
      } else if (selectedSort === 'price-high') {
        sortedProducts.sort((a, b) => (b.discountedPrice || b.price || 0) - (a.discountedPrice || a.price || 0));
      } else if (selectedSort === 'rating') {
        sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (selectedSort === 'newest') {
        sortedProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      }

      setProducts(sortedProducts);
      setTotalPages(response.data?.totalPages || 1);
      setPage(1);
    } catch (error) {
      console.error('Error fetching category products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const filters = {
        category: categoryName.toLowerCase(),
        page: nextPage,
        limit: 12
      };

      if (selectedPriceRange) {
        filters.minPrice = selectedPriceRange.min;
        filters.maxPrice = selectedPriceRange.max;
      }

      const response = await productService.getAllProducts(filters);
      const newItems = response.data?.products || [];
      
      // Filter to only show available products (in stock)
      const availableNewItems = newItems.filter(product => 
        product.inStock !== false && 
        product.inStock !== undefined &&
        (product.stockQuantity === undefined || product.stockQuantity > 0)
      );
      
      setProducts(prev => [...prev, ...availableNewItems]);
      setPage(nextPage);
      setTotalPages(response.data?.totalPages || nextPage);
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const toggleFilter = (filterName) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const handleSortChange = (sortValue) => {
    setSelectedSort(sortValue);
    setActiveFilters(prev => ({ ...prev, sort: false }));
  };

  const handlePriceChange = (range) => {
    setSelectedPriceRange(range);
    setActiveFilters(prev => ({ ...prev, price: false }));
  };

  const clearPriceFilter = () => {
    setSelectedPriceRange(null);
    setActiveFilters(prev => ({ ...prev, price: false }));
  };

  // Close filter dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.filter-dropdown')) {
        setActiveFilters({
          sort: false,
          price: false,
          color: false,
          size: false,
          collection: false,
          category: false
        });
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, []);

  // Show loading skeleton while loading
  if (isLoading) {
    return <ProductGridSkeleton count={12} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-normal text-gray-800 mb-2">
            <span className="font-medium capitalize">{categoryLabel || categoryName}</span> Products
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            {products.length} {products.length === 1 ? 'available product' : 'available products'} found
          </p>
        </div>

        <div className="flex flex-wrap gap-2 md:gap-3 mb-6 md:mb-8 items-center overflow-x-auto pb-2 scrollbar-hide">
          <div className="relative filter-dropdown">
            <button
              onClick={() => toggleFilter('sort')}
              className="px-3 md:px-4 py-2 border border-gray-300 rounded-md text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1 md:gap-2 whitespace-nowrap"
            >
              Sort <ChevronDown size={14} className="md:w-4 md:h-4" />
            </button>
            {activeFilters.sort && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleSortChange('relevance')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      selectedSort === 'relevance' ? 'text-[#0B4866] font-medium' : 'text-gray-700'
                    }`}
                  >
                    Relevance
                  </button>
                  <button
                    onClick={() => handleSortChange('price-low')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      selectedSort === 'price-low' ? 'text-[#0B4866] font-medium' : 'text-gray-700'
                    }`}
                  >
                    Price: Low to High
                  </button>
                  <button
                    onClick={() => handleSortChange('price-high')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      selectedSort === 'price-high' ? 'text-[#0B4866] font-medium' : 'text-gray-700'
                    }`}
                  >
                    Price: High to Low
                  </button>
                  <button
                    onClick={() => handleSortChange('rating')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      selectedSort === 'rating' ? 'text-[#0B4866] font-medium' : 'text-gray-700'
                    }`}
                  >
                    Highest Rated
                  </button>
                  <button
                    onClick={() => handleSortChange('newest')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      selectedSort === 'newest' ? 'text-[#0B4866] font-medium' : 'text-gray-700'
                    }`}
                  >
                    Newest First
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative filter-dropdown">
            <button
              onClick={() => toggleFilter('price')}
              className={`px-3 md:px-4 py-2 border rounded-md text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2 whitespace-nowrap ${
                selectedPriceRange 
                  ? 'border-[#0B4866] text-[#0B4866] bg-blue-50' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Price <ChevronDown size={14} className="md:w-4 md:h-4" />
              {selectedPriceRange && (
                <span className="ml-1 text-xs">
                  (${selectedPriceRange.min}-${selectedPriceRange.max})
                </span>
              )}
            </button>
            {activeFilters.price && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="py-1">
                  {selectedPriceRange && (
                    <button
                      onClick={clearPriceFilter}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-200"
                    >
                      Clear Price Filter
                    </button>
                  )}
                  <button
                    onClick={() => handlePriceChange({ min: 0, max: 500 })}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      selectedPriceRange?.min === 0 && selectedPriceRange?.max === 500 
                        ? 'text-[#0B4866] font-medium' 
                        : 'text-gray-700'
                    }`}
                  >
                    Under $500
                  </button>
                  <button
                    onClick={() => handlePriceChange({ min: 500, max: 1000 })}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      selectedPriceRange?.min === 500 && selectedPriceRange?.max === 1000 
                        ? 'text-[#0B4866] font-medium' 
                        : 'text-gray-700'
                    }`}
                  >
                    $500 - $1,000
                  </button>
                  <button
                    onClick={() => handlePriceChange({ min: 1000, max: 2000 })}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      selectedPriceRange?.min === 1000 && selectedPriceRange?.max === 2000 
                        ? 'text-[#0B4866] font-medium' 
                        : 'text-gray-700'
                    }`}
                  >
                    $1,000 - $2,000
                  </button>
                  <button
                    onClick={() => handlePriceChange({ min: 2000, max: 5000 })}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      selectedPriceRange?.min === 2000 && selectedPriceRange?.max === 5000 
                        ? 'text-[#0B4866] font-medium' 
                        : 'text-gray-700'
                    }`}
                  >
                    $2,000 - $5,000
                  </button>
                  <button
                    onClick={() => handlePriceChange({ min: 5000, max: 10000 })}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      selectedPriceRange?.min === 5000 && selectedPriceRange?.max === 10000 
                        ? 'text-[#0B4866] font-medium' 
                        : 'text-gray-700'
                    }`}
                  >
                    $5,000 - $10,000
                  </button>
                  <button
                    onClick={() => handlePriceChange({ min: 10000, max: 999999 })}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      selectedPriceRange?.min === 10000 
                        ? 'text-[#0B4866] font-medium' 
                        : 'text-gray-700'
                    }`}
                  >
                    Over $10,000
                  </button>
                </div>
              </div>
            )}
          </div>

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
          <button className="ml-auto px-3 md:px-4 py-2 border border-gray-300 rounded-md text-xs md:text-sm font-medium text-[#0B4866] hover:bg-gray-50 flex items-center gap-1 md:gap-2 whitespace-nowrap">
            <SlidersHorizontal size={14} className="md:w-4 md:h-4" />
            <span className="hidden sm:inline">All Filters</span>
          </button>
        </div>

        {/* No Results Found State */}
        {!isLoading && products.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-6">
              <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Available Products</h2>
              <p className="text-gray-500 mb-6">
                We couldn't find any available products in the {categoryLabel || categoryName} category at the moment. 
                Please check back later or explore other categories.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-block px-6 py-2 bg-[#0B4866] text-white rounded-lg hover:bg-[#094058] transition-colors"
            >
              View All Products
            </Link>
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 && (
          <>
            {/* Mobile: horizontal carousel showing 2 cards at a time */}
            <div className="md:hidden -mx-4 px-4">
              <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 scrollbar-hide">
                {products.map((product) => (
                  <ItemCard key={product.id} item={product} variant="carousel" />
                ))}
              </div>
            </div>

            {/* Desktop and tablet grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {products.map((product) => (
                <ItemCard key={product.id} item={product} variant="grid" />
              ))}
            </div>

            {/* Load More Button */}
            {page < totalPages && (
              <div className="mt-8 md:mt-12 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="px-6 md:px-8 py-2.5 md:py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {isLoadingMore ? 'Loading…' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}

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

export default CategoryPage;
