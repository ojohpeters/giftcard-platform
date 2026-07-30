"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  Search,
  CheckCircle,
  Ban,
  CreditCard,
  Gift,
  X
} from "lucide-react";
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatIRRShort } from '@/lib/currency';

interface PurchaseRequest {
  id: string; // UUID is a string
  request_number: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
  } | number;
  user_email?: string;
  customer_ip?: string | null;
  customer_user_agent?: string;
  brand_name: string;
  country_name: string;
  card_type: string;
  amount: string;
  quantity: number;
  total_amount_irr?: string;
  status: 'pending' | 'approved' | 'payment_confirmed' | 'processing' | 'completed' | 'cancelled' | 'rejected';
  payment_status: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  admin_notes?: string;
  rejection_reason?: string;
  created_at: string;
  assigned_codes?: string[];
}

export default function AdminPurchaseRequestsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [codesInput, setCodesInput] = useState('');
  const [showCodesModal, setShowCodesModal] = useState(false);
  const [requestForCodes, setRequestForCodes] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.is_staff) {
      router.push('/dashboard');
      return;
    }
    loadRequests();
  }, [user, router, statusFilter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      
      const response = await adminAPI.getPurchaseRequests(params);
      setRequests(response.data.results || response.data || []);
    } catch (err: unknown) {
      console.error('Failed to load purchase requests:', err);
      setError('Failed to load purchase requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id);
      setError('');
      await adminAPI.approvePurchaseRequest(id);
      await loadRequests();
      setSelectedRequest(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      console.error('Failed to approve request:', err);
      setError(error.response?.data?.error || 'Failed to approve request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      setActionLoading(id);
      setError('');
      await adminAPI.rejectPurchaseRequest(id, reason);
      await loadRequests();
      setSelectedRequest(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      console.error('Failed to reject request:', err);
      setError(error.response?.data?.error || 'Failed to reject request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmPayment = async (id: string) => {
    try {
      setActionLoading(id);
      setError('');
      await adminAPI.confirmPayment(id, 'manual', '');
      await loadRequests();
      setSelectedRequest(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      console.error('Failed to confirm payment:', err);
      setError(error.response?.data?.error || 'Failed to confirm payment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssignCodes = async () => {
    if (!requestForCodes || !codesInput.trim()) return;
    
    const codes = codesInput.split('\n').map(c => c.trim()).filter(c => c);
    if (codes.length === 0) return;
    
    try {
      setActionLoading(requestForCodes);
      setError('');
      await adminAPI.assignCodes(requestForCodes, codes);
      await loadRequests();
      setShowCodesModal(false);
      setRequestForCodes(null);
      setCodesInput('');
      setSelectedRequest(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      console.error('Failed to assign codes:', err);
      setError(error.response?.data?.error || 'Failed to assign codes');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={14} className="text-yellow-600" />;
      case 'approved': return <CheckCircle2 size={14} className="text-blue-600" />;
      case 'payment_confirmed': return <CreditCard size={14} className="text-indigo-600" />;
      case 'processing': return <Loader2 size={14} className="text-orange-600" />;
      case 'completed': return <CheckCircle2 size={14} className="text-green-600" />;
      case 'rejected': return <XCircle size={14} className="text-red-600" />;
      case 'cancelled': return <Ban size={14} className="text-gray-600 dark:text-neutral-300" />;
      default: return <Clock size={14} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300';
      case 'approved': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300';
      case 'payment_confirmed': return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300';
      case 'processing': return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300';
      case 'completed': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300';
      case 'cancelled': return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-neutral-800 dark:text-neutral-300';
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-neutral-800 dark:text-neutral-300';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300';
      case 'processing': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300';
      case 'failed': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300';
      case 'refunded': return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300';
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-neutral-800 dark:text-neutral-300';
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

  const getUserEmail = (request: PurchaseRequest) => {
    if (typeof request.user === 'object' && request.user !== null) {
      return request.user.email;
    }
    return request.user_email || 'N/A';
  };

  if (!user?.is_staff) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 md:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
            <ShoppingBag className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic leading-none">
              Purchase<span className="text-blue-200">.</span> Requests
            </h1>
            <p className="text-blue-100 text-xs md:text-sm font-bold uppercase tracking-widest mt-1">
              Manage Buy Orders
            </p>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/40 dark:text-red-300 px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* FILTERS */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 shadow dark:bg-neutral-900 dark:border-neutral-700">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-neutral-500" />
            <input
              type="text"
              placeholder="Search by email or request number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadRequests()}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-blue-600 text-sm font-medium dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="payment_confirmed">Payment Confirmed</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={loadRequests}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold uppercase text-sm tracking-wide hover:bg-blue-700 transition-all"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* REQUESTS LIST - Responsive Table View */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center dark:bg-neutral-900 dark:border-neutral-700">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4 dark:text-neutral-600" />
          <p className="text-gray-400 font-bold uppercase tracking-wide dark:text-neutral-500">No purchase requests found</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow dark:bg-neutral-900 dark:border-neutral-700">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-500 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-400">
                  <th className="p-3 md:p-4">Request #</th>
                  <th className="p-3 md:p-4">User</th>
                  <th className="p-3 md:p-4">Product</th>
                  <th className="p-3 md:p-4">Amount</th>
                  <th className="p-3 md:p-4 hidden sm:table-cell">Total (IRR)</th>
                  <th className="p-3 md:p-4">Status</th>
                  <th className="p-3 md:p-4 hidden md:table-cell">Payment</th>
                  <th className="p-3 md:p-4 hidden lg:table-cell">Date</th>
                  <th className="p-3 md:p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50/50 transition-colors dark:hover:bg-neutral-800">
                    <td className="p-3 md:p-4">
                      <span className="font-mono text-xs md:text-sm font-bold">{request.request_number}</span>
                    </td>
                    <td className="p-3 md:p-4">
                      <span className="text-xs md:text-sm font-medium truncate max-w-[120px] block">{getUserEmail(request)}</span>
                    </td>
                    <td className="p-3 md:p-4">
                      <div>
                        <p className="font-bold text-xs md:text-sm">{request.brand_name}</p>
                        <p className="text-[10px] text-gray-400 dark:text-neutral-500">{request.country_name} • {request.card_type}</p>
                      </div>
                    </td>
                    <td className="p-3 md:p-4">
                      <span className="font-bold text-xs md:text-sm">${request.amount} × {request.quantity}</span>
                    </td>
                    <td className="p-3 md:p-4 hidden sm:table-cell">
                      <span className="font-bold text-green-600 text-xs md:text-sm">{formatIRRShort(request.total_amount_irr ?? '0')} تومان</span>
                    </td>
                    <td className="p-3 md:p-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 w-fit border ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="hidden sm:inline">{request.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="p-3 md:p-4 hidden md:table-cell">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${getPaymentStatusColor(request.payment_status)}`}>
                        {request.payment_status}
                      </span>
                    </td>
                    <td className="p-3 md:p-4 hidden lg:table-cell">
                      <span className="text-xs text-gray-500 dark:text-neutral-400">{formatDate(request.created_at)}</span>
                    </td>
                    <td className="p-3 md:p-4 text-right">
                      <div className="flex items-center justify-end gap-1 md:gap-2">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="p-1.5 md:p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all dark:bg-neutral-800 dark:hover:bg-neutral-700"
                          title="View Details"
                        >
                          <Eye size={14} className="md:w-4 md:h-4" />
                        </button>
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(request.id)}
                              disabled={actionLoading === request.id}
                              className="p-1.5 md:p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all disabled:opacity-50 dark:bg-green-950/40 dark:text-green-300 dark:hover:bg-green-900/40"
                              title="Approve"
                            >
                              {actionLoading === request.id ? (
                                <Loader2 size={14} className="animate-spin md:w-4 md:h-4" />
                              ) : (
                                <CheckCircle size={14} className="md:w-4 md:h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleReject(request.id, 'Rejected by admin')}
                              disabled={actionLoading === request.id}
                              className="p-1.5 md:p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all disabled:opacity-50 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/40"
                              title="Reject"
                            >
                              <Ban size={14} className="md:w-4 md:h-4" />
                            </button>
                          </>
                        )}
                        {request.status === 'approved' && request.payment_status === 'pending' && (
                          <button
                            onClick={() => handleConfirmPayment(request.id)}
                            disabled={actionLoading === request.id}
                            className="p-1.5 md:p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all disabled:opacity-50 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/40"
                            title="Confirm Payment"
                          >
                            {actionLoading === request.id ? (
                              <Loader2 size={14} className="animate-spin md:w-4 md:h-4" />
                            ) : (
                              <CreditCard size={14} className="md:w-4 md:h-4" />
                            )}
                          </button>
                        )}
                        {request.payment_status === 'paid' && request.status !== 'completed' && (
                          <button
                            onClick={() => {
                              setRequestForCodes(request.id);
                              setShowCodesModal(true);
                            }}
                            className="p-1.5 md:p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-all dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/40"
                            title="Assign Codes"
                          >
                            <Gift size={14} className="md:w-4 md:h-4" />
                          </button>
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
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedRequest(null)}
          />
          <div className="relative bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all"
            >
              <X size={16} />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-4 pr-8">{selectedRequest.request_number}</h2>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">User</p>
                <p className="text-sm font-medium truncate">{getUserEmail(selectedRequest)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Brand</p>
                <p className="text-sm font-medium">{selectedRequest.brand_name}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Country</p>
                <p className="text-sm font-medium">{selectedRequest.country_name}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Card Type</p>
                <p className="text-sm font-medium">{selectedRequest.card_type}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Amount</p>
                <p className="text-sm font-medium">${selectedRequest.amount} × {selectedRequest.quantity}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-green-600 uppercase mb-1">Total (IRR)</p>
                <p className="text-sm font-bold text-green-700">{formatIRRShort(selectedRequest.total_amount_irr ?? '0')} تومان</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Status</p>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(selectedRequest.status)}`}>
                  {selectedRequest.status.replace('_', ' ')}
                </span>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Payment</p>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${getPaymentStatusColor(selectedRequest.payment_status)}`}>
                  {selectedRequest.payment_status}
                </span>
              </div>
            </div>

            {/* Customer identity + device (for fraud/audit review) */}
            {(() => {
              const u = (typeof selectedRequest.user === 'object' && selectedRequest.user) ? selectedRequest.user : null;
              const fullName = u ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : '';
              return (
                <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Customer</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase block">Name</span>
                      <span className="text-sm font-medium">{fullName || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase block">Email</span>
                      <span className="text-sm font-medium break-all">{u?.email || getUserEmail(selectedRequest)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase block">Phone</span>
                      <span className="text-sm font-medium">{u?.phone_number || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase block">IP address</span>
                      <span className="text-sm font-medium">{selectedRequest.customer_ip || '—'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] text-gray-400 uppercase block">Browser / device</span>
                      <span className="text-xs text-gray-600 break-all">{selectedRequest.customer_user_agent || '—'}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {selectedRequest.assigned_codes && selectedRequest.assigned_codes.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Assigned Codes</p>
                <div className="bg-gray-100 p-3 rounded-xl space-y-1">
                  {selectedRequest.assigned_codes.map((code, idx) => (
                    <code key={idx} className="block font-mono text-sm">{code}</code>
                  ))}
                </div>
              </div>
            )}

            {selectedRequest.admin_notes && (
              <div className="mb-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Admin Notes</p>
                <p className="bg-blue-50 p-3 rounded-xl text-sm border border-blue-200">{selectedRequest.admin_notes}</p>
              </div>
            )}

            {selectedRequest.rejection_reason && (
              <div className="mb-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Rejection Reason</p>
                <p className="bg-red-50 p-3 rounded-xl text-sm border border-red-200">{selectedRequest.rejection_reason}</p>
              </div>
            )}

            <p className="text-[10px] text-gray-400 mb-4">
              Created: {formatDate(selectedRequest.created_at)}
            </p>

            {selectedRequest.status === 'pending' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(selectedRequest.id)}
                  disabled={actionLoading === selectedRequest.id}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold uppercase text-sm hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading === selectedRequest.id ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CheckCircle size={18} />
                  )}
                  Approve
                </button>
                <button
                  onClick={() => handleReject(selectedRequest.id, 'Rejected by admin')}
                  disabled={actionLoading === selectedRequest.id}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold uppercase text-sm hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Ban size={18} />
                  Reject
                </button>
              </div>
            )}

            {selectedRequest.status === 'approved' && selectedRequest.payment_status === 'pending' && (
              <button
                onClick={() => handleConfirmPayment(selectedRequest.id)}
                disabled={actionLoading === selectedRequest.id}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold uppercase text-sm hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === selectedRequest.id ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <CreditCard size={18} />
                )}
                Confirm Payment Received
              </button>
            )}

            {selectedRequest.payment_status === 'paid' && selectedRequest.status !== 'completed' && (
              <button
                onClick={() => {
                  setRequestForCodes(selectedRequest.id);
                  setShowCodesModal(true);
                }}
                className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold uppercase text-sm hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
              >
                <Gift size={18} />
                Assign E-Codes
              </button>
            )}
          </div>
        </div>
      )}

      {/* CODES MODAL */}
      {showCodesModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCodesModal(false)}
          />
          <div className="relative bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowCodesModal(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all"
            >
              <X size={16} />
            </button>

            <h2 className="text-lg font-bold text-gray-900 mb-2">Assign E-Codes</h2>
            <p className="text-sm text-gray-500 mb-4">Enter one code per line:</p>
            <textarea
              value={codesInput}
              onChange={(e) => setCodesInput(e.target.value)}
              placeholder="CODE1&#10;CODE2&#10;CODE3"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 text-sm min-h-[120px] font-mono"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowCodesModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold uppercase text-sm hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignCodes}
                disabled={!codesInput.trim() || actionLoading !== null}
                className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold uppercase text-sm hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  'Assign Codes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
