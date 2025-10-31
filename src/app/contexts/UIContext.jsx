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
  const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);
  const [authDrawerTab, setAuthDrawerTab] = useState('login');

  const openAuthDrawer = (tab = 'login') => {
    setAuthDrawerTab(tab);
    setIsAuthDrawerOpen(true);
    // Close any other auth-related modals
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
  };

  const closeAuthDrawer = () => {
    setIsAuthDrawerOpen(false);
  };

  const setAuthDrawerTabState = (tab) => {
    setAuthDrawerTab(tab);
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
    // Close auth drawer if open
    setIsAuthDrawerOpen(false);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const openRegisterModal = () => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
    // Close auth drawer if open
    setIsAuthDrawerOpen(false);
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

  return (
    <UIContext.Provider
      value={{
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
      }}
    >
      {children}
    </UIContext.Provider>
  );
};