// Simple UI state management - no context needed
// Use local state in components instead

// Toast notifications
let toastListeners = [];

export const showToast = (message, type = 'info', duration = 3000) => {
  const toast = {
    id: Date.now(),
    message,
    type,
    duration
  };
  
  // Notify all listeners
  toastListeners.forEach(listener => listener(toast));
  
  // Auto remove after duration
  if (duration > 0) {
    setTimeout(() => {
      removeToast(toast.id);
    }, duration);
  }
  
  return toast.id;
};

export const removeToast = (id) => {
  toastListeners.forEach(listener => listener({ id, remove: true }));
};

// Subscribe to toast events
export const subscribeToToast = (callback) => {
  toastListeners.push(callback);
  return () => {
    toastListeners = toastListeners.filter(listener => listener !== callback);
  };
};

// Drawer/modal state - using Zustand store
// These are helper functions that use the Zustand store

let uiStore = null;

// Initialize store reference (lazy load to avoid SSR issues)
const getUIStore = () => {
  if (typeof window === 'undefined') return null;
  if (!uiStore) {
    const { useUIStore } = require('../stores/useUIStore');
    uiStore = useUIStore;
  }
  return uiStore;
};

export const openAuthDrawer = (tab = 'login') => {
  const store = getUIStore();
  if (store) {
    store.getState().openAuthDrawer();
  }
  // Also dispatch event for backward compatibility
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('usave:openAuth', { detail: { tab } });
    document.body.dispatchEvent(event);
  }
};

export const closeAuthDrawer = () => {
  const store = getUIStore();
  if (store) {
    store.getState().closeAuthDrawer();
  }
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('usave:closeAuth');
    document.body.dispatchEvent(event);
  }
};

export const openCartDrawer = () => {
  const store = getUIStore();
  if (store) {
    store.getState().openCartDrawer();
  }
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('usave:openCart');
    document.body.dispatchEvent(event);
  }
};

export const closeCartDrawer = () => {
  const store = getUIStore();
  if (store) {
    store.getState().closeCartDrawer();
  }
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('usave:closeCart');
    document.body.dispatchEvent(event);
  }
};

