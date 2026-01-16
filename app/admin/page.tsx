"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Target,
  Award,
  Clock,
  AlertCircle,
  Bell,
  Filter,
  Calendar,
  TrendingUp as TrendingUpIcon,
  Percent,
  Repeat,
  Sparkles,
  Eye,
  FileText,
  Settings,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle
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
  user_growth?: string;
  new_users_this_month?: number;
  status_breakdown?: Record<string, number>;
  payment_breakdown?: Record<string, number>;
  top_categories?: Array<{category__name_en: string; count: number; revenue: string}>;
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const revenueChange = useMemo(() => {
    if (!stats) return 0;
    const today = parseFloat(stats.revenue_today);
    const yesterday = parseFloat(stats.revenue_this_week) - today;
    return calculateChange(today, yesterday);
  }, [stats]);

  const ordersChange = useMemo(() => {
    if (!stats) return 0;
    const today = stats.orders_today;
    const yesterday = stats.orders_this_week - today;
    return calculateChange(today, yesterday);
  }, [stats]);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-3xl shadow-xl border border-red-200">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-bold uppercase text-lg">{error}</p>
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
      <div className="flex gap-2 border-b-2 border-gray-200 bg-white rounded-t-3xl p-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-black uppercase text-xs tracking-widest transition-all border-b-2 rounded-t-xl ${
            activeTab === 'overview'
              ? 'text-blue-600 border-blue-600 bg-blue-50'
              : 'text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-6 py-3 font-black uppercase text-xs tracking-widest transition-all border-b-2 rounded-t-xl ${
            activeTab === 'analytics'
              ? 'text-blue-600 border-blue-600 bg-blue-50'
              : 'text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-6 py-3 font-black uppercase text-xs tracking-widest transition-all border-b-2 rounded-t-xl ${
            activeTab === 'performance'
              ? 'text-blue-600 border-blue-600 bg-blue-50'
              : 'text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50'
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
        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <DollarSign className="text-white" size={28} />
            </div>
            {revenueChange !== 0 && (
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${
                revenueChange > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {revenueChange > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {Math.abs(revenueChange).toFixed(1)}%
              </div>
            )}
          </div>
          <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-2">Total Revenue</p>
          <p className="text-3xl font-black tracking-tighter tabular-nums text-gray-900 mb-3">{formatCurrency(stats.total_revenue)}</p>
          <div className="pt-3 border-t-2 border-green-200 space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-green-600 font-bold">AOV:</span>
              <span className="font-black text-gray-900">{stats.avg_order_value ? formatCurrency(stats.avg_order_value) : 'N/A'}</span>
            </div>
            {stats.revenue_growth && (
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-green-600 font-bold">Growth:</span>
                <span className={`font-black ${parseFloat(stats.revenue_growth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(stats.revenue_growth) >= 0 ? '+' : ''}{parseFloat(stats.revenue_growth).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <ShoppingBag className="text-white" size={28} />
            </div>
            {ordersChange !== 0 && (
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${
                ordersChange > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {ordersChange > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {Math.abs(ordersChange).toFixed(1)}%
              </div>
            )}
          </div>
          <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-2">Total Orders</p>
          <p className="text-3xl font-black tracking-tighter tabular-nums text-gray-900 mb-3">{formatNumber(stats.total_orders)}</p>
          <div className="pt-3 border-t-2 border-blue-200 space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-blue-600 font-bold">Conversion:</span>
              <span className="font-black text-gray-900">{stats.conversion_rate ? `${parseFloat(stats.conversion_rate).toFixed(1)}%` : 'N/A'}</span>
            </div>
            {stats.orders_growth && (
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-blue-600 font-bold">Growth:</span>
                <span className={`font-black ${parseFloat(stats.orders_growth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(stats.orders_growth) >= 0 ? '+' : ''}{parseFloat(stats.orders_growth).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Users className="text-white" size={28} />
            </div>
            {stats.user_growth && (
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${
                parseFloat(stats.user_growth) >= 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {parseFloat(stats.user_growth) >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {Math.abs(parseFloat(stats.user_growth)).toFixed(1)}%
              </div>
            )}
          </div>
          <p className="text-[10px] font-black text-purple-700 uppercase tracking-widest mb-2">Total Users</p>
          <p className="text-3xl font-black tracking-tighter tabular-nums text-gray-900 mb-3">{formatNumber(stats.total_users)}</p>
          <div className="pt-3 border-t-2 border-purple-200 space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-purple-600 font-bold">CLV:</span>
              <span className="font-black text-gray-900">{stats.customer_lifetime_value ? formatCurrency(stats.customer_lifetime_value) : 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-purple-600 font-bold">New (Month):</span>
              <span className="font-black text-gray-900">{stats.new_users_this_month || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Package className="text-white" size={28} />
            </div>
          </div>
          <p className="text-[10px] font-black text-orange-700 uppercase tracking-widest mb-2">Products</p>
          <p className="text-3xl font-black tracking-tighter tabular-nums text-gray-900 mb-3">{formatNumber(stats.total_products)}</p>
          <div className="pt-3 border-t-2 border-orange-200 space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-orange-600 font-bold">Available:</span>
              <span className="font-black text-gray-900">{formatNumber(stats.available_codes)}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-orange-600 font-bold">Sold:</span>
              <span className="font-black text-gray-900">{formatNumber(stats.sold_codes)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ADVANCED METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Target className="text-blue-600" size={24} />
            </div>
            <h3 className="text-sm font-black uppercase text-gray-900">Conversion</h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Rate</span>
                <span className="text-2xl font-black text-gray-900">{stats.conversion_rate ? `${parseFloat(stats.conversion_rate).toFixed(1)}%` : 'N/A'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(parseFloat(stats.conversion_rate || '0'), 100)}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-500 font-bold">Repeat Rate</span>
              <span className="font-black text-gray-900">{stats.repeat_customer_rate ? `${parseFloat(stats.repeat_customer_rate).toFixed(1)}%` : 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <Award className="text-green-600" size={24} />
            </div>
            <h3 className="text-sm font-black uppercase text-gray-900">Referrals</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Total</span>
              <span className="text-2xl font-black text-gray-900">{formatNumber(stats.total_referrals)}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-500 font-bold">Rewards Paid</span>
              <span className="font-black text-gray-900">{formatCurrency(stats.referral_rewards_paid)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
              <Zap className="text-yellow-600" size={24} />
            </div>
            <h3 className="text-sm font-black uppercase text-gray-900">Discounts</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Active</span>
              <span className="text-2xl font-black text-gray-900">{stats.active_discounts}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-500 font-bold">Total Usage</span>
              <span className="font-black text-gray-900">{formatNumber(stats.discount_usage_count)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Download className="text-purple-600" size={24} />
            </div>
            <h3 className="text-sm font-black uppercase text-gray-900">Quick Export</h3>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => handleExport('orders')}
              className="w-full py-2.5 bg-blue-50 text-blue-600 rounded-xl font-black uppercase text-xs hover:bg-blue-100 transition-all border-2 border-blue-200"
            >
              <Download size={14} className="inline mr-2" />
              Orders CSV
            </button>
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
        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black uppercase text-gray-900 mb-1">Revenue Trend</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Last {timeRange} Days</p>
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

        {/* Product Sales Chart - Enhanced */}
        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black uppercase text-gray-900 mb-1">Top Products</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase">By Revenue</p>
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

      {/* STATUS BREAKDOWN CHARTS */}
      {statusChartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black uppercase text-gray-900 mb-1">Order Status</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase">Distribution</p>
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
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black uppercase text-gray-900 mb-1">Payment Status</h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Distribution</p>
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
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
      <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-3xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black uppercase text-gray-900 mb-1">Period Comparison</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase">Revenue & Orders</p>
          </div>
          <Calendar className="text-gray-400" size={24} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Today</p>
            <p className="text-3xl font-black tabular-nums text-gray-900 mb-2">{formatCurrency(stats.revenue_today)}</p>
            <div className="flex items-center gap-2 text-[10px]">
              <ShoppingBag size={14} className="text-gray-400" />
              <span className="text-gray-600 font-bold">{stats.orders_today} orders</span>
            </div>
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">This Week</p>
            <p className="text-3xl font-black tabular-nums text-gray-900 mb-2">{formatCurrency(stats.revenue_this_week)}</p>
            <div className="flex items-center gap-2 text-[10px]">
              <ShoppingBag size={14} className="text-gray-400" />
              <span className="text-gray-600 font-bold">{stats.orders_this_week} orders</span>
            </div>
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">This Month</p>
            <p className="text-3xl font-black tabular-nums text-gray-900 mb-2">{formatCurrency(stats.revenue_this_month)}</p>
            <div className="flex items-center gap-2 text-[10px]">
              <ShoppingBag size={14} className="text-gray-400" />
              <span className="text-gray-600 font-bold">{stats.orders_this_month} orders</span>
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
                action: 'Exchange rate updated to 1310.00 IQD',
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
          <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg">
            <h3 className="text-lg font-black uppercase text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="text-white" size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Pending Orders</p>
                    <p className="text-xl font-black text-gray-900">{stats.status_breakdown?.pending || 0}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="text-white" size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Completed Today</p>
                    <p className="text-xl font-black text-gray-900">{stats.orders_today}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                    <UserPlus className="text-white" size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">New Users</p>
                    <p className="text-xl font-black text-gray-900">{stats.new_users_this_month || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/orders" className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-600 hover:shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-3">
            <ShoppingBag className="text-blue-600 group-hover:scale-110 transition-transform" size={24} />
            <ChevronRight className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={20} />
          </div>
          <h3 className="font-black uppercase text-sm text-gray-900 mb-1">View Orders</h3>
          <p className="text-[10px] text-gray-500 font-bold">Manage all orders</p>
        </Link>
        <Link href="/admin/users" className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-purple-600 hover:shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-3">
            <Users className="text-purple-600 group-hover:scale-110 transition-transform" size={24} />
            <ChevronRight className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" size={20} />
          </div>
          <h3 className="font-black uppercase text-sm text-gray-900 mb-1">Manage Users</h3>
          <p className="text-[10px] text-gray-500 font-bold">User accounts</p>
        </Link>
        <Link href="/admin/products" className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-orange-600 hover:shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-3">
            <Package className="text-orange-600 group-hover:scale-110 transition-transform" size={24} />
            <ChevronRight className="text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" size={20} />
          </div>
          <h3 className="font-black uppercase text-sm text-gray-900 mb-1">Products</h3>
          <p className="text-[10px] text-gray-500 font-bold">Manage inventory</p>
        </Link>
        <Link href="/admin/settings" className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-2xl p-6 hover:border-blue-600 hover:shadow-xl transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full -mr-10 -mt-10 opacity-50" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <DollarSign className="text-blue-600 group-hover:scale-110 transition-transform" size={24} />
            <ChevronRight className="text-blue-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={20} />
          </div>
          <h3 className="font-black uppercase text-sm text-gray-900 mb-1 relative z-10">Exchange Rate</h3>
          <p className="text-[10px] text-blue-600 font-bold relative z-10">Update USD/IQD rate</p>
        </Link>
      </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* ANALYTICS TAB CONTENT */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="text-white" size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase text-gray-900">Deep Analytics</h2>
                <p className="text-sm text-gray-600 font-bold uppercase tracking-widest">Advanced Insights & Trends</p>
              </div>
            </div>

            {/* ANALYTICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="text-blue-600" size={24} />
                  </div>
                  <span className="text-xs font-black text-gray-400 uppercase">Growth Rate</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-600">Revenue</span>
                    <span className={`text-xl font-black ${stats.revenue_growth && parseFloat(stats.revenue_growth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.revenue_growth ? `${parseFloat(stats.revenue_growth) >= 0 ? '+' : ''}${parseFloat(stats.revenue_growth).toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-600">Orders</span>
                    <span className={`text-xl font-black ${stats.orders_growth && parseFloat(stats.orders_growth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.orders_growth ? `${parseFloat(stats.orders_growth) >= 0 ? '+' : ''}${parseFloat(stats.orders_growth).toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-600">Users</span>
                    <span className={`text-xl font-black ${stats.user_growth && parseFloat(stats.user_growth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.user_growth ? `${parseFloat(stats.user_growth) >= 0 ? '+' : ''}${parseFloat(stats.user_growth).toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Target className="text-green-600" size={24} />
                  </div>
                  <span className="text-xs font-black text-gray-400 uppercase">Conversion</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-gray-600">Rate</span>
                      <span className="text-2xl font-black text-gray-900">
                        {stats.conversion_rate ? `${parseFloat(stats.conversion_rate).toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-600 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(parseFloat(stats.conversion_rate || '0'), 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-bold">Repeat Customers</span>
                    <span className="font-black text-gray-900">
                      {stats.repeat_customer_rate ? `${parseFloat(stats.repeat_customer_rate).toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Award className="text-purple-600" size={24} />
                  </div>
                  <span className="text-xs font-black text-gray-400 uppercase">Customer Value</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Lifetime Value</span>
                    <span className="text-2xl font-black text-gray-900">
                      {stats.customer_lifetime_value ? formatCurrency(stats.customer_lifetime_value) : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Avg Order Value</span>
                    <span className="text-xl font-black text-gray-900">
                      {stats.avg_order_value ? formatCurrency(stats.avg_order_value) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* TOP CATEGORIES */}
            {stats.top_categories && stats.top_categories.length > 0 && (
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-black uppercase text-gray-900 mb-6 flex items-center gap-3">
                  <Package className="text-blue-600" size={24} />
                  Top Categories
                </h3>
                <div className="space-y-4">
                  {stats.top_categories.map((cat, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center font-black text-blue-600">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-gray-900 uppercase">{cat.category__name_en || 'Uncategorized'}</p>
                          <p className="text-xs text-gray-500 font-bold">{cat.count} orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-gray-900">{formatCurrency(cat.revenue)}</p>
                        <p className="text-xs text-gray-500 font-bold">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* CHARTS IN ANALYTICS TAB */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black uppercase text-gray-900 mb-1">Revenue Trend</h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Last {timeRange} Days</p>
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

            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black uppercase text-gray-900 mb-1">Top Products</h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">By Revenue</p>
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
          <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="text-white" size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase text-gray-900">Performance Metrics</h2>
                <p className="text-sm text-gray-600 font-bold uppercase tracking-widest">System Health & Optimization</p>
              </div>
            </div>

            {/* PERFORMANCE METRICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="text-green-600" size={24} />
                  </div>
                  <span className="text-xs font-black text-green-600 uppercase">Healthy</span>
                </div>
                <p className="text-sm font-bold text-gray-600 uppercase mb-2">System Status</p>
                <p className="text-2xl font-black text-gray-900">Operational</p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-gray-600">All systems normal</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Activity className="text-blue-600" size={24} />
                  </div>
                  <span className="text-xs font-black text-blue-600 uppercase">Active</span>
                </div>
                <p className="text-sm font-bold text-gray-600 uppercase mb-2">Orders Today</p>
                <p className="text-2xl font-black text-gray-900">{formatNumber(stats.orders_today)}</p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-green-600" />
                    <span className="text-xs font-bold text-gray-600">
                      {ordersChange > 0 ? '+' : ''}{ordersChange.toFixed(1)}% vs yesterday
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Users className="text-purple-600" size={24} />
                  </div>
                  <span className="text-xs font-black text-purple-600 uppercase">Growing</span>
                </div>
                <p className="text-sm font-bold text-gray-600 uppercase mb-2">New Users (Month)</p>
                <p className="text-2xl font-black text-gray-900">{formatNumber(stats.new_users_this_month || 0)}</p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-green-600" />
                    <span className="text-xs font-bold text-gray-600">
                      {stats.user_growth ? `${parseFloat(stats.user_growth) >= 0 ? '+' : ''}${parseFloat(stats.user_growth).toFixed(1)}%` : '0%'} growth
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Package className="text-orange-600" size={24} />
                  </div>
                  <span className="text-xs font-black text-orange-600 uppercase">Stock</span>
                </div>
                <p className="text-sm font-bold text-gray-600 uppercase mb-2">Available Codes</p>
                <p className="text-2xl font-black text-gray-900">{formatNumber(stats.available_codes)}</p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all"
                      style={{ width: `${(stats.available_codes / (stats.available_codes + stats.sold_codes)) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-600 mt-2 block">
                    {((stats.available_codes / (stats.available_codes + stats.sold_codes)) * 100).toFixed(1)}% available
                  </span>
                </div>
              </div>
            </div>

            {/* STATUS BREAKDOWN IN PERFORMANCE */}
            {statusChartData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-black uppercase text-gray-900 mb-1">Order Status</h2>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Distribution</p>
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
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-black uppercase text-gray-900 mb-1">Payment Status</h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Distribution</p>
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
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
