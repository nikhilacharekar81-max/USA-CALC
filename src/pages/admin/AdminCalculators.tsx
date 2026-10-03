import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { Calculator, Subcategory, Category } from '../../types/schema.ts';
import { Plus, Edit2, Trash2, Eye, Search, AlertCircle, Check } from 'lucide-react';

export const AdminCalculators: React.FC = () => {
  const [calculators, setCalculators] = useState<Calculator[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const loadData = async () => {
    try {
      const [calcs, subs, cats] = await Promise.all([
        api.getCalculators(),
        api.getSubcategories(),
        api.getCategories(),
      ]);
      setCalculators(calcs);
      setSubcategories(subs);
      setCategories(cats);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const initiateDelete = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const filtered = calculators.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const getUrl = (calc: Calculator) => {
    const sub = subcategories.find((s) => s.id === calc.subcategoryId);
    const cat = categories.find((c) => c.id === sub?.categoryId);
    if (cat && sub) return `/${cat.slug}/${sub.slug}/${calc.slug}`;
    return `/${calc.slug}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Manage Calculators</h1>
          <p className="text-xs text-slate-500">
            {calculators.length} calculators deployed with Calculator.net Engine
          </p>
        </div>
        <a
          href="/admin/calculators/new"
          className="px-4 py-2 bg-[#1dbf73] hover:bg-[#19a463] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Calculator</span>
        </a>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter calculators by name or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs font-medium text-slate-900 outline-none"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-3.5">Calculator</th>
              <th className="p-3.5">Subcategory</th>
              <th className="p-3.5">Inputs</th>
              <th className="p-3.5">Outputs</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((calc) => {
              const sub = subcategories.find((s) => s.id === calc.subcategoryId);
              return (
                <tr key={calc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{calc.name}</div>
                    <div className="font-mono text-[10px] text-slate-400">{calc.slug}</div>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-600">{sub?.name || '—'}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                      {calc.fields?.length || 0} fields
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                      {calc.outputs?.length || 0} outputs
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={getUrl(calc)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`/admin/calculators/${calc.id}`}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => initiateDelete(calc.id, calc.name)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Custom State-Driven Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">Delete Calculator?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to delete the calculator <strong>{deleteConfirm.name}</strong>? This action is permanent and cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await api.deleteCalculator(deleteConfirm.id);
                    setDeleteConfirm(null);
                    setStatusMsg('Calculator deleted successfully!');
                    setTimeout(() => setStatusMsg(''), 3000);
                    loadData();
                  } catch (err: any) {
                    setErrorMsg(err.message || 'Error deleting calculator');
                    setDeleteConfirm(null);
                    setTimeout(() => setErrorMsg(''), 5000);
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
