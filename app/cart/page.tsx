"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Trash2, 
  ArrowRight, 
  ShieldCheck, 
  Upload, 
  X, 
  Image as ImageIcon, 
  ChevronLeft 
} from "lucide-react";
import EmptyCart from "../empty-cart/cart"; 

export default function IntegratedCartPage() {
  const router = useRouter();
  
  // 1. STATE MANAGEMENT
  const [step, setStep] = useState(1); // Step 1: Review, Step 2: Upload
  const [items, setItems] = useState([
    { id: 1, name: "Amazon Gift Card", value: 248000 }
  ]);
  const [files, setFiles] = useState<File[]>([]);

  // 2. LOGIC HANDLERS
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  if (items.length === 0) return <EmptyCart />;

  return (
    <div className="w-full max-w-6xl mx-auto py-8 md:py-16 px-4 animate-in fade-in duration-700">
      
      {/* PROGRESS HEADER */}
      <div className="mb-10 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
            {step === 1 ? <>Cart<span className="text-blue-600">/</span>Manifest</> : <>Upload<span className="text-blue-600">.</span></>}
          </h1>
          <p className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-[0.4em]">
            {step === 1 ? "Reviewing Assets for Liquidation" : "Provide clear images for verification"}
          </p>
        </div>
        
        {/* Step Indicator */}
        <div className="flex gap-2">
          <div className={`h-1.5 w-12 rounded-full transition-all ${step >= 1 ? 'bg-blue-600' : 'bg-gray-100'}`} />
          <div className={`h-1.5 w-12 rounded-full transition-all ${step >= 2 ? 'bg-blue-600' : 'bg-gray-100'}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN: DYNAMIC CONTENT */}
        <div className="lg:col-span-8 space-y-4">
          
          {step === 1 ? (
            /* STEP 1: ITEM LIST */
            <div className="animate-in slide-in-from-left-4 duration-500">
              <div className="flex items-center justify-between px-4 pb-4 border-b border-gray-100 mb-4">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Asset Description</span>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest hidden md:block">Value</span>
              </div>

              {items.map((item) => (
                <div key={item.id} className="group bg-white border border-gray-100 rounded-[24px] p-5 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4 transition-all hover:shadow-xl hover:shadow-gray-100/50">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-black italic shrink-0">AMZ</div>
                    <div>
                      <h3 className="text-sm md:text-base font-black uppercase italic tracking-tight">{item.name}</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Qty: 2 • $100.00 Tier</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-10">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Settlement</p>
                      <p className="text-lg font-black tabular-nums italic">₦{item.value.toLocaleString()}</p>
                    </div>
                    <button onClick={() => setItems([])} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}

              <button onClick={() => router.push('/marketplace')} className="w-full py-6 border-2 border-dashed border-gray-100 rounded-[24px] text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] hover:border-blue-600 hover:text-blue-600 transition-all">
                + Append More Assets
              </button>
            </div>
          ) : (
            /* STEP 2: UPLOAD AREA */
            <div className="animate-in slide-in-from-right-4 duration-500 space-y-6">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-black mb-4 transition-colors">
                <ChevronLeft size={14} /> Back to Manifest
              </button>

              <div className="relative border-2 border-dashed border-gray-200 rounded-[32px] p-12 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 hover:border-blue-600 transition-all cursor-pointer group">
                <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="text-blue-600" />
                </div>
                <p className="text-sm font-black uppercase tracking-widest">Click or Drag Images</p>
                <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">PNG, JPG or PDF (Max 10MB)</p>
              </div>

              {files.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {files.map((file, idx) => (
                    <div key={idx} className="relative bg-white border border-gray-100 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
                      <ImageIcon className="text-blue-600 shrink-0" size={20} />
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-black truncate uppercase">{file.name}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button onClick={() => removeFile(idx)} className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 shadow-lg">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SUMMARY & ACTION */}
        <div className="lg:col-span-4">
          <div className="bg-[#0A0A0B] rounded-[32px] p-6 md:p-8 text-white border border-white/5 shadow-2xl sticky top-28">
            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-8">Settlement Summary</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Subtotal</span>
                <span className="text-sm font-black tabular-nums">₦248,000</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Total Payout</span>
                <span className="text-2xl font-black tabular-nums text-blue-500">₦248,000</span>
              </div>
            </div>

            {/* Verification Badge */}
            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl mb-6">
              <ShieldCheck className="text-blue-500 shrink-0" size={20} />
              <p className="text-[9px] text-gray-400 font-bold uppercase leading-relaxed tracking-wide">
                Assets are encrypted and verified by our secure node.
              </p>
            </div>

            {/* DYNAMIC BUTTON */}
            {step === 1 ? (
              <button 
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all flex items-center justify-center gap-3"
              >
                Complete Checkout <ArrowRight size={18} />
              </button>
            ) : (
              <button 
                disabled={files.length === 0}
                onClick={() => router.push('/dashboard')}
                className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 transition-all ${
                  files.length > 0 ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-white/10 text-gray-500 cursor-not-allowed'
                }`}
              >
                Submit for Payout <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}