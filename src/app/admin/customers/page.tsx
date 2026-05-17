'use client';

import { Search, Mail, Phone, Loader2, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get('/api/admin/customers');
        setCustomers(res.data.customers);
      } catch (err) {
        console.error('Failed to load customers');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-rose-500" />
        <p className="animate-pulse">Fetching active customer profiles...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">View and manage customer accounts and history.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-xs uppercase tracking-wider text-slate-500">
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Total Orders</th>
                <th className="p-4 font-semibold">Joined Date</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.length > 0 ? (
                customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{cust.name}</div>
                      <div className="text-xs text-slate-400">ID: {cust.id.substring(0, 8)}</div>
                    </td>
                    <td className="p-4 text-slate-600">
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-2 text-slate-400" /> {cust.email}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-900">{cust._count.orders} Orders</td>
                    <td className="p-4 text-slate-600">{new Date(cust.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => alert('Contacting customer...')} className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"><Phone className="h-4 w-4 inline" /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    No registered customers found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
