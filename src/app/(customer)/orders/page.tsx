'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/hooks/useRedux';
import { ShoppingBag, Package, Truck, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  message?: string | null;
  weightLabel?: string | null;
  isEggless?: boolean | null;
  shape?: string | null;
}

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/orders');
        setOrders(response.data.orders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-slate-900">Your Orders</h1>
          <p className="text-slate-600 mt-2">Welcome back, {user?.name}. Manage your recent purchases and delivery status.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <Loader2 className="h-10 w-10 text-rose-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium font-serif">Curating your sweet history...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.length > 0 ? (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
                  <div className="p-6 sm:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-6 border-b border-gray-100">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Order Transaction ID</p>
                        <h2 className="text-lg font-bold text-slate-900 font-mono">{order.id}</h2>
                      </div>
                      <div className="mt-4 sm:mt-0 text-left sm:text-right">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Placed On</p>
                        <p className="text-slate-700 font-medium">{new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}</p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-start justify-between text-slate-700 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                          <div className="flex items-start">
                            <div className="bg-rose-100 p-2 rounded-lg mr-3 mt-0.5">
                              <Package className="h-5 w-5 text-rose-600" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{item.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">Qty: {item.quantity} • ₹{item.price} each</p>
                              
                              {/* Customizations details */}
                              {(item.weightLabel || item.shape || item.isEggless || item.message) && (
                                <div className="mt-2 space-y-1 bg-white p-2 rounded-lg border border-slate-100 text-[11px] max-w-xs shadow-sm">
                                  {(item.weightLabel || item.shape || item.isEggless) && (
                                    <div className="flex flex-wrap gap-1.5 text-slate-600 font-medium">
                                      {item.weightLabel && <span className="bg-slate-100 px-1.5 py-0.5 rounded">{item.weightLabel}</span>}
                                      {item.shape && <span className="bg-slate-100 px-1.5 py-0.5 rounded">{item.shape}</span>}
                                      {item.isEggless && <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">Eggless</span>}
                                    </div>
                                  )}
                                  {item.message && (
                                    <div className="text-rose-700 font-semibold mt-1 flex items-center gap-1">
                                      🎂 Message: <span className="italic font-medium text-slate-700">"{item.message}"</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        {order.status === 'Delivered' ? (
                          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Delivered
                          </span>
                        ) : order.status === 'Cancelled' ? (
                          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <CheckCircle className="h-3.5 w-3.5 mr-1.5 rotate-45" /> Cancelled
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Truck className="h-3.5 w-3.5 mr-1.5" /> {order.status}
                          </span>
                        )}
                      </div>
                      <div className="mt-4 sm:mt-0 px-6 py-3 bg-slate-900 rounded-xl">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Order Total</p>
                        <p className="text-xl font-black text-white">₹{order.total.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-16 text-center border-2 border-dashed border-slate-200">
                <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">No orders yet</h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-8">It looks like you haven't indulged in our treats yet. Your sweet journey begins with your first order!</p>
                <a href="/shop" className="inline-flex items-center px-8 py-3 bg-rose-500 text-white font-bold rounded-full hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200">
                  Browse Menu
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
