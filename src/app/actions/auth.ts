'use server';

import { signIn } from 'next-auth/react';

export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const callbackUrl = formData.get('callbackUrl') as string || '/admin/approve-order';

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl
    });

    if (result?.error) {
      return 'Invalid credentials.';
    }
    
    return { success: true };
  } catch (error) {
    console.error('Authentication error:', error);
    return 'Something went wrong. Please try again.';
  }
}
