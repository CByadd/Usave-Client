"use client";
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

const UIContext = createContext(null);

// Default values for SSR/prerendering
const defaultUIValue = {
  isLoginModalOpen: false,
  isRegisterModalOpen: false,
  isCartDrawerOpen: false,
  isWishlistDrawerOpen: false,
  isMobileMenuOpen: false,
  isAuthDrawerOpen: false,
  authDrawerTab: 'login',
  openLoginModal: () => {},
  closeLoginModal: () => {},
  openRegisterModal: () => {},
  closeRegisterModal: () => {},
  openCartDrawer: () => {},
  closeCartDrawer: () => {},
  openWishlistDrawer: () => {},
  closeWishlistDrawer: () => {},
  toggleMobileMenu: () => {},
  closeMobileMenu: () => {},
  openAuthDrawer: () => {},
  closeAuthDrawer: () => {},
  setAuthDrawerTab: () => {},
};

export const useUI = () => {
  const context = useContext(UIContext);
  // Return default values ONLY during SSR/prerendering when context isn't available
  // On the client, context should always be available via Providers
  if (!context) {
    if (typeof window === 'undefined') {
      // During SSR, return defaults to prevent build errors
      return defaultUIValue;
    }
    // On client, throw error to help debug - context should always be available
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

export const UIProvider = ({ children }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isWishlistDrawerOpen, setIsWishlistDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);
  const [authDrawerTab, setAuthDrawerTab] = useState('login');

  const openAuthDrawer = useCallback((tab = 'login') => {
    setAuthDrawerTab(tab);
    setIsAuthDrawerOpen(true);
    // Close any other auth-related modals
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
  }, []);

  const closeAuthDrawer = useCallback(() => {
    setIsAuthDrawerOpen(false);
  }, []);

  const setAuthDrawerTabState = useCallback((tab) => {
    setAuthDrawerTab(tab);
  }, []);

  const openLoginModal = useCallback(() => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
    // Close auth drawer if open
    setIsAuthDrawerOpen(false);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  const openRegisterModal = useCallback(() => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
    // Close auth drawer if open
    setIsAuthDrawerOpen(false);
  }, []);

  const closeRegisterModal = useCallback(() => {
    setIsRegisterModalOpen(false);
  }, []);

  const openCartDrawer = useCallback(() => {
    setIsCartDrawerOpen(true);
  }, []);

  const closeCartDrawer = useCallback(() => {
    setIsCartDrawerOpen(false);
  }, []);

  const openWishlistDrawer = useCallback(() => {
    setIsWishlistDrawerOpen(true);
  }, []);

  const closeWishlistDrawer = useCallback(() => {
    setIsWishlistDrawerOpen(false);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const value = useMemo(() => ({
    // Modal states
    isLoginModalOpen,
    isRegisterModalOpen,
    isCartDrawerOpen,
    isWishlistDrawerOpen,
    isMobileMenuOpen,
    isAuthDrawerOpen,
    authDrawerTab,
    
    // Modal handlers
    openLoginModal,
    closeLoginModal,
    openRegisterModal,
    closeRegisterModal,
    openCartDrawer,
    closeCartDrawer,
    openWishlistDrawer,
    closeWishlistDrawer,
    toggleMobileMenu,
    closeMobileMenu,
    openAuthDrawer,
    closeAuthDrawer,
    setAuthDrawerTab: setAuthDrawerTabState,
  }), [
    isLoginModalOpen,
    isRegisterModalOpen,
    isCartDrawerOpen,
    isWishlistDrawerOpen,
    isMobileMenuOpen,
    isAuthDrawerOpen,
    authDrawerTab,
    openLoginModal,
    closeLoginModal,
    openRegisterModal,
    closeRegisterModal,
    openCartDrawer,
    closeCartDrawer,
    openWishlistDrawer,
    closeWishlistDrawer,
    toggleMobileMenu,
    closeMobileMenu,
    openAuthDrawer,
    closeAuthDrawer,
    setAuthDrawerTabState,
  ]);

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};