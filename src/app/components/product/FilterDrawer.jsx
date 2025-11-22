"use client";
import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from '../../stores/useSearchStore';
import { useAnimationStore } from '../../stores/useAnimationStore';
import productService from '../../services/api/productService';

const FilterDrawer = () => {
  const { 
    activeFilters, 
    toggleActiveFilter, 
    updateAdvancedFilter, 
    advancedFilters 
  } = useSearch();
  
  const { getAnimationConfig } = useAnimationStore();
  const drawerConfig = getAnimationConfig('drawer');
  
  const isFilterDrawerOpen = activeFilters.all || false;
  
  const [tempFilters, setTempFilters] = useState({
    sortBy: 'relevance',
    minPrice: '',
    maxPrice: '',
    color: '',
    category: '',
  });
  
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);

  // Sort options
  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
  ];

  // Price range options
  const priceRanges = [
    { min: 0, max: 50, label: 'Under $50' },
    { min: 50, max: 100, label: '$50 - $100' },
    { min: 100, max: 200, label: '$100 - $200' },
    { min: 200, max: 500, label: '$200 - $500' },
    { min: 500, max: 999999, label: 'Over $500' },
  ];

  // Fetch available categories and colors from database
  useEffect(() => {
    const fetchFilterOptions = async () => {
      setIsLoadingFilters(true);
      try {
        // Fetch categories
        const categoriesResponse = await productService.getCategories();
        if (categoriesResponse?.success && categoriesResponse?.data) {
          const categories = Array.isArray(categoriesResponse.data) 
            ? categoriesResponse.data 
            : categoriesResponse.data.categories || [];
          setAvailableCategories(categories.map(cat => ({
            id: cat.id || cat.name,
            name: cat.name || cat.id,
            slug: cat.slug || cat.id
          })));
        }

        // Fetch products to extract unique colors
        const productsResponse = await productService.getAllProducts({ limit: 1000 });
        if (productsResponse?.success && productsResponse?.data?.products) {
          const products = productsResponse.data.products;
          const uniqueColors = new Set();
          
          products.forEach(product => {
            if (product.color && product.color.trim()) {
              uniqueColors.add(product.color.trim());
            }
            if (product.colorVariants && Array.isArray(product.colorVariants)) {
              product.colorVariants.forEach(variant => {
                if (variant.color && variant.color.trim()) {
                  uniqueColors.add(variant.color.trim());
                }
              });
            }
          });
          
          setAvailableColors(Array.from(uniqueColors).sort());
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      } finally {
        setIsLoadingFilters(false);
      }
    };

    fetchFilterOptions();
  }, []);

  // Initialize temp filters when drawer opens
  useEffect(() => {
    if (isFilterDrawerOpen) {
      setTempFilters({
        sortBy: advancedFilters.sortBy || 'relevance',
        minPrice: advancedFilters.minPrice || '',
        maxPrice: advancedFilters.maxPrice || '',
        color: advancedFilters.color || '',
        category: advancedFilters.category || '',
      });
    }
  }, [isFilterDrawerOpen, advancedFilters]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    if (isFilterDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isFilterDrawerOpen]);

  const handleSortChange = (sortValue) => {
    setTempFilters(prev => ({ ...prev, sortBy: sortValue }));
  };

  const handlePriceRangeChange = (min, max) => {
    const newFilters = {
      minPrice: min !== null && min !== undefined ? String(min) : '', 
      maxPrice: max !== null && max !== undefined ? String(max) : ''
    };
    setTempFilters(prev => ({ 
      ...prev, 
      ...newFilters
    }));
  };

  const handleColorChange = (color) => {
    setTempFilters(prev => ({ ...prev, color: color }));
  };

  const handleCategoryChange = (category) => {
    setTempFilters(prev => ({ ...prev, category: category }));
  };

  const handleApplyFilters = () => {
    // Apply temp filters to actual filters
    updateAdvancedFilter('sortBy', tempFilters.sortBy);
    updateAdvancedFilter('minPrice', tempFilters.minPrice);
    updateAdvancedFilter('maxPrice', tempFilters.maxPrice);
    updateAdvancedFilter('color', tempFilters.color);
    updateAdvancedFilter('category', tempFilters.category);
    // Close drawer
    toggleActiveFilter('all');
  };

  const handleClearAll = () => {
    // Reset temp filters
    setTempFilters({
      sortBy: 'relevance',
      minPrice: '',
      maxPrice: '',
      color: '',
      category: '',
    });
    // Apply cleared filters immediately
    updateAdvancedFilter('sortBy', 'relevance');
    updateAdvancedFilter('minPrice', '');
    updateAdvancedFilter('maxPrice', '');
    updateAdvancedFilter('color', '');
    updateAdvancedFilter('category', '');
    // Close drawer
    toggleActiveFilter('all');
  };

  const closeDrawer = () => {
    toggleActiveFilter('all');
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isFilterDrawerOpen && (
        <motion.div
          key="filter-drawer"
          className="fixed inset-0 z-[150] overflow-hidden"
          initial="closed"
          animate="open"
          exit="closed"
          variants={{
            open: { transition: { staggerChildren: 0.05 } },
            closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
          }}
        >
          {/* Backdrop */}
          <motion.div
            variants={{
              open: { opacity: 1 },
              closed: { opacity: 0 },
            }}
            transition={{ 
              duration: drawerConfig.backdrop.duration, 
              ease: drawerConfig.backdrop.ease 
            }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            style={{ willChange: 'opacity' }}
            onClick={closeDrawer}
          />

          {/* Drawer */}
          <motion.div
            variants={{
              open: { x: 0 },
              closed: { x: '100%' },
            }}
            transition={drawerConfig.panel}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ willChange: 'transform' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="text-[#0B4866]" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Sort Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Sort By</h3>
                <div className="space-y-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 ${
                        tempFilters.sortBy === option.value 
                          ? 'bg-[#0B4866]/10 text-[#0B4866] font-medium' 
                          : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handlePriceRangeChange('', '')}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 ${
                      !tempFilters.minPrice && !tempFilters.maxPrice
                        ? 'bg-[#0B4866]/10 text-[#0B4866] font-medium' 
                        : 'text-gray-700'
                    }`}
                  >
                    All Prices
                  </button>
                  {priceRanges.map((range, index) => {
                    const isSelected = String(tempFilters.minPrice) === String(range.min) && 
                                      String(tempFilters.maxPrice) === String(range.max);
                    return (
                      <button
                        key={index}
                        onClick={() => handlePriceRangeChange(range.min, range.max)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 ${
                          isSelected
                            ? 'bg-[#0B4866]/10 text-[#0B4866] font-medium' 
                            : 'text-gray-700'
                        }`}
                      >
                        {range.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Section */}
              {availableCategories.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Category</h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    <button
                      onClick={() => handleCategoryChange('')}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 ${
                        !tempFilters.category
                          ? 'bg-[#0B4866]/10 text-[#0B4866] font-medium' 
                          : 'text-gray-700'
                      }`}
                    >
                      All Categories
                    </button>
                    {isLoadingFilters ? (
                      <div className="text-sm text-gray-500 px-3 py-2">Loading categories...</div>
                    ) : (
                      availableCategories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryChange(category.id || category.name)}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 ${
                            tempFilters.category === (category.id || category.name)
                              ? 'bg-[#0B4866]/10 text-[#0B4866] font-medium' 
                              : 'text-gray-700'
                          }`}
                        >
                          {category.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Color Section */}
              {availableColors.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Color</h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    <button
                      onClick={() => handleColorChange('')}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 ${
                        !tempFilters.color
                          ? 'bg-[#0B4866]/10 text-[#0B4866] font-medium' 
                          : 'text-gray-700'
                      }`}
                    >
                      All Colors
                    </button>
                    {isLoadingFilters ? (
                      <div className="text-sm text-gray-500 px-3 py-2">Loading colors...</div>
                    ) : (
                      availableColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleColorChange(color)}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 ${
                            tempFilters.color === color 
                              ? 'bg-[#0B4866]/10 text-[#0B4866] font-medium' 
                              : 'text-gray-700'
                          }`}
                        >
                          {color}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Clear All
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 text-sm font-medium bg-[#0B4866] text-white rounded-md hover:bg-[#094058]"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FilterDrawer;

