'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Sidebar from '../../components/Sidebar';

export default function Protected() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const apiKey = sessionStorage.getItem('apiKey');
    if (!apiKey) {
      router.push('/playground');
      return;
    }

    // Validate the API key again on page load
    const validateKey = async () => {
      try {
        const response = await fetch('/api/v1/validate-key', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ key: apiKey }),
        });

        const result = await response.json();
        
        if (!response.ok || result.error || !result.data?.valid) {
          router.push('/playground');
        } else {
          setIsValid(true);
        }
      } catch (error) {
        console.error('Error validating API key:', error);
        router.push('/playground');
      }
    };

    validateKey();
  }, [router]);

  if (!isValid) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Protected Page</h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Operational</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">API Key Validated</h2>
            <p className="text-gray-600">
              This is a protected page that can only be accessed with a valid API key. Your API key has been successfully validated.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 