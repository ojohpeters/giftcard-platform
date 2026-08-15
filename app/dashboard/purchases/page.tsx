"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Package, ShoppingCart, CheckCircle2, Clock, XCircle } from "lucide-react";
import { steamAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const STATUS: Record<string, { label: string; cls: string; icon: any }> = {
  PENDING_PAYMENT: { label: 'Awaiting payment', cls: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300', icon: Clock },
  PAID: { label: 'Paid', cls: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300', icon: CheckCircle2 },
  WAITING_FOR_SELLER_TRADE: { label: 'Paid — seller sending item', cls: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300', icon: CheckCircle2 },
  TRADE_RECEIVED: { label: 'Item received by HiGc', cls: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300', icon: CheckCircle2 },
  DELIVERY_PENDING: { label: 'Delivering to you', cls: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300', icon: Clock },
  SENT_TO_BUYER: { label: 'Sent to you', cls: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300', icon: CheckCircle2 },
  COMPLETED: { label: 'Delivered', cls: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300', icon: CheckCircle2 },
  FAILED: { label: 'Failed', cls: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300', icon: XCircle },
  EXPIRED: { label: 'Expired', cls: 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400', icon: XCircle },
  REFUNDED: { label: 'Refunded to wallet', cls: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300', icon: CheckCircle2 },
  MANUAL_REVIEW: { label: 'Under review', cls: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300', icon: Clock },
};

export default function PurchasesPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) { router.push('/login?redirect=/dashboard/purchases'); return; }
    // Payment result banner from the Zarinpal callback redirect.
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('paid') === '1') setBanner({ type: 'ok', text: 'Payment successful — the seller will now send your item to HiGc for secure delivery.' });
      else if (p.get('failed') === '1') setBanner({ type: 'err', text: 'Payment was not completed. The item was released back to the marketplace.' });
      if (p.get('paid') || p.get('failed')) window.history.replaceState({}, '', '/dashboard/purchases');
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, isAuthenticated]);

  const load = async () => {
    setLoading(true);
    try { const r = await steamAPI.myOrders(); setOrders(r.data || []); }
    catch { setOrders([]); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="min-h-[40vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <div className="flex items-center gap-2 mb-1"><ShoppingCart className="text-blue-600" size={16} /><p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em]">Skins</p></div>
        <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">My Purchases<span className="text-blue-600">.</span></h1>
      </div>

      {banner && (
        <div className={`rounded-2xl p-4 flex items-start gap-3 ${banner.type === 'ok' ? 'bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900' : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900'}`}>
          {banner.type === 'ok' ? <CheckCircle2 className="text-green-600 shrink-0" size={20} /> : <XCircle className="text-red-600 shrink-0" size={20} />}
          <p className={`text-sm font-bold ${banner.type === 'ok' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>{banner.text}</p>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
          <p className="text-gray-400 dark:text-neutral-500 font-bold uppercase text-sm">No purchases yet</p>
          <Link href="/skins" className="mt-4 inline-block text-blue-600 font-black uppercase text-xs hover:underline">Browse the marketplace →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const st = STATUS[o.order_status] || { label: o.order_status, cls: 'bg-gray-100 text-gray-500', icon: Clock };
            const Icon = st.icon;
            return (
              <div key={o.order_ref} className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-16 h-16 shrink-0 bg-gray-50 dark:bg-neutral-800 rounded-xl flex items-center justify-center p-1">
                  {o.icon_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={o.icon_url} alt="" className="max-h-full max-w-full object-contain" />
                  ) : <Package className="text-gray-300" size={24} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black leading-tight line-clamp-1">{o.market_name}</p>
                  <p className="text-[11px] text-gray-400">{o.exterior}{o.stattrak ? ' · StatTrak™' : ''} · {o.order_ref}</p>
                  <p className="text-[11px] text-gray-400">{new Date(o.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-2">
                  <span className="text-sm font-black text-green-600">{Number(o.price).toLocaleString()} تومان</span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-full ${st.cls}`}><Icon size={11} />{st.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
