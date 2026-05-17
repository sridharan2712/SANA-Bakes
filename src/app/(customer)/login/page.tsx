'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import Script from 'next/script';

declare global {
  interface Window {
    google: any;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.success) {
        const userRole = res.data.user.role;
        // Hard navigation applies the incoming HttpOnly cookie at the root layout
        if (userRole === 'ADMIN') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/';
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Database Verification failed! Access Denied.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-serif font-bold tracking-tight text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{' '}
          <Link href="/register" className="font-medium text-rose-600 hover:text-rose-500">
            register for a new corporate account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-2xl sm:px-10">
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <Input 
               label="Email address" 
               type="email" 
               required 
               value={email}
               onChange={(e) => setEmail(e.target.value)}
            />
            <Input 
               label="Password" 
               type="password" 
               required 
               value={password}
               onChange={(e) => setPassword(e.target.value)}
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded cursor-pointer" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-rose-600 hover:text-rose-500 transition-colors">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <Button type="submit" disabled={isLoading} className="w-full h-11 text-base shadow-sm">
                {isLoading ? <><Loader2 className="animate-spin h-5 w-5 mr-2" /> Verifying...</> : 'Sign in securely'}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Script 
                src="https://accounts.google.com/gsi/client" 
                strategy="afterInteractive"
                onLoad={() => {
                  if (window.google) {
                    window.google.accounts.id.initialize({
                      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your_google_client_id_here',
                      callback: async (response: any) => {
                        setIsLoading(true);
                        setError('');
                        try {
                          const res = await axios.post('/api/auth/google', { credential: response.credential });
                          if (res.data.success) {
                            const userRole = res.data.user.role;
                            if (userRole === 'ADMIN') {
                              window.location.href = '/admin';
                            } else {
                              window.location.href = '/';
                            }
                          }
                        } catch (err: any) {
                          setError(err.response?.data?.error || "Real Google Sign-In failed. Check Client ID.");
                          setIsLoading(false);
                        }
                      }
                    });
                    window.google.accounts.id.renderButton(
                      document.getElementById("googleSignInButton"),
                      { theme: "outline", size: "large", width: "100%", text: "continue_with" }
                    );
                  }
                }}
              />
              <div id="googleSignInButton" className="w-full"></div>
            </div>
            
            {/* Fallback mock button for local testing without Client ID */}
            {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
              <p className="mt-4 text-[10px] text-gray-400 text-center">
                Mock mode: Update NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local for real popup
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
