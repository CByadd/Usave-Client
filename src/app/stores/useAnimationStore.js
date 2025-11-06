"use client";

import { create } from 'zustand';

// Animation configuration constants
export const ANIMATION_CONFIG = {
  // Page transitions
  page: {
    duration: 0.4,
    ease: [0.25, 0.1, 0.25, 1], // Custom cubic-bezier for smoothness
    stagger: 0.1,
  },
  // Modal animations
  modal: {
    backdrop: {
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1],
    },
    content: {
      type: 'spring',
      stiffness: 400,
      damping: 35,
      mass: 0.8,
    },
  },
  // Drawer animations
  drawer: {
    backdrop: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
    panel: {
      type: 'tween',
      duration: 0.35,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  // List/item animations
  list: {
    stagger: 0.05,
    duration: 0.3,
    ease: [0.25, 0.1, 0.25, 1],
  },
  // Loading animations
  loading: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
  },
};

// Animation Store for managing animation states and preferences
export const useAnimationStore = create((set, get) => ({
  // Animation enabled state (for accessibility)
  animationsEnabled: typeof window !== 'undefined' 
    ? !window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : true,
  
  // Current animation states
  isPageTransitioning: false,
  isModalAnimating: false,
  isDrawerAnimating: false,
  
  // Animation preferences
  reduceMotion: false,
  
  // Actions
  setAnimationsEnabled: (enabled) => set({ animationsEnabled: enabled }),
  setReduceMotion: (reduce) => set({ reduceMotion: reduce }),
  
  // Animation state management
  setPageTransitioning: (transitioning) => set({ isPageTransitioning: transitioning }),
  setModalAnimating: (animating) => set({ isModalAnimating: animating }),
  setDrawerAnimating: (animating) => set({ isDrawerAnimating: animating }),
  
  // Get animation config based on preferences
  getAnimationConfig: (type) => {
    const { reduceMotion, animationsEnabled } = get();
    if (!animationsEnabled || reduceMotion) {
      return { duration: 0, ease: 'linear' };
    }
    return ANIMATION_CONFIG[type] || ANIMATION_CONFIG.page;
  },
  
  // Initialize reduced motion preference
  initReducedMotion: () => {
    if (typeof window === 'undefined') return () => {};
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    set({ reduceMotion: prefersReducedMotion, animationsEnabled: !prefersReducedMotion });
    
    // Listen for changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e) => {
      set({ reduceMotion: e.matches, animationsEnabled: !e.matches });
    };
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  },
}));

// Initialize on mount (client-side only)
if (typeof window !== 'undefined') {
  useAnimationStore.getState().initReducedMotion();
}

