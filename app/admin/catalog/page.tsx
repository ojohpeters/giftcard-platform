"use client";
import React, { useState, useEffect } from 'react';
import { adminAPI, productsAPI } from '@/lib/api';
import { currencySymbol, formatMoney } from '@/lib/currency';
import {
  Package, Plus, Trash2, Pencil, Loader2, Upload, X, ChevronDown, ChevronRight, Layers,
  Eye, EyeOff, Lock, Unlock,
} from "lucide-react";

interface CardType {
  id: string; country: string; country_name: string; card_type: string;
  min_amount: string; max_amount: string | null; rate: string; is_active: boolean;
  requires_login?: boolean;
}
interface Brand {
  id: string; name: string; slug: string; logo: string; image: string;
  category: number | null; category_name: string | null; is_active: boolean;
  order: number; card_types_count: number; card_types: CardType[];
}
interface Country { iso_code: string; name: string; currency_code: string; }
interface Category { id?: number; name_en: string; slug: string; }

const CARD_TYPES = [{ v: 'E-CODE', l: 'E-Code (Digital)' }, { v: 'PHYSICAL', l: 'Physical Card' }];

export default function AdminCatalogPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Brand form
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [bName, setBName] = useState('');
  const [bCategory, setBCategory] = useState<string>('');
  const [bActive, setBActive] = useState(true);
  const [bImage, setBImage] = useState<File | null>(null);
  const [bImageUrl, setBImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // Card-type management
  const [expanded, setExpanded] = useState<string | null>(null);
  const [ctForm, setCtForm] = useState({ country: '', card_type: 'E-CODE', min_amount: '', max_amount: '', rate: '' });
  const [ctSaving, setCtSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [b, c, cat] = await Promise.all([
        adminAPI.listCatalogBrands(),
        productsAPI.getGCCountries(),
        productsAPI.getCategories().catch(() => ({ data: [] })),
      ]);
      setBrands(b.data?.results || b.data || []);
      setCountries(c.data?.results || c.data || []);
      setCategories(cat.data?.results || cat.data || []);
    } catch { setError('Failed to load catalog.'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null); setBName(''); setBCategory(''); setBActive(true); setBImage(null); setBImageUrl(''); setShowForm(true);
  };
  const openEdit = (b: Brand) => {
    setEditing(b); setBName(b.name); setBCategory(b.category ? String(b.category) : '');
    setBActive(b.is_active); setBImage(null); setBImageUrl(b.logo || ''); setShowForm(true);
  };

  const saveBrand = async () => {
    if (!bName.trim()) { setError('Brand name is required.'); return; }
    setSaving(true); setError('');
    try {
      const fd = new FormData();
      fd.append('name', bName.trim());
      fd.append('is_active', String(bActive));
      if (bCategory) fd.append('category', bCategory);
      if (bImage) fd.append('image_upload', bImage);
      if (editing) await adminAPI.updateCatalogBrand(editing.id, fd);
      else await adminAPI.createCatalogBrand(fd);
      setShowForm(false);
      await load();
    } catch (e: any) {
      setError(e.response?.data ? JSON.stringify(e.response.data) : 'Failed to save brand.');
    } finally { setSaving(false); }
  };

  const deleteBrand = async (b: Brand) => {
    if (!confirm(`Delete "${b.name}" and all its card types? This removes it from the store.`)) return;
    try { await adminAPI.deleteCatalogBrand(b.id); await load(); } catch { setError('Failed to delete.'); }
  };

  const addCardType = async (brand: Brand) => {
    if (!ctForm.country || !ctForm.min_amount) { setError('Country and min amount are required for a card type.'); return; }
    setCtSaving(true); setError('');
    try {
      await adminAPI.createCatalogCardType({
        brand: brand.id, country: ctForm.country, card_type: ctForm.card_type,
        min_amount: ctForm.min_amount, max_amount: ctForm.max_amount || null, rate: ctForm.rate || 0, is_active: true,
      });
      setCtForm({ country: '', card_type: 'E-CODE', min_amount: '', max_amount: '', rate: '' });
      await load();
    } catch (e: any) {
      setError(e.response?.data ? JSON.stringify(e.response.data) : 'Failed to add card type.');
    } finally { setCtSaving(false); }
  };

  const patchCardType = async (id: string, data: Partial<CardType>) => {
    try { await adminAPI.updateCatalogCardType(id, data); await load(); }
    catch { setError('Failed to update card.'); }
  };

  const toggleBrandActive = async (b: Brand) => {
    try {
      const fd = new FormData();
      fd.append('is_active', String(!b.is_active));
      await adminAPI.updateCatalogBrand(b.id, fd);
      await load();
    } catch { setError('Failed to update brand.'); }
  };

  const deleteCardType = async (id: string) => {
    if (!confirm('Remove this card type?')) return;
    try { await adminAPI.deleteCatalogCardType(id); await load(); } catch { setError('Failed to remove.'); }
  };

  const curOf = (iso: string) => countries.find((c) => c.iso_code === iso)?.currency_code || 'USD';
  const input = "w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl py-2.5 px-3 outline-none focus:border-blue-600 text-sm dark:text-neutral-100";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter flex items-center gap-3">
            <Layers className="text-blue-600" size={34} /> Catalog
          </h1>
          <p className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mt-1">Brands customers see in the store</p>
        </div>
        <button onClick={openCreate} className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2">
          <Plus size={16} /> New Brand
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 rounded-2xl text-xs font-bold text-red-600 dark:text-red-300 break-all">{error}</div>}

      {/* Brand form */}
      {showForm && (
        <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black uppercase text-sm">{editing ? `Edit ${editing.name}` : 'New Brand'}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5 block">Brand Name</label>
              <input className={input} value={bName} onChange={(e) => setBName(e.target.value)} placeholder="e.g. Amazon" />
            </div>
            <div>
              <label className="text-[9px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5 block">Category (optional)</label>
              <select className={input} value={bCategory} onChange={(e) => setBCategory(e.target.value)}>
                <option value="">— None —</option>
                {categories.map((c) => <option key={c.id ?? c.slug} value={c.id}>{c.name_en}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[9px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5 block">Logo Image</label>
            <div className="flex items-center gap-3">
              {(bImage || bImageUrl) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={bImage ? URL.createObjectURL(bImage) : bImageUrl} alt="" className="w-14 h-14 rounded-xl object-cover bg-white border border-gray-200 dark:border-neutral-700" />
              )}
              <label className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-neutral-800 border border-dashed border-gray-300 dark:border-neutral-700 rounded-xl py-2.5 px-3 cursor-pointer hover:border-blue-600">
                <Upload size={15} className="text-gray-400" />
                <span className="text-xs text-gray-600 dark:text-neutral-300 truncate">{bImage ? bImage.name : 'Upload logo (JPG/PNG)'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setBImage(e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={bActive} onChange={(e) => setBActive(e.target.checked)} /> Active (visible in store)
          </label>
          <button onClick={saveBrand} disabled={saving} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : null} {editing ? 'Save Changes' : 'Create Brand'}
          </button>
        </div>
      )}

      {/* Brand list */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : brands.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-12 text-center text-gray-400 dark:text-neutral-500 font-bold">
          No brands yet. Add one — it appears in the store immediately.
        </div>
      ) : (
        <div className="space-y-3">
          {brands.map((b) => (
            <div key={b.id} className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                {b.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.logo} alt={b.name} className="w-12 h-12 rounded-xl object-cover bg-white border border-gray-200 dark:border-neutral-700" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center"><Package className="text-gray-400" size={20} /></div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-900 dark:text-neutral-100 truncate">{b.name}</p>
                  <p className="text-xs text-gray-400 dark:text-neutral-500">{b.card_types_count} card type{b.card_types_count === 1 ? '' : 's'}{b.category_name ? ` · ${b.category_name}` : ''}</p>
                </div>
                <button
                  onClick={() => toggleBrandActive(b)}
                  title={b.is_active ? 'Live in store — click to hide' : 'Hidden — click to show'}
                  className={`inline-flex items-center gap-1 text-[9px] font-black px-2.5 py-1.5 rounded-full uppercase transition-colors ${b.is_active ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300 hover:bg-green-100' : 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-gray-200'}`}
                >
                  {b.is_active ? <Eye size={11} /> : <EyeOff size={11} />}
                  {b.is_active ? 'Live' : 'Hidden'}
                </button>
                <button onClick={() => openEdit(b)} className="p-2 text-gray-400 hover:text-blue-600" title="Edit"><Pencil size={16} /></button>
                <button onClick={() => deleteBrand(b)} className="p-2 text-gray-400 hover:text-red-600" title="Delete"><Trash2 size={16} /></button>
                <button onClick={() => setExpanded(expanded === b.id ? null : b.id)} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-neutral-200" title="Card types">
                  {expanded === b.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
              </div>

              {/* Card types */}
              {expanded === b.id && (
                <div className="border-t border-gray-100 dark:border-neutral-800 p-4 bg-gray-50/50 dark:bg-neutral-950/40 space-y-3">
                  <p className="text-[9px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-widest">Card types (country + type + amounts) — required for the brand to be purchasable</p>
                  {b.card_types.length > 0 && (
                    <div className="space-y-2">
                      {b.card_types.map((ct) => (
                        <div key={ct.id} className={`flex items-center gap-3 border rounded-xl px-3 py-2 text-xs transition-colors ${ct.is_active ? 'bg-white dark:bg-neutral-900 border-gray-100 dark:border-neutral-800' : 'bg-gray-50 dark:bg-neutral-950 border-dashed border-gray-200 dark:border-neutral-700 opacity-70'}`}>
                          <span className="font-black">{ct.country_name}</span>
                          <span className={`px-2 py-0.5 rounded-full font-bold ${ct.card_type === 'E-CODE' ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300' : 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'}`}>{ct.card_type}</span>
                          <span className="text-gray-500 dark:text-neutral-400">{formatMoney(ct.min_amount, curOf(ct.country))}{ct.max_amount ? `–${formatMoney(ct.max_amount, curOf(ct.country))}` : '+'}</span>
                          {Number(ct.rate) > 0 && <span className="text-[10px] text-gray-400 dark:text-neutral-500">· {Number(ct.rate).toLocaleString()} تومان/{currencySymbol(curOf(ct.country)).trim()}</span>}
                          {!ct.is_active && <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 dark:text-neutral-500">Hidden</span>}
                          {ct.requires_login && <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400"><Lock size={10} />Login</span>}
                          <div className="ml-auto flex items-center gap-1">
                            <button
                              onClick={() => patchCardType(ct.id, { is_active: !ct.is_active })}
                              title={ct.is_active ? 'Hide from store' : 'Show in store'}
                              className={`p-1.5 rounded-lg transition-colors ${ct.is_active ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950/40' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'}`}
                            >
                              {ct.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>
                            <button
                              onClick={() => patchCardType(ct.id, { requires_login: !ct.requires_login })}
                              title={ct.requires_login ? 'Login required (click to make public)' : 'Public (click to require login)'}
                              className={`p-1.5 rounded-lg transition-colors ${ct.requires_login ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'}`}
                            >
                              {ct.requires_login ? <Lock size={14} /> : <Unlock size={14} />}
                            </button>
                            <button onClick={() => deleteCardType(ct.id)} title="Delete" className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Add card type */}
                  <div className="grid grid-cols-2 md:grid-cols-7 gap-2 items-end">
                    <div className="col-span-2 md:col-span-2">
                      <label className="text-[8px] font-black text-gray-400 uppercase block mb-1">Country</label>
                      <select className={input} value={ctForm.country} onChange={(e) => setCtForm({ ...ctForm, country: e.target.value })}>
                        <option value="">Select…</option>
                        {countries.map((c) => <option key={c.iso_code} value={c.iso_code}>{c.name} ({c.currency_code})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-gray-400 uppercase block mb-1">Type</label>
                      <select className={input} value={ctForm.card_type} onChange={(e) => setCtForm({ ...ctForm, card_type: e.target.value })}>
                        {CARD_TYPES.map((t) => <option key={t.v} value={t.v}>{t.v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-gray-400 uppercase block mb-1">Min {currencySymbol(curOf(ctForm.country)).trim()}</label>
                      <input className={input} value={ctForm.min_amount} onChange={(e) => setCtForm({ ...ctForm, min_amount: e.target.value })} inputMode="decimal" />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-gray-400 uppercase block mb-1">Max {currencySymbol(curOf(ctForm.country)).trim()}</label>
                      <input className={input} value={ctForm.max_amount} onChange={(e) => setCtForm({ ...ctForm, max_amount: e.target.value })} inputMode="decimal" placeholder="opt" />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-gray-400 uppercase block mb-1">تومان/unit</label>
                      <input className={input} value={ctForm.rate} onChange={(e) => setCtForm({ ...ctForm, rate: e.target.value })} inputMode="decimal" placeholder="rate" />
                    </div>
                    <button onClick={() => addCardType(b)} disabled={ctSaving} className="bg-blue-600 text-white rounded-xl py-2.5 font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 disabled:opacity-50">
                      {ctSaving ? '…' : 'Add'}
                    </button>
                  </div>
                  <p className="text-[9px] text-gray-400 dark:text-neutral-500">تومان/unit = settlement rate (Toman per 1 {currencySymbol(curOf(ctForm.country)).trim() || 'unit'}). Leave blank to use the global USD rate.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
