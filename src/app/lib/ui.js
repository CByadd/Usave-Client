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

// Drawer/modal state - use local state in components
// These are just helper functions if needed

export const openAuthDrawer = (tab = 'login') => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('usave:openAuth', { detail: { tab } });
    document.body.dispatchEvent(event);
  }
};

export const closeAuthDrawer = () => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('usave:closeAuth');
    document.body.dispatchEvent(event);
  }
};

export const openCartDrawer = () => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('usave:openCart');
    document.body.dispatchEvent(event);
  }
};

export const closeCartDrawer = () => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('usave:closeCart');
    document.body.dispatchEvent(event);
  }
};

