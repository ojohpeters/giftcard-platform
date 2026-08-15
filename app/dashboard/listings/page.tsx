"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Tag, Trash2, Package } from "lucide-react";
import { steamAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300',
  RESERVED: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  SOLD: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
  CANCELLED: 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400',
  EXPIRED: 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400',
};
const TABS = ['ALL', 'ACTIVE', 'SOLD', 'CANCELLED'];

export default function MyListingsPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ALL');
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) { router.push('/login?redirect=/dashboard/listings'); return; }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, isAuthenticated]);

  const load = async () => {
    setLoading(true);
    try { const r = await steamAPI.myListings(); setListings(r.data || []); }
    catch { setListings([]); }
    finally { setLoading(false); }
  };

  const cancel = async (ref: string) => {
    if (!confirm('Cancel this listing?')) return;
    setBusy(ref);
    try { await steamAPI.cancelListing(ref); await load(); }
    catch (e: any) { alert(e.response?.data?.error || 'Could not cancel.'); }
    finally { setBusy(null); }
  };

  const shown = tab === 'ALL' ? listings : listings.filter((l) => l.status === tab);

  if (loading) return <div className="min-h-[40vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1"><Tag className="text-blue-600" size={16} /><p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em]">Seller</p></div>
          <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">My Listings<span className="text-blue-600">.</span></h1>
        </div>
        <Link href="/dashboard/inventory" className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all">
          <Package size={16} /> List an item
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TABS.map((tb) => (
          <button key={tb} onClick={() => setTab(tb)} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${tab === tb ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400'}`}>{tb}</button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="text-center py-16"><Tag className="w-12 h-12 text-gray-300 dark:text-neutral-600 mx-auto mb-3" /><p className="text-gray-400 dark:text-neutral-500 font-bold uppercase text-sm">No listings here</p></div>
      ) : (
        <div className="space-y-3">
          {shown.map((l) => (
            <div key={l.listing_ref} className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-16 h-16 shrink-0 bg-gray-50 dark:bg-neutral-800 rounded-xl flex items-center justify-center p-1">
                {l.icon_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.icon_url} alt="" className="max-h-full max-w-full object-contain" />
                ) : <Package className="text-gray-300" size={24} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black leading-tight line-clamp-1">{l.market_name}</p>
                <p className="text-[11px] text-gray-400">{l.exterior}{l.stattrak ? ' · StatTrak™' : ''} · {l.listing_ref}</p>
                <p className="text-[11px] text-gray-400">You receive <b className="text-green-600">{Number(l.seller_payout).toLocaleString()} تومان</b> · {l.views} views</p>
              </div>
              <div className="text-right shrink-0 flex flex-col items-end gap-2">
                <span className="text-sm font-black text-green-600">{Number(l.price).toLocaleString()} تومان</span>
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${STATUS_COLOR[l.status] || 'bg-gray-100 text-gray-500'}`}>{l.status}</span>
                {l.status === 'ACTIVE' && (
                  <button onClick={() => cancel(l.listing_ref)} disabled={busy === l.listing_ref} className="text-[10px] font-black uppercase text-red-600 hover:underline disabled:opacity-50 inline-flex items-center gap-1">
                    <Trash2 size={11} /> Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
