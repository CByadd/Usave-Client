"use client";

import { useEffect } from 'react';
import { useCartStore } from '../../stores/useCartStore';
import { isAuthenticated } from '../../lib/auth';

export default function CartInitializer() {
  const loadCart = useCartStore((state) => state.loadCart);
  const hasLoadedCart = useCartStore((state) => state.hasLoadedCart);

  useEffect(() => {
    // Load cart on mount if authenticated and not already loaded
    if (!hasLoadedCart && isAuthenticated()) {
      useCartStore.setState({ hasLoadedCart: true });
      loadCart();
    }
  }, [loadCart, hasLoadedCart]);

  return null;
}

