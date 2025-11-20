"use client";
import Link from "next/link";
import { ArrowRight } from 'lucide-react';
import designData from '../../data/designShowcase.json';

export default function DesignCat() {
  const leftImages = designData.left || [];
  const rightImages = designData.right || [];

  return (
    <section className="sm:py-12 py-0">
      <div className="mx-auto  grid grid-cols-2 gap-4 md:gap-6 ">

        {/* LEFT SECTION */}
        <div className="grid grid-rows-2 gap-4 md:gap-6">
         {leftImages.map((item, index) => (
  <Link
    href={item.link}
    key={index}
    className={`group relative overflow-hidden shadow-md hover:shadow-xl transition-all ${item.class || "rounded-2xl"}`}
  >
    <img
      src={item.image}
      alt={item.title}
      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
      loading="lazy"
    />

    {/* Gradient overlay for text visibility */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent pointer-events-none" />

    <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 text-white flex flex-col gap-2">
      <h3 className="text-lg md:text-xl lg:text-2xl font-semibold leading-tight relative w-fit after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-white group-hover:after:w-full after:transition-all after:duration-300">
        {item.title}
      </h3>
      <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
    </div>
  </Link>
))}

        </div>

   {/* RIGHT SECTION */}
<div className="grid grid-cols-1 grid-rows-3 gap-4 md:gap-6">
  {rightImages.map((item, index) => {
    const isThird = index === 2;
    return (
      <Link
        href={item.link}
        key={index}
        className={`group relative overflow-hidden shadow-md hover:shadow-xl transition-all ${item.class || "rounded-2xl"}`}
      >
        <img
          src={item.image}
          alt={item.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div
          className={`absolute inset-0 pointer-events-none ${
            isThird
              ? "bg-gradient-to-b from-black/50 via-black/30 to-transparent"
              : "bg-gradient-to-t from-black/50 via-black/30 to-transparent"
          }`}
        />

        {/* Title + Arrow */}
        <div
          className={`absolute text-white flex flex-col gap-2 ${
            isThird
              ? "top-4 left-4 md:top-6 md:left-6"
              : "bottom-4 left-4 md:bottom-6 md:left-6"
          }`}
        >
          <h3 className="text-lg md:text-xl lg:text-2xl font-semibold leading-tight relative w-fit after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-white group-hover:after:w-full after:transition-all after:duration-300">
            {item.title}
          </h3>
          <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
        </div>
      </Link>
    );
  })}
</div>


      </div>
    </section>
  );
}
