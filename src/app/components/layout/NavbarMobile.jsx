"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  Search,
  ShoppingCart,
  Heart,
  X,
  ChevronDown,
  LogOut,
} from "lucide-react";
import SearchBar from "../search/SearchBar";

const NavbarMobile = ({
  mainNavLinks,
  categoryLinks,
  renderLogo,
  isMobileOpen,
  toggleMobile,
  closeMobileMenu,
  isSearchExpanded,
  toggleSearch,
  wishlistCount,
  cartCount,
  isMounted,
  isAuth,
  user,
  handleLogout,
  openAuthDrawer,
  closeAccountMenu,
}) => {
  const userName = useMemo(() => {
    if (!user) return "User";
    return user.firstName || user.name || "User";
  }, [user]);

  const closeAll = () => {
    closeMobileMenu();
    closeAccountMenu();
  };

  return (
    <div className="border-b border-gray-100 md:hidden">
      <div className="relative mx-auto flex h-16 w-full max-w-7xl items-center px-3 sm:px-4">
        <button
          onClick={toggleMobile}
          aria-label="Open menu"
          className="relative z-10 flex-shrink-0 text-gray-700 transition-colors hover:text-[#0B4866]"
        >
          <Menu size={24} />
        </button>

        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="pointer-events-auto flex items-center ">
            {renderLogo()}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <button
            className="text-gray-600 transition-colors hover:text-[#0B4866]"
            onClick={toggleSearch}
            aria-label="Search"
          >
            <Search size={22} />
          </button>

          <Link
            href="/cart"
            className="relative text-gray-600 transition-colors hover:text-[#0B4866]"
            aria-label="View cart"
            onClick={closeAll}
          >
            <ShoppingCart size={22} />
            {isMounted && cartCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {cartCount}
              </span>
            )}
          </Link>

          <Link
            href="/wishlist"
            className="relative text-gray-600 transition-colors hover:text-[#0B4866]"
            aria-label="Wishlist"
            onClick={closeAll}
          >
            <Heart size={22} />
            {isMounted && wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {wishlistCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {isSearchExpanded && (
        <div className="mx-auto flex w-full max-w-7xl items-center justify-center border-t border-gray-100 py-2 px-3 sm:px-4">
          <SearchBar
            placeholder="Search products..."
            isMobile
            isExpanded={isSearchExpanded}
            onToggle={toggleSearch}
          />
        </div>
      )}

      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-[100] overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[20]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={closeAll}
                aria-hidden="true"
              />

              <div className="fixed inset-y-0 left-0 max-w-full flex z-[60]">
                <motion.div
                  className="w-screen max-w-xs"
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                >
                  <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
                    <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <h2 className="text-lg font-medium text-gray-900">Menu</h2>
                        <button
                          type="button"
                          className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                          onClick={closeAll}
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
                              onClick={closeAll}
                            >
                              {item.name}
                            </Link>
                          ))}

                          <div className="pt-4 border-t border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500 mb-2">
                              Categories
                            </h3>
                            <div className="space-y-1">
                              {categoryLinks.map((item) => (
                                <div key={item.name} className="space-y-1">
                                  <Link
                                    href={item.href}
                                    className="flex items-center justify-between p-2 -m-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md group"
                                    onClick={() => {
                                      if (
                                        !item.subcategories ||
                                        item.subcategories.length === 0
                                      ) {
                                        closeAll();
                                      }
                                    }}
                                  >
                                    <span>{item.name}</span>
                                    {item.subcategories &&
                                      item.subcategories.length > 0 && (
                                        <ChevronDown
                                          size={16}
                                          className="ml-2 transition-transform duration-200 group-hover:rotate-180"
                                        />
                                      )}
                                  </Link>
                                  {item.subcategories &&
                                    item.subcategories.length > 0 && (
                                      <div className="ml-4 space-y-1">
                                        {item.subcategories.map((sub) => (
                                          <Link
                                            key={sub.name}
                                            href={sub.href}
                                            className="flex items-center p-2 -m-2 text-xs text-gray-500 hover:bg-gray-50 hover:text-[#0B4866] rounded-md"
                                            onClick={closeAll}
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
                          <p className="text-sm text-gray-600">
                            Signed in as{" "}
                            <span className="font-medium text-gray-800">
                              {userName}
                            </span>
                          </p>
                          <Link
                            href="/account"
                            className="flex items-center text-base font-medium text-gray-900 hover:text-[#0B4866]"
                            onClick={closeAll}
                          >
                            My Account
                          </Link>
                          <Link
                            href="/orders"
                            className="flex items-center text-base font-medium text-gray-900 hover:text-[#0B4866]"
                            onClick={closeAll}
                          >
                            My Orders
                          </Link>
                          <button
                            onClick={() => {
                              handleLogout();
                              closeAll();
                            }}
                            className="flex items-center text-base font-medium text-red-600 hover:text-red-700"
                          >
                            <LogOut size={18} className="mr-2" />
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
                              openAuthDrawer("login");
                              closeAll();
                            }}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0B4866] hover:bg-[#094058] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B4866]"
                          >
                            Sign In
                          </button>
                          <p className="text-center text-sm text-gray-600">
                            New customer?{" "}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openAuthDrawer("register");
                                closeAll();
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
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavbarMobile;




