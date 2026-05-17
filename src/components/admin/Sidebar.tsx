'use client';

import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, ShoppingCart, Users, CreditCard, Settings, LogOut } from 'lucide-react';
import { useAppDispatch } from '@/hooks/useRedux';
import { clearAuth } from '@/store/authSlice';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';

export function Sidebar() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      dispatch(clearAuth());
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path: string) => pathname === path;
  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col min-h-screen">
      <div className="h-20 flex items-center px-6 border-b border-slate-800">
        <Link href="/admin" className="text-2xl font-serif font-bold tracking-tight text-white">
          SANA<span className="text-rose-500">.</span> <span className="text-sm font-sans font-normal text-slate-400">Admin</span>
        </Link>
      </div>
      
      <div className="flex-1 py-8 px-4 space-y-1">
        <Link href="/admin" className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive('/admin') ? 'bg-rose-600/10 text-rose-500' : 'hover:bg-slate-800 hover:text-white'}`}>
          <LayoutDashboard className="h-5 w-5 mr-3" /> Dashboard
        </Link>
        <Link href="/admin/products" className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive('/admin/products') ? 'bg-rose-600/10 text-rose-500' : 'hover:bg-slate-800 hover:text-white'}`}>
          <ShoppingBag className="h-5 w-5 mr-3" /> Products
        </Link>
        <Link href="/admin/orders" className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive('/admin/orders') ? 'bg-rose-600/10 text-rose-500' : 'hover:bg-slate-800 hover:text-white'}`}>
          <ShoppingCart className="h-5 w-5 mr-3" /> Orders
        </Link>
        <Link href="/admin/customers" className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive('/admin/customers') ? 'bg-rose-600/10 text-rose-500' : 'hover:bg-slate-800 hover:text-white'}`}>
          <Users className="h-5 w-5 mr-3" /> Customers
        </Link>
        <Link href="/admin/payments" className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive('/admin/payments') ? 'bg-rose-600/10 text-rose-500' : 'hover:bg-slate-800 hover:text-white'}`}>
          <CreditCard className="h-5 w-5 mr-3" /> Payments
        </Link>
      </div>

      <div className="p-4 border-t border-slate-800">
        <Link href="/admin/settings" className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive('/admin/settings') ? 'bg-rose-600/10 text-rose-500' : 'hover:bg-slate-800 hover:text-white'}`}>
          <Settings className="h-5 w-5 mr-3" /> Settings
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer">
          <LogOut className="h-5 w-5 mr-3" /> Logout
        </button>
      </div>
    </div>
  );
}
