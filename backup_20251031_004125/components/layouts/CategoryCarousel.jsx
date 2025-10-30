"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import categories from "./../../data/categories.json";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CategoryCarousel = () => {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

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
    const el = scrollRef.current;
    if (!el) return;

    checkScrollPosition();
    el.addEventListener("scroll", checkScrollPosition);
    window.addEventListener("resize", checkScrollPosition);

    return () => {
      el.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, []);

  return (
    <div className="relative w-full  ">
      {/* Left Arrow */}
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
        className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide "
        style={{ gap: "2.5rem", padding: "0 0.5rem" }}
      >
        {categories.map((cat, index) => (
          <div
            key={index}
            className="snap-center shadow-md flex flex-col items-center justify-center p-5 cursor-pointer  h-[336px] min-w-[250px]"
            style={{
              backgroundColor: cat.bgColor,
              flex: "0 0 calc((100% - 3rem)/4)", // show 4 items with gap 1rem between
            }}
          >
            <div className="w-24 h-24 relative mb-4">
              <Image
                src={cat.img}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 96px, 96px"
                className="object-contain"
              />
            </div>
            <p className="text-lg font-medium text-gray-700">{cat.name}</p>
          </div>
        ))}
      </div>

      {/* Right Arrow */}
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
