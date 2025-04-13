'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ProtectedLink({ children, className }) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleClick = async (e) => {
    e.preventDefault();
    
    if (session) {
      router.push('/dashboard');
    } else {
      try {
        const result = await signIn('google', {
          redirect: false,
          callbackUrl: '/dashboard'
        });
        
        if (result?.ok) {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Sign in error:', error);
      }
    }
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
} 