"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import productService from "../../services/api/productService";

const FEATURED_SECTIONS = [
  {
    slug: "living",
    title: "Curated Living Spaces",
    link: "/categories/living",
    position: "left",
    fallbackImage: "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1757264135/Usave/unsplash_p3UWyaujtQo_gor2oz.jpg",
  },
  {
    slug: "bedroom",
    title: "Relaxing Bedroom Retreats",
    link: "/categories/bedroom",
    position: "left",
    fallbackImage: "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1757264157/Usave/unsplash_1eWGq_l_DuU_dcqug9.jpg",
  },
  {
    slug: "kitchen",
    title: "Modern Kitchen Essentials",
    link: "/categories/kitchen",
    position: "right",
    fallbackImage: "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1757264157/Usave/unsplash_eyEy5YZhSvU_ebbzol.jpg",
  },
  {
    slug: "dining",
    title: "Entertaining Dining Rooms",
    link: "/categories/dining",
    position: "right",
    fallbackImage: "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1757264164/Usave/unsplash_Cu_uy3E7jPc_wsywbf.jpg",
  },
  {
    slug: "electronics",
    title: "Smart Home Electronics",
    link: "/categories/electronics",
    position: "right",
    fallbackImage: "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1757264164/Usave/unsplash_Cu_uy3E7jPc_wsywbf.jpg",
  },
];

const buildSections = (items = [], position) =>
  items
    .filter((item) => item.position === position)
    .map((item, index) => ({
      ...item,
      key: `${item.slug}-${index}`,
    }));

export default function DesignCat() {
  const [sections, setSections] = useState(FEATURED_SECTIONS);

  useEffect(() => {
    let isMounted = true;

    const loadImages = async () => {
      try {
        const results = await Promise.all(
          FEATURED_SECTIONS.map(async (section) => {
            try {
              const response = await productService.getAllProducts({
                category: section.slug,
                limit: 1,
              });

              const product = response?.data?.products?.[0];
              const image = product?.image || product?.images?.[0] || section.fallbackImage;

              return {
                ...section,
                image,
              };
            } catch (error) {
              console.error(`Failed to load showcase product for ${section.slug}`, error);
              return { ...section };
            }
          })
        );

        if (isMounted) {
          setSections(results);
        }
      } catch (error) {
        console.error("Failed to load showcase sections", error);
      }
    };

    loadImages();

    return () => {
      isMounted = false;
    };
  }, []);

  const leftImages = buildSections(sections, "left");
  const rightImages = buildSections(sections, "right");

  if (sections.length === 0) {
    return null;
  }

  return (
    <section className="sm:py-12 py-0">
      <div className="mx-auto grid grid-cols-2 gap-4 md:gap-6">
        <div className="grid grid-rows-2 gap-4 md:gap-6">
          {leftImages.map((item) => (
            <Link
              href={item.link}
              key={item.key}
              className={`group relative overflow-hidden shadow-md hover:shadow-xl transition-all ${item.class || "rounded-2xl"}`}
            >
              <Image
                src={item.image || item.fallbackImage}
                alt={item.title}
                width={600}
                height={400}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
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

        <div className="grid grid-cols-1 grid-rows-3 gap-4 md:gap-6">
          {rightImages.map((item, index) => {
            const isThird = index === 2;
            return (
              <Link
                href={item.link}
                key={item.key}
                className={`group relative overflow-hidden shadow-md hover:shadow-xl transition-all ${item.class || "rounded-2xl"}`}
              >
                <Image
                  src={item.image || item.fallbackImage}
                  alt={item.title}
                  width={600}
                  height={400}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
                <div
                  className={`absolute inset-0 pointer-events-none ${
                    isThird
                      ? "bg-gradient-to-b from-black/50 via-black/30 to-transparent"
                      : "bg-gradient-to-t from-black/50 via-black/30 to-transparent"
                  }`}
                />
                <div
                  className={`absolute text-white flex flex-col gap-2 ${
                    isThird ? "top-4 left-4 md:top-6 md:left-6" : "bottom-4 left-4 md:bottom-6 md:left-6"
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
