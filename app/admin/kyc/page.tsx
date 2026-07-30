"use client";
import React, { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { CheckCircle2, XCircle, Clock, ExternalLink, Loader2, Fingerprint } from "lucide-react";

interface KYC {
  id: number;
  user_email: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  country: string;
  document_type: string;
  document_type_display: string;
  document_number: string;
  document_front: string | null;
  document_back: string | null;
  selfie: string | null;
  status: string;
  admin_notes: string;
  reviewed_by_email: string | null;
  reviewed_at: string | null;
  submitted_at: string;
}

const FILTERS = ['pending', 'approved', 'rejected', ''];

export default function AdminKycPage() {
  const [items, setItems] = useState<KYC[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getKycList(filter ? { status: filter } : {});
      setItems(res.data?.results || []);
    } catch (err: any) {
      setError('Failed to load KYC submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

  const approve = async (id: number) => {
    setBusyId(id);
    try { await adminAPI.approveKyc(id); await load(); }
    catch { setError('Failed to approve.'); }
    finally { setBusyId(null); }
  };

  const reject = async (id: number) => {
    const reason = window.prompt('Reason for rejection (shown to the user):', '');
    if (reason === null) return;
    setBusyId(id);
    try { await adminAPI.rejectKyc(id, reason); await load(); }
    catch { setError('Failed to reject.'); }
    finally { setBusyId(null); }
  };

  const badge = (s: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300',
      approved: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300',
      rejected: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300',
    };
    return map[s] || 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter flex items-center gap-3">
          <Fingerprint className="text-blue-600" size={36} /> KYC Review
        </h1>
        <p className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mt-1">Identity verification submissions</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button key={f || 'all'} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-700 dark:hover:bg-neutral-800'
            }`}>
            {f || 'All'}
          </button>
        ))}
      </div>

      {error && <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 rounded-2xl text-sm font-bold text-red-600 dark:text-red-300">{error}</div>}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-12 text-center text-gray-400 dark:text-neutral-500 font-bold">
          No {filter || ''} submissions.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((k) => (
            <div key={k.id} className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-black text-gray-900 dark:text-neutral-100">{k.first_name} {k.last_name}</p>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase ${badge(k.status)}`}>{k.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">{k.user_email}</p>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-neutral-500 font-bold uppercase">
                  {new Date(k.submitted_at).toLocaleDateString()}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-xs">
                <div><p className="text-gray-400 dark:text-neutral-500 font-bold uppercase text-[9px]">DOB</p><p className="font-bold">{k.date_of_birth}</p></div>
                <div><p className="text-gray-400 dark:text-neutral-500 font-bold uppercase text-[9px]">Country</p><p className="font-bold">{k.country}</p></div>
                <div><p className="text-gray-400 dark:text-neutral-500 font-bold uppercase text-[9px]">Document</p><p className="font-bold">{k.document_type_display}</p></div>
                <div><p className="text-gray-400 dark:text-neutral-500 font-bold uppercase text-[9px]">Doc No.</p><p className="font-bold">{k.document_number}</p></div>
              </div>

              {/* Document links */}
              <div className="flex flex-wrap gap-2 mt-4">
                {[['Front', k.document_front], ['Back', k.document_back], ['Selfie', k.selfie]].map(([label, url]) =>
                  url ? (
                    <a key={label as string} href={url as string} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-50 dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-gray-200 dark:border-neutral-700 rounded-xl text-xs font-bold text-gray-700 dark:text-neutral-300 hover:text-blue-600 transition-colors">
                      <ExternalLink size={13} /> {label}
                    </a>
                  ) : null
                )}
              </div>

              {k.status === 'rejected' && k.admin_notes && (
                <p className="mt-3 text-xs text-red-600"><strong>Rejected:</strong> {k.admin_notes}</p>
              )}

              {k.status === 'pending' && (
                <div className="flex gap-3 mt-5">
                  <button onClick={() => approve(k.id)} disabled={busyId === k.id}
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-green-700 disabled:opacity-50 transition-all">
                    <CheckCircle2 size={15} /> Approve
                  </button>
                  <button onClick={() => reject(k.id)} disabled={busyId === k.id}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-red-700 disabled:opacity-50 transition-all">
                    <XCircle size={15} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
