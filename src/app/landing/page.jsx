"use client";
import React, { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import HeroSection from '../components/home/HeroSection'
import CategoryHeader from '../components/search/CategoryHeader'
import CategoryCarousel from '../components/home/CategoryCarousel'
import FullWidthCategory from '../components/home/FullWidthCategories'
import InfoSection from '../components/home/InfoSection'
import CategoryShowcase from '../components/home/CategoryShowcase'
import ProductCarousel from '../components/home/ProductCarousel'
import { Cat } from 'lucide-react'
import ItemCard from '../components/product/ProductCard'
import items from '../data/products.json';
import Aitems from '../data/featuredItemsA.json';
import Bitems from '../data/featuredItemsB.json';
import InfoBanner from '../components/shared/InfoBanner'
import Image from 'next/image'
import { LandingPageSkeleton } from '../components/shared/LoadingSkeleton'
import InspirationSection from '../components/home/InspirationSection'

// Animation variants for sections - buttery smooth
const fadeInUp = {
  hidden: { 
    opacity: 0, 
    y: 40,
    scale: 0.98,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.7, 
      ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for ultra-smooth animation
      opacity: { duration: 0.5 },
      y: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
      scale: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    }
  }
};

// Section wrapper component with animation - buttery smooth
const AnimatedSection = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const isInView = useInView(ref, { once: true, margin: "-100px", amount: 0.1 });

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated]);

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={hasAnimated || isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      transition={{ 
        delay, 
        duration: 0.8, 
        ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for buttery smooth animation
      }}
      className={className}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.section>
  );
};

export default function LandingPage() {
  return (
    <div className='flex flex-col items-center justify-center mx-auto gap-16 md:gap-20'>
      {/* Hero section - visible immediately, no animation */}
      <section className="md:w-[95dvw] w-full overflow-hidden">
        <HeroSection/>
      </section>
      
      <AnimatedSection className="md:w-[90dvw] w-full overflow-hidden" delay={0.1}>
        <div className="md:w-[90dvw] w-[90dvw] overflow-hidden">
          <CategoryHeader title="Explore by Category" buttonText="Explore All" buttonLink="/living-room"/>
          <CategoryCarousel/>
        </div>
      </AnimatedSection>


      <AnimatedSection className='w-[99dvw] flex flex-col items-center justify-center overflow-hidden' delay={0.3}>
        <div className="w-[90%]">
          <CategoryHeader title="Explore Product By Places" buttonText="See All Products" buttonLink="/living-room"/>
        </div>
        <div className="w-[99dvw] overflow-hidden">
          <FullWidthCategory/>
          <InfoSection/>
        </div>
      </AnimatedSection>

      <AnimatedSection className='md:w-[90dvw] w-[100dvw]' delay={0.4}>
        <CategoryShowcase/>
      </AnimatedSection>

      <AnimatedSection className='w-[90dvw] overflow-hidden' delay={0.5}>
        <CategoryHeader title="Living room needs" buttonText="See All Products" buttonLink="/living-room"/>
        <ProductCarousel>
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </ProductCarousel>
      </AnimatedSection>

      <AnimatedSection className='w-[90dvw] overflow-hidden' delay={0.6}>
        <CategoryHeader title="Bedroom needs" buttonText="See All Products" buttonLink="/living-room"/>
        <ProductCarousel>
          {Bitems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </ProductCarousel>
      </AnimatedSection>

      <AnimatedSection className='w-[90dvw] overflow-hidden' delay={0.7}>
        <CategoryHeader title="Kitchen needs" buttonText="See All Products" buttonLink="/living-room"/>
        <ProductCarousel>
          {Aitems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </ProductCarousel>
      </AnimatedSection>

      {/* <AnimatedSection className='w-full' delay={0.8}>
        <InspirationSection/>
      </AnimatedSection> */}

      <AnimatedSection className="w-[99dvw] relative overflow-hidden" delay={0.9}>
        <div className="relative w-full">
          <Image
            src="https://res.cloudinary.com/dvmuf6jfj/image/upload/v1757264173/Usave/unsplash_c0JoR_-2x3E_v543gf.jpg"
            alt="Newsletter"
            width={1920}
            height={400}
            className="w-full h-[20dvh] md:h-[400px] object-cover"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white px-6">
            <h2 className="md:text-[4rem]  text-[2rem] font-normal mb-3 text-center font-serifx">
              Loved by 1000+ Business
            </h2>
          </div>
        </div>
        <InfoBanner />
      </AnimatedSection>
    </div>
  )
}
