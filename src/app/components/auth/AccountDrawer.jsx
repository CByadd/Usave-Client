"use client";
import React, { useState, useEffect } from 'react';
import { X, UserRound } from 'lucide-react';
import { getCurrentUser, isAuthenticated } from '../../lib/auth';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

export default function AccountDrawer({ isOpen, onClose }) {
  const [user, setUser] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [activeModal, setActiveModal] = useState('login'); // 'login' or 'register'

  useEffect(() => {
    const currentUser = getCurrentUser();
    const authStatus = isAuthenticated();
    setUser(currentUser);
    setAuthenticated(authStatus);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50`}>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div className={`fixed inset-y-0 right-0 w-full sm:w-[380px] bg-white shadow-xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <UserRound />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Account</h2>
              {authenticated && user && (
                <p className="text-xs text-gray-600">{user?.firstName || user?.name?.split(' ')[0]} {user?.lastName || user?.name?.split(' ')[1] || ''}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-0">
          {!authenticated ? (
            <>
              <LoginModal 
                isOpen={activeModal === 'login'} 
                onClose={onClose} 
                onSwitchToRegister={() => setActiveModal('register')} 
              />
              <RegisterModal 
                isOpen={activeModal === 'register'} 
                onClose={onClose} 
                onSwitchToLogin={() => setActiveModal('login')} 
              />
            </>
          ) : (
            <div className="p-6">
              <p className="text-gray-600">Welcome, {user?.firstName || user?.name || 'User'}!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
