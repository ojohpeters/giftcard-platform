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
  Info
} from "lucide-react";
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatIQD, formatIQDShort } from '@/lib/currency';

interface RateHistory {
  rate: number;
  timestamp: string;
  admin: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [exchangeRate, setExchangeRate] = useState('');
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rateHistory, setRateHistory] = useState<RateHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [previewIQD, setPreviewIQD] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.is_staff) {
      router.push('/dashboard');
      return;
    }
    // Load current exchange rate
    loadCurrentRate();
  }, [user, router]);

  const loadCurrentRate = async () => {
    try {
      // This would typically come from an API endpoint
      // For now, using default or from settings
      const defaultRate = 1310;
      setCurrentRate(defaultRate);
      setExchangeRate(defaultRate.toString());
    } catch (error) {
      console.error('Failed to load exchange rate:', error);
    }
  };

  const handleUpdateRate = async () => {
    const rate = parseFloat(exchangeRate);
    if (isNaN(rate) || rate <= 0) {
      setError('Please enter a valid exchange rate greater than 0');
      return;
    }

    if (rate === currentRate) {
      setError('This is already the current exchange rate');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await adminAPI.updateExchangeRate(rate);
      setCurrentRate(rate);
      setSuccess(`Exchange rate successfully updated to ${formatIQD(rate)} per $1.00 USD`);
      
      // Add to history
      setRateHistory(prev => [{
        rate,
        timestamp: new Date().toISOString(),
        admin: user?.email || 'Admin'
      }, ...prev].slice(0, 10));
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
      
      // Show notification that prices are being updated
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update exchange rate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRateChange = (value: string) => {
    setExchangeRate(value);
    const rate = parseFloat(value);
    if (!isNaN(rate) && rate > 0) {
      // Preview: Calculate IQD for $100 USD example
      setPreviewIQD(rate * 100);
    } else {
      setPreviewIQD(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatIQD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-6xl">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <Settings className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
              Settings<span className="text-blue-200">.</span>
            </h1>
            <p className="text-blue-100 text-sm font-bold uppercase tracking-widest mt-2">
              System Configuration & Exchange Rates
            </p>
          </div>
        </div>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 flex items-start gap-4 shadow-lg animate-in slide-in-from-top">
          <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={24} />
          <div className="flex-1">
            <p className="text-sm text-red-900 font-black uppercase mb-1">Error</p>
            <p className="text-sm text-red-700 font-bold">{error}</p>
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
        <div className="bg-green-50 border-2 border-green-200 rounded-3xl p-6 flex items-start gap-4 shadow-lg animate-in slide-in-from-top">
          <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={24} />
          <div className="flex-1">
            <p className="text-sm text-green-900 font-black uppercase mb-1">Success</p>
            <p className="text-sm text-green-700 font-bold">{success}</p>
            <p className="text-xs text-green-600 mt-2 font-bold">
              All product prices have been automatically updated across the site.
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

      {/* EXCHANGE RATE CARD */}
      <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <DollarSign className="text-white" size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase text-gray-900">Exchange Rate Manager</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                USD to IQD (Iraqi Dinar) Conversion
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-black uppercase text-xs hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              <History size={16} />
              History
            </button>
          </div>
        </div>

        {/* CURRENT RATE DISPLAY */}
        {currentRate && (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-2">Current Rate</p>
                <p className="text-4xl font-black tabular-nums text-gray-900">
                  {formatIQD(currentRate)}
                </p>
                <p className="text-sm text-blue-600 font-bold mt-1">per $1.00 USD</p>
              </div>
              <div className="text-right">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Globe className="text-blue-600" size={40} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RATE UPDATE FORM */}
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-3 block flex items-center gap-2">
              <Calculator size={14} />
              New Exchange Rate
            </label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 font-black text-sm">IQD</span>
              <input
                type="number"
                value={exchangeRate}
                onChange={(e) => handleRateChange(e.target.value)}
                placeholder="1310.00"
                step="0.01"
                min="0"
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl py-5 pl-16 pr-6 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 text-2xl font-black tabular-nums transition-all"
              />
            </div>
            {previewIQD && (
              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-2">
                  <Info size={14} />
                  Preview Calculation:
                </p>
                <p className="text-sm font-black text-gray-900">
                  $100.00 USD = {formatIQD(previewIQD)}
                </p>
              </div>
            )}
            <p className="text-[10px] text-gray-500 mt-3 flex items-center gap-2">
              <Zap size={12} />
              This will automatically update prices for all products across the entire site
            </p>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-xs font-black text-yellow-900 uppercase mb-1">Important Notice</p>
                <p className="text-xs text-yellow-800 font-bold">
                  Updating the exchange rate will immediately recalculate all product prices in IQD. 
                  This action cannot be undone automatically, but you can always update the rate again.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleUpdateRate}
            disabled={loading || !exchangeRate || parseFloat(exchangeRate) === currentRate}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" size={20} />
                Updating Rate...
              </>
            ) : (
              <>
                <Save size={20} />
                Update Exchange Rate
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>

        {/* RATE HISTORY */}
        {showHistory && (
          <div className="mt-8 pt-8 border-t-2 border-gray-200">
            <h3 className="text-lg font-black uppercase text-gray-900 mb-4 flex items-center gap-2">
              <History size={20} />
              Recent Rate Updates
            </h3>
            {rateHistory.length > 0 ? (
              <div className="space-y-3">
                {rateHistory.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-black text-gray-900">
                        {formatIQD(entry.rate)}
                      </p>
                      <p className="text-[10px] text-gray-500 font-bold">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{entry.admin}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 font-bold uppercase text-sm">No Rate History</p>
                <p className="text-[10px] text-gray-400 mt-1">Rate updates will appear here</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ADDITIONAL SETTINGS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Settings className="text-purple-600" size={24} />
            </div>
            <h3 className="text-lg font-black uppercase text-gray-900">System Settings</h3>
          </div>
          <p className="text-[10px] text-gray-500 font-bold uppercase mb-4">
            General Configuration
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-600">Site Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-black uppercase">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-600">Maintenance Mode</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-black uppercase">
                Off
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <h3 className="text-lg font-black uppercase text-gray-900">Quick Actions</h3>
          </div>
          <p className="text-[10px] text-gray-500 font-bold uppercase mb-4">
            Common Tasks
          </p>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-sm font-bold">
              View System Logs
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-sm font-bold">
              Backup Database
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-sm font-bold">
              Clear Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
