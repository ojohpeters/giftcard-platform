"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Trash2, 
  ArrowRight, 
  ShieldCheck, 
  Plus,
  Minus,
  ShoppingBag
} from "lucide-react";
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import EmptyCart from "../empty-cart/cart"; 
import Link from 'next/link';
import { formatIRRShort } from '@/lib/currency';
import { useI18n } from '@/lib/i18n';

export default function CartPage() {
  const { t } = useI18n();
  const router = useRouter();
  const cart = useCartStore((state) => state.cart);
  const isLoading = useCartStore((state) => state.isLoading);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeItem(itemId);
    } else {
      await updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemove = async (itemId: number) => {
    await removeItem(itemId);
  };

  if (isInitialized && !isAuthenticated) {
    return (
      <div className="w-full max-w-6xl mx-auto py-8 md:py-16 px-4 text-center">
        <h1 className="text-4xl font-black mb-4">{t('cart.login_required')}</h1>
        <p className="text-gray-500 dark:text-neutral-400 mb-6">{t('cart.login_required_desc')}</p>
        <Link href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase">
          {t('cart.go_to_login')}
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto py-8 md:py-16 px-4">
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-gray-100 dark:bg-neutral-800 rounded-[24px]" />
          ))}
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-8 md:py-16 px-4 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="mb-10 md:mb-16">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
          {t('cart.title')}<span className="text-blue-600">.</span>
        </h1>
        <p className="text-[10px] md:text-[11px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-[0.4em] mt-2">
          {t('cart.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN: ITEM LIST */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-4 pb-4 border-b border-gray-100 dark:border-neutral-800 mb-4">
            <span className="text-[9px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-widest">{t('cart.product')}</span>
            <span className="text-[9px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-widest hidden md:block">{t('cart.quantity')}</span>
            <span className="text-[9px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-widest hidden md:block">{t('cart.price')}</span>
          </div>

          {cart.items.map((item) => (
            <div key={item.id} className="group bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-[24px] p-5 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4 transition-all hover:shadow-xl hover:shadow-gray-100/50">
              <div className="flex items-center gap-5 flex-1">
                {item.product.thumbnail_url ? (
                  <img src={item.product.thumbnail_url} alt={item.product.name_en} className="w-16 h-16 rounded-2xl object-cover shrink-0" />
                ) : (
                  <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-black italic shrink-0">
                    <ShoppingBag size={24} />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-sm md:text-base font-black uppercase italic tracking-tight">{item.product.name_en}</h3>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase mt-1">
                    ${item.product.price_usd} {t('cart.each')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between md:justify-end gap-6 md:gap-10">
                {/* Quantity Controls */}
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-neutral-800 rounded-2xl p-2">
                  <button 
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-xl transition-all font-black"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-lg font-black tabular-nums w-8 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-xl transition-all font-black"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Price */}
                <div className="text-right min-w-[120px]">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{t('cart.total')}</p>
                  <p className="text-lg font-black tabular-nums italic">{formatIRRShort(item.total_iqd)} تومان</p>
                  <p className="text-[9px] text-gray-400 dark:text-neutral-500">${item.total}</p>
                </div>

                {/* Remove Button */}
                <button 
                  onClick={() => handleRemove(item.id)}
                  className="p-3 bg-red-50 dark:bg-red-950/40 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          <Link href="/marketplace" className="w-full py-6 border-2 border-dashed border-gray-100 dark:border-neutral-800 rounded-[24px] text-[10px] font-black text-gray-300 dark:text-neutral-600 uppercase tracking-[0.3em] hover:border-blue-600 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
            <Plus size={16} />
            {t('cart.continue_shopping')}
          </Link>
        </div>

        {/* RIGHT COLUMN: SUMMARY & CHECKOUT */}
        <div className="lg:col-span-4">
          <div className="bg-[#0A0A0B] rounded-[32px] p-6 md:p-8 text-white border border-white/5 shadow-2xl sticky top-28">
            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-8">{t('cart.order_summary')}</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('cart.subtotal')}</span>
                <span className="text-sm font-black tabular-nums">{formatIRRShort(cart.total_iqd)} تومان</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{t('cart.total')}</span>
                <span className="text-2xl font-black tabular-nums text-blue-500">{formatIRRShort(cart.total_iqd)} تومان</span>
              </div>
              <p className="text-[9px] text-gray-500 text-right">≈ ${cart.total}</p>
            </div>

            {/* Trust Badge */}
            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl mb-6">
              <ShieldCheck className="text-blue-500 shrink-0" size={20} />
              <p className="text-[9px] text-gray-400 font-bold uppercase leading-relaxed tracking-wide">
                {t('cart.secure_checkout')}
              </p>
            </div>

            {/* Checkout Button */}
            <Link 
              href="/checkout"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all flex items-center justify-center gap-3"
            >
              {t('cart.proceed_to_checkout')} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
