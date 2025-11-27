import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { adminEmail, orderDetails, userId, ownerEmail } = body;

    // Get backend URL - use HTTP for localhost, HTTPS for production
    const getBackendUrl = () => {
      if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL.replace('/api', '');
      }
      // Development: use HTTP (no SSL) for localhost
      return 'http://localhost:3001';
    };
    
    // Get client base URL from request headers or config
    const getClientBaseUrl = () => {
      // Try to get from request headers first
      const origin = request.headers.get('origin');
      const referer = request.headers.get('referer');
      
      if (origin) {
        return origin;
      }
      
      if (referer) {
        try {
          const refererUrl = new URL(referer);
          return `${refererUrl.protocol}//${refererUrl.host}`;
        } catch (e) {
          // Invalid referer, continue to fallback
        }
      }
      
      // Fallback to config
      if (typeof window !== 'undefined') {
        return window.location.origin;
      }
      
      // Server-side fallback
      return process.env.NEXT_PUBLIC_CLIENT_URL || 
             (process.env.NODE_ENV === 'production' 
               ? 'https://usave-client.vercel.app' 
               : 'http://localhost:3000');
    };
    
    const backendUrl = getBackendUrl();
    const clientBaseUrl = getClientBaseUrl();
    
    // Forward the request to your backend server
    const response = await fetch(`${backendUrl}/api/orders/request-approval`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        adminEmail,
        orderDetails,
        userId,
        ownerEmail,
        clientBaseUrl, // Send client base URL to server
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to send approval request' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in request-approval API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
