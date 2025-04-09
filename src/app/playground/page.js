'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Toast from '../components/Toast';

export default function Playground() {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const router = useRouter();

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        showToast('Valid API key', 'success');
        // Store the API key in session storage for the protected page
        sessionStorage.setItem('apiKey', apiKey);
        // Redirect to protected page after a short delay
        setTimeout(() => {
          router.push('/playground/protected');
        }, 1000);
      } else {
        // Show specific message for invalid API key
        showToast('Invalid API key - Key not found in database', 'error');
        setApiKey(''); // Clear the input field
      }
    } catch (error) {
      console.error('Error validating API key:', error);
      showToast('Error validating API key', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Toast show={toast.show} message={toast.message} type={toast.type} />
        <div className="max-w-4xl mx-auto p-8">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">API Playground</h1>
            <div className="max-w-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your API key
                  </label>
                  <input
                    type="text"
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    placeholder="tvly-xxxxxxxxxx"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Validating...' : 'Validate API Key'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 