"use client";
import React from "react";
// import categories from '../../data/placeCategories.json';
import Link from "next/link";
import { ArrowRight } from 'lucide-react';
import { useAnimationStore } from "../../stores/useAnimationStore";



const categories = [
  {
    "title": "Living Room",
    "para": "Modern furniture for your living room.",
    "link": "/places/living-room",
    "bgImg": "https://res.cloudinary.com/dh0ehlpkp/image/upload/v1763598824/download_7_x7v9kf.png"
  },
  {
    "title": "Dining Room",
    "para": "Elegant dining tables and chairs.",
    "link": "/places/dining-room",
    "bgImg": "https://res.cloudinary.com/dh0ehlpkp/image/upload/v1763598965/download_10_xemzob.png"
  },
  {
    "title": "Bedroom",
    "para": "Cozy beds and wardrobes.",
    "link": "/places/bedroom",
    "bgImg": "https://res.cloudinary.com/dh0ehlpkp/image/upload/v1763598821/download_8_xiby6w.png"
  },
  {
    "title": "Outdoor",
    "para": "Stylish outdoor furniture.",
    "link": "/places/office",
    "bgImg": "https://res.cloudinary.com/dh0ehlpkp/image/upload/v1763598821/download_9_er1z7t.png"
  }
]



const FullWCategory = () => {
  const isMobile = useAnimationStore((state) => state.isMobile);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 w-full">
      {categories.map((cat, index) => (
        <div
          key={index}
          className="relative h-[600px] w-full overflow-hidden"
          style={{
            backgroundImage: `url(${cat.bgImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            ...(isMobile ? { transition: 'none', animation: 'none' } : {}),
          }}
        >
          {/* Black gradient overlay for text visibility */}
          <div 
            className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/30 to-transparent pointer-events-none"
            style={isMobile ? { transition: 'none', animation: 'none' } : {}}
          />
          
          <Link 
            href={cat.link}
            style={isMobile ? { transition: 'none', animation: 'none' } : {}}
          >
            <span 
              className="absolute inset-0 flex flex-col justify-end p-7 text-white"
              style={isMobile ? { transition: 'none', animation: 'none' } : {}}
            >
              <h2 
                className="text-3xl font-bold underline"
                style={isMobile ? { transition: 'none', animation: 'none' } : {}}
              >
                {cat.title}
              </h2>
              <p 
                className="text-[18px]"
                style={isMobile ? { transition: 'none', animation: 'none' } : {}}
              >
                {cat.para}
              </p>
              <ArrowRight 
                size={40} 
                style={isMobile ? { transition: 'none', animation: 'none' } : {}}
              />
            </span>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default FullWCategory;
