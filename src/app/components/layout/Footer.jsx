"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LOGO_NONE_BG } from './../../lib/constants.js';
import productService from '../../services/api/productService';

const Footer = () => {
  const [categoryLinks, setCategoryLinks] = useState([]);

  useEffect(() => {
    // Fetch categories from API (same as navbar)
    const fetchCategories = async () => {
      try {
        const response = await productService.getNavCategories();
        if (response?.success && response?.data?.categories) {
          setCategoryLinks(response.data.categories);
        }
      } catch (error) {
        console.error('Failed to load footer categories:', error);
        setCategoryLinks([]);
      }
    };
    
    fetchCategories();
  }, []);

  // Find categories for footer sections
  const loungesCategory = categoryLinks.find(cat => 
    cat.name.toUpperCase().includes('LOUNGES') || 
    cat.name.toUpperCase().includes('LIVING ROOM') ||
    cat.name.toUpperCase().includes('LIVING-ROOM')
  );
  const diningCategory = categoryLinks.find(cat => 
    cat.name.toUpperCase().includes('DINING')
  );
  const bedroomCategory = categoryLinks.find(cat => 
    cat.name.toUpperCase().includes('BEDROOM')
  );
  const outdoorCategory = categoryLinks.find(cat => 
    cat.name.toUpperCase().includes('OUTDOOR')
  );
  return (
    <footer className="bg-[#e7eff3] text-gray-800 pt-10 pb-4">
      <div className="max-w-[95dvw] mx-auto px-6 grid md:grid-cols-6 gap-8 border-b border-gray-300 pb-8">
        {/* Left Section */}
        <div className="md:col-span-2">
         <Image
            src="https://res.cloudinary.com/dh0ehlpkp/image/upload/v1763599313/dowsnload_11_qqd2gv.png"
            alt="USAVE Logo"
            width={125}
            height={50}
            className="mb-4"
         
         />
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
            Welcome to USAVE Commercial, a family owned business in Far North
            Queensland — your go-to for electrical, bedding, and furniture brands
            at competitive commercial prices.
          </p>

          <div className="flex items-start gap-2 mb-2">
            <MapPin className="text-gray-700 mt-1" size={18} />
            <p className="text-sm">
              Portdouglas & Portsmith, Cairns, 4870
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Phone className="text-gray-700 mt-1" size={18} />
            <p className="text-sm">+61 0427-433-001</p>
          </div>
        </div>

        {/* Shop by Places */}
        <div>
          <Link href="/places" className="font-semibold text-[#00688B] mb-2 block hover:underline">
            SHOP BY PLACES
          </Link>
          <ul className="space-y-1 text-sm">
            <li>
              <Link href="/places?place=airbnb" className="text-gray-700 hover:text-[#00688B] transition-colors">
                Airbnb/Rentals
              </Link>
            </li>
            <li>
              <Link href="/places?place=luxury" className="text-gray-700 hover:text-[#00688B] transition-colors">
                Luxury
              </Link>
            </li>
            <li>
              <Link href="/places?place=resorts" className="text-gray-700 hover:text-[#00688B] transition-colors">
                Resorts
              </Link>
            </li>
            <li>
              <Link href="/places?place=resorts" className="text-gray-700 hover:text-[#00688B] transition-colors">
                All
              </Link>
            </li>
          </ul>
        </div>

        {/* Lounges */}
<div>
  {loungesCategory ? (
    <>
      <Link href={loungesCategory.href} className="font-semibold text-[#00688B] mb-2 block hover:underline">
        LOUNGES
      </Link>
      <ul className="space-y-1 text-sm">
        {loungesCategory.subcategories && loungesCategory.subcategories.length > 0 ? (
          loungesCategory.subcategories.map((sub) => (
            <li key={sub.name}>
              <Link href={sub.href} className="text-gray-700 hover:text-[#00688B] hover:underline transition-colors cursor-pointer">
                {sub.name}
              </Link>
            </li>
          ))
        ) : (
          <li className="text-gray-500 text-xs">No subcategories available</li>
        )}
      </ul>
    </>
  ) : (
    <>
      <div className="font-semibold text-[#00688B] mb-2">LOUNGES</div>
      <ul className="space-y-1 text-sm">
        <li className="text-gray-500 text-xs">Loading...</li>
      </ul>
    </>
  )}
</div>


       {/* Dining */}
<div>
  {diningCategory ? (
    <>
      <Link href={diningCategory.href} className="font-semibold text-[#00688B] mb-2 block hover:underline">
        DINING
      </Link>
      <ul className="space-y-1 text-sm">
        {diningCategory.subcategories && diningCategory.subcategories.length > 0 ? (
          diningCategory.subcategories.map((sub) => (
            <li key={sub.name}>
              <Link href={sub.href} className="text-gray-700 hover:text-[#00688B] hover:underline transition-colors cursor-pointer">
                {sub.name}
              </Link>
            </li>
          ))
        ) : (
          <li className="text-gray-500 text-xs">No subcategories available</li>
        )}
      </ul>
    </>
  ) : (
    <>
      <div className="font-semibold text-[#00688B] mb-2">DINING</div>
      <ul className="space-y-1 text-sm">
        <li className="text-gray-500 text-xs">Loading...</li>
      </ul>
    </>
  )}
</div>

    


        {/* Bedroom */}
<div>
  {bedroomCategory ? (
    <>
      <Link href={bedroomCategory.href} className="font-semibold text-[#00688B] mb-2 block hover:underline">
        BEDROOM
      </Link>
      <ul className="space-y-1 text-sm">
        {bedroomCategory.subcategories && bedroomCategory.subcategories.length > 0 ? (
          bedroomCategory.subcategories.map((sub) => (
            <li key={sub.name}>
              <Link href={sub.href} className="text-gray-700 hover:text-[#00688B] hover:underline transition-colors cursor-pointer">
                {sub.name}
              </Link>
            </li>
          ))
        ) : (
          <li className="text-gray-500 text-xs">No subcategories available</li>
        )}
      </ul>
    </>
  ) : (
    <>
      <div className="font-semibold text-[#00688B] mb-2">BEDROOM</div>
      <ul className="space-y-1 text-sm">
        <li className="text-gray-500 text-xs">Loading...</li>
      </ul>
    </>
  )}
</div>

{/* Outdoor */}
<div>
  {outdoorCategory ? (
    <>
      <Link href={outdoorCategory.href} className="font-semibold text-[#00688B] mb-2 block hover:underline">
        OUTDOOR
      </Link>
      <ul className="space-y-1 text-sm">
        {outdoorCategory.subcategories && outdoorCategory.subcategories.length > 0 ? (
          outdoorCategory.subcategories.map((sub) => (
            <li key={sub.name}>
              <Link href={sub.href} className="text-gray-700 hover:text-[#00688B] hover:underline transition-colors cursor-pointer">
                {sub.name}
              </Link>
            </li>
          ))
        ) : (
          <li className="text-gray-500 text-xs">No subcategories available</li>
        )}
      </ul>
    </>
  ) : (
    <>
      <div className="font-semibold text-[#00688B] mb-2">OUTDOOR</div>
      <ul className="space-y-1 text-sm">
        <li className="text-gray-500 text-xs">Loading...</li>
      </ul>
    </>
  )}
</div>


      </div>

      {/* Subscribe Section */}
      {/* <div className="max-w-7xl mx-auto px-6 mt-6 border-b border-gray-300 pb-6">
        <h3 className="font-semibold text-gray-900 mb-1">Stay Updated</h3>
        <p className="text-sm text-gray-600 mb-3">
          Get the latest updates on the products
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00688B]"
          />
          <button className="bg-[#004c63] text-white px-6 py-2 rounded-md hover:bg-[#00688B] transition-all">
            Subscribe
          </button>
        </div>
      </div> */}

      {/* Links Section */}
      <div className="max-w-7xl mx-auto px-6 mt-6 border-b border-gray-300 pb-6">
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <Link href="/contact" className="text-gray-700 hover:text-[#00688B] transition-colors">
            Contact Us
          </Link>
          {/* <span className="text-gray-400">|</span>
          <Link href="/" className="text-gray-700 hover:text-[#00688B] transition-colors">
            About Us
          </Link> */}
          <span className="text-gray-400">|</span>
          <Link href="/products" className="text-gray-700 hover:text-[#00688B] transition-colors">
            All Products
          </Link>
        </div>
      </div>

      {/* Bottom Text */}
      <div className="text-center mt-4 text-sm text-gray-600">
        © 2025 Cairns Computer Genie. All rights reserved
      </div>
    </footer>
  );
};

export default Footer;
