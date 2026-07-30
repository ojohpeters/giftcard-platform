"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Ticket, Plus, Trash2, Pencil, X, Save, RefreshCw, AlertCircle,
  CheckCircle2, Percent, DollarSign, ToggleLeft, ToggleRight
} from "lucide-react";
import { discountsAdminAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface Discount {
  id: number;
  code: string;
  description_en: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string | number;
  max_discount_amount: string | number | null;
  min_order_amount: string | number;
  max_uses: number | null;
  max_uses_per_user: number;
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
  times_used: number;
  is_valid: boolean;
}

const EMPTY_FORM = {
  code: '',
  description_en: '',
  discount_type: 'percentage' as 'percentage' | 'fixed',
  discount_value: '',
  max_discount_amount: '',
  min_order_amount: '0',
  max_uses: '',
  max_uses_per_user: '1',
  is_active: true,
  valid_until: '',
};

export default function AdminDiscountsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && !user.is_staff) {
      router.push('/dashboard');
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await discountsAdminAPI.list();
      setDiscounts(res.data?.results || res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load discount codes');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
    setError('');
  };

  const openEdit = (d: Discount) => {
    setEditingId(d.id);
    setForm({
      code: d.code,
      description_en: d.description_en || '',
      discount_type: d.discount_type,
      discount_value: String(d.discount_value ?? ''),
      max_discount_amount: d.max_discount_amount != null ? String(d.max_discount_amount) : '',
      min_order_amount: String(d.min_order_amount ?? '0'),
      max_uses: d.max_uses != null ? String(d.max_uses) : '',
      max_uses_per_user: String(d.max_uses_per_user ?? '1'),
      is_active: d.is_active,
      valid_until: d.valid_until ? d.valid_until.slice(0, 16) : '',
    });
    setShowForm(true);
    setError('');
  };

  const buildPayload = () => {
    const payload: any = {
      code: form.code.trim().toUpperCase(),
      description_en: form.description_en.trim(),
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value),
      min_order_amount: parseFloat(form.min_order_amount || '0'),
      max_uses_per_user: parseInt(form.max_uses_per_user || '1', 10),
      is_active: !!form.is_active,
    };
    payload.max_discount_amount = form.max_discount_amount !== '' ? parseFloat(form.max_discount_amount) : null;
    payload.max_uses = form.max_uses !== '' ? parseInt(form.max_uses, 10) : null;
    if (form.valid_until) payload.valid_until = new Date(form.valid_until).toISOString();
    return payload;
  };

  const save = async () => {
    setError('');
    if (!form.code.trim()) { setError('Code is required'); return; }
    if (isNaN(parseFloat(form.discount_value)) || parseFloat(form.discount_value) <= 0) {
      setError('Discount value must be greater than 0'); return;
    }
    if (form.discount_type === 'percentage' && parseFloat(form.discount_value) > 100) {
      setError('Percentage discount cannot exceed 100'); return;
    }
    setSaving(true);
    try {
      const payload = buildPayload();
      if (editingId) {
        await discountsAdminAPI.update(editingId, payload);
        setSuccess(`Discount "${payload.code}" updated`);
      } else {
        await discountsAdminAPI.create(payload);
        setSuccess(`Discount "${payload.code}" created`);
      }
      setShowForm(false);
      await load();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      const data = err.response?.data;
      let msg = 'Failed to save discount';
      if (data) {
        if (typeof data === 'string') msg = data;
        else if (data.code) msg = `Code: ${Array.isArray(data.code) ? data.code[0] : data.code}`;
        else if (data.detail) msg = data.detail;
        else { const first = Object.values(data)[0]; msg = Array.isArray(first) ? String(first[0]) : String(first); }
      }
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (d: Discount) => {
    if (!confirm(`Delete discount code "${d.code}"? This cannot be undone.`)) return;
    try {
      await discountsAdminAPI.remove(d.id);
      setSuccess(`Discount "${d.code}" deleted`);
      await load();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete discount');
    }
  };

  const toggleActive = async (d: Discount) => {
    try {
      await discountsAdminAPI.update(d.id, { is_active: !d.is_active });
      await load();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update discount');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <Ticket className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
              Discounts<span className="text-purple-200">.</span>
            </h1>
            <p className="text-purple-100 text-sm font-bold uppercase tracking-widest mt-2">
              Create & manage discount codes
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="bg-white text-purple-700 px-6 py-3 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-purple-50 transition-all flex items-center gap-2 shadow-lg"
        >
          <Plus size={18} /> New Code
        </button>
      </div>

      {/* ALERTS */}
      {error && !showForm && (
        <div className="bg-red-50 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-900 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={22} />
          <p className="text-sm text-red-700 dark:text-red-300 font-bold flex-1">{error}</p>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">×</button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-green-950/40 border-2 border-green-200 dark:border-green-900 rounded-2xl p-5 flex items-start gap-3">
          <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={22} />
          <p className="text-sm text-green-700 dark:text-green-300 font-bold flex-1">{success}</p>
        </div>
      )}

      {/* LIST */}
      <div className="bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-neutral-700 rounded-3xl p-6 shadow-lg">
        {loading ? (
          <div className="text-center py-16">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
            <p className="text-gray-400 dark:text-neutral-500 font-bold uppercase text-sm">Loading...</p>
          </div>
        ) : discounts.length === 0 ? (
          <div className="text-center py-16">
            <Ticket className="w-12 h-12 text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
            <p className="text-gray-400 dark:text-neutral-500 font-bold uppercase text-sm">No discount codes yet</p>
            <button onClick={openCreate} className="mt-4 text-purple-600 font-black uppercase text-xs hover:underline">
              Create your first code
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-left text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500 border-b-2 border-gray-100 dark:border-neutral-800">
                  <th className="py-3 px-2">Code</th>
                  <th className="py-3 px-2">Value</th>
                  <th className="py-3 px-2">Min order</th>
                  <th className="py-3 px-2">Used</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map((d) => (
                  <tr key={d.id} className="border-b border-gray-50 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800/50">
                    <td className="py-4 px-2">
                      <div className="font-black text-gray-900 dark:text-neutral-100 tracking-wider">{d.code}</div>
                      {d.description_en && <div className="text-[11px] text-gray-400 dark:text-neutral-500">{d.description_en}</div>}
                    </td>
                    <td className="py-4 px-2 font-bold text-gray-700 dark:text-neutral-300">
                      <span className="inline-flex items-center gap-1">
                        {d.discount_type === 'percentage'
                          ? <><Percent size={13} className="text-purple-500" />{d.discount_value}%</>
                          : <><DollarSign size={13} className="text-green-500" />{d.discount_value}</>}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-gray-600 dark:text-neutral-400">{d.min_order_amount}</td>
                    <td className="py-4 px-2 text-gray-600 dark:text-neutral-400">
                      {d.times_used}{d.max_uses != null ? ` / ${d.max_uses}` : ''}
                    </td>
                    <td className="py-4 px-2">
                      <button onClick={() => toggleActive(d)} title="Toggle active" className="inline-flex items-center gap-1.5">
                        {d.is_active
                          ? <><ToggleRight size={22} className="text-green-500" /><span className="text-[10px] font-black uppercase text-green-600">Active</span></>
                          : <><ToggleLeft size={22} className="text-gray-400" /><span className="text-[10px] font-black uppercase text-gray-400">Off</span></>}
                      </button>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(d)} className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 hover:bg-blue-100 hover:text-blue-600 transition-all">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => remove(d)} className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 hover:bg-red-100 hover:text-red-600 transition-all">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div
            className="bg-white dark:bg-neutral-900 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black uppercase text-gray-900 dark:text-neutral-100">
                {editingId ? 'Edit Discount' : 'New Discount'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-neutral-200">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl p-3 mb-4">
                <p className="text-xs text-red-700 dark:text-red-300 font-bold">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <Field label="Code">
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="WELCOME10" className={inputCls + ' uppercase tracking-wider'} />
              </Field>

              <Field label="Description (optional)">
                <input value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                  placeholder="10% off your first order" className={inputCls} />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Type">
                  <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className={inputCls}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed amount</option>
                  </select>
                </Field>
                <Field label={form.discount_type === 'percentage' ? 'Percent off' : 'Amount off'}>
                  <input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                    placeholder={form.discount_type === 'percentage' ? '10' : '5'} className={inputCls} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {form.discount_type === 'percentage' && (
                  <Field label="Max discount (optional)">
                    <input type="number" value={form.max_discount_amount} onChange={(e) => setForm({ ...form, max_discount_amount: e.target.value })}
                      placeholder="No cap" className={inputCls} />
                  </Field>
                )}
                <Field label="Min order amount">
                  <input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
                    placeholder="0" className={inputCls} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Total uses (optional)">
                  <input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                    placeholder="Unlimited" className={inputCls} />
                </Field>
                <Field label="Uses per user">
                  <input type="number" value={form.max_uses_per_user} onChange={(e) => setForm({ ...form, max_uses_per_user: e.target.value })}
                    placeholder="1" className={inputCls} />
                </Field>
              </div>

              <Field label="Expires (optional)">
                <input type="datetime-local" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} className={inputCls} />
              </Field>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-5 h-5 rounded accent-purple-600" />
                <span className="text-sm font-bold text-gray-700 dark:text-neutral-300">Active (usable now)</span>
              </label>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowForm(false)} className="flex-1 py-4 rounded-2xl font-black uppercase text-sm bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all">
                Cancel
              </button>
              <button onClick={save} disabled={saving}
                className="flex-1 py-4 rounded-2xl font-black uppercase text-sm bg-gradient-to-r from-purple-600 to-indigo-700 text-white hover:from-purple-700 hover:to-indigo-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                {editingId ? 'Save Changes' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl py-3 px-4 outline-none focus:border-purple-600 text-sm font-bold text-gray-900 dark:text-neutral-100 transition-all";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-black text-gray-500 dark:text-neutral-400 uppercase tracking-widest mb-2 block">{label}</label>
      {children}
    </div>
  );
}
