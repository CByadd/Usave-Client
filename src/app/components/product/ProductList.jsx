"use client";
import React, { useState, useEffect } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useSearch } from '../../stores/useSearchStore';
import { ProductGridSkeleton } from './LoadingSkeletons';
import productService from '../../services/api/productService';
import ItemCard from './ProductCard';

const ProductListingPage = () => {
  const { isSearching, toggleActiveFilter } = useSearch();
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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
      stockQuantity: 25,
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
      stockQuantity: 12,
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
      stockQuantity: 8,
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
      inStock: true,
      stockQuantity: 18
    },
    {
      id: 5,
      title: "Melrose Chair",
      image: "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1759806308/Usave/CitylLoungeRHFchase2_400x400_1_oafcia-removebg-preview_nebksz.png",
      originalPrice: 800,
      discountedPrice: 699,
      rating: 4.5,
      reviews: 13,
      inStock: false,
      stockQuantity: 0
    },
    {
      id: 6,
      title: "Beth Head Board",
      image: "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1759806308/Usave/Hasting3SeaterLounge_Chaise_2_400x400_1_g5gov0-removebg-preview_vcxoy0.png",
      originalPrice: 800,
      discountedPrice: 699,
      rating: 4.5,
      reviews: 13,
      inStock: true,
      stockQuantity: 3
    },
    {
      id: 7,
      title: "Rose Accent Chair",
      image: "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1759806308/Usave/CityLounger2Seater_400x400_1_1_e2odgl-removebg-preview_mur0jb.png",
      originalPrice: 800,
      discountedPrice: 699,
      rating: 4.5,
      reviews: 13,
      inStock: true,
      stockQuantity: 22
    },
    {
      id: 8,
      title: "Rose Accent Chair",
      image: "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1759806308/Usave/CitylLoungeRHFchase2_400x400_1_oafcia-removebg-preview_nebksz.png",
      originalPrice: 800,
      discountedPrice: 699,
      rating: 4.5,
      reviews: 13,
      inStock: true,
      stockQuantity: 16
    },
    {
      id: 9,
      title: "Rose Accent Chair",
      image: "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1759806308/Usave/Hasting3SeaterLounge_Chaise_2_400x400_1_g5gov0-removebg-preview_vcxoy0.png",
      originalPrice: 800,
      discountedPrice: 699,
      rating: 4.5,
      reviews: 13,
      inStock: true,
      stockQuantity: 11
    }
  ];

  const displayedProducts = products.length > 0 ? products : fallbackProducts;

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
          <p className="text-sm md:text-base text-gray-600">{displayedProducts.length} results</p>
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

        {/* Mobile: horizontal carousel */}
        <div className="md:hidden -mx-4 mb-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide">
          {displayedProducts.map((product) => (
            <div key={product.id} className="min-w-[80%] snap-center">
              <ItemCard item={product} variant="carousel" />
            </div>
          ))}
        </div>

        {/* Desktop and tablet grid */}
        <div className="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayedProducts.map((product) => (
            <ItemCard key={product.id} item={product} variant="grid" />
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
    </div>
  );
};

export default ProductListingPage;







