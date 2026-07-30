"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  Gift,
  ArrowRight,
  Copy,
  CheckCircle2,
  ArrowUpRight,
  Upload,
  Clock
} from "lucide-react";
import { useAuthStore } from '@/store/authStore';
import { userAPI, referralsAPI } from '@/lib/api';
import Link from 'next/link';
import { formatIRRShort } from '@/lib/currency';
import { useI18n } from '@/lib/i18n';

interface Transaction {
  id: string | number;
  type: 'purchase' | 'submission' | 'withdrawal';
  amount: string;
  status: string;
  created_at: string;
  description: string;
}

export default function DashboardPage() {
  const { t } = useI18n();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallet, setWallet] = useState<{ balance: string; pending_balance: string; total_earned: string } | null>(null);
  const [referralStats, setReferralStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/dashboard');
      return;
    }
    loadData();
  }, [isInitialized, isAuthenticated, router]);

  const loadData = async () => {
    try {
      const [walletRes, referralsRes, purchasesRes, submissionsRes, withdrawalsRes] = await Promise.all([
        userAPI.getWallet(),
        referralsAPI.getStats(),
        userAPI.getPurchaseRequests().catch(() => ({ data: [] })),
        userAPI.getSubmissions().catch(() => ({ data: [] })),
        userAPI.getWithdrawals().catch(() => ({ data: [] })),
      ]);
      
      setWallet(walletRes.data);
      setReferralStats(referralsRes.data);
      
      // Combine all transactions
      const allTransactions: Transaction[] = [];
      
      // Add purchase requests
      (purchasesRes.data.results || purchasesRes.data || []).forEach((p: any) => {
        allTransactions.push({
          id: p.request_number || p.id,
          type: 'purchase',
          amount: p.total_amount_irr || '0',
          status: p.status,
          created_at: p.created_at,
          description: `${p.brand_name || 'Gift Card'} - ${p.quantity || 1}x $${p.amount || '0'}`
        });
      });
      
      // Add submissions
      (submissionsRes.data.results || submissionsRes.data || []).forEach((s: any) => {
        allTransactions.push({
          id: s.id,
          type: 'submission',
          amount: s.credit_amount || '0',
          status: s.status,
          created_at: s.created_at,
          description: `${s.brand_name || 'Gift Card'} Gift Card`
        });
      });
      
      // Add withdrawals
      (withdrawalsRes.data.results || withdrawalsRes.data || []).forEach((w: any) => {
        allTransactions.push({
          id: w.id,
          type: 'withdrawal',
          amount: w.amount,
          status: w.status,
          created_at: w.created_at,
          description: `Withdrawal to ${w.bank_name || 'Bank'}`
        });
      });
      
      // Sort by date
      allTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setTransactions(allTransactions.slice(0, 10));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const referralLink = typeof window !== 'undefined' && user?.referral_code
    ? `${window.location.origin}/register?ref=${user.referral_code}`
    : '';

  const copyReferralCode = async () => {
    if (user?.referral_code) {
      // Share the full invite link so the referral is captured on sign-up.
      await navigator.clipboard.writeText(referralLink || user.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'bg-green-400';
      case 'pending':
        return 'bg-orange-400';
      case 'rejected':
      case 'failed':
        return 'bg-red-400';
      default:
        return 'bg-blue-400';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return ShoppingBag;
      case 'submission':
        return Upload;
      case 'withdrawal':
        return ArrowUpRight;
      default:
        return Clock;
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
          <p className="text-gray-400 dark:text-neutral-500 font-bold uppercase tracking-widest">{t('dashHome.loading')}</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: t('dashHome.balance'),
      value: `${formatIRRShort(wallet?.balance || '0')} تومان`,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      label: t('dashHome.pending'),
      value: `${formatIRRShort(wallet?.pending_balance || '0')} تومان`,
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50"
    },
    {
      label: t('dashHome.totalEarned'),
      value: `${formatIRRShort(wallet?.total_earned || '0')} تومان`,
      icon: CheckCircle2,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* HEADER */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-1 w-4 bg-blue-600"></div>
          <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.4em]">{t('dashHome.eyebrow')}</p>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-neutral-100 tracking-tighter italic uppercase leading-none">
          {t('dashHome.welcome')}<span className="text-gray-200">,</span> {user?.first_name || 'User'}
        </h1>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-neutral-900 border-2 border-black dark:border-neutral-700 p-6 rounded-[32px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-none">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} p-3 rounded-2xl`}>
                <stat.icon className={`${stat.color} w-6 h-6`} />
              </div>
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-2">{stat.label}</p>
            <p className="text-3xl font-black tracking-tighter leading-none">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="bg-white dark:bg-neutral-900 border-4 border-black dark:border-neutral-700 rounded-[32px] overflow-hidden shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:shadow-none">
        <div className="p-6 md:p-8 border-b-4 border-black dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 flex justify-between items-center">
          <h2 className="font-black uppercase italic text-lg md:text-2xl">{t('dashHome.recentTransactions')}</h2>
          <Link href="/dashboard/orders" className="text-blue-600 hover:text-blue-700 font-black uppercase text-xs tracking-widest flex items-center gap-2">
            {t('dashHome.viewAll')} <ArrowRight size={14} />
          </Link>
        </div>
        <div className="divide-y-2 divide-black dark:divide-neutral-700">
          {transactions.map((tx) => {
            const Icon = getTransactionIcon(tx.type);
            return (
              <div key={`${tx.type}-${tx.id}`} className="p-5 md:p-8 group transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black dark:bg-neutral-800 text-white flex items-center justify-center rounded-2xl font-black italic">
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="font-black italic text-lg md:text-xl leading-none">{tx.description}</p>
                      <p className="text-[9px] font-black text-gray-400 dark:text-neutral-500 uppercase mt-1 tracking-widest">
                        {tx.type.toUpperCase()} · {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[8px] font-black uppercase text-gray-400 dark:text-neutral-500 mb-1">{t('dashHome.amount')}</p>
                      <p className={`font-black text-xl md:text-2xl italic ${tx.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'}`}>
                        {tx.type === 'withdrawal' ? '-' : '+'}{formatIRRShort(tx.amount)} تومان
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border-2 border-black dark:border-neutral-700 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-none ${getStatusColor(tx.status)}`}>
                      {tx.status?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {transactions.length === 0 && (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 dark:text-neutral-600 mx-auto mb-4" />
              <p className="text-gray-400 dark:text-neutral-500 font-black uppercase tracking-widest">{t('dashHome.noTransactions')}</p>
              <Link href="/marketplace" className="text-blue-600 hover:underline mt-2 inline-block">
                {t('dashHome.startShopping')}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* REFERRAL SECTION */}
      {referralStats && (
        <div className="bg-white dark:bg-neutral-900 border-4 border-black dark:border-neutral-700 rounded-[32px] p-6 md:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:shadow-none">
          <div className="flex items-center gap-3 mb-6">
            <Gift className="text-blue-600 w-6 h-6" />
            <h2 className="font-black uppercase italic text-xl md:text-2xl">{t('dashHome.referralProgram')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-2">{t('dashHome.yourReferralCode')}</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-50 dark:bg-neutral-800 border-2 border-black dark:border-neutral-700 p-4 rounded-2xl font-black text-lg tracking-widest">
                  {user?.referral_code || 'N/A'}
                </div>
                <button
                  onClick={copyReferralCode}
                  title={t('dashHome.copyReferralLink')}
                  className="p-4 bg-black dark:bg-neutral-800 text-white rounded-2xl hover:bg-blue-600 transition-all"
                >
                  {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                </button>
              </div>
              {referralLink && (
                <p className="mt-2 text-[10px] font-bold text-gray-400 dark:text-neutral-500 break-all">
                  {copied ? t('dashHome.linkCopied') : referralLink}
                </p>
              )}
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-2">{t('dashHome.referralStats')}</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-600 dark:text-neutral-300">{t('dashHome.totalReferrals')}</span>
                  <span className="text-2xl font-black">{referralStats.total_referrals || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-600 dark:text-neutral-300">{t('dashHome.totalEarnings')}</span>
                  <span className="text-2xl font-black text-green-600">{formatIRRShort(referralStats.total_earnings || '0')} تومان</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
