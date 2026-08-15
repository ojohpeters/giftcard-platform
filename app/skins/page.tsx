"use client";
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Loader2, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { FaSteam } from 'react-icons/fa';
import { steamAPI } from '@/lib/api';

const RARITY_COLOR: Record<string, string> = {
  'Consumer Grade': '#b0c3d9', 'Industrial Grade': '#5e98d9', 'Mil-Spec Grade': '#4b69ff',
  'Restricted': '#8847ff', 'Classified': '#d32ce6', 'Covert': '#eb4b4b',
  'Contraband': '#e4ae39', 'Extraordinary': '#eb4b4b', 'Master': '#e4ae39',
};
const rc = (r: string) => RARITY_COLOR[r] || '#8a97a6';

export default function SkinsMarketplacePage() {
  const [items, setItems] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [sort, setSort] = useState('newest');
  const [stattrak, setStattrak] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 24;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  useEffect(() => { const t = setTimeout(() => { setDebouncedQ(q); setPage(1); }, 400); return () => clearTimeout(t); }, [q]);

  useEffect(() => {
    setLoading(true);
    const params: any = { page, sort };
    if (debouncedQ) params.q = debouncedQ;
    if (stattrak) params.stattrak = 1;
    steamAPI.market(params)
      .then((r) => { setItems(r.data?.results || []); setCount(r.data?.count || 0); })
      .catch(() => { setItems([]); setCount(0); })
      .finally(() => setLoading(false));
  }, [page, sort, debouncedQ, stattrak]);

  return (
    <div className="w-full max-w-7xl mx-auto py-6 md:py-10 px-4 space-y-6">
      <div className="flex items-center gap-2"><FaSteam className="text-[#66c0f4]" /><p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em]">CS2 Skins</p></div>
      <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">Marketplace<span className="text-blue-600">.</span></h1>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search skins…"
            className="w-full bg-gray-50 dark:bg-neutral-800 dark:text-neutral-100 border-0 rounded-2xl py-3.5 ps-12 pe-4 outline-none focus:ring-2 focus:ring-blue-600 text-sm" />
        </div>
        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="bg-gray-50 dark:bg-neutral-800 dark:text-neutral-100 border-0 rounded-2xl py-3.5 px-4 text-sm font-bold outline-none">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
        <button onClick={() => { setStattrak(v => !v); setPage(1); }} className={`px-4 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wide transition-colors ${stattrak ? 'bg-orange-600 text-white' : 'bg-gray-50 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400'}`}>StatTrak</button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-14 h-14 text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
          <p className="text-gray-400 dark:text-neutral-500 font-bold uppercase">No skins listed yet</p>
          <p className="text-sm text-gray-400 mt-1">Be the first — connect Steam and list an item from your inventory.</p>
        </div>
      ) : (
        <>
          <p className="text-[11px] text-gray-400 dark:text-neutral-500 font-bold">{count.toLocaleString()} listed</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {items.map((it) => (
              <Link key={it.listing_ref} href={`/skins/${it.listing_ref}`} className="group bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl overflow-hidden flex flex-col hover:shadow-lg transition-all" style={{ borderTop: `3px solid ${rc(it.rarity)}` }}>
                <div className="aspect-[4/3] bg-gray-50 dark:bg-neutral-800 flex items-center justify-center p-3">
                  {it.icon_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.icon_url} alt="" loading="lazy" className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                  ) : <Package className="text-gray-300" size={32} />}
                </div>
                <div className="p-3 flex-1 flex flex-col gap-1">
                  <p className="text-xs font-black leading-tight line-clamp-2">{it.market_name}</p>
                  <div className="flex flex-wrap gap-1">
                    {it.exterior && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400">{it.exterior}</span>}
                    {it.stattrak && <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-300">ST™</span>}
                  </div>
                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <span className="text-sm font-black text-green-600">{Number(it.price).toLocaleString()} تومان</span>
                    <span className="text-[9px] font-bold text-gray-400 truncate max-w-[70px]">{it.seller_name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-2.5 rounded-xl bg-gray-100 dark:bg-neutral-800 disabled:opacity-40"><ChevronLeft size={18} className="rtl:rotate-180" /></button>
              <span className="text-sm font-black tabular-nums">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-2.5 rounded-xl bg-gray-100 dark:bg-neutral-800 disabled:opacity-40"><ChevronRight size={18} className="rtl:rotate-180" /></button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
