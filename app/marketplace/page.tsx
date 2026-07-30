"use client";
import Link from 'next/link';
import {
  ArrowRight,
  ShoppingBag,
  Upload
} from "lucide-react";
import { useI18n } from '@/lib/i18n';

export default function MarketplacePage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0b] text-[#0A0A0A] dark:text-neutral-100 font-sans antialiased selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* HERO SECTION */}
        <section className="pt-12 pb-16 md:pb-20 border-b border-gray-100 dark:border-neutral-800">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[9px] md:text-[10px] font-black tracking-[0.4em] text-blue-600 uppercase">{t('market.badge')}</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.8] mb-4 md:mb-6">
              {t('market.heroTitleLine1')} <br /> <span className="text-gray-200 dark:text-neutral-700">{t('market.heroTitleLine2')}</span>
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-neutral-300 max-w-2xl mx-auto">
              {t('market.heroSubtitle')}
            </p>
          </div>
        </section>

        {/* ACTION CARDS */}
        <section className="py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* BUY GIFT CARD CARD */}
            <Link href="/buy">
              <div className="group relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 border-2 border-blue-200 dark:border-blue-900 rounded-[40px] p-8 md:p-12 hover:border-blue-600 transition-all duration-500 hover:shadow-2xl cursor-pointer overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full opacity-0 group-hover:opacity-20 transition-opacity blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <ShoppingBag className="text-white" size={32} />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase mb-4">
                    {t('market.buyTitle')}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-neutral-300 mb-6">
                    {t('market.buyDescription')}
                  </p>
                  <div className="flex items-center gap-2 text-blue-600 font-black uppercase text-xs tracking-widest">
                    {t('market.buyCta')} <ArrowRight className="group-hover:translate-x-2 transition-transform" size={16} />
                  </div>
                </div>
              </div>
            </Link>

            {/* SELL GIFT CARD CARD */}
            <Link href="/sell">
              <div className="group relative bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/30 border-2 border-green-200 dark:border-green-900 rounded-[40px] p-8 md:p-12 hover:border-green-600 transition-all duration-500 hover:shadow-2xl cursor-pointer overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-200 rounded-full opacity-0 group-hover:opacity-20 transition-opacity blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Upload className="text-white" size={32} />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase mb-4">
                    {t('market.sellTitle')}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-neutral-300 mb-6">
                    {t('market.sellDescription')}
                  </p>
                  <div className="flex items-center gap-2 text-green-600 font-black uppercase text-xs tracking-widest">
                    {t('market.sellCta')} <ArrowRight className="group-hover:translate-x-2 transition-transform" size={16} />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
