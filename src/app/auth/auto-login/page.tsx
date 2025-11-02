'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const AutoLoginPage = () => {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Verifying your session...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let email = searchParams.get('email');
    let token = searchParams.get('token');
    const password = searchParams.get('password');
    let callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
    
    // If callbackUrl contains encoded email, decode it
    if (callbackUrl.includes('email=')) {
      try {
        const url = new URL(callbackUrl, 'http://dummy.com');
        const emailParam = url.searchParams.get('email');
        if (emailParam) {
          // Use the email from callbackUrl if it exists
          email = emailParam;
        }
      } catch (e) {
        console.error('Error parsing callback URL:', e);
      }
    }

    const attemptAutoLogin = async () => {
      if (!email) {
        setError('Invalid login link. Email is required.');
        return;
      }
      
      // If we have a password but no token, try to log in with password
      if (password && !token) {
        try {
          setStatus('Logging in with credentials...');
          
          // Get API URL - use HTTP for localhost, HTTPS for production
          const getApiUrl = () => {
            if (process.env.NEXT_PUBLIC_API_URL) {
              return process.env.NEXT_PUBLIC_API_URL;
            }
            // Development: use HTTP (no SSL) for localhost
            return 'http://localhost:3001/api';
          };
          const apiUrl = getApiUrl();
          const response = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Invalid credentials');
          }

          const data = await response.json();
          
          // Store token and user data in localStorage for AuthContext
          if (data.token && data.user) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
          }

          // Redirect to the callback URL or home page
          window.location.href = callbackUrl;
          return;
        } catch (err) {
          console.error('Password login error:', err);
          setError(err instanceof Error ? err.message : 'Invalid credentials. Please try logging in manually.');
          return;
        }
      }
      
      // Token-based login
      if (!token) {
        setError('Invalid login link. Missing token or password.');
        return;
      }

      try {
        setStatus('Verifying your session...');
        
        // Try order access token first, then fallback to regular token
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        let verifyResponse = await fetch(`${apiUrl}/auth/verify-order-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, token }),
        });

        // If order token verification fails, try regular token verification
        if (!verifyResponse.ok) {
          verifyResponse = await fetch('/api/auth/verify-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, token }),
          });
        }

        if (!verifyResponse.ok) {
          const errorData = await verifyResponse.json().catch(() => ({}));
          throw new Error(errorData.message || 'Invalid or expired token');
        }

        const verifyData = await verifyResponse.json();
        
        setStatus('Logging you in...');
        
        // Store token and user data in localStorage for AuthContext
        if (verifyData.token && verifyData.user) {
          localStorage.setItem('authToken', verifyData.token);
          localStorage.setItem('userData', JSON.stringify(verifyData.user));
        }

        // Redirect to the callback URL or home page
        window.location.href = callbackUrl;
      } catch (err) {
        console.error('Auto-login error:', err);
        setError(err instanceof Error ? err.message : 'Failed to log in automatically');
      }
    };

    attemptAutoLogin();
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Login Failed</h2>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <div className="mt-6">
              <a
                href="/auth/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Login Page
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-lg font-medium text-gray-900">{status}</p>
        <p className="mt-2 text-sm text-gray-500">Please wait while we log you in automatically.</p>
      </div>
    </div>
  );
};

export default AutoLoginPage;
