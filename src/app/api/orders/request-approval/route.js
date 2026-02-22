import { NextResponse } from 'next/server';
import { config } from '../../../lib/config';
import { API_ENDPOINTS, FALLBACK_URLS } from '../../../lib/urls';

export async function POST(request) {
  try {
    const body = await request.json();
    const { adminEmail, orderDetails, userId, ownerEmail, clientBaseUrl: bodyClientBaseUrl } = body;

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
      const fallbackUrl = process.env.NEXT_PUBLIC_CLIENT_URL || config.urls.client || FALLBACK_URLS.clientProduction;
      console.warn(`[API Route] No clientBaseUrl found, using fallback: ${fallbackUrl}`);
      return fallbackUrl;
    };

    const backendEndpoint = API_ENDPOINTS.orders.requestApproval;
    const backendApiUrl = `${config.api.baseURL}${backendEndpoint}`;
    const resolvedClientBaseUrl = getClientBaseUrl();

    // Log received authorization header
    console.log('[API Route] Received Authorization header:', request.headers.get('authorization') ? 'Yes (hidden)' : 'No');

    console.log(`[API Route] Resolved clientBaseUrl: ${resolvedClientBaseUrl}`);
    console.log(`[API Route] Forwarding request to backend: ${backendApiUrl}`);

    // Forward the request to your backend server
    const forwardHeaders = {
      'Content-Type': 'application/json',
      // Forward authentication headers if present
      ...(request.headers.get('cookie') ? { 'Cookie': request.headers.get('cookie') } : {}),
      ...(request.headers.get('authorization') ? { 'Authorization': request.headers.get('authorization') } : {}),
    };

    console.log('[API Route] Forwarding headers:', Object.keys(forwardHeaders));

    const response = await fetch(backendApiUrl, {
      method: 'POST',
      headers: forwardHeaders,
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

