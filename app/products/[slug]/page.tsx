"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Zap, ShoppingCart, Lock, ArrowLeft } from "lucide-react";
import { productsAPI } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { formatIQDShort } from '@/lib/currency';

interface Product {
  id: number;
  name_en: string;
  name_ar?: string;
  slug: string;
  description_en?: string;
  description_ar?: string;
  price_usd: string;
  price_iqd: string;
  thumbnail_url?: string;
  product_type: string;
  is_locked: boolean;
  category?: {
    name_en: string;
  };
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addToCart = useCartStore((state) => state.addToCart);
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    loadProduct();
  }, [params.slug]);

  const loadProduct = async () => {
    try {
      const response = await productsAPI.get(params.slug);
      setProduct(response.data);
    } catch (err: any) {
      setError('Product not found');
      console.error('Failed to load product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (product.is_locked && !isAuthenticated) {
      router.push(`/login?redirect=/products/${product.slug}`);
      return;
    }

    try {
      await addToCart(product.id, qty);
      await fetchCart();
      router.push('/cart');
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add to cart. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto py-6 md:py-12 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
          <div className="space-y-6">
            <div className="aspect-square bg-gray-100 rounded-[32px] border border-gray-200 animate-pulse" />
          </div>
          <div className="space-y-8">
            <div className="bg-[#0A0A0B] rounded-[32px] p-6 md:p-10 h-96 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="w-full max-w-5xl mx-auto py-6 md:py-12 px-4 text-center">
        <h1 className="text-4xl font-black mb-4">Product Not Found</h1>
        <Link href="/marketplace" className="text-blue-600 hover:underline">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const rate = Math.floor(parseFloat(product.price_iqd.replace(/,/g, '')) / parseFloat(product.price_usd));
  const totalPrice = (parseFloat(product.price_usd) * qty).toFixed(2);
  const totalIQD = (parseFloat(product.price_iqd.replace(/,/g, '')) * qty).toLocaleString();

  return (
    <div className="w-full max-w-5xl mx-auto py-6 md:py-12 px-4 animate-in fade-in duration-700">
      
      <Link href="/marketplace" className="flex items-center gap-2 text-gray-400 hover:text-black mb-6 transition-colors">
        <ArrowLeft size={18} />
        <span className="text-[10px] font-black uppercase tracking-widest">Back to Marketplace</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
        
        {/* LEFT: PRODUCT VIEW */}
        <div className="space-y-6">
          <div className="aspect-[4/3] md:aspect-square bg-gray-100 rounded-[32px] border border-gray-200 flex items-center justify-center overflow-hidden relative group">
            {product.thumbnail_url ? (
              <img src={product.thumbnail_url} alt={product.name_en} className="w-full h-full object-cover" />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300 italic">No Image</span>
              </>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {product.product_type === 'instant' && (
                <span className="text-[9px] font-black bg-green-600 text-white px-3 py-1 rounded-full uppercase tracking-widest">Instant Delivery</span>
              )}
              {product.product_type === 'request' && (
                <span className="text-[9px] font-black bg-orange-600 text-white px-3 py-1 rounded-full uppercase tracking-widest">On Request</span>
              )}
              {product.is_locked && (
                <span className="text-[9px] font-black bg-red-600 text-white px-3 py-1 rounded-full uppercase tracking-widest">Login Required</span>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
              {product.name_en}
              <span className="text-blue-600">.</span>
            </h1>
            {product.description_en && (
              <p className="text-xs md:text-sm text-gray-500 font-medium leading-relaxed max-w-md">
                {product.description_en}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT: PURCHASE UI */}
        <div className="space-y-8">
          
          {/* PRICING CARD */}
          <div className="bg-[#0A0A0B] rounded-[32px] p-6 md:p-10 text-white border border-white/5 shadow-2xl space-y-8">
            <div className="space-y-2">
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em]">Price</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter tabular-nums italic">
                  ${product.price_usd}
                </h2>
                <span className="text-xs md:text-lg text-gray-500 not-italic ml-2">
                  ≈ {formatIQDShort(product.price_iqd)} IQD
                </span>
              </div>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-2">
                Rate: {formatIQDShort(rate)} IQD / $1.00
              </p>
            </div>

            {/* QTY SELECTOR */}
            <div className="space-y-3">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Quantity</label>
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 rounded-2xl w-fit">
                <button 
                  onClick={() => setQty(Math.max(1, qty - 1))} 
                  className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all font-black"
                >
                  -
                </button>
                <span className="text-xl font-black w-8 text-center tabular-nums">{qty}</span>
                <button 
                  onClick={() => setQty(qty + 1)} 
                  className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all font-black"
                >
                  +
                </button>
              </div>
              <div className="pt-2 border-t border-white/10">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Total</p>
                <p className="text-2xl font-black tabular-nums">
                  ${totalPrice} ≈ {formatIQDShort(totalIQD)} IQD
                </p>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <div className="pt-4">
              {product.is_locked && !isAuthenticated ? (
                <div className="space-y-4">
                  <button className="w-full bg-white/5 border border-white/20 text-white/40 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] cursor-not-allowed flex items-center justify-center gap-3">
                    <Lock size={16} />
                    Login Required
                  </button>
                  <p className="text-[9px] text-center font-bold text-gray-500 uppercase tracking-widest">
                    <Link href={`/login?redirect=/products/${product.slug}`} className="text-blue-500 hover:underline">
                      Sign in
                    </Link> to purchase this product
                  </p>
                </div>
              ) : (
                <button 
                  onClick={handleAddToCart}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-blue-900/20"
                >
                  <ShoppingCart size={18} />
                  Add to Cart
                </button>
              )}
            </div>
          </div>

          {/* TRUST BADGE */}
          <div className="flex items-center justify-between px-4 opacity-50">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-blue-600" />
              <span className="text-[8px] font-black uppercase tracking-widest">Secure Checkout</span>
            </div>
            {product.product_type === 'instant' && (
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-blue-600" />
                <span className="text-[8px] font-black uppercase tracking-widest">Instant Delivery</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

