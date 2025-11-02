"use client";
import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import CategoryHeader from './../search/CategoryHeader.jsx';

export default function InspirationSection() {
  const scrollRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = scrollRef.current;
      if (!el) return;
      const totalScroll = el.scrollWidth - el.clientWidth;
      const currentScroll = el.scrollLeft;
      const scrolled = (currentScroll / totalScroll) * 100;
      setProgress(scrolled);
    };
    const container = scrollRef.current;
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="w-[90dvw] h-screen mx-auto mt-20 mb-20 overflow-hidden">
      <CategoryHeader
        title="Get the inspiration ones"
        buttonText="See All Products"
        buttonLink="/living-room"
        disableButton={true}
      />

      {/* Image Row */}
      <div
        ref={scrollRef}
        className="
          flex gap-6 overflow-x-auto overflow-y-hidden
          snap-x snap-mandatory scrollbar-hide
          px-[10vw] sm:px-0
          sm:overflow-visible
        "
      >
        {[
          "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1757264124/Usave/unsplash_DhFHtkECn7Q_lplnxw.jpg",
          "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1757264124/Usave/unsplash_reuIAvaxUMk_faofll.jpg",
          "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1757264124/Usave/unsplash_WUC_u5yoD2w_ru05gd.jpg",
        ].map((src, index) => (
          <div
            key={index}
            className="
              w-[80vw] sm:w-1/3 h-[80vh] sm:h-[90vh]
              flex-shrink-0
              snap-center sm:snap-none
              rounded-3xl overflow-hidden
            "
          >
            <Image
              src={src}
              alt={`Design Style ${index + 1}`}
              width={1920}
              height={1080}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Progress Line */}
      <div className="relative w-full h-[3px] bg-gray-300 mt-4 rounded-full overflow-hidden sm:hidden">
        <div
          className="absolute top-0 left-0 h-full bg-black transition-all duration-300 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </section>
  );
}
