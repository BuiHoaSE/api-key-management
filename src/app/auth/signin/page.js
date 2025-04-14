'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import GoogleSignInButton from '@/app/components/GoogleSignInButton';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Separate component that uses useSearchParams
function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session && callbackUrl) {
      router.push(callbackUrl);
    }
  }, [session, router, callbackUrl]);

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

// Loading component
function LoadingState() {
  return (
    <div className="mx-auto w-full max-w-sm space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Loading...</h1>
        <p className="text-gray-500">Please wait</p>
      </div>
    </div>
  );
}

// Main page component
export default function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense fallback={<LoadingState />}>
        <SignInContent />
      </Suspense>
    </div>
  );
} 