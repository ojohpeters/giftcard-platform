"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package,
  Zap,
  ArrowUpRight,
  Activity,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Award,
  Clock,
  AlertCircle,
  Calendar,
  TrendingUp as TrendingUpIcon,
  FileText,
  Settings,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  Target
} from "lucide-react";
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area,
  Legend, ComposedChart
} from 'recharts';
import Link from 'next/link';
import ActivityFeed from '@/components/admin/ActivityFeed';

interface Stats {
  total_revenue: string;
  total_orders: number;
  total_users: number;
  total_products: number;
  revenue_today: string;
  revenue_this_week: string;
  revenue_this_month: string;
  orders_today: number;
  orders_this_week: number;
  orders_this_month: number;
  available_codes: number;
  sold_codes: number;
  total_referrals: number;
  referral_rewards_paid: string;
  active_discounts: number;
  discount_usage_count: number;
  avg_order_value?: string;
  conversion_rate?: string;
  customer_lifetime_value?: string;
  repeat_customer_rate?: string;
  revenue_growth?: string;
  orders_growth?: string;
  orders_change?: number;
  user_growth?: string;
  new_users_this_month?: number;
  status_breakdown?: Record<string, number>;
  payment_breakdown?: Record<string, number>;
  top_categories?: Array<{category__name_en: string; count: number; revenue: string}>;
  // Purchase Request Stats
  purchase_requests_total?: number;
  purchase_requests_pending?: number;
  purchase_requests_completed?: number;
  purchase_requests_revenue?: string;
  purchase_requests_today?: number;
  // Submission Stats
  submissions_total?: number;
  submissions_pending?: number;
  submissions_approved?: number;
  submissions_rejected?: number;
  submissions_total_credits?: string;
  submissions_today?: number;
  // Withdrawal Stats
  withdrawals_total?: number;
  withdrawals_pending?: number;
  withdrawals_completed?: number;
  withdrawals_total_amount?: string;
  withdrawals_pending_amount?: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function AdminDashboard() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState<Stats | null>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [productSales, setProductSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState(30);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'performance'>('overview');

  useEffect(() => {
    if (user === null) return;
    if (user?.is_staff) {
      loadDashboardData();
    }
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadDashboardData();
      }, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user, router, timeRange, autoRefresh]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, revenueRes, salesRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getRevenueChart(timeRange),
        adminAPI.getProductSales(),
      ]);
      setStats(statsRes.data);
      setRevenueData(revenueRes.data);
      setProductSales(salesRes.data);
      setLastRefresh(new Date());
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
        router.push('/dashboard');
      } else {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'orders' | 'users') => {
    try {
      const params = new URLSearchParams();
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/admin/dashboard/export_${type}/?${params.toString()}`;
      window.open(url, '_blank');
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    }
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    // Format as IRR (Iranian Rial) with تومان suffix
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M تومان`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K تومان`;
    }
    return `${num.toLocaleString()} تومان`;
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const statusChartData = useMemo(() => {
    if (!stats?.status_breakdown) return [];
    return Object.entries(stats.status_breakdown).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
      value
    }));
  }, [stats]);

  const paymentChartData = useMemo(() => {
    if (!stats?.payment_breakdown) return [];
    return Object.entries(stats.payment_breakdown).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
      value
    }));
  }, [stats]);

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0a0a0b] dark:to-neutral-900">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-sm dark:text-neutral-400">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-3xl shadow-xl border border-red-200 dark:bg-neutral-900">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-bold uppercase text-lg dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* ENHANCED HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Activity className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
                  Dashboard<span className="text-blue-200">.</span>
                </h1>
                <p className="text-blue-100 text-sm font-bold uppercase tracking-widest mt-1">
                  Advanced Analytics & Control Center
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-5 py-2.5 rounded-xl font-black uppercase text-xs border-2 transition-all backdrop-blur-sm ${
                autoRefresh 
                  ? 'bg-white text-blue-600 border-white shadow-lg' 
                  : 'bg-white/10 text-white border-white/30 hover:bg-white/20'
              }`}
            >
              <RefreshCw className={`inline mr-2 ${autoRefresh ? 'animate-spin' : ''}`} size={14} />
              Auto Refresh
            </button>
            <button
              onClick={loadDashboardData}
              className="px-5 py-2.5 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-black uppercase text-xs hover:bg-white/20 transition-all"
            >
              <RefreshCw size={14} className="inline mr-2" />
              Refresh Now
            </button>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="px-5 py-2.5 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-bold uppercase text-xs outline-none focus:border-white/50"
            >
              <option value={7} className="bg-gray-800">Last 7 Days</option>
              <option value={30} className="bg-gray-800">Last 30 Days</option>
              <option value={90} className="bg-gray-800">Last 90 Days</option>
              <option value={365} className="bg-gray-800">Last Year</option>
            </select>
            <div className="text-xs text-blue-100 font-bold bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
              <Clock size={14} className="inline mr-2" />
              {lastRefresh.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex gap-2 border-b-2 border-gray-200 bg-white rounded-t-3xl p-2 dark:border-neutral-700 dark:bg-neutral-900">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-black uppercase text-xs tracking-widest transition-all border-b-2 rounded-t-xl ${
            activeTab === 'overview'
              ? 'text-blue-600 border-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/40'
              : 'text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50 dark:text-neutral-500 dark:hover:text-neutral-300 dark:hover:bg-neutral-800'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-6 py-3 font-black uppercase text-xs tracking-widest transition-all border-b-2 rounded-t-xl ${
            activeTab === 'analytics'
              ? 'text-blue-600 border-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/40'
              : 'text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50 dark:text-neutral-500 dark:hover:text-neutral-300 dark:hover:bg-neutral-800'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-6 py-3 font-black uppercase text-xs tracking-widest transition-all border-b-2 rounded-t-xl ${
            activeTab === 'performance'
              ? 'text-blue-600 border-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/40'
              : 'text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50 dark:text-neutral-500 dark:hover:text-neutral-300 dark:hover:bg-neutral-800'
          }`}
        >
          Performance
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-300">

      {/* KEY METRICS - PROFESSIONAL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Purchase Revenue Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/40 border-2 border-green-200 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <DollarSign className="text-white" size={28} />
            </div>
            <Link href="/admin/purchase-requests" className="text-xs font-black text-green-600 uppercase hover:text-green-800 transition-colors dark:text-green-300">
              View →
            </Link>
          </div>
          <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-2 dark:text-green-300">Purchase Revenue</p>
          <p className="text-3xl font-black tracking-tighter tabular-nums text-gray-900 mb-3 dark:text-neutral-100">
            {stats.purchase_requests_revenue ? formatCurrency(stats.purchase_requests_revenue) : '$0'}
          </p>
          <div className="pt-3 border-t-2 border-green-200 space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-green-600 font-bold dark:text-green-300">Completed:</span>
              <span className="font-black text-gray-900 dark:text-neutral-100">{stats.purchase_requests_completed || 0}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-green-600 font-bold dark:text-green-300">Today:</span>
              <span className="font-black text-gray-900 dark:text-neutral-100">{stats.purchase_requests_today || 0}</span>
            </div>
          </div>
        </div>

        {/* Submissions Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40 border-2 border-blue-200 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <FileText className="text-white" size={28} />
            </div>
            <Link href="/admin/submissions" className="text-xs font-black text-blue-600 uppercase hover:text-blue-800 transition-colors dark:text-blue-300">
              View →
            </Link>
          </div>
          <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-2 dark:text-blue-300">Submissions</p>
          <p className="text-3xl font-black tracking-tighter tabular-nums text-gray-900 mb-3 dark:text-neutral-100">{formatNumber(stats.submissions_total || 0)}</p>
          <div className="pt-3 border-t-2 border-blue-200 space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-blue-600 font-bold dark:text-blue-300">Pending:</span>
              <span className="font-black text-orange-600 dark:text-orange-300">{stats.submissions_pending || 0}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-blue-600 font-bold dark:text-blue-300">Credits Paid:</span>
              <span className="font-black text-gray-900 dark:text-neutral-100">{stats.submissions_total_credits ? formatCurrency(stats.submissions_total_credits) : '$0'}</span>
            </div>
          </div>
        </div>

        {/* Users Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/40 border-2 border-purple-200 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Users className="text-white" size={28} />
            </div>
            <Link href="/admin/users" className="text-xs font-black text-purple-600 uppercase hover:text-purple-800 transition-colors dark:text-purple-300">
              View →
            </Link>
          </div>
          <p className="text-[10px] font-black text-purple-700 uppercase tracking-widest mb-2 dark:text-purple-300">Total Users</p>
          <p className="text-3xl font-black tracking-tighter tabular-nums text-gray-900 mb-3 dark:text-neutral-100">{formatNumber(stats.total_users)}</p>
          <div className="pt-3 border-t-2 border-purple-200 space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-purple-600 font-bold dark:text-purple-300">New This Month:</span>
              <span className="font-black text-gray-900 dark:text-neutral-100">{stats.new_users_this_month || 0}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-purple-600 font-bold dark:text-purple-300">Referrals:</span>
              <span className="font-black text-gray-900 dark:text-neutral-100">{stats.total_referrals || 0}</span>
            </div>
          </div>
        </div>

        {/* Withdrawals Card */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/40 border-2 border-orange-200 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <ArrowUpRight className="text-white" size={28} />
            </div>
            <Link href="/admin/withdrawals" className="text-xs font-black text-orange-600 uppercase hover:text-orange-800 transition-colors dark:text-orange-300">
              View →
            </Link>
          </div>
          <p className="text-[10px] font-black text-orange-700 uppercase tracking-widest mb-2 dark:text-orange-300">Withdrawals</p>
          <p className="text-3xl font-black tracking-tighter tabular-nums text-gray-900 mb-3 dark:text-neutral-100">{formatNumber(stats.withdrawals_total || 0)}</p>
          <div className="pt-3 border-t-2 border-orange-200 space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-orange-600 font-bold dark:text-orange-300">Pending:</span>
              <span className="font-black text-orange-600 dark:text-orange-300">{stats.withdrawals_pending || 0}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-orange-600 font-bold dark:text-orange-300">Pending Amount:</span>
              <span className="font-black text-gray-900 dark:text-neutral-100">{stats.withdrawals_pending_amount ? formatCurrency(stats.withdrawals_pending_amount) : '$0'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PRODUCTS & QUICK ACTIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all dark:bg-neutral-900 dark:border-neutral-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
              <Package className="text-orange-600" size={24} />
            </div>
            <h3 className="text-sm font-black uppercase text-gray-900 dark:text-neutral-100">Products</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase dark:text-neutral-400">Total</span>
              <span className="text-2xl font-black text-gray-900 dark:text-neutral-100">{formatNumber(stats.total_products)}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-500 font-bold dark:text-neutral-400">Available Codes</span>
              <span className="font-black text-green-600 dark:text-green-300">{formatNumber(stats.available_codes)}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-500 font-bold dark:text-neutral-400">Sold Codes</span>
              <span className="font-black text-gray-900 dark:text-neutral-100">{formatNumber(stats.sold_codes)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all dark:bg-neutral-900 dark:border-neutral-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <Award className="text-green-600" size={24} />
            </div>
            <h3 className="text-sm font-black uppercase text-gray-900 dark:text-neutral-100">Referrals</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase dark:text-neutral-400">Total</span>
              <span className="text-2xl font-black text-gray-900 dark:text-neutral-100">{formatNumber(stats.total_referrals)}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-500 font-bold dark:text-neutral-400">Rewards Paid</span>
              <span className="font-black text-gray-900 dark:text-neutral-100">{formatCurrency(stats.referral_rewards_paid)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all dark:bg-neutral-900 dark:border-neutral-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
              <Zap className="text-yellow-600" size={24} />
            </div>
            <h3 className="text-sm font-black uppercase text-gray-900 dark:text-neutral-100">Discounts</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase dark:text-neutral-400">Active</span>
              <span className="text-2xl font-black text-gray-900 dark:text-neutral-100">{stats.active_discounts}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-500 font-bold dark:text-neutral-400">Total Usage</span>
              <span className="font-black text-gray-900 dark:text-neutral-100">{formatNumber(stats.discount_usage_count)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all dark:bg-neutral-900 dark:border-neutral-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Download className="text-purple-600" size={24} />
            </div>
            <h3 className="text-sm font-black uppercase text-gray-900 dark:text-neutral-100">Quick Export</h3>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => handleExport('users')}
              className="w-full py-2.5 bg-purple-50 text-purple-600 rounded-xl font-black uppercase text-xs hover:bg-purple-100 transition-all border-2 border-purple-200"
            >
              <Download size={14} className="inline mr-2" />
              Users CSV
            </button>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart - Enhanced */}
        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg dark:bg-neutral-900 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black uppercase text-gray-900 mb-1 dark:text-neutral-100">Revenue Trend (تومان)</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase dark:text-neutral-400">Last {timeRange} Days</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Activity className="text-blue-600" size={24} />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 'bold' }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 'bold' }}
                tickFormatter={(value) => value >= 1000000 ? `${(value/1000000).toFixed(0)}M` : value >= 1000 ? `${(value/1000).toFixed(0)}K` : value}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  padding: '12px'
                }}
                formatter={(value: any) => formatCurrency(value)}
                labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Product Sales Chart - Enhanced */}
        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg dark:bg-neutral-900 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black uppercase text-gray-900 mb-1 dark:text-neutral-100">Top Products (تومان)</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase dark:text-neutral-400">By Revenue</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <TrendingUpIcon className="text-green-600" size={24} />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={productSales.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="product_name" 
                tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 'bold' }}
                tickFormatter={(value) => value >= 1000000 ? `${(value/1000000).toFixed(0)}M` : value >= 1000 ? `${(value/1000).toFixed(0)}K` : value}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  padding: '12px'
                }}
                formatter={(value: any) => formatCurrency(value)}
              />
              <Bar dataKey="revenue" fill="#10b981" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* STATUS BREAKDOWN CHARTS */}
      {statusChartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg dark:bg-neutral-900 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black uppercase text-gray-900 mb-1 dark:text-neutral-100">Order Status</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase dark:text-neutral-400">Distribution</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <BarChart3 className="text-blue-600" size={24} />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <RechartsPieChart>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '2px solid #e5e7eb', 
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                />
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend 
                  wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  iconType="circle"
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          {paymentChartData.length > 0 && (
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg dark:bg-neutral-900 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black uppercase text-gray-900 mb-1 dark:text-neutral-100">Payment Status</h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase dark:text-neutral-400">Distribution</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <PieChart className="text-green-600" size={24} />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <RechartsPieChart>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '2px solid #e5e7eb', 
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  />
                  <Pie
                    data={paymentChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    iconType="circle"
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* PERIOD COMPARISON - ENHANCED */}
      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-neutral-900 dark:to-neutral-900 border-2 border-gray-200 rounded-3xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black uppercase text-gray-900 mb-1 dark:text-neutral-100">Period Comparison</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase dark:text-neutral-400">Revenue & Orders</p>
          </div>
          <Calendar className="text-gray-400 dark:text-neutral-500" size={24} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all dark:bg-neutral-900 dark:border-neutral-800">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 dark:text-neutral-400">Today</p>
            <p className="text-3xl font-black tabular-nums text-gray-900 mb-2 dark:text-neutral-100">{formatCurrency(stats.revenue_today)}</p>
            <div className="flex items-center gap-2 text-[10px]">
              <ShoppingBag size={14} className="text-gray-400 dark:text-neutral-500" />
              <span className="text-gray-600 font-bold dark:text-neutral-300">{stats.orders_today} orders</span>
            </div>
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all dark:bg-neutral-900 dark:border-neutral-800">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 dark:text-neutral-400">This Week</p>
            <p className="text-3xl font-black tabular-nums text-gray-900 mb-2 dark:text-neutral-100">{formatCurrency(stats.revenue_this_week)}</p>
            <div className="flex items-center gap-2 text-[10px]">
              <ShoppingBag size={14} className="text-gray-400 dark:text-neutral-500" />
              <span className="text-gray-600 font-bold dark:text-neutral-300">{stats.orders_this_week} orders</span>
            </div>
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all dark:bg-neutral-900 dark:border-neutral-800">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 dark:text-neutral-400">This Month</p>
            <p className="text-3xl font-black tabular-nums text-gray-900 mb-2 dark:text-neutral-100">{formatCurrency(stats.revenue_this_month)}</p>
            <div className="flex items-center gap-2 text-[10px]">
              <ShoppingBag size={14} className="text-gray-400 dark:text-neutral-500" />
              <span className="text-gray-600 font-bold dark:text-neutral-300">{stats.orders_this_month} orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* SUBMISSIONS, WITHDRAWALS & PURCHASE REQUESTS STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Submissions Stats */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 border-2 border-indigo-200 rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="text-white" size={24} />
            </div>
            <Link href="/admin/submissions" className="text-xs font-black text-indigo-600 uppercase hover:text-indigo-800 transition-colors dark:text-indigo-300">
              View All →
            </Link>
          </div>
          <h3 className="text-lg font-black uppercase text-gray-900 mb-4 dark:text-neutral-100">Submissions</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-600 dark:text-neutral-300">Total</span>
              <span className="text-xl font-black text-gray-900 dark:text-neutral-100">{stats.submissions_total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-600 dark:text-neutral-300">Pending</span>
              <span className="text-lg font-black text-orange-600 dark:text-orange-300">{stats.submissions_pending || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-600 dark:text-neutral-300">Approved</span>
              <span className="text-lg font-black text-green-600 dark:text-green-300">{stats.submissions_approved || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-600 dark:text-neutral-300">Rejected</span>
              <span className="text-lg font-black text-red-600 dark:text-red-300">{stats.submissions_rejected || 0}</span>
            </div>
            <div className="pt-3 border-t-2 border-indigo-200">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 dark:text-neutral-400">Total Credits</span>
                <span className="text-sm font-black text-gray-900 dark:text-neutral-100">{stats.submissions_total_credits ? formatCurrency(stats.submissions_total_credits) : '$0'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Withdrawals Stats */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 border-2 border-purple-200 rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <DollarSign className="text-white" size={24} />
            </div>
            <Link href="/admin/withdrawals" className="text-xs font-black text-purple-600 uppercase hover:text-purple-800 transition-colors dark:text-purple-300">
              View All →
            </Link>
          </div>
          <h3 className="text-lg font-black uppercase text-gray-900 mb-4 dark:text-neutral-100">Withdrawals</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-600 dark:text-neutral-300">Total</span>
              <span className="text-xl font-black text-gray-900 dark:text-neutral-100">{stats.withdrawals_total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-600 dark:text-neutral-300">Pending</span>
              <span className="text-lg font-black text-orange-600 dark:text-orange-300">{stats.withdrawals_pending || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-600 dark:text-neutral-300">Completed</span>
              <span className="text-lg font-black text-green-600 dark:text-green-300">{stats.withdrawals_completed || 0}</span>
            </div>
            <div className="pt-3 border-t-2 border-purple-200">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 dark:text-neutral-400">Pending Amount</span>
                <span className="text-sm font-black text-orange-600 dark:text-orange-300">{stats.withdrawals_pending_amount ? formatCurrency(stats.withdrawals_pending_amount) : '$0'}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs font-bold text-gray-500 dark:text-neutral-400">Total Paid</span>
                <span className="text-sm font-black text-green-600 dark:text-green-300">{stats.withdrawals_total_amount ? formatCurrency(stats.withdrawals_total_amount) : '$0'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Requests Stats */}
        <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/40 dark:to-teal-950/40 border-2 border-green-200 rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <ShoppingBag className="text-white" size={24} />
            </div>
            <Link href="/admin/purchase-requests" className="text-xs font-black text-green-600 uppercase hover:text-green-800 transition-colors dark:text-green-300">
              View All →
            </Link>
          </div>
          <h3 className="text-lg font-black uppercase text-gray-900 mb-4 dark:text-neutral-100">Purchase Requests</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-600 dark:text-neutral-300">Total</span>
              <span className="text-xl font-black text-gray-900 dark:text-neutral-100">{stats.purchase_requests_total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-600 dark:text-neutral-300">Pending</span>
              <span className="text-lg font-black text-orange-600 dark:text-orange-300">{stats.purchase_requests_pending || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-600 dark:text-neutral-300">Completed</span>
              <span className="text-lg font-black text-green-600 dark:text-green-300">{stats.purchase_requests_completed || 0}</span>
            </div>
            <div className="pt-3 border-t-2 border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 dark:text-neutral-400">Today</span>
                <span className="text-sm font-black text-gray-900 dark:text-neutral-100">{stats.purchase_requests_today || 0}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs font-bold text-gray-500 dark:text-neutral-400">Total Revenue</span>
                <span className="text-sm font-black text-green-600 dark:text-green-300">{stats.purchase_requests_revenue ? formatCurrency(stats.purchase_requests_revenue) : '$0'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVITY FEED & QUICK STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed 
            activities={[
              {
                id: 1,
                type: 'order',
                action: 'New order #ORD-1234 placed',
                user: 'customer@example.com',
                timestamp: new Date().toISOString(),
                status: 'success'
              },
              {
                id: 2,
                type: 'user',
                action: 'New user registered',
                user: 'newuser@example.com',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                status: 'info'
              },
              {
                id: 3,
                type: 'payment',
                action: 'Payment completed for order #ORD-1233',
                user: 'admin',
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                status: 'success'
              },
              {
                id: 4,
                type: 'product',
                action: 'Product inventory updated',
                user: 'admin',
                timestamp: new Date(Date.now() - 10800000).toISOString(),
                status: 'info'
              },
              {
                id: 5,
                type: 'settings',
                action: 'Exchange rate updated to 42,000 تومان',
                user: 'admin',
                timestamp: new Date(Date.now() - 14400000).toISOString(),
                status: 'success'
              }
            ]}
            limit={5}
          />
        </div>
        
        {/* QUICK STATS WIDGET */}
        <div className="space-y-4">
          <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg dark:bg-neutral-900 dark:border-neutral-800">
            <h3 className="text-lg font-black uppercase text-gray-900 mb-4 dark:text-neutral-100">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-200 dark:bg-blue-950/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="text-white" size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase dark:text-neutral-400">Pending Orders</p>
                    <p className="text-xl font-black text-gray-900 dark:text-neutral-100">{stats.status_breakdown?.pending || 0}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200 dark:bg-green-950/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="text-white" size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase dark:text-neutral-400">Completed Today</p>
                    <p className="text-xl font-black text-gray-900 dark:text-neutral-100">{stats.orders_today}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-200 dark:bg-purple-950/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                    <UserPlus className="text-white" size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase dark:text-neutral-400">New Users</p>
                    <p className="text-xl font-black text-gray-900 dark:text-neutral-100">{stats.new_users_this_month || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pending Actions Widget */}
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/40 dark:to-yellow-950/40 border-2 border-orange-200 rounded-3xl p-6 shadow-lg">
            <h3 className="text-lg font-black uppercase text-orange-700 mb-4 flex items-center gap-2 dark:text-orange-300">
              <AlertTriangle className="text-orange-500" size={20} />
              Pending Actions
            </h3>
            <div className="space-y-3">
              <Link href="/admin/submissions" className="flex items-center justify-between p-3 bg-white rounded-xl border border-orange-200 hover:border-orange-400 transition-all dark:bg-neutral-900">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FileText className="text-orange-600" size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-700 dark:text-neutral-300">Submissions</p>
                    <p className="text-[10px] text-gray-500 dark:text-neutral-400">Awaiting review</p>
                  </div>
                </div>
                <span className="text-lg font-black text-orange-600 dark:text-orange-300">{stats.submissions_pending || 0}</span>
              </Link>
              <Link href="/admin/withdrawals" className="flex items-center justify-between p-3 bg-white rounded-xl border border-orange-200 hover:border-orange-400 transition-all dark:bg-neutral-900">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-orange-600" size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-700 dark:text-neutral-300">Withdrawals</p>
                    <p className="text-[10px] text-gray-500 dark:text-neutral-400">Awaiting approval</p>
                  </div>
                </div>
                <span className="text-lg font-black text-orange-600 dark:text-orange-300">{stats.withdrawals_pending || 0}</span>
              </Link>
              <Link href="/admin/purchase-requests" className="flex items-center justify-between p-3 bg-white rounded-xl border border-orange-200 hover:border-orange-400 transition-all dark:bg-neutral-900">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="text-orange-600" size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-700 dark:text-neutral-300">Purchases</p>
                    <p className="text-[10px] text-gray-500 dark:text-neutral-400">Pending requests</p>
                  </div>
                </div>
                <span className="text-lg font-black text-orange-600 dark:text-orange-300">{stats.purchase_requests_pending || 0}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/submissions" className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-600 hover:shadow-lg transition-all group dark:bg-neutral-900 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-3">
            <FileText className="text-blue-600 group-hover:scale-110 transition-transform" size={24} />
            <ChevronRight className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all dark:text-neutral-500" size={20} />
          </div>
          <h3 className="font-black uppercase text-sm text-gray-900 mb-1 dark:text-neutral-100">Submissions</h3>
          <p className="text-[10px] text-gray-500 font-bold dark:text-neutral-400">Review gift card submissions</p>
        </Link>
        <Link href="/admin/withdrawals" className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-purple-600 hover:shadow-lg transition-all group dark:bg-neutral-900 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="text-purple-600 group-hover:scale-110 transition-transform" size={24} />
            <ChevronRight className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all dark:text-neutral-500" size={20} />
          </div>
          <h3 className="font-black uppercase text-sm text-gray-900 mb-1 dark:text-neutral-100">Withdrawals</h3>
          <p className="text-[10px] text-gray-500 font-bold dark:text-neutral-400">Manage withdrawal requests</p>
        </Link>
        <Link href="/admin/purchase-requests" className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-orange-600 hover:shadow-lg transition-all group dark:bg-neutral-900 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-3">
            <ShoppingBag className="text-orange-600 group-hover:scale-110 transition-transform" size={24} />
            <ChevronRight className="text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all dark:text-neutral-500" size={20} />
          </div>
          <h3 className="font-black uppercase text-sm text-gray-900 mb-1 dark:text-neutral-100">Purchase Requests</h3>
          <p className="text-[10px] text-gray-500 font-bold dark:text-neutral-400">Manage buyer requests</p>
        </Link>
        <Link href="/admin/settings" className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40 border-2 border-blue-300 rounded-2xl p-6 hover:border-blue-600 hover:shadow-xl transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full -mr-10 -mt-10 opacity-50" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <Settings className="text-blue-600 group-hover:scale-110 transition-transform" size={24} />
            <ChevronRight className="text-blue-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={20} />
          </div>
          <h3 className="font-black uppercase text-sm text-gray-900 mb-1 relative z-10 dark:text-neutral-100">Settings</h3>
          <p className="text-[10px] text-blue-600 font-bold relative z-10 dark:text-blue-300">Site configuration</p>
        </Link>
      </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* ANALYTICS TAB CONTENT */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/40 dark:to-blue-950/40 border-2 border-purple-200 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="text-white" size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase text-gray-900 dark:text-neutral-100">Deep Analytics</h2>
                <p className="text-sm text-gray-600 font-bold uppercase tracking-widest dark:text-neutral-300">Advanced Insights & Trends</p>
              </div>
            </div>

            {/* ANALYTICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg dark:bg-neutral-900 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="text-blue-600" size={24} />
                  </div>
                  <span className="text-xs font-black text-gray-400 uppercase dark:text-neutral-500">Growth Rate</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-600 dark:text-neutral-300">Revenue</span>
                    <span className={`text-xl font-black ${stats.revenue_growth && parseFloat(stats.revenue_growth) >= 0 ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'}`}>
                      {stats.revenue_growth ? `${parseFloat(stats.revenue_growth) >= 0 ? '+' : ''}${parseFloat(stats.revenue_growth).toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-600 dark:text-neutral-300">Orders</span>
                    <span className={`text-xl font-black ${stats.orders_growth && parseFloat(stats.orders_growth) >= 0 ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'}`}>
                      {stats.orders_growth ? `${parseFloat(stats.orders_growth) >= 0 ? '+' : ''}${parseFloat(stats.orders_growth).toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-600 dark:text-neutral-300">Users</span>
                    <span className={`text-xl font-black ${stats.user_growth && parseFloat(stats.user_growth) >= 0 ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'}`}>
                      {stats.user_growth ? `${parseFloat(stats.user_growth) >= 0 ? '+' : ''}${parseFloat(stats.user_growth).toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg dark:bg-neutral-900 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Target className="text-green-600" size={24} />
                  </div>
                  <span className="text-xs font-black text-gray-400 uppercase dark:text-neutral-500">Conversion</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-gray-600 dark:text-neutral-300">Rate</span>
                      <span className="text-2xl font-black text-gray-900 dark:text-neutral-100">
                        {stats.conversion_rate ? `${parseFloat(stats.conversion_rate).toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-neutral-800">
                      <div 
                        className="bg-green-600 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(parseFloat(stats.conversion_rate || '0'), 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-bold dark:text-neutral-400">Repeat Customers</span>
                    <span className="font-black text-gray-900 dark:text-neutral-100">
                      {stats.repeat_customer_rate ? `${parseFloat(stats.repeat_customer_rate).toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg dark:bg-neutral-900 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Award className="text-purple-600" size={24} />
                  </div>
                  <span className="text-xs font-black text-gray-400 uppercase dark:text-neutral-500">Customer Value</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase block mb-1 dark:text-neutral-400">Lifetime Value</span>
                    <span className="text-2xl font-black text-gray-900 dark:text-neutral-100">
                      {stats.customer_lifetime_value ? formatCurrency(stats.customer_lifetime_value) : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase block mb-1 dark:text-neutral-400">Avg Order Value</span>
                    <span className="text-xl font-black text-gray-900 dark:text-neutral-100">
                      {stats.avg_order_value ? formatCurrency(stats.avg_order_value) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* TOP CATEGORIES */}
            {stats.top_categories && stats.top_categories.length > 0 && (
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg dark:bg-neutral-900 dark:border-neutral-800">
                <h3 className="text-xl font-black uppercase text-gray-900 mb-6 flex items-center gap-3 dark:text-neutral-100">
                  <Package className="text-blue-600" size={24} />
                  Top Categories
                </h3>
                <div className="space-y-4">
                  {stats.top_categories.map((cat, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 dark:bg-neutral-800 dark:border-neutral-700">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center font-black text-blue-600">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-gray-900 uppercase dark:text-neutral-100">{cat.category__name_en || 'Uncategorized'}</p>
                          <p className="text-xs text-gray-500 font-bold dark:text-neutral-400">{cat.count} orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-gray-900 dark:text-neutral-100">{formatCurrency(cat.revenue)}</p>
                        <p className="text-xs text-gray-500 font-bold dark:text-neutral-400">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* CHARTS IN ANALYTICS TAB */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg dark:bg-neutral-900 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black uppercase text-gray-900 mb-1 dark:text-neutral-100">Revenue Trend</h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase dark:text-neutral-400">Last {timeRange} Days</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Activity className="text-blue-600" size={24} />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 'bold' }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 'bold' }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '2px solid #e5e7eb', 
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      padding: '12px'
                    }}
                    formatter={(value: any) => formatCurrency(value)}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg dark:bg-neutral-900 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black uppercase text-gray-900 mb-1 dark:text-neutral-100">Top Products</h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase dark:text-neutral-400">By Revenue</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <TrendingUpIcon className="text-green-600" size={24} />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={productSales.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="product_name" 
                    tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 'bold' }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '2px solid #e5e7eb', 
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      padding: '12px'
                    }}
                    formatter={(value: any) => formatCurrency(value)}
                  />
                  <Bar dataKey="revenue" fill="#10b981" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* PERFORMANCE TAB CONTENT */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/40 dark:to-blue-950/40 border-2 border-green-200 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="text-white" size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase text-gray-900 dark:text-neutral-100">Performance Metrics</h2>
                <p className="text-sm text-gray-600 font-bold uppercase tracking-widest dark:text-neutral-300">System Health & Optimization</p>
              </div>
            </div>

            {/* PERFORMANCE METRICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg dark:bg-neutral-900 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="text-green-600" size={24} />
                  </div>
                  <span className="text-xs font-black text-green-600 uppercase dark:text-green-300">Healthy</span>
                </div>
                <p className="text-sm font-bold text-gray-600 uppercase mb-2 dark:text-neutral-300">System Status</p>
                <p className="text-2xl font-black text-gray-900 dark:text-neutral-100">Operational</p>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-gray-600 dark:text-neutral-300">All systems normal</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg dark:bg-neutral-900 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Activity className="text-blue-600" size={24} />
                  </div>
                  <span className="text-xs font-black text-blue-600 uppercase dark:text-blue-300">Active</span>
                </div>
                <p className="text-sm font-bold text-gray-600 uppercase mb-2 dark:text-neutral-300">Orders Today</p>
                <p className="text-2xl font-black text-gray-900 dark:text-neutral-100">{formatNumber(stats.orders_today)}</p>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-green-600" />
                    <span className="text-xs font-bold text-gray-600 dark:text-neutral-300">
                      {((stats?.orders_change || 0) > 0 ? '+' : '')}{(stats?.orders_change || 0).toFixed(1)}% vs yesterday
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg dark:bg-neutral-900 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Users className="text-purple-600" size={24} />
                  </div>
                  <span className="text-xs font-black text-purple-600 uppercase dark:text-purple-300">Growing</span>
                </div>
                <p className="text-sm font-bold text-gray-600 uppercase mb-2 dark:text-neutral-300">New Users (Month)</p>
                <p className="text-2xl font-black text-gray-900 dark:text-neutral-100">{formatNumber(stats.new_users_this_month || 0)}</p>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-green-600" />
                    <span className="text-xs font-bold text-gray-600 dark:text-neutral-300">
                      {stats.user_growth ? `${parseFloat(stats.user_growth) >= 0 ? '+' : ''}${parseFloat(stats.user_growth).toFixed(1)}%` : '0%'} growth
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg dark:bg-neutral-900 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Package className="text-orange-600" size={24} />
                  </div>
                  <span className="text-xs font-black text-orange-600 uppercase dark:text-orange-300">Stock</span>
                </div>
                <p className="text-sm font-bold text-gray-600 uppercase mb-2 dark:text-neutral-300">Available Codes</p>
                <p className="text-2xl font-black text-gray-900 dark:text-neutral-100">{formatNumber(stats.available_codes)}</p>
                {(() => {
                  const total = (stats.available_codes || 0) + (stats.sold_codes || 0);
                  const pct = total > 0 ? (stats.available_codes / total) * 100 : 0;
                  return (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-neutral-800">
                        <div className="bg-orange-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-600 mt-2 block dark:text-neutral-300">
                        {total > 0 ? `${pct.toFixed(1)}% available` : 'No codes in stock'}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* STATUS BREAKDOWN IN PERFORMANCE */}
            {statusChartData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg dark:bg-neutral-900 dark:border-neutral-800">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-black uppercase text-gray-900 mb-1 dark:text-neutral-100">Order Status</h2>
                      <p className="text-[10px] text-gray-500 font-bold uppercase dark:text-neutral-400">Distribution</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                      <BarChart3 className="text-blue-600" size={24} />
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '2px solid #e5e7eb', 
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      />
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend 
                        wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                        iconType="circle"
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>

                {paymentChartData.length > 0 && (
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg dark:bg-neutral-900 dark:border-neutral-800">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-black uppercase text-gray-900 mb-1 dark:text-neutral-100">Payment Status</h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase dark:text-neutral-400">Distribution</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                        <PieChart className="text-green-600" size={24} />
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            border: '2px solid #e5e7eb', 
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        />
                        <Pie
                          data={paymentChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {paymentChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend 
                          wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                          iconType="circle"
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
