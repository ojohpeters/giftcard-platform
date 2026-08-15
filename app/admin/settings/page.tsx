"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  DollarSign, 
  Save, 
  AlertCircle, 
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Globe,
  Calculator,
  History,
  Zap,
  ArrowRight,
  Info,
  Gift,
  Users
} from "lucide-react";
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface RateHistory {
  rate: number;
  old_rate?: number;
  timestamp: string;
  admin: string;
  description?: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  
  // IRR Exchange Rate State
  const [irrRate, setIrrRate] = useState('');
  const [currentIrrRate, setCurrentIrrRate] = useState<number | null>(null);
  const [loadingIrr, setLoadingIrr] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [irrHistory, setIrrHistory] = useState<RateHistory[]>([]);
  const [showIrrHistory, setShowIrrHistory] = useState(false);
  const [loadingIrrHistory, setLoadingIrrHistory] = useState(false);
  const [previewIRR, setPreviewIRR] = useState<number | null>(null);

  // Referral reward state
  const [referralReward, setReferralReward] = useState('');
  const [currentReferralReward, setCurrentReferralReward] = useState<number | null>(null);
  // Steam marketplace commission
  const [commission, setCommission] = useState('');
  const [currentCommission, setCurrentCommission] = useState<number | null>(null);
  const [loadingCommission, setLoadingCommission] = useState(false);
  const [loadingReferral, setLoadingReferral] = useState(false);

  useEffect(() => {
    if (!user?.is_staff) {
      router.push('/dashboard');
      return;
    }
    // Load current IRR rate
    loadCurrentIrrRate();
    // Load rate history
    loadIrrHistory();
    // Load referral reward
    loadReferralReward();
    loadCommission();
  }, [user, router]);

  const loadCommission = async () => {
    try {
      const r = await adminAPI.getMarketplaceCommission();
      const p = r.data?.commission_percent ?? 5;
      setCurrentCommission(p); setCommission(String(p));
    } catch { setCurrentCommission(5); setCommission('5'); }
  };

  const handleUpdateCommission = async () => {
    const pct = parseFloat(commission);
    if (isNaN(pct) || pct < 0 || pct > 100) { setError('Enter a commission between 0 and 100.'); return; }
    setLoadingCommission(true); setError(''); setSuccess('');
    try {
      await adminAPI.updateMarketplaceCommission(pct);
      setCurrentCommission(pct);
      setSuccess(`Marketplace commission set to ${pct}%`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to update commission.');
    } finally { setLoadingCommission(false); }
  };

  const loadReferralReward = async () => {
    try {
      const response = await adminAPI.getReferralReward();
      const amount = response.data.amount ?? 0;
      setCurrentReferralReward(amount);
      setReferralReward(amount.toString());
    } catch (error) {
      console.error('Failed to load referral reward:', error);
      setCurrentReferralReward(0);
      setReferralReward('0');
    }
  };

  const handleUpdateReferralReward = async () => {
    const amount = parseFloat(referralReward);
    if (isNaN(amount) || amount < 0) {
      setError('Please enter a valid referral reward amount (0 or greater)');
      return;
    }
    setLoadingReferral(true);
    setError('');
    setSuccess('');
    try {
      await adminAPI.updateReferralReward(amount);
      setCurrentReferralReward(amount);
      setSuccess(
        amount > 0
          ? `Referral reward set to ${amount.toLocaleString()} تومان per successful referral`
          : 'Referral rewards disabled (set to 0)'
      );
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update referral reward. Please try again.');
    } finally {
      setLoadingReferral(false);
    }
  };

  const loadCurrentIrrRate = async () => {
    try {
      const response = await adminAPI.getCurrentIRRRate();
      const rate = response.data.rate || 42000;
      setCurrentIrrRate(rate);
      setIrrRate(rate.toString());
    } catch (error) {
      console.error('Failed to load IRR rate:', error);
      // Fallback to default
      const defaultRate = 42000;
      setCurrentIrrRate(defaultRate);
      setIrrRate(defaultRate.toString());
    }
  };

  const loadIrrHistory = async () => {
    setLoadingIrrHistory(true);
    try {
      const response = await adminAPI.getIRRRateHistory();
      const history = response.data.map((entry: any) => ({
        rate: entry.rate,
        old_rate: entry.old_rate,
        timestamp: entry.timestamp,
        admin: entry.admin,
        description: entry.description
      }));
      setIrrHistory(history);
    } catch (error) {
      console.error('Failed to load IRR rate history:', error);
      setIrrHistory([]);
    } finally {
      setLoadingIrrHistory(false);
    }
  };

  // IRR Rate Handlers
  const handleUpdateIrrRate = async () => {
    const rate = parseFloat(irrRate);
    if (isNaN(rate) || rate <= 0) {
      setError('Please enter a valid IRR exchange rate greater than 0');
      return;
    }

    if (rate === currentIrrRate) {
      setError('This is already the current IRR exchange rate');
      return;
    }

    setLoadingIrr(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await adminAPI.updateIRRRate(rate);
      setCurrentIrrRate(rate);
      setSuccess(`IRR exchange rate successfully updated to ${rate.toLocaleString()} تومان per $1.00 USD`);
      
      // Reload history
      await loadIrrHistory();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update IRR exchange rate. Please try again.');
    } finally {
      setLoadingIrr(false);
    }
  };

  const handleIrrRateChange = (value: string) => {
    setIrrRate(value);
    const rate = parseFloat(value);
    if (!isNaN(rate) && rate > 0) {
      // Preview: Calculate IRR for $100 USD example
      setPreviewIRR(rate * 100);
    } else {
      setPreviewIRR(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-6xl">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <Settings className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
              Settings<span className="text-green-200">.</span>
            </h1>
            <p className="text-green-100 text-sm font-bold uppercase tracking-widest mt-2">
              Exchange Rate Configuration
            </p>
          </div>
        </div>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-900 rounded-3xl p-6 flex items-start gap-4 shadow-lg animate-in slide-in-from-top">
          <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={24} />
          <div className="flex-1">
            <p className="text-sm text-red-900 dark:text-red-200 font-black uppercase mb-1">Error</p>
            <p className="text-sm text-red-700 dark:text-red-300 font-bold">{error}</p>
          </div>
          <button
            onClick={() => setError('')}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-950/40 border-2 border-green-200 dark:border-green-900 rounded-3xl p-6 flex items-start gap-4 shadow-lg animate-in slide-in-from-top">
          <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={24} />
          <div className="flex-1">
            <p className="text-sm text-green-900 dark:text-green-200 font-black uppercase mb-1">Success</p>
            <p className="text-sm text-green-700 dark:text-green-300 font-bold">{success}</p>
            <p className="text-xs text-green-600 mt-2 font-bold">
              The exchange rate has been updated successfully.
            </p>
          </div>
          <button
            onClick={() => setSuccess('')}
            className="text-green-400 hover:text-green-600 transition-colors"
          >
            ×
          </button>
        </div>
      )}

      {/* IRR EXCHANGE RATE CARD */}
      <div className="bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-neutral-700 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <DollarSign className="text-white" size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase text-gray-900 dark:text-neutral-100">IRR Exchange Rate Manager</h2>
              <p className="text-[10px] font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-widest mt-1">
                USD to IRR (Iranian Rial) Conversion for Zarinpal Payments
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const newState = !showIrrHistory;
                setShowIrrHistory(newState);
                
                if (newState) {
                  await loadIrrHistory();
                }
              }}
              className={`px-4 py-2 rounded-xl font-black uppercase text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                showIrrHistory 
                  ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-200' 
                  : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
              }`}
            >
              <History size={16} />
              {loadingIrrHistory ? 'Loading...' : showIrrHistory ? 'Hide History' : 'Show History'}
            </button>
          </div>
        </div>

        {/* CURRENT RATE DISPLAY */}
        {currentIrrRate && (
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/40 border-2 border-green-200 dark:border-green-900 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-green-700 dark:text-green-300 uppercase tracking-widest mb-2">Current Rate</p>
                <p className="text-4xl font-black tabular-nums text-gray-900 dark:text-neutral-100">
                  {currentIrrRate.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 font-bold mt-1">تومان per $1.00 USD</p>
              </div>
              <div className="text-right">
                <div className="w-20 h-20 bg-white dark:bg-neutral-800 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl">🇮🇷</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RATE UPDATE FORM */}
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-gray-700 dark:text-neutral-300 uppercase tracking-widest mb-3 block flex items-center gap-2">
              <Calculator size={14} />
              New IRR Exchange Rate
            </label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 dark:text-neutral-400 font-black text-sm">تومان</span>
              <input
                type="number"
                value={irrRate}
                onChange={(e) => handleIrrRateChange(e.target.value)}
                placeholder="42000"
                step="1"
                min="0"
                className="w-full bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-2xl py-5 pl-20 pr-6 outline-none focus:border-green-600 focus:ring-4 focus:ring-green-100 text-2xl font-black tabular-nums transition-all dark:text-neutral-100"
              />
            </div>
            {previewIRR && (
              <div className="mt-4 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-600 dark:text-neutral-300 mb-2 flex items-center gap-2">
                  <Info size={14} />
                  Preview Calculation:
                </p>
                <p className="text-sm font-black text-gray-900 dark:text-neutral-100">
                  $100.00 USD = {previewIRR.toLocaleString()} تومان
                </p>
              </div>
            )}
            <p className="text-[10px] text-gray-500 dark:text-neutral-400 mt-3 flex items-center gap-2">
              <Zap size={12} />
              This rate is used for Zarinpal payment gateway integration
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-200 dark:border-blue-900 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Info className="text-blue-600 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-xs font-black text-blue-900 dark:text-blue-200 uppercase mb-1">Payment Gateway</p>
                <p className="text-xs text-blue-800 dark:text-blue-300 font-bold">
                  This rate is used to convert USD prices to Iranian Rial for Zarinpal payments.
                  Users from Iran will see prices in IRR and pay via Zarinpal.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleUpdateIrrRate}
            disabled={loadingIrr || !irrRate || parseFloat(irrRate) === currentIrrRate}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loadingIrr ? (
              <>
                <RefreshCw className="animate-spin" size={20} />
                Updating Rate...
              </>
            ) : (
              <>
                <Save size={20} />
                Update IRR Exchange Rate
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>

        {/* IRR RATE HISTORY */}
        {showIrrHistory && (
          <div className="mt-8 pt-8 border-t-2 border-gray-200 dark:border-neutral-700 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black uppercase text-gray-900 dark:text-neutral-100 flex items-center gap-2">
                <History size={20} />
                Recent Rate Updates
              </h3>
              <button
                onClick={loadIrrHistory}
                disabled={loadingIrrHistory}
                className="px-3 py-1.5 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 rounded-lg font-black uppercase text-[10px] hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw size={12} className={loadingIrrHistory ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
            {loadingIrrHistory ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
                <p className="text-gray-400 dark:text-neutral-500 font-bold uppercase text-sm">Loading History...</p>
              </div>
            ) : irrHistory.length > 0 ? (
              <div className="space-y-3">
                {irrHistory.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-neutral-800 dark:to-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl p-5 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {entry.old_rate && entry.old_rate !== entry.rate && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-gray-500 dark:text-neutral-400 line-through">
                              {entry.old_rate.toLocaleString()}
                            </span>
                            <ArrowRight size={14} className="text-gray-400 dark:text-neutral-500" />
                          </div>
                        )}
                        <span className="text-lg font-black text-green-600 tabular-nums">
                          {entry.rate.toLocaleString()} تومان
                        </span>
                        <span className="text-xs font-bold text-gray-500 dark:text-neutral-400">per $1.00 USD</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 dark:text-neutral-500 font-bold uppercase">{entry.admin}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-gray-500 dark:text-neutral-400 font-bold">
                        {new Date(entry.timestamp).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {entry.old_rate && entry.old_rate !== entry.rate && (
                        <div className="flex items-center gap-1">
                          {entry.rate > entry.old_rate ? (
                            <>
                              <TrendingUp size={12} className="text-green-600" />
                              <span className="text-[10px] font-black text-green-600 uppercase">
                                +{((entry.rate - entry.old_rate) / entry.old_rate * 100).toFixed(2)}%
                              </span>
                            </>
                          ) : (
                            <>
                              <TrendingDown size={12} className="text-red-600" />
                              <span className="text-[10px] font-black text-red-600 uppercase">
                                {((entry.rate - entry.old_rate) / entry.old_rate * 100).toFixed(2)}%
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700">
                <History className="w-12 h-12 text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
                <p className="text-gray-400 dark:text-neutral-500 font-bold uppercase text-sm">No Rate History</p>
                <p className="text-[10px] text-gray-400 dark:text-neutral-500 mt-1">Rate updates will appear here</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* REFERRAL REWARD CARD */}
      <div className="bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-neutral-700 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Gift className="text-white" size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase text-gray-900 dark:text-neutral-100">Referral Reward</h2>
            <p className="text-[10px] font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-widest mt-1">
              Fixed payout when a referred user makes their first paid purchase
            </p>
          </div>
        </div>

        {currentReferralReward !== null && (
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/40 border-2 border-purple-200 dark:border-purple-900 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-purple-700 dark:text-purple-300 uppercase tracking-widest mb-2">Current Reward</p>
                <p className="text-4xl font-black tabular-nums text-gray-900 dark:text-neutral-100">
                  {currentReferralReward.toLocaleString()}
                </p>
                <p className="text-sm text-purple-600 font-bold mt-1">
                  {currentReferralReward > 0 ? 'تومان per successful referral' : 'Referrals payout disabled'}
                </p>
              </div>
              <div className="w-20 h-20 bg-white dark:bg-neutral-800 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="text-purple-500" size={36} />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-gray-700 dark:text-neutral-300 uppercase tracking-widest mb-3 block flex items-center gap-2">
              <Gift size={14} />
              Reward Amount (Toman)
            </label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 dark:text-neutral-400 font-black text-sm">تومان</span>
              <input
                type="number"
                value={referralReward}
                onChange={(e) => setReferralReward(e.target.value)}
                placeholder="0"
                step="1000"
                min="0"
                className="w-full bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-2xl py-5 pl-20 pr-6 outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100 text-2xl font-black tabular-nums transition-all dark:text-neutral-100"
              />
            </div>
            <p className="text-[10px] text-gray-500 dark:text-neutral-400 mt-3 flex items-center gap-2">
              <Info size={12} />
              Credited to the referrer&apos;s wallet automatically. Set to 0 to turn referral payouts off.
            </p>
          </div>

          <button
            onClick={handleUpdateReferralReward}
            disabled={loadingReferral || referralReward === '' || parseFloat(referralReward) === currentReferralReward}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loadingReferral ? (
              <>
                <RefreshCw className="animate-spin" size={20} />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Update Referral Reward
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* STEAM MARKETPLACE COMMISSION CARD */}
      <div className="bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-neutral-700 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
            <Calculator className="text-white" size={30} />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase text-gray-900 dark:text-neutral-100">Marketplace Commission</h2>
            <p className="text-[10px] font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-widest mt-1">Fee taken from each Steam-skin sale</p>
          </div>
        </div>
        {currentCommission !== null && (
          <div className="bg-slate-50 dark:bg-neutral-800 border-2 border-slate-200 dark:border-neutral-700 rounded-2xl p-6 mb-6">
            <p className="text-[10px] font-black text-slate-500 dark:text-neutral-400 uppercase tracking-widest mb-2">Current Commission</p>
            <p className="text-4xl font-black tabular-nums text-gray-900 dark:text-neutral-100">{currentCommission}%</p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
          <div className="flex-1">
            <label className="text-[10px] font-black text-gray-700 dark:text-neutral-300 uppercase tracking-widest mb-2 block">New Commission (%)</label>
            <input type="number" value={commission} onChange={(e) => setCommission(e.target.value)} min="0" max="100" step="0.5" placeholder="5"
              className="w-full bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-2xl py-4 px-6 outline-none focus:border-slate-600 text-2xl font-black tabular-nums dark:text-neutral-100" />
          </div>
          <button onClick={handleUpdateCommission} disabled={loadingCommission || commission === '' || parseFloat(commission) === currentCommission}
            className="py-4 px-8 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-2xl font-black uppercase text-sm tracking-widest hover:from-slate-800 hover:to-black disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {loadingCommission ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />} Save
          </button>
        </div>
      </div>

      {/* ADDITIONAL SETTINGS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-neutral-700 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950/40 rounded-2xl flex items-center justify-center">
              <Settings className="text-purple-600" size={24} />
            </div>
            <h3 className="text-lg font-black uppercase text-gray-900 dark:text-neutral-100">System Settings</h3>
          </div>
          <p className="text-[10px] text-gray-500 dark:text-neutral-400 font-bold uppercase mb-4">
            General Configuration
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-neutral-800">
              <span className="text-sm font-bold text-gray-600 dark:text-neutral-300">Site Status</span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 rounded-full text-xs font-black uppercase">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-neutral-800">
              <span className="text-sm font-bold text-gray-600 dark:text-neutral-300">Payment Gateway</span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-black uppercase">
                Zarinpal
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-neutral-800">
              <span className="text-sm font-bold text-gray-600 dark:text-neutral-300">Currency</span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 rounded-full text-xs font-black uppercase">
                IRR (تومان)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-neutral-700 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-950/40 rounded-2xl flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <h3 className="text-lg font-black uppercase text-gray-900 dark:text-neutral-100">Quick Actions</h3>
          </div>
          <p className="text-[10px] text-gray-500 dark:text-neutral-400 font-bold uppercase mb-4">
            Common Tasks
          </p>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-xl transition-all text-sm font-bold">
              View System Logs
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-xl transition-all text-sm font-bold">
              Backup Database
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-xl transition-all text-sm font-bold">
              Clear Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
