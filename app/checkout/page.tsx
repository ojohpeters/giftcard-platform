"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, CreditCard, ArrowRight, CheckCircle2 } from "lucide-react";
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { ordersAPI, discountsAPI, referralsAPI } from '@/lib/api';
import Link from 'next/link';
import { formatIRRShort } from '@/lib/currency';
import { useI18n } from '@/lib/i18n';

export default function CheckoutPage() {
  const { t } = useI18n();
  const router = useRouter();
  const cart = useCartStore((state) => state.cart);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const user = useAuthStore((state) => state.user);

  const [discountCode, setDiscountCode] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [discount, setDiscount] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }
    if (!cart || cart.items.length === 0) {
      router.push('/cart');
      return;
    }
    fetchCart();
  }, [isInitialized, isAuthenticated, cart, router, fetchCart]);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    try {
      const response = await discountsAPI.validate(discountCode, parseFloat(cart?.total || '0'));
      setDiscount(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || t('checkout.invalidDiscountCode'));
      setDiscount(null);
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await ordersAPI.create({
        discount_code: discountCode || null,
        referral_code: referralCode || null,
      });
      setOrderId(response.data.id);
      setOrderPlaced(true);
      await clearCart();
    } catch (err: any) {
      setError(err.response?.data?.detail || t('checkout.orderFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !cart || cart.items.length === 0) {
    return null;
  }

  if (orderPlaced) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8 md:py-16 px-4 text-center">
        <div className="bg-white dark:bg-neutral-900 rounded-[32px] p-12 border-4 border-black dark:border-neutral-700 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:shadow-none">
          <div className="w-20 h-20 bg-green-50 dark:bg-green-950/40 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-4xl font-black mb-4 uppercase">{t('checkout.orderPlaced')}</h1>
          <p className="text-gray-500 dark:text-neutral-400 mb-2">{t('checkout.yourOrder')} #{orderId} {t('checkout.hasBeenPlaced')}</p>
          <p className="text-sm text-gray-400 dark:text-neutral-500 mb-8">{t('checkout.emailConfirmation')}</p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard/orders"
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest"
            >
              {t('checkout.viewOrders')}
            </Link>
            <Link
              href="/marketplace"
              className="bg-gray-100 dark:bg-neutral-800 text-black dark:text-neutral-100 px-8 py-4 rounded-2xl font-black uppercase tracking-widest"
            >
              {t('checkout.continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = parseFloat(cart.total);
  // Backend returns the computed discount_amount (handles both % and fixed, with caps).
  const discountAmount = discount ? parseFloat(discount.discount_amount || '0') : 0;
  const total = Math.max(subtotal - discountAmount, 0);

  return (
    <div className="w-full max-w-6xl mx-auto py-8 md:py-16 px-4 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="mb-10 md:mb-16">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
          {t('checkout.title')}<span className="text-blue-600">.</span>
        </h1>
        <p className="text-[10px] md:text-[11px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-[0.4em] mt-2">
          {t('checkout.subtitle')}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl">
          <p className="text-xs text-red-600 font-bold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN: ORDER DETAILS */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Order Items */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-[32px] p-6 md:p-8">
            <h2 className="text-xl font-black uppercase mb-6">{t('checkout.orderItems')}</h2>
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-neutral-800 last:border-0">
                  <div className="flex items-center gap-4">
                    {item.product.thumbnail_url && (
                      <img src={item.product.thumbnail_url} alt={item.product.name_en} className="w-12 h-12 rounded-xl object-cover" />
                    )}
                    <div>
                      <p className="font-black uppercase">{item.product.name_en}</p>
                      <p className="text-[10px] text-gray-400 dark:text-neutral-500">{t('checkout.qty')}: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-black tabular-nums">{formatIRRShort(item.total_iqd)} تومان</p>
                </div>
              ))}
            </div>
          </div>

          {/* Discount Code */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-[32px] p-6 md:p-8">
            <h2 className="text-xl font-black uppercase mb-4">{t('checkout.discountCode')}</h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder={t('checkout.enterDiscountCode')}
                className="flex-1 bg-gray-50 dark:bg-neutral-800 dark:text-neutral-100 border border-gray-200 dark:border-neutral-700 rounded-2xl py-3 px-4 outline-none focus:border-blue-600"
              />
              <button
                onClick={handleApplyDiscount}
                className="bg-black text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all"
              >
                {t('checkout.apply')}
              </button>
            </div>
            {discount && (
              <p className="text-sm text-green-600 mt-2 font-bold">
                {discount.code} — {t('checkout.discountApplied')}
              </p>
            )}
          </div>

          {/* Referral Code */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-[32px] p-6 md:p-8">
            <h2 className="text-xl font-black uppercase mb-4">{t('checkout.referralCodeOptional')}</h2>
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder={t('checkout.enterReferralCode')}
              className="w-full bg-gray-50 dark:bg-neutral-800 dark:text-neutral-100 border border-gray-200 dark:border-neutral-700 rounded-2xl py-3 px-4 outline-none focus:border-blue-600"
            />
          </div>

        </div>

        {/* RIGHT COLUMN: SUMMARY */}
        <div className="lg:col-span-4">
          <div className="bg-[#0A0A0B] rounded-[32px] p-6 md:p-8 text-white border border-white/5 shadow-2xl sticky top-28">
            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-8">{t('checkout.orderSummary')}</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('checkout.subtotal')}</span>
                <span className="text-sm font-black tabular-nums">{formatIRRShort(cart.total_iqd)} تومان</span>
              </div>
              {discount && (
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">{t('checkout.discountLabel')}</span>
                  <span className="text-sm font-black tabular-nums text-green-500">
                    -{formatIRRShort(discountAmount * parseFloat(cart.total_iqd.replace(/,/g, '')) / subtotal)} تومان
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{t('checkout.total')}</span>
                <span className="text-2xl font-black tabular-nums text-blue-500">
                  {formatIRRShort((subtotal > 0 ? (1 - discountAmount / subtotal) : 1) * parseFloat(cart.total_iqd.replace(/,/g, '')))} تومان
                </span>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl mb-6">
              <ShieldCheck className="text-blue-500 shrink-0" size={20} />
              <p className="text-[9px] text-gray-400 font-bold uppercase leading-relaxed tracking-wide">
                {t('checkout.secureCheckout')}
              </p>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all flex items-center justify-center gap-3"
            >
              {loading ? t('checkout.placingOrder') : t('checkout.placeOrder')} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

