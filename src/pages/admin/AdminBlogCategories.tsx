import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, Edit2 } from 'lucide-react';

export const AdminBlogCategories: React.FC = () => {
  const [categories, setCategories] = useState([
    { id: 'cat_1', name: 'Mortgage & Housing', count: 12 },
    { id: 'cat_2', name: 'Taxes & Deductions', count: 8 },
    { id: 'cat_3', name: 'Investing & 401(k)', count: 15 },
    { id: 'cat_4', name: 'Loans & Amortization', count: 10 },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Blog & Guide Categories</h1>
          <p className="text-xs text-slate-500">Manage categories for financial editorial articles</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-3.5">Category Name</th>
              <th className="p-3.5">Articles Count</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-3.5 font-bold text-slate-900">{c.name}</td>
                <td className="p-3.5 text-slate-600">{c.count} posts</td>
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button type="button" className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
