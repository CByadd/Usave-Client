'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from './contexts/AuthContext';
import { UIProvider } from './contexts/UIContext';
import SearchProvider from './components/providers/SearchProvider';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { CheckoutProvider } from './contexts/CheckoutContext';

export function Providers({ children }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <UIProvider>
          <SearchProvider>
            <CartProvider>
              <WishlistProvider>
                <CheckoutProvider>
                  {children}
                </CheckoutProvider>
              </WishlistProvider>
            </CartProvider>
          </SearchProvider>
        </UIProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
