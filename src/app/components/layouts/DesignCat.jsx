"use client";
import Image from "next/image";
import Link from "next/link";
import designData from './../../data/designData.json';

export default function DesignCat() {
  const leftImages = designData.left || [];
  const rightImages = designData.right || [];

  return (
    <section className=" py-12">
      <div className="mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
        {/* LEFT SECTION */}
        <div className="grid grid-rows-2 gap-6">
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
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center ">
                <h3 className="text-white text-lg font-semibold">{item.title}</h3>
              </div>
            </Link>
          ))}
        </div>

        {/* RIGHT SECTION */}
        <div className="grid grid-cols-1 grid-rows-3 gap-6">
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
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center ">
                <h3 className="text-white text-lg font-semibold">{item.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
