'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, User, Code, BookOpen, LogOut, ChevronLeft } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

interface DashboardSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export default function DashboardSidebar({ isSidebarOpen, setIsSidebarOpen }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: Home },
    { name: 'My Account', href: '/dashboard/account', icon: User },
    { name: 'API Playground', href: '/playground', icon: Code },
    { name: 'Documentation', href: '/docs', icon: BookOpen },
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className={`fixed left-0 top-0 h-full w-64 bg-white border-r transform transition-transform duration-200 ${
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } z-20`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-16 px-6">
          <Link href="/" className="flex items-center gap-2">
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
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
        <nav className="px-2 pt-4 flex-1">
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'text-gray-900 bg-gray-50'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {/* User Profile Section */}
        {session?.user && (
          <div className="border-t border-gray-200">
            <div className="p-4">
              <div className="flex items-center gap-3">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {session.user.name && (
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {session.user.name}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 