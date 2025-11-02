import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, token } = await request.json();
    
    // Get API URL - use HTTP for localhost, HTTPS for production
    const getApiUrl = () => {
      if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
      }
      // Development: use HTTP (no SSL) for localhost
      return 'http://localhost:3001/api';
    };
    const apiUrl = getApiUrl();
    
    // Call your backend server to verify the token
    const serverResponse = await fetch(`${apiUrl}/auth/verify-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, token }),
    });

    if (!serverResponse.ok) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const user = await serverResponse.json();
    return NextResponse.json(user);
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Token verification failed' },
      { status: 500 }
    );
  }
}
