"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Heart, ShoppingCart, ChevronDown } from "lucide-react";

const NavbarDesktop = ({
  mainNavLinks,
  categoryLinks,
  renderLogo,
  renderSearchBar,
  renderUserMenu,
  wishlistCount,
  cartCount,
  isMounted,
  isCategoryBarCollapsed,
}) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState(null);
  const itemRefs = useRef({});
  const [isMountedClient, setIsMountedClient] = useState(false);

  useEffect(() => {
    setIsMountedClient(true);
  }, []);

  // Update dropdown position when hovered item changes
  const updatePosition = useCallback(() => {
    if (hoveredItem && itemRefs.current[hoveredItem]) {
      const rect = itemRefs.current[hoveredItem].getBoundingClientRect();
      // For fixed positioning, use viewport coordinates directly (no scroll offset needed)
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  }, [hoveredItem]);

  useEffect(() => {
    if (hoveredItem) {
      // Update position immediately
      updatePosition();
    }
  }, [hoveredItem, updatePosition]);

  // Update position on scroll and resize
  useEffect(() => {
    if (!hoveredItem) return;

    const handleUpdate = () => {
      updatePosition();
    };

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [hoveredItem, updatePosition]);

  // Keep track of hover state for dropdown
  const [isDropdownHovered, setIsDropdownHovered] = useState(false);
  const hideTimeoutRef = useRef(null);

  // Clear timeout helper
  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  // Hide dropdown with delay
  const scheduleHide = () => {
    clearHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
      setIsDropdownHovered(false);
      setDropdownPosition(null);
    }, 200);
  };

  return (
    <>
      {/* --- DESKTOP NAVBAR (hidden below md) --- */}
      <div className="hidden md:block border-b border-gray-100 bg-white w-full overflow-x-hidden overflow-y-visible relative z-[100]" style={{ zIndex: 100 }}>
        <div
          className="
            mx-auto 
            grid 
            w-full 
            max-w-[100vw] 
            grid-cols-[1fr_auto_1fr] 
            items-center 
            gap-6 
            px-4 
            py-4 
            lg:px-8
          "
        >
          {/* Left: Logo */}
          <div className="flex justify-start items-center">
            {renderLogo()}
          </div>

          {/* Center: Search */}
          <div className="flex justify-center w-[60dvw]  mx-auto">
            {renderSearchBar()}
          </div>

          {/* Right: Nav + Icons */}
          <div className="flex justify-end items-center gap-6">
            <nav className="flex items-center space-x-6">
              {mainNavLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="whitespace-nowrap text-sm font-medium text-gray-700 transition-colors hover:text-[#0B4866]"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4 border-l border-gray-200 pl-4">
              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative text-gray-700 transition-colors hover:text-[#0B4866]"
              >
                <Heart size={22} />
                {isMounted && wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative text-gray-700 transition-colors hover:text-[#0B4866]"
                aria-label="View cart"
              >
                <ShoppingCart size={22} />
                {isMounted && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <div className="relative">{renderUserMenu()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- CATEGORY BAR (also hidden below md) --- */}
      <div
        className={`hidden md:flex border-t border-gray-100 w-full relative z-[50] transition-all duration-300 ease-in-out bg-white ${
          isCategoryBarCollapsed
            ? "max-h-0 opacity-0 border-t-0 overflow-hidden"
            : "max-h-16 opacity-100 overflow-visible"
        }`}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 w-full flex items-center justify-center no-scrollbar overflow-x-auto overflow-y-visible">
          <nav
            className={`flex space-x-6 sm:space-x-8 py-2 min-w-max transition-transform duration-300 ease-in-out ${
              isCategoryBarCollapsed
                ? "-translate-y-full opacity-0"
                : "translate-y-0 opacity-100"
            }`}
          >
            {categoryLinks.map((item) => (
              <div
                key={item.name}
                className="group relative"
                ref={(el) => {
                  if (el) itemRefs.current[item.name] = el;
                }}
                onMouseEnter={() => {
                  clearHideTimeout();
                  if (item.subcategories?.length > 0) {
                    setHoveredItem(item.name);
                    setIsDropdownHovered(false);
                  }
                }}
                onMouseLeave={() => {
                  scheduleHide();
                }}
              >
                <Link
                  href={item.href}
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-[#003B8E] py-2"
                >
                  {item.name}
                  {item.subcategories?.length > 0 && (
                    <ChevronDown
                      size={16}
                      className={`ml-1 transition-transform duration-200 ${
                        hoveredItem === item.name ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </Link>

              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Dropdown rendered at document root using portal */}
      {isMountedClient && typeof document !== 'undefined' && (hoveredItem || isDropdownHovered) && dropdownPosition && (() => {
        const item = categoryLinks.find((i) => i.name === hoveredItem);
        if (!item?.subcategories?.length) return null;

        return createPortal(
          <div
            className="fixed w-48 bg-white border border-gray-200 rounded-md shadow-xl"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              zIndex: 10050,
            }}
            onMouseEnter={() => {
              clearHideTimeout();
              setIsDropdownHovered(true);
            }}
            onMouseLeave={() => {
              scheduleHide();
            }}
          >
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
          </div>,
          document.body
        );
      })()}
    </>
  );
};

export default NavbarDesktop;
