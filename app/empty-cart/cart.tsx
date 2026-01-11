"use client";
import React from 'react';
import { ShoppingBag, ArrowUpRight, Zap } from "lucide-react";
import Link from "next/link";

export default function EmptyCart() {
  return (
    <div className="w-full max-w-2xl mx-auto py-20 px-4 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-700">
      
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-gray-50 rounded-[32px] border border-gray-100 flex items-center justify-center relative z-10">
          <ShoppingBag size={40} className="text-gray-300 stroke-[1.5]" />
        </div>
        <div className="absolute inset-0 bg-blue-500/5 rounded-[32px] animate-pulse scale-110 -z-0" />
      </div>

      <div className="space-y-3 mb-10">
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-gray-900">
          Manifest Empty<span className="text-blue-600">.</span>
        </h2>
        <p className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em] max-w-[280px] mx-auto leading-relaxed">
          No digital assets detected in current liquidation session.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <Link href="/marketplace" className="group p-5 bg-white border border-gray-100 rounded-2xl flex items-center justify-between hover:border-blue-600 transition-all">
          <div className="text-left">
            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Browse Assets</p>
            <p className="text-xs font-black uppercase text-gray-900">Marketplace</p>
          </div>
          <ArrowUpRight size={18} className="text-gray-300 group-hover:text-blue-600 transition-all" />
        </Link>

        <Link href="/dashboard" className="group p-5 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-between hover:bg-blue-600 transition-all">
          <div className="text-left">
            <p className="text-[9px] font-black text-gray-500 group-hover:text-blue-200 uppercase tracking-widest mb-1">User Portal</p>
            <p className="text-xs font-black uppercase text-white">Dashboard</p>
          </div>
          <Zap size={18} className="text-gray-600 group-hover:text-white transition-all" />
        </Link>
      </div>
    </div>
  );
}