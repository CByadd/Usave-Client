'use client';

import React, { useState, useEffect } from 'react';
import ToastContainer from './ToastContainer';
import { subscribeToToast } from '../../lib/ui';

export default function ToastContainerWrapper() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToToast((toast) => {
      if (toast.remove) {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      } else {
        setToasts(prev => [...prev, toast]);
      }
    });

    return unsubscribe;
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return <ToastContainer toasts={toasts} removeToast={removeToast} />;
}
