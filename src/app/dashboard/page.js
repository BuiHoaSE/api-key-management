'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  EyeIcon,
  ClipboardIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MenuIcon,
  ChevronLeftIcon,
  XIcon,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Toast from '../components/Toast';

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [apiKeys, setApiKeys] = useState([]);
  const [visibleKeys, setVisibleKeys] = useState({});
  const [editingKey, setEditingKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', type: 'dev', description: '' });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [inlineEditKey, setInlineEditKey] = useState(null);
  const [inlineEditValue, setInlineEditValue] = useState('');

  // Navigation items
  const navItems = [
    { name: 'Overview', href: '/dashboard' },
    { name: 'My Account', href: '/dashboard/account' },
    { name: 'API Playground', href: '/playground' },
    { name: 'Documentation', href: '/docs' }
  ];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    }
  }, [status, router]);

  const showNotification = useCallback((message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  // Add resize handler
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const fetchApiKeys = useCallback(async () => {
    if (status !== 'authenticated' || !session?.user?.email) {
      console.log('[Debug] Session not ready:', { status, session });
      return;
    }

    try {
      console.log('[Debug] Starting API keys fetch');
      setIsLoading(true);
      
      const response = await fetch('/api/v1/keys', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });
      
      console.log('[Debug] Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }

      const result = await response.json();
      console.log('[Debug] Parsed response:', result);
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to fetch API keys');
      }

      setApiKeys(result.data || []);
    } catch (error) {
      console.error('[Debug] Fetch error:', error);
      showNotification(error.message || 'Failed to fetch API keys', 'error');
      setApiKeys([]);
    } finally {
      setIsLoading(false);
    }
  }, [session, status, showNotification]);

  useEffect(() => {
    if (status === 'authenticated') {
      console.log('[Debug] Session authenticated, fetching keys');
      fetchApiKeys();
    }
  }, [status, fetchApiKeys]);

  // Add handlers for options buttons
  const toggleKeyVisibility = (keyId) => {
    setVisibleKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const copyToClipboard = useCallback(async (key) => {
    try {
      await navigator.clipboard.writeText(key);
      showNotification('API key copied to clipboard');
    } catch (error) {
      showNotification('Failed to copy API key', 'error');
    }
  }, [showNotification]);

  const handleNewKey = () => {
    setEditForm({ name: '', type: 'dev', description: '' });
    setSelectedKey(null);
    setShowEditModal(true);
  };

  const handleEdit = (key) => {
    console.log('Edit button clicked:', key);
    setSelectedKey(key);
    setEditForm({
      name: key.name,
      type: key.type || 'dev',
      description: key.description || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = (key) => {
    setSelectedKey(key);
    setShowDeleteModal(true);
  };

  const confirmDelete = useCallback(async () => {
    if (!selectedKey) return;
    
    try {
      const response = await fetch(`/api/v1/keys/${selectedKey.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to delete API key');
      }

      // Delete was successful
      setShowDeleteModal(false);
      showNotification('API key deleted successfully');
      fetchApiKeys(); // Refresh the list
    } catch (error) {
      console.error('Error:', error);
      showNotification(error.message || 'Failed to delete API key', 'error');
    }
  }, [selectedKey, showNotification, fetchApiKeys]);

  const confirmEdit = useCallback(async (e) => {
    e.preventDefault();
    if (!editForm.name) return;

    try {
      const endpoint = selectedKey 
        ? `/api/v1/keys/${selectedKey.id}` // Update existing key
        : '/api/v1/keys'; // Create new key
      
      const method = selectedKey ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          type: editForm.type,
          description: editForm.description
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || `Failed to ${selectedKey ? 'update' : 'create'} API key`);
      }

      // Update was successful
      setShowEditModal(false);
      showNotification(selectedKey ? 'API key updated successfully' : 'API key created successfully');
      fetchApiKeys(); // Refresh the list
    } catch (error) {
      console.error('Error:', error);
      showNotification(error.message || `Failed to ${selectedKey ? 'update' : 'create'} API key`, 'error');
    }
  }, [editForm, selectedKey, showNotification, fetchApiKeys]);

  // Loading state for session check
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  // Redirect state
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to continue</p>
          <Link
            href="/api/auth/signin"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Loading state for API keys
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API keys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast show={showToast} message={toastMessage} type={toastType} />
      {/* Sidebar with md: breakpoint */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white border-r transform transition-transform duration-200 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } z-20`}>
        <div className="flex items-center justify-between h-16 px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8">
              <svg viewBox="0 0 24 24" className="w-full h-full text-blue-600">
                <path fill="currentColor" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <span className="text-xl font-semibold">API Keys</span>
          </Link>
          {/* Sidebar toggle button */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-600"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
        </div>
        <nav className="px-2 pt-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'text-gray-900 bg-gray-50'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main content with md: breakpoint */}
      <div className={`transition-all duration-200 ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              {/* Header toggle button - only visible when sidebar is hidden */}
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 text-gray-600 hover:text-gray-900 -ml-2"
                >
                  <MenuIcon className="h-5 w-5" />
                </button>
              )}
              <h1 className="text-2xl font-semibold">Overview</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Operational</span>
            </div>
          </div>

          {/* Current Plan Card */}
          <div className="bg-gradient-to-r from-[#F4C6C6] via-[#BDB4E0] to-[#B4C6F0] rounded-2xl p-6 mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium text-white/90">CURRENT PLAN</div>
                <button className="text-sm text-white/90 bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-all">
                  Manage Plan
                </button>
              </div>
              
              <h2 className="text-4xl font-bold text-white">Researcher</h2>
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-white/90 mb-2">API Usage</div>
                  <div className="w-full h-1 bg-white/20 rounded-full">
                    <div className="w-[10%] h-full bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-white/90">Plan</div>
                  <div className="text-sm font-medium text-white/90">1/1,000 Credits</div>
                </div>
              </div>
            </div>
          </div>

          {/* API Keys Section */}
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">API Keys</h2>
              <button 
                onClick={handleNewKey}
                className="w-full bg-[#0066FF] text-white rounded-lg py-2.5 px-4 text-sm font-medium hover:bg-blue-600 transition-all flex items-center justify-center gap-2 mb-4"
              >
                <PlusIcon className="h-5 w-5" />
                New API Key
              </button>
              <p className="text-sm text-gray-600">
                The key is used to authenticate your requests to the Research API.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-t border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Usage</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Key</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Options</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {apiKeys.map((key, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 text-sm text-gray-900 cursor-pointer relative" onClick={() => {
                        setInlineEditKey(key.name);
                        setInlineEditValue(key.name);
                      }}>
                        {inlineEditKey === key.name ? (
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleEdit({ ...key, name: inlineEditValue });
                              setInlineEditKey(null);
                            }}
                            className="absolute top-0 left-0 right-0 bottom-0 bg-white shadow-lg rounded-lg p-2 z-10"
                          >
                            <input
                              type="text"
                              value={inlineEditValue}
                              onChange={(e) => setInlineEditValue(e.target.value)}
                              className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              autoFocus
                              onBlur={() => setInlineEditKey(null)}
                            />
                          </form>
                        ) : (
                          key.name
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{key.type}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{key.usage}</td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-500">
                        {visibleKeys[key.name] ? key.key : '••••••••••••••••••••••••••'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button 
                            className="p-1 text-gray-400 hover:text-gray-600"
                            onClick={() => toggleKeyVisibility(key.name)}
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1 text-gray-400 hover:text-gray-600"
                            onClick={() => copyToClipboard(key.key)}
                          >
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1 text-gray-400 hover:text-gray-600"
                            onClick={() => handleEdit(key)}
                            aria-label="Edit API key"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1 text-gray-400 hover:text-gray-600"
                            onClick={() => handleDelete(key)}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Delete API Key</h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-gray-600">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this API key? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selectedKey ? 'Edit API Key' : 'Create API Key'}</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
                type="button"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={confirmEdit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter API key name"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="dev">Development</option>
                    <option value="prod">Production</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter API key description (optional)"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  {selectedKey ? 'Save Changes' : 'Create Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 