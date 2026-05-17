'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, MapPin, Package, Loader2, Plus, Trash2, Edit2, Star } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [profile, setProfile] = useState<any>({});
  const [addresses, setAddresses] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const [addressForm, setAddressForm] = useState({
    id: '',
    address: '',
    is_default: false,
    isOpen: false,
  });

  useEffect(() => {
    fetchProfileData();
    fetchOrders();
  }, []);

  const fetchProfileData = async () => {
    try {
      const { data } = await axios.get('/api/profile');
      setProfile({ ...data.profile, name: data.user?.name || '', email: data.user?.email || '' });
      setAddresses(data.addresses);
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login');
      } else {
        toast.error('Failed to load profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/api/orders');
      setOrders(data.orders);
    } catch (error) {
      console.error('Failed to load orders', error);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await axios.put('/api/profile', profile);
      toast.success('Profile saved successfully');
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (addressForm.id) {
        await axios.put(`/api/address/${addressForm.id}`, {
          address: addressForm.address,
          is_default: addressForm.is_default,
        });
        toast.success('Address updated');
      } else {
        await axios.post('/api/address', {
          address: addressForm.address,
          is_default: addresses.length === 0 ? true : addressForm.is_default,
        });
        toast.success('Address added');
      }
      setAddressForm({ id: '', address: '', is_default: false, isOpen: false });
      fetchProfileData();
    } catch (error) {
      toast.error('Failed to save address');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await axios.delete(`/api/address/${id}`);
      toast.success('Address deleted');
      fetchProfileData();
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  const setAsDefault = async (id: string) => {
    try {
      await axios.put(`/api/address/${id}`, { is_default: true });
      toast.success('Default address updated');
      fetchProfileData();
    } catch (error) {
      toast.error('Failed to set default address');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-rose-600" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-8">My Account</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors ${activeTab === 'profile' ? 'bg-rose-50 text-rose-600 border-l-4 border-rose-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <User className="h-5 w-5" />
                <span className="font-medium">My Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors ${activeTab === 'addresses' ? 'bg-rose-50 text-rose-600 border-l-4 border-rose-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <MapPin className="h-5 w-5" />
                <span className="font-medium">Saved Addresses</span>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors ${activeTab === 'orders' ? 'bg-rose-50 text-rose-600 border-l-4 border-rose-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Package className="h-5 w-5" />
                <span className="font-medium">Order History</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Personal Information</h2>
                <form onSubmit={saveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Full Name" name="name" value={profile.name || ''} onChange={handleProfileChange} required />
                    <Input label="Email Address" type="email" value={profile.email || ''} disabled />
                    <Input label="Mobile Number" name="mobile" type="tel" value={profile.mobile || ''} onChange={handleProfileChange} required />
                    <Input label="Alternate Number" name="alternate_mobile" type="tel" value={profile.alternate_mobile || ''} onChange={handleProfileChange} />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mt-8 mb-4 border-b pb-2">Primary Address Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Address Line 1" name="address_line_1" value={profile.address_line_1 || ''} onChange={handleProfileChange} required className="md:col-span-2" />
                    <Input label="Address Line 2 (Optional)" name="address_line_2" value={profile.address_line_2 || ''} onChange={handleProfileChange} className="md:col-span-2" />
                    <Input label="City" name="city" value={profile.city || ''} onChange={handleProfileChange} required />
                    <Input label="State" name="state" value={profile.state || ''} onChange={handleProfileChange} required />
                    <Input label="Pincode" name="pincode" value={profile.pincode || ''} onChange={handleProfileChange} required />
                    <Input label="Country" name="country" value={profile.country || 'India'} onChange={handleProfileChange} />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : 'Save Profile'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Saved Addresses</h2>
                  <Button onClick={() => setAddressForm({ id: '', address: '', is_default: false, isOpen: true })} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" /> Add New
                  </Button>
                </div>

                {addressForm.isOpen && (
                  <form onSubmit={saveAddress} className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6 space-y-4">
                    <h3 className="font-semibold text-slate-900">{addressForm.id ? 'Edit Address' : 'Add New Address'}</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Address</label>
                        <textarea
                          required
                          value={addressForm.address}
                          onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 min-h-[100px]"
                          placeholder="Enter your complete delivery address"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="is_default"
                          checked={addressForm.is_default}
                          onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                          className="rounded text-rose-600 focus:ring-rose-500"
                        />
                        <label htmlFor="is_default" className="text-sm text-slate-700">Set as default address</label>
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end">
                      <Button type="button" variant="outline" onClick={() => setAddressForm({ ...addressForm, isOpen: false })}>Cancel</Button>
                      <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Address'}</Button>
                    </div>
                  </form>
                )}

                <div className="space-y-4">
                  {addresses.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No saved addresses found.</p>
                  ) : (
                    addresses.map((addr) => (
                      <div key={addr.id} className={`p-4 rounded-xl border ${addr.is_default ? 'border-rose-200 bg-rose-50/50' : 'border-slate-100'}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {addr.is_default && <span className="bg-rose-100 text-rose-700 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center"><Star className="h-3 w-3 mr-1 fill-rose-700" /> Default</span>}
                            </div>
                            <p className="text-slate-700 whitespace-pre-wrap">{addr.address}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!addr.is_default && (
                              <button onClick={() => setAsDefault(addr.id)} className="text-sm text-slate-500 hover:text-slate-900 px-3 py-1 bg-white rounded-md border shadow-sm">
                                Set Default
                              </button>
                            )}
                            <button onClick={() => setAddressForm({ id: addr.id, address: addr.address, is_default: addr.is_default, isOpen: true })} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => deleteAddress(addr.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Order History</h2>
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">You haven't placed any orders yet.</p>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="p-4 sm:p-6 rounded-xl border border-slate-100">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                          <div>
                            <p className="text-sm text-slate-500 mb-1">Order #{order.id.substring(0, 8).toUpperCase()}</p>
                            <p className="font-medium text-slate-900">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex flex-col sm:items-end gap-1">
                            <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                              {order.status}
                            </span>
                            <p className="font-bold text-slate-900">₹{order.total.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="border-t border-slate-100 pt-4 mt-4">
                          {order.items.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between text-sm py-1">
                              <span className="text-slate-600">{item.quantity}x {item.name}</span>
                              <span className="font-medium text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
