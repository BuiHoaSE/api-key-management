'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import GoogleSignInButton from '@/app/components/GoogleSignInButton';

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-gray-500">Sign in to your account to continue</p>
      </div>
      <div className="space-y-4">
        <GoogleSignInButton callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense fallback={
        <div className="mx-auto w-full max-w-sm space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Loading...</h1>
          </div>
        </div>
      }>
        <SignInContent />
      </Suspense>
    </div>
  );
} 