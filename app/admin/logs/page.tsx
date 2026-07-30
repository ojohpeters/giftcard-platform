"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Search, Filter, Calendar, User, RefreshCw, Loader2, ChevronLeft, ChevronRight, Eye, X } from "lucide-react";
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

interface ActionLog {
  id: number;
  admin_email: string;
  action_type: string;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
}

interface PaginationInfo {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  total_pages: number;
}

const ACTION_TYPE_COLORS: Record<string, string> = {
  'product_create': 'bg-green-50 text-green-600 border-green-200 dark:bg-green-950/40 dark:text-green-300',
  'product_update': 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300',
  'product_delete': 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-300',
  'order_update': 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300',
  'order_export': 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300',
  'order_codes_view': 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300',
  'code_upload': 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300',
  'code_send': 'bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300',
  'rate_update': 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300',
  'discount_create': 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
  'user_update': 'bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300',
  'catalog_sync': 'bg-teal-50 text-teal-600 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300',
};

const ACTION_TYPE_LABELS: Record<string, string> = {
  'product_create': 'Product Created',
  'product_update': 'Product Updated',
  'product_delete': 'Product Deleted',
  'order_update': 'Order Updated',
  'order_export': 'Orders Exported',
  'order_codes_view': 'Codes Viewed',
  'code_upload': 'Codes Uploaded',
  'code_send': 'Code Sent',
  'rate_update': 'Rate Updated',
  'discount_create': 'Discount Created',
  'user_update': 'User Updated',
  'catalog_sync': 'Catalog Synced',
};

export default function AdminLogsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('all');
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<ActionLog | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    if (!user?.is_staff) {
      router.push('/dashboard');
      return;
    }
    loadLogs();
  }, [user, router, actionTypeFilter, currentPage, startDate, endDate]);

  const loadLogs = async (page: number = 1) => {
    try {
      setLoading(true);
      const params: any = { page };
      if (actionTypeFilter !== 'all') params.action_type = actionTypeFilter;
      if (searchTerm) params.search = searchTerm;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await adminAPI.getActionLogs(params);
      const data = response.data;
      
      if (data.results) {
        setLogs(data.results);
        if (data.count !== undefined) {
          setPagination({
            count: data.count,
            next: data.next,
            previous: data.previous,
            page: page,
            total_pages: Math.ceil(data.count / 50)
          });
        }
      } else {
        setLogs(Array.isArray(data) ? data : []);
        setPagination(null);
      }
    } catch (error: any) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm) {
        setCurrentPage(1);
        loadLogs(1);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const formatMetadata = (metadata: Record<string, any>): string => {
    if (!metadata || Object.keys(metadata).length === 0) return '—';
    return JSON.stringify(metadata, null, 2);
  };

  if (loading && logs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 dark:text-neutral-500 font-bold uppercase tracking-widest">Loading Logs...</p>
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
            Action Logs<span className="text-blue-600">.</span>
          </h1>
          <p className="text-[10px] md:text-[11px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-[0.4em] mt-2">
            Audit Trail & Security Logs
          </p>
        </div>
        <button
          onClick={() => loadLogs(currentPage)}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-xs hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Refresh
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs by description or admin email..."
              className="w-full bg-white dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-600 text-sm dark:text-neutral-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400 dark:text-neutral-500" />
            <select
              value={actionTypeFilter}
              onChange={(e) => {
                setActionTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-2xl py-4 px-4 outline-none focus:border-blue-600 text-sm font-bold uppercase text-xs dark:text-neutral-100"
            >
              <option value="all">All Actions</option>
              {Object.entries(ACTION_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                setStartDate(weekAgo);
                setEndDate(today);
                setCurrentPage(1);
              }}
              className="px-4 py-4 bg-white dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-2xl text-gray-600 dark:text-neutral-300 hover:border-gray-300 transition-all text-xs font-bold uppercase flex items-center gap-2"
            >
              <Calendar size={18} />
              Last 7 Days
            </button>
          </div>
        </div>

        {/* DATE RANGE FILTER */}
        {(startDate || endDate) && (
          <div className="bg-gray-50 dark:bg-neutral-900 border-2 border-gray-200 dark:border-neutral-700 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 animate-in slide-in-from-top">
            <div className="flex items-center gap-2 flex-1">
              <label className="text-xs font-black uppercase text-gray-600 dark:text-neutral-300 whitespace-nowrap">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 bg-white dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl py-2 px-4 outline-none focus:border-blue-600 text-sm dark:text-neutral-100"
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <label className="text-xs font-black uppercase text-gray-600 dark:text-neutral-300 whitespace-nowrap">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 bg-white dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl py-2 px-4 outline-none focus:border-blue-600 text-sm dark:text-neutral-100"
              />
            </div>
            <button
              onClick={clearDateFilter}
              className="px-4 py-2 bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 rounded-xl font-black uppercase text-xs hover:bg-gray-300 dark:hover:bg-neutral-700 transition-all flex items-center gap-2"
            >
              <X size={14} />
              Clear
            </button>
          </div>
        )}
      </div>

      {/* LOGS TABLE */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-[32px] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead className="bg-gray-50 dark:bg-neutral-800 border-b-2 border-gray-200 dark:border-neutral-700">
              <tr>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500">Time</th>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500">Admin</th>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500">Action</th>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500">Description</th>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400 dark:text-neutral-500" />
                      <span className="text-xs text-gray-600 dark:text-neutral-300">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-400 dark:text-neutral-500" />
                      <span className="text-xs font-bold text-gray-700 dark:text-neutral-300">{log.admin_email || 'System'}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${
                      ACTION_TYPE_COLORS[log.action_type] || 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700'
                    }`}>
                      {ACTION_TYPE_LABELS[log.action_type] || log.action_type}
                    </span>
                  </td>
                  <td className="p-6">
                    <p className="text-sm text-gray-700 dark:text-neutral-300 max-w-md truncate" title={log.description}>
                      {log.description}
                    </p>
                  </td>
                  <td className="p-6">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase">No logs found</p>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between bg-white border-2 border-gray-200 rounded-2xl p-4">
          <div className="text-sm font-black text-gray-600">
            Showing page {pagination.page} of {pagination.total_pages} ({pagination.count} total logs)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (pagination.previous) {
                  setCurrentPage(currentPage - 1);
                  loadLogs(currentPage - 1);
                }
              }}
              disabled={!pagination.previous || loading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-black uppercase text-xs hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                let pageNum;
                if (pagination.total_pages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.total_pages - 2) {
                  pageNum = pagination.total_pages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => {
                      setCurrentPage(pageNum);
                      loadLogs(pageNum);
                    }}
                    disabled={loading}
                    className={`px-4 py-2 rounded-xl font-black uppercase text-xs transition-all ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => {
                if (pagination.next) {
                  setCurrentPage(currentPage + 1);
                  loadLogs(currentPage + 1);
                }
              }}
              disabled={!pagination.next || loading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-black uppercase text-xs hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">Log Details</h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase text-gray-400 mb-1 block">Action Type</label>
                <span className={`text-sm font-black px-3 py-2 rounded-full border inline-block ${
                  ACTION_TYPE_COLORS[selectedLog.action_type] || 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700'
                }`}>
                  {ACTION_TYPE_LABELS[selectedLog.action_type] || selectedLog.action_type}
                </span>
              </div>
              <div>
                <label className="text-xs font-black uppercase text-gray-400 mb-1 block">Admin</label>
                <p className="text-sm font-bold text-gray-700">{selectedLog.admin_email || 'System'}</p>
              </div>
              <div>
                <label className="text-xs font-black uppercase text-gray-400 mb-1 block">Description</label>
                <p className="text-sm text-gray-700">{selectedLog.description}</p>
              </div>
              <div>
                <label className="text-xs font-black uppercase text-gray-400 mb-1 block">Timestamp</label>
                <p className="text-sm text-gray-700">{new Date(selectedLog.created_at).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-xs font-black uppercase text-gray-400 mb-1 block">Metadata</label>
                <pre className="text-xs bg-gray-50 border-2 border-gray-200 rounded-xl p-4 overflow-x-auto text-gray-700">
                  {formatMetadata(selectedLog.metadata)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
