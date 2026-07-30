"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { blogAdminAPI, apiError } from '@/lib/api';
import { PenTool, Loader2, ArrowLeft, Save, ImagePlus, Upload } from 'lucide-react';
import Link from 'next/link';

interface Category { id: number; name: string; slug: string; }

export default function AdminBlogEditPage() {
  const router = useRouter();
  const params = useParams();
  const postId = Number(params.id);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    meta_description: '',
    featured_image: '',
    category: '',
    tags: '',
    is_published: false,
    is_pinned: false,
    comments_enabled: true,
  });

  useEffect(() => {
    Promise.all([
      blogAdminAPI.getPost(postId),
      blogAdminAPI.listCategories(),
    ]).then(([postRes, catRes]) => {
      const post = postRes.data;
      setForm({
        title: post.title,
        content: post.content,
        meta_description: post.meta_description || '',
        featured_image: post.featured_image || '',
        category: post.category ? String(post.category) : '',
        tags: (post.tags || []).map((t: any) => t.name).join(', '),
        is_published: post.is_published,
        is_pinned: post.is_pinned,
        comments_enabled: post.comments_enabled,
      });
      setCategories(catRes.data?.results || catRes.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [postId]);

  // Upload an image and set it as the cover.
  const uploadCover = async (file: File) => {
    setUploading(true);
    try {
      const r = await blogAdminAPI.uploadImage(file);
      setForm((f) => ({ ...f, featured_image: r.data.url }));
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Image upload failed');
    } finally { setUploading(false); }
  };

  // Upload an image and insert it into the markdown content.
  const insertImage = async (file: File) => {
    setUploading(true);
    try {
      const r = await blogAdminAPI.uploadImage(file);
      setForm((f) => ({ ...f, content: `${f.content}\n\n![](${r.data.url})\n` }));
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Image upload failed');
    } finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        title: form.title,
        content: form.content,
        meta_description: form.meta_description,
        featured_image: form.featured_image,
        is_published: form.is_published,
        is_pinned: form.is_pinned,
        comments_enabled: form.comments_enabled,
      };
      if (form.category) payload.category = Number(form.category);
      else payload.category = null;
      if (form.tags.trim()) payload.tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
      else payload.tags = [];

      await blogAdminAPI.updatePost(postId, payload);
      router.push('/admin/blog');
    } catch (err: any) {
      alert(apiError(err, 'Failed to update post'));
    } finally { setSaving(false); }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link href="/admin/blog" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest hover:text-gray-700 dark:hover:text-neutral-300 mb-3">
          <ArrowLeft size={12} /> Back to posts
        </Link>
        <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter flex items-center gap-3">
          <PenTool className="text-blue-600" size={34} /> Edit Post
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-6">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5">Title</label>
          <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-blue-600 text-sm font-bold dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100" />
        </div>

        {/* Content (Markdown) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest">Content (Markdown)</label>
            <label className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border-2 cursor-pointer transition-all ${uploading ? 'opacity-50 pointer-events-none border-gray-200 dark:border-neutral-700' : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'}`}>
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <ImagePlus size={12} />} Insert image
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) insertImage(f); e.target.value = ''; }} />
            </label>
          </div>
          <textarea required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={16}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-blue-600 text-sm font-mono dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100 resize-y" />
          <p className="text-[10px] text-gray-400 dark:text-neutral-500 mt-1.5">
            Markdown: <code># Heading</code> · <code>**bold**</code> · <code>[link text](https://url)</code> · <code>![](image-url)</code> · <code>&gt; quote</code> · <code>- list</code>
          </p>
        </div>

        {/* Meta description (SEO) */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5">
            Meta Description (SEO) <span className="text-gray-300 dark:text-neutral-600">· {form.meta_description.length}/160</span>
          </label>
          <textarea value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
            rows={2} maxLength={300}
            placeholder="Short summary shown in Google results and link previews..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-blue-600 text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100 resize-y" />
        </div>

        {/* Featured Image (upload or URL) */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5">Featured Image</label>
          <div className="flex items-center gap-3">
            {form.featured_image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.featured_image} alt="" className="w-16 h-16 rounded-xl object-cover border border-gray-200 dark:border-neutral-700 shrink-0" />
            )}
            <input type="url" value={form.featured_image} onChange={(e) => setForm({ ...form, featured_image: e.target.value })}
              placeholder="https://... or upload →"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-blue-600 text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100" />
            <label className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl border-2 cursor-pointer shrink-0 transition-all ${uploading ? 'opacity-50 pointer-events-none border-gray-200 dark:border-neutral-700' : 'border-black dark:border-neutral-700 hover:border-blue-600 hover:text-blue-600'}`}>
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />} Upload
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); e.target.value = ''; }} />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-blue-600 text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100">
              <option value="">None</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5">Tags (comma-separated)</label>
            <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="update, news, promo"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-blue-600 text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100" />
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
            <span className="text-sm font-bold text-gray-700 dark:text-neutral-300">Published</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_pinned} onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
            <span className="text-sm font-bold text-gray-700 dark:text-neutral-300">Pinned</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.comments_enabled} onChange={(e) => setForm({ ...form, comments_enabled: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
            <span className="text-sm font-bold text-gray-700 dark:text-neutral-300">Comments Enabled</span>
          </label>
        </div>

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </form>
    </div>
  );
}
