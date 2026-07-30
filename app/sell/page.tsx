"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowLeft,
  Globe,
  DollarSign,
  MapPin,
  Package,
  Zap,
  CreditCard,
  CheckCircle2,
  X,
  Shield,
  Clock,
  ChevronRight,
  Camera
} from "lucide-react";
import { productsAPI, submissionsAPI, ordersAPI } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { useAuthStore } from '@/store/authStore';
import SearchablePicker from '@/components/wizard/SearchablePicker';
import CountryFlag from '@/components/wizard/CountryFlag';
import BrandLogo from '@/components/wizard/BrandLogo';

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

type Step = 'country' | 'brand' | 'cardType' | 'amount' | 'details' | 'confirm';

export default function SellPage() {
  const router = useRouter();
  const { t } = useI18n();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  // State
  const [step, setStep] = useState<Step>('country');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
  
  // Card details
  const [cardCode, setCardCode] = useState('');
  const [cardPin, setCardPin] = useState('');
  const [cardImage, setCardImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  
  // Credit calculation
  const [creditInfo, setCreditInfo] = useState<{ credit_amount: string; sell_rate: string } | null>(null);
  
  // Error/Success
  const [error, setError] = useState('');
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/sell');
      return;
    }
    loadCountries();
    loadExchangeRate();
  }, [isInitialized, isAuthenticated]);

  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      calculateCredit();
    } else {
      setCreditInfo(null);
    }
  }, [amount]);

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
    try {
      const response = await productsAPI.getGCCountries();
      setCountries(response.data || []);
    } catch (error) {
      console.error('Failed to load countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBrandsForCountry = async (countryCode: string) => {
    setLoading(true);
    try {
      // Only show brands sold in the chosen country (BUG B fix).
      const response = await productsAPI.getBrands(countryCode);
      const allBrands = response.data?.results || response.data || [];
      setBrands(allBrands);
    } catch (error) {
      console.error('Failed to load brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCardTypes = async (brandId: string, countryCode: string) => {
    setLoading(true);
    try {
      const response = await productsAPI.getCardTypes(brandId, countryCode);
      const results = response.data.results || response.data || [];
      setCardTypes(results);
    } catch (error) {
      console.error('Failed to load card types:', error);
      setCardTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateCredit = async () => {
    try {
      const response = await submissionsAPI.calculateCredit(parseFloat(amount));
      setCreditInfo(response.data);
    } catch (error) {
      console.error('Failed to calculate credit:', error);
    }
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCardImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedBrand || !selectedCountry || !selectedCardType || !amount) {
      setError(t('sell.errRequiredFields'));
      return;
    }

    if (selectedCardType.card_type === 'E-CODE' && !cardCode.trim()) {
      setError(t('sell.errEnterEcode'));
      return;
    }

    if (selectedCardType.card_type === 'PHYSICAL' && !cardImage) {
      setError(t('sell.errUploadImage'));
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('submission_type', selectedCardType.card_type === 'E-CODE' ? 'ecode' : 'physical');
      formData.append('brand_id', selectedBrand.id);
      formData.append('brand_name', selectedBrand.name);
      formData.append('country_code', selectedCountry.iso_code);
      formData.append('country_name', selectedCountry.name);
      formData.append('card_type', selectedCardType.card_type);
      formData.append('amount', amount);
      formData.append('currency', 'USD');
      formData.append('code', cardCode);
      formData.append('pin', cardPin);
      formData.append('comment', additionalInfo);
      if (cardImage) {
        formData.append('image', cardImage);
      }

      const response = await submissionsAPI.create(formData);
      setSubmissionResult(response.data);
      setStep('confirm');
    } catch (error: any) {
      console.error('Submission failed:', error);
      setError(error.response?.data?.error || t('sell.errSubmitFailed'));
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
      case 'details':
        setStep('amount');
        break;
      case 'confirm':
        setStep('details');
        break;
      default:
        router.back();
    }
  };

  // Format IRR amount
  const formatIRR = (usdAmount: number) => {
    const irrAmount = usdAmount * exchangeRate;
    return new Intl.NumberFormat('fa-IR').format(irrAmount) + ' تومان';
  };

  const steps = [
    { key: 'country', label: t('sell.stepCountry') },
    { key: 'brand', label: t('sell.stepBrand') },
    { key: 'cardType', label: t('sell.stepType') },
    { key: 'amount', label: t('sell.stepAmount') },
    { key: 'details', label: t('sell.stepDetails') },
    { key: 'confirm', label: t('sell.stepDone') },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  if (!isInitialized || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0b]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0a0a0b]/95 backdrop-blur-sm border-b border-gray-100 dark:border-neutral-800">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            {step !== 'country' && step !== 'confirm' ? (
              <button onClick={goBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">
                <ArrowLeft size={20} className="text-gray-600 dark:text-neutral-300 rtl:rotate-180" />
              </button>
            ) : (
              <div className="w-9" />
            )}
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <DollarSign className="text-white" size={16} />
              </div>
              <span className="font-black text-lg tracking-tight">{t('sell.headerTitle')}</span>
            </div>
            
            <div className="w-9" />
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-1">
            {steps.map((s, i) => (
              <div key={s.key} className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                i <= currentStepIndex ? 'bg-green-600' : 'bg-gray-200 dark:bg-neutral-700'
              }`} />
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 dark:text-neutral-400 font-medium">{t('sell.loading')}</p>
          </div>
        ) : (
          <>
            {/* STEP 1: Country Selection */}
            {step === 'country' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-black text-gray-900 dark:text-neutral-100 mb-2">{t('sell.selectCountryTitle')}</h1>
                  <p className="text-gray-500 dark:text-neutral-400 text-sm">{t('sell.selectCountrySubtitle')}</p>
                </div>

                <SearchablePicker
                  items={countries}
                  layout="grid"
                  accent="green"
                  noun="countries"
                  placeholder={t('sell.searchCountries')}
                  pageSize={12}
                  getKey={(c) => c.iso_code}
                  matchesSearch={(c, q) =>
                    c.name.toLowerCase().includes(q) || c.iso_code.toLowerCase().includes(q)
                  }
                  getSortValue={(c) => c.name}
                  onSelect={handleCountrySelect}
                  emptyIcon={<Globe className="w-12 h-12 text-gray-300 dark:text-neutral-600 mx-auto" />}
                  renderItem={(country) => (
                    <div className="group h-full flex flex-col items-center gap-2.5 p-4 bg-gray-50 dark:bg-neutral-900 border border-transparent hover:border-green-300 dark:hover:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-2xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
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
                <div className="bg-green-50 dark:bg-green-950/40 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                    <MapPin className="text-white" size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-green-600 dark:text-green-300 font-bold uppercase tracking-wider">{t('sell.selected')}</p>
                    <p className="font-bold text-gray-900 dark:text-neutral-100">{selectedCountry.name}</p>
                  </div>
                </div>

                <div className="text-center">
                  <h1 className="text-2xl font-black text-gray-900 dark:text-neutral-100 mb-2">{t('sell.chooseBrandTitle')}</h1>
                  <p className="text-gray-500 dark:text-neutral-400 text-sm">{t('sell.chooseBrandSubtitle')}</p>
                </div>

                <SearchablePicker
                  items={brands}
                  layout="grid"
                  accent="green"
                  noun="brands"
                  placeholder={t('sell.searchBrands')}
                  pageSize={12}
                  getKey={(b) => b.id}
                  matchesSearch={(b, q) => b.name.toLowerCase().includes(q)}
                  getSortValue={(b) => b.name}
                  onSelect={handleBrandSelect}
                  emptyIcon={<Package className="w-12 h-12 text-gray-300 dark:text-neutral-600 mx-auto" />}
                  renderItem={(brand) => (
                    <div className="h-full flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-neutral-900 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-2xl transition-all duration-200">
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
                <div className="bg-green-50 dark:bg-green-950/40 rounded-2xl p-4 flex items-center gap-3">
                  <BrandLogo url={selectedBrand.image} name={selectedBrand.name} size={40} />
                  <div>
                    <p className="text-xs text-green-600 dark:text-green-300 font-bold uppercase tracking-wider">{t('sell.selected')}</p>
                    <p className="font-bold text-gray-900 dark:text-neutral-100">{selectedBrand.name}</p>
                  </div>
                </div>

                <div className="text-center">
                  <h1 className="text-2xl font-black text-gray-900 dark:text-neutral-100 mb-2">{t('sell.selectCardTypeTitle')}</h1>
                  <p className="text-gray-500 dark:text-neutral-400 text-sm">{t('sell.selectCardTypeSubtitle')}</p>
                </div>

                {/* Card Types */}
                <div className="space-y-3">
                  {cardTypes.map((cardType) => (
                    <button
                      key={cardType.id}
                      onClick={() => handleCardTypeSelect(cardType)}
                      className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-neutral-900 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-2xl transition-all duration-200 group"
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
                          {cardType.card_type === 'E-CODE' ? t('sell.digitalEcode') : t('sell.physicalCard')}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-neutral-400">
                          ${cardType.min_amount} - {cardType.max_amount ? `$${cardType.max_amount}` : t('sell.unlimited')}
                        </p>
                      </div>
                      <ChevronRight className="text-gray-300 dark:text-neutral-600 group-hover:text-green-600 transition-colors rtl:rotate-180" size={20} />
                    </button>
                  ))}
                </div>

                {cardTypes.length === 0 && (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
                    <p className="text-gray-400 dark:text-neutral-500 font-medium">{t('sell.noCardTypes')}</p>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: Amount */}
            {step === 'amount' && selectedCardType && selectedBrand && selectedCountry && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-black text-gray-900 dark:text-neutral-100 mb-2">{t('sell.enterValueTitle')}</h1>
                  <p className="text-gray-500 dark:text-neutral-400 text-sm">{t('sell.enterValueSubtitle')}</p>
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
                        {selectedCardType.card_type === 'E-CODE' ? t('sell.digital') : t('sell.physical')}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-neutral-400">{selectedCountry.name}</span>
                    </div>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600 dark:text-neutral-300">{t('sell.cardValueUsd')}</label>
                  <div className="relative">
                    <DollarSign className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 pointer-events-none" size={20} />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min={selectedCardType.min_amount}
                      max={selectedCardType.max_amount || undefined}
                      className="w-full bg-gray-50 dark:bg-neutral-800 dark:text-neutral-100 border-0 rounded-2xl py-4 ps-12 pe-4 text-2xl font-black outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">
                    {t('sell.min')}: ${selectedCardType.min_amount}
                    {selectedCardType.max_amount && ` • ${t('sell.max')}: $${selectedCardType.max_amount}`}
                  </p>
                </div>

                {/* Credit Preview */}
                {creditInfo && (
                  <div className="bg-green-600 rounded-2xl p-5 text-white">
                    <p className="text-green-100 text-sm mb-2">{t('sell.youWillReceive')}</p>
                    <p className="text-3xl font-black">
                      {formatIRR(parseFloat(amount))}
                    </p>
                    <p className="text-xs text-green-200 mt-2">
                      {t('sell.rate')}: 1 USD = {new Intl.NumberFormat().format(exchangeRate)} تومان
                    </p>
                  </div>
                )}

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-6 py-4">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-neutral-400">
                    <Shield size={16} />
                    <span className="text-xs font-medium">{t('sell.secure')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-neutral-400">
                    <Clock size={16} />
                    <span className="text-xs font-medium">{t('sell.fastReview')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Card Details */}
            {step === 'details' && selectedCardType && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-black text-gray-900 dark:text-neutral-100 mb-2">{t('sell.cardDetailsTitle')}</h1>
                  <p className="text-gray-500 dark:text-neutral-400 text-sm">{t('sell.cardDetailsSubtitle')}</p>
                </div>

                {/* E-Code Input */}
                {selectedCardType.card_type === 'E-CODE' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-600 dark:text-neutral-300">{t('sell.ecodeLabel')} *</label>
                      <input
                        type="text"
                        value={cardCode}
                        onChange={(e) => setCardCode(e.target.value)}
                        placeholder={t('sell.ecodePlaceholder')}
                        className="w-full bg-gray-50 dark:bg-neutral-800 dark:text-neutral-100 border-0 rounded-2xl py-4 px-4 font-mono outline-none focus:ring-2 focus:ring-green-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-600 dark:text-neutral-300">{t('sell.pinLabel')}</label>
                      <input
                        type="text"
                        value={cardPin}
                        onChange={(e) => setCardPin(e.target.value)}
                        placeholder={t('sell.pinPlaceholder')}
                        className="w-full bg-gray-50 dark:bg-neutral-800 dark:text-neutral-100 border-0 rounded-2xl py-4 px-4 font-mono outline-none focus:ring-2 focus:ring-green-600"
                      />
                    </div>
                  </div>
                )}

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600 dark:text-neutral-300">
                    {t('sell.cardImage')} {selectedCardType.card_type === 'PHYSICAL' && '*'}
                    {selectedCardType.card_type === 'E-CODE' && ` ${t('sell.optional')}`}
                  </label>
                  <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img src={imagePreview} alt={t('sell.previewAlt')} className="w-full max-h-64 object-contain rounded-xl" />
                        <button
                          onClick={() => {
                            setCardImage(null);
                            setImagePreview(null);
                          }}
                          className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center py-8 cursor-pointer">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-neutral-700 rounded-2xl flex items-center justify-center mb-3">
                          <Camera className="text-gray-400 dark:text-neutral-500" size={28} />
                        </div>
                        <p className="text-sm font-medium text-gray-600 dark:text-neutral-300 mb-1">{t('sell.tapToUpload')}</p>
                        <p className="text-xs text-gray-400 dark:text-neutral-500">{t('sell.uploadHint')}</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          capture="environment"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600 dark:text-neutral-300">{t('sell.additionalNotes')}</label>
                  <textarea
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    placeholder={t('sell.additionalNotesPlaceholder')}
                    rows={3}
                    className="w-full bg-gray-50 dark:bg-neutral-800 dark:text-neutral-100 border-0 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-green-600 resize-none"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/40 rounded-2xl text-red-600 text-sm font-medium">
                    {error}
                  </div>
                )}

                {/* Summary */}
                <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-4">
                  <h4 className="text-sm font-bold text-gray-600 dark:text-neutral-300 mb-3">{t('sell.summary')}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-neutral-400">{t('sell.brand')}</span>
                      <span className="font-bold text-gray-900 dark:text-neutral-100">{selectedBrand?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-neutral-400">{t('sell.cardType')}</span>
                      <span className="font-bold text-gray-900 dark:text-neutral-100">{selectedCardType?.card_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-neutral-400">{t('sell.amount')}</span>
                      <span className="font-bold text-gray-900 dark:text-neutral-100">${amount}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 dark:border-neutral-700 pt-2 mt-2">
                      <span className="text-gray-500 dark:text-neutral-400">{t('sell.youReceive')}</span>
                      <span className="font-bold text-green-600">{formatIRR(parseFloat(amount || '0'))}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: Confirmation */}
            {step === 'confirm' && (
              <div className="space-y-6">
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-950/40 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="text-green-600" size={40} />
                  </div>
                  <h1 className="text-2xl font-black text-gray-900 dark:text-neutral-100 mb-2">{t('sell.successTitle')}</h1>
                  <p className="text-gray-500 dark:text-neutral-400 text-sm">{t('sell.successSubtitle')}</p>
                  {submissionResult && (
                    <div className="mt-3 inline-flex items-center gap-2 bg-gray-100 dark:bg-neutral-800 px-4 py-2 rounded-full">
                      <span className="text-xs text-gray-500 dark:text-neutral-400">{t('sell.idLabel')}</span>
                      <span className="font-mono font-bold text-gray-900 dark:text-neutral-100">{submissionResult.id}</span>
                    </div>
                  )}
                </div>
                
                {/* Summary */}
                {submissionResult && (
                  <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-5 space-y-4">
                    <h3 className="font-bold text-gray-900 dark:text-neutral-100">{t('sell.submissionSummary')}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-neutral-400">{t('sell.brand')}</span>
                        <span className="font-bold text-gray-900 dark:text-neutral-100">{selectedBrand?.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-neutral-400">{t('sell.cardType')}</span>
                        <span className="font-bold text-gray-900 dark:text-neutral-100">{selectedCardType?.card_type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-neutral-400">{t('sell.amount')}</span>
                        <span className="font-bold text-gray-900 dark:text-neutral-100">${amount}</span>
                      </div>
                      <div className="border-t border-gray-200 dark:border-neutral-700 pt-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-neutral-400">{t('sell.expectedCredit')}</span>
                          <span className="font-bold text-green-600">{formatIRR(parseFloat(amount || '0'))}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-900 rounded-xl p-4">
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        <strong>{t('sell.statusLabel')}:</strong> {t('sell.statusPending')}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  <Link
                    href="/dashboard/submissions"
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-4 rounded-2xl font-bold hover:bg-green-700 transition-colors"
                  >
                    {t('sell.viewSubmissions')}
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/marketplace"
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 py-4 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                  >
                    {t('sell.continueShopping')}
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Fixed Bottom CTA */}
      {(step === 'amount' || step === 'details') && !loading && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0a0a0b] border-t border-gray-100 dark:border-neutral-800 p-4">
          <div className="max-w-lg mx-auto">
            {step === 'amount' && (
              <button
                onClick={() => setStep('details')}
                disabled={!amount || parseFloat(amount) < parseFloat(selectedCardType?.min_amount || '0')}
                className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('sell.continue')}
                <ArrowRight size={18} />
              </button>
            )}
            {step === 'details' && (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('sell.submitting')}
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    {t('sell.submitForReview')}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
