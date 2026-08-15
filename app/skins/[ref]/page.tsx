"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, ShoppingCart, Package } from "lucide-react";
import { FaSteam } from 'react-icons/fa';
import { steamAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const RARITY_COLOR: Record<string, string> = {
  'Consumer Grade': '#b0c3d9', 'Industrial Grade': '#5e98d9', 'Mil-Spec Grade': '#4b69ff',
  'Restricted': '#8847ff', 'Classified': '#d32ce6', 'Covert': '#eb4b4b',
  'Contraband': '#e4ae39', 'Extraordinary': '#eb4b4b', 'Master': '#e4ae39',
};
const rc = (r: string) => RARITY_COLOR[r] || '#8a97a6';

export default function SkinDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ref = params?.ref as string;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    if (!ref) return;
    steamAPI.marketItem(ref)
      .then((r) => setItem(r.data))
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [ref]);

  const handleBuy = async () => {
    if (!isAuthenticated) { router.push(`/login?redirect=/skins/${ref}`); return; }
    setNotice(''); setBuying(true);
    try {
      const res = await steamAPI.buyNow(ref);
      if (res.data?.payment_url) { window.location.href = res.data.payment_url; return; }  // → Zarinpal
      if (res.data?.dev_bypass) { router.push('/dashboard/purchases?paid=1'); return; }
      setNotice('Could not start checkout. Please try again.');
    } catch (e: any) {
      setNotice(e.response?.data?.error || 'Could not start checkout.');
    } finally {
      setBuying(false);
    }
  };

  if (loading) return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  if (!item || item.error) return (
    <div className="max-w-3xl mx-auto py-16 px-4 text-center">
      <p className="text-lg font-black">Listing not found</p>
      <Link href="/skins" className="text-blue-600 font-bold text-sm hover:underline mt-3 inline-block">← Back to marketplace</Link>
    </div>
  );

  const attr = (label: string, value: any) => value ? (
    <div className="flex justify-between py-2 border-b border-gray-50 dark:border-neutral-800">
      <span className="text-xs font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-bold">{value}</span>
    </div>
  ) : null;

  return (
    <div className="max-w-5xl mx-auto py-6 md:py-10 px-4">
      <Link href="/skins" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black dark:hover:text-neutral-100 mb-6">
        <ArrowLeft size={14} className="rtl:rotate-180" /> Marketplace
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-3xl p-8 flex items-center justify-center" style={{ borderTop: `4px solid ${rc(item.rarity)}` }}>
          {item.icon_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.icon_url} alt="" className="max-h-72 object-contain" />
          ) : <Package size={64} className="text-gray-300" />}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-1"><FaSteam className="text-[#66c0f4]" /><span className="text-[11px] font-black uppercase tracking-widest" style={{ color: rc(item.rarity) }}>{item.rarity || 'CS2'}</span></div>
            <h1 className="text-2xl md:text-3xl font-black leading-tight">{item.market_name}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {item.exterior && <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300">{item.exterior}</span>}
              {item.stattrak && <span className="text-[11px] font-black px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-300">StatTrak™</span>}
              {item.souvenir && <span className="text-[11px] font-black px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300">Souvenir</span>}
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-4">
            {attr('Type', item.item_type)}
            {attr('Weapon', item.weapon)}
            {attr('Exterior', item.exterior)}
            {attr('Float', item.float_value != null ? Number(item.float_value).toFixed(4) : null)}
            {attr('Stickers', item.stickers?.length ? item.stickers.join(', ') : null)}
            {attr('Seller', item.seller_name)}
            {attr('Listing', item.listing_ref)}
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-5">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Price</p>
            <p className="text-3xl font-black text-green-600 mb-4">{Number(item.price).toLocaleString()} تومان</p>
            <button onClick={handleBuy} disabled={buying} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black uppercase text-sm tracking-widest py-4 rounded-2xl transition-all">
              {buying ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />} Buy Now
            </button>
            {notice && <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-3 text-center">{notice}</p>}
            <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-3 text-center">Your item stays with the seller until you pay; HiGc then handles the secure Steam trade.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
