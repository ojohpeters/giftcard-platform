"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-12">
      
      {/* Container */}
      <div className="w-full max-w-[450px] bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 md:p-12">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create Account</h1>
          <p className="text-gray-500 mt-2 text-sm">Join us to start liquidating your assets</p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          
          {/* Full Name Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="John Doe"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-sm"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="email" 
                placeholder="name@example.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-sm"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Create Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
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

          {/* Terms Note */}
          <p className="text-[11px] text-gray-400 px-1 leading-relaxed">
            By clicking "Create Account", you agree to our <span className="text-blue-600 font-bold cursor-pointer">Terms of Service</span> and <span className="text-blue-600 font-bold cursor-pointer">Privacy Policy</span>.
          </p>

          {/* Register Button */}
          <button 
            onClick={() => router.push('/marketplace')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-2"
          >
            Get Started <ArrowRight size={20} />
          </button>
        </form>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500">
            Already have an account? {' '}
            <button 
              onClick={() => router.push('/login')}
              className="font-bold text-blue-600 hover:underline"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-8 flex items-center gap-6 opacity-40 grayscale">
        <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Verified Secure</span>
        </div>
      </div>
    </div>
  );
}