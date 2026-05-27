'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckCircle2, ChevronRight, Upload, Loader2, CreditCard, Smartphone, Monitor, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { clearCart } from '@/store/cartSlice';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import { QRCodeSVG } from 'qrcode.react';

export default function CheckoutPage() {
  const { items } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    toast.success("UPI ID copied!");
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(total.toString());
    setCopiedAmount(true);
    toast.success("Amount copied!");
    setTimeout(() => setCopiedAmount(false), 2000);
  };
  
  const [profile, setProfile] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  const [screenshotPath, setScreenshotPath] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [contactForm, setContactForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [deliveryForm, setDeliveryForm] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    pincode: '',
    date: '',
    timeSlot: '',
  });

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const upiId = "ssridharan449@oksbi";
  const upiIntentUrl = `upi://pay?pa=${upiId}&pn=CakeShop&cu=INR`;

  useEffect(() => {
    // Basic device detection
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('/api/profile');
        const p = data.profile;
        const addrs = data.addresses;
        const u = data.user;

        // Check if profile is complete
        const hasAddress = addrs.length > 0 || (p?.address_line_1 && p?.city && p?.pincode);
        if (!u?.name || !p?.mobile || !p?.pincode || !hasAddress) {
          toast.warning("Please complete your profile before placing order");
          router.push('/profile');
          return;
        }

        setProfile({ ...p, name: u.name, email: u.email });
        setAddresses(addrs);

        const nameParts = u.name.split(' ');
        setContactForm({
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: u.email || '',
          phone: p.mobile || '',
        });

        const defaultAddr = addrs.find((a: any) => a.is_default) || addrs[0];
        if (defaultAddr) {
           setSelectedAddressId(defaultAddr.id);
           setDeliveryForm(prev => ({
             ...prev,
             addressLine1: defaultAddr.address,
             city: p.city || '',
             pincode: p.pincode || '',
           }));
        } else {
           setSelectedAddressId('profile');
           setDeliveryForm(prev => ({
             ...prev,
             addressLine1: p.address_line_1 || '',
             addressLine2: p.address_line_2 || '',
             city: p.city || '',
             pincode: p.pincode || '',
           }));
        }

        setIsLoadingProfile(false);
      } catch (error: any) {
        if (error.response?.status === 401) {
          router.push('/login');
        } else {
          toast.error("Failed to load profile");
          router.push('/profile');
        }
      }
    };

    if (items.length > 0) {
      fetchProfile();
    }
  }, [items.length, router]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedAddressId(id);
    if (id === 'profile') {
        setDeliveryForm(prev => ({
          ...prev,
          addressLine1: profile.address_line_1 || '',
          addressLine2: profile.address_line_2 || '',
          city: profile.city || '',
          pincode: profile.pincode || '',
        }));
    } else {
        const addr = addresses.find(a => a.id === id);
        if (addr) {
            setDeliveryForm(prev => ({
              ...prev,
              addressLine1: addr.address,
              addressLine2: '',
              city: profile?.city || '',
              pincode: profile?.pincode || '',
            }));
        }
    }
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  const handleDeliveryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setDeliveryForm({ ...deliveryForm, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setScreenshotPath(res.data.path);
        toast.success("Payment screenshot uploaded successfully!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotPath) {
      toast.error("Please upload payment screenshot to confirm the order.");
      return;
    }
    
    setIsProcessing(true);

    try {
      const { data } = await axios.post('/api/orders', {
        items,
        total,
        screenshot_path: screenshotPath,
        payment_method: 'UPI'
      });

      if (data.success) {
        setIsSuccess(true);
        dispatch(clearCart());
      } else {
        toast.error("Order creation failed. Your money has not been debited.");
      }
    } catch (error: any) {
       console.error(error);
       toast.error("An error occurred while confirming your order. Your money has not been debited.");
    } finally {
       setIsProcessing(false);
    }
  };

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">Your cart is empty</h2>
        <Button onClick={() => router.push('/shop')}>Back to Shop</Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <CheckCircle2 className="h-20 w-20 text-green-500 mb-6" />
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">Order Received!</h1>
        <p className="text-slate-600 max-w-md mx-auto mb-8">
          Thank you for choosing SANA Bakes. Your order has been placed and is pending payment verification. Once our team verifies your payment screenshot, your order will be confirmed!
        </p>
        <Button size="lg" onClick={() => router.push('/profile')}>View Order Status</Button>
      </div>
    );
  }

  if (isLoadingProfile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-rose-600 mb-4" />
        <p className="text-slate-600">Loading your secure profile details...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <Link href="/cart" className="hover:text-rose-600">Cart</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-slate-900 font-medium">Checkout & Payment</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <form onSubmit={handleConfirmOrder} className="space-y-8">
              
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="First Name" name="firstName" value={contactForm.firstName} onChange={handleContactChange} required />
                  <Input label="Last Name" name="lastName" value={contactForm.lastName} onChange={handleContactChange} required />
                  <Input label="Email Address" type="email" name="email" value={contactForm.email} onChange={handleContactChange} required className="md:col-span-2" />
                  <Input label="Phone Number" type="tel" name="phone" value={contactForm.phone} onChange={handleContactChange} required className="md:col-span-2" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                   <h2 className="text-xl font-semibold text-slate-900">Delivery Details</h2>
                   {addresses.length > 0 && (
                      <select 
                         value={selectedAddressId} 
                         onChange={handleAddressChange}
                         className="text-sm border-gray-300 rounded-md shadow-sm focus:border-rose-500 focus:ring-rose-500"
                      >
                         <option value="profile">Profile Address</option>
                         {addresses.map(a => (
                            <option key={a.id} value={a.id}>
                               Saved Address {a.is_default ? '(Default)' : ''}
                            </option>
                         ))}
                      </select>
                   )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Address Line 1" name="addressLine1" value={deliveryForm.addressLine1} onChange={handleDeliveryChange} required className="md:col-span-2" />
                  <Input label="Address Line 2 (Optional)" name="addressLine2" value={deliveryForm.addressLine2} onChange={handleDeliveryChange} className="md:col-span-2" />
                  <Input label="City" name="city" value={deliveryForm.city} onChange={handleDeliveryChange} required />
                  <Input label="Pincode" name="pincode" value={deliveryForm.pincode} onChange={handleDeliveryChange} required />
                  <div className="md:col-span-2 flex gap-4 mt-2">
                    <Input label="Delivery Date" type="date" name="date" value={deliveryForm.date} onChange={handleDeliveryChange} required className="w-1/2" />
                    <div className="w-1/2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
                      <select name="timeSlot" value={deliveryForm.timeSlot} onChange={handleDeliveryChange} required className="flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent">
                         <option value="">Select slot</option>
                         <option value="10-12">10:00 AM - 12:00 PM</option>
                         <option value="12-2">12:00 PM - 02:00 PM</option>
                         <option value="2-4">02:00 PM - 04:00 PM</option>
                         <option value="4-6">04:00 PM - 06:00 PM</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Payment Method (UPI)</h2>
                
                <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-sm text-blue-800 font-medium mb-1">Payment Instructions:</p>
                  <ol className="list-decimal pl-4 text-sm text-blue-700 space-y-1">
                    <li>Pay exactly <strong>₹{total.toLocaleString()}</strong> using the options below.</li>
                    <li>Take a screenshot of the successful payment.</li>
                    <li>Upload the screenshot to confirm your order.</li>
                  </ol>
                </div>

                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 items-start">
                  <div className="mt-0.5 text-amber-600 flex-shrink-0">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                       <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                     </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900">Manual Amount Entry Required</h4>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      Due to UPI security standards for personal accounts, payment apps like Google Pay require you to **manually enter the exact amount (₹{total.toLocaleString()})** once the app opens.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">UPI ID to Pay</p>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">{upiId}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-rose-500 hover:text-rose-600 hover:bg-rose-50/50 shadow-sm transition-all"
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-green-600 animate-in fade-in zoom-in-75 duration-250" />
                          <span className="text-green-600 font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy UPI ID</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Amount to Enter</p>
                      <p className="text-sm font-bold text-rose-600 mt-0.5">₹{total.toLocaleString()}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyAmount}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-rose-500 hover:text-rose-600 hover:bg-rose-50/50 shadow-sm transition-all"
                    >
                      {copiedAmount ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-green-600 animate-in fade-in zoom-in-75 duration-250" />
                          <span className="text-green-600 font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Amount</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {isMobile ? (
                  <div className="space-y-4">
                     <div className="flex items-center text-slate-700 mb-4">
                        <Smartphone className="h-5 w-5 mr-2" />
                        <span className="font-medium">Tap to pay with your UPI app</span>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <a href={upiIntentUrl} className="flex items-center justify-center p-3 border border-gray-200 rounded-xl hover:border-rose-500 hover:bg-rose-50 transition-colors">
                           <span className="font-medium text-slate-800">Google Pay</span>
                        </a>
                        <a href={upiIntentUrl} className="flex items-center justify-center p-3 border border-gray-200 rounded-xl hover:border-rose-500 hover:bg-rose-50 transition-colors">
                           <span className="font-medium text-slate-800">PhonePe</span>
                        </a>
                        <a href={upiIntentUrl} className="flex items-center justify-center p-3 border border-gray-200 rounded-xl hover:border-rose-500 hover:bg-rose-50 transition-colors">
                           <span className="font-medium text-slate-800">Paytm</span>
                        </a>
                        <a href={upiIntentUrl} className="flex items-center justify-center p-3 border border-gray-200 rounded-xl hover:border-rose-500 hover:bg-rose-50 transition-colors">
                           <span className="font-medium text-slate-800">Other UPI</span>
                        </a>
                     </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <div className="flex items-center text-slate-700 mb-6">
                        <Monitor className="h-5 w-5 mr-2" />
                        <span className="font-medium">Scan QR Code using any UPI App</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <QRCodeSVG value={upiIntentUrl} size={200} level="H" includeMargin={true} />
                    </div>
                    <div className="mt-4 text-center">
                       <p className="text-lg font-bold text-slate-900">UPI ID: {upiId}</p>
                       <p className="text-sm text-slate-500 mt-1">Amount to pay: ₹{total.toLocaleString()}</p>
                    </div>
                  </div>
                )}

                <div className="mt-8 border-t border-gray-100 pt-8">
                   <h3 className="text-lg font-semibold text-slate-900 mb-4">Upload Payment Proof</h3>
                   <div className="relative group">
                     <input 
                       type="file" 
                       accept="image/jpeg, image/png, image/webp"
                       onChange={handleFileUpload}
                       ref={fileInputRef}
                       className="hidden"
                     />
                     <div 
                       onClick={() => fileInputRef.current?.click()}
                       className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${screenshotPath ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-rose-400 hover:bg-rose-50'}`}
                     >
                       {isUploading ? (
                         <div className="flex flex-col items-center">
                           <Loader2 className="h-8 w-8 text-rose-500 animate-spin mb-2" />
                           <p className="text-sm font-medium text-slate-600">Uploading...</p>
                         </div>
                       ) : screenshotPath ? (
                         <div className="flex flex-col items-center">
                           <CheckCircle2 className="h-10 w-10 text-green-500 mb-2" />
                           <p className="text-sm font-medium text-green-700">Screenshot uploaded securely!</p>
                           <p className="text-xs text-green-600 mt-1 hover:underline">Click to replace</p>
                         </div>
                       ) : (
                         <div className="flex flex-col items-center">
                           <Upload className="h-10 w-10 text-slate-400 group-hover:text-rose-500 mb-3 transition-colors" />
                           <p className="text-sm font-medium text-slate-700">Click to upload screenshot</p>
                           <p className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP up to 5MB</p>
                         </div>
                       )}
                     </div>
                   </div>
                </div>
              </div>

              <Button type="submit" size="lg" disabled={!screenshotPath || isProcessing} className="w-full text-lg h-14 transition-all shadow-md hover:shadow-lg">
                {isProcessing ? <><Loader2 className="animate-spin h-5 w-5 mr-2" /> Processing Order...</> : (screenshotPath ? `Confirm Order • ₹${total.toLocaleString()}` : 'Upload Screenshot to Confirm Order')}
              </Button>
            </form>
          </div>

          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:sticky top-28">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1 pr-4">
                      <p className="font-medium text-slate-900 line-clamp-1">{item.name}</p>
                      <p className="text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-slate-900 whitespace-nowrap">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-gray-100">
                  <span>Total Payable</span>
                  <span className="text-rose-600">₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
