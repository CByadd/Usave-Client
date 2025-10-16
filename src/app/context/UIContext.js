"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';

const UIContext = createContext();

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within a UIProvider');
  return context;
};

export const UIProvider = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const openLogin = useCallback(() => setIsLoginOpen(true), []);
  const closeLogin = useCallback(() => setIsLoginOpen(false), []);

  const openRegister = useCallback(() => setIsRegisterOpen(true), []);
  const closeRegister = useCallback(() => setIsRegisterOpen(false), []);
  
  const openAccount = useCallback(() => setIsAccountOpen(true), []);
  const closeAccount = useCallback(() => setIsAccountOpen(false), []);

  const value = {
    isCartOpen,
    openCart,
    closeCart,
    isLoginOpen,
    openLogin,
    closeLogin,
    isRegisterOpen,
    openRegister,
    closeRegister,
    isAccountOpen,
    openAccount,
    closeAccount,
  };

  return (
    <UIContext.Provider value={value}>{children}</UIContext.Provider>
  );
};


