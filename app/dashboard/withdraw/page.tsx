"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatIRRShort } from '@/lib/currency';
import { walletAPI, kycAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, ShieldCheck, Banknote, Lock, ChevronRight, Plus, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useI18n } from '@/lib/i18n';

interface BankDetail {
  id: number;
  bank_name: string;
  account_name: string;
  account_number: string;
  branch?: string;
  is_active: boolean;
}

interface Wallet {
  id: number;
  balance: string;
  pending_balance: string;
  total_earned: string;
  total_withdrawn: string;
  currency: string;
}

interface Withdrawal {
  id: number;
  amount: string;
  currency: string;
  bank_name: string;
  account_number: string;
  status: string;
  created_at: string;
  processed_at?: string;
}

export default function WithdrawPage() {
  const { t } = useI18n();
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [bankDetail, setBankDetail] = useState<BankDetail | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [kycStatus, setKycStatus] = useState<string>('loading');
  
  // Bank detail form
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankForm, setBankForm] = useState({
    bank_name: "",
    account_name: "",
    account_number: "",
    branch: "",
    swift_code: "",
  });

  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/dashboard/withdraw');
      return;
    }
    fetchData();
  }, [isInitialized, isAuthenticated, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [walletRes, bankRes, withdrawalsRes, kycRes] = await Promise.all([
        walletAPI.getWallet(),
        walletAPI.getBankDetail().catch(() => ({ data: null })),
        walletAPI.getMyWithdrawals(),
        kycAPI.getStatus().catch(() => ({ data: { status: 'not_submitted' } })),
      ]);

      setWallet(walletRes.data);
      setBankDetail(bankRes.data);
      setWithdrawals(withdrawalsRes.data);
      setKycStatus(kycRes.data?.status || 'not_submitted');
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBankDetail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      const res = await walletAPI.saveBankDetail(bankForm);
      setBankDetail(res.data);
      setShowBankForm(false);
      setSuccess(t('dashWithdraw.bank_saved_success'));
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || t('dashWithdraw.bank_save_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError(t('dashWithdraw.error_invalid_amount'));
      return;
    }

    if (!bankDetail) {
      setError(t('dashWithdraw.error_add_bank_first'));
      setShowBankForm(true);
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    const balance = wallet ? parseFloat(wallet.balance) : 0;
    
    if (withdrawalAmount > balance) {
      setError(t('dashWithdraw.error_insufficient_balance'));
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await walletAPI.createWithdrawal({
        amount: withdrawalAmount,
        use_saved_bank: true,
      });
      setSuccess(t('dashWithdraw.withdrawal_success'));
      setAmount("");
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || t('dashWithdraw.withdrawal_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-950/40';
      case 'processing': return 'text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40';
      case 'completed': return 'text-green-600 dark:text-green-300 bg-green-50 dark:bg-green-950/40';
      case 'rejected': return 'text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950/40';
      default: return 'text-gray-600 dark:text-neutral-300 bg-gray-50 dark:bg-neutral-800';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 dark:text-neutral-400">{t('dashWithdraw.redirecting')}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 px-0">
      
      {/* BACK NAV */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-neutral-500 hover:text-black dark:hover:text-neutral-100 transition-colors px-4 md:px-0">
        <ArrowLeft size={12} />
        {t('dashWithdraw.back')}
      </Link>

      {/* HEADER */}
      <div className="space-y-1 px-4 md:px-0">
        <h1 className="text-3xl md:text-6xl font-black tracking-tighter uppercase italic leading-tight">
          {t('dashWithdraw.title')}<span className="text-gray-200">.</span>
        </h1>
        <p className="text-[8px] md:text-[11px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest">
          {t('dashWithdraw.subtitle')}
        </p>
      </div>

      {/* SUCCESS/ERROR MESSAGES */}
      {success && (
        <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl text-sm font-bold">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm font-bold">
          {error}
        </div>
      )}

      {/* KYC GATE */}
      {kycStatus !== 'approved' && kycStatus !== 'loading' && (
        <div className="bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-900 rounded-2xl p-4 md:p-5 flex items-start gap-3">
          <ShieldCheck size={20} className="text-yellow-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-black text-yellow-800 dark:text-yellow-200">
              {kycStatus === 'pending' ? t('dashWithdraw.kyc_pending_title') : t('dashWithdraw.kyc_required_title')}
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              {kycStatus === 'pending'
                ? t('dashWithdraw.kyc_pending_desc')
                : t('dashWithdraw.kyc_required_desc')}
            </p>
            {kycStatus !== 'pending' && (
              <Link href="/dashboard/settings" className="inline-block mt-2 text-xs font-black text-yellow-800 dark:text-yellow-200 underline">
                {t('dashWithdraw.verify_now')}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* WALLET BALANCE */}
      <div className="bg-[#0A0A0B] rounded-[24px] md:rounded-[40px] p-5 md:p-12 shadow-2xl border-y md:border border-white/5 relative overflow-hidden">
        <div className="relative z-10 space-y-6 md:space-y-10">
          
          {/* BALANCE INFO */}
          <div className="space-y-0.5">
            <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.3em]">{t('dashWithdraw.available_balance')}</p>
            <p className="text-xl md:text-3xl font-black text-white tabular-nums tracking-tighter">
              {formatIRRShort(wallet?.balance || "0")} تومان
            </p>
            <p className="text-[10px] text-gray-500 mt-2">
              {t('dashWithdraw.total_earned')} {formatIRRShort(wallet?.total_earned || "0")} تومان |
              {t('dashWithdraw.total_withdrawn')} {formatIRRShort(wallet?.total_withdrawn || "0")} تومان
            </p>
          </div>

          {/* INPUT AREA */}
          <div className="space-y-2">
            <label className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">{t('dashWithdraw.amount_label')}</label>
            <div className="relative flex items-center border-b border-white/10 focus-within:border-blue-600 transition-colors pb-2">
              <span className="text-xl md:text-4xl font-bold text-gray-600 mr-2">تومان</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="bg-transparent text-3xl md:text-7xl font-black text-white outline-none w-full tabular-nums placeholder:text-white/5"
              />
            </div>
          </div>

          {/* BANK DETAILS */}
          <div 
            className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-6 flex justify-between items-center group cursor-pointer hover:bg-white/10 transition-all"
            onClick={() => setShowBankForm(!showBankForm)}
          >
            <div className="space-y-0.5">
              <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest">{t('dashWithdraw.to_label')}</p>
              {bankDetail ? (
                <p className="text-[10px] md:text-sm font-black text-white uppercase tracking-tight">
                  {bankDetail.bank_name} • ****{bankDetail.account_number.slice(-4)}
                </p>
              ) : (
                <p className="text-[10px] md:text-sm font-black text-yellow-500 uppercase tracking-tight">
                  {t('dashWithdraw.add_bank_details')}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!bankDetail && (
                <Plus size={14} className="text-gray-600" />
              )}
              <ChevronRight size={14} className="text-gray-600" />
            </div>
          </div>

          {/* BANK DETAILS FORM */}
          {showBankForm && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black text-white uppercase tracking-wide">
                  {bankDetail ? t('dashWithdraw.update_bank_details') : t('dashWithdraw.add_bank_details')}
                </p>
                <button onClick={() => setShowBankForm(false)} className="text-gray-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>
              
              <form onSubmit={handleSaveBankDetail} className="space-y-3">
                <input
                  type="text"
                  placeholder={t('dashWithdraw.placeholder_bank_name')}
                  value={bankForm.bank_name}
                  onChange={(e) => setBankForm({...bankForm, bank_name: e.target.value})}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-gray-500 text-sm outline-none focus:border-blue-600"
                  required
                />
                <input
                  type="text"
                  placeholder={t('dashWithdraw.placeholder_account_name')}
                  value={bankForm.account_name}
                  onChange={(e) => setBankForm({...bankForm, account_name: e.target.value})}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-gray-500 text-sm outline-none focus:border-blue-600"
                  required
                />
                <input
                  type="text"
                  placeholder={t('dashWithdraw.placeholder_account_number')}
                  value={bankForm.account_number}
                  onChange={(e) => setBankForm({...bankForm, account_number: e.target.value})}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-gray-500 text-sm outline-none focus:border-blue-600"
                  required
                />
                <input
                  type="text"
                  placeholder={t('dashWithdraw.placeholder_branch')}
                  value={bankForm.branch}
                  onChange={(e) => setBankForm({...bankForm, branch: e.target.value})}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-gray-500 text-sm outline-none focus:border-blue-600"
                />
                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
                  {t('dashWithdraw.save_bank_details')}
                </button>
              </form>
            </div>
          )}

          {/* ACTION BUTTON */}
          <button
            onClick={handleWithdraw}
            disabled={submitting || !amount || !bankDetail || kycStatus !== 'approved'}
            className="w-full bg-white text-black py-4 md:py-6 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-[12px] tracking-[0.2em] md:tracking-[0.4em] hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-xl active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Lock size={14} fill="currentColor" />
            )}
            {t('dashWithdraw.confirm_withdrawal')}
          </button>
        </div>
      </div>

      {/* RECENT WITHDRAWALS */}
      <div className="px-4 md:px-0 space-y-2">
        <h3 className="text-[8px] md:text-[9px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-[0.3em]">{t('dashWithdraw.history_heading')}</h3>
        {withdrawals.length > 0 ? (
          <div className="space-y-2">
            {withdrawals.slice(0, 5).map((withdrawal) => (
              <div key={withdrawal.id} className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-xl p-3 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-black uppercase tabular-nums">
                    {formatIRRShort(withdrawal.amount)} تومان
                  </span>
                  <span className={`ml-2 text-[8px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(withdrawal.status)}`}>
                    {withdrawal.status}
                  </span>
                </div>
                <span className="text-[8px] font-bold text-gray-400 dark:text-neutral-500 uppercase">
                  {formatDate(withdrawal.created_at)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-xl p-4 text-center">
            <p className="text-[10px] text-gray-400 dark:text-neutral-500 font-bold">{t('dashWithdraw.no_history')}</p>
          </div>
        )}
      </div>

    </div>
  );
}
