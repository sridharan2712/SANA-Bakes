'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, CheckCircle2, XCircle, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';

// Converts a File to a base64 data URL (no server upload needed)
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Settings
  const [upiId, setUpiId] = useState('');
  const [upiQrImage, setUpiQrImage] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isUploadingQr, setIsUploadingQr] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data } = await axios.get('/api/admin/payments');
      if (data.success) {
        setPayments(data.payments);
      }
      
      const settingsRes = await axios.get('/api/admin/settings');
      if (settingsRes.data.success) {
        const { UPI_ID, UPI_QR_IMAGE } = settingsRes.data.settings;
        if (UPI_ID) setUpiId(UPI_ID);
        if (UPI_QR_IMAGE) setUpiQrImage(UPI_QR_IMAGE);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please use JPG, PNG, or WEBP.');
      return;
    }
    // Validate size (2MB limit for base64 storage)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large. Please use an image under 2MB.');
      return;
    }

    setSelectedFileName(file.name);
    setIsUploadingQr(true);
    try {
      const base64 = await fileToBase64(file);
      setUpiQrImage(base64);
      toast.success('QR image ready. Click Save Settings to apply.');
    } catch {
      toast.error('Failed to read image file.');
      setSelectedFileName(null);
    } finally {
      setIsUploadingQr(false);
    }
  };

  const saveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await axios.put('/api/admin/settings', {
        settings: {
          UPI_ID: upiId,
          UPI_QR_IMAGE: upiQrImage
        }
      });
      toast.success("Payment settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    if (!confirm(`Are you sure you want to ${action} this payment?`)) return;

    setActionLoadingId(id);
    try {
      const { data } = await axios.put(`/api/admin/payments/${id}`, { action });
      if (data.success) {
        toast.success(`Payment ${action}d successfully`);
        fetchPayments(); // Refresh list
      }
    } catch (error) {
      toast.error(`Failed to ${action} payment`);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-rose-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Payment Verification</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Payment Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">UPI ID</label>
            <input 
              type="text" 
              value={upiId} 
              onChange={(e) => setUpiId(e.target.value)} 
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="e.g. 9003363329@axl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Custom QR Code Image</label>
            <div className="flex items-center gap-3 flex-wrap">
              {upiQrImage && (
                <img src={upiQrImage} alt="QR Code" className="h-14 w-14 object-contain border border-slate-200 rounded-lg shadow-sm" />
              )}
              <label
                htmlFor="qr-upload"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium cursor-pointer transition-colors ${
                  isUploadingQr
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-white text-rose-600 border-rose-300 hover:bg-rose-50 hover:border-rose-500'
                }`}
              >
                {isUploadingQr ? (
                  <><Loader2 className="animate-spin h-4 w-4" /> Uploading…</>
                ) : (
                  <><ImageIcon className="h-4 w-4" /> {selectedFileName ? 'Change QR Image' : 'Choose QR Image'}</>
                )}
              </label>
              <input
                id="qr-upload"
                type="file"
                accept="image/*"
                onChange={handleQrUpload}
                disabled={isUploadingQr}
                className="sr-only"
              />
              {selectedFileName && !isUploadingQr && (
                <span className="text-xs text-slate-500 truncate max-w-[160px]" title={selectedFileName}>
                  {selectedFileName}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button 
            onClick={saveSettings} 
            disabled={isSavingSettings}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none disabled:opacity-50"
          >
            {isSavingSettings ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
            Save Settings
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Screenshot</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No payments found for verification.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{payment.id.split('-')[0]}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{payment.user?.name}</div>
                      <div className="text-xs text-slate-500">{payment.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">₹{payment.total.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.payment_status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                        payment.payment_status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.payment_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {payment.screenshot_path ? (
                        <button 
                          onClick={() => setSelectedImage(payment.screenshot_path)}
                          className="flex items-center text-rose-600 hover:text-rose-700 hover:underline"
                        >
                          <ImageIcon className="h-4 w-4 mr-1" /> View Proof
                        </button>
                      ) : (
                        <span className="text-slate-400 italic">No Screenshot</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {payment.payment_status === 'SCREENSHOT_UPLOADED' && (
                        <>
                          <button
                            onClick={() => handleAction(payment.id, 'approve')}
                            disabled={actionLoadingId === payment.id}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50"
                          >
                            {actionLoadingId === payment.id ? <Loader2 className="animate-spin h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(payment.id, 'reject')}
                            disabled={actionLoadingId === payment.id}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none disabled:opacity-50"
                          >
                            {actionLoadingId === payment.id ? <Loader2 className="animate-spin h-4 w-4" /> : <XCircle className="h-4 w-4 mr-1" />}
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
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
            <div className="p-4 overflow-auto flex-1 bg-slate-50 flex justify-center items-center">
              <img src={selectedImage} alt="Payment Proof" className="max-w-full max-h-full object-contain rounded border border-slate-200" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
