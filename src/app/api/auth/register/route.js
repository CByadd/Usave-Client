import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    
    // TODO: Replace this with your actual registration logic
    // This is just a placeholder
    if (email && password && name) {
      return NextResponse.json({
        success: true,
        user: {
          id: 'new-user-id',
          name: name,
          email: email,
          role: 'user'
        },
        token: 'sample-jwt-token-for-new-user'
      });
    }
    
    return NextResponse.json(
      { success: false, message: 'Missing required fields' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
