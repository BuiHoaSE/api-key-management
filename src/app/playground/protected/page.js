'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';

export default function Protected() {
  const router = useRouter();
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
        const response = await fetch('/api/validate-key', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ apiKey }),
        });

        const data = await response.json();
        if (!response.ok || !data.valid) {
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <div className="max-w-4xl mx-auto p-8">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Protected Page</h1>
            <p className="text-gray-600">
              This is a protected page that can only be accessed with a valid API key.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 