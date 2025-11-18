"use client";
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { useSearch } from '../../stores/useSearchStore';
import { ProductGridSkeleton } from './LoadingSkeletons';
import productService from '../../services/api/productService';
import ItemCard from './ProductCard';

const ProductListingPage = ({ title, subtitle, contextType }) => {
  const { isSearching, toggleActiveFilter } = useSearch();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0); // Total number of products from API
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);
  const [dynamicHeading, setDynamicHeading] = useState('All Products');

  // Determine dynamic heading based on context
  const getDynamicHeading = useCallback(() => {
    // If title prop is provided, use it
    if (title) {
      return title;
    }

    // Determine context from URL path first (more reliable)
    const isCategoryPage = pathname?.includes('/categories/');
    const isPlacePage = pathname?.includes('/places/');
    const isSearchPage = pathname?.includes('/search');
    const isProductsPage = pathname === '/products' || pathname?.startsWith('/products');

    // Check URL search params for context
    const category = searchParams?.get('category');
    const place = searchParams?.get('place');
    const searchQuery = searchParams?.get('q') || searchParams?.get('search');
    const subcategory = searchParams?.get('subcategory');

    // Build heading based on context - prioritize search query
    if (searchQuery && searchQuery.trim()) {
      return `Search results for "${searchQuery.trim()}"`;
    }
    
    // Check category from URL path (for /categories/dining routes)
    if (isCategoryPage && pathname) {
      const categorySlug = pathname.split('/categories/')[1]?.split('/')[0];
      if (categorySlug) {
        const categoryLabel = categorySlug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        return `${categoryLabel} Products`;
      }
    }

    // Check place from URL path (for /places/kitchen routes)
    if (isPlacePage && pathname) {
      const placeSlug = pathname.split('/places/')[1]?.split('?')[0]?.split('/')[0];
      if (placeSlug) {
        const placeLabel = placeSlug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        return `Products for ${placeLabel}`;
      }
    }
    
    // Check category from query params (for /products?category=dining routes)
    if (category && category.trim()) {
      const categoryLabel = category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return `${categoryLabel} Products`;
    }
    
    // Check subcategory from query params
    if (subcategory && subcategory.trim()) {
      const subcategoryLabel = subcategory
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return `${subcategoryLabel} Products`;
    }
    
    // Check place from query params
    if (place && place.trim()) {
      const placeLabel = place
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return `Products for ${placeLabel}`;
    }

    // Default fallback for /products page
    if (isProductsPage) {
      return 'All Products';
    }

    // Final fallback
    return 'All Products';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, searchParams?.toString(), pathname]);

  // Update heading when URL params or pathname change
  useEffect(() => {
    const heading = getDynamicHeading();
    setDynamicHeading(heading);
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('ProductList Heading Update:', {
        pathname,
        searchParams: searchParams ? Object.fromEntries(searchParams.entries()) : null,
        heading,
        category: searchParams?.get('category'),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.toString(), pathname, title]);

  const getDynamicSubtitle = () => {
    if (subtitle) {
      return subtitle;
    }
    return totalCount > 0 ? `${totalCount.toLocaleString()} results` : `${products.length} results`;
  };

  // Initial load of products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Build filters from URL params - extract values to create stable dependencies
        const filters = { page: 1, limit: 12 };
        let category = searchParams?.get('category');
        let place = searchParams?.get('place');
        const subcategory = searchParams?.get('subcategory');
        
        // Normalize category to lowercase
        if (category) {
          category = category.toLowerCase().trim();
        }
        
        // If on a places route but no place param, extract from pathname
        if (!place && pathname?.includes('/places/')) {
          const placeSlug = pathname.split('/places/')[1]?.split('?')[0]?.split('/')[0];
          if (placeSlug) {
            // Convert slug to place param (e.g., "living-room" -> "living", "bedroom" -> "bedroom", "office" -> "office")
            place = placeSlug
              .replace('-room', '')
              .replace(/^-+|-+$/g, '')
              .replace(/-+/g, '');
          }
        }
        
        if (category) {
          filters.category = category;
        }
        if (subcategory) {
          filters.subcategory = subcategory;
        }
        if (place) {
          filters.place = place;
        }
        
        // Debug logging
        if (process.env.NODE_ENV === 'development') {
          console.log('ProductList: Fetching products with filters:', filters);
        }
        
        const response = await productService.getAllProducts(filters);
        
        // Debug logging
        if (process.env.NODE_ENV === 'development') {
          console.log('ProductList: API response:', {
            success: response.success,
            productsCount: response.data?.products?.length || 0,
            error: response.error,
          });
        }
        
        if (response.success) {
          // API response format: { success: true, data: { products: [...], pagination: {...} } }
          const fetchedProducts = response.data?.products || [];
          setProducts(fetchedProducts);
          
          // Handle pagination from API response
          if (response.data?.pagination) {
            const pagination = response.data.pagination;
            setTotalPages(pagination.totalPages || 1);
            setTotalCount(pagination.total || fetchedProducts.length); // Store total count from API
            setHasMore(pagination.page < pagination.totalPages);
          } else {
            // Fallback: determine if there's more based on items returned
            setTotalPages(1);
            setTotalCount(fetchedProducts.length);
            setHasMore(fetchedProducts.length === 12);
          }
        } else {
          setError(response.error || 'Failed to load products');
          setProducts([]);
          setTotalCount(0);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err?.message || 'Failed to load products. Please try again later.');
        setProducts([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.toString(), pathname]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || page >= totalPages) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      
      // Build filters from URL params to maintain category/place/subcategory filtering
      const filters = { page: nextPage, limit: 12 };
      let category = searchParams?.get('category');
      let place = searchParams?.get('place');
      const subcategory = searchParams?.get('subcategory');
      
      // Normalize category to lowercase
      if (category) {
        category = category.toLowerCase().trim();
      }
      
      // If on a places route but no place param, extract from pathname
      if (!place && pathname?.includes('/places/')) {
        const placeSlug = pathname.split('/places/')[1]?.split('?')[0]?.split('/')[0];
        if (placeSlug) {
          place = placeSlug
            .replace('-room', '')
            .replace(/^-+|-+$/g, '')
            .replace(/-+/g, '');
        }
      }
      
      if (category) {
        filters.category = category;
      }
      if (subcategory) {
        filters.subcategory = subcategory;
      }
      if (place) {
        filters.place = place;
      }
      
      const response = await productService.getAllProducts(filters);
      
      if (response.success) {
        // API response format: { success: true, data: { products: [...], pagination: {...} } }
        const newItems = response.data?.products || [];
        if (newItems.length > 0) {
          setProducts(prev => [...prev, ...newItems]);
          setPage(nextPage);
          
          // Handle pagination from API response
          if (response.data?.pagination) {
            const pagination = response.data.pagination;
            setTotalPages(pagination.totalPages || nextPage);
            setHasMore(pagination.page < pagination.totalPages);
          } else {
            // Fallback: determine if there's more based on items returned
            setHasMore(newItems.length === 12);
          }
        } else {
          setHasMore(false);
        }
      } else {
        setError(response.error || 'Failed to load more products');
      }
    } catch (err) {
      console.error('Error loading more products:', err);
      setError(err?.message || 'Failed to load more products. Please try again.');
    } finally {
      setIsLoadingMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, totalPages, hasMore, isLoadingMore, searchParams?.toString(), pathname]);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' } // Trigger when 100px before reaching the element
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingMore, isLoading, loadMore]);

  const toggleFilter = (filterName) => {
    toggleActiveFilter(filterName);
  };

  // Show loading skeleton while searching or initial load
  if (isSearching || isLoading) {
    return <ProductGridSkeleton count={12} />;
  }

  // Show error state
  if (error && products.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Failed to Load Products</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              window.location.reload();
            }}
            className="px-6 py-2 bg-[#0B4866] text-white rounded-lg hover:bg-[#0a3d54] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-normal text-gray-800 mb-2">
            {(() => {
              const heading = dynamicHeading || getDynamicHeading();
              if (heading.includes('Search results for "')) {
                const query = heading.replace('Search results for "', '').replace('"', '');
                return (
                  <>
                    Search results for <span className="font-medium">"{query}"</span>
                  </>
                );
              }
              return <span className="font-medium">{heading}</span>;
            })()}
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            {getDynamicSubtitle()}
          </p>
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

        {/* Error message if there's an error but products are shown */}
        {error && products.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && products.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products found.</p>
          </div>
        )}

        {/* Mobile: horizontal carousel */}
        {products.length > 0 && (
          <div className="md:hidden -mx-4 mb-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide">
            {products.map((product) => (
              <div key={product.id} className="min-w-[80%] snap-center">
                <ItemCard item={product} variant="carousel" />
              </div>
            ))}
          </div>
        )}

        {/* Desktop and tablet grid */}
        {products.length > 0 && (
          <div className="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ItemCard key={product.id} item={product} variant="grid" />
            ))}
          </div>
        )}

        {/* Infinite scroll sentinel and loading indicator */}
        {products.length > 0 && (
          <div ref={observerTarget} className="mt-8 md:mt-12">
            {isLoadingMore && (
              <div className="flex justify-center items-center py-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B4866]"></div>
                  <p className="text-sm text-gray-600">Loading more products...</p>
                </div>
              </div>
            )}
            {!hasMore && !isLoadingMore && (
              <div className="text-center text-gray-500 text-sm py-8">
                You've reached the end of the product list.
              </div>
            )}
          </div>
        )}

        <div className="mt-12 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 py-8 md:py-12 border-t border-b border-gray-200">
          <Link href="/places" className="text-center hover:opacity-80 transition-opacity cursor-pointer">
            <div className="text-[#0B4866] mb-2 md:mb-3 flex justify-center">
              <svg className="w-8 h-8 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 text-xs md:text-sm">SHOP BY PLACES</h3>
            <p className="text-xs md:text-sm text-gray-600">Rentals</p>
          </Link>
          <Link href="/places/living-room" className="text-center hover:opacity-80 transition-opacity cursor-pointer">
            <div className="text-[#0B4866] mb-2 md:mb-3 flex justify-center">
              <svg className="w-8 h-8 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h18M9 3v2m6-2v2M5 9h14m-7 4h.01M8 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 text-xs md:text-sm">LIVING</h3>
            <p className="text-xs md:text-sm text-gray-600">Lounges</p>
          </Link>
          <Link href="/places/dining-room" className="text-center hover:opacity-80 transition-opacity cursor-pointer">
            <div className="text-[#0B4866] mb-2 md:mb-3 flex justify-center">
              <svg className="w-8 h-8 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 text-xs md:text-sm">DINING</h3>
            <p className="text-xs md:text-sm text-gray-600">BBQ</p>
          </Link>
          <Link href="/places/bedroom" className="text-center hover:opacity-80 transition-opacity cursor-pointer">
            <div className="text-[#0B4866] mb-2 md:mb-3 flex justify-center">
              <svg className="w-8 h-8 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 text-xs md:text-sm">BEDROOM</h3>
            <p className="text-xs md:text-sm text-gray-600">Beds</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductListingPage;







