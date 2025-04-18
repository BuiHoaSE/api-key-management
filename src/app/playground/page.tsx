'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import DashboardSidebar from '../components/DashboardSidebar'
import Link from 'next/link'
import { MenuIcon } from 'lucide-react'

export default function Playground() {
  const { data: session, status } = useSession()
  const [apiKey, setApiKey] = useState('')
  const [repositoryUrl, setRepositoryUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const handleRequest = async () => {
    if (!apiKey || !repositoryUrl) {
      setApiResponse({ error: { message: 'API Key and Repository URL are required.' } })
      return
    }
    if (!session) {
      setApiResponse({ error: { message: 'Please sign in to use the playground.' } })
      return
    }

    setIsLoading(true)
    setApiResponse(null)

    try {
      console.log('Calling GitHub Summarizer API...');
      const response = await fetch('/api/github-summarizer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        credentials: 'include',
        body: JSON.stringify({ 
          repositoryUrl: repositoryUrl,
        }),
      });

      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.error?.code === "UNAUTHORIZED") {
        result.error.message = "Invalid API key";
      }
      
      setApiResponse(result);

    } catch (error) {
      console.error('Error calling API:', error);
      setApiResponse({ 
        error: { 
          message: error instanceof Error ? error.message : 'An unexpected client-side error occurred.' 
        } 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to use the playground</h1>
          <Link
            href="/api/auth/signin"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
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
                <h1 className="text-2xl font-semibold">API Playground</h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Operational</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">GitHub Summarizer Request</h2>
              
              <div className="mb-4">
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  type="text"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your API key"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="repositoryUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Repository URL
                </label>
                <input
                  type="text"
                  id="repositoryUrl"
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., https://github.com/username/repo"
                />
              </div>

              <button
                onClick={handleRequest}
                disabled={isLoading || !apiKey || !repositoryUrl}
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  isLoading || !apiKey || !repositoryUrl
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isLoading ? 'Processing...' : 'Submit'}
              </button>
            </div>

            {apiResponse && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">API Response</h2>
                <div className="bg-gray-100 rounded p-4 max-h-96 overflow-auto">
                  <pre className="text-sm font-mono whitespace-pre-wrap break-all">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 