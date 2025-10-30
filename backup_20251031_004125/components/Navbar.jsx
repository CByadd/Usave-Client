"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { LOGO_WHITE_BG } from '../constant/constant';
import Image from 'next/image';
import { ShoppingCart, Heart, UserRound, ChevronDown, Search, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useUI } from '../context/UIContext';
import SearchBar from './layouts/Searchbar';
import { FiRrHeartIcon, FiRrShoppingCartAddIcon } from './icons';

const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const { 
    isCartDrawerOpen, 
    openCartDrawer, 
    closeCartDrawer, 
    isLoginModalOpen, 
    openLoginModal, 
    closeLoginModal, 
    isRegisterModalOpen, 
    openRegisterModal, 
    closeRegisterModal 
  } = useUI();

  const toggleMobile = () => setIsMobileOpen((prev) => !prev);
  const closeMobile = () => setIsMobileOpen(false);
  const toggleSearch = () => setIsSearchExpanded((prev) => !prev);
  const closeSearch = () => setIsSearchExpanded(false);

  return (
    <>
    {/* Backdrop blur for content behind navbar */}
    <div className="fixed top-0 left-0 right-0 h-max z-40 " />
    
    <header className="fixed top-0 left-0 right-0 z-[50] w-full bg-white">
      {/* Top bar */}
      <div className="mx-auto flex h-[64px] w-[100dvw] items-center justify-between px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Left: Mobile menu toggle */}
        <button
          className="md:hidden p-2 -ml-2 text-primary hover:text-blue-500 transition-colors"
          aria-label="Toggle menu"
          onClick={toggleMobile}
        >
          <span className="block h-0.5 w-5 bg-current mb-1" />
          <span className="block h-0.5 w-5 bg-current mb-1" />
          <span className="block h-0.5 w-5 bg-current" />
        </button>

        {/* Center: Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2" onClick={closeMobile}>
            <Image
              src={LOGO_WHITE_BG}
              alt="Logo"
              width={160}
              height={48}
              priority
            />
          </Link>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden md:block flex-1 max-w-[600px] mx-8">
          <SearchBar />
        </div>

         <div className="hidden md:block">
        <div className="mx-auto flex h-[50px] w-[100%] items-center justify-center px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-6 text-sm font-medium text-primary items-center">
            <Link href="/" className="hover:text-blue-500 transition-colors text-[16px]">PRODUCTS</Link>
            <Link href="/" className="hover:text-blue-500 transition-colors text-[16px]">BLOGS</Link>
            <Link href="/" className="hover:text-blue-500 transition-colors text-[16px]">ABOUT US</Link>
            <Link href="/contact" className="hover:text-blue-500 transition-colors text-[16px]">CONTACT US</Link>
          </nav>
        </div>
      </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-4">
          {/* Search Icon - Mobile Only */}
          <button 
            className="md:hidden hover:text-blue-500 transition-colors" 
            aria-label="Search"
            onClick={toggleSearch}
          >
            <Search size={20} />
          </button>
          
          {/* Cart Icon - Desktop Only */}
          <Link
            href="/cart"
            className="hidden md:block relative hover:text-blue-500 transition-colors"
            aria-label="View cart"
          >
            {/* <ShoppingCart size={20} /> */}
            {/* <FiRrShoppingCartAddIcon /> */}
             <Image src={FiRrShoppingCartAddIcon} alt="Cart" width={20} height={20} />
            {getCartCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#0B4866] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {getCartCount()}
              </span>
            )}
          </Link>
          
          {/* Heart Icon - Desktop Only */}
          <Link href="/wishlist" className="hidden md:block relative hover:text-blue-500 transition-colors" aria-label="Wishlist">
            {/* <Heart size={20}  /> */}
            {/* <FiRrHeartIcon /> */}

            <Image src={FiRrHeartIcon} alt="Wishlist" width={20} height={20} />
            {getWishlistCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {getWishlistCount()}
              </span>
            )}
          </Link>
          
          {/* Account Icon */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Welcome, {user?.firstName}</span>
              <Link
                href="/orders"
                className="text-sm text-gray-600 hover:text-blue-500 transition-colors"
              >
                Orders
              </Link>
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-blue-500 transition-colors"
                aria-label="Logout"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={openLoginModal}
                className="text-sm text-gray-600 hover:text-blue-500 transition-colors"
                aria-label="Login"
              >
                Login
              </button>
              <button
                onClick={openRegisterModal}
                className="text-sm bg-[#0B4866] text-white px-3 py-1 rounded hover:bg-[#094058] transition-colors"
                aria-label="Sign Up"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Bar - Expandable */}
    {isSearchExpanded && (
  <div className="md:hidden w-full  flex justify-center items-center pb-3">
    <div className="w-full   max-w-md px-4 flex justify-center">
      <SearchBar 
        placeholder="What You looking For.." 
        isMobile={true} 
        isExpanded={isSearchExpanded}
        onToggle={toggleSearch}
      />
    </div>
  </div>
)}

      {/* Desktop Navigation Links */}
     

      {/* Desktop categories bar */}
      <div className="hidden md:flex mx-auto h-[56px] w-[100dvw] items-center justify-center px-4 sm:px-6 lg:px-8 border-gray-300 border-t border-b shadow-[0_4px_12px_rgba(0,0,0,0.08)] bg-white/80 backdrop-blur-lg">
        <nav className="flex items-center gap-6 text-sm font-extralight text-primary">
    {[
      { name: "LIVING", href: "/categories/living" },
      { name: "DINING", href: "/categories/dining" },
      { name: "BEDROOM", href: "/categories/bedroom" },
      { name: "KITCHEN", href: "/categories/kitchen" },
      { name: "ELECTRONICS", href: "/categories/electronics" },
      { name: "SHOP BY PLACES", href: "/search" },
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

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeMobile}
          />
          
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl transform transition-transform duration-300">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <Image
                  src={LOGO_WHITE_BG}
                  alt="Logo"
                  width={120}
                  height={36}
                  priority
                />
                <button
                  onClick={closeMobile}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* Navigation */}
              <div className="flex-1 overflow-y-auto p-6">
                <nav className="flex flex-col space-y-4">
                  <Link href="/" className="text-lg font-medium text-gray-700 hover:text-[#0B4866] transition-colors" onClick={closeMobile}>
                    PRODUCTS
                  </Link>
                  <Link href="/" className="text-lg font-medium text-gray-700 hover:text-[#0B4866] transition-colors" onClick={closeMobile}>
                    BLOGS
                  </Link>
                  <Link href="/" className="text-lg font-medium text-gray-700 hover:text-[#0B4866] transition-colors" onClick={closeMobile}>
                    ABOUT US
                  </Link>
                  <Link href="/contact" className="text-lg font-medium text-gray-700 hover:text-[#0B4866] transition-colors" onClick={closeMobile}>
                    CONTACT US
                  </Link>
                  
                  <div className="border-t border-gray-200 my-4" />
                  
                  {[
                    { name: "LIVING", href: "/categories/living" },
                    { name: "DINING", href: "/categories/dining" },
                    { name: "BEDROOM", href: "/categories/bedroom" },
                    { name: "KITCHEN", href: "/categories/kitchen" },
                    { name: "ELECTRONICS", href: "/categories/electronics" },
                    { name: "SHOP BY PLACES", href: "/search" },
                  ].map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-lg font-medium text-gray-700 hover:text-[#0B4866] transition-colors"
                      onClick={closeMobile}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

     
    </header>
  </>
  );
}

export default Navbar;