"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowRight, 
  ArrowUpRight,
  ShoppingBag,
  X,
  CheckCircle2,
  Trash2,
  TrendingUp,
  TrendingDown,
  Zap
} from "lucide-react";
import { productsAPI } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import EmptyCart from "../empty-cart/cart";
import Loading from '@/components/Loading';
import { formatIQDShort } from '@/lib/currency';

interface Product {
  id: number;
  name_en: string;
  slug: string;
  price_usd: string;
  price_iqd: string;
  thumbnail_url?: string;
  product_type: string;
  is_locked: boolean;
  category?: {
    name_en: string;
  };
}

export default function MarketplacePage() {
  const router = useRouter();
  const [usdAmount, setUsdAmount] = useState(100);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);
  const addToCart = useCartStore((state) => state.addToCart);
  const cart = useCartStore((state) => state.cart);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    loadCategories();
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  useEffect(() => {
    loadProducts();
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedCategory) {
        params.category_slug = selectedCategory;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      const response = await productsAPI.list(params);
      const loadedProducts = response.data.results || response.data || [];
      setProducts(loadedProducts);
      setFilteredProducts(loadedProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      setCategories(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];
    if (searchTerm && !selectedCategory) {
      filtered = filtered.filter(p => 
        p.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.name_en?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredProducts(filtered);
  };

  const handleAddToCart = async (product: Product) => {
    if (product.is_locked && !isAuthenticated) {
      router.push(`/login?redirect=/marketplace`);
      return;
    }
    try {
      await addToCart(product.id, 1);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] font-sans antialiased selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      
      {/* SUCCESS TOAST */}
      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[200] bg-black text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top duration-500">
          <CheckCircle2 className="text-green-500 w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest text-center">Asset Appended to Manifest</span>
        </div>
      )}

      {/* CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
            <div className="p-6 flex justify-between items-center border-b border-gray-100">
               <div className="flex items-center gap-2">
                 <ShoppingBag size={18} className="text-blue-600" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em]">Manifest Index ({cart?.items?.length || 0})</span>
               </div>
               <button onClick={() => setIsCartOpen(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-all"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {!cart || cart.items.length === 0 ? <EmptyCart /> : (
                <div className="p-6 md:p-10 space-y-6">
                  {cart.items.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-[24px] border border-gray-100">
                      <div className="flex items-center gap-4">
                        {item.product.thumbnail_url ? (
                          <img src={item.product.thumbnail_url} alt={item.product.name_en} className="w-12 h-12 rounded-xl object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                            <ShoppingBag size={20} className="text-gray-400" />
                          </div>
                        )}
                        <div className="text-left">
                          <p className="text-xs font-black uppercase italic leading-none">{item.product.name_en}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Value: ${item.product.price_usd} • Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <button onClick={() => router.push('/cart')} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <div className="pt-6 border-t border-gray-100">
                    <button onClick={() => { router.push('/cart'); setIsCartOpen(false); }} className="w-full py-5 bg-[#0A0A0B] text-white rounded-[24px] font-black uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl">
                      Open Full Manifest <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FLOATING CART TRIGGER */}
      {isAuthenticated && cart && cart.items.length > 0 && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-8 right-8 z-50 bg-[#0A0A0B] text-white w-20 h-20 rounded-[32px] flex items-center justify-center shadow-2xl hover:bg-blue-600 hover:-translate-y-2 transition-all duration-300 group"
        >
          <div className="relative">
            <ShoppingBag className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-4 border-[#0A0A0B]">
              {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
        </button>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* HERO SECTION */}
        <section className="pt-8 pb-12 md:pb-16 border-b border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-4 md:space-y-6 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-[9px] md:text-[10px] font-black tracking-[0.4em] text-blue-600 uppercase">Settlement Terminal v2.4</span>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.8] mb-4 md:mb-6">
                Direct <br /> <span className="text-gray-200">Liquidity.</span>
              </h1>
            </div>

            <div className="bg-[#0A0A0B] rounded-[32px] md:rounded-[48px] p-1 md:p-2 text-white shadow-2xl relative overflow-hidden border border-white/5">
               <div className="relative z-10 p-6 md:p-10 space-y-8 md:space-y-10 text-left">
                  <div className="space-y-4">
                    <p className="text-[9px] md:text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase">Step 01. Input USD Value</p>
                    <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                      <input 
                        type="number" 
                        value={usdAmount}
                        onChange={(e) => setUsdAmount(Number(e.target.value))}
                        className="bg-transparent text-5xl md:text-7xl font-black tracking-tighter outline-none w-full tabular-nums text-white appearance-none"
                      />
                      <span className="text-lg md:text-2xl font-black text-gray-700">USD</span>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 bg-blue-600 rounded-[24px] md:rounded-[32px] text-white border-2 border-black">
                    <p className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] opacity-80 uppercase mb-2">Guaranteed Payout</p>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter tabular-nums truncate">
                      {products.length > 0 ? formatIQDShort(usdAmount * Math.floor(parseFloat(products[0].price_iqd.replace(/,/g, '')) / parseFloat(products[0].price_usd))) : '0'} IQD
                    </h2>
                  </div>

                  <button 
                    onClick={() => {
                      if (products.length > 0) {
                        handleAddToCart(products[0]);
                      }
                    }}
                    className="w-full py-4 md:py-6 bg-white text-black rounded-xl md:rounded-[24px] font-black uppercase text-[10px] md:text-[12px] tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-3 group"
                  >
                    Add to Manifest <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </button>
               </div>
            </div>
          </div>
        </section>

        {/* MARKET INDEX SECTION */}
        <section className="py-12 md:py-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h3 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic">Market Index</h3>
            
            {/* SEARCH AND FILTER */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:border-blue-600 text-sm"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:border-blue-600 text-sm font-black uppercase text-xs"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug || cat.name_en}>
                    {cat.name_en}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {loading ? (
            <Loading message="Loading Products" size="lg" />
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 font-bold uppercase">No products found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                const rate = Math.floor(parseFloat(product.price_iqd.replace(/,/g, '')) / parseFloat(product.price_usd));
                return (
                  <Link key={product.id} href={`/products/${product.slug}`}>
                    <div className="group flex flex-col p-8 bg-white border-2 border-gray-100 rounded-[40px] hover:border-black transition-all duration-500 hover:shadow-2xl relative overflow-hidden cursor-pointer">
                      
                      {/* CARD HEADER */}
                      <div className="flex justify-between items-start mb-6 text-left relative z-10">
                        <div className="flex items-center gap-5">
                          {product.thumbnail_url ? (
                            <img src={product.thumbnail_url} alt={product.name_en} className="w-14 h-14 rounded-2xl object-cover group-hover:rotate-12 transition-transform" />
                          ) : (
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform">
                              🎁
                            </div>
                          )}
                          <div>
                            <h4 className="text-lg font-black tracking-tight text-gray-900 leading-tight">{product.name_en}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] font-black tracking-[0.1em] text-gray-400 uppercase">{product.category?.name_en || 'GIFT CARD'}</span>
                              {product.product_type === 'instant' && (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black border bg-green-50 border-green-200 text-green-600">
                                  <Zap size={10} strokeWidth={3} />
                                  INSTANT
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* FOOTER ACTION */}
                      <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100 relative z-10">
                         <div className="text-left">
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Exchange Rate</p>
                           <div className="flex items-baseline gap-1">
                              <p className="text-3xl font-black tracking-tighter tabular-nums text-gray-900">
                                {formatIQDShort(rate)} IQD
                              </p>
                              <span className="text-[10px] font-black text-gray-300 uppercase italic">/$</span>
                           </div>
                         </div>
                         
                         <button 
                           onClick={(e) => {
                             e.preventDefault();
                             handleAddToCart(product);
                           }}
                           className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center hover:bg-blue-600 transition-all shadow-lg active:scale-90"
                         >
                            <ArrowUpRight className="w-6 h-6" />
                         </button>
                      </div>

                      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gray-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-3xl pointer-events-none" />
                    </div>
                  </Link>
                );
              })}
              </div>
            </>
          )}
        </section>

      </main>
    </div>
  );
}