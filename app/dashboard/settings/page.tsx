"use client";
import React from 'react';
import { User, CreditCard, ChevronRight, LogOut, Fingerprint } from "lucide-react";

export default function SettingsPage() {
  return (
    /* OUTER: overflow-x-hidden is the final guard against horizontal scroll */
    <div className="w-full flex flex-col items-center py-4 md:py-10 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-x-hidden">
      
      {/* INNER: max-w-md is tighter, better for centering settings */}
      <div className="w-full max-w-md md:max-w-2xl space-y-6 md:space-y-12">
        
        {/* HEADER: text-2xl is the max for a 320px screen to avoid clipping */}
        <div className="space-y-1 text-center px-2">
          <h1 className="text-2xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
            Settings<span className="text-blue-600">/</span>Config
          </h1>
          <p className="text-[8px] md:text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            System Preferences
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-8 px-2 md:px-0">
          
          {/* SECTION 01: IDENTITY */}
          <section className="space-y-2">
            <h3 className="text-[8px] font-black text-blue-600 uppercase tracking-widest px-1">01. Identity</h3>
            <div className="bg-white border border-gray-100 rounded-2xl md:rounded-[32px] overflow-hidden">
              <div className="p-4 md:p-8 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center text-white font-black italic shrink-0">JD</div>
                  <div className="min-w-0">
                    <p className="text-[10px] md:text-sm font-black uppercase truncate">John Doe</p>
                    <p className="text-[8px] md:text-[10px] text-gray-400">#8829</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-gray-300" />
              </div>
              <div className="p-4 md:p-8 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                    <User size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] md:text-sm font-black uppercase">Email</p>
                    <p className="text-[9px] text-gray-400 truncate">j.doe@terminal.io</p>
                  </div>
                </div>
                <span className="text-[7px] font-black bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full border border-green-100">OK</span>
              </div>
            </div>
          </section>

          {/* SECTION 02: SECURITY */}
          <section className="space-y-2">
            <h3 className="text-[8px] font-black text-blue-600 uppercase tracking-widest px-1">02. Security</h3>
            <div className="bg-[#0A0A0B] rounded-2xl md:rounded-[32px] p-1 border border-white/5">
              <div className="p-3 md:p-7 flex items-center justify-between bg-white/5 rounded-xl transition-all">
                <div className="flex items-center gap-3">
                  <Fingerprint size={18} className="text-blue-500 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-white">2FA</p>
                    <p className="text-[8px] font-bold text-gray-500 uppercase">Biometric</p>
                  </div>
                </div>
                <div className="w-7 h-3.5 bg-blue-600 rounded-full flex items-center justify-end px-0.5">
                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 03: BANKING */}
          <section className="space-y-2">
            <h3 className="text-[8px] font-black text-blue-600 uppercase tracking-widest px-1">03. Banking</h3>
            <div className="bg-white border border-gray-100 rounded-2xl md:rounded-[32px] p-4 md:p-10 space-y-4">
               <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <CreditCard size={18} className="shrink-0 text-gray-400" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase truncate italic">Access Bank</p>
                      <p className="text-[9px] text-gray-400 tabular-nums">**** 9902</p>
                    </div>
                  </div>
                  <button className="text-[8px] font-black text-red-500 uppercase">Del</button>
               </div>
               <button className="w-full py-3 border border-dashed border-gray-200 rounded-xl text-[9px] font-black uppercase text-gray-400">
                  + Add Node
               </button>
            </div>
          </section>

          {/* TERMINATE */}
          <button className="w-full py-4 bg-red-500 text-white font-black uppercase text-[10px] tracking-widest rounded-xl active:scale-95 shadow-lg shadow-red-100">
            Terminate Session
          </button>

        </div>
      </div>
    </div>
  );
}2