"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, Minus, CreditCard, Loader2 } from "lucide-react";
import { productsAPI, ordersAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

interface Product {
  id: number;
  name_en: string;
  price_usd: string;
  price_iqd: string;
  thumbnail_url?: string;
  product_type: string;
  available_codes: number;
  denominations?: Array<{
    id: number;
    value: string;
    currency: string;
  }>;
}

export default function ProductPurchasePage() {
  const router = useRouter();
  const params = useParams();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const { t } = useI18n();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDenomination, setSelectedDenomination] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      router.push(`/login?redirect=/buy/product/${params.productId}`);
      return;
    }
    loadProduct();
  }, [params.productId, isInitialized, isAuthenticated]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productId = parseInt(params.productId as string);
      const [productRes, denominationsRes] = await Promise.all([
        productsAPI.get(productId.toString()),
        productsAPI.getDenominations(productId).catch(() => ({ data: [] })),
      ]);
      
      const productData = productRes.data;
      productData.denominations = denominationsRes.data || [];
      setProduct(productData);
      
      // Auto-select first denomination if available
      if (productData.denominations.length > 0) {
        setSelectedDenomination(productData.denominations[0].id);
      }
    } catch (error: any) {
      console.error('Failed to load product:', error);
      setError(error.response?.data?.error || t('buyProduct.errorLoadProduct'));
    } finally {
      setLoading(false);
    }
  };

  const getUnitPrice = (): number => {
    if (selectedDenomination && product?.denominations) {
      const denom = product.denominations.find(d => d.id === selectedDenomination);
      if (denom) return parseFloat(denom.value);
    }
    return product ? parseFloat(product.price_usd) : 0;
  };

  const getTotalPrice = (): number => {
    return getUnitPrice() * quantity;
  };

  const handlePurchase = async () => {
    if (!product || !isAuthenticated) return;
    
    if (product.product_type === 'instant' && product.available_codes < quantity) {
      setError(t('buyProduct.errorNotEnoughCodes'));
      return;
    }

    try {
      setPurchasing(true);
      setError('');
      
      const orderData: any = {
        product_id: product.id,
        quantity: quantity,
        currency: 'USD',
      };
      
      if (selectedDenomination) {
        orderData.denomination_id = selectedDenomination;
      }
      
      const response = await ordersAPI.directPurchase(orderData);
      
      // Redirect to payment page or order confirmation
      router.push(`/orders/${response.data.id}/payment`);
    } catch (error: any) {
      console.error('Purchase failed:', error);
      setError(error.response?.data?.error || t('buyProduct.errorPurchaseFailed'));
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-400 dark:text-neutral-500 font-bold uppercase tracking-widest">{t('buyProduct.loadingProduct')}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 dark:text-neutral-500 font-bold uppercase">{t('buyProduct.productNotFound')}</p>
          <Link href="/buy" className="mt-4 text-blue-600 hover:underline">{t('buyProduct.backToCountries')}</Link>
        </div>
      </div>
    );
  }

  const unitPrice = getUnitPrice();
  const totalPrice = getTotalPrice();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0b] text-[#0A0A0A] dark:text-neutral-100 font-sans antialiased">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <Link href="/buy" className="inline-flex items-center gap-2 text-gray-600 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-neutral-100 mb-8">
          <ArrowLeft size={20} />
          <span className="text-sm font-bold">{t('buyProduct.backToCountries')}</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* PRODUCT INFO */}
          <div>
            {product.thumbnail_url && (
              <img
                src={product.thumbnail_url}
                alt={product.name_en}
                className="w-full rounded-3xl mb-6 border-2 border-gray-100 dark:border-neutral-800"
              />
            )}
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-4">{product.name_en}</h1>
            <p className="text-sm text-gray-600 dark:text-neutral-300">
              {product.product_type === 'instant' ? t('buyProduct.instantDelivery') : t('buyProduct.manualProcessing')}
            </p>
            {product.product_type === 'instant' && (
              <p className="text-xs text-gray-400 dark:text-neutral-500 mt-2">
                {product.available_codes} {t('buyProduct.codesAvailable')}
              </p>
            )}
          </div>

          {/* PURCHASE FORM */}
          <div className="bg-gray-50 dark:bg-neutral-900 rounded-3xl p-8 border-2 border-gray-200 dark:border-neutral-700">
            <h2 className="text-2xl font-black mb-6">{t('buyProduct.purchaseDetails')}</h2>

            {/* DENOMINATION SELECTION */}
            {product.denominations && product.denominations.length > 0 && (
              <div className="mb-6">
                <label className="text-xs font-black uppercase text-gray-600 dark:text-neutral-300 mb-3 block">
                  {t('buyProduct.selectUnitValue')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {product.denominations.map((denom) => (
                    <button
                      key={denom.id}
                      onClick={() => setSelectedDenomination(denom.id)}
                      className={`p-4 rounded-2xl border-2 transition-all text-left ${
                        selectedDenomination === denom.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40'
                          : 'border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-gray-300 dark:hover:border-neutral-600'
                      }`}
                    >
                      <p className="text-lg font-black">
                        ${denom.value} {denom.currency}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QUANTITY SELECTOR */}
            <div className="mb-6">
              <label className="text-xs font-black uppercase text-gray-600 dark:text-neutral-300 mb-3 block">
                {t('buyProduct.quantity')}
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setQuantity(Math.max(1, quantity - 1));
                  }}
                  disabled={quantity <= 1}
                  className="w-12 h-12 rounded-xl bg-white dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Minus size={20} />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    const max = product.product_type === 'instant' && product.available_codes 
                      ? product.available_codes 
                      : 100;
                    setQuantity(Math.max(1, Math.min(max, val)));
                  }}
                  min={1}
                  max={product.product_type === 'instant' && product.available_codes 
                    ? product.available_codes 
                    : 100}
                  className="w-20 text-center text-2xl font-black border-2 border-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 rounded-xl py-2"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    const max = product.product_type === 'instant' && product.available_codes 
                      ? product.available_codes 
                      : 100;
                    setQuantity(Math.min(max, quantity + 1));
                  }}
                  disabled={product.product_type === 'instant' && product.available_codes 
                    ? quantity >= product.available_codes 
                    : quantity >= 100}
                  className="w-12 h-12 rounded-xl bg-white dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* PRICE SUMMARY */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 mb-6 border-2 border-gray-200 dark:border-neutral-700">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600 dark:text-neutral-300">{t('buyProduct.unitPrice')}</span>
                <span className="text-lg font-black">${unitPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600 dark:text-neutral-300">{t('buyProduct.quantityLabel')}</span>
                <span className="text-lg font-black">{quantity}</span>
              </div>
              <div className="pt-4 border-t-2 border-gray-200 dark:border-neutral-700 flex justify-between items-center">
                <span className="text-lg font-black uppercase">{t('buyProduct.total')}</span>
                <span className="text-3xl font-black">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-900 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* PURCHASE BUTTON */}
            <button
              onClick={handlePurchase}
              disabled={purchasing || (product.product_type === 'instant' && product.available_codes < quantity)}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {purchasing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {t('buyProduct.processing')}
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  {t('buyProduct.proceedToPayment')}
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

