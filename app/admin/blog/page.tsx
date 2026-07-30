"use client";
import React, { useState, useEffect } from 'react';
import { blogAdminAPI } from '@/lib/api';
import { PenTool, Loader2, Plus, Trash2, Pin, Eye, EyeOff, MessageSquare, MessageSquareOff, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface Post {
  id: number;
  title: string;
  slug: string;
  author_email: string;
  featured_image: string;
  category: number | null;
  category_name: string | null;
  tags: { id: number; name: string }[];
  is_published: boolean;
  is_pinned: boolean;
  comments_enabled: boolean;
  views_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await blogAdminAPI.listPosts();
      setPosts(res.data?.results || res.data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { loadPosts(); }, []);

  const togglePublish = async (id: number) => {
    setBusyId(id);
    try {
      const res = await blogAdminAPI.togglePublish(id);
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, is_published: res.data.is_published } : p));
    } catch {} finally { setBusyId(null); }
  };

  const togglePin = async (id: number) => {
    setBusyId(id);
    try {
      const res = await blogAdminAPI.togglePin(id);
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, is_pinned: res.data.is_pinned } : p));
    } catch {} finally { setBusyId(null); }
  };

  const toggleComments = async (id: number) => {
    setBusyId(id);
    try {
      const res = await blogAdminAPI.toggleComments(id);
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, comments_enabled: res.data.comments_enabled } : p));
    } catch {} finally { setBusyId(null); }
  };

  const deletePost = async (id: number) => {
    if (!confirm('Delete this post permanently?')) return;
    setBusyId(id);
    try {
      await blogAdminAPI.deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {} finally { setBusyId(null); }
  };

  const filtered = posts.filter((p) => {
    if (filter === 'published') return p.is_published;
    if (filter === 'draft') return !p.is_published;
    return true;
  });

  const fmt = (s: string) => new Date(s).toLocaleDateString();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter flex items-center gap-3">
            <PenTool className="text-blue-600" size={34} /> Blog
          </h1>
          <p className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mt-1">Manage posts &amp; announcements</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/blog/categories"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-sm font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all">
            Categories
          </Link>
          <Link href="/admin/blog/tags"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-sm font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all">
            Tags
          </Link>
          <Link href="/admin/blog/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all">
            <Plus size={16} /> New Post
          </Link>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'published', 'draft'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-700 dark:hover:bg-neutral-800'
            }`}>
            {f}
          </button>
        ))}
        <span className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest self-center ml-2">
          {filtered.length} post{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Posts table */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-blue-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400 dark:text-neutral-500 font-bold text-sm">
            No {filter === 'all' ? '' : filter} posts yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-neutral-800">
            {filtered.map((post) => (
              <div key={post.id} className="flex items-center gap-4 px-4 md:px-6 py-4 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-all">
                {/* Thumbnail */}
                <div className="shrink-0 w-16 h-16 rounded-xl bg-gray-100 dark:bg-neutral-800 overflow-hidden">
                  {post.featured_image ? (
                    <img src={post.featured_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-neutral-600">
                      <PenTool size={20} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {post.is_pinned && <Pin size={12} className="text-blue-600 shrink-0" />}
                    <p className="font-black text-sm text-gray-900 dark:text-neutral-100 truncate">{post.title}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400 dark:text-neutral-500 font-bold">
                    <span>{fmt(post.created_at)}</span>
                    {post.category_name && <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-neutral-800">{post.category_name}</span>}
                    <span>{post.views_count} views</span>
                    <span>{post.comment_count} comments</span>
                  </div>
                </div>

                {/* Status + actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[9px] font-black px-2 py-1 rounded-full border uppercase ${
                    post.is_published
                      ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800'
                      : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700'
                  }`}>
                    {post.is_published ? 'Published' : 'Draft'}
                  </span>

                  <button disabled={busyId === post.id} onClick={() => togglePublish(post.id)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 hover:text-gray-700 dark:hover:text-neutral-300 transition-all disabled:opacity-50"
                    title={post.is_published ? 'Unpublish' : 'Publish'}>
                    {post.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button disabled={busyId === post.id} onClick={() => togglePin(post.id)}
                    className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all disabled:opacity-50 ${post.is_pinned ? 'text-blue-600' : 'text-gray-400 hover:text-gray-700 dark:hover:text-neutral-300'}`}
                    title={post.is_pinned ? 'Unpin' : 'Pin'}>
                    <Pin size={14} />
                  </button>
                  <button disabled={busyId === post.id} onClick={() => toggleComments(post.id)}
                    className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all disabled:opacity-50 ${post.comments_enabled ? 'text-gray-400 hover:text-gray-700 dark:hover:text-neutral-300' : 'text-red-500'}`}
                    title={post.comments_enabled ? 'Disable comments' : 'Enable comments'}>
                    {post.comments_enabled ? <MessageSquare size={14} /> : <MessageSquareOff size={14} />}
                  </button>

                  <Link href={`/admin/blog/edit/${post.id}`}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 hover:text-gray-700 dark:hover:text-neutral-300 transition-all"
                    title="Edit">
                    <ArrowUpRight size={14} />
                  </Link>
                  <button disabled={busyId === post.id} onClick={() => deletePost(post.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-400 hover:text-red-600 transition-all disabled:opacity-50"
                    title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
