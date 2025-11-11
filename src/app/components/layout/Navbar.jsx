"use client";
import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { UserRound, LogOut } from 'lucide-react';
import { LOGO_WHITE_BG } from '../../lib/constants';
import { useAuthStore } from '../../stores/useAuthStore';
import { logout as logoutUser } from '../../lib/auth';
import { useCart } from '../../stores/useCartStore';
import { useWishlistStore } from '../../stores/useWishlistStore';
import { openAuthDrawer } from '../../lib/ui';
import SearchBar from '../search/SearchBar';
import NavbarDesktop from './NavbarDesktop';
import NavbarMobile from './NavbarMobile';

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
  const user = useAuthStore((state) => state.user);
  const isAuth = useAuthStore((state) => state.isAuthenticated);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  // Cart and wishlist contexts - use selectors for reactivity
  const { getCartCount } = useCart();
  const wishlistCount = useWishlistStore((state) => state.wishlistItems.length);

  useEffect(() => {
    setIsMounted(true);
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuth) {
      setIsAccountMenuOpen(false);
    }
  }, [isAuth]);

  useEffect(() => {
    if (!isAuth && isAccountMenuOpen) {
      setIsAccountMenuOpen(false);
    }
  }, [isAuth, isAccountMenuOpen]);

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
    router.push('/');
  };

  // Handlers
  const toggleMobile = useCallback(() => setIsMobileOpen(prev => !prev), []);
  const closeMobile = useCallback(() => setIsMobileOpen(false), []);
  const toggleSearch = useCallback(() => setIsSearchExpanded(prev => !prev), []);
  const closeAccountMenu = useCallback(() => setIsAccountMenuOpen(false), []);

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
    <div className="flex items-center gap-2 h-10 overflow-hidden">
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

  const renderSearchBar = useCallback(() => (
    <div className="w-full max-w-[780px] lg:max-w-[840px]">
      <SearchBar />
    </div>
  ), []);

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



  const cartCount = getCartCount();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <NavbarDesktop
        mainNavLinks={mainNavLinks}
        categoryLinks={categoryLinks}
        renderLogo={renderLogo}
        renderSearchBar={renderSearchBar}
        renderUserMenu={renderUserMenu}
        wishlistCount={wishlistCount}
        cartCount={cartCount}
        isMounted={isMounted}
        isCategoryBarCollapsed={isCategoryBarCollapsed}
      />

      <NavbarMobile
        mainNavLinks={mainNavLinks}
        categoryLinks={categoryLinks}
        renderLogo={renderLogo}
        isMobileOpen={isMobileOpen}
        toggleMobile={toggleMobile}
        closeMobileMenu={closeMobile}
        isSearchExpanded={isSearchExpanded}
        toggleSearch={toggleSearch}
        wishlistCount={wishlistCount}
        cartCount={cartCount}
        isMounted={isMounted}
        isAuth={isAuth}
        user={user}
        handleLogout={handleLogout}
        openAuthDrawer={openAuthDrawer}
        closeAccountMenu={closeAccountMenu}
      />
    </header>
  );
};

export default Navbar;
