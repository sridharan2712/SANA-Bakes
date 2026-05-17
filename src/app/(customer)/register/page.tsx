'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/register', { name, email, password });
      if (res.data.success) {
        alert("Registration Complete! Proceeding to Login.");
        router.push('/login');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-serif font-bold tracking-tight text-slate-900">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-rose-600 hover:text-rose-500">
            Sign in
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

          <form className="space-y-6" onSubmit={handleRegister}>
            <Input 
              label="Full Name" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input 
              label="Email address" 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input 
              label="Password (Minimum 8 chars)" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <div className="flex border-t border-gray-100 pt-6">
              <Button type="submit" disabled={isLoading} className="w-full h-11 text-base shadow-sm">
                {isLoading ? <><Loader2 className="animate-spin h-5 w-5 mr-2" /> Building Account...</> : 'Register securely'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
