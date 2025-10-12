"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, ShoppingCart, Search, Menu, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const SearchResultsPage = () => {
  const [showCategories, setShowCategories] = useState(false);

  const products = [
    {
      id: 1,
      title: "City Lounge 2 Seater",
      image: "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1759806308/Usave/CityLounger2Seater_400x400_1_1_e2odgl-removebg-preview_mur0jb.png",
      originalPrice: 800,
      discountedPrice: 699,
      rating: 4.5,
      reviews: 13,
      inStock: true,
      badge: "Top seller",
      badgeColor: "bg-pink-600",
      savePercent: 21
    },
    {
      id: 2,
      title: "City Lounge RHF Chase 2 Seater",
      image: "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1759806308/Usave/CitylLoungeRHFchase2_400x400_1_oafcia-removebg-preview_nebksz.png",
      originalPrice: 800,
      discountedPrice: 1699,
      rating: 4.5,
      reviews: 13,
      inStock: true,
      badge: "Top seller",
      badgeColor: "bg-pink-600"
    },
    {
      id: 3,
      title: "Rose accent chair",
      image: "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1759806308/Usave/CityLounger2Seater_400x400_1_1_e2odgl-removebg-preview_mur0jb.png",
      originalPrice: 800,
      discountedPrice: 699,
      rating: 4.5,
      reviews: 13,
      inStock: true,
      savePercent: 21
    },
    {
      id: 4,
      title: "Melrose chair",
      image: "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1759806308/Usave/CitylLoungeRHFchase2_400x400_1_oafcia-removebg-preview_nebksz.png",
      originalPrice: 800,
      discountedPrice: 1699,
      rating: 4.5,
      reviews: 13,
      inStock: true
    },
    {
      id: 5,
      title: "Rose accent chair",
      image: "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1759806308/Usave/Hasting3SeaterLounge_Chaise_2_400x400_1_g5gov0-removebg-preview_vcxoy0.png",
      originalPrice: 800,
      discountedPrice: 699,
      rating: 4.5,
      reviews: 13,
      inStock: true
    },
    {
      id: 6,
      title: "Rose accent chair",
      image: "https://res.cloudinary.com/dvmuf6jfj/image/upload/v1759806308/Usave/CityLounger2Seater_400x400_1_1_e2odgl-removebg-preview_mur0jb.png",
      originalPrice: 800,
      discountedPrice: 699,
      rating: 4.5,
      reviews: 13,
      inStock: true
    }
  ];

  const categories = {
    "SHOP BY PLACES": ["Rentals", "Resorts", "Airbnb", "Hotels"],
    "LIVING": ["Lounges", "Sofas", "Chair", "Mats"],
    "DINING": ["BBQ", "Outdoor", "Chair", "Mats"],
    "BEDROOM": ["Beds", "Mattress", "Headboard"],
    "ELECTRONICS": ["Heating", "Cooling", "Washers", "Dryers", "TV's & Sound bars", "BBQ"],
    "KITCHEN": ["Fridges", "Freezers", "Dishwashers", "Ovens", "Outdoor", "BBQ"]
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <button className="p-2">
            <Menu size={24} className="text-gray-700" />
          </button>
          <Image
            src="https://res.cloudinary.com/dvmuf6jfj/image/upload/v1759806308/Usave/LOGO_c3gjsh.png"
            alt="USAVE Commercial"
            width={120}
            height={40}
            className="h-8 w-auto"
          />
          <div className="flex gap-3">
            <button className="p-2">
              <Search size={22} className="text-gray-700" />
            </button>
            <button className="p-2">
              <Heart size={22} className="text-gray-700" />
            </button>
            <button className="p-2">
              <ShoppingCart size={22} className="text-gray-700" />
            </button>
          </div>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="What you are looking for"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0B4866]"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="mb-4">
          <h1 className="text-xl font-medium text-gray-800 mb-1">
            Search results for <span className="font-semibold">"Sofas"</span>
          </h1>
          <p className="text-sm text-gray-600">115 results</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm"
            >
              <div className="relative bg-gray-50 p-3 aspect-square flex items-center justify-center">
                {product.badge && (
                  <div className={`absolute top-2 left-2 ${product.badgeColor} text-white text-[10px] font-semibold px-2 py-0.5 rounded`}>
                    {product.badge}
                  </div>
                )}
                <button className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white">
                  <Heart size={16} className="text-gray-600" />
                </button>
                <Image
                  src={product.image}
                  alt={product.title}
                  width={150}
                  height={150}
                  className="object-contain max-h-[120px] w-auto"
                />
              </div>

              <div className="p-3">
                <h3 className="text-xs font-medium text-gray-800 mb-1.5 line-clamp-2">
                  {product.title}
                </h3>

                <div className="flex flex-col gap-1 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 line-through text-[11px]">${product.originalPrice}.00</span>
                    <span className="text-base font-bold text-gray-900">${product.discountedPrice}.00</span>
                  </div>
                  {product.savePercent && (
                    <span className="text-green-600 text-[10px] font-medium bg-green-50 px-1.5 py-0.5 rounded w-fit">
                      Save {product.savePercent}%
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-0.5 mb-2">
                  <div className="flex text-yellow-400 text-xs">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>{i < Math.floor(product.rating) ? '★' : '☆'}</span>
                    ))}
                  </div>
                  <span className="text-gray-500 text-[10px] ml-0.5">({product.reviews})</span>
                </div>

                <div className="flex items-center gap-1.5 mb-3">
                  <div className={`h-1.5 w-1.5 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-[11px] text-gray-600">
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                <div className="flex gap-1.5">
                  <button className="flex-1 py-2 border border-gray-300 rounded-lg text-[11px] font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1">
                    <Search size={12} />
                  </button>
                  <button className="flex-1 py-2 bg-[#0B4866] text-white rounded-lg text-[11px] font-medium hover:bg-[#094058] flex items-center justify-center gap-1">
                    <ShoppingCart size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mb-8">
          <button className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            Load More
          </button>
        </div>

        <div className="border-t border-b border-gray-200 py-6 mb-8">
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="w-full flex items-center justify-between text-left"
          >
            <h2 className="text-base font-semibold text-gray-900">SHOP BY PLACES</h2>
            <ChevronRight
              size={20}
              className={`text-gray-500 transition-transform ${showCategories ? 'rotate-90' : ''}`}
            />
          </button>

          {showCategories && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              {Object.entries(categories).map(([category, items]) => (
                <div key={category} className="space-y-2">
                  <h3 className="text-xs font-semibold text-[#0B4866]">{category}</h3>
                  <ul className="space-y-1">
                    {items.map((item, idx) => (
                      <li key={idx}>
                        <Link href="#" className="text-xs text-gray-700 hover:text-[#0B4866]">
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 mb-6">
          <h2 className="text-base font-semibold text-gray-900">LIVING</h2>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
            <Link href="#" className="hover:text-[#0B4866]">Lounges</Link>
            <Link href="#" className="hover:text-[#0B4866]">Sofas</Link>
            <Link href="#" className="hover:text-[#0B4866]">Chair</Link>
            <Link href="#" className="hover:text-[#0B4866]">Mats</Link>
          </div>
        </div>
      </div>

      <div className="bg-[#e7eff3] px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-[#0B4866] mb-2">
              USAVE <span className="text-gray-600">COMMERCIAL</span>
            </h2>
            <p className="text-xs text-gray-700 leading-relaxed mb-4">
              Welcome to USAVE Commercial, a family owned business in Far North Queensland — your go-to for electrical, bedding, and furniture brands at competitive commercial prices.
            </p>
            <div className="space-y-2 text-xs text-gray-700">
              <p className="flex items-start gap-2">
                <span>📍</span>
                <span>Portdouglas & Portsmith, Cairns, 4870</span>
              </p>
              <p className="flex items-start gap-2">
                <span>📞</span>
                <span>+61 0427-433-001</span>
              </p>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Stay Updated</h3>
            <p className="text-xs text-gray-600 mb-3">Get the latest updates on the products</p>
            <div className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B4866]"
              />
              <button className="bg-[#0B4866] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#094058]">
                Subscribe
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-gray-600 border-t border-gray-300 pt-4">
            © 2025 Cairns Computer Genie. All rights reserved
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
