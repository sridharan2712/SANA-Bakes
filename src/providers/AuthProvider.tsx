'use client';

import { useEffect, ReactNode } from 'react';
import { useAppDispatch } from '@/hooks/useRedux';
import { setUser, clearAuth, setLoading } from '@/store/authSlice';
import axios from 'axios';

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/api/auth/me');
        console.log('Auth Check Result:', res.data);
        if (res.data.user) {
          dispatch(setUser(res.data.user));
        }
      } catch (error) {
        console.log('Auth Check Failed');
        dispatch(clearAuth());
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchUser();
  }, [dispatch]);

  return <>{children}</>;
}
