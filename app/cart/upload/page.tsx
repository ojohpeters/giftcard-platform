"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, ShieldCheck, Image as ImageIcon, ArrowRight } from "lucide-react";

export default function AssetUploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);

  // Simple file handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Upload Proof<span className="text-blue-600">.</span></h1>
          <p className="text-gray-500 text-sm mt-2 font-medium uppercase tracking-wide">Provide clear images of your assets for verification</p>
        </div>

        <div className="space-y-6">
          {/* Upload Area */}
          <div className="relative border-2 border-dashed border-gray-200 rounded-[32px] p-12 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 hover:border-blue-600 transition-all cursor-pointer group">
            <input 
              type="file" 
              multiple 
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
              <Upload className="text-blue-600" />
            </div>
            <p className="text-sm font-black uppercase tracking-widest">Click or Drag Images</p>
            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">PNG, JPG or PDF (Max 10MB)</p>
          </div>

          {/* File Preview List */}
          {files.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {files.map((file, idx) => (
                <div key={idx} className="relative bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-center gap-3">
                  <ImageIcon className="text-blue-600 shrink-0" size={20} />
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-black truncate uppercase">{file.name}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button 
                    onClick={() => removeFile(idx)}
                    className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 shadow-lg"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Verification Badge */}
          <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-2xl">
            <ShieldCheck className="text-blue-600" size={20} />
            <p className="text-[10px] text-blue-800 font-bold uppercase leading-relaxed tracking-wide">
              Images are encrypted and sent directly to our secure verification node.
            </p>
          </div>

          {/* Submit Button */}
          <button 
            disabled={files.length === 0}
            onClick={() => router.push('/dashboard')}
            className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 transition-all ${
              files.length > 0 ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Submit for Payout <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}