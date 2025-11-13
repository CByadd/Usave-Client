"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import HeroSection from "../components/home/HeroSection";
import CategoryHeader from "../components/search/CategoryHeader";
import CategoryCarousel from "../components/home/CategoryCarousel";
import FullWidthCategory from "../components/home/FullWidthCategories";
import InfoSection from "../components/home/InfoSection";
import CategoryShowcase from "../components/home/CategoryShowcase";
import ProductCarousel from "../components/home/ProductCarousel";
import ItemCard from "../components/product/ProductCard";
import InfoBanner from "../components/shared/InfoBanner";
import Image from "next/image";
import { ProductGridSkeleton } from "../components/product/LoadingSkeletons";
import productService from "../services/api/productService";

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
      ease: [0.22, 1, 0.36, 1],
      opacity: { duration: 0.5 },
      y: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
      scale: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  },
};

const AnimatedSection = ({ children, delay = 0, className = "" }) => {
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
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.section>
  );
};

const SECTION_CONFIG = [
  { key: "living", title: "Living room needs", link: "/categories/living" },
  { key: "bedroom", title: "Bedroom needs", link: "/categories/bedroom" },
  { key: "kitchen", title: "Kitchen needs", link: "/categories/kitchen" },
];

export default function LandingPage() {
  const [collections, setCollections] = useState({
    living: [],
    bedroom: [],
    kitchen: [],
  });
  const [loadingCollections, setLoadingCollections] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadCollections = async () => {
      try {
        setLoadingCollections(true);
        const responses = await Promise.all(
          SECTION_CONFIG.map((section) =>
            productService.getAllProducts({ category: section.key, limit: 10 })
          )
        );

        if (!isMounted) return;

        const nextState = { living: [], bedroom: [], kitchen: [] };
        responses.forEach((response, index) => {
          const key = SECTION_CONFIG[index].key;
          if (response?.success) {
            nextState[key] = response.data?.products || [];
          } else {
            nextState[key] = [];
          }
        });

        setCollections(nextState);
      } catch (error) {
        console.error("Failed to load landing collections", error);
        if (isMounted) {
          setCollections({ living: [], bedroom: [], kitchen: [] });
        }
      } finally {
        if (isMounted) {
          setLoadingCollections(false);
        }
      }
    };

    loadCollections();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center mx-auto gap-16 md:gap-20">
      <section className="md:w-[95dvw] w-full overflow-hidden">
        <HeroSection />
      </section>

      <AnimatedSection
        className="flex flex-col items-center justify-center w-full overflow-hidden"
        delay={0.1}
      >
        <div className="w-[90%]">
          <CategoryHeader
            title="Explore Product By Places"
            buttonText="See All Products"
            buttonLink="/products"
          />
        </div>
        <div className="md:w-[90dvw] w-[100dvw] overflow-hidden">
          <CategoryCarousel />
        </div>
      </AnimatedSection>

      <AnimatedSection
        className="w-[99dvw] flex flex-col items-center justify-center overflow-hidden"
        delay={0.3}
      >
        <div className="w-[90%]">
          <CategoryHeader
            title="Explore Product By Places"
            buttonText="See All Products"
            buttonLink="/products"
          />
        </div>
        <div className="w-[99dvw] overflow-hidden">
          <FullWidthCategory />
          <InfoSection />
        </div>
      </AnimatedSection>

      <AnimatedSection className="md:w-[90dvw] w-[100dvw]" delay={0.4}>
        <CategoryShowcase />
      </AnimatedSection>

      {SECTION_CONFIG.map((section, index) => {
        const products = collections[section.key] || [];
        return (
          <AnimatedSection
            className="w-[90dvw] overflow-hidden"
            delay={0.5 + index * 0.1}
            key={section.key}
          >
            <CategoryHeader
              title={section.title}
              buttonText="See All Products"
              buttonLink={section.link}
            />
            {loadingCollections ? (
              <ProductGridSkeleton count={4} />
            ) : (
              <ProductCarousel>
                {products.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </ProductCarousel>
            )}
          </AnimatedSection>
        );
      })}

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
  );
}
