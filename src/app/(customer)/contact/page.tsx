'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ContactPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4">Corporate Orders & Contact</h1>
            <p className="text-slate-500">
              Planning a corporate event or need a large custom order? Fill out the form below and our dedicated team will get back to you within 24 hours.
            </p>
          </div>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Form submitted successfully! We will contact you soon."); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="First Name" required />
              <Input label="Last Name" required />
              <Input label="Company Name (Optional)" className="md:col-span-2" />
              <Input label="Email Address" type="email" required className="md:col-span-2" />
              <Input label="Phone Number" type="tel" required className="md:col-span-2" />
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Order Enquiry Details</label>
              <textarea 
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[150px]"
                placeholder="Tell us about your event, quantity needed, and any specific dietary requirements..."
              ></textarea>
            </div>

            <Button type="submit" size="lg" className="w-full text-lg h-14 cursor-pointer">
              Submit Enquiry
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
