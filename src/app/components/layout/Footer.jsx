import React from "react";
import { MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LOGO_NONE_BG } from './../../lib/constants.js';

const Footer = () => {
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
          <h3 className="font-semibold text-[#00688B] mb-2">SHOP BY PLACES</h3>
          <ul className="space-y-1 text-sm">
            <li>Airbnb</li>
            <li>Luxury</li>
            <li>Resorts</li>
          </ul>
        </div>

        {/* Lounges */}
<div>
  <h3 className="font-semibold text-[#00688B] mb-2">LOUNGES</h3>
  <ul className="space-y-1 text-sm">
    <li>Corner Recliner</li>
    <li>Corner Sofabed</li>
    <li>Fabric 3 + 2 / Chaise</li>
    <li>Fabric Recliner Lounge</li>
    <li>Leather 3 + 2 / Chaise</li>
    <li>Leather Recliner Lounge</li>
    <li>Modular Lounge</li>
    <li>Occasional Armchairs</li>
    <li>Sofabed</li>
  </ul>
</div>


       {/* Dining */}
<div>
  <h3 className="font-semibold text-[#00688B] mb-2">DINING</h3>
  <ul className="space-y-1 text-sm">
    <li>Bar Stools</li>
    <li>Dining Chairs</li>
    <li>Occasionals</li>
    <li>Timber Natural</li>
    <li>Two Tone</li>
    <li>White/Black</li>
  </ul>
</div>

    


        {/* Bedroom */}
<div>
  <h3 className="font-semibold text-[#00688B] mb-2">BEDROOM</h3>
  <ul className="space-y-1 text-sm">
    <li>Bedbase</li>
    <li>Bunk Beds</li>
    <li>Fabric Bed</li>
    <li>Mattress</li>
    <li>Metal</li>
    <li>Timber Natural</li>
    <li>Timber - White/Black</li>
  </ul>
</div>

{/* Outdoor */}
<div>
  <h3 className="font-semibold text-[#00688B] mb-2">OUTDOOR</h3>
  <ul className="space-y-1 text-sm">
    <li>Aluminium/Wicker</li>
    <li>Timber</li>
  </ul>
</div>


      </div>

      {/* Subscribe Section */}
      <div className="max-w-7xl mx-auto px-6 mt-6 border-b border-gray-300 pb-6">
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
      </div>

      {/* Links Section */}
      <div className="max-w-7xl mx-auto px-6 mt-6 border-b border-gray-300 pb-6">
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <Link href="/contact" className="text-gray-700 hover:text-[#00688B] transition-colors">
            Contact Us
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/" className="text-gray-700 hover:text-[#00688B] transition-colors">
            About Us
          </Link>
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
