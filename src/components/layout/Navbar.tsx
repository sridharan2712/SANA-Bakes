'use client';

import Link from 'next/link';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { openCart } from '@/store/cartSlice';
import { clearAuth } from '@/store/authSlice';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { LogOut } from 'lucide-react';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const cartItems = useAppSelector((state) => state.cart.items);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      dispatch(clearAuth());
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const scrollToFooter = () => {
    document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <img
                src="/logo.jpg"
                alt="Sana Bakes Logo"
                className="h-12 w-12 rounded-full object-cover border border-gray-100 shadow-sm"
              />
              <span className="text-2xl font-serif font-bold tracking-tight text-slate-900">
                SANA<span className="text-rose-600">.</span>
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <button onClick={() => router.push('/')} className="text-sm font-medium text-gray-700 hover:text-rose-600 transition-colors cursor-pointer">Home</button>
            <button onClick={() => router.push('/shop')} className="text-sm font-medium text-gray-700 hover:text-rose-600 transition-colors cursor-pointer">Shop</button>
            <button onClick={scrollToFooter} className="text-sm font-medium text-gray-700 hover:text-rose-600 transition-colors cursor-pointer">About</button>
            <button onClick={() => router.push('/contact')} className="text-sm font-medium text-gray-700 hover:text-rose-600 transition-colors cursor-pointer">Contact</button>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-slate-700">
                  <span className="text-sm font-medium">Hi, {user?.name.split(' ')[0]}</span>
                  <button onClick={() => router.push('/profile')} className="hover:text-rose-600 transition-colors cursor-pointer">
                    <User className="h-5 w-5" />
                  </button>
                </div>
                <button onClick={handleLogout} className="text-gray-500 hover:text-rose-600 transition-colors cursor-pointer" title="Sign Out">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button onClick={() => router.push('/login')} className="text-gray-700 hover:text-rose-600 transition-colors cursor-pointer">
                <User className="h-5 w-5" />
              </button>
            )}
            <button onClick={() => dispatch(openCart())} className="text-gray-700 hover:text-rose-600 transition-colors relative cursor-pointer">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-rose-600 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              <button onClick={() => { setIsMobileMenuOpen(false); router.push('/'); }} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-rose-600 hover:bg-rose-50 cursor-pointer">Home</button>
              <button onClick={() => { setIsMobileMenuOpen(false); router.push('/shop'); }} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-rose-600 hover:bg-rose-50 cursor-pointer">Shop</button>
              <button onClick={scrollToFooter} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-rose-600 hover:bg-rose-50 cursor-pointer">About</button>
              <button onClick={() => { setIsMobileMenuOpen(false); router.push('/contact'); }} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-rose-600 hover:bg-rose-50 cursor-pointer">Contact</button>
              <div className="pt-4 flex flex-col gap-4 px-3 border-t border-gray-50">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center space-x-3 text-slate-900 font-medium">
                      <User className="h-5 w-5" />
                      <span>{user?.name}</span>
                    </div>
                    <button onClick={() => { setIsMobileMenuOpen(false); router.push('/profile'); }} className="text-left text-gray-700 hover:text-rose-600 cursor-pointer text-sm">My Profile</button>
                    <button onClick={scrollToFooter} className="flex items-center text-rose-600 font-medium cursor-pointer text-sm">
                      <LogOut className="h-4 w-4 mr-2" /> Sign Out
                    </button>
                  </>
                ) : (
                  <button onClick={() => { setIsMobileMenuOpen(false); router.push('/login'); }} className="flex items-center text-gray-700 cursor-pointer">
                    <User className="h-5 w-5 mr-2" /> Login
                  </button>
                )}
                <button onClick={() => { setIsMobileMenuOpen(false); dispatch(openCart()); }} className="flex items-center text-gray-700 cursor-pointer">
                  <ShoppingCart className="h-5 w-5 mr-2" /> Cart ({cartCount})
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
