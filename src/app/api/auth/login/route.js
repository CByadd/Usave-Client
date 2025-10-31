import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    // For testing purposes, accept any non-empty email and password
    // In production, replace this with actual authentication logic
    if (email && password) {
      return NextResponse.json({
        success: true,
        user: {
          id: '1',
          name: 'Admin User',
          email: email,
          role: 'admin'
        },
        token: 'sample-jwt-token'
      });
    }
    
    return NextResponse.json(
      { success: false, message: 'Invalid credentials' },
      { status: 401 }
    );
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
