"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Package,
  CreditCard,
  Gift,
  Loader2,
  Eye,
  X
} from "lucide-react";
import { ordersAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatIRRShort } from '@/lib/currency';
import { useI18n } from '@/lib/i18n';

interface PurchaseRequest {
  id: string;
  request_number: string;
  brand_name: string;
  country_name: string;
  card_type: string;
  amount: string;
  quantity: number;
  total_amount_irr?: string;
  status: string;
  payment_status: string;
  created_at: string;
  assigned_codes?: string[];
  can_view_codes?: boolean;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  total_iqd?: string;
  created_at: string;
  items?: Array<{ product: { name_en: string }; quantity: number }>;
}

export default function OrdersPage() {
  const { t } = useI18n();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const [orders, setOrders] = useState<Order[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'requests'>('requests');
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isInitialized) return; // wait until the token is restored before deciding
    if (!isAuthenticated) {
      router.push('/login?redirect=/dashboard/orders');
      return;
    }
    loadData();
  }, [isInitialized, isAuthenticated, router]);

  // Show the outcome after returning from the Zarinpal gateway, then clean the URL.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search).get('payment');
    if (!p) return;
    if (p === 'success') setBanner({ type: 'success', text: t('dashOrders.paymentSuccess') });
    else if (p === 'failed') setBanner({ type: 'error', text: t('dashOrders.paymentFailed') });
    else setBanner({ type: 'error', text: t('dashOrders.paymentError') });
    window.history.replaceState({}, '', '/dashboard/orders');
  }, [t]);

  // Start the Zarinpal payment for an approved request → redirect to the gateway.
  const handlePay = async (id: string) => {
    setPayingId(id);
    setBanner(null);
    try {
      const res = await ordersAPI.initiatePayment(id);
      if (res.data?.payment_url) {
        window.location.href = res.data.payment_url;   // off to Zarinpal
        return;
      }
      if (res.data?.dev_bypass) {                       // dev only
        setBanner({ type: 'success', text: t('dashOrders.paymentSuccess') });
        loadData();
      } else {
        setBanner({ type: 'error', text: t('dashOrders.payFailed') });
      }
    } catch (err: any) {
      setBanner({ type: 'error', text: err?.response?.data?.error || t('dashOrders.payFailed') });
    } finally {
      setPayingId(null);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      // Load both orders and purchase requests
      const [ordersRes, requestsRes] = await Promise.all([
        ordersAPI.list(),
        ordersAPI.getPurchaseRequests()
      ]);
      setOrders(ordersRes.data.results || ordersRes.data || []);
      setPurchaseRequests(requestsRes.data.results || requestsRes.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return <CheckCircle2 size={12} className="text-green-600" />;
      case 'pending': return <Clock size={12} className="text-yellow-600" />;
      case 'approved': return <CheckCircle2 size={12} className="text-blue-600" />;
      case 'payment_confirmed': return <CreditCard size={12} className="text-indigo-600" />;
      case 'cancelled':
      case 'rejected': return <XCircle size={12} className="text-red-600" />;
      default: return <Clock size={12} className="text-gray-600 dark:text-neutral-300" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-300 border-green-100';
      case 'pending': return 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-300 border-yellow-100';
      case 'approved': return 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border-blue-100';
      case 'payment_confirmed': return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 border-indigo-100';
      case 'cancelled':
      case 'rejected': return 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border-red-100';
      default: return 'bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 border-gray-100 dark:border-neutral-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-300 border-green-100';
      case 'pending': return 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-300 border-yellow-100';
      case 'processing': return 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border-blue-100';
      case 'failed': return 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border-red-100';
      default: return 'bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 border-gray-100 dark:border-neutral-800';
    }
  };

  // Collapse the workflow `status` + `payment_status` into ONE clear,
  // action-oriented status so users don't see two confusing/contradictory badges.
  const GREEN = 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-300 border-green-100';
  const BLUE = 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border-blue-100';
  const AMBER = 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-300 border-yellow-100';
  const RED = 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border-red-100';
  const GRAY = 'bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 border-gray-100 dark:border-neutral-800';

  const getUnifiedStatus = (r: { status?: string; payment_status?: string }) => {
    const s = (r.status || '').toLowerCase();
    const p = (r.payment_status || '').toLowerCase();
    if (s === 'rejected') return { key: 'stRejected', color: RED, icon: <XCircle size={12} className="text-red-600" /> };
    if (s === 'cancelled') return { key: 'stCancelled', color: GRAY, icon: <XCircle size={12} className="text-gray-500 dark:text-neutral-400" /> };
    if (s === 'completed') return { key: 'stCompleted', color: GREEN, icon: <CheckCircle2 size={12} className="text-green-600" /> };
    if (p === 'paid' || s === 'payment_confirmed' || s === 'processing') return { key: 'stPaid', color: GREEN, icon: <CheckCircle2 size={12} className="text-green-600" /> };
    if (p === 'failed') return { key: 'stFailed', color: RED, icon: <XCircle size={12} className="text-red-600" /> };
    if (s === 'approved') return { key: 'stReadyToPay', color: BLUE, icon: <CreditCard size={12} className="text-blue-600" /> };
    if (s === 'pending') return { key: 'stAwaitingReview', color: AMBER, icon: <Clock size={12} className="text-yellow-600" /> };
    return { key: '', color: GRAY, icon: <Clock size={12} className="text-gray-600 dark:text-neutral-300" /> };
  };

  const UnifiedStatusBadge = ({ r }: { r: { status?: string; payment_status?: string } }) => {
    const st = getUnifiedStatus(r);
    return (
      <div className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase border inline-flex items-center gap-1.5 ${st.color}`}>
        {st.icon}
        {st.key ? t(`dashOrders.${st.key}`) : (r.status || '').replace(/_/g, ' ')}
      </div>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter((order) =>
    order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRequests = purchaseRequests.filter((request) =>
    request.request_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.brand_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse px-4 md:px-0">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-100 dark:bg-neutral-800 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700 px-4 md:px-0 pb-20">

      {/* Payment result banner (after returning from Zarinpal) */}
      {banner && (
        <div className={`flex items-center justify-between gap-3 rounded-2xl border-2 p-4 text-sm font-bold ${
          banner.type === 'success'
            ? 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900 text-green-700 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300'
        }`}>
          <span>{banner.text}</span>
          <button onClick={() => setBanner(null)} className="shrink-0 opacity-60 hover:opacity-100"><X size={16} /></button>
        </div>
      )}

      {/* HEADER */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-1 w-4 bg-blue-600"></div>
          <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.4em]">{t('dashOrders.transactionLogs')}</p>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-neutral-100 tracking-tighter italic uppercase leading-none">
          {t('dashOrders.headingOrders')}<span className="text-gray-200">/</span>{t('dashOrders.headingHistory')}
        </h1>
      </div>

      {/* TABS */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'requests'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
          }`}
        >
          {t('dashOrders.tabPurchaseRequests')} ({purchaseRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'orders'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
          }`}
        >
          {t('dashOrders.tabCartOrders')} ({orders.length})
        </button>
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-neutral-500" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('dashOrders.searchPlaceholder')}
            className="w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 py-3 pl-11 pr-4 rounded-xl text-sm dark:text-neutral-100 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* PURCHASE REQUESTS TAB */}
      {activeTab === 'requests' && (
        <>
          {filteredRequests.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 dark:text-neutral-600 mx-auto mb-4" />
              <p className="text-gray-400 dark:text-neutral-500 font-bold uppercase tracking-wide">{t('dashOrders.noPurchaseRequests')}</p>
              <p className="text-sm text-gray-400 dark:text-neutral-500 mt-2">{t('dashOrders.purchaseRequestsHint')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.some((r) => r.status === 'approved' && r.payment_status !== 'paid') && (
                <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl px-4 py-3">
                  <Clock size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-300">{t('dashOrders.payWindowNote')}</p>
                </div>
              )}
              {filteredRequests.map((request) => (
                <div key={request.id} className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 rounded-xl flex items-center justify-center shrink-0">
                        <Gift className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <p className="font-mono text-sm font-bold">{request.request_number}</p>
                        <p className="text-sm font-medium mt-1">{request.brand_name}</p>
                        <p className="text-xs text-gray-400 dark:text-neutral-500">{request.country_name} • {request.card_type}</p>
                        <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1">{formatDate(request.created_at)}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-gray-400 dark:text-neutral-500">{t('dashOrders.amount')}</p>
                        <p className="font-bold">${request.amount} × {request.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 dark:text-neutral-500">{t('dashOrders.total')}</p>
                        <p className="font-bold text-green-600">{formatIRRShort(request.total_amount_irr ?? '0')} تومان</p>
                      </div>
                      <UnifiedStatusBadge r={request} />
                      {request.status === 'approved' && request.payment_status !== 'paid' && (
                        <button
                          onClick={() => handlePay(request.id)}
                          disabled={payingId === request.id}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
                        >
                          {payingId === request.id ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                          {t('dashOrders.payNow')}
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all"
                        title={t('dashOrders.viewDetails')}
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Show codes if completed and paid */}
                  {request.can_view_codes && request.assigned_codes && request.assigned_codes.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
                      <p className="text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase mb-2">{t('dashOrders.yourECodes')}</p>
                      <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 rounded-xl p-3 space-y-1">
                        {request.assigned_codes.map((code, idx) => (
                          <code key={idx} className="block font-mono text-sm text-green-700 dark:text-green-300">{code}</code>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* CART ORDERS TAB */}
      {activeTab === 'orders' && (
        <>
          {filteredOrders.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 dark:text-neutral-600 mx-auto mb-4" />
              <p className="text-gray-400 dark:text-neutral-500 font-bold uppercase tracking-wide">{t('dashOrders.noCartOrders')}</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900">
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">{t('dashOrders.colOrderId')}</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">{t('dashOrders.colDate')}</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">{t('dashOrders.colItems')}</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">{t('dashOrders.total')}</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400 text-center">{t('dashOrders.status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm font-bold">#{order.order_number || order.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500 dark:text-neutral-400">{formatDate(order.created_at)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium">{order.items?.length || 0} {t('dashOrders.itemsLabel')}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold">{formatIRRShort(order.total_iqd || '0')} تومان</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border inline-flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* DETAIL MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedRequest(null)}
          />
          <div className="relative bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all"
            >
              <X size={16} />
            </button>

            <h2 className="text-lg font-bold text-gray-900 dark:text-neutral-100 mb-4 pr-8">{selectedRequest.request_number}</h2>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase mb-1">{t('dashOrders.brand')}</p>
                <p className="text-sm font-medium">{selectedRequest.brand_name}</p>
              </div>
              <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase mb-1">{t('dashOrders.country')}</p>
                <p className="text-sm font-medium">{selectedRequest.country_name}</p>
              </div>
              <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase mb-1">{t('dashOrders.cardType')}</p>
                <p className="text-sm font-medium">{selectedRequest.card_type}</p>
              </div>
              <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase mb-1">{t('dashOrders.amount')}</p>
                <p className="text-sm font-medium">${selectedRequest.amount} × {selectedRequest.quantity}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/40 rounded-xl p-3 col-span-2">
                <p className="text-[10px] font-bold text-green-600 uppercase mb-1">{t('dashOrders.totalIRR')}</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-300">{formatIRRShort(selectedRequest.total_amount_irr ?? '0')} تومان</p>
              </div>
              <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-3 col-span-2">
                <p className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase mb-1">{t('dashOrders.status')}</p>
                <UnifiedStatusBadge r={selectedRequest} />
              </div>
            </div>

            {selectedRequest.can_view_codes && selectedRequest.assigned_codes && selectedRequest.assigned_codes.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] font-bold text-green-600 uppercase mb-2">{t('dashOrders.yourECodes')}</p>
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 space-y-1">
                  {selectedRequest.assigned_codes.map((code, idx) => (
                    <code key={idx} className="block font-mono text-sm text-green-700">{code}</code>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-gray-400 dark:text-neutral-500">
              {t('dashOrders.created')} {formatDate(selectedRequest.created_at)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
