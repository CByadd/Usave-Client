import React from "react";
import categories from "../../data/Placecategories.json";
import Link from "next/link";
import { ArrowRight } from 'lucide-react';

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
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
          
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
