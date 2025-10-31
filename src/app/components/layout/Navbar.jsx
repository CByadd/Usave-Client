"use client";
import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserRound, Search, LogOut, ChevronDown, X } from 'lucide-react';
import { LOGO_WHITE_BG } from '../../lib/constants';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useUI } from '../../contexts/UIContext';
import SearchBar from '../search/SearchBar';
import { FiRrHeartIcon, FiRrShoppingCartAddIcon } from '../icons';

// Navigation links
const mainNavLinks = [
  { name: "PRODUCTS", href: "/" },
  { name: "BLOGS", href: "/" },
  { name: "ABOUT US", href: "/" },
  { name: "CONTACT US", href: "/contact" }
];

const categoryLinks = [
  { name: "LIVING", href: "/categories/living" },
  { name: "DINING", href: "/categories/dining" },
  { name: "BEDROOM", href: "/categories/bedroom" },
  { name: "KITCHEN", href: "/categories/kitchen" },
  { name: "ELECTRONICS", href: "/categories/electronics" },
  { name: "SHOP BY PLACES", href: "/search" },
];

const Navbar = () => {
  // State
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  // Hooks
  const { user, isAuthenticated, logout } = useAuth();
  const { openAuthDrawer, openCartDrawer } = useUI();
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();

  // Handlers
  const toggleMobile = useCallback(() => setIsMobileOpen(prev => !prev), []);
  const closeMobile = useCallback(() => setIsMobileOpen(false), []);
  const toggleSearch = useCallback(() => setIsSearchExpanded(prev => !prev), []);
  const closeSearch = useCallback(() => setIsSearchExpanded(false), []);

  // Render Functions
  const renderMobileMenuButton = () => (
    <button
      className="md:hidden p-2 -ml-2 text-primary hover:text-blue-500 transition-colors"
      aria-label="Toggle menu"
      onClick={toggleMobile}
    >
      <span className="block h-0.5 w-5 bg-current mb-1" />
      <span className="block h-0.5 w-5 bg-current mb-1" />
      <span className="block h-0.5 w-5 bg-current" />
    </button>
  );

  const renderLogo = () => (
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
      <div className="mx-auto flex h-[50px] w-full items-center justify-center px-4 sm:px-6 lg:px-8">
        
        <nav className="flex gap-6 text-sm font-medium text-primary items-center">
          {mainNavLinks.map((item) => (
            <Link 
              key={item.name}
              href={item.href} 
              className="hover:text-blue-500 transition-colors text-[16px]"
            >
              {item.name}
          ))}
        </nav>
      </div>
    </div>
  );

  const renderMobileSearch = () => (
    <button 
      className="md:hidden hover:text-blue-500 transition-colors" 
      aria-label="Search"
      onClick={toggleSearch}
    >
      <Search size={20} />
    </button>
  );

  const renderCartIcon = () => (
    <Link
      href="/cart"
      className="hidden md:block relative hover:text-blue-500 transition-colors"
      aria-label="View cart"
    >
      <Image src={FiRrShoppingCartAddIcon} alt="Cart" width={20} height={20} />
      {getCartCount() > 0 && (
        <span className="absolute -top-2 -right-2 bg-[#0B4866] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {getCartCount()}
        </span>
      )}
    </Link>
  );

  const renderWishlistIcon = () => (
    <Link 
      href="/wishlist" 
      className="hidden md:block relative hover:text-blue-500 transition-colors" 
      aria-label="Wishlist"
    >
      <Image src={FiRrHeartIcon} alt="Wishlist" width={20} height={20} />
      {getWishlistCount() > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {getWishlistCount()}
        </span>
      )}
    </Link>
  );

  const renderUserMenu = () => {
    return (
      <div className="hidden md:block relative">
        <button
          type="button"
          className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors focus:outline-none relative z-10"
          aria-label={isAuthenticated ? 'User account' : 'Sign in'}
          onClick={(e) => {
            e.stopPropagation();
            setIsAccountMenuOpen(prev => !prev);
          }}
          onMouseEnter={() => setIsAccountMenuOpen(true)}
          onFocus={() => setIsAccountMenuOpen(true)}
        >
          <UserRound size={20} className="text-gray-600" />
        </button>

        {isAccountMenuOpen && (
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsAccountMenuOpen(false)}
          />
        )}
        
        <div
          className={`absolute right-0 top-full mt-1 w-60 bg-white rounded-md shadow-lg py-2 z-50 transition-all duration-150 ${
            isAccountMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}
          onMouseEnter={() => setIsAccountMenuOpen(true)}
          onMouseLeave={() => setIsAccountMenuOpen(false)}
        >
          {isAuthenticated ? (
            <>
              <div className="px-4 pb-3 border-b border-gray-100">
                <p className="text-sm text-gray-600">Welcome, {user?.firstName || user?.name || 'User'}</p>
                {user?.email && (
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                )}
              </div>
              <div className="py-1">
                <Link
                  href="/orders"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    closeMobile();
                    setIsAccountMenuOpen(false);
                  }}
                >
                  Orders
                </Link>
                <Link
                  href="/account"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    closeMobile();
                    setIsAccountMenuOpen(false);
                  }}
                >
                  My Account
                </Link>
                <button
                  onClick={() => {
                    logout();
                    closeMobile();
                    setIsAccountMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="py-1">
              <button
                onClick={() => {
                  openAuthDrawer('login');
                  closeMobile();
                  setIsAccountMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Login
              </button>
              <button
                onClick={() => {
                  openAuthDrawer('register');
                  closeMobile();
                  setIsAccountMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMobileCategories = () => (
    <div className="md:hidden w-full">
      <div className="overflow-x-auto py-2 px-4">
        <div className="flex space-x-4">
          {categoryLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="whitespace-nowrap text-sm font-medium text-gray-700 hover:text-blue-500 px-3 py-1 rounded-full bg-gray-100"
              onClick={closeMobile}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMobileDrawer = () => (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeMobile}
      />
      
      <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl transform transition-transform duration-300">
        <div className="flex flex-col h-full">
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
          
          <div className="flex-1 overflow-y-auto p-6">
            <nav className="flex flex-col space-y-4">
              {mainNavLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-lg font-medium text-gray-700 hover:text-blue-500 transition-colors"
                  onClick={closeMobile}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="border-t border-gray-200 my-4" />
              
              {categoryLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-lg font-medium text-gray-700 hover:text-blue-500 transition-colors"
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
  );

  return (
    <header className="relative top-0 left-0 right-0 z-50 w-full bg-white overflow-hidden">
      {/* Backdrop blur for content behind navbar */}
      <div className="fixed top-0 left-0 right-0 h-max z-40" />
      
      {/* Desktop Search Bar */}
      <div className="hidden md:block w-full max-w-md mx-4">
        <SearchBar 
          placeholder="Search products..."
          isExpanded={isSearchExpanded}
          onToggle={toggleSearch}
        />
      </div>
      
      {/* Main Navigation Bar */}
      <div className="relative">
        <div className="mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Left: Mobile Menu Button */}
          {renderMobileMenuButton()}
          
          {/* Center: Logo */}
          {renderLogo()}
          
          {/* Desktop Navigation */}
          {renderDesktopNavigation()}
          
          {/* Right: Icons */}
          <div className="flex items-center gap-4">
            {renderMobileSearch()}
            {renderCartIcon()}
            {renderWishlistIcon()}
            {renderUserMenu()}
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        {isSearchExpanded && (
          <div className="md:hidden w-full flex justify-center items-center pb-3">
            <div className="w-full max-w-md px-4">
              <SearchBar 
                placeholder="What You looking For.." 
                isMobile 
                isExpanded={isSearchExpanded}
                onToggle={toggleSearch}
              />
            </div>
          </div>
        )}
        
        {/* Mobile Categories */}
        {!isSearchExpanded && renderMobileCategories()}
        
        {/* Desktop Categories */}
        <div className="hidden md:flex mx-auto h-14 w-full items-center justify-center px-4 sm:px-6 lg:px-8 border-t border-b border-gray-200 bg-white/80 backdrop-blur-lg">
          <nav className="flex items-center gap-6 text-sm font-medium text-primary">
            {categoryLinks.map((item) => (
              <div key={item.name} className="group relative">
                <Link
                  href={item.href}
                  className="flex items-center gap-1 text-gray-700 hover:text-blue-500 transition-colors"
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
        {isMobileOpen && renderMobileDrawer()}
      </div>
    </header>
  );
};

export default Navbar;
