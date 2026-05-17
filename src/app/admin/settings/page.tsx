'use client';

import { Settings, Shield, Bell, Globe, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AdminSettingsPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
        <p className="text-sm text-slate-500">Configure platform parameters, security, and global preferences.</p>
      </div>

      <div className="space-y-8">
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-slate-50/50 flex items-center">
            <Globe className="h-5 w-5 text-rose-600 mr-2" />
            <h2 className="font-bold text-slate-900">General Configuration</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Store Name" defaultValue="SANA Bakes" />
              <Input label="Support Email" defaultValue="support@sanabakes.com" />
              <Input label="Currency" defaultValue="INR (₹)" />
              <Input label="Timezone" defaultValue="Asia/Kolkata (GMT+5:30)" />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-slate-50/50 flex items-center">
            <Shield className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="font-bold text-slate-900">Security & Authentication</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">Enable Multi-Factor Authentication</p>
                <p className="text-sm text-slate-500">Enforce OTP verification for administrative logins.</p>
              </div>
              <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500" />
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">Session Timeout</p>
                <p className="text-sm text-slate-500">Automatically logout users after 24 hours of inactivity.</p>
              </div>
              <select className="text-sm border border-gray-200 rounded-lg px-3 py-2" defaultValue="24 Hours">
                <option>12 Hours</option>
                <option>24 Hours</option>
                <option>7 Days</option>
              </select>
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <Button className="flex items-center">
            <Save className="h-4 w-4 mr-2" /> Save Global Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}
