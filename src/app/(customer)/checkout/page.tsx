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
import Script from 'next/script';

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

  const handleRazorpayPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // 1. Create order on backend
      const res = await axios.post('/api/create-order', { amount: total });
      const orderData = res.data;

      // 2. Initialize Razorpay (or simulate test mode)
      if (orderData.order_id.startsWith('order_dummy_')) {
        toast.info("Test Mode: Simulating secure payment processing...");
        setTimeout(async () => {
          try {
            const dbRes = await axios.post('/api/orders', {
              items,
              total,
              screenshot_path: 'RAZORPAY_TEST_SIMULATION',
              payment_method: 'RAZORPAY_TEST'
            });
            if (dbRes.data.success) {
              setIsSuccess(true);
              dispatch(clearCart());
            } else {
              toast.error("Order creation failed in Test Mode.");
            }
          } catch (err) {
            toast.error("Test mode simulation failed.");
          } finally {
            setIsProcessing(false);
          }
        }, 1500);
        return;
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'SANA Bakes',
        description: 'Order Payment',
        order_id: orderData.order_id,
        handler: async function (response: any) {
          try {
            // 3. Verify payment signature
            const verifyRes = await axios.post('/api/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.verified) {
              // 4. Save order
              const dbRes = await axios.post('/api/orders', {
                items,
                total,
                screenshot_path: 'RAZORPAY_AUTOMATIC',
                payment_method: 'RAZORPAY'
              });

              if (dbRes.data.success) {
                setIsSuccess(true);
                dispatch(clearCart());
              } else {
                toast.error("Order creation failed. Your money has not been debited.");
              }
            } else {
              toast.error("Payment verification failed. Your money has not been debited.");
            }
          } catch (err) {
            toast.error("An error occurred during verification. Your money has not been debited.");
          }
        },
        prefill: {
          name: contactForm.firstName + ' ' + contactForm.lastName,
          email: contactForm.email,
          contact: contactForm.phone,
        },
        theme: {
          color: '#e11d48',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (error: any) {
       console.error(error);
       toast.error(error.response?.data?.error || "Error initiating payment.");
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
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <Link href="/cart" className="hover:text-rose-600">Cart</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-slate-900 font-medium">Checkout & Payment</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="space-y-8">
              
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
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Payment Method (Secure Online Payment)</h2>
                
                <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-sm text-blue-800 font-medium mb-1">Payment Instructions:</p>
                  <ul className="list-disc pl-4 text-sm text-blue-700 space-y-1">
                    <li>Clicking the button below will open a secure payment window.</li>
                    <li>You can choose to pay via <strong>UPI, Credit/Debit Card, or Netbanking</strong>.</li>
                    <li>The amount (<strong>₹{total.toLocaleString()}</strong>) will be entered automatically.</li>
                  </ul>
                </div>
              </div>

              <Button type="button" onClick={handleRazorpayPayment} size="lg" disabled={isProcessing} className="w-full text-lg h-14 transition-all shadow-md hover:shadow-lg">
                {isProcessing ? <><Loader2 className="animate-spin h-5 w-5 mr-2" /> Processing...</> : `Pay Securely • ₹${total.toLocaleString()}`}
              </Button>
            </div>

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
