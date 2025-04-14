'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';

export default function GoogleSignInButton({ callbackUrl = '/dashboard' }) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn('google', { 
        callbackUrl,
        redirect: true
      });
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut({ 
        callbackUrl: '/',
        redirect: true
      });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (session && session.user) {
    return (
      <button
        onClick={handleSignOut}
        disabled={isLoading}
        className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto disabled:opacity-50"
      >
        {isLoading ? 'Signing out...' : 'Sign out'}
      </button>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto disabled:opacity-50"
    >
      {!isLoading && (
        <Image
          src="/google.svg"
          alt="Google logo"
          width={20}
          height={20}
          className="mr-2"
        />
      )}
      {isLoading ? 'Signing in...' : 'Sign in with Google'}
    </button>
  );
} 