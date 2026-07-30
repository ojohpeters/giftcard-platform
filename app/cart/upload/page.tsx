"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, ShieldCheck, Image as ImageIcon, ArrowRight } from "lucide-react";
import { useI18n } from '@/lib/i18n';

export default function AssetUploadPage() {
  const { t } = useI18n();
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
    <div className="min-h-screen bg-white dark:bg-[#0a0a0b] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">{t('cartUpload.title')}<span className="text-blue-600">.</span></h1>
          <p className="text-gray-500 dark:text-neutral-400 text-sm mt-2 font-medium uppercase tracking-wide">{t('cartUpload.subtitle')}</p>
        </div>

        <div className="space-y-6">
          {/* Upload Area */}
          <div className="relative border-2 border-dashed border-gray-200 dark:border-neutral-700 rounded-[32px] p-12 flex flex-col items-center justify-center bg-gray-50 dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:border-blue-600 transition-all cursor-pointer group">
            <input 
              type="file" 
              multiple 
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="w-16 h-16 bg-white dark:bg-neutral-800 rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
              <Upload className="text-blue-600" />
            </div>
            <p className="text-sm font-black uppercase tracking-widest">{t('cartUpload.dropzoneTitle')}</p>
            <p className="text-[10px] text-gray-400 dark:text-neutral-500 mt-2 font-bold uppercase tracking-widest">{t('cartUpload.dropzoneHint')}</p>
          </div>

          {/* File Preview List */}
          {files.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {files.map((file, idx) => (
                <div key={idx} className="relative bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 p-4 rounded-2xl flex items-center gap-3">
                  <ImageIcon className="text-blue-600 shrink-0" size={20} />
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-black truncate uppercase">{file.name}</p>
                    <p className="text-[9px] text-gray-400 dark:text-neutral-500 font-bold uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
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
          <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/40 p-4 rounded-2xl">
            <ShieldCheck className="text-blue-600" size={20} />
            <p className="text-[10px] text-blue-800 dark:text-blue-300 font-bold uppercase leading-relaxed tracking-wide">
              {t('cartUpload.securityNote')}
            </p>
          </div>

          {/* Submit Button */}
          <button 
            disabled={files.length === 0}
            onClick={() => router.push('/dashboard')}
            className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 transition-all ${
              files.length > 0 ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500 cursor-not-allowed'
            }`}
          >
            {t('cartUpload.submit')} <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}