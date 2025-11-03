import React from "react";
import { MapPin, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#e7eff3] text-gray-800 pt-10 pb-4">
      <div className="max-w-full mx-auto px-6 grid md:grid-cols-6 gap-8 border-b border-gray-300 pb-8">
        {/* Left Section */}
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold text-[#00688B] mb-3">
            USAVE <span className="text-gray-600">COMMERCIAL</span>
          </h2>
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
            <li>Rentals</li>
            <li>Resorts</li>
            <li>Airbnb</li>
            <li>Hotels</li>
          </ul>
        </div>

        {/* Living */}
        <div>
          <h3 className="font-semibold text-[#00688B] mb-2">LIVING</h3>
          <ul className="space-y-1 text-sm">
            <li>Lounges</li>
            <li>Sofas</li>
            <li>Chair</li>
            <li>Mats</li>
          </ul>
        </div>

        {/* Dining */}
        <div>
          <h3 className="font-semibold text-[#00688B] mb-2">DINING</h3>
          <ul className="space-y-1 text-sm">
            <li>BBQ</li>
            <li>Outdoor</li>
            <li>Chair</li>
            <li>Mats</li>
          </ul>
        </div>

        {/* Bedroom */}
        <div>
          <h3 className="font-semibold text-[#00688B] mb-2">BEDROOM</h3>
          <ul className="space-y-1 text-sm">
            <li>Beds</li>
            <li>Mattress</li>
            <li>Headboard</li>
          </ul>
        </div>

        {/* Electronics */}
        <div>
          <h3 className="font-semibold text-[#00688B] mb-2">ELECTRONICS</h3>
          <ul className="space-y-1 text-sm">
            <li>Heating</li>
            <li>Cooling</li>
            <li>Washers</li>
            <li>Dryers</li>
            <li>TV’s & Sound bars</li>
            <li>BBQ</li>
          </ul>
        </div>

        {/* Kitchen */}
        <div>
          <h3 className="font-semibold text-[#00688B] mb-2">KITCHEN</h3>
          <ul className="space-y-1 text-sm">
            <li>Fridges</li>
            <li>Freezers</li>
            <li>Dishwashers</li>
            <li>Ovens</li>
            <li>Outdoor</li>
            <li>BBQ</li>
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

      {/* Bottom Text */}
      <div className="text-center mt-4 text-sm text-gray-600">
        © 2025 Cairns Computer Genie. All rights reserved
      </div>
    </footer>
  );
};

export default Footer;
