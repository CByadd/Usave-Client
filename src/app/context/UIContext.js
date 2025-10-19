"use client";
import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
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

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const openRegisterModal = () => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
  };

  const closeRegisterModal = () => {
    setIsRegisterModalOpen(false);
  };

  const openCartDrawer = () => {
    setIsCartDrawerOpen(true);
  };

  const closeCartDrawer = () => {
    setIsCartDrawerOpen(false);
  };

  const openWishlistDrawer = () => {
    setIsWishlistDrawerOpen(true);
  };

  const closeWishlistDrawer = () => {
    setIsWishlistDrawerOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const value = {
    // Modal states
    isLoginModalOpen,
    isRegisterModalOpen,
    isCartDrawerOpen,
    isWishlistDrawerOpen,
    isMobileMenuOpen,
    
    // Modal actions
    openLoginModal,
    closeLoginModal,
    openRegisterModal,
    closeRegisterModal,
    openCartDrawer,
    closeCartDrawer,
    openWishlistDrawer,
    closeWishlistDrawer,
    toggleMobileMenu,
    closeMobileMenu
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};