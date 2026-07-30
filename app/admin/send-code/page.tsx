"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Gift, Send, User, Search, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export default function AdminSendCodePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    pin: '',
    product_name: '',
    value: '',
    currency: 'USD',
    message: '',
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.is_staff) {
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  const searchUsers = async () => {
    if (!searchTerm || searchTerm.length < 2) {
      setUsers([]);
      return;
    }

    setSearching(true);
    try {
      const response = await adminAPI.getAllUsers({ search: searchTerm });
      const results = response.data.results || response.data || [];
      setUsers(results.slice(0, 10)); // Limit to 10 results
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchUsers();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!selectedUser) {
      setError('Please select a user');
      return;
    }

    if (!formData.code || !formData.product_name || !formData.value) {
      setError('Code, product name, and value are required');
      return;
    }

    setLoading(true);
    try {
      const response = await adminAPI.sendCodeToUser({
        user_id: selectedUser.id,
        code: formData.code,
        pin: formData.pin || undefined,
        product_name: formData.product_name,
        value: parseFloat(formData.value),
        currency: formData.currency,
        message: formData.message || undefined,
      });

      setSuccess(true);
      setFormData({
        code: '',
        pin: '',
        product_name: '',
        value: '',
        currency: 'USD',
        message: '',
      });
      setSelectedUser(null);
      setSearchTerm('');

      setTimeout(() => setSuccess(false), 5000);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
            Send Code<span className="text-blue-600">.</span>
          </h1>
          <p className="text-[10px] md:text-[11px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-[0.4em] mt-2">
            Securely Send Gift Card Codes to Users
          </p>
        </div>
      </div>

      {/* SUCCESS/ERROR MESSAGES */}
      {success && (
        <div className="bg-green-50 dark:bg-green-950/40 border-2 border-green-200 dark:border-green-900 rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-top">
          <CheckCircle2 className="text-green-600" size={20} />
          <p className="text-sm font-black text-green-900 dark:text-green-200">Code sent successfully! Email notification sent to user.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-900 rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-top">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-sm font-black text-red-900 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* FORM */}
      <div className="bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-neutral-700 rounded-[32px] p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* USER SELECTION */}
          <div>
            <label className="block text-sm font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-3">
              Select User
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by email or name..."
                className="w-full bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-600 text-sm dark:text-neutral-100"
              />
              {searching && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 animate-spin" size={20} />
              )}
            </div>

            {/* USER RESULTS */}
            {users.length > 0 && (
              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                {users.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setSelectedUser(u);
                      setSearchTerm(`${u.first_name} ${u.last_name} (${u.email})`);
                      setUsers([]);
                    }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedUser?.id === u.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40'
                        : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600'
                    }`}
                  >
                    <p className="font-black">{u.first_name} {u.last_name}</p>
                    <p className="text-xs text-gray-400 dark:text-neutral-500">{u.email}</p>
                  </button>
                ))}
              </div>
            )}

            {selectedUser && (
              <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-200 dark:border-blue-900 rounded-xl flex items-center gap-3">
                <User className="text-blue-600" size={20} />
                <div>
                  <p className="font-black text-blue-900 dark:text-blue-200">{selectedUser.first_name} {selectedUser.last_name}</p>
                  <p className="text-xs text-blue-600">{selectedUser.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* CODE */}
          <div>
            <label className="block text-sm font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-3">
              Gift Card Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
              className="w-full bg-gray-50 dark:bg-neutral-800 dark:text-neutral-100 border-2 border-gray-200 dark:border-neutral-700 rounded-2xl py-4 px-4 outline-none focus:border-blue-600 text-sm font-mono"
              placeholder="Enter gift card code"
            />
          </div>

          {/* PIN (Optional) */}
          <div>
            <label className="block text-sm font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-3">
              PIN (Optional)
            </label>
            <input
              type="text"
              value={formData.pin}
              onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
              className="w-full bg-gray-50 dark:bg-neutral-800 dark:text-neutral-100 border-2 border-gray-200 dark:border-neutral-700 rounded-2xl py-4 px-4 outline-none focus:border-blue-600 text-sm font-mono"
              placeholder="Enter PIN if required"
            />
          </div>

          {/* PRODUCT NAME */}
          <div>
            <label className="block text-sm font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-3">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              required
              className="w-full bg-gray-50 dark:bg-neutral-800 dark:text-neutral-100 border-2 border-gray-200 dark:border-neutral-700 rounded-2xl py-4 px-4 outline-none focus:border-blue-600 text-sm"
              placeholder="e.g., Amazon Gift Card"
            />
          </div>

          {/* VALUE & CURRENCY */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-3">
                Value <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                required
                className="w-full bg-gray-50 dark:bg-neutral-800 dark:text-neutral-100 border-2 border-gray-200 dark:border-neutral-700 rounded-2xl py-4 px-4 outline-none focus:border-blue-600 text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-3">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full bg-gray-50 dark:bg-neutral-800 dark:text-neutral-100 border-2 border-gray-200 dark:border-neutral-700 rounded-2xl py-4 px-4 outline-none focus:border-blue-600 text-sm font-bold"
              >
                <option value="USD">USD</option>
                <option value="IRR">IRR (تومان)</option>
              </select>
            </div>
          </div>

          {/* MESSAGE (Optional) */}
          <div>
            <label className="block text-sm font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-3">
              Message (Optional)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              className="w-full bg-gray-50 dark:bg-neutral-800 dark:text-neutral-100 border-2 border-gray-200 dark:border-neutral-700 rounded-2xl py-4 px-4 outline-none focus:border-blue-600 text-sm resize-none"
              placeholder="Optional message to include in email..."
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading || !selectedUser}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={16} />
                Send Code to User
              </>
            )}
          </button>
        </form>
      </div>

      {/* SECURITY NOTE */}
      <div className="bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-200 dark:border-blue-900 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Gift className="text-blue-600 mt-1" size={20} />
          <div>
            <h3 className="font-black text-blue-900 dark:text-blue-200 mb-2">Security Features</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Codes are encrypted at rest in the database</li>
              <li>• Email is sent over TLS/SSL</li>
              <li>• All actions are logged for audit purposes</li>
              <li>• Only authorized admins can send codes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

