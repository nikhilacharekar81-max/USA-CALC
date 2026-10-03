import React from 'react';
import { BlogPost } from '../types/schema.ts';
import { Breadcrumbs } from '../components/layout/Breadcrumbs.tsx';
import { BookOpen, Calendar, User, ArrowRight } from 'lucide-react';

interface BlogIndexPageProps {
  posts: BlogPost[];
}

export const BlogIndexPage: React.FC<BlogIndexPageProps> = ({ posts = [] }) => {
  const published = posts.filter((p) => p.isPublished !== false);

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: 'Blog & Financial Guides', isCurrent: true }]} />

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-[#1dbf73] uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Articles & Editorial Analysis</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Financial & Mathematical Insights
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Expert breakdowns on mortgage amortizations, tax deductions, investment compounding, and loan strategies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {published.map((post) => (
          <article
            key={post.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            {post.coverImage && (
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-44 object-cover"
              />
            )}
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1dbf73] px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-100 inline-block">
                  {post.category || 'Finance'}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-2">
                  <a href={`/blog/${post.slug}`} className="hover:text-[#1dbf73] transition-colors">
                    {post.title}
                  </a>
                </h2>
                {post.excerpt && (
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Recent'}</span>
                </div>
                <a
                  href={`/blog/${post.slug}`}
                  className="font-bold text-[#1dbf73] hover:text-[#19a463] flex items-center gap-1"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
