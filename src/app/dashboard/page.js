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
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Dashboard() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [apiKeys, setApiKeys] = useState([]);
  const [visibleKeys, setVisibleKeys] = useState({});
  const [editingKey, setEditingKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  // Navigation items
  const navItems = [
    { name: 'Overview', href: '/dashboard' },
    { name: 'My Account', href: '/dashboard/account' },
    { name: 'API Playground', href: '/playground' },
    { name: 'Documentation', href: '/docs' }
  ];

  const fetchApiKeys = useCallback(async () => {
    try {
      const response = await fetch('/api/keys');
      const data = await response.json();
      setApiKeys(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      setApiKeys([]);
      setIsLoading(false);
      toast.error('Failed to fetch API keys');
    }
  }, []);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
                onClick={() => setEditingKey('new')}
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
                  {[
                    { name: 'first-key', type: 'dev', usage: '1' },
                    { name: 'second-key', type: 'dev', usage: '1' },
                    { name: 'real api', type: 'dev', usage: '1' }
                  ].map((key, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 text-sm text-gray-900">{key.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{key.type}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{key.usage}</td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-500">
                        ••••••••••••••••••••••••••
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <ClipboardIcon className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
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
    </div>
  );
} 