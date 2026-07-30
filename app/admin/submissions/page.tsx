"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package,
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
  CreditCard,
  Image as ImageIcon
} from "lucide-react";
import { submissionsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatIRRShort } from '@/lib/currency';

interface Submission {
  id: number;
  user: number;
  user_email: string;
  submission_type: 'physical' | 'ecode';
  category: number | null;
  category_name: string;
  amount: string;
  currency: string;
  credit_amount: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  code?: string;
  image?: string;
  comment?: string;
  admin_notes?: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by_name?: string;
}

export default function AdminSubmissionsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [submissionToReject, setSubmissionToReject] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.is_staff) {
      router.push('/dashboard');
      return;
    }
    loadSubmissions();
  }, [user, router, statusFilter]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError('');
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      
      const response = await submissionsAPI.list(params);
      setSubmissions(response.data.results || response.data || []);
    } catch (err: any) {
      console.error('Failed to load submissions:', err);
      setError('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      setActionLoading(id);
      await submissionsAPI.approve(id);
      loadSubmissions();
      setSelectedSubmission(null);
    } catch (err: any) {
      console.error('Failed to approve submission:', err);
      setError(err.response?.data?.error || 'Failed to approve submission');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!submissionToReject || !rejectReason.trim()) return;
    
    try {
      setActionLoading(submissionToReject);
      await submissionsAPI.reject(submissionToReject, rejectReason);
      loadSubmissions();
      setShowRejectModal(false);
      setSubmissionToReject(null);
      setRejectReason('');
      setSelectedSubmission(null);
    } catch (err: any) {
      console.error('Failed to reject submission:', err);
      setError(err.response?.data?.error || 'Failed to reject submission');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={12} className="text-yellow-600" />;
      case 'approved': return <CheckCircle2 size={12} className="text-green-600" />;
      case 'rejected': return <XCircle size={12} className="text-red-600" />;
      case 'paid': return <DollarSign size={12} className="text-blue-600" />;
      default: return <Clock size={12} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-900';
      case 'approved': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900';
      case 'paid': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900';
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700';
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
          <div className="h-1 w-4 bg-purple-600"></div>
          <p className="text-[11px] font-black text-purple-600 uppercase tracking-[0.4em]">Management</p>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-neutral-100 tracking-tighter italic uppercase leading-none">
          Submissions<span className="text-gray-200 dark:text-neutral-700">.</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 font-medium mt-2">Manage gift card sell requests from users</p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300 px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between">
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
              className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-purple-600 text-sm dark:text-neutral-100"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl py-2.5 px-4 outline-none focus:border-purple-600 text-sm font-medium dark:text-neutral-100"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="paid">Paid</option>
          </select>
          <button
            onClick={loadSubmissions}
            className="px-4 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-all"
          >
            Apply
          </button>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && submissions.length === 0 && (
        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 dark:text-neutral-600 mx-auto mb-4" />
          <p className="text-gray-400 dark:text-neutral-500 font-bold uppercase tracking-widest">No submissions found</p>
        </div>
      )}

      {/* TABLE VIEW - Responsive */}
      {!loading && submissions.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800">
                  <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">ID</th>
                  <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">User</th>
                  <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">Type</th>
                  <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">Amount</th>
                  <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 hidden sm:table-cell">Credit</th>
                  <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 hidden md:table-cell">Date</th>
                  <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-3">
                      <span className="font-mono text-xs font-bold">#{submission.id}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-medium truncate max-w-[120px] block">{submission.user_email}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase whitespace-nowrap ${
                        submission.submission_type === 'ecode' 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'bg-purple-50 text-purple-700'
                      }`}>
                        {submission.submission_type === 'ecode' ? 'E-Code' : 'Physical'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-bold whitespace-nowrap">${submission.amount}</span>
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      {submission.credit_amount ? (
                        <span className="text-xs font-bold text-green-600 whitespace-nowrap">{formatIRRShort(submission.credit_amount)} ت</span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase flex items-center gap-1 w-fit border whitespace-nowrap ${getStatusColor(submission.status)}`}>
                        {getStatusIcon(submission.status)}
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(submission.created_at)}</span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        {submission.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(submission.id)}
                              disabled={actionLoading === submission.id}
                              className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all disabled:opacity-50"
                              title="Approve"
                            >
                              {actionLoading === submission.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <CheckCircle size={14} />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setSubmissionToReject(submission.id);
                                setShowRejectModal(true);
                              }}
                              disabled={actionLoading === submission.id}
                              className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all disabled:opacity-50"
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
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedSubmission(null)}
          />
          <div className="relative bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setSelectedSubmission(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all"
            >
              <X size={16} />
            </button>

            <h2 className="text-lg font-bold text-gray-900 mb-4 pr-8">Submission #{selectedSubmission.id}</h2>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">User</p>
                <p className="text-sm font-medium truncate">{selectedSubmission.user_email}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">Type</p>
                <p className="text-sm font-medium uppercase">{selectedSubmission.submission_type === 'ecode' ? 'E-Code' : 'Physical Card'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">Category</p>
                <p className="text-sm font-medium">{selectedSubmission.category_name || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">Amount</p>
                <p className="text-sm font-medium">${selectedSubmission.amount} {selectedSubmission.currency}</p>
              </div>
              {selectedSubmission.credit_amount && (
                <div className="bg-green-50 rounded-xl p-3 col-span-2">
                  <p className="text-[11px] font-bold text-green-600 uppercase mb-1">Credit Amount</p>
                  <p className="text-sm font-bold text-green-700">{formatIRRShort(selectedSubmission.credit_amount)} تومان</p>
                </div>
              )}
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">Status</p>
                <span className={`px-2 py-1 rounded-full text-[11px] font-bold uppercase border ${getStatusColor(selectedSubmission.status)}`}>
                  {selectedSubmission.status}
                </span>
              </div>
            </div>

            {selectedSubmission.code && (
              <div className="mb-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase mb-2">E-Code</p>
                <code className="block bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 p-3 rounded-xl font-mono text-sm break-all">{selectedSubmission.code}</code>
              </div>
            )}

            {selectedSubmission.comment && (
              <div className="mb-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase mb-2">User Comment</p>
                <p className="bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 p-3 rounded-xl text-sm">{selectedSubmission.comment}</p>
              </div>
            )}

            {selectedSubmission.image && (
              <div className="mb-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase mb-2">Card Image</p>
                <img src={selectedSubmission.image} alt="Card" className="rounded-xl max-h-64 object-contain bg-gray-100 w-full" />
              </div>
            )}

            {selectedSubmission.admin_notes && (
              <div className="mb-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase mb-2">Admin Notes</p>
                <p className="bg-yellow-50 p-3 rounded-xl text-sm border border-yellow-200">{selectedSubmission.admin_notes}</p>
              </div>
            )}

            <div className="text-[11px] text-gray-400 mb-4">
              <p>Submitted: {formatDate(selectedSubmission.created_at)}</p>
              {selectedSubmission.reviewed_at && (
                <p>Reviewed: {formatDate(selectedSubmission.reviewed_at)} by {selectedSubmission.reviewed_by_name}</p>
              )}
            </div>

            {selectedSubmission.status === 'pending' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(selectedSubmission.id)}
                  disabled={actionLoading === selectedSubmission.id}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading === selectedSubmission.id ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CheckCircle size={18} />
                  )}
                  Approve & Credit
                </button>
                <button
                  onClick={() => {
                    setSubmissionToReject(selectedSubmission.id);
                    setShowRejectModal(true);
                  }}
                  disabled={actionLoading === selectedSubmission.id}
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
            <h2 className="text-lg font-bold text-gray-900 dark:text-neutral-100 mb-3">Reject Submission</h2>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mb-3">Please provide a reason for rejection:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-3 outline-none focus:border-red-600 text-sm min-h-[100px] text-gray-900 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2.5 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-200 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all"
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
