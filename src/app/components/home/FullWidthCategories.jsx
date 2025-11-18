import React from "react";
// import categories from '../../data/placeCategories.json';
import Link from "next/link";
import { ArrowRight } from 'lucide-react';



const categories = [
  {
    "title": "Living Room",
    "para": "Modern furniture for your living room.",
    "link": "/places/living-room",
    "bgImg": "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1757264135/Usave/unsplash_p3UWyaujtQo_gor2oz.jpg"
  },
  {
    "title": "Dining Room",
    "para": "Elegant dining tables and chairs.",
    "link": "/places/dining-room",
    "bgImg": "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1757264157/Usave/unsplash_eyEy5YZhSvU_ebbzol.jpg"
  },
  {
    "title": "Bedroom",
    "para": "Cozy beds and wardrobes.",
    "link": "/places/bedroom",
    "bgImg": "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1757264157/Usave/unsplash_1eWGq_l_DuU_dcqug9.jpg"
  },
  {
    "title": "Office",
    "para": "Stylish office furniture.",
    "link": "/places/office",
    "bgImg": "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1757264164/Usave/unsplash_Cu_uy3E7jPc_wsywbf.jpg"
  }
]



const FullWCategory = () => {
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
          }}
        >
          {/* Black gradient overlay for text visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/30 to-transparent pointer-events-none" />
          
          <Link href={cat.link}>
            <span className="absolute inset-0 flex flex-col justify-end p-7 text-white">
              <h2 className="text-3xl font-bold underline">{cat.title}</h2>
              <p className="text-[18px]">{cat.para}</p>
              <ArrowRight size={40} />

            </span>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default FullWCategory;
