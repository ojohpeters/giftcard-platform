"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Package
} from "lucide-react";
import { ordersAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { formatIQDShort } from '@/lib/currency';

export default function OrdersPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/dashboard/orders');
      return;
    }
    loadOrders();
  }, [isAuthenticated, router]);

  const loadOrders = async () => {
    try {
      const response = await ordersAPI.list();
      setOrders(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order: any) =>
    order.id.toString().includes(searchTerm) ||
    order.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-[24px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 px-4 md:px-0 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-1 w-4 bg-blue-600"></div>
            <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.4em]">Transaction Logs</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter italic uppercase leading-none">
            Orders<span className="text-gray-200">/</span>History
          </h1>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative group flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-black transition-colors" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="SEARCH ID..." 
              className="bg-gray-50 border border-gray-100 py-3 pl-11 pr-4 rounded-xl text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all w-full md:w-64"
            />
          </div>
          <button className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-black hover:text-white transition-all shadow-sm">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Order ID</th>
              <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Date</th>
              <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Items</th>
              <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Total</th>
              <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredOrders.map((order: any) => (
              <tr key={order.id} className="group hover:bg-gray-50/50 transition-colors cursor-pointer">
                <td className="px-8 py-6">
                  <p className="text-[11px] font-black text-gray-900 tracking-wider font-mono uppercase">#{order.id}</p>
                </td>
                <td className="px-8 py-6">
                  <p className="text-[9px] font-medium text-gray-400 uppercase tracking-tight">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </td>
                <td className="px-8 py-6">
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-800">
                    {order.items?.length || 0} item(s)
                  </p>
                </td>
                <td className="px-8 py-6">
                  <p className="text-sm font-black text-gray-900 tabular-nums tracking-tighter">{formatIQDShort(order.total_iqd || '0')} IQD</p>
                </td>
                <td className="px-8 py-6 text-center">
                  <StatusBadge status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-black uppercase tracking-widest">No orders found</p>
          </div>
        )}
      </div>

      {/* MOBILE CARD VIEW */}
      <div className="md:hidden space-y-4">
        {filteredOrders.map((order: any) => (
          <div key={order.id} className="bg-white border border-gray-100 p-5 rounded-[24px] space-y-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-900">Order #{order.id}</p>
                <p className="text-[9px] font-mono font-bold text-gray-400 mt-1">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div className="flex items-end justify-between border-t border-gray-50 pt-4">
              <div>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Total</p>
                <p className="text-xl font-black text-gray-900 tracking-tighter italic">{formatIQDShort(order.total_iqd || '0')} IQD</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-gray-400 uppercase">{order.items?.length || 0} item(s)</p>
              </div>
            </div>
          </div>
        ))}
        {filteredOrders.length === 0 && (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-black uppercase tracking-widest">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    completed: {
      bg: "bg-green-50 text-green-600 border-green-100",
      text: "Completed",
      icon: <CheckCircle2 size={10} />
    },
    pending: {
      bg: "bg-orange-50 text-orange-600 border-orange-100",
      text: "Pending",
      icon: <Clock size={10} />
    },
    cancelled: {
      bg: "bg-red-50 text-red-600 border-red-100",
      text: "Cancelled",
      icon: <XCircle size={10} />
    },
  };

  const statusInfo = statusMap[status?.toLowerCase()] || statusMap.pending;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[8px] md:text-[9px] font-black uppercase tracking-widest ${statusInfo.bg}`}>
      {statusInfo.icon}
      {statusInfo.text}
    </div>
  );
}
