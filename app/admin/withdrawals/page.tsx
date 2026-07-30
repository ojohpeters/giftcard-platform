"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  Loader2,
  Eye,
  Search,
  CheckCircle,
  Ban,
  X,
  ArrowUpRight,
  Building2
} from "lucide-react";
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatIRRShort } from '@/lib/currency';

interface Withdrawal {
  id: number;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  amount: string;
  currency: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'failed';
  admin_notes?: string;
  processed_by?: {
    email: string;
  };
  processed_at?: string;
  created_at: string;
}

export default function AdminWithdrawalsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [withdrawalToReject, setWithdrawalToReject] = useState<number | null>(null);
  const [stats, setStats] = useState({
    pending: { count: 0, total: '0' },
    processing: { count: 0, total: '0' },
    completed: { count: 0, total: '0' },
    rejected: { count: 0, total: '0' }
  });

  useEffect(() => {
    if (!user?.is_staff) {
      router.push('/dashboard');
      return;
    }
    loadData();
  }, [user, router, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      
      const [withdrawalsRes, statsRes] = await Promise.all([
        adminAPI.getWithdrawals(params),
        adminAPI.getWithdrawalStats()
      ]);
      
      setWithdrawals(withdrawalsRes.data.results || withdrawalsRes.data.withdrawals || withdrawalsRes.data || []);
      setStats(statsRes.data);
    } catch (err: unknown) {
      console.error('Failed to load withdrawals:', err);
      setError('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      setActionLoading(id);
      setError('');
      await adminAPI.approveWithdrawal(id);
      await loadData();
      setSelectedWithdrawal(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      console.error('Failed to approve withdrawal:', err);
      setError(error.response?.data?.error || 'Failed to approve withdrawal');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!withdrawalToReject) return;
    
    try {
      setActionLoading(withdrawalToReject);
      setError('');
      await adminAPI.rejectWithdrawal(withdrawalToReject, rejectReason);
      await loadData();
      setShowRejectModal(false);
      setWithdrawalToReject(null);
      setRejectReason('');
      setSelectedWithdrawal(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      console.error('Failed to reject withdrawal:', err);
      setError(error.response?.data?.error || 'Failed to reject withdrawal');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={12} className="text-yellow-600" />;
      case 'processing': return <Loader2 size={12} className="text-blue-600" />;
      case 'completed': return <CheckCircle2 size={12} className="text-green-600" />;
      case 'rejected': return <XCircle size={12} className="text-red-600" />;
      case 'failed': return <XCircle size={12} className="text-gray-600" />;
      default: return <Clock size={12} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-900';
      case 'processing': return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900';
      case 'completed': return 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-900';
      case 'rejected': return 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900';
      case 'failed': return 'bg-gray-50 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 border-gray-200 dark:border-neutral-700';
      default: return 'bg-gray-50 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 border-gray-200 dark:border-neutral-700';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user?.is_staff) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 px-4 md:px-0 pb-20">
      
      {/* HEADER */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-1 w-4 bg-green-600"></div>
          <p className="text-[11px] font-black text-green-600 uppercase tracking-[0.4em]">Finance</p>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-neutral-100 tracking-tighter italic uppercase leading-none">
          Withdrawals<span className="text-gray-200">.</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 font-medium mt-2">Manage user withdrawal requests</p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-900 rounded-xl p-4">
          <p className="text-[11px] font-bold text-yellow-600 dark:text-yellow-300 uppercase">Pending</p>
          <p className="text-xl font-black text-yellow-700 dark:text-yellow-300">{stats.pending?.count || 0}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-900 rounded-xl p-4">
          <p className="text-[11px] font-bold text-yellow-600 dark:text-yellow-300 uppercase">Pending Amount</p>
          <p className="text-lg font-black text-yellow-700 dark:text-yellow-300">{formatIRRShort(stats.pending?.total || '0')} ت</p>
        </div>
        <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 rounded-xl p-4">
          <p className="text-[11px] font-bold text-green-600 dark:text-green-300 uppercase">Completed</p>
          <p className="text-xl font-black text-green-700 dark:text-green-300">{stats.completed?.count || 0}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 rounded-xl p-4">
          <p className="text-[11px] font-bold text-green-600 dark:text-green-300 uppercase">Completed Amount</p>
          <p className="text-lg font-black text-green-700 dark:text-green-300">{formatIRRShort(stats.completed?.total || '0')} ت</p>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* FILTERS */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-neutral-500" />
            <input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-green-600 text-sm dark:text-neutral-100"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl py-2.5 px-4 outline-none focus:border-green-600 text-sm font-medium dark:text-neutral-100"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={loadData}
            className="px-4 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all"
          >
            Apply
          </button>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && withdrawals.length === 0 && (
        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl p-12 text-center">
          <Wallet className="w-16 h-16 text-gray-300 dark:text-neutral-600 mx-auto mb-4" />
          <p className="text-gray-400 dark:text-neutral-500 font-bold uppercase tracking-widest">No withdrawal requests found</p>
        </div>
      )}

      {/* TABLE VIEW - Responsive */}
      {!loading && withdrawals.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800">
                  <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">ID</th>
                  <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">User</th>
                  <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">Amount</th>
                  <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400 hidden sm:table-cell">Bank</th>
                  <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">Status</th>
                  <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400 hidden md:table-cell">Date</th>
                  <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800 transition-colors">
                    <td className="px-3 py-3">
                      <span className="font-mono text-xs font-bold">#{withdrawal.id}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-medium truncate max-w-[120px] block">{withdrawal.user.email}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-bold text-green-600 whitespace-nowrap">{formatIRRShort(withdrawal.amount)} ت</span>
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <span className="text-xs text-gray-600 dark:text-neutral-300 truncate max-w-[100px] block">{withdrawal.bank_name}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase flex items-center gap-1 w-fit border whitespace-nowrap ${getStatusColor(withdrawal.status)}`}>
                        {getStatusIcon(withdrawal.status)}
                        {withdrawal.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-500 dark:text-neutral-400 whitespace-nowrap">{formatDate(withdrawal.created_at)}</span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedWithdrawal(withdrawal)}
                          className="p-1.5 bg-gray-100 dark:bg-neutral-800 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        {withdrawal.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(withdrawal.id)}
                              disabled={actionLoading === withdrawal.id}
                              className="p-1.5 bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all disabled:opacity-50"
                              title="Approve & Pay"
                            >
                              {actionLoading === withdrawal.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <CheckCircle size={14} />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setWithdrawalToReject(withdrawal.id);
                                setShowRejectModal(true);
                              }}
                              disabled={actionLoading === withdrawal.id}
                              className="p-1.5 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all disabled:opacity-50"
                              title="Reject"
                            >
                              <Ban size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedWithdrawal(null)}
          />
          <div className="relative bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setSelectedWithdrawal(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all"
            >
              <X size={16} />
            </button>

            <h2 className="text-lg font-bold text-gray-900 dark:text-neutral-100 mb-4 pr-8">Withdrawal #{selectedWithdrawal.id}</h2>

            {/* Amount */}
            <div className="bg-green-50 dark:bg-green-950/40 rounded-xl p-4 mb-4 text-center">
              <p className="text-[11px] font-bold text-green-600 dark:text-green-300 uppercase mb-1">Amount</p>
              <p className="text-2xl font-black text-green-700 dark:text-green-300">{formatIRRShort(selectedWithdrawal.amount)} تومان</p>
            </div>

            {/* User Info */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-3">
                <p className="text-[11px] font-bold text-gray-400 dark:text-neutral-500 uppercase mb-1">User</p>
                <p className="text-sm font-medium truncate">{selectedWithdrawal.user.email}</p>
              </div>
              <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-3">
                <p className="text-[11px] font-bold text-gray-400 dark:text-neutral-500 uppercase mb-1">Status</p>
                <span className={`px-2 py-1 rounded-full text-[11px] font-bold uppercase border ${getStatusColor(selectedWithdrawal.status)}`}>
                  {selectedWithdrawal.status}
                </span>
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 size={16} className="text-blue-600" />
                <p className="text-[11px] font-bold text-blue-600 dark:text-blue-300 uppercase">Bank Details</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-neutral-400">Bank Name:</span>
                  <span className="font-medium">{selectedWithdrawal.bank_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-neutral-400">Account Name:</span>
                  <span className="font-medium">{selectedWithdrawal.account_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-neutral-400">Account Number:</span>
                  <span className="font-mono font-medium">{selectedWithdrawal.account_number}</span>
                </div>
              </div>
            </div>

            {/* Admin Notes */}
            {selectedWithdrawal.admin_notes && (
              <div className="mb-4">
                <p className="text-[11px] font-bold text-gray-400 dark:text-neutral-500 uppercase mb-1">Admin Notes</p>
                <p className="bg-yellow-50 dark:bg-yellow-950/40 p-3 rounded-xl text-sm border border-yellow-200 dark:border-yellow-900">{selectedWithdrawal.admin_notes}</p>
              </div>
            )}

            {/* Dates */}
            <div className="text-[11px] text-gray-400 dark:text-neutral-500 mb-4 space-y-1">
              <p>Requested: {formatDate(selectedWithdrawal.created_at)}</p>
              {selectedWithdrawal.processed_at && (
                <p>Processed: {formatDate(selectedWithdrawal.processed_at)} by {selectedWithdrawal.processed_by?.email}</p>
              )}
            </div>

            {/* Actions */}
            {selectedWithdrawal.status === 'pending' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(selectedWithdrawal.id)}
                  disabled={actionLoading === selectedWithdrawal.id}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading === selectedWithdrawal.id ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CheckCircle size={18} />
                  )}
                  Approve & Pay
                </button>
                <button
                  onClick={() => {
                    setWithdrawalToReject(selectedWithdrawal.id);
                    setShowRejectModal(true);
                  }}
                  disabled={actionLoading === selectedWithdrawal.id}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Ban size={18} />
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowRejectModal(false)}
          />
          <div className="relative bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-lg font-bold text-gray-900 dark:text-neutral-100 mb-3">Reject Withdrawal</h2>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mb-3">Please provide a reason for rejection:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-3 outline-none focus:border-red-600 text-sm min-h-[100px] dark:text-neutral-100"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2.5 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading !== null}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  'Confirm Reject'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
