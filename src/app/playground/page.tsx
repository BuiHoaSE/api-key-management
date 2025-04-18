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
                {apiResponse.error ? (
                  <div className="bg-red-50 border border-red-200 rounded p-4">
                    <p className="text-red-700">{apiResponse.error.message}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Summary Section */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Summary</h3>
                      <p className="text-gray-700">{apiResponse.summary}</p>
                    </div>

                    {/* Key Features Section */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Key Features</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {apiResponse.keyFeatures?.map((feature: string, index: number) => (
                          <li key={index} className="text-gray-700">{feature}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Cool Facts Section */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Cool Facts</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {apiResponse.coolFacts?.map((fact: string, index: number) => (
                          <li key={index} className="text-gray-700">{fact}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Repository Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500">Stars</h4>
                        <p className="mt-1 text-lg font-semibold">{apiResponse.stars || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500">Latest Version</h4>
                        <p className="mt-1 text-lg font-semibold">{apiResponse.latestVersion || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500">License</h4>
                        <p className="mt-1 text-lg font-semibold">{apiResponse.license || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Website Link */}
                    {apiResponse.website && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Website</h3>
                        <a 
                          href={apiResponse.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {apiResponse.website}
                        </a>
                      </div>
                    )}

                    {/* Raw Response Toggle */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <details className="cursor-pointer">
                        <summary className="text-sm text-gray-600 hover:text-gray-900">View Raw Response</summary>
                        <div className="mt-2 bg-gray-100 rounded p-4 max-h-96 overflow-auto">
                          <pre className="text-sm font-mono whitespace-pre-wrap break-all">
                            {JSON.stringify(apiResponse, null, 2)}
                          </pre>
                        </div>
                      </details>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 