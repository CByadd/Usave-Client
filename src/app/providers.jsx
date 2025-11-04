'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { WishlistProvider } from './contexts/WishlistContext';
import { useState } from 'react';

// Create a client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <WishlistProvider>
          {children}
        </WishlistProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
