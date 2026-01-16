"use client";
import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowRight,
  Zap, 
  ShieldCheck,
  MessageSquare,
  X,
  Camera,
  CheckCircle2,
  Lock
} from "lucide-react";
import { formatIQDShort } from '@/lib/currency';

export default function HiGcPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState("");

  const handleStartTrade = (assetName?: string) => {
    if (assetName) setSelectedAsset(assetName);
    else setSelectedAsset("Select an asset");
    setIsModalOpen(true);
  };

  const scrollToExchange = () => {
    document.getElementById('exchange-index')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="w-full bg-white text-[#0A0A0B] antialiased selection:bg-blue-600 selection:text-white font-sans">
      
      {/* 01. HERO SECTION */}
      <section className="px-5 pt-12 md:pt-24 pb-16 md:pb-20 border-b border-gray-50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 md:gap-20 items-start">
          <div className="lg:col-span-8 space-y-6 md:space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-6 md:w-8 bg-blue-600" />
              <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600">
                LQD Engine v2.0
              </p>
            </div>
            
            <h1 className="text-[38px] sm:text-6xl md:text-[84px] font-black tracking-[-0.04em] leading-[0.95] md:leading-[0.88] uppercase">
              Gift Cards <br />
              <span className="text-gray-300 italic font-light tracking-tight lowercase font-serif pr-2">for</span> 
              Everyone.
            </h1>

            <p className="max-w-lg text-sm md:text-lg text-gray-500 leading-relaxed font-medium">
              Premium digital gift cards from top brands. 
              Instant delivery, secure transactions, and the best rates in Iraq.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a 
                href="/marketplace"
                className="h-12 md:h-14 px-8 bg-black text-white rounded-full font-bold uppercase text-[10px] md:text-[11px] tracking-widest flex items-center justify-center gap-4 hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 group"
              >
                Shop Gift Cards <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="/marketplace"
                className="h-12 md:h-14 px-8 bg-white border border-gray-100 text-gray-400 rounded-full font-bold uppercase text-[10px] md:text-[11px] tracking-widest flex items-center justify-center hover:border-black hover:text-black transition-all"
              >
                Browse Catalog
              </a>
            </div>
          </div>

          <div className="lg:col-span-4 lg:pt-8">
            <div className="p-6 md:p-8 bg-gray-50 rounded-[24px] border border-gray-100/50">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 font-sans">Network Health</p>
              <div className="space-y-5">
                {[
                  { label: "Uptime", val: "99.99%", color: "text-green-600" },
                  { label: "Execution", val: "1.2ms", color: "text-blue-600" },
                  { label: "Liquidity", val: "Institutional", color: "text-black" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-end border-b border-gray-200/50 pb-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{item.label}</span>
                    <span className={`text-[11px] font-mono font-black ${item.color}`}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 02. ASSET LEDGER */}
      <section id="exchange-index" className="px-5 py-20 md:py-28 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-4">
          <div className="space-y-2">
            <h2 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em] text-blue-600 font-sans">Featured</h2>
            <h3 className="text-3xl md:text-4xl font-black tracking-tighter italic">Popular Cards.</h3>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Instant Delivery Available
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[
            { name: "Amazon", rate: "1,550", icon: "🛒" },
            { name: "Steam", rate: "1,240", icon: "🎮" },
            { name: "Apple iTunes", rate: "1,100", icon: "🍎" },
            { name: "PlayStation", rate: "1,450", icon: "🎮" },
            { name: "Netflix", rate: "1,320", icon: "📺" },
            { name: "Google Play", rate: "1,050", icon: "📱" },
          ].map((card, i) => (
            <a
              key={i}
              href="/marketplace"
              className="group bg-white p-8 md:p-10 rounded-[32px] border border-gray-100 hover:border-blue-600/20 hover:shadow-2xl hover:shadow-blue-900/5 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start mb-12 relative z-10">
                <div className="flex flex-col gap-1">
                   <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 group-hover:text-blue-600 transition-colors">
                    {card.name}
                  </p>
                  <span className="text-3xl">{card.icon}</span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <ArrowUpRight size={18} strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex items-baseline gap-2 relative z-10">
                <span className="text-4xl md:text-5xl font-black tracking-tighter">{formatIQDShort(card.rate)} IQD</span>
                <span className="text-[10px] font-black text-gray-300 uppercase italic">/$</span>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">Shop Now</span>
                <Zap size={12} className="text-blue-600 fill-blue-600" />
              </div>
            </a>
          ))}
        </div>

        {/* LIVE ACTIVITY TICKER */}
        <div className="mt-16 overflow-hidden py-4 border-y border-gray-50">
          <div className="flex gap-12 animate-infinite-scroll whitespace-nowrap">
            {[1,2,3,4,5].map((idx) => (
              <div key={idx} className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span className="text-blue-600">●</span> User_8{idx}x settled {formatIQDShort(240000)} IQD via Steam Card
                <span className="text-gray-200">|</span>
                <span className="text-green-500">●</span> 0.4ms Execution for Amazon US
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03. FINAL CTA SECTION */}
      <section className="px-5 pb-32 max-w-7xl mx-auto">
        <div className="bg-[#0A0A0B] rounded-[48px] p-8 md:p-20 text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600 rounded-full blur-[120px] opacity-10 pointer-events-none" />
          <h2 className="text-3xl md:text-6xl font-black text-white tracking-tighter leading-none relative z-10">
            READY TO <br /> <span className="text-blue-500 italic font-serif lowercase font-light">shop?</span>
          </h2>
          <p className="text-gray-400 max-w-md mx-auto text-sm md:text-base relative z-10 font-medium">
            Browse our collection of premium gift cards from the world's top brands. Instant delivery guaranteed.
          </p>
          <div className="flex justify-center relative z-10 pt-4">
            <a 
              href="/marketplace"
              className="h-14 px-10 bg-blue-600 text-white rounded-full font-bold uppercase text-[11px] tracking-[0.2em] flex items-center gap-4 hover:bg-white hover:text-black transition-all"
            >
              Browse Catalog <MessageSquare size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* 🚀 THE SECURE TRADE DESK (MODAL) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Glass Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" 
            onClick={() => {setIsModalOpen(false); setStep(1);}} 
          />
          
          {/* Modal Card */}
          <div className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* Header */}
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1">Secure Exchange</h2>
                <p className="text-xl font-black tracking-tighter">Turn your asset into Cash</p>
              </div>
              <button 
                onClick={() => {setIsModalOpen(false); setStep(1);}} 
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Steps Content */}
            <div className="p-10">
              {step === 1 && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Trading Asset</label>
                    <div className="p-4 border-2 border-blue-600 bg-blue-50/30 rounded-2xl text-sm font-bold flex justify-between items-center">
                      {selectedAsset}
                      <Zap size={14} className="text-blue-600 fill-blue-600" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Card Amount (USD)</label>
                    <input 
                      type="number" 
                      placeholder="$0.00" 
                      className="w-full text-4xl font-black tracking-tighter outline-none placeholder:text-gray-100" 
                    />
                    <p className="text-sm font-bold text-gray-400">You will receive approx: <span className="text-black font-black">{formatIQDShort(0)} IQD</span></p>
                  </div>

                  <button 
                    onClick={() => setStep(2)} 
                    className="w-full h-14 bg-black text-white rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 transition-all"
                  >
                    Continue to Upload <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                   <div className="p-10 border-2 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center gap-4 hover:border-blue-200 transition-colors cursor-pointer group">
                      <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                        <Camera size={28} />
                      </div>
                      <p className="text-sm font-bold text-gray-500 text-center">Tap to upload or <br/> drag your card photo here</p>
                   </div>
                   
                   <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <ShieldCheck size={16} className="text-green-600" />
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Data is encrypted and deleted after use</p>
                   </div>

                   <button 
                    onClick={() => setStep(3)} 
                    className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-blue-200"
                  >
                    Sell Card Now <Zap size={16} />
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="py-10 text-center space-y-6 animate-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={40} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black tracking-tighter uppercase">We're on it!</h3>
                    <p className="text-sm text-gray-400 font-medium max-w-[280px] mx-auto">
                      We are verifying your card. This usually takes less than 3 minutes. Your funds will appear in your wallet shortly.
                    </p>
                  </div>
                  <button 
                    onClick={() => { setIsModalOpen(false); setStep(1); }} 
                    className="h-12 px-8 bg-gray-100 rounded-xl text-[11px] font-black uppercase tracking-widest text-black hover:bg-gray-200 transition-all"
                  >
                    Back to Marketplace
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}