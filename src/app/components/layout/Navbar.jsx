"use client";
import React, { useState, useCallback,useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { UserRound, Search, LogOut, ChevronDown, X, ShoppingCart, Heart, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LOGO_WHITE_BG } from '../../lib/constants';
import { getCurrentUser, isAuthenticated, logout as logoutUser } from '../../lib/auth';
import { useCart } from '../../stores/useCartStore';
import { useWishlist, useWishlistStore } from '../../stores/useWishlistStore';
import { openAuthDrawer } from '../../lib/ui';
import SearchBar from '../search/SearchBar';
import { FiRrHeartIcon, FiRrShoppingCartAddIcon } from '../icons';

// Navigation links
const mainNavLinks = [
  // { name: "PRODUCTS", href: "/" },
  // // { name: "BLOGS", href: "/" },
  // { name: "ABOUT US", href: "/" },
  // { name: "CONTACT US", href: "/contact" }
];

const categoryLinks = [
    {
    name: "SHOP BY PLACES",
    href: "/search",
    subcategories: [
      { name: "Living Room", href: "/search?place=living-room" },
      { name: "Bedroom", href: "/search?place=bedroom" },
      { name: "Office", href: "/search?place=office" },
    ],
  },
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
  }

];





const Navbar = () => {
  // Router
  const router = useRouter();
  
  // State
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isCategoryBarCollapsed, setIsCategoryBarCollapsed] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState(null); // 'up' | 'down' | null

  // Auth state
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);

  // Cart and wishlist contexts - use selectors for reactivity
  const { getCartCount } = useCart();
  const wishlistCount = useWishlistStore((state) => state.wishlistItems.length);

  useEffect(() => {
    // Mark as mounted after hydration
    setIsMounted(true);
    const currentUser = getCurrentUser();
    const authStatus = isAuthenticated();
    setUser(currentUser);
    setIsAuth(authStatus);
  }, []);

  // Scroll detection for category bar collapse/expand (desktop only)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Use refs to track values without causing re-renders
    let lastScrollYRef = window.scrollY;
    let scrollDirectionRef = null;
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      
      ticking = true;
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        
        // Only apply on desktop (window width >= 768px)
        if (window.innerWidth < 768) {
          if (isCategoryBarCollapsed) {
            setIsCategoryBarCollapsed(false);
          }
          lastScrollYRef = currentScrollY;
          scrollDirectionRef = null;
          ticking = false;
          return;
        }

        // Hysteresis: Different thresholds for expanding vs collapsing to prevent glitching
        const collapseThreshold = 200; // Scroll down past this to collapse
        const expandThreshold = 80;    // Scroll up past this to expand
        const minScrollDelta = 10;     // Minimum scroll delta to trigger state change
        const deadZone = 20;           // Dead zone around threshold to prevent rapid toggling
        
        const scrollDelta = currentScrollY - lastScrollYRef;
        const absScrollDelta = Math.abs(scrollDelta);

        // Ignore tiny scroll movements to prevent glitching
        if (absScrollDelta < minScrollDelta) {
          ticking = false;
          return;
        }

        // If at very top of page, always show category bar
        if (currentScrollY <= 30) {
          if (isCategoryBarCollapsed) {
            setIsCategoryBarCollapsed(false);
            scrollDirectionRef = null;
          }
          lastScrollYRef = currentScrollY;
          ticking = false;
          return;
        }

        // Hysteresis logic: use different thresholds based on current state to prevent glitching
        if (isCategoryBarCollapsed) {
          // Currently collapsed - need to scroll up past expand threshold to expand
          if (currentScrollY <= expandThreshold) {
            setIsCategoryBarCollapsed(false);
            scrollDirectionRef = 'up';
          } else if (scrollDelta < -deadZone) {
            // Scrolling up significantly
            setIsCategoryBarCollapsed(false);
            scrollDirectionRef = 'up';
          }
        } else {
          // Currently expanded - need to scroll down past collapse threshold to collapse
          if (currentScrollY >= collapseThreshold && scrollDelta > deadZone) {
            // Scrolling down significantly past threshold
            setIsCategoryBarCollapsed(true);
            scrollDirectionRef = 'down';
          }
        }

        lastScrollYRef = currentScrollY;
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Handle window resize to reset on mobile/desktop switch
    const handleResize = () => {
      if (window.innerWidth < 768) {
        if (isCategoryBarCollapsed) {
          setIsCategoryBarCollapsed(false);
        }
        scrollDirectionRef = null;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [isCategoryBarCollapsed]);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setIsAuth(false);
    router.push('/');
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
    <div className="w-full max-w-[600px]">
      <SearchBar />
    </div>
  );

 const renderUserMenu = () => {
  // Get first two letters of name for profile circle
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    } else if (user?.firstName) {
      return user.firstName.slice(0, 2).toUpperCase();
    } else if (user?.name) {
      const nameParts = user.name.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
      }
      return user.name.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="hidden md:block relative">
      {isAuth ? (
        <>
          {/* Profile Circle - Show when authenticated */}
          <button
            type="button"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-[#0B4866] text-white font-medium text-sm hover:bg-[#094058] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0B4866] focus:ring-offset-2"
            aria-label="User account"
            onClick={(e) => {
              e.stopPropagation();
              setIsAccountMenuOpen(prev => !prev);
            }}
          >
            {getInitials()}
          </button>

          {/* Dropdown Menu */}
          <div
            className={`fixed right-4 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[9000] transition-all duration-200 ${
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
          {/* Account Icon - Show when not authenticated */}
          <button
            type="button"
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
            aria-label="Sign in"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Desktop auth icon clicked');
              openAuthDrawer('login');
            }}
          >
            <UserRound size={22} className="text-gray-700" />
          </button>
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
    <header className=" shadow-sm sticky top-0 z-50 bg-white ">
      <div className="w-[100dvw] overflow-hidden h-max flex items-center justify-center relative ">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className=" justify-between items-center h-16 hidden md:flex gap-4  ">
          {/* Left side - Logo */}
          <div className="flex-shrink-0 h-full overflow-hidden">
            {renderLogo()}
          </div>
          
          {/* Center - Search Bar */}
          <div className="flex-1 flex justify-center max-w-3xl mx-8">
            {renderSearchBar()}
          </div>
          
          {/* Right side - Navigation Links and Icons */}
          <div className="flex items-center gap-6 flex-shrink-0">
            {/* Navigation Links */}
            <nav className="flex space-x-6">
              {mainNavLinks.map((item) => (
                <Link 
                  key={item.name}
                  href={item.href} 
                  className="text-gray-700 hover:text-[#0B4866] text-sm font-medium transition-colors whitespace-nowrap"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-4 border-l border-gray-200 pl-4">
                <Link href="/wishlist" className="relative text-gray-700 hover:text-[#0B4866]">
                <Heart size={22} />
                {isMounted && wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

            
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
  {/* Account */}
              <div className="relative">
                {renderUserMenu()}
              </div>
            
            
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
   {/* Mobile Navigation */}
<div className="md:hidden w-full border-b border-gray-100 bg-white">
  <div className="flex items-center justify-between h-16 px-3">
    {/* Left Section: Menu + Logo */}
    <div className="flex items-center gap-3">
      {/* Hamburger Menu */}
      <button
        onClick={toggleMobile}
        aria-label="Open menu"
        className="text-gray-700 hover:text-[#0B4866] flex-shrink-0"
      >
        <Menu size={24} />
      </button>

      {/* Logo */}
      <div className="h-10 flex items-center">
        {renderLogo()}
      </div>
    </div>

    {/* Right Section: Search + Cart + Wishlist */}
    <div className="flex items-center gap-4">
      <button
        className="text-gray-600 hover:text-[#0B4866]"
        onClick={toggleSearch}
        aria-label="Search"
      >
        <Search size={22} />
      </button>

      <Link
        href="/cart"
        className="relative text-gray-600 hover:text-[#0B4866]"
        aria-label="View cart"
      >
        <ShoppingCart size={22} />
        {isMounted && getCartCount() > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {getCartCount()}
          </span>
        )}
      </Link>

      <Link
        href="/wishlist"
        className="relative text-gray-600 hover:text-[#0B4866]"
        aria-label="Wishlist"
      >
        <Heart size={22} />
        {isMounted && wishlistCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {wishlistCount}
          </span>
        )}
      </Link>
    </div>
  </div>

  {/* Mobile Search Bar */}
  {isSearchExpanded && (
    <div className="w-full flex justify-center items-center py-2 px-3 border-t border-gray-100">
      <SearchBar
        placeholder="Search products..."
        isMobile
        isExpanded={isSearchExpanded}
        onToggle={toggleSearch}
      />
    </div>
  )}
</div>




        
      </div>
      
      {/* Desktop Categories */}
     <div 
        className={`hidden md:flex border-t border-gray-100 w-full relative z-50 transition-all duration-300 ease-in-out ${
          isCategoryBarCollapsed ? 'max-h-0 opacity-0 border-t-0 overflow-hidden' : 'max-h-16 opacity-100 overflow-visible'
        }`}
      >
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
    <nav className={`flex space-x-8 py-2 relative transition-transform duration-300 ease-in-out ${
      isCategoryBarCollapsed ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
    }`}>
      {categoryLinks.map((item) => (
        <div key={item.name} className="group relative z-[9000]">
          <Link
            href={item.href}
            className="flex items-center text-sm font-medium text-gray-700 hover:text-[#003B8E] py-2 relative z-[9000]"
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
            <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-xl opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto z-[9000]">
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
