"use client";
import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import productService from "../../services/api/productService";

const FALLBACK_IMAGE =
  "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1757264135/Usave/unsplash_p3UWyaujtQo_gor2oz.jpg";

const CategoryCarousel = () => {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const checkScrollPosition = () => {
    const el = scrollRef.current;
    if (!el) return;

    const atStart = el.scrollLeft <= 0;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;

    setShowLeftArrow(!atStart);
    setShowRightArrow(!atEnd);
  };

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const scrollAmount =
      direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;

    scrollRef.current.scrollTo({ left: scrollAmount, behavior: "smooth" });
  };

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        const response = await productService.getCategories();
        if (response?.success) {
          setCategories(response.data || []);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Failed to load categories", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScrollPosition();
    el.addEventListener("scroll", checkScrollPosition);
    window.addEventListener("resize", checkScrollPosition);

    return () => {
      el.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [categories.length]);

  // Category Card Skeleton Component
  const CategoryCardSkeleton = () => (
    <div className="snap-center flex-shrink-0 w-[220px] md:w-[260px] lg:w-[280px] relative overflow-hidden rounded-2xl shadow-md animate-pulse">
      <div className="relative h-[280px] md:h-[320px] overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[60%] h-[70%] bg-gray-300 rounded-lg"></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-400/50 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
          <div className="h-6 md:h-7 bg-gray-400 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-400/70 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );

  if (!loading && categories.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full py-4">
      {/* Navigation Arrows */}
      {!loading && showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg p-3 rounded-full hover:bg-gray-50 transition-all hover:scale-110"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
      )}

      {!loading && showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg p-3 rounded-full hover:bg-gray-50 transition-all hover:scale-110"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      )}

      {/* Category Cards */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide gap-4 md:gap-5 px-2 pb-8"
        style={{ 
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {loading ? (
          // Loading Skeletons
          Array.from({ length: 4 }).map((_, index) => (
            <CategoryCardSkeleton key={`skeleton-${index}`} />
          ))
        ) : (
          categories.map((cat, index) => {
            const image = cat?.image || FALLBACK_IMAGE;
            const label = cat?.name || cat?.id || "Category";
            const count = cat?.count || 0;

            // Create route from category name/id
            const categorySlug = (cat?.id || label || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const categoryRoute = categorySlug ? `/categories/${categorySlug}` : '/products';

            return (
              <Link
                href={categoryRoute}
                key={cat?.id || label}
                className="group snap-center flex-shrink-0 w-[220px] md:w-[260px] lg:w-[280px] relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Image Container */}
                <div className="relative h-[280px] md:h-[320px] overflow-hidden bg-white flex items-center justify-center">
                  <img
                    src={image}
                    alt={label}
                    className="w-[70%] h-[80%] object-contain transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                  
                  {/* Content Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6 text-white">
                    <h3 className="text-xl md:text-2xl font-bold mb-2 group-hover:translate-x-1 transition-transform duration-300">
                      {label}
                    </h3>
                    
                    {count > 0 && (
                      <p className="text-xs md:text-sm text-gray-200 mb-3 opacity-90">
                        {count} {count === 1 ? 'product' : 'products'}
                      </p>
                    )}
                    
                    {/* CTA Button */}
                    <div className="flex items-center gap-2 text-xs md:text-sm font-semibold mt-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                    </div>
                  </div>

                  {/* Decorative Corner Accent */}
                  <div className="absolute top-3 right-3 w-10 h-10 border-2 border-white/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Scroll Indicator Dots (Optional - for better UX) */}
      {!loading && categories.length > 4 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(categories.length / 4) }).map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-gray-300 hover:bg-[#0B4866] transition-colors cursor-pointer"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryCarousel;
