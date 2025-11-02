import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HERO_IMG } from '../../lib/constants';

const Hero = () => {
  return (
    <section className="relative w-full h-[95dvh] flex items-center justify-center text-center">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10 rounded-2xl overflow-hidden">
        <Image
          src={HERO_IMG}
          alt="Hero background"
          fill
          priority
          className="object-cover brightness-75"
        />
      </div>

      {/* Overlay Content */}
      <div className="max-w-3xl mx-auto px-6 text-white flex flex-col items-center justify-center">
        <h1 className="text-4xl md:text-6xl font-medium mb-4 drop-shadow-lg font-serifx">
          Discover
        </h1>
        <p className="text-base md:text-xl max-w-md md:max-w-xl mb-8 opacity-90">
          Experience a uniquely curated selection of furniture, lighting, flooring, and designed objects in a distinctive space.
        </p>
        <Link href="/products">
          <button className="px-8 py-3 border-white border transition-all rounded-full font-semibold shadow-lg w-[180px] hover:bg-white hover:text-gray-800">
            Shop Now
          </button>
        </Link>
      </div>
    </section>
  );
};

export default Hero;
