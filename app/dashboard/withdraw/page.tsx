"use client";
import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, Banknote, Lock, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function WithdrawPage() {
  const [amount, setAmount] = useState("");

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 px-0">
      
      {/* BACK NAV - Tighter on mobile */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors px-4 md:px-0">
        <ArrowLeft size={12} />
        Back
      </Link>

      {/* HEADER - Fluid Typography */}
      <div className="space-y-1 px-4 md:px-0">
        <h1 className="text-3xl md:text-6xl font-black tracking-tighter uppercase italic leading-tight">
          Withdraw<span className="text-gray-200">.</span>
        </h1>
        <p className="text-[8px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest">
          Node 01 • Secure Terminal
        </p>
      </div>

      {/* WITHDRAWAL CARD - Reduced Mobile Padding */}
      <div className="bg-[#0A0A0B] rounded-[24px] md:rounded-[40px] p-5 md:p-12 shadow-2xl border-y md:border border-white/5 relative overflow-hidden">
        
        <div className="relative z-10 space-y-6 md:space-y-10">
          
          {/* BALANCE INFO */}
          <div className="space-y-0.5">
            <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.3em]">Available</p>
            <p className="text-xl md:text-3xl font-black text-white tabular-nums tracking-tighter">₦124,500.00</p>
          </div>

          {/* INPUT AREA - Scaled for Small Screens */}
          <div className="space-y-2">
            <label className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Amount</label>
            <div className="relative flex items-center border-b border-white/10 focus-within:border-blue-600 transition-colors pb-2">
              <span className="text-xl md:text-4xl font-bold text-gray-600 mr-2">₦</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="bg-transparent text-3xl md:text-7xl font-black text-white outline-none w-full tabular-nums placeholder:text-white/5"
              />
            </div>
          </div>

          {/* DESTINATION - Compact on Mobile */}
          <div className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-6 flex justify-between items-center group cursor-pointer hover:bg-white/10 transition-all">
            <div className="space-y-0.5">
              <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest">To</p>
              <p className="text-[10px] md:text-sm font-black text-white uppercase tracking-tight">Access Bank • 9902</p>
            </div>
            <ChevronRight size={14} className="text-gray-600" />
          </div>

          {/* ACTION BUTTON - The "Big" fix */}
          <button className="w-full bg-white text-black py-4 md:py-6 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-[12px] tracking-[0.2em] md:tracking-[0.4em] hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-xl active:scale-[0.97]">
            <Lock size={14} fill="currentColor" />
            Confirm
          </button>
        </div>
      </div>

      {/* RECENT ACTIVITY - Shrunk for list feel */}
      <div className="px-4 md:px-0 space-y-2">
        <h3 className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">History</h3>
        <div className="bg-white border border-gray-100 rounded-xl p-3 flex justify-between items-center">
          <span className="text-[10px] font-black uppercase tabular-nums">₦45,000.00</span>
          <span className="text-[8px] font-bold text-gray-400 uppercase">Jan 07</span>
        </div>
      </div>

    </div>
  );
}