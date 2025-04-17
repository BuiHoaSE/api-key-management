'use client'

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ApiException } from '@/utils/api-response'
import Toast from '../components/Toast'
import Sidebar from '../components/Sidebar'

export default function Playground() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [apiKey, setApiKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }, [])

  const validateApiKey = async () => {
    if (!apiKey) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/v1/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: apiKey }),
      })

      const result = await response.json()

      if (result.error) {
        showNotification(result.error.message, 'error')
      } else {
        if (result.data.valid) {
          showNotification('API key is valid', 'success')
          // Store the API key in session storage
          sessionStorage.setItem('apiKey', apiKey)
          // Redirect to protected page after a short delay to show the success message
          setTimeout(() => {
            router.push('/playground/protected')
          }, 1000)
        } else {
          showNotification('Invalid API key', 'error')
          setApiKey('') // Clear the input field
        }
      }
    } catch (error) {
      console.error('Error validating API key:', error)
      showNotification(
        error instanceof ApiException ? error.message : 'Failed to validate API key',
        'error'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to use the playground</h1>
          <a
            href="/api/auth/signin"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">API Playground</h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Operational</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Validate API Key</h2>
            
            <div className="mb-4">
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
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

            <button
              onClick={validateApiKey}
              disabled={isLoading || !apiKey}
              className={`px-4 py-2 rounded-md text-white ${
                isLoading || !apiKey
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isLoading ? 'Validating...' : 'Validate Key'}
            </button>
          </div>
        </div>
      </main>
      <Toast show={showToast} message={toastMessage} type={toastType} />
    </div>
  )
} 