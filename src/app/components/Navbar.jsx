"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { LOGO_WHITE_BG } from '../constant/constant';
import Image from 'next/image';
import SearchBar from './layouts/Searchbar';
import { ShoppingCart } from 'lucide-react';
import { Heart } from 'lucide-react';
import { UserRound } from 'lucide-react';
import { ChevronDown } from "lucide-react";

const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobile = () => setIsMobileOpen((prev) => !prev);
  const closeMobile = () => setIsMobileOpen(false);

  return (
    <header className="top-0 z-50 w-full">
      <div className="mx-auto flex h-[70px] w-[90%] items-center justify-between px-4 sm:px-6 lg:px-8 ">
       <div className="flex items-center gap-6 w-[60%]">
         <div className="flex items-center gap-2 ">
          <Link href="/" className="flex items-center gap-2" onClick={closeMobile}>
          
          <Image
            src={LOGO_WHITE_BG}
            alt="Logo"
            width={200}
            height={60}
            priority
          />
          
          </Link>
        </div>
<SearchBar/>
       </div>

  <nav className="hidden md:flex gap-4 text-sm font-medium text-primary">
            <Link href="/" className="hover:text-blue-500 transition-colors text-[16px]">PRODUCTS</Link>
            <Link href="/" className="hover:text-blue-500 transition-colors text-[16px]">BLOGS</Link>
            <Link href="/" className="hover:text-blue-500 transition-colors text-[16px]">ABOUT US</Link>
            <Link href="/contact" className="hover:text-blue-500 transition-colors text-[16px]">CONTACT US</Link>
            <ShoppingCart />
            <Heart />
            <UserRound />
          </nav>
      </div>


 <div className="mx-auto flex h-[70px] w-[95%] items-center justify-center px-4 sm:px-6 lg:px-8 border-gray-300 border-t border-b shadow-[0_4px_12px_rgba(0,0,0,0.08)] bg-white/70 backdrop-blur-md ">
  <nav className="hidden md:flex items-center gap-6 text-sm font-extralight text-primary">
    {[
      { name: "LIVING", href: "/" },
      { name: "DINING", href: "/" },
      { name: "BEDROOM", href: "/" },
      { name: "KITCHEN", href: "/contact" },
      { name: "ELECTRONICS", href: "/contact" },
      { name: "SHOP BY PLACES", href: "/contact" },
    ].map((item) => (
      <div key={item.name} className="relative group flex items-center gap-1 cursor-pointer">
        <Link
          href={item.href}
          className="hover:text-blue-400 transition-colors text-[16px] flex items-center gap-1"
        >
          {item.name}
          <ChevronDown
            size={18}
            className="transition-transform group-hover:rotate-180"
          />
        </Link>
      </div>
    ))}
  </nav>
</div>

     
    </header>
  );
}

export default Navbar;