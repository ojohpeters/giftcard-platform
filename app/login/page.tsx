"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirect = searchParams.get('redirect');
      if (user.is_staff) {
        router.push('/admin');
      } else if (redirect) {
        router.push(redirect);
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, router, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      
      {/* Container */}
      <div className="w-full max-w-[450px] bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 md:p-12">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
            <Lock className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h1>
          <p className="text-gray-500 mt-2 text-sm">Log in to manage your assets and payouts</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-xs text-red-600 font-bold">{error}</p>
          </div>
        )}

        {/* Form */}
        <form className="space-y-6" onSubmit={async (e) => {
          e.preventDefault();
          setError('');
          setLoading(true);
          try {
            await login(email, password);
            // Wait a moment for user state to update
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Get redirect from URL params or check user role
            const redirect = searchParams.get('redirect');
            const currentUser = useAuthStore.getState().user;
            
            // If user is admin, always redirect to admin dashboard
            if (currentUser?.is_staff) {
              router.push('/admin');
            } else if (redirect) {
              router.push(redirect);
            } else {
              router.push('/dashboard');
            }
          } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Login failed. Please check your credentials.';
            setError(errorMsg);
          } finally {
            setLoading(false);
          }
        }}>
          
          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-sm"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Password</label>
              <button type="button" className="text-xs font-bold text-blue-600 hover:underline">Forgot?</button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-sm"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={20} />
          </button>
        </form>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500">
            New here? {' '}
            <button 
              onClick={() => router.push('/register')}
              className="font-bold text-blue-600 hover:underline"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>

      {/* Security Note */}
      <p className="mt-8 text-[11px] text-gray-400 uppercase tracking-widest font-medium">
        Secure 256-bit Encrypted Connection
      </p>
    </div>
  );
}
