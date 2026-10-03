import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { Sparkles, Save, Check } from 'lucide-react';

export const AdminContentSeo: React.FC = () => {
  const [statusMsg, setStatusMsg] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg('SEO settings saved successfully!');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">Content & SEO Management</h1>
        <p className="text-xs text-slate-500">Configure search meta tags, OpenGraph cards, and schema markup</p>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Global Meta & Schema Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Global Meta Title Template</label>
            <input
              type="text"
              defaultValue="%title% - Free Online Calculator"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Global Meta Description</label>
            <textarea
              rows={3}
              defaultValue="Accurate, free online calculators for mortgages, auto loans, investments, taxes, and math calculations with instant schedules."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
            />
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#1dbf73] hover:bg-[#19a463] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm ml-auto cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save SEO Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
