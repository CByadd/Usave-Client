"use client";
import React, { useRef, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import productService from "../../services/api/productService";

const FALLBACK_IMAGE =
  "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1757264135/Usave/unsplash_p3UWyaujtQo_gor2oz.jpg";

const CARD_COLORS = [
  "#F2F6F9",
  "#F6F0FF",
  "#E9F9F1",
  "#FFF4ED",
  "#F4F6FF",
  "#FFF0F5",
];

const CategoryCarousel = () => {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [categories, setCategories] = useState([]);

  const palette = useMemo(() => CARD_COLORS, []);

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

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full">
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-md hover:bg-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide"
        style={{ gap: "2.5rem", padding: "0 0.5rem" }}
      >
        {categories.map((cat, index) => {
          const bgColor = palette[index % palette.length];
          const image = cat?.image || FALLBACK_IMAGE;
          const label = cat?.name || cat?.id || "Category";
          const count = cat?.count || 0;

          return (
            <div
              key={cat?.id || label}
              className="snap-center flex flex-col items-center justify-center p-5 cursor-pointer h-[336px] min-w-[250px] rounded-[32px] shadow-md hover:shadow-xl transition-transform hover:-translate-y-1"
              style={{ flex: "0 0 calc((100% - 3rem)/4)", backgroundColor: bgColor }}
            >
              <div className="w-[90%] h-[90%] relative mb-4 rounded-3xl overflow-hidden bg-white/70">
                <Image
                  src={image}
                  alt={label}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-lg font-medium text-gray-700 text-center px-3">
                {label}
                {count ? (
                  <span className="block text-xs text-gray-500 mt-1">{count} products</span>
                ) : null}
              </p>
            </div>
          );
        })}
      </div>

      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-md hover:bg-white"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default CategoryCarousel;
