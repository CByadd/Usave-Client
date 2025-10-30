"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from 'lucide-react';
import designData from './../../data/designData.json';

export default function DesignCat() {
  const leftImages = designData.left || [];
  const rightImages = designData.right || [];

  return (
    <section className="py-12">
      <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 px-4">
        {/* LEFT SECTION */}
        <div className="grid grid-rows-2 gap-4 md:gap-6">
          {leftImages.map((item, index) => (
            <Link
              href={item.link}
              key={index}
              className={`group relative overflow-hidden shadow-md hover:shadow-xl transition-all ${item.class || "rounded-2xl"}`}
            >
              <Image
                src={item.image}
                alt={item.title}
                width={600}
                height={100}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
              {/* Gradient overlay for text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
              
              <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 text-white flex flex-col gap-2">
                <h3 className="text-lg md:text-xl lg:text-2xl font-semibold leading-tight">{item.title}</h3>
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            </Link>
          ))}
        </div>

        {/* RIGHT SECTION */}
        <div className="grid grid-cols-1 grid-rows-3 gap-4 md:gap-6">
          {rightImages.map((item, index) => (
            <Link
              href={item.link}
              key={index}
              className={`group relative overflow-hidden shadow-md hover:shadow-xl transition-all ${item.class || "rounded-2xl"}`}
            >
              <Image
                src={item.image}
                alt={item.title}
                width={600}
                height={400}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
              {/* Gradient overlay for text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
              
              <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 text-white flex flex-col gap-2">
                <h3 className="text-lg md:text-xl lg:text-2xl font-semibold leading-tight">{item.title}</h3>
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
