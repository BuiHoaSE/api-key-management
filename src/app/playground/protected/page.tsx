'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DashboardSidebar from '../../components/DashboardSidebar';
import { MenuIcon } from 'lucide-react';

export default function Protected(): JSX.Element {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  useEffect(() => {
    // Simply check if the key exists in session storage
    const apiKey = sessionStorage.getItem('apiKey');
    
    if (!apiKey) {
      // Redirect if no API key found
      router.push('/playground');
      return;
    }
    
    // If we have an API key, we're good to go
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <DashboardSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <div className={`flex-1 transition-all duration-200 ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                {!isSidebarOpen && (
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 text-gray-600 hover:text-gray-900 -ml-2"
                  >
                    <MenuIcon className="h-5 w-5" />
                  </button>
                )}
                <h1 className="text-2xl font-semibold">Protected Page</h1>
              </div>
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
        </div>
      </div>
    </div>
  );
} 