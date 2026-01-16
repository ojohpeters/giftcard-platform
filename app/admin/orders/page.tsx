"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Search, Eye, CheckCircle2, Clock, XCircle, Filter } from "lucide-react";
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

interface Order {
  id: number;
  order_number: string;
  user: { email: string; first_name: string; last_name: string };
  status: string;
  payment_status: string;
  total: string;
  currency: string;
  created_at: string;
  items: Array<{
    product: { name_en: string };
    quantity: number;
    total: string;
  }>;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    if (!user?.is_staff) {
      router.push('/dashboard');
      return;
    }
    loadOrders();
  }, [user, router]);

  const loadOrders = async () => {
    try {
      const response = await adminAPI.getAllOrders();
      setOrders(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'cancelled':
        return 'bg-red-50 text-red-600 border-red-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle2 size={14} />;
      case 'pending':
        return <Clock size={14} />;
      case 'cancelled':
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-bold uppercase tracking-widest">Loading Orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
            Orders<span className="text-blue-600">.</span>
          </h1>
          <p className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-[0.4em] mt-2">
            Manage All Orders
          </p>
        </div>
      </div>

      {/* BULK ACTIONS BAR */}
      {selectedOrders.length > 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-top">
          <div className="flex items-center gap-3">
            <span className="text-sm font-black text-blue-900">
              {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Bulk update status logic here
                alert(`Marking ${selectedOrders.length} orders as completed`);
                setSelectedOrders([]);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-black uppercase text-xs hover:bg-blue-700 transition-all"
            >
              Mark Completed
            </button>
            <button
              onClick={() => {
                // Bulk export logic here
                alert(`Exporting ${selectedOrders.length} orders`);
                setSelectedOrders([]);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-xl font-black uppercase text-xs hover:bg-green-700 transition-all"
            >
              Export Selected
            </button>
            <button
              onClick={() => setSelectedOrders([])}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-black uppercase text-xs hover:bg-gray-300 transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order number or email..."
            className="w-full bg-white border-2 border-gray-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-600 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border-2 border-gray-200 rounded-2xl py-4 px-4 outline-none focus:border-blue-600 text-sm font-bold uppercase text-xs"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-white border border-gray-200 rounded-[32px] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrders(filteredOrders.map(o => o.id));
                      } else {
                        setSelectedOrders([]);
                      }
                    }}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400">Order #</th>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400">Customer</th>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400">Items</th>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400">Total</th>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400">Date</th>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-6">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrders([...selectedOrders, order.id]);
                        } else {
                          setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                        }
                      }}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-6">
                    <span className="text-sm font-black tabular-nums">#{order.order_number || order.id}</span>
                  </td>
                  <td className="p-6">
                    <div>
                      <p className="text-sm font-black">{order.user.first_name} {order.user.last_name}</p>
                      <p className="text-[9px] text-gray-400">{order.user.email}</p>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="space-y-1">
                      {order.items?.slice(0, 2).map((item, idx) => (
                        <p key={idx} className="text-xs font-bold text-gray-600">
                          {item.product.name_en} × {item.quantity}
                        </p>
                      ))}
                      {order.items && order.items.length > 2 && (
                        <p className="text-[9px] text-gray-400">+{order.items.length - 2} more</p>
                      )}
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-sm font-black tabular-nums">
                      {order.currency === 'USD' ? `$${order.total}` : `${order.total} IQD`}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className={`text-[9px] font-black px-2 py-1 rounded-full border flex items-center gap-1 w-fit ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className="text-[9px] text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-6">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all"
                    >
                      <Eye size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}

