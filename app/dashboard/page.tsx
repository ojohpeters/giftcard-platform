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
  CheckCircle2
} from "lucide-react";
import { useAuthStore } from '@/store/authStore';
import { ordersAPI, referralsAPI } from '@/lib/api';
import Link from 'next/link';
import { formatIQDShort } from '@/lib/currency';

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [orders, setOrders] = useState<any[]>([]);
  const [referralStats, setReferralStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/dashboard');
      return;
    }
    loadData();
  }, [isAuthenticated, router]);

  const loadData = async () => {
    try {
      const [ordersRes, referralsRes] = await Promise.all([
        ordersAPI.list(),
        referralsAPI.getStats(),
      ]);
      setOrders(ordersRes.data.results || ordersRes.data || []);
      setReferralStats(referralsRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = async () => {
    if (user?.referral_code) {
      await navigator.clipboard.writeText(user.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
          <p className="text-gray-400 font-bold uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  const totalOrders = orders.length;
  const completedOrders = orders.filter((o: any) => o.status === 'completed').length;
  const totalSpent = orders
    .filter((o: any) => o.status === 'completed')
    .reduce((sum: number, o: any) => sum + parseFloat(o.total || '0'), 0);

  const stats = [
    { 
      label: "Total Orders", 
      value: totalOrders.toString(), 
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    { 
      label: "Completed", 
      value: completedOrders.toString(), 
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    { 
      label: "Total Spent", 
      value: `${formatIQDShort(totalSpent)} IQD`, 
      icon: TrendingUp,
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
          <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.4em]">Dashboard</p>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter italic uppercase leading-none">
          Welcome<span className="text-gray-200">,</span> {user?.first_name || 'User'}
        </h1>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border-2 border-black p-6 rounded-[32px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} p-3 rounded-2xl`}>
                <stat.icon className={`${stat.color} w-6 h-6`} />
              </div>
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">{stat.label}</p>
            <p className="text-3xl font-black tracking-tighter leading-none">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* RECENT ORDERS */}
      <div className="bg-white border-4 border-black rounded-[32px] overflow-hidden shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
        <div className="p-6 md:p-8 border-b-4 border-black bg-gray-50 flex justify-between items-center">
          <h2 className="font-black uppercase italic text-lg md:text-2xl">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-blue-600 hover:text-blue-700 font-black uppercase text-xs tracking-widest flex items-center gap-2">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="divide-y-2 divide-black">
          {orders.slice(0, 5).map((order: any) => (
            <div key={order.id} className="p-5 md:p-8 group transition-colors hover:bg-gray-50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-2xl font-black italic">
                    #{order.id}
                  </div>
                  <div>
                    <p className="font-black italic text-lg md:text-xl leading-none">Order #{order.id}</p>
                    <p className="text-[9px] font-black text-gray-400 uppercase mt-1 tracking-widest">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[8px] font-black uppercase text-gray-400 mb-1">Total</p>
                    <p className="font-black text-xl md:text-2xl italic">{formatIQDShort(order.total_iqd || '0')} IQD</p>
                  </div>
                  <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                    order.status === 'completed' ? 'bg-green-400' : 
                    order.status === 'pending' ? 'bg-orange-400' : 
                    'bg-red-400'
                  }`}>
                    {order.status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 font-black uppercase tracking-widest">No orders yet</p>
              <Link href="/marketplace" className="text-blue-600 hover:underline mt-2 inline-block">
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* REFERRAL SECTION */}
      {referralStats && (
        <div className="bg-white border-4 border-black rounded-[32px] p-6 md:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3 mb-6">
            <Gift className="text-blue-600 w-6 h-6" />
            <h2 className="font-black uppercase italic text-xl md:text-2xl">Referral Program</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Your Referral Code</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-50 border-2 border-black p-4 rounded-2xl font-black text-lg tracking-widest">
                  {user?.referral_code || 'N/A'}
                </div>
                <button
                  onClick={copyReferralCode}
                  className="p-4 bg-black text-white rounded-2xl hover:bg-blue-600 transition-all"
                >
                  {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                </button>
              </div>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Referral Stats</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-600">Total Referrals</span>
                  <span className="text-2xl font-black">{referralStats.total_referrals || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-600">Total Earnings</span>
                  <span className="text-2xl font-black text-green-600">{formatIQDShort(referralStats.total_earnings || '0')} IQD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
