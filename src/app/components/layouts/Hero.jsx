import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HERO_IMG } from '@/app/constant/constant';

const Hero = () => {
  return (
    <section className="relative w-full h-[95dvh] flex  text-center">
      
      {/* Background Image */}
      <div className="absolute inset-0 -z-10 mt-12 rounded-2xl overflow-hidden">
        <Image
          src={HERO_IMG}
          alt="Hero background"
          fill
          priority
          className="object-cover  brightness-75"
        />
      </div>

      {/* Overlay Content */}
      <div className="max-w-3xl mx-auto px-6 mt-32 text-white">
        <h1 className="text-4xl md:text-6xl font-medium mb-4 drop-shadow-lg font-serifx">
          Discover
        </h1>
        <p className="text-lg md:text-xl w-[500px] mb-8 opacity-90">
         Experience a uniquely curated selection of furniture, lighting, flooring, and designed objects in a distinctive space.
        </p>
        <Link href="/products">
          <button className="px-8 py-3 border-white border transition-all rounded-full font-semibold shadow-lg w-[199px] hover:bg-white hover:text-gray-800">
            Shop Now
          </button>
        </Link>
      </div>
    </section>
  );
};

export default Hero;
