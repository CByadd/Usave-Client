"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import drawers to ensure they only load on client
const AuthDrawer = dynamic(() => import('./auth/AuthDrawer'), {
  ssr: false,
  loading: () => null
});

const CartDrawer = dynamic(() => import('./cart/CartDrawer'), {
  ssr: false,
  loading: () => null
});

const LoggingToggle = dynamic(() => import('./debug/LoggingToggle'), {
  ssr: false,
  loading: () => null
});

export default function ClientOnlyDrawers() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only render drawers on client side after mount
  if (!isMounted) {
    return null;
  }

  return (
    <>
      <AuthDrawer />
      <CartDrawer />
      <LoggingToggle />
    </>
  );
}
