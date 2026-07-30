"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  Image as ImageIcon,
  Loader2,
  Eye
} from "lucide-react";
import { submissionsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatIRRShort } from '@/lib/currency';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';

interface Submission {
  id: number;
  submission_type: 'physical' | 'ecode';
  category_name: string;
  amount: string;
  currency: string;
  credit_amount: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  code?: string;
  image?: string;
  admin_notes?: string;
  created_at: string;
  reviewed_at?: string;
}

export default function SubmissionsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/dashboard/submissions');
      return;
    }
    loadSubmissions();
  }, [isInitialized, isAuthenticated, router]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const response = await submissionsAPI.list();
      setSubmissions(response.data.results || response.data || []);
    } catch (err: any) {
      console.error('Failed to load submissions:', err);
      setError(t('submissions.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={14} className="text-yellow-600" />;
      case 'approved': return <CheckCircle2 size={14} className="text-green-600" />;
      case 'rejected': return <XCircle size={14} className="text-red-600" />;
      case 'paid': return <DollarSign size={14} className="text-blue-600" />;
      default: return <Clock size={14} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border-yellow-200';
      case 'approved': return 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-200';
      case 'rejected': return 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200';
      case 'paid': return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 px-4 md:px-0 pb-20">
      
      {/* BACK NAV */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-neutral-500 hover:text-black dark:hover:text-neutral-100 transition-colors">
        <ArrowLeft size={14} className="rtl:rotate-180" />
        {t('submissions.backToDashboard')}
      </Link>

      {/* HEADER */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-1 w-4 bg-blue-600"></div>
          <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em]">{t('submissions.eyebrow')}</p>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-neutral-100 tracking-tighter italic uppercase leading-none">
          {t('submissions.titlePart1')}<span className="text-gray-200">.</span> {t('submissions.titlePart2')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mt-2">{t('submissions.subtitle')}</p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm font-bold">
          {error}
        </div>
      )}

      {/* SUBMISSIONS LIST */}
      {submissions.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-neutral-700 rounded-[32px] px-6 py-14 md:py-16 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mb-5">
            <Package className="w-10 h-10 text-gray-400 dark:text-neutral-500" />
          </div>
          <p className="text-lg font-black uppercase italic tracking-tight text-gray-900 dark:text-neutral-100">{t('submissions.emptyTitle')}</p>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-2 max-w-xs">{t('submissions.emptyDesc')}</p>
          <Link
            href="/sell"
            className="inline-flex items-center justify-center w-full md:w-auto mt-7 px-8 py-3.5 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all"
          >
            {t('submissions.sellCta')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div 
              key={submission.id} 
              className="bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-neutral-700 rounded-[24px] p-5 md:p-6 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-0 md:gap-4">
                {/* LEFT: INFO */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gray-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center shrink-0">
                    {submission.submission_type === 'ecode' ? (
                      <Package className="text-blue-600" size={24} />
                    ) : (
                      <ImageIcon className="text-purple-600" size={24} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-gray-900 dark:text-neutral-100">{submission.category_name || t('submissions.giftCard')}</h3>
                    <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
                      {submission.submission_type === 'ecode' ? t('submissions.typeEcode') : t('submissions.typePhysical')} • ${submission.amount} {submission.currency}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-1.5">
                      {t('submissions.submitted')} {formatDate(submission.created_at)}
                    </p>
                  </div>
                </div>

                {/* RIGHT: STATUS & AMOUNT */}
                <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 w-full md:w-auto mt-4 pt-4 md:mt-0 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-neutral-800">
                  {submission.credit_amount && (
                    <div className="text-start md:text-end">
                      <p className="text-[11px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-wide">{t('submissions.credit')}</p>
                      <p className="text-xl font-black text-green-600 dark:text-green-400">{formatIRRShort(submission.credit_amount)} تومان</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 md:gap-3 ms-auto md:ms-0">
                    <div className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 border ${getStatusColor(submission.status)}`}>
                      {getStatusIcon(submission.status)}
                      {submission.status}
                    </div>
                    <button
                      onClick={() => setSelectedSubmission(submission)}
                      className="p-2.5 bg-gray-100 dark:bg-neutral-800 rounded-xl hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all shrink-0"
                      title={t('submissions.viewDetails')}
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* ADMIN NOTES */}
              {submission.admin_notes && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
                  <p className="text-[11px] font-black text-gray-400 dark:text-neutral-500 uppercase mb-1">{t('submissions.adminNotes')}</p>
                  <p className="text-sm text-gray-600 dark:text-neutral-300">{submission.admin_notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedSubmission(null)}
          />
          <div className="relative bg-white dark:bg-neutral-900 rounded-[32px] p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setSelectedSubmission(null)}
              className="absolute top-4 end-4 w-10 h-10 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all"
            >
              ×
            </button>

            <h2 className="text-2xl font-black text-gray-900 dark:text-neutral-100 mb-6">{t('submissions.detailsTitle')}</h2>

            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-neutral-800">
                <span className="text-sm text-gray-500 dark:text-neutral-400">{t('submissions.type')}</span>
                <span className="text-sm font-black">{selectedSubmission.submission_type === 'ecode' ? t('submissions.typeEcode') : t('submissions.typePhysical')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-neutral-800">
                <span className="text-sm text-gray-500 dark:text-neutral-400">{t('submissions.category')}</span>
                <span className="text-sm font-black">{selectedSubmission.category_name || t('submissions.na')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-neutral-800">
                <span className="text-sm text-gray-500 dark:text-neutral-400">{t('submissions.amount')}</span>
                <span className="text-sm font-black">${selectedSubmission.amount} {selectedSubmission.currency}</span>
              </div>
              {selectedSubmission.credit_amount && (
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-neutral-800">
                  <span className="text-sm text-gray-500 dark:text-neutral-400">{t('submissions.creditAmount')}</span>
                  <span className="text-sm font-black text-green-600">{formatIRRShort(selectedSubmission.credit_amount)} تومان</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-neutral-800">
                <span className="text-sm text-gray-500 dark:text-neutral-400">{t('submissions.status')}</span>
                <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase ${getStatusColor(selectedSubmission.status)}`}>
                  {selectedSubmission.status}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-neutral-800">
                <span className="text-sm text-gray-500 dark:text-neutral-400">{t('submissions.submittedLabel')}</span>
                <span className="text-sm font-black">{formatDate(selectedSubmission.created_at)}</span>
              </div>
              {selectedSubmission.reviewed_at && (
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-neutral-800">
                  <span className="text-sm text-gray-500 dark:text-neutral-400">{t('submissions.reviewed')}</span>
                  <span className="text-sm font-black">{formatDate(selectedSubmission.reviewed_at)}</span>
                </div>
              )}
              {selectedSubmission.code && (
                <div className="py-2">
                  <span className="text-sm text-gray-500 dark:text-neutral-400 block mb-2">{t('submissions.code')}</span>
                  <code className="block bg-gray-100 dark:bg-neutral-800 p-3 rounded-xl font-mono text-sm">{selectedSubmission.code}</code>
                </div>
              )}
              {selectedSubmission.image && (
                <div className="py-2">
                  <span className="text-sm text-gray-500 dark:text-neutral-400 block mb-2">{t('submissions.image')}</span>
                  <img src={selectedSubmission.image} alt={t('submissions.cardAlt')} className="rounded-xl max-h-48 object-cover" />
                </div>
              )}
              {selectedSubmission.admin_notes && (
                <div className="py-2">
                  <span className="text-sm text-gray-500 dark:text-neutral-400 block mb-2">{t('submissions.adminNotes')}</span>
                  <p className="text-sm bg-gray-50 dark:bg-neutral-800 p-3 rounded-xl">{selectedSubmission.admin_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
