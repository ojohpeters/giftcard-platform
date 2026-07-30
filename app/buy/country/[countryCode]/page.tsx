"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Zap, ArrowRight } from "lucide-react";
import { productsAPI } from '@/lib/api';
import Loading from '@/components/Loading';
import { useI18n } from '@/lib/i18n';

interface Product {
  id: number;
  name_en: string;
  slug: string;
  price_usd: string;
  thumbnail_url?: string;
  product_type: string;
  category?: {
    name_en: string;
  };
}

interface Country {
  id: number;
  name: string;
  code: string;
  flag_emoji: string;
}

export default function CountryProductsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [country, setCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [params.countryCode]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getByCountry(params.countryCode as string);
      setProducts(response.data.products || []);
      setCountry(response.data.country);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0b] text-[#0A0A0A] dark:text-neutral-100 font-sans antialiased">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <Link href="/buy" className="inline-flex items-center gap-2 text-gray-600 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-neutral-100 mb-8">
          <ArrowLeft size={20} />
          <span className="text-sm font-bold">{t('buyCountry.backToCountries')}</span>
        </Link>

        {country && (
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl">{country.flag_emoji || '🌍'}</span>
              <div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
                  {country.name}<span className="text-blue-600">.</span>
                </h1>
                <p className="text-sm text-gray-600 dark:text-neutral-300 mt-2">{t('buyCountry.availableGiftCards')}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <Loading message={t('buyCountry.loadingProducts')} size="lg" />
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 dark:text-neutral-500 font-bold uppercase">{t('buyCountry.noProducts')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/buy/product/${product.id}`}>
                <div className="group flex flex-col p-8 bg-white dark:bg-neutral-900 border-2 border-gray-100 dark:border-neutral-800 rounded-[40px] hover:border-black dark:hover:border-neutral-700 transition-all duration-500 hover:shadow-2xl cursor-pointer">
                  {product.thumbnail_url && (
                    <img
                      src={product.thumbnail_url}
                      alt={product.name_en}
                      className="w-full h-48 object-cover rounded-2xl mb-6"
                    />
                  )}
                  <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-neutral-100 mb-2">{product.name_en}</h3>
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100 dark:border-neutral-800">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-1">{t('buyCountry.startingFrom')}</p>
                      <p className="text-2xl font-black tracking-tighter tabular-nums text-gray-900 dark:text-neutral-100">
                        ${product.price_usd}
                      </p>
                    </div>
                    {product.product_type === 'instant' && (
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black border bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900 text-green-600 dark:text-green-300">
                        <Zap size={10} strokeWidth={3} />
                        {t('buyCountry.instant')}
                      </div>
                    )}
                    <ArrowRight className="text-gray-300 dark:text-neutral-600 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={20} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

