import React from 'react';
import { BlogPost } from '../types/schema.ts';
import { Breadcrumbs } from '../components/layout/Breadcrumbs.tsx';
import { Calendar, User, ArrowLeft, Share2 } from 'lucide-react';

interface BlogPostPageProps {
  post: BlogPost;
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({ post }) => {
  const breadcrumbs = [
    { label: 'Blog', href: '/blog' },
    { label: post.title, isCurrent: true },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Breadcrumbs items={breadcrumbs} />

      <article className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        {/* Post Header */}
        <div className="space-y-4 border-b border-slate-100 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-[#1dbf73] border border-emerald-100 rounded-full text-xs font-bold uppercase tracking-wider">
            <span>{post.category || 'Financial Guide'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
            {post.author && (
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-700">
                  {typeof post.author === 'string' ? post.author : post.author?.name || 'Admin'}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Published recently'}</span>
            </div>
          </div>
        </div>

        {/* Post Image */}
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-80 object-cover rounded-2xl border border-slate-100"
          />
        )}

        {/* Post Content */}
        <div
          className="prose prose-slate max-w-none prose-headings:font-black prose-a:text-[#1dbf73] prose-img:rounded-2xl text-slate-700 leading-relaxed text-sm sm:text-base space-y-4"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Post Footer */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <a
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Articles</span>
          </a>
        </div>
      </article>
    </div>
  );
};
