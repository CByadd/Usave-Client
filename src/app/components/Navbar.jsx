"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { LOGO_WHITE_BG } from '../constant/constant';
import Image from 'next/image';
import SearchBar from './layouts/Searchbar';
import { ShoppingCart, Heart, UserRound, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();
  const { totals } = useCart();

  const toggleMobile = () => setIsMobileOpen((prev) => !prev);
  const closeMobile = () => setIsMobileOpen(false);

  return (
    <>
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

  <nav className="hidden md:flex gap-4 text-sm font-medium text-primary items-center">
            <Link href="/" className="hover:text-blue-500 transition-colors text-[16px]">PRODUCTS</Link>
            <Link href="/" className="hover:text-blue-500 transition-colors text-[16px]">BLOGS</Link>
            <Link href="/" className="hover:text-blue-500 transition-colors text-[16px]">ABOUT US</Link>
            <Link href="/contact" className="hover:text-blue-500 transition-colors text-[16px]">CONTACT US</Link>
            
            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative hover:text-blue-500 transition-colors"
            >
              <ShoppingCart size={20} />
              {totals.itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#0B4866] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totals.itemCount}
                </span>
              )}
            </Link>
            
            {/* Wishlist Icon */}
            <button className="hover:text-blue-500 transition-colors">
              <Heart size={20} />
            </button>
            
            {/* User Icon */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="hover:text-blue-500 transition-colors"
              >
                <UserRound size={20} />
              </button>
              
              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-600">{user?.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        My Orders
                      </Link>
                      <Link
                        href="/wishlist"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Wishlist
                      </Link>
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </nav>
      </div>


 <div className="mx-auto flex h-[70px] w-[95%] items-center justify-center px-4 sm:px-6 lg:px-8 border-gray-300 border-t border-b shadow-[0_4px_12px_rgba(0,0,0,0.08)] bg-white/70 backdrop-blur-md ">
  <nav className="hidden md:flex items-center gap-6 text-sm font-extralight text-primary">
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

     
    </header>
  </>
  );
}

export default Navbar;