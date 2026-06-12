'use client';

import { Search, Eye, Filter, Loader2, Package, X, ExternalLink, CheckCircle2, XCircle, Image as ImageIcon, Phone, MapPin, Calendar, Clock, User as UserIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const STATUS_COLORS: Record<string, string> = {
  'Pending': 'bg-amber-100 text-amber-800 border border-amber-200',
  'Processing': 'bg-blue-100 text-blue-800 border border-blue-200',
  'CONFIRMED': 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  'Delivered': 'bg-green-100 text-green-800 border border-green-200',
  'Cancelled': 'bg-rose-100 text-rose-800 border border-rose-200',
  'PAYMENT_FAILED': 'bg-red-100 text-red-800 border border-red-200',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  'PENDING': 'bg-amber-100 text-amber-800 border border-amber-200',
  'SCREENSHOT_UPLOADED': 'bg-blue-100 text-blue-800 border border-blue-200',
  'VERIFIED': 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  'REJECTED': 'bg-rose-100 text-rose-800 border border-rose-200',
};

const TIME_SLOT_LABELS: Record<string, string> = {
  '10-12': '10:00 AM - 12:00 PM',
  '12-2': '12:00 PM - 02:00 PM',
  '2-4': '02:00 PM - 04:00 PM',
  '4-6': '04:00 PM - 06:00 PM',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/admin/orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders');
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenDetails = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setIsUpdatingStatus(true);
    try {
      const res = await axios.put(`/api/admin/orders/${selectedOrder.id}`, { status: newStatus });
      if (res.data.success) {
        toast.success('Order status updated successfully');
        setSelectedOrder({ ...selectedOrder, status: newStatus });
        fetchOrders();
      }
    } catch (err) {
      console.error('Failed to update status', err);
      toast.error('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePaymentAction = async (action: 'approve' | 'reject') => {
    if (!selectedOrder) return;
    if (!confirm(`Are you sure you want to ${action} this payment?`)) return;

    setActionLoadingId(selectedOrder.id);
    try {
      const res = await axios.put(`/api/admin/payments/${selectedOrder.id}`, { action });
      if (res.data.success) {
        toast.success(`Payment ${action}d successfully`);
        const updatedStatus = action === 'approve' ? 'CONFIRMED' : 'PAYMENT_FAILED';
        const updatedPaymentStatus = action === 'approve' ? 'VERIFIED' : 'REJECTED';
        
        const newOrderState = {
          ...selectedOrder,
          status: updatedStatus,
          payment_status: updatedPaymentStatus
        };
        setSelectedOrder(newOrderState);
        setNewStatus(updatedStatus);
        fetchOrders();
      }
    } catch (error) {
      console.error(`Failed to ${action} payment`, error);
      toast.error(`Failed to ${action} payment`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const orderIdMatch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const customerNameMatch = order.user.name.toLowerCase().includes(searchQuery.toLowerCase());
    const customerEmailMatch = order.user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const queryMatch = orderIdMatch || customerNameMatch || customerEmailMatch;

    const statusMatch = statusFilter ? order.status === statusFilter : true;

    return queryMatch && statusMatch;
  });

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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/50 gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by order ID or customer..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Status Filter:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="PAYMENT_FAILED">Payment Failed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="p-4 font-semibold">Order ID</th>
                <th className="p-4 font-semibold">Date &amp; Time</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Items</th>
                <th className="p-4 font-semibold">Total Amount</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                    <td className="p-4 font-medium text-slate-900 font-mono">#{order.id.substring(0, 8).toUpperCase()}</td>
                    <td className="p-4 text-slate-500">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-slate-900">
                      <div className="font-medium">{order.user.name}</div>
                      <div className="text-xs text-slate-400">{order.user.email}</div>
                    </td>
                    <td className="p-4 text-slate-600">{order.items.length} items</td>
                    <td className="p-4 font-bold text-slate-900">₹{order.total.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-0.5 text-xs rounded-full font-medium ${STATUS_COLORS[order.status] || 'bg-slate-100 border border-slate-200 text-slate-800'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleOpenDetails(order)} 
                        className="text-slate-500 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <Package className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    No orders matching the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-lg">Order Details</h3>
                <span className="font-mono text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium select-all">
                  #{selectedOrder.id}
                </span>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Column: Customer & Delivery */}
                <div className="space-y-6">
                  
                  {/* Customer Card */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-3">
                      <UserIcon className="h-4.5 w-4.5 text-rose-500" />
                      <h4>Customer Information</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Name:</span>
                        <span className="font-medium text-slate-800">{selectedOrder.user.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Email:</span>
                        <span className="font-medium text-slate-800">{selectedOrder.user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phone:</span>
                        <span className="font-medium text-slate-800 flex items-center gap-1">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {selectedOrder.user.profile?.mobile || 'Not provided'}
                        </span>
                      </div>
                      {selectedOrder.user.profile?.alternate_mobile && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Alt Phone:</span>
                          <span className="font-medium text-slate-800">{selectedOrder.user.profile.alternate_mobile}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery Schedule & Address Card */}
                  <div className="bg-rose-50/10 border border-rose-100 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 font-semibold text-slate-900 border-b border-rose-100 pb-2 mb-3">
                      <MapPin className="h-4.5 w-4.5 text-rose-500" />
                      <h4>Delivery Details</h4>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="bg-rose-50 p-2 rounded-lg text-rose-600 flex-shrink-0">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Delivery Date</p>
                          <p className="font-bold text-slate-800">{selectedOrder.delivery_date || 'Not specified'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-rose-50 p-2 rounded-lg text-rose-600 flex-shrink-0">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Delivery Window</p>
                          <p className="font-bold text-slate-800">
                            {selectedOrder.time_slot ? (TIME_SLOT_LABELS[selectedOrder.time_slot] || selectedOrder.time_slot) : 'Not specified'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 pt-1 border-t border-rose-100/50 mt-1">
                        <div className="bg-rose-50 p-2 rounded-lg text-rose-600 flex-shrink-0 mt-0.5">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Delivery Address</p>
                          <p className="font-semibold text-slate-800 mt-0.5">{selectedOrder.delivery_address || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Column: Ordered Items & Payments */}
                <div className="space-y-6">

                  {/* Items Ordered Card */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-3">
                      <Package className="h-4.5 w-4.5 text-rose-500" />
                      <h4>Items Ordered</h4>
                    </div>
                    <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                      {selectedOrder.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                          <div className="flex-1 pr-4">
                            <p className="font-medium text-slate-800">{item.name}</p>
                            <p className="text-xs text-slate-400">Qty: {item.quantity} • ₹{item.price} each</p>
                          </div>
                          <span className="font-bold text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-slate-100 pt-3 mt-3 flex justify-between items-center bg-slate-50/50 p-2.5 rounded-lg">
                      <span className="font-bold text-sm text-slate-600">Total Amount:</span>
                      <span className="font-black text-lg text-rose-600">₹{selectedOrder.total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Payment Info Card */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                      <div className="flex items-center gap-2 font-semibold text-slate-900">
                        <ImageIcon className="h-4.5 w-4.5 text-rose-500" />
                        <h4>Payment Details</h4>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${PAYMENT_STATUS_COLORS[selectedOrder.payment_status] || 'bg-slate-100'}`}>
                        {selectedOrder.payment_status?.replace('_', ' ') || 'PENDING'}
                      </span>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Method:</span>
                        <span className="font-semibold text-slate-800">{selectedOrder.payment_method || 'UPI'}</span>
                      </div>
                      {selectedOrder.payment_id && (
                        <div className="flex justify-between font-mono text-xs">
                          <span className="text-slate-400 font-sans">Payment Transaction ID:</span>
                          <span className="text-slate-800">{selectedOrder.payment_id}</span>
                        </div>
                      )}
                      {selectedOrder.screenshot_path ? (
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-slate-500">Payment Screenshot Proof:</span>
                          <button 
                            onClick={() => setSelectedImage(selectedOrder.screenshot_path)}
                            className="flex items-center text-rose-600 hover:text-rose-700 hover:underline font-semibold"
                          >
                            <ImageIcon className="h-4 w-4 mr-1" /> View Screenshot
                          </button>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-slate-100 text-center text-slate-400 italic text-xs">
                          No screenshot proof uploaded
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>

              {/* Status Update & Admin Actions Bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                
                {/* Order Status Select */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                  <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">Update Order Status:</label>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white min-w-[140px] flex-1 sm:flex-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="PAYMENT_FAILED">Payment Failed</option>
                    </select>
                    <button
                      onClick={handleUpdateStatus}
                      disabled={isUpdatingStatus || newStatus === selectedOrder.status}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isUpdatingStatus ? <Loader2 className="animate-spin h-4 w-4" /> : 'Save'}
                    </button>
                  </div>
                </div>

                {/* Quick Payment Verification Actions */}
                {selectedOrder.payment_status === 'SCREENSHOT_UPLOADED' && (
                  <div className="flex items-center gap-2 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-200/60 justify-end">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">Quick Payment Action:</span>
                    <button
                      onClick={() => handlePaymentAction('approve')}
                      disabled={actionLoadingId === selectedOrder.id}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {actionLoadingId === selectedOrder.id ? <Loader2 className="animate-spin h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 mr-1.5" />}
                      Approve Payment
                    </button>
                    <button
                      onClick={() => handlePaymentAction('reject')}
                      disabled={actionLoadingId === selectedOrder.id}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {actionLoadingId === selectedOrder.id ? <Loader2 className="animate-spin h-4 w-4" /> : <XCircle className="h-4 w-4 mr-1.5" />}
                      Reject Payment
                    </button>
                  </div>
                )}

              </div>

            </div>
          </div>
        </div>
      )}

      {/* Lightbox Screenshot Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setSelectedImage(null)}>
          <div className="bg-white rounded-xl overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Payment Screenshot</h3>
              <div className="flex space-x-2">
                <a href={selectedImage} target="_blank" rel="noreferrer" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
                  <ExternalLink className="h-5 w-5" />
                </a>
                <button onClick={() => setSelectedImage(null)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto flex-1 bg-slate-100 flex justify-center items-center">
              <img src={selectedImage} alt="Payment Proof" className="max-w-full max-h-full object-contain rounded border border-slate-200" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
