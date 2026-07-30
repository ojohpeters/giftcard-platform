"use client";
import React, { useState, useEffect } from 'react';
import { blogAdminAPI, apiError } from '@/lib/api';
import { Folder, Loader2, Plus, Trash2, Save, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Category { id: number; name: string; slug: string; description: string; post_count: number; created_at: string; }

export default function AdminBlogCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await blogAdminAPI.listCategories();
      setCategories(res.data?.results || res.data || []);
    } catch (err: any) { setError(apiError(err, 'Failed to load categories')); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const createCategory = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setError('');
    try {
      await blogAdminAPI.createCategory({ name: newName.trim(), description: newDesc.trim() });
      setNewName('');
      setNewDesc('');
      load();
    } catch (err: any) { setError(apiError(err, 'Failed to create category')); }
    finally { setCreating(false); }
  };

  const saveEdit = async (id: number) => {
    setBusyId(id);
    setError('');
    try {
      await blogAdminAPI.updateCategory(id, { name: editName.trim(), description: editDesc.trim() });
      setEditingId(null);
      load();
    } catch (err: any) { setError(apiError(err, 'Failed to update category')); }
    finally { setBusyId(null); }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm('Delete this category?')) return;
    setBusyId(id);
    setError('');
    try {
      await blogAdminAPI.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) { setError(apiError(err, 'Failed to delete category')); }
    finally { setBusyId(null); }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link href="/admin/blog" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest hover:text-gray-700 dark:hover:text-neutral-300 mb-3">
          <ArrowLeft size={12} /> Back to posts
        </Link>
        <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter flex items-center gap-3">
          <Folder className="text-blue-600" size={34} /> Categories
        </h1>
        <p className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mt-1">Organize your posts</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-900 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-red-700 dark:text-red-300 font-bold flex-1">{error}</p>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {/* Create new */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-5 space-y-3">
        <p className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest">New Category</p>
        <div className="flex gap-3">
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="Category name"
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:border-blue-600 text-sm font-bold dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100" />
          <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:border-blue-600 text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100" />
          <button disabled={creating || !newName.trim()} onClick={createCategory}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shrink-0">
            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-blue-600" /></div>
        ) : categories.length === 0 ? (
          <div className="p-10 text-center text-gray-400 dark:text-neutral-500 font-bold text-sm">No categories yet.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-neutral-800">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-all">
                {editingId === cat.id ? (
                  <>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 outline-none focus:border-blue-600 text-sm font-bold dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100" />
                    <input type="text" value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="Description"
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 outline-none focus:border-blue-600 text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100" />
                    <button disabled={busyId === cat.id} onClick={() => saveEdit(cat.id)}
                      className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-all disabled:opacity-50"><Save size={14} /></button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-all"><X size={14} /></button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm text-gray-900 dark:text-neutral-100">{cat.name}</p>
                      {cat.description && <p className="text-xs text-gray-400 dark:text-neutral-500 truncate mt-0.5">{cat.description}</p>}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 shrink-0">{cat.post_count} posts</span>
                    <button onClick={() => { setEditingId(cat.id); setEditName(cat.name); setEditDesc(cat.description); }}
                      className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-neutral-800 text-[10px] font-bold text-gray-600 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all shrink-0">
                      Edit
                    </button>
                    <button disabled={busyId === cat.id} onClick={() => deleteCategory(cat.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-400 hover:text-red-600 transition-all disabled:opacity-50 shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
