import React from 'react';
import { BookOpen, TrendingUp, Users, FileText } from 'lucide-react';

export const AdminBlogDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">Blog Analytics & Editorial Dashboard</h1>
        <p className="text-xs text-slate-500">Monitor readership, published guides, and SEO impressions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase">Published Guides</span>
          <div className="text-2xl font-black text-slate-900">24</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase">Monthly Readers</span>
          <div className="text-2xl font-black text-[#1dbf73]">14,280</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase">Calculator Conversions</span>
          <div className="text-2xl font-black text-blue-600">68.4%</div>
        </div>
      </div>
    </div>
  );
};
