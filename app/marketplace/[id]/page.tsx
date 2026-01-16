"use client";
import React, { useState } from 'react';
import { ShieldCheck, Zap, Info, ShoppingCart, Lock } from "lucide-react";
import { formatIQDShort } from '@/lib/currency';

export default function ProductDetailPage() {
  const [qty, setQty] = useState(1);
  const isLoggedIn = false; // Auth Gate Toggle

  return (
    <div className="w-full max-w-5xl mx-auto py-6 md:py-12 px-4 animate-in fade-in duration-700">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
        
        {/* LEFT: ASSET VIEW */}
        <div className="space-y-6">
          <div className="aspect-[4/3] md:aspect-square bg-gray-100 rounded-[32px] border border-gray-200 flex items-center justify-center overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300 italic">Asset_Placeholder_01</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black bg-blue-600 text-white px-3 py-1 rounded-full uppercase tracking-widest">Premium</span>
              <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-3 py-1 rounded-full uppercase tracking-widest">Instant Delivery</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">Amazon Card<span className="text-blue-600">.</span></h1>
            <p className="text-xs md:text-sm text-gray-500 font-medium leading-relaxed max-w-md uppercase tracking-tight">
              Global digital asset for liquidating store credit. Secured by HiGc Terminal protocols. Valid for all regional nodes.
            </p>
          </div>
        </div>

        {/* RIGHT: PURCHASE UI & TIERED PRICING */}
        <div className="space-y-8">
          
          {/* TIERED PRICING CARD */}
          <div className="bg-[#0A0A0B] rounded-[32px] p-6 md:p-10 text-white border border-white/5 shadow-2xl space-y-8">
            <div className="space-y-2">
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em]">Current Liquidity Rate</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter tabular-nums italic">{formatIQDShort(1240)} IQD<span className="text-xs md:text-lg text-gray-500 not-italic ml-2">/ $1.00</span></h2>
            </div>

            <div className="space-y-4">
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Bulk Tier Pricing</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
                  <p className="text-[8px] font-black text-blue-500 uppercase">$100 - $499</p>
                  <p className="text-sm font-black tabular-nums">{formatIQDShort(1245)} IQD</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
                  <p className="text-[8px] font-black text-green-500 uppercase">$500+</p>
                  <p className="text-sm font-black tabular-nums">{formatIQDShort(1260)} IQD</p>
                </div>
              </div>
            </div>

            {/* QTY SELECTOR */}
            <div className="space-y-3">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Quantity Selector</label>
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 rounded-2xl w-fit">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all font-black">-</button>
                <span className="text-xl font-black w-8 text-center tabular-nums">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all font-black">+</button>
              </div>
            </div>

            {/* AUTH GATE / ACTION BUTTON */}
            <div className="pt-4">
              {isLoggedIn ? (
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-blue-900/20">
                  <ShoppingCart size={18} />
                  Acquire Asset
                </button>
              ) : (
                <div className="space-y-4">
                   <button className="w-full bg-white/5 border border-white/20 text-white/40 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] cursor-not-allowed flex items-center justify-center gap-3">
                    <Lock size={16} />
                    Terminal Locked
                  </button>
                  <p className="text-[9px] text-center font-bold text-gray-500 uppercase tracking-widest">
                    Unauthorized: <a href="/login" className="text-blue-500 hover:underline">Sign-in</a> to access liquidity
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* TRUST BADGE */}
          <div className="flex items-center justify-between px-4 opacity-50">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-blue-600" />
              <span className="text-[8px] font-black uppercase tracking-widest">Encrypted Checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-blue-600" />
              <span className="text-[8px] font-black uppercase tracking-widest">Instant Node Delivery</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}