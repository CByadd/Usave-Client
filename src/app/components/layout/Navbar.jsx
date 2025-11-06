"use client";
import React, { useState, useCallback,useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserRound, Search, LogOut, ChevronDown, X, ShoppingCart, Heart, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LOGO_WHITE_BG } from '../../lib/constants';
import { getCurrentUser, isAuthenticated, logout as logoutUser } from '../../lib/auth';
import { useCart } from '../../stores/useCartStore';
import { useWishlist } from '../../stores/useWishlistStore';
import { openAuthDrawer } from '../../lib/ui';
import SearchBar from '../search/SearchBar';
import { FiRrHeartIcon, FiRrShoppingCartAddIcon } from '../icons';

// Navigation links
const mainNavLinks = [
  { name: "PRODUCTS", href: "/" },
  // { name: "BLOGS", href: "/" },
  { name: "ABOUT US", href: "/" },
  { name: "CONTACT US", href: "/contact" }
];

const categoryLinks = [
  {
    name: "LIVING",
    href: "/categories/living",
    subcategories: [
      { name: "Sofas", href: "/categories/living/sofas" },
      { name: "Chairs", href: "/categories/living/chairs" },
      { name: "Tables", href: "/categories/living/tables" },
    ],
  },
  {
    name: "DINING",
    href: "/categories/dining",
    subcategories: [
      { name: "Dining Sets", href: "/categories/dining/dining-sets" },
      { name: "Chairs", href: "/categories/dining/chairs" },
      { name: "Storage Units", href: "/categories/dining/storage" },
    ],
  },
  {
    name: "BEDROOM",
    href: "/categories/bedroom",
    subcategories: [
      { name: "Beds", href: "/categories/bedroom/beds" },
      { name: "Wardrobes", href: "/categories/bedroom/wardrobes" },
      { name: "Dressers", href: "/categories/bedroom/dressers" },
    ],
  },
  {
    name: "KITCHEN",
    href: "/categories/kitchen",
    subcategories: [
      { name: "Cookware", href: "/categories/kitchen/cookware" },
      { name: "Storage", href: "/categories/kitchen/storage" },
      { name: "Appliances", href: "/categories/kitchen/appliances" },
    ],
  },
  {
    name: "ELECTRONICS",
    href: "/categories/electronics",
    subcategories: [
      { name: "TVs", href: "/categories/electronics/tv" },
      { name: "Speakers", href: "/categories/electronics/speakers" },
      { name: "Laptops", href: "/categories/electronics/laptops" },
    ],
  },
  {
    name: "SHOP BY PLACES",
    href: "/search",
    subcategories: [
      { name: "Living Room", href: "/search?place=living-room" },
      { name: "Bedroom", href: "/search?place=bedroom" },
      { name: "Office", href: "/search?place=office" },
    ],
  },
];





const Navbar = () => {
  // State
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Auth state
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);

  // Cart and wishlist contexts
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();

  useEffect(() => {
    // Mark as mounted after hydration
    setIsMounted(true);
    const currentUser = getCurrentUser();
    const authStatus = isAuthenticated();
    setUser(currentUser);
    setIsAuth(authStatus);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setIsAuth(false);
    window.location.reload();
  };

  // Handlers
  const toggleMobile = useCallback(() => setIsMobileOpen(prev => !prev), []);
  const closeMobile = useCallback(() => setIsMobileOpen(false), []);
  const toggleSearch = useCallback(() => setIsSearchExpanded(prev => !prev), []);
  const closeSearch = useCallback(() => setIsSearchExpanded(false), []);

  // Render Functions
  // const renderMobileMenuButton = () => (
  //   <button
  //     className="md:hidden p-2 -ml-2 text-primary hover:text-blue-500 transition-colors"
  //     aria-label="Toggle menu"
  //     onClick={toggleMobile}
  //   >
  //     <span className="block h-0.5 w-5 bg-current mb-1" />
  //     <span className="block h-0.5 w-5 bg-current mb-1" />
  //     <span className="block h-0.5 w-5 bg-current" />
  //   </button>
  // );

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
  );

  // const renderDesktopNavigation = () => (
  //   <div className="hidden md:flex items-center justify-between w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  //     <div className="flex items-center space-x-8">
  //       {renderLogo()}
  //       <nav className="hidden md:flex space-x-8">
  //         {mainNavLinks.map((item) => (
  //           <Link 
  //             key={item.name}
  //             href={item.href} 
  //             className="text-gray-700 hover:text-blue-600 text-sm font-medium transition-colors"
  //           >
  //             {item.name}
  //           </Link>
  //         ))}
  //       </nav>
  //     </div>
      
  //   </div>
  // );

  // const renderMobileSearch = () => (
  //   <div className="relative z-[1000]">
  //     <button 
  //       className="md:hidden hover:text-blue-500 transition-colors relative z-[1000]" 
  //       aria-label="Search"
  //       onClick={toggleSearch}
  //     >
  //       <Search size={20} />
  //     </button>
  //     {isSearchExpanded && (
  //       <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex z-[60]">
  //         <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-100 p-3">
  //           <SearchBar 
  //             isMobile 
  //             isExpanded={isSearchExpanded}
  //             onToggle={toggleSearch}
  //           />
  //         </div>
  //       </div>
  //     )}
  //   </div>
  // );

  const renderSearchBar = () => (
    <div className="hidden md:flex flex-1 w-[600px] mx-4">
      <SearchBar />
    </div>
  );

 const renderUserMenu = () => {
  return (
    <div className="hidden md:block relative">
      {isAuth ? (
        <>
          {/* Account Icon Button - Only show when authenticated */}
          <button
            type="button"
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
            aria-label="User account"
            onClick={(e) => {
              e.stopPropagation();
              setIsAccountMenuOpen(prev => !prev);
            }}
          >
            <UserRound size={20} className="text-gray-700" />
          </button>

          {/* Dropdown Menu */}
          <div
            className={`fixed right-4 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[1000] transition-all duration-200 ${
              isAccountMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}
          >
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm text-gray-600 font-medium">
                {user?.firstName || user?.name || 'User'}
              </p>
              {user?.email && (
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              )}
            </div>
            <Link
              href="/account"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsAccountMenuOpen(false)}
            >
              My Account
            </Link>
            <Link
              href="/orders"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsAccountMenuOpen(false)}
            >
              My Orders
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setIsAccountMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
            >
              <LogOut size={16} className="mr-2" />
              Sign Out
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Login/Sign Up Button - Show when not authenticated */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Desktop auth login clicked');
                openAuthDrawer('login');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#0B4866] transition-colors"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Desktop auth register clicked');
                openAuthDrawer('register');
                if (typeof document !== 'undefined') {
                  try { document.body.dispatchEvent(new CustomEvent('usave:openAuth', { detail: { tab: 'register' } })); } catch {}
                }
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-[#0B4866] hover:bg-[#094058] rounded-md transition-colors"
            >
              Sign Up
            </button>
          </div>
        </>
      )}
    </div>
  );
};


  // const renderMobileCategories = () => (
  //   <div className="md:hidden w-full z-50">
  //     <div className="overflow-x-auto py-2 px-4">
  //       <div className="flex space-x-4">
  //         {categoryLinks.map((item) => (
  //           <Link
  //             key={item.name}
  //             href={item.href}
  //             className="whitespace-nowrap text-sm font-medium text-gray-700 hover:text-blue-500 px-3 py-1 rounded-full bg-gray-100"
  //             onClick={closeMobile}
  //           >
  //             {item.name}
  //           </Link>
  //         ))}
  //       </div>
  //     </div>
  //   </div>
  // );

  const renderMobileDrawer = () => (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[20]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              setIsMobileOpen(false);
              setIsAccountMenuOpen(false);
            }}
            aria-hidden="true"
          />
          
          <div className="fixed inset-y-0 left-0 max-w-full flex z-[60]">
            <motion.div 
              className="w-screen max-w-xs"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
            >
            <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
              <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Menu</h2>
                  <button
                    type="button"
                    className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="mt-6">
                  <nav className="grid gap-y-6">
                    {mainNavLinks.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center p-2 -m-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md"
                        onClick={() => {
                          setIsMobileOpen(false);
                          setIsAccountMenuOpen(false);
                        }}
                      >
                        {item.name}
                      </Link>
                    ))}
                    
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Categories</h3>
                      <div className="space-y-1">
                        {categoryLinks.map((item) => (
                          <div key={item.name} className="space-y-1">
                            <Link
                              href={item.href}
                              className="flex items-center justify-between p-2 -m-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md group"
                              onClick={() => {
                                if (!item.subcategories || item.subcategories.length === 0) {
                                  setIsMobileOpen(false);
                                  setIsAccountMenuOpen(false);
                                }
                              }}
                            >
                              <span>{item.name}</span>
                              {item.subcategories && item.subcategories.length > 0 && (
                                <ChevronDown
                                  size={16}
                                  className="ml-2 transition-transform duration-200 group-hover:rotate-180"
                                />
                              )}
                            </Link>
                            {item.subcategories && item.subcategories.length > 0 && (
                              <div className="ml-4 space-y-1">
                                {item.subcategories.map((sub) => (
                                  <Link
                                    key={sub.name}
                                    href={sub.href}
                                    className="flex items-center p-2 -m-2 text-xs text-gray-500 hover:bg-gray-50 hover:text-[#0B4866] rounded-md"
                                    onClick={() => {
                                      setIsMobileOpen(false);
                                      setIsAccountMenuOpen(false);
                                    }}
                                  >
                                    {sub.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </nav>
                </div>
              </div>
              
              <div className="border-t border-gray-200 py-6 px-4 space-y-6">
                {isAuth ? (
                  <div className="space-y-4">
                    <Link
                      href="/account"
                      className="flex items-center text-base font-medium text-gray-900 hover:text-[#0B4866]"
                      onClick={() => {
                        setIsMobileOpen(false);
                        setIsAccountMenuOpen(false);
                      }}
                    >
                      My Account
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileOpen(false);
                        setIsAccountMenuOpen(false);
                      }}
                      className="flex items-center text-base font-medium text-red-600 hover:text-red-700"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Auth drawer open clicked, openAuthDrawer:', typeof openAuthDrawer);
                openAuthDrawer('login');
                setIsMobileOpen(false);
                setIsAccountMenuOpen(false);
              }}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0B4866] hover:bg-[#094058] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B4866]"
            >
              Sign In
            </button>
            <p className="text-center text-sm text-gray-600">
              New customer?{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Auth drawer register clicked');
                  openAuthDrawer('register');
                  setIsMobileOpen(false);
                  setIsAccountMenuOpen(false);
                }}
                className="text-[#0B4866] font-medium hover:text-[#094058]"
              >
                Start here
              </button>
            </p>
                  </div>
                )}
              </div>
            </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="w-full max-w-[95dvw] overflow-visible h-max flex items-center justify-center relative ">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className=" justify-between items-center h-16 hidden md:flex">
          {/* Left side - Logo and Navigation Links */}
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0 h-full">
              {renderLogo()}
            </div>
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center justify-between gap-6 ml-8">
              {/* Center - Search Bar */}
          {renderSearchBar()}
              <nav className="ml-8 flex space-x-6">
                {mainNavLinks.map((item) => (
                  <Link 
                    key={item.name}
                    href={item.href} 
                    className="text-gray-700 hover:text-[#0B4866] text-sm font-medium transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

               {/* Cart */}
  <Link 
    href="/cart"
    className="relative text-gray-700 hover:text-[#0B4866] cursor-pointer"
    aria-label="View cart"
  >
    <ShoppingCart size={22} />
    {isMounted && getCartCount() > 0 && (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
        {getCartCount()}
      </span>
    )}
  </Link>

                {/* Cart */}
          <span className='flex items-center justify-center gap-2'>
             <Link href="/wishlist" className="relative text-gray-700 hover:text-[#0B4866]">
    <Heart size={22} />
    {isMounted && getWishlistCount() > 0 && (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
        {getWishlistCount()}
      </span>
    )}
  </Link>

 

  {/* Account */}
  <div className="relative">
    {renderUserMenu()}
  </div>
          </span>
            </div>
          </div>
          
          
          
          {/* Right side - Icons */}
          <div className="flex items-center space-x-4">
            {/* Search Icon (Mobile) */}
            <div className="md:hidden">
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={toggleSearch}
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              
              {/* Mobile Search Bar (Expanded) */}
              {isSearchExpanded && (
                <div className="fixed inset-0 bg-white z-50 p-4">
                  <div className="flex items-center">
                    <button 
                      onClick={toggleSearch}
                      className="mr-2 text-gray-500"
                      aria-label="Close search"
                    >
                      <X size={20} />
                    </button>
                    <div className="flex-1">
                      <SearchBar 
                        isMobile
                        autoFocus
                        onSearch={() => {
                          toggleSearch();
                          closeMobile();
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
          
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-gray-500 hover:text-gray-700"
              onClick={toggleMobile}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
   <div className="md:hidden">
  <div className="mx-auto flex h-16  items-center justify-center px-4 sm:px-6 lg:px-8  w-screen">
    {/* Mobile Navbar Row */}
    <div className="flex items-center justify-between w-full max-w-[380px]">
      {/* Left: Mobile Menu Button */}
      <button 
        className="text-gray-600 hover:text-[#0B4866] flex-shrink-0"
        onClick={toggleMobile}
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {/* Center: Logo */}
      <div className="flex-1 flex justify-center items-center absolute left-0 right-0 pointer-events-none h-full">
        <div className="pointer-events-auto h-full overflow-hidden">
          {renderLogo()}
        </div>
      </div>

      {/* Right: Icons (Search + Cart) */}
      <div className="flex items-center justify-end space-x-5">
        <button 
          className="text-gray-600 hover:text-[#0B4866]"
          onClick={toggleSearch}
          aria-label="Search"
        >
          <Search size={22} />
        </button>

        <Link
          href="/cart"
          className="relative text-gray-600 hover:text-[#0B4866] flex items-center"
          aria-label="View cart"
        >
          <ShoppingCart size={22} />
          {isMounted && getCartCount() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {getCartCount()}
            </span>
          )}
        </Link>

             <Link href="/wishlist" className="relative text-gray-700 hover:text-[#0B4866]">
    <Heart size={22} />
    {isMounted && getWishlistCount() > 0 && (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
        {getWishlistCount()}
      </span>
    )}
  </Link>
      </div>
    </div>
  </div>

        
        {/* Mobile Search Bar */}
        {isSearchExpanded && (
          <div className="w-full flex justify-center items-center py-2 px-4 border-t border-gray-100">
            <div className="w-full">
              <SearchBar 
                placeholder="Search products..." 
                isMobile 
                isExpanded={isSearchExpanded}
                onToggle={toggleSearch}
              />
            </div>
          </div>
        )}
        
        {/* Mobile Categories */}
        {/* {!isSearchExpanded && renderMobileCategories()} */}
        </div>



        
      </div>
      
      {/* Desktop Categories */}
     <div className="hidden md:flex border-t border-gray-100 w-full relative z-40">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <nav className="flex space-x-8 py-2 relative">
      {categoryLinks.map((item) => (
        <div key={item.name} className="group relative">
          <Link
            href={item.href}
            className="flex items-center text-sm font-medium text-gray-700 hover:text-[#003B8E] py-2"
          >
            {item.name}
            {item.subcategories && item.subcategories.length > 0 && (
              <ChevronDown
                size={16}
                className="ml-1 transition-transform duration-200 group-hover:rotate-180"
              />
            )}
          </Link>

          {/* Dropdown */}
          {item.subcategories && item.subcategories.length > 0 && (
            <div className="absolute left-0 top-full mt-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto z-[1000]">
              <ul className="py-2">
                {item.subcategories.map((sub) => (
                  <li key={sub.name}>
                    <Link
                      href={sub.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#0B4866] transition-colors"
                    >
                      {sub.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </nav>
  </div>
</div>

      
      {/* Mobile Drawer */}
      {isMobileOpen && renderMobileDrawer()}
    </header>
  );
};

export default Navbar;
