"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowLeft,
  Globe,
  ShoppingBag,
  Zap,
  CreditCard,
  CheckCircle2,
  MapPin,
  Package,
  Shield,
  Clock,
  ChevronRight,
  Check,
  X
} from "lucide-react";
import { productsAPI, ordersAPI, discountsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import SearchablePicker from '@/components/wizard/SearchablePicker';
import CountryFlag from '@/components/wizard/CountryFlag';
import BrandLogo from '@/components/wizard/BrandLogo';
import { currencySymbol, formatMoney } from '@/lib/currency';
import { useI18n } from '@/lib/i18n';

interface GiftCardCountry {
  iso_code: string;
  name: string;
  currency_code: string;
  flag_url?: string;
  is_active: boolean;
}

interface GiftCardBrand {
  id: string;
  name: string;
  slug: string;
  image: string;
  is_active: boolean;
}

interface CardType {
  id: string;
  card_type: string;
  min_amount: string;
  max_amount: string | null;
  rate: string;
  is_active: boolean;
  sample_image?: string;
}

type Step = 'country' | 'brand' | 'cardType' | 'amount' | 'confirm';

export default function BuyPage() {
  const router = useRouter();
  const { t } = useI18n();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  // State
  const [step, setStep] = useState<Step>('country');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  // Distinguishes "load failed" from "genuinely empty" and surfaces submit errors inline.
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Exchange rate for IRR
  const [exchangeRate, setExchangeRate] = useState<number>(42000);

  // Data
  const [countries, setCountries] = useState<GiftCardCountry[]>([]);
  const [brands, setBrands] = useState<GiftCardBrand[]>([]);
  const [cardTypes, setCardTypes] = useState<CardType[]>([]);

  // Selections
  const [selectedCountry, setSelectedCountry] = useState<GiftCardCountry | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<GiftCardBrand | null>(null);
  const [selectedCardType, setSelectedCardType] = useState<CardType | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  // Discount state
  const [discountCode, setDiscountCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState<any>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [validatingDiscount, setValidatingDiscount] = useState(false);

  // Payment state
  const [purchaseRequest, setPurchaseRequest] = useState<any>(null);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/buy');
      return;
    }
    loadCountries();
    loadExchangeRate();
  }, [isInitialized, isAuthenticated]);

  const loadExchangeRate = async () => {
    try {
      const response = await ordersAPI.getExchangeRate();
      setExchangeRate(response.data.exchange_rate || 42000);
    } catch (error) {
      console.error('Failed to load exchange rate:', error);
    }
  };

  const loadCountries = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await productsAPI.getGCCountries();
      setCountries(response.data || []);
    } catch (error) {
      console.error('Failed to load countries:', error);
      setLoadError(t('buy.loadErrorCountries'));
    } finally {
      setLoading(false);
    }
  };

  // Format IRR (Toman) amount. Uses the selected card type's own rate
  // (Toman per 1 unit of its native currency) so £/€/$ cards settle
  // correctly; falls back to the global USD rate when none is set.
  const formatIRR = (faceAmount: number) => {
    const effectiveRate =
      selectedCardType && Number(selectedCardType.rate) > 0
        ? Number(selectedCardType.rate)
        : exchangeRate;
    const irrAmount = faceAmount * effectiveRate;
    return new Intl.NumberFormat('fa-IR').format(irrAmount) + ' تومان';
  };

  const loadBrandsForCountry = async (countryCode: string) => {
    setLoading(true);
    setLoadError(null);
    try {
      // Only show brands actually sold in the chosen country (BUG B fix).
      const response = await productsAPI.getBrands(countryCode);
      const allBrands = response.data?.results || response.data || [];
      setBrands(allBrands);
    } catch (error) {
      console.error('Failed to load brands:', error);
      setLoadError(t('buy.loadErrorBrands'));
    } finally {
      setLoading(false);
    }
  };

  const loadCardTypes = async (brandId: string, countryCode: string) => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await productsAPI.getCardTypes(brandId, countryCode);
      const results = response.data.results || response.data || [];
      setCardTypes(results);
    } catch (error) {
      console.error('Failed to load card types:', error);
      setCardTypes([]);
      setLoadError(t('buy.loadErrorCardTypes'));
    } finally {
      setLoading(false);
    }
  };

  // Re-run whichever loader matches the current step (used by the retry button).
  const retryCurrentStep = () => {
    if (step === 'country') loadCountries();
    else if (step === 'brand' && selectedCountry) loadBrandsForCountry(selectedCountry.iso_code);
    else if (step === 'cardType' && selectedBrand && selectedCountry)
      loadCardTypes(selectedBrand.id, selectedCountry.iso_code);
  };

  const handleCountrySelect = (country: GiftCardCountry) => {
    setSelectedCountry(country);
    setStep('brand');
    loadBrandsForCountry(country.iso_code);
  };

  const handleBrandSelect = (brand: GiftCardBrand) => {
    setSelectedBrand(brand);
    setStep('cardType');
    if (selectedCountry) {
      loadCardTypes(brand.id, selectedCountry.iso_code);
    }
  };

  const handleCardTypeSelect = (cardType: CardType) => {
    setSelectedCardType(cardType);
    setAmount(cardType.min_amount);
    setStep('amount');
  };

  const orderTotal = parseFloat(amount || '0') * quantity;
  const discountAmount = discountInfo ? parseFloat(discountInfo.discount_amount || '0') : 0;
  const discountedTotal = Math.max(orderTotal - discountAmount, 0);

  const applyDiscount = async () => {
    const code = discountCode.trim();
    setDiscountError(null);
    if (!code) { setDiscountInfo(null); return; }
    if (!orderTotal || orderTotal <= 0) {
      setDiscountError(t('buy.discountEnterAmount'));
      return;
    }
    setValidatingDiscount(true);
    try {
      const res = await discountsAPI.validate(code, orderTotal);
      setDiscountInfo(res.data);
    } catch (err: any) {
      setDiscountInfo(null);
      setDiscountError(err.response?.data?.error || t('buy.discountInvalid'));
    } finally {
      setValidatingDiscount(false);
    }
  };

  const clearDiscount = () => {
    setDiscountCode('');
    setDiscountInfo(null);
    setDiscountError(null);
  };

  const handleSubmitOrder = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/buy');
      return;
    }

    if (!selectedBrand || !selectedCountry || !selectedCardType || !amount) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const requestData = {
        brand_id: selectedBrand.id,
        brand_name: selectedBrand.name,
        country_code: selectedCountry.iso_code,
        country_name: selectedCountry.name,
        card_type: selectedCardType.card_type,
        card_type_id: selectedCardType.id,
        amount: parseFloat(amount),
        quantity: quantity,
        currency: selectedCountry.currency_code,
        ...(discountInfo && discountCode.trim() ? { discount_code: discountCode.trim() } : {}),
      };

      const response = await ordersAPI.createPurchaseRequest(requestData);
      const newId = response.data?.id;

      // No admin pre-approval: take the customer straight to payment.
      try {
        const pay = await ordersAPI.initiatePayment(newId);
        if (pay.data?.payment_url) {
          window.location.href = pay.data.payment_url;   // off to the gateway
          return;
        }
        // Dev bypass (no real gateway) → show the confirmation screen.
      } catch (payErr) {
        console.error('Payment init failed, showing order confirmation:', payErr);
        // Fall through: they can retry via "Pay Now" on their orders page.
      }

      setPurchaseRequest(response.data);
      setStep('confirm');
    } catch (error: any) {
      console.error('Failed to submit order:', error);
      setSubmitError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          t('buy.submitError')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => {
    switch (step) {
      case 'brand':
        setStep('country');
        setSelectedCountry(null);
        break;
      case 'cardType':
        setStep('brand');
        setSelectedBrand(null);
        break;
      case 'amount':
        setStep('cardType');
        setSelectedCardType(null);
        break;
      case 'confirm':
        setStep('amount');
        break;
      default:
        router.back();
    }
  };

  const steps = [
    { key: 'country', label: 'Country' },
    { key: 'brand', label: 'Brand' },
    { key: 'cardType', label: 'Type' },
    { key: 'amount', label: 'Amount' },
    { key: 'confirm', label: 'Done' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0b]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0a0a0b]/95 backdrop-blur-sm border-b border-gray-100 dark:border-neutral-800">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            {step !== 'country' && step !== 'confirm' ? (
              <button onClick={goBack} aria-label={t('buy.tryAgain')} className="p-2 -ms-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">
                <ArrowLeft size={20} className="text-gray-600 dark:text-neutral-300 rtl:rotate-180" />
              </button>
            ) : (
              <div className="w-9" />
            )}

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="text-white" size={16} />
              </div>
              <span className="font-black text-lg tracking-tight">{t('buy.title')}</span>
            </div>

            <div className="w-9" />
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-1">
            {steps.map((s, i) => (
              <React.Fragment key={s.key}>
                <div className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                  i <= currentStepIndex ? 'bg-blue-600' : 'bg-gray-200 dark:bg-neutral-700'
                }`} />
              </React.Fragment>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 dark:text-neutral-400 font-medium">{t('buy.loading')}</p>
          </div>
        ) : loadError ? (
          <div role="alert" className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-red-600 font-bold mb-4">{loadError}</p>
            <button
              onClick={retryCurrentStep}
              className="px-6 py-3 bg-black text-white rounded-full font-bold uppercase text-xs tracking-widest hover:bg-blue-600 transition-all"
            >
              {t('buy.tryAgain')}
            </button>
          </div>
        ) : (
          <>
            {/* STEP 1: Country Selection */}
            {step === 'country' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-black text-gray-900 dark:text-neutral-100 mb-2">{t('buy.selectCountryTitle')}</h1>
                  <p className="text-gray-500 dark:text-neutral-400 text-sm">{t('buy.selectCountrySubtitle')}</p>
                </div>

                <SearchablePicker
                  items={countries}
                  layout="grid"
                  accent="blue"
                  noun="countries"
                  placeholder={t('buy.searchCountries')}
                  pageSize={12}
                  getKey={(c) => c.iso_code}
                  matchesSearch={(c, q) =>
                    c.name.toLowerCase().includes(q) || c.iso_code.toLowerCase().includes(q)
                  }
                  getSortValue={(c) => c.name}
                  onSelect={handleCountrySelect}
                  emptyIcon={<Globe className="w-12 h-12 text-gray-300 dark:text-neutral-600 mx-auto" />}
                  renderItem={(country) => (
                    <div className="group h-full flex flex-col items-center gap-2.5 p-4 bg-gray-50 dark:bg-neutral-900 border border-transparent hover:border-blue-300 dark:hover:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-2xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                      <div className="w-16 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-sm ring-1 ring-black/5">
                        <CountryFlag url={country.flag_url} />
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-neutral-100 text-sm text-center line-clamp-1 leading-tight">{country.name}</h3>
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-neutral-400 bg-white dark:bg-neutral-800 px-2 py-0.5 rounded-full ring-1 ring-black/5">{country.currency_code}</span>
                    </div>
                  )}
                />
              </div>
            )}

            {/* STEP 2: Brand Selection */}
            {step === 'brand' && selectedCountry && (
              <div className="space-y-6">
                {/* Selection Summary */}
                <div className="bg-blue-50 dark:bg-blue-950/40 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <MapPin className="text-white" size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 dark:text-blue-300 font-bold uppercase tracking-wider">{t('buy.selected')}</p>
                    <p className="font-bold text-gray-900 dark:text-neutral-100">{selectedCountry.name}</p>
                  </div>
                </div>

                <div className="text-center">
                  <h1 className="text-2xl font-black text-gray-900 dark:text-neutral-100 mb-2">{t('buy.selectBrandTitle')}</h1>
                  <p className="text-gray-500 dark:text-neutral-400 text-sm">{t('buy.selectBrandSubtitle')}</p>
                </div>

                <SearchablePicker
                  items={brands}
                  layout="grid"
                  accent="blue"
                  noun="brands"
                  placeholder={t('buy.searchBrands')}
                  pageSize={12}
                  getKey={(b) => b.id}
                  matchesSearch={(b, q) => b.name.toLowerCase().includes(q)}
                  getSortValue={(b) => b.name}
                  onSelect={handleBrandSelect}
                  emptyIcon={<Package className="w-12 h-12 text-gray-300 dark:text-neutral-600 mx-auto" />}
                  renderItem={(brand) => (
                    <div className="h-full flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-neutral-900 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-2xl transition-all duration-200">
                      <div className="mb-3">
                        <BrandLogo url={brand.image} name={brand.name} size={56} />
                      </div>
                      <span className="font-bold text-gray-900 dark:text-neutral-100 text-sm text-center line-clamp-2">{brand.name}</span>
                    </div>
                  )}
                />
              </div>
            )}

            {/* STEP 3: Card Type Selection */}
            {step === 'cardType' && selectedBrand && selectedCountry && (
              <div className="space-y-6">
                {/* Selection Summary */}
                <div className="bg-blue-50 dark:bg-blue-950/40 rounded-2xl p-4 flex items-center gap-3">
                  <BrandLogo url={selectedBrand.image} name={selectedBrand.name} size={40} />
                  <div>
                    <p className="text-xs text-blue-600 dark:text-blue-300 font-bold uppercase tracking-wider">{t('buy.selected')}</p>
                    <p className="font-bold text-gray-900 dark:text-neutral-100">{selectedBrand.name}</p>
                  </div>
                </div>

                <div className="text-center">
                  <h1 className="text-2xl font-black text-gray-900 dark:text-neutral-100 mb-2">{t('buy.selectCardTypeTitle')}</h1>
                  <p className="text-gray-500 dark:text-neutral-400 text-sm">{t('buy.selectCardTypeSubtitle')}</p>
                </div>

                {/* Card Types */}
                <div className="space-y-3">
                  {cardTypes.map((cardType) => (
                    <button
                      key={cardType.id}
                      onClick={() => handleCardTypeSelect(cardType)}
                      className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-neutral-900 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-2xl transition-all duration-200 group"
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        cardType.card_type === 'E-CODE' ? 'bg-green-100 dark:bg-green-950/40' : 'bg-purple-100 dark:bg-purple-950/40'
                      }`}>
                        {cardType.card_type === 'E-CODE' ? (
                          <Zap className="text-green-600" size={22} />
                        ) : (
                          <CreditCard className="text-purple-600" size={22} />
                        )}
                      </div>
                      <div className="flex-1 text-start">
                        <h3 className="font-bold text-gray-900 dark:text-neutral-100">
                          {cardType.card_type === 'E-CODE' ? t('buy.digitalECode') : t('buy.physicalCard')}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-neutral-400">
                          {formatMoney(cardType.min_amount, selectedCountry?.currency_code)} - {cardType.max_amount ? formatMoney(cardType.max_amount, selectedCountry?.currency_code) : t('buy.unlimited')}
                        </p>
                      </div>
                      <ChevronRight className="text-gray-300 dark:text-neutral-600 group-hover:text-blue-600 transition-colors rtl:rotate-180" size={20} />
                    </button>
                  ))}
                </div>

                {cardTypes.length === 0 && (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
                    <p className="text-gray-400 dark:text-neutral-500 font-medium">{t('buy.noCardTypes')}</p>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: Amount & Quantity */}
            {step === 'amount' && selectedCardType && selectedBrand && selectedCountry && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-black text-gray-900 dark:text-neutral-100 mb-2">{t('buy.enterAmountTitle')}</h1>
                  <p className="text-gray-500 dark:text-neutral-400 text-sm">{t('buy.enterAmountSubtitle')}</p>
                </div>

                {/* Card Summary */}
                <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-4 flex items-center gap-4">
                  <BrandLogo url={selectedBrand.image} name={selectedBrand.name} size={56} />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-neutral-100">{selectedBrand.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                        selectedCardType.card_type === 'E-CODE'
                          ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300'
                          : 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                      }`}>
                        {selectedCardType.card_type === 'E-CODE' ? <Zap size={10} /> : <CreditCard size={10} />}
                        {selectedCardType.card_type === 'E-CODE' ? t('buy.digital') : t('buy.physical')}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-neutral-400">{selectedCountry.name}</span>
                    </div>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600 dark:text-neutral-300">{t('buy.amountLabel')} ({selectedCountry.currency_code})</label>
                  <div className="relative">
                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 text-lg font-black pointer-events-none">{currencySymbol(selectedCountry.currency_code).trim()}</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min={selectedCardType.min_amount}
                      max={selectedCardType.max_amount || undefined}
                      className="w-full bg-gray-50 dark:bg-neutral-800 dark:text-neutral-100 border-0 rounded-2xl py-4 ps-12 pe-4 text-2xl font-black outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">
                    {t('buy.min')} {formatMoney(selectedCardType.min_amount, selectedCountry.currency_code)}
                    {selectedCardType.max_amount && ` • ${t('buy.max')} ${formatMoney(selectedCardType.max_amount, selectedCountry.currency_code)}`}
                  </p>
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600 dark:text-neutral-300">{t('buy.quantity')}</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-14 h-14 bg-gray-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center font-black text-xl hover:bg-gray-200 dark:hover:bg-neutral-700 active:scale-95 transition-all"
                    >
                      -
                    </button>
                    <span className="text-3xl font-black w-16 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-14 h-14 bg-gray-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center font-black text-xl hover:bg-gray-200 dark:hover:bg-neutral-700 active:scale-95 transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Discount code */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600 dark:text-neutral-300">{t('buy.discountLabel')}</label>
                  {discountInfo ? (
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/40 border-2 border-green-200 dark:border-green-900 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Check size={18} className="text-green-600 shrink-0" />
                        <span className="font-black text-green-700 dark:text-green-300 tracking-wider truncate">{discountInfo.code}</span>
                        <span className="text-xs font-bold text-green-600 dark:text-green-400">
                          −{formatMoney(discountAmount, selectedCountry.currency_code)}
                        </span>
                      </div>
                      <button onClick={clearDiscount} className="text-green-700 dark:text-green-300 hover:text-red-600 shrink-0">
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyDiscount(); } }}
                        placeholder={t('buy.discountPlaceholder')}
                        className="flex-1 bg-gray-50 dark:bg-neutral-800 dark:text-neutral-100 border-0 rounded-2xl py-3 px-4 font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <button
                        onClick={applyDiscount}
                        disabled={validatingDiscount || !discountCode.trim()}
                        className="px-5 rounded-2xl bg-gray-900 dark:bg-neutral-700 text-white font-black uppercase text-xs tracking-widest disabled:opacity-50 hover:bg-black transition-all"
                      >
                        {validatingDiscount ? '...' : t('buy.discountApply')}
                      </button>
                    </div>
                  )}
                  {discountError && <p className="text-xs text-red-600 dark:text-red-400 font-bold">{discountError}</p>}
                </div>

                {/* Total */}
                <div className="bg-blue-600 rounded-2xl p-5 text-white">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-blue-100 text-sm">{t('buy.total')} ({selectedCountry.currency_code})</span>
                    <span className="text-xl font-black">
                      {discountInfo ? (
                        <span className="flex items-center gap-2">
                          <span className="text-blue-200 text-sm line-through font-bold">{formatMoney(orderTotal, selectedCountry.currency_code)}</span>
                          {formatMoney(discountedTotal, selectedCountry.currency_code)}
                        </span>
                      ) : (
                        formatMoney(orderTotal, selectedCountry.currency_code)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-blue-500">
                    <span className="text-blue-100 text-sm">{t('buy.total')} (تومان)</span>
                    <span className="text-lg font-black">
                      {formatIRR(discountedTotal)}
                    </span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-6 py-4">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-neutral-400">
                    <Shield size={16} />
                    <span className="text-xs font-medium">{t('buy.secure')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-neutral-400">
                    <Clock size={16} />
                    <span className="text-xs font-medium">{t('buy.fastDelivery')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Confirmation */}
            {step === 'confirm' && (
              <div className="space-y-6">
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-950/40 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="text-green-600" size={40} />
                  </div>
                  <h1 className="text-2xl font-black text-gray-900 dark:text-neutral-100 mb-2">{t('buy.orderSubmittedTitle')}</h1>
                  <p className="text-gray-500 dark:text-neutral-400 text-sm">{t('buy.orderSubmittedSubtitle')}</p>
                  {purchaseRequest && (
                    <div className="mt-3 inline-flex items-center gap-2 bg-gray-100 dark:bg-neutral-800 px-4 py-2 rounded-full">
                      <span className="text-xs text-gray-500 dark:text-neutral-400">{t('buy.requestNumber')}</span>
                      <span className="font-mono font-bold text-gray-900 dark:text-neutral-100">{purchaseRequest.request_number}</span>
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                {purchaseRequest && (
                  <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-5 space-y-4">
                    <h3 className="font-bold text-gray-900 dark:text-neutral-100">{t('buy.orderSummary')}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-neutral-400">{t('buy.brand')}</span>
                        <span className="font-bold text-gray-900 dark:text-neutral-100">{purchaseRequest.brand_name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-neutral-400">{t('buy.cardType')}</span>
                        <span className="font-bold text-gray-900 dark:text-neutral-100">{purchaseRequest.card_type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-neutral-400">{t('buy.quantity')}</span>
                        <span className="font-bold text-gray-900 dark:text-neutral-100">{purchaseRequest.quantity}</span>
                      </div>
                      <div className="border-t border-gray-200 dark:border-neutral-700 pt-3">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-500 dark:text-neutral-400">{t('buy.total')} ({purchaseRequest.currency || selectedCountry?.currency_code || 'USD'})</span>
                          <span className="font-bold text-gray-900 dark:text-neutral-100">{formatMoney(purchaseRequest.total_amount, purchaseRequest.currency || selectedCountry?.currency_code)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-neutral-400">{t('buy.total')} (تومان)</span>
                          <span className="font-bold text-blue-600">{purchaseRequest.total_amount_irr_formatted || formatIRR(purchaseRequest.total_amount)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-900 rounded-xl p-4">
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        <strong>{t('buy.statusLabel')}</strong> {t('buy.statusPending')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Link
                    href="/dashboard/orders"
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-colors"
                  >
                    {t('buy.viewMyOrders')}
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/marketplace"
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 py-4 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                  >
                    {t('buy.continueShopping')}
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Fixed Bottom CTA */}
      {step === 'amount' && !loading && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0a0a0b] border-t border-gray-100 dark:border-neutral-800 p-4">
          <div className="max-w-lg mx-auto">
            {submitError && (
              <p role="alert" className="mb-3 text-sm font-bold text-red-600 text-center">
                {submitError}
              </p>
            )}
            <button
              onClick={handleSubmitOrder}
              disabled={submitting || !amount || parseFloat(amount) < parseFloat(selectedCardType?.min_amount || '0')}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('buy.processing')}
                </>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  {t('buy.submitOrderRequest')}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
