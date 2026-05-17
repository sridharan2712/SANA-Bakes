'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertCircle, Loader2, KeyRound, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultEmail = searchParams.get('email') || '';
  
  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const res = await axios.post('/api/auth/reset-password', { email, otp, newPassword });
      if (res.data.success) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Validation sequence rejected internally.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
         <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
         <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Cryptographic Refresh Approved</h2>
         <p className="text-slate-600 mb-6">Your security identity has been strongly restored.</p>
         <Link href="/login">
            <Button className="w-full">Proceed to Identity Console</Button>
         </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <KeyRound className="mx-auto h-12 w-12 text-rose-600 mb-4" />
        <h2 className="text-3xl font-serif font-bold tracking-tight text-slate-900">Configure Identity</h2>
        <p className="mt-2 text-sm text-gray-600">
          Inject the explicit 6-digit OTP sent to your target email domain.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mr-2" />
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <Input 
           label="Origin Email Address" 
           type="email" 
           required 
           value={email}
           onChange={(e) => setEmail(e.target.value)}
        />
        <Input 
           label="6-Digit Secure OTP Array" 
           type="text" 
           required 
           maxLength={6}
           value={otp}
           onChange={(e) => setOtp(e.target.value)}
        />
        <Input 
           label="Strong Password Parameters" 
           type="password" 
           required 
           value={newPassword}
           onChange={(e) => setNewPassword(e.target.value)}
        />

        <div>
          <Button type="submit" disabled={isLoading} className="w-full h-11 text-base shadow-sm cursor-pointer">
            {isLoading ? <><Loader2 className="animate-spin h-5 w-5 mr-2" /> Executing Signature...</> : 'Save Protected Hash'}
          </Button>
        </div>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-slate-50 min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-2xl sm:px-10">
          <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin text-rose-600" /></div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
