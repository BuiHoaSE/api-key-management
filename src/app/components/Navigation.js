'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import GoogleSignInButton from './GoogleSignInButton';

export default function Navigation() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
      <Link href="/" className="text-lg font-semibold">
        API Key Management
      </Link>
      <div className="flex items-center gap-3">
        {session?.user && (
          <div className="flex items-center gap-2">
            <Image
              src={session.user.image}
              alt="Profile"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="hidden sm:inline text-sm font-medium">
              {session.user.name}
            </span>
          </div>
        )}
        <GoogleSignInButton />
      </div>
    </nav>
  );
} 