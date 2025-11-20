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
import InfoBanner from '../components/shared/InfoBanner'
import Image from 'next/image'
import { LandingPageSkeleton } from '../components/shared/LoadingSkeleton'
import InspirationSection from '../components/home/InspirationSection'
import ContactSection from '../components/home/ContactSection'
import { apiService } from '../services/api/apiClient'

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
  const [livingRoomProducts, setLivingRoomProducts] = useState([]);
  const [kitchenProducts, setKitchenProducts] = useState([]);
  const [bedroomProducts, setBedroomProducts] = useState([]);
  const [loading, setLoading] = useState({
    livingroom: true,
    kitchen: true,
    bedroom: true,
  });

  useEffect(() => {
    // Fetch landing page products from API
    const fetchLandingPageProducts = async () => {
      try {
        // Fetch living room products
        const livingRoomRes = await apiService.products.getLandingPageProducts('livingroom');
        if (livingRoomRes?.success && livingRoomRes?.data?.products?.length > 0) {
          setLivingRoomProducts(livingRoomRes.data.products);
        }
        setLoading(prev => ({ ...prev, livingroom: false }));
      } catch (error) {
        console.error('Error fetching living room products:', error);
        setLoading(prev => ({ ...prev, livingroom: false }));
      }

      try {
        // Fetch kitchen products
        const kitchenRes = await apiService.products.getLandingPageProducts('kitchen');
        if (kitchenRes?.success && kitchenRes?.data?.products?.length > 0) {
          setKitchenProducts(kitchenRes.data.products);
        }
        setLoading(prev => ({ ...prev, kitchen: false }));
      } catch (error) {
        console.error('Error fetching kitchen products:', error);
        setLoading(prev => ({ ...prev, kitchen: false }));
      }

      try {
        // Fetch bedroom products
        const bedroomRes = await apiService.products.getLandingPageProducts('bedroom');
        if (bedroomRes?.success && bedroomRes?.data?.products?.length > 0) {
          setBedroomProducts(bedroomRes.data.products);
        }
        setLoading(prev => ({ ...prev, bedroom: false }));
      } catch (error) {
        console.error('Error fetching bedroom products:', error);
        setLoading(prev => ({ ...prev, bedroom: false }));
      }
    };

    fetchLandingPageProducts();
  }, []);

  return (
    <div className='flex flex-col items-center justify-center mx-auto gap-16 md:gap-20'>
      {/* Hero section - visible immediately, no animation */}
      <section className="md:w-[95dvw] w-full overflow-hidden">
        <HeroSection/>
      </section>
      
      <AnimatedSection className="md:w-[90dvw] w-full flex flex-col items-center justify-center overflow-hidden " delay={0.1}>
        <div className="w-[90%]">
       <CategoryHeader title="Explore by Category" buttonText="Explore All" buttonLink="/products"/>
        </div>
         
        <div className="md:w-[90dvw] w-[100dvw] overflow-hidden">
          <CategoryCarousel/>
        </div>
      </AnimatedSection>


      <AnimatedSection className='w-[99dvw] flex flex-col items-center justify-center overflow-hidden' delay={0.3}>
        <div className="w-[90%]">
          <CategoryHeader title="Explore Product By Places" buttonText="See All Products" buttonLink="/places"/>
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
        <CategoryHeader title="Living room needs" buttonText="See All Products" buttonLink="/products?category=living"/>
        {loading.livingroom ? (
          <div className="flex items-center justify-center py-12">
            <LandingPageSkeleton />
          </div>
        ) : (
          <ProductCarousel>
            {livingRoomProducts.length > 0 ? (
              livingRoomProducts.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No products available for Living Room needs
              </div>
            )}
          </ProductCarousel>
        )}
      </AnimatedSection>

      <AnimatedSection className='w-[90dvw] overflow-hidden' delay={0.6}>
        <CategoryHeader title="Bedroom needs" buttonText="See All Products" buttonLink="/products?category=bedroom"/>
        {loading.bedroom ? (
          <div className="flex items-center justify-center py-12">
            <LandingPageSkeleton />
          </div>
        ) : (
          <ProductCarousel>
            {bedroomProducts.length > 0 ? (
              bedroomProducts.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No products available for Bedroom needs
              </div>
            )}
          </ProductCarousel>
        )}
      </AnimatedSection>

      <AnimatedSection className='w-[90dvw] overflow-hidden' delay={0.7}>
        <CategoryHeader title="Kitchen needs" buttonText="See All Products" buttonLink="/products?category=kitchen"/>
        {loading.kitchen ? (
          <div className="flex items-center justify-center py-12">
            <LandingPageSkeleton />
          </div>
        ) : (
          <ProductCarousel>
            {kitchenProducts.length > 0 ? (
              kitchenProducts.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No products available for Kitchen needs
              </div>
            )}
          </ProductCarousel>
        )}
      </AnimatedSection>

      {/* <AnimatedSection className='w-full' delay={0.8}>
        <InspirationSection/>
      </AnimatedSection> */}

      {/* Contact Section */}
      <AnimatedSection className="w-full" delay={0.8}>
        <ContactSection />
      </AnimatedSection>

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
