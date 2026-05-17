'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { AlertCircle, Loader2, Mail } from 'lucide-react';
import axios from 'axios';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      if (res.data.success) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to request secure OTP sequence');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-slate-50 min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <Mail className="mx-auto h-12 w-12 text-rose-600 mb-4" />
          <h2 className="text-3xl font-serif font-bold tracking-tight text-slate-900 mb-2">Check your email inbox</h2>
          <p className="text-slate-600 mb-6">If your email is registered, we have dispatched a secure 6-digit OTP to {email}</p>
          <Button onClick={() => router.push(`/reset-password?email=${encodeURIComponent(email)}`)} className="w-full">
            Enter OTP to Reset Password
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-serif font-bold tracking-tight text-slate-900">Reset your parameters</h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email to trigger a cryptographic recovery OTP session.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-2xl sm:px-10">
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input 
               label="Registered Email Address" 
               type="email" 
               required 
               value={email}
               onChange={(e) => setEmail(e.target.value)}
            />

            <div>
              <Button type="submit" disabled={isLoading} className="w-full h-11 text-base shadow-sm cursor-pointer">
                {isLoading ? <><Loader2 className="animate-spin h-5 w-5 mr-2" /> Dispatching OTP...</> : 'Send Recovery Sequence'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
             <Link href="/login" className="font-medium text-slate-600 hover:text-rose-600 transition-colors">
               Return to Gateway
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
