"use client";

import { useEffect } from 'react';
import { useWishlistStore } from '../../stores/useWishlistStore';
import { isAuthenticated } from '../../lib/auth';

export default function WishlistInitializer() {
  const loadWishlist = useWishlistStore((state) => state.loadWishlist);
  const hasLoadedWishlist = useWishlistStore((state) => state.hasLoadedWishlist);

  useEffect(() => {
    // Load wishlist on mount if authenticated and not already loaded
    if (!hasLoadedWishlist && isAuthenticated()) {
      useWishlistStore.setState({ hasLoadedWishlist: true });
      loadWishlist();
    }
  }, [loadWishlist, hasLoadedWishlist]);

  return null;
}

