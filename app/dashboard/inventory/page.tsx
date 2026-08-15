"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, RefreshCw, Loader2, Package, Lock, Tag, AlertCircle } from "lucide-react";
import { FaSteam } from 'react-icons/fa';
import { steamAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface Item {
  id: number;
  asset_id: string;
  name: string;
  market_name: string;
  icon_url: string;
  item_type: string;
  weapon: string;
  rarity: string;
  exterior: string;
  stattrak: boolean;
  souvenir: boolean;
  tradable: boolean;
  marketable: boolean;
  float_value: number | null;
  stickers: string[];
}

// CS2 rarity accent colors.
const RARITY_COLOR: Record<string, string> = {
  'Consumer Grade': '#b0c3d9',
  'Industrial Grade': '#5e98d9',
  'Mil-Spec Grade': '#4b69ff',
  'Restricted': '#8847ff',
  'Classified': '#d32ce6',
  'Covert': '#eb4b4b',
  'Contraband': '#e4ae39',
  'Extraordinary': '#eb4b4b',
  'Master': '#e4ae39',
};
const rarityColor = (r: string) => RARITY_COLOR[r] || '#8a97a6';

export default function SteamInventoryPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [items, setItems] = useState<Item[]>([]);

  // filters
  const [q, setQ] = useState('');
  const [rarity, setRarity] = useState('all');
  const [exterior, setExterior] = useState('all');
  const [type, setType] = useState('all');
  const [tradableOnly, setTradableOnly] = useState(false);
  const [stOnly, setStOnly] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) { router.push('/login?redirect=/dashboard/inventory'); return; }
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, isAuthenticated]);

  const load = async (refresh: boolean) => {
    refresh ? setSyncing(true) : setLoading(true);
    try {
      const res = await steamAPI.inventory(refresh);
      setData(res.data);
      setItems(res.data?.items || []);
    } catch (e: any) {
      setData({ connected: e.response?.data?.connected ?? true, error: e.response?.data?.error || 'Could not load inventory.' });
    } finally {
      setLoading(false); setSyncing(false);
    }
  };

  const rarities = useMemo(() => Array.from(new Set(items.map(i => i.rarity).filter(Boolean))).sort(), [items]);
  const exteriors = useMemo(() => Array.from(new Set(items.map(i => i.exterior).filter(Boolean))).sort(), [items]);
  const types = useMemo(() => Array.from(new Set(items.map(i => i.item_type).filter(Boolean))).sort(), [items]);

  const filtered = useMemo(() => items.filter(i => {
    if (q && !(`${i.market_name} ${i.weapon}`.toLowerCase().includes(q.toLowerCase()))) return false;
    if (rarity !== 'all' && i.rarity !== rarity) return false;
    if (exterior !== 'all' && i.exterior !== exterior) return false;
    if (type !== 'all' && i.item_type !== type) return false;
    if (tradableOnly && !i.tradable) return false;
    if (stOnly && !i.stattrak) return false;
    return true;
  }), [items, q, rarity, exterior, type, tradableOnly, stOnly]);

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  const connected = data?.connected !== false;
  const priv = data?.error_code === 'PRIVATE' || data?.inventory_status === 'INVENTORY_PRIVATE';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1"><FaSteam className="text-[#66c0f4]" /><p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em]">CS2</p></div>
          <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">My Inventory<span className="text-blue-600">.</span></h1>
          {connected && !priv && <p className="text-xs text-gray-400 dark:text-neutral-500 mt-2">{data?.count ?? items.length} items{data?.last_sync ? ` · synced ${new Date(data.last_sync).toLocaleTimeString()}` : ''}</p>}
        </div>
        {connected && (
          <button onClick={() => load(true)} disabled={syncing}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 dark:bg-neutral-800 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 dark:hover:bg-neutral-700 disabled:opacity-50 transition-all">
            {syncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Refresh from Steam
          </button>
        )}
      </div>

      {/* NOT CONNECTED */}
      {!connected && (
        <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-3xl p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1b2838] flex items-center justify-center mx-auto"><FaSteam className="text-white text-3xl" /></div>
          <p className="text-lg font-black">Connect your Steam account</p>
          <p className="text-sm text-gray-500 dark:text-neutral-400 max-w-sm mx-auto">Link Steam in Settings to see your CS2 items here.</p>
          <button onClick={() => router.push('/dashboard/settings')} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-widest">Go to Settings</button>
        </div>
      )}

      {/* PRIVATE INVENTORY */}
      {connected && priv && (
        <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-3xl p-8 text-center space-y-3">
          <Lock className="w-10 h-10 text-yellow-600 mx-auto" />
          <p className="text-base font-black text-yellow-800 dark:text-yellow-300">Your Steam inventory is private</p>
          <p className="text-sm text-yellow-700 dark:text-yellow-400 max-w-md mx-auto">Set your inventory to <b>Public</b> in Steam → Profile → Edit Profile → Privacy Settings → Inventory, then Refresh.</p>
        </div>
      )}

      {/* ERROR (non-private) */}
      {connected && !priv && data?.error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600 shrink-0" size={20} />
          <p className="text-sm text-red-700 dark:text-red-300 font-bold">{data.error}</p>
        </div>
      )}

      {/* FILTERS + GRID */}
      {connected && !priv && (
        <>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search items…"
                className="w-full bg-gray-50 dark:bg-neutral-800 dark:text-neutral-100 border-0 rounded-2xl py-3.5 ps-12 pe-4 outline-none focus:ring-2 focus:ring-blue-600 text-sm" />
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={type} onChange={(e) => setType(e.target.value)} className="bg-gray-50 dark:bg-neutral-800 dark:text-neutral-100 border-0 rounded-xl py-2.5 px-3 text-xs font-bold outline-none">
                <option value="all">All types</option>{types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={rarity} onChange={(e) => setRarity(e.target.value)} className="bg-gray-50 dark:bg-neutral-800 dark:text-neutral-100 border-0 rounded-xl py-2.5 px-3 text-xs font-bold outline-none">
                <option value="all">All rarities</option>{rarities.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <select value={exterior} onChange={(e) => setExterior(e.target.value)} className="bg-gray-50 dark:bg-neutral-800 dark:text-neutral-100 border-0 rounded-xl py-2.5 px-3 text-xs font-bold outline-none">
                <option value="all">All wears</option>{exteriors.map(x => <option key={x} value={x}>{x}</option>)}
              </select>
              <button onClick={() => setTradableOnly(v => !v)} className={`px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-colors ${tradableOnly ? 'bg-green-600 text-white' : 'bg-gray-50 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400'}`}>Tradable</button>
              <button onClick={() => setStOnly(v => !v)} className={`px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-colors ${stOnly ? 'bg-orange-600 text-white' : 'bg-gray-50 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400'}`}>StatTrak</button>
            </div>
            <p className="text-[11px] text-gray-400 dark:text-neutral-500 font-bold">{filtered.length} shown</p>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-16"><Package className="w-12 h-12 text-gray-300 dark:text-neutral-600 mx-auto mb-3" /><p className="text-gray-400 dark:text-neutral-500 font-bold uppercase text-sm">No CS2 items found</p></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filtered.map((it) => (
                <div key={it.id} className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl overflow-hidden flex flex-col" style={{ borderTop: `3px solid ${rarityColor(it.rarity)}` }}>
                  <div className="aspect-[4/3] bg-gray-50 dark:bg-neutral-800 flex items-center justify-center p-3">
                    {it.icon_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.icon_url} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
                    ) : <Package className="text-gray-300" size={32} />}
                  </div>
                  <div className="p-3 flex-1 flex flex-col gap-1.5">
                    <p className="text-xs font-black leading-tight line-clamp-2">{it.market_name || it.name}</p>
                    <div className="flex flex-wrap gap-1">
                      {it.exterior && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400">{it.exterior}</span>}
                      {it.stattrak && <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-300">StatTrak™</span>}
                      {it.souvenir && <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300">Souvenir</span>}
                    </div>
                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <span className={`text-[9px] font-black uppercase ${it.tradable ? 'text-green-600' : 'text-gray-400'}`}>{it.tradable ? 'Tradable' : 'Locked'}</span>
                      <button disabled title="Selling opens soon" className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide text-gray-400 dark:text-neutral-600 cursor-not-allowed">
                        <Tag size={11} /> Sell soon
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
