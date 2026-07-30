"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { blogAPI, authAPI } from '@/lib/api';
import { Loader2, ArrowLeft, Pin, Eye, MessageSquare, Calendar, Send, User } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/lib/i18n';

interface Comment {
  id: number;
  author_email: string;
  content: string;
  is_approved: boolean;
  created_at: string;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  author_email: string;
  content: string;
  featured_image: string;
  category: number | null;
  category_name: string | null;
  tags: { id: number; name: string }[];
  is_published: boolean;
  is_pinned: boolean;
  comments_enabled: boolean;
  views_count: number;
  comment_count: number;
  comments: Comment[];
  created_at: string;
  updated_at: string;
}

function renderMarkdown(md: string): string {
  let html = md
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-black text-gray-900 dark:text-neutral-100 mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-black text-gray-900 dark:text-neutral-100 mt-8 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-black text-gray-900 dark:text-neutral-100 mt-8 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-black text-gray-900 dark:text-neutral-100">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-s-4 border-blue-600 ps-4 my-4 text-gray-600 dark:text-neutral-400 italic">$1</blockquote>')
    .replace(/^\- (.+)$/gm, '<li class="ml-4 text-gray-700 dark:text-neutral-300">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 text-gray-700 dark:text-neutral-300 list-decimal">$2</li>')
    // Images MUST run before links — ![alt](url) contains a [](), so the link
    // rule would otherwise swallow it and render a broken link instead.
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-2xl my-5 w-full h-auto border border-gray-100 dark:border-neutral-800" loading="lazy" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^---$/gm, '<hr class="my-6 border-gray-200 dark:border-neutral-700" />')
    .replace(/\n\n/g, '</p><p class="text-gray-700 dark:text-neutral-300 leading-relaxed mb-4">')
    .replace(/\n/g, '<br />');
  return `<p class="text-gray-700 dark:text-neutral-300 leading-relaxed mb-4">${html}</p>`;
}

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { t } = useI18n();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  useEffect(() => {
    blogAPI.getPost(slug)
      .then((res) => setPost(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const submitComment = async () => {
    if (!commentText.trim() || !post) return;
    setSendingComment(true);
    try {
      const res = await blogAPI.createComment(slug, commentText.trim());
      setPost((prev) => prev ? { ...prev, comments: [...prev.comments, res.data] } : prev);
      setCommentText('');
    } catch {} finally { setSendingComment(false); }
  };

  const fmt = (s: string) => new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 dark:text-neutral-500 font-bold">{t('blogPost.notFound')}</p>
          <Link href="/blog" className="text-blue-600 text-sm font-bold mt-2 inline-block hover:underline">{t('blogPost.backToBlog')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b]">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest hover:text-gray-700 dark:hover:text-neutral-300 mb-8">
          <ArrowLeft size={12} /> {t('blogPost.allPosts')}
        </Link>

        {/* Post header */}
        <article>
          {post.is_pinned && (
            <div className="flex items-center gap-1.5 mb-3">
              <Pin size={12} className="text-blue-600" />
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{t('blogPost.pinned')}</span>
            </div>
          )}

          <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-neutral-100 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 mt-4 text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest flex-wrap">
            <span className="flex items-center gap-1"><Calendar size={10} /> {fmt(post.created_at)}</span>
            {post.category_name && <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-neutral-800">{post.category_name}</span>}
            <span className="flex items-center gap-1"><Eye size={10} /> {post.views_count} {t('blogPost.views')}</span>
            {post.comments_enabled && <span className="flex items-center gap-1"><MessageSquare size={10} /> {post.comments.length} {t('blogPost.comments')}</span>}
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {post.tags.map((t) => (
                <span key={t.id} className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[9px] font-black uppercase tracking-widest">
                  {t.name}
                </span>
              ))}
            </div>
          )}

          {/* Featured image */}
          {post.featured_image && (
            <div className="mt-8 rounded-2xl overflow-hidden bg-gray-100 dark:bg-neutral-800">
              <img src={post.featured_image} alt={post.title} className="w-full object-cover max-h-96" />
            </div>
          )}

          {/* Content */}
          <div
            className="mt-8 prose prose-gray dark:prose-invert max-w-none text-base"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
          />
        </article>

        {/* Comments section */}
        {post.comments_enabled && (
          <div className="mt-16 border-t border-gray-200 dark:border-neutral-800 pt-10">
            <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-neutral-100 mb-6 flex items-center gap-2">
              <MessageSquare size={20} className="text-blue-600" /> {t('blogPost.commentsHeading')} ({post.comments.length})
            </h2>

            {/* Existing comments */}
            <div className="space-y-4 mb-8">
              {post.comments.length === 0 && (
                <p className="text-sm text-gray-400 dark:text-neutral-500 font-bold">{t('blogPost.noComments')}</p>
              )}
              {post.comments.map((c) => (
                <div key={c.id} className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                      <User size={14} className="text-gray-400 dark:text-neutral-500" />
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-neutral-100">{c.author_email}</span>
                    <span className="text-[9px] text-gray-400 dark:text-neutral-500 font-bold">{fmt(c.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-neutral-300 whitespace-pre-wrap">{c.content}</p>
                </div>
              ))}
            </div>

            {/* New comment form */}
            {isAuthenticated ? (
              <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-5">
                <p className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-3">{t('blogPost.leaveComment')}</p>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={4}
                  placeholder={t('blogPost.commentPlaceholder')}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-blue-600 text-sm resize-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100"
                />
                <button onClick={submitComment} disabled={sendingComment || !commentText.trim()}
                  className="flex items-center gap-2 mt-3 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all">
                  {sendingComment ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  {t('blogPost.postComment')}
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-5 text-center">
                <p className="text-sm text-gray-400 dark:text-neutral-500 font-bold">
                  <Link href="/login" className="text-blue-600 hover:underline">{t('blogPost.logIn')}</Link>{' '}{t('blogPost.loginToComment')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
