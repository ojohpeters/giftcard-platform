"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Gift, Copy, CheckCircle2, Package, Mail, Loader2 } from "lucide-react";
import { userAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatIRRShort } from '@/lib/currency';
import { useI18n } from '@/lib/i18n';

interface GiftCode {
  id: number;
  source: 'order' | 'admin';
  order_number?: string;
  product_name: string;
  code: string;
  pin?: string;
  value: string;
  currency: string;
  received_at: string;
}

export default function GiftCodesPage() {
  const { t } = useI18n();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const [codes, setCodes] = useState<GiftCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/dashboard/codes');
      return;
    }
    loadCodes();
  }, [isInitialized, isAuthenticated, router]);

  const loadCodes = async () => {
    try {
      const response = await userAPI.getMyCodes();
      setCodes(response.data.codes || []);
    } catch (error) {
      console.error('Failed to load codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 dark:text-neutral-500 font-bold uppercase tracking-widest">{t('codes.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* HEADER */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-1 w-4 bg-blue-600"></div>
          <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em]">{t('codes.eyebrow')}</p>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-neutral-100 tracking-tighter italic uppercase leading-none">
          {t('codes.title')}<span className="text-gray-200">.</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400">{t('codes.subtitle')}</p>
      </div>

      {/* CODES GRID */}
      {codes.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border-4 border-black dark:border-neutral-700 rounded-[32px] px-6 py-16 flex flex-col items-center text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-none">
          <div className="w-20 h-20 rounded-3xl bg-gray-50 dark:bg-neutral-800 flex items-center justify-center mb-6">
            <Gift className="w-10 h-10 text-gray-300 dark:text-neutral-600" />
          </div>
          <p className="text-lg font-black uppercase italic text-gray-900 dark:text-neutral-100">{t('codes.emptyTitle')}</p>
          <p className="text-sm text-gray-400 dark:text-neutral-500 mt-2 max-w-sm">{t('codes.emptyDesc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {codes.map((code) => (
            <div
              key={code.id}
              className="bg-white dark:bg-neutral-900 border-4 border-black dark:border-neutral-700 rounded-[32px] p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-none hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-none transition-all"
            >
              {/* HEADER */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {code.source === 'order' ? (
                      <Package className="text-blue-600" size={18} />
                    ) : (
                      <Mail className="text-purple-600" size={18} />
                    )}
                    <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500">
                      {code.source === 'order' ? t('codes.fromOrder') : t('codes.adminGift')}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-neutral-100">{code.product_name}</h3>
                  {code.order_number && (
                    <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-1 font-bold">{t('codes.orderLabel')} {code.order_number}</p>
                  )}
                </div>
              </div>

              {/* VALUE */}
              <div className="mb-6">
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-1">{t('codes.value')}</p>
                <p className="text-3xl md:text-4xl font-black text-gray-900 dark:text-neutral-100 tracking-tighter tabular-nums">
                  {code.currency === 'USD' ? `$${code.value}` : `${formatIRRShort(parseFloat(code.value))} تومان`}
                </p>
              </div>

              {/* CODE */}
              <div className="mb-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-2">{t('codes.code')}</p>
                <div className="flex items-stretch gap-2">
                  <code className="flex-1 min-w-0 bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl py-3.5 px-4 font-mono text-base font-black text-gray-900 dark:text-neutral-100 break-all leading-relaxed">
                    {code.code}
                  </code>
                  <button
                    onClick={() => copyToClipboard(code.code, code.id)}
                    aria-label={t('codes.code')}
                    className="shrink-0 w-12 flex items-center justify-center bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                  >
                    {copiedId === code.id ? (
                      <CheckCircle2 size={20} className="text-green-600" />
                    ) : (
                      <Copy size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* PIN */}
              {code.pin && (
                <div className="mb-4">
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-2">{t('codes.pin')}</p>
                  <div className="flex items-stretch gap-2">
                    <code className="flex-1 min-w-0 bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl py-3.5 px-4 font-mono text-base font-black text-gray-900 dark:text-neutral-100 break-all leading-relaxed">
                      {code.pin}
                    </code>
                    <button
                      onClick={() => copyToClipboard(code.pin!, code.id + 10000)}
                      aria-label={t('codes.pin')}
                      className="shrink-0 w-12 flex items-center justify-center bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                    >
                      {copiedId === code.id + 10000 ? (
                        <CheckCircle2 size={20} className="text-green-600" />
                      ) : (
                        <Copy size={20} />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* DATE */}
              <div className="pt-4 border-t-2 border-gray-100 dark:border-neutral-800">
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500">
                  {t('codes.receivedLabel')} {new Date(code.received_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

