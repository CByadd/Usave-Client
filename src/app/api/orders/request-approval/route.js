import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { adminEmail, orderDetails, userId, ownerEmail, clientBaseUrl: bodyClientBaseUrl } = body;

    // Get backend URL - use HTTP for localhost, HTTPS for production
    const getBackendUrl = () => {
      if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL.replace('/api', '');
      }
      // Development: use HTTP (no SSL) for localhost
      return 'http://localhost:3001';
    };
    
    // Get client base URL from request body, headers, or config
    const getClientBaseUrl = () => {
      // Priority 1: Use clientBaseUrl from request body (sent by client)
      if (bodyClientBaseUrl && typeof bodyClientBaseUrl === 'string' && bodyClientBaseUrl.trim()) {
        console.log(`[API Route] Using clientBaseUrl from request body: ${bodyClientBaseUrl}`);
        return bodyClientBaseUrl.trim();
      }
      
      // Priority 2: Try to get from request headers
      const origin = request.headers.get('origin');
      const referer = request.headers.get('referer');
      
      if (origin) {
        console.log(`[API Route] Using clientBaseUrl from Origin header: ${origin}`);
        return origin;
      }
      
      if (referer) {
        try {
          const refererUrl = new URL(referer);
          const refererBase = `${refererUrl.protocol}//${refererUrl.host}`;
          console.log(`[API Route] Using clientBaseUrl from Referer header: ${refererBase}`);
          return refererBase;
        } catch (e) {
          console.warn(`[API Route] Failed to parse Referer header: ${referer}`, e);
          // Invalid referer, continue to fallback
        }
      }
      
      // Priority 3: Fallback to environment variable or default
      const fallbackUrl = process.env.NEXT_PUBLIC_CLIENT_URL || 
             (process.env.NODE_ENV === 'production' 
               ? 'https://usave-client.vercel.app' 
               : 'http://localhost:3000');
      console.warn(`[API Route] No clientBaseUrl found, using fallback: ${fallbackUrl}`);
      return fallbackUrl;
    };
    
    const backendUrl = getBackendUrl();
    const resolvedClientBaseUrl = getClientBaseUrl();
    
    console.log(`[API Route] Resolved clientBaseUrl: ${resolvedClientBaseUrl}`);
    console.log(`[API Route] Forwarding request to backend: ${backendUrl}/api/orders/request-approval`);
    
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
        clientBaseUrl: resolvedClientBaseUrl, // Always send resolved client base URL to server
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
