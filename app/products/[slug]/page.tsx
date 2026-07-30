"use client";
import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Zap, 
  ArrowLeft,
  CheckCircle2,
  Globe,
  CreditCard,
  AlertCircle,
  Package,
  ChevronRight,
  Tag,
  MapPin,
  DollarSign
} from "lucide-react";
import { productsAPI } from '@/lib/api';
import Link from 'next/link';
import Loading from '@/components/Loading';
import { useI18n } from '@/lib/i18n';

interface GiftCardBrand {
  id: string;
  name: string;
  slug: string;
  image: string;
  image_ios?: string;
  image_android?: string;
  is_active: boolean;
  countries?: {
    iso_code: string;
    name: string;
    currency_code: string;
    card_types: {
      id: string;
      card_type: string;
      min_amount: string;
      max_amount: string | null;
      rate: string;
      is_active: boolean;
    }[];
  }[];
}

interface Country {
  iso_code: string;
  name: string;
  currency_code: string;
  flag_url?: string;
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { t } = useI18n();
  const resolvedParams = use(params);
  const [brand, setBrand] = useState<GiftCardBrand | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    loadBrandData();
  }, [resolvedParams.slug]);

  const loadBrandData = async () => {
    try {
      setLoading(true);
      // First get the brand by slug from the brands list
      const brandsResponse = await productsAPI.getBrands();
      const brandData = brandsResponse.data.find((b: GiftCardBrand) => b.slug === resolvedParams.slug);
      
      if (!brandData) {
        setError('Brand not found');
        return;
      }
      
      // Get full brand data with countries and card types
      const fullDataResponse = await productsAPI.getBrandFullData(brandData.id);
      setBrand(fullDataResponse.data);
      
      // Extract unique countries
      if (fullDataResponse.data.countries) {
        const seenIsoCodes = new Set();
        const uniqueCountries = fullDataResponse.data.countries
          .filter((c: any) => {
            if (seenIsoCodes.has(c.iso_code)) {
              return false;
            }
            seenIsoCodes.add(c.iso_code);
            return true;
          })
          .map((c: any) => ({
            iso_code: c.iso_code,
            name: c.name,
            currency_code: c.currency_code,
            flag_url: c.flag_url
          }));
        setCountries(uniqueCountries);
        if (uniqueCountries.length > 0) {
          setSelectedCountry(uniqueCountries[0].iso_code);
        }
      }
    } catch (err: any) {
      setError('Brand not found');
      console.error('Failed to load brand:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCardTypesForCountry = () => {
    if (!brand?.countries || !selectedCountry) return [];
    const countryData = brand.countries.find(c => c.iso_code === selectedCountry);
    return countryData?.card_types || [];
  };

  if (loading) {
    return <Loading fullScreen message={t('product.loading')} />;
  }

  if (error || !brand) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-gray-300 dark:text-neutral-600 mx-auto mb-4" />
          <h1 className="text-3xl font-black mb-4">{t('product.brand_not_found_title')}</h1>
          <p className="text-gray-500 dark:text-neutral-400 mb-6">{t('product.brand_not_found_desc')}</p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-black uppercase text-sm hover:bg-blue-700 transition-all"
          >
            <ArrowLeft size={16} />
            {t('product.return_to_marketplace')}
          </Link>
        </div>
      </div>
    );
  }

  const cardTypes = getCardTypesForCountry();
  const selectedCountryData = countries.find(c => c.iso_code === selectedCountry);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0a0a0b] dark:to-[#0a0a0b]">
      {/* BREADCRUMBS */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-neutral-400 mb-6">
          <Link href="/" className="hover:text-gray-900 dark:hover:text-neutral-100 transition-colors">{t('product.breadcrumb_home')}</Link>
          <ChevronRight size={14} />
          <Link href="/marketplace" className="hover:text-gray-900 dark:hover:text-neutral-100 transition-colors">{t('product.breadcrumb_marketplace')}</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 dark:text-neutral-100 font-black">{brand.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* HEADER SECTION */}
        <div className="bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-neutral-700 rounded-3xl overflow-hidden shadow-xl mb-8">
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Brand Image */}
              <div className="w-32 h-32 bg-gray-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                {brand.image ? (
                  <img src={brand.image} alt={brand.name} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-16 h-16 text-gray-300 dark:text-neutral-600" />
                )}
              </div>
              
              {/* Brand Info */}
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-tight mb-4">
                  {brand.name}
                  <span className="text-blue-600">.</span>
                </h1>
                
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-900 px-3 py-1.5 rounded-full text-xs font-black uppercase">
                    <Globe size={14} />
                    {countries.length} {t('product.countries_count')}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-2 border-green-200 dark:border-green-900 px-3 py-1.5 rounded-full text-xs font-black uppercase">
                    <Zap size={14} />
                    {t('product.ecodes_available')}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-2 border-purple-200 dark:border-purple-900 px-3 py-1.5 rounded-full text-xs font-black uppercase">
                    <CreditCard size={14} />
                    {t('product.physical_cards')}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-neutral-300 leading-relaxed">
                  {t('product.description_prefix')} {brand.name} {t('product.description_suffix')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* COUNTRY SELECTOR */}
        <div className="bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-neutral-700 rounded-3xl overflow-hidden shadow-xl mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-neutral-700">
            <h2 className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
              <MapPin size={20} className="text-blue-600" />
              {t('product.select_country')}
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {countries.map((country) => (
                <button
                  key={country.iso_code}
                  type="button"
                  onClick={() => setSelectedCountry(country.iso_code)}
                  className={`p-4 rounded-xl border-2 transition-all text-center cursor-pointer ${
                    selectedCountry === country.iso_code
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600 text-gray-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="text-2xl mb-2 pointer-events-none">
                    {country.flag_url ? (
                      <img src={country.flag_url} alt={country.name} className="w-8 h-6 mx-auto object-cover rounded pointer-events-none" />
                    ) : (
                      <span className="text-3xl">🏳️</span>
                    )}
                  </div>
                  <p className="text-xs font-black uppercase tracking-tight truncate pointer-events-none">{country.name}</p>
                  <p className="text-[10px] text-gray-500 dark:text-neutral-400 pointer-events-none">{country.currency_code}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CARD TYPES FOR SELECTED COUNTRY */}
        {selectedCountry && (
          <div className="bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-neutral-700 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-gray-200 dark:border-neutral-700">
              <h2 className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
                <CreditCard size={20} className="text-blue-600" />
                {t('product.available_card_types')} - {selectedCountryData?.name}
              </h2>
            </div>
            <div className="p-6">
              {cardTypes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cardTypes.map((cardType) => (
                    <div
                      key={cardType.id}
                      className="p-6 border-2 border-gray-200 dark:border-neutral-700 rounded-2xl hover:border-blue-600 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase ${
                            cardType.card_type === 'E-CODE' 
                              ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-900'
                              : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900'
                          }`}>
                            {cardType.card_type === 'E-CODE' ? (
                              <>
                                <Zap size={12} />
                                {t('product.ecode_digital')}
                              </>
                            ) : (
                              <>
                                <CreditCard size={12} />
                                {t('product.physical_card')}
                              </>
                            )}
                          </span>
                        </div>
                        {cardType.is_active && (
                          <CheckCircle2 size={18} className="text-green-600" />
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-neutral-300">{t('product.min_amount')}</span>
                          <span className="font-black">${cardType.min_amount}</span>
                        </div>
                        {cardType.max_amount && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-neutral-300">{t('product.max_amount')}</span>
                            <span className="font-black">${cardType.max_amount}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-neutral-300">{t('product.currency')}</span>
                          <span className="font-black">{selectedCountryData?.currency_code}</span>
                        </div>
                      </div>
                      
                      <button className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all">
                        {t('product.select_this_card')}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-300 dark:text-neutral-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-neutral-400">{t('product.no_card_types')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TRUST BADGES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { icon: ShieldCheck, text: t('product.badge_secure_payment'), color: 'blue' },
            { icon: Zap, text: t('product.badge_instant_delivery'), color: 'green' },
            { icon: Globe, text: t('product.badge_global_coverage'), color: 'purple' },
            { icon: CheckCircle2, text: t('product.badge_verified_cards'), color: 'orange' }
          ].map((badge, idx) => (
            <div key={idx} className="bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-neutral-700 rounded-2xl p-4 text-center">
              <badge.icon className={`w-8 h-8 mx-auto mb-2 text-${badge.color}-600`} />
              <p className="text-xs font-black uppercase tracking-widest text-gray-700 dark:text-neutral-300">{badge.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
