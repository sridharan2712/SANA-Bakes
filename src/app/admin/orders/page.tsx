'use client';

import { Search, Eye, Filter, Loader2, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const STATUS_COLORS: Record<string, string> = {
  'Pending': 'bg-amber-100 text-amber-800',
  'Processing': 'bg-blue-100 text-blue-800',
  'Delivered': 'bg-green-100 text-green-800',
  'Cancelled': 'bg-red-100 text-red-800',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('/api/admin/orders');
        setOrders(res.data.orders);
      } catch (err) {
        console.error('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-rose-500" />
        <p className="animate-pulse">Loading secure order vault...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-sm text-slate-500">Monitor and update customer orders.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by order ID or customer..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div className="flex space-x-2">
            <button onClick={() => alert('Filter UI opened')} className="flex items-center px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-slate-50 font-medium text-slate-700 cursor-pointer">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-xs uppercase tracking-wider text-slate-500">
                <th className="p-4 font-semibold">Order ID</th>
                <th className="p-4 font-semibold">Date &amp; Time</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Items</th>
                <th className="p-4 font-semibold">Total Amount</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                    <td className="p-4 font-medium text-slate-900">#{order.id.substring(0, 8).toUpperCase()}</td>
                    <td className="p-4 text-slate-500">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-slate-900">
                      <div className="font-medium">{order.user.name}</div>
                      <div className="text-xs text-slate-400">{order.user.email}</div>
                    </td>
                    <td className="p-4 text-slate-600">{order.items.length} items</td>
                    <td className="p-4 font-bold text-slate-900">₹{order.total.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_COLORS[order.status] || 'bg-slate-100'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => alert('Viewing order detailed context...')} className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"><Eye className="h-4 w-4 inline" /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <Package className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    No orders recorded in the live database yet.
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
