"use client";
import React, { useState, useEffect } from 'react';
import { blogAPI } from '@/lib/api';
import { PenTool, Loader2, Pin, Eye, MessageSquare, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

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

interface Category { id: number; name: string; slug: string; post_count: number; }

export default function BlogPage() {
  const { t } = useI18n();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      blogAPI.listPosts({ page_size: 50 }),
      blogAPI.listCategories(),
    ]).then(([postsRes, catsRes]) => {
      setPosts(postsRes.data?.results || postsRes.data || []);
      setCategories(catsRes.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory
    ? posts.filter((p) => p.category === activeCategory)
    : posts;

  const pinned = filtered.filter((p) => p.is_pinned);
  const regular = filtered.filter((p) => !p.is_pinned);

  const fmt = (s: string) => new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b]">
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter flex items-center gap-3">
            <PenTool className="text-blue-600" size={40} /> {t('blogList.title')}
          </h1>
          <p className="text-sm text-gray-400 dark:text-neutral-500 font-bold mt-2">{t('blogList.subtitle')}</p>
        </div>

        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeCategory === null ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-700 dark:hover:bg-neutral-800'
              }`}>
              {t('blogList.all')}
            </button>
            {categories.map((c) => (
              <button key={c.id} onClick={() => setActiveCategory(c.id)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === c.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-700 dark:hover:bg-neutral-800'
                }`}>
                {c.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-16 text-center">
            <PenTool className="w-12 h-12 text-gray-300 dark:text-neutral-600 mx-auto mb-4" />
            <p className="text-gray-400 dark:text-neutral-500 font-bold">{t('blogList.empty')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pinned posts */}
            {pinned.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}
                className="block bg-white dark:bg-neutral-900 border-2 border-blue-200 dark:border-blue-900 rounded-2xl overflow-hidden hover:shadow-lg transition-all group">
                <div className="flex flex-col md:flex-row">
                  {post.featured_image && (
                    <div className="md:w-64 h-48 md:h-auto shrink-0 bg-gray-100 dark:bg-neutral-800">
                      <img src={post.featured_image} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Pin size={12} className="text-blue-600" />
                      <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{t('blogList.pinned')}</span>
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{post.title}</h2>
                    <p className="text-sm text-gray-500 dark:text-neutral-400 mt-2 line-clamp-2">{post.title}</p>
                    <div className="flex items-center gap-4 mt-4 text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Calendar size={10} /> {fmt(post.created_at)}</span>
                      {post.category_name && <span>{post.category_name}</span>}
                      <span className="flex items-center gap-1"><Eye size={10} /> {post.views_count}</span>
                      {post.comments_enabled && <span className="flex items-center gap-1"><MessageSquare size={10} /> {post.comment_count}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* Regular posts grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {regular.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}
                  className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl overflow-hidden hover:shadow-lg hover:border-gray-300 dark:hover:border-neutral-600 transition-all group">
                  {post.featured_image && (
                    <div className="h-48 bg-gray-100 dark:bg-neutral-800">
                      <img src={post.featured_image} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-5">
                    <h2 className="text-lg font-black text-gray-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">{post.title}</h2>
                    <p className="text-sm text-gray-500 dark:text-neutral-400 mt-2 line-clamp-2">{post.category_name || t('blogList.uncategorized')}</p>
                    <div className="flex items-center gap-3 mt-4 text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Calendar size={10} /> {fmt(post.created_at)}</span>
                      {post.category_name && <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-neutral-800">{post.category_name}</span>}
                      <span className="flex items-center gap-1"><Eye size={10} /> {post.views_count}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
