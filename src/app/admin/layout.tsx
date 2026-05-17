import { Sidebar } from '@/components/admin/Sidebar';
import { Bell, UserCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | SANA Bakes',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Admin Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-end px-8 z-10 sticky top-0">
          <div className="flex items-center space-x-4">
            <button className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
              <Bell className="h-5 w-5" />
            </button>
            <div className="h-8 w-px bg-gray-200"></div>
            <button className="flex items-center text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors cursor-pointer">
              <UserCircle className="h-8 w-8 mr-2 text-slate-400" />
              Admin User
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
