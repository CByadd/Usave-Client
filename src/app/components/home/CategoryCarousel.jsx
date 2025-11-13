"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import productService from "../../services/api/productService";

const FALLBACK_IMAGE =
  "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1757264135/Usave/unsplash_p3UWyaujtQo_gor2oz.jpg";

const CategoryCarousel = () => {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [categories, setCategories] = useState([]);

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
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 backdrop-blur-md p-2 rounded-full shadow-md hover:bg-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide"
        style={{ gap: "2.5rem", padding: "0 0.5rem" }}
      >
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="snap-center shadow-md flex flex-col items-center justify-center p-5 cursor-pointer h-[336px] min-w-[250px] rounded-2xl bg-white"
            style={{
              flex: "0 0 calc((100% - 3rem)/4)",
            }}
          >
            <div className="relative w-[90%] h-[90%] mb-4">
              <Image
                src={cat.image || FALLBACK_IMAGE}
                alt={cat.name}
                className="object-cover rounded-2xl"
                fill
              />
            </div>

            <p className="text-lg font-medium text-gray-700 text-center px-3">
              {cat.name}
              {cat.count ? (
                <span className="block text-sm text-gray-500">{cat.count} items</span>
              ) : null}
            </p>
          </div>
        ))}
      </div>

      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 backdrop-blur-md p-2 rounded-full shadow-md hover:bg-white"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default CategoryCarousel;
