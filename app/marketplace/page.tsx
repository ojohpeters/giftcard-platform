"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  ArrowUpRight,
  ShoppingBag,
  X,
  CheckCircle2,
  Trash2,
  TrendingUp,
  TrendingDown,
  Zap
} from "lucide-react";

// Assuming this exists in your project structure
import EmptyCart from "../empty-cart/cart";

export default function MarketplacePage() {
  const router = useRouter();
  const [usdAmount, setUsdAmount] = useState(100);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // ASSET DATABASE WITH TREND INDICATORS
  const assets = [
    { id: 1, name: "Amazon US Receipt", rate: 1550, category: "RETAIL", trend: "+2.4%", icon: "🇺🇸", path: "M0 15 L10 12 L20 14 L30 8 L40 10 L50 4 L60 6", isUp: true },
    { id: 2, name: "Steam Global", rate: 1240, category: "GAMING", trend: "-0.4%", icon: "🎮", path: "M0 4 L10 8 L20 6 L30 12 L40 10 L50 16 L60 18", isUp: false },
    { id: 3, name: "Apple iTunes US", rate: 1100, category: "RETAIL", trend: "+1.2%", icon: "🍎", path: "M0 12 L10 13 L20 10 L30 11 L40 8 L50 9 L60 7", isUp: true },
    { id: 4, name: "Razer Gold", rate: 1450, category: "GAMING", trend: "+5.8%", icon: "🐍", path: "M0 18 L10 15 L20 16 L30 10 L40 12 L50 5 L60 2", isUp: true },
    { id: 5, name: "Sephora / Nord", rate: 1320, category: "LIFESTYLE", trend: "-1.1%", icon: "💄", path: "M0 6 L10 8 L20 12 L30 10 L40 14 L50 16 L60 18", isUp: false },
    { id: 6, name: "Vanilla Visa", rate: 1150, category: "FINANCE", trend: "+0.1%", icon: "💳", path: "M0 12 L10 11 L20 12 L30 10 L40 11 L50 10 L60 9", isUp: true },
  ];

  const handleAddToCart = (asset: any) => {
    setCartItems((prev: any) => {
      const existing = prev.find((item: any) => item.id === asset.id);
      if (existing) {
        return prev.map((item: any) => item.id === asset.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...asset, qty: 1, amount: usdAmount }];
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const removeFromCart = (id: number) => {
    setCartItems((prev: any) => prev.filter((item: any) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] font-sans antialiased selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      
      {/* SUCCESS TOAST */}
      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[200] bg-black text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top duration-500">
          <CheckCircle2 className="text-green-500 w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest text-center">Asset Appended to Manifest</span>
        </div>
      )}

      {/* CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
            <div className="p-6 flex justify-between items-center border-b border-gray-100">
               <div className="flex items-center gap-2">
                 <ShoppingBag size={18} className="text-blue-600" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em]">Manifest Index ({cartItems.length})</span>
               </div>
               <button onClick={() => setIsCartOpen(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-all"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {cartItems.length === 0 ? <EmptyCart /> : (
                <div className="p-6 md:p-10 space-y-6">
                  {cartItems.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-[24px] border border-gray-100">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{item.icon}</span>
                        <div className="text-left">
                          <p className="text-xs font-black uppercase italic leading-none">{item.name}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Value: ${item.amount} • Qty: {item.qty}</p>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <div className="pt-6 border-t border-gray-100">
                    <button onClick={() => router.push('/cart')} className="w-full py-5 bg-[#0A0A0B] text-white rounded-[24px] font-black uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl">
                      Open Full Manifest <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FLOATING CART TRIGGER */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-8 right-8 z-50 bg-[#0A0A0B] text-white w-20 h-20 rounded-[32px] flex items-center justify-center shadow-2xl hover:bg-blue-600 hover:-translate-y-2 transition-all duration-300 group"
      >
        <div className="relative">
          <ShoppingBag className="w-8 h-8 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-4 border-[#0A0A0B]">
            {cartItems.length}
          </span>
        </div>
      </button>

      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* HERO SECTION */}
        <section className="pt-8 pb-12 md:pb-16 border-b border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-4 md:space-y-6 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-[9px] md:text-[10px] font-black tracking-[0.4em] text-blue-600 uppercase">Settlement Terminal v2.4</span>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.8] mb-4 md:mb-6">
                Direct <br /> <span className="text-gray-200">Liquidity.</span>
              </h1>
            </div>

            <div className="bg-[#0A0A0B] rounded-[32px] md:rounded-[48px] p-1 md:p-2 text-white shadow-2xl relative overflow-hidden border border-white/5">
               <div className="relative z-10 p-6 md:p-10 space-y-8 md:space-y-10 text-left">
                  <div className="space-y-4">
                    <p className="text-[9px] md:text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase">Step 01. Input USD Value</p>
                    <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                      <input 
                        type="number" 
                        value={usdAmount}
                        onChange={(e) => setUsdAmount(Number(e.target.value))}
                        className="bg-transparent text-5xl md:text-7xl font-black tracking-tighter outline-none w-full tabular-nums text-white appearance-none"
                      />
                      <span className="text-lg md:text-2xl font-black text-gray-700">USD</span>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 bg-blue-600 rounded-[24px] md:rounded-[32px] text-white border-2 border-black">
                    <p className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] opacity-80 uppercase mb-2">Guaranteed Payout</p>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter tabular-nums truncate">₦{(usdAmount * 1550).toLocaleString()}</h2>
                  </div>

                  <button 
                    onClick={() => handleAddToCart({ name: "General Settlement", rate: 1550, id: 99, icon: "⚡" })}
                    className="w-full py-4 md:py-6 bg-white text-black rounded-xl md:rounded-[24px] font-black uppercase text-[10px] md:text-[12px] tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-3 group"
                  >
                    Add to Manifest <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </button>
               </div>
            </div>
          </div>
        </section>

        {/* MARKET INDEX SECTION */}
        <section className="py-12 md:py-20">
          <h3 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic mb-8">Market Index</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset) => (
              <div key={asset.id} className="group flex flex-col p-8 bg-white border-2 border-gray-100 rounded-[40px] hover:border-black transition-all duration-500 hover:shadow-2xl relative overflow-hidden">
                
                {/* CARD HEADER */}
                <div className="flex justify-between items-start mb-6 text-left relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform">
                      {asset.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-black tracking-tight text-gray-900 leading-tight">{asset.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black tracking-[0.1em] text-gray-400 uppercase">{asset.category}</span>
                        {/* DYNAMIC TREND BADGE */}
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black border ${
                          asset.isUp ? 'bg-green-50 border-green-200 text-green-600' : 'bg-red-50 border-red-200 text-red-600'
                        }`}>
                          {asset.isUp ? <TrendingUp size={10} strokeWidth={3} /> : <TrendingDown size={10} strokeWidth={3} />}
                          {asset.trend}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* THE SPARKLINE CHART */}
                <div className="h-16 w-full mb-8 relative z-10">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 60 20">
                    <path
                      d={asset.path}
                      fill="none"
                      stroke={asset.isUp ? "#10b981" : "#ef4444"}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
                    />
                  </svg>
                </div>

                {/* FOOTER ACTION */}
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100 relative z-10">
                   <div className="text-left">
                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Exchange Rate</p>
                     <div className="flex items-baseline gap-1">
                        <span className={`text-sm font-black ${asset.isUp ? 'text-green-500' : 'text-red-500'}`}>
                          {asset.isUp ? '▲' : '▼'}
                        </span>
                        <p className="text-3xl font-black tracking-tighter tabular-nums text-gray-900">
                          ₦{asset.rate.toLocaleString()}
                        </p>
                     </div>
                   </div>
                   
                   <button 
                     onClick={() => handleAddToCart(asset)}
                     className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center hover:bg-blue-600 transition-all shadow-lg active:scale-90"
                   >
                      <ArrowUpRight className="w-6 h-6" />
                   </button>
                </div>

                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gray-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-3xl pointer-events-none" />
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}