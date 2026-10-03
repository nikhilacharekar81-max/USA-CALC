import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { Subcategory, Category } from '../../types/schema.ts';
import { Plus, Edit2, Trash2, Check, AlertCircle } from 'lucide-react';

export const AdminSubcategories: React.FC = () => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingSub, setEditingSub] = useState<Partial<Subcategory> | null>(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; force: boolean; message?: string } | null>(null);

  const loadData = async () => {
    try {
      const [subs, cats] = await Promise.all([api.getSubcategories(), api.getCategories()]);
      setSubcategories(subs);
      setCategories(cats);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub?.name || !editingSub?.slug || !editingSub?.categoryId) return;
    try {
      await api.saveSubcategory(editingSub);
      setStatusMsg('Subcategory saved successfully!');
      setEditingSub(null);
      loadData();
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving subcategory');
      setTimeout(() => setErrorMsg(''), 5000);
    }
  };

  const initiateDelete = (id: string, name: string) => {
    setDeleteConfirm({ id, name, force: false });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Manage Subcategories</h1>
          <p className="text-xs text-slate-500">Group calculators by functional themes</p>
        </div>
        <button
          type="button"
          onClick={() =>
            setEditingSub({
              name: '',
              slug: '',
              categoryId: categories[0]?.id || '',
              description: '',
            })
          }
          className="px-4 py-2 bg-[#1dbf73] hover:bg-[#19a463] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Subcategory</span>
        </button>
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

      {editingSub && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b pb-2">
            {editingSub.id ? 'Edit Subcategory' : 'Create New Subcategory'}
          </h3>
          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Parent Category</label>
              <select
                required
                value={editingSub.categoryId || ''}
                onChange={(e) => setEditingSub({ ...editingSub, categoryId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subcategory Name</label>
              <input
                type="text"
                required
                value={editingSub.name || ''}
                onChange={(e) =>
                  setEditingSub({
                    ...editingSub,
                    name: e.target.value,
                    slug: editingSub.id ? editingSub.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                  })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">URL Slug</label>
              <input
                type="text"
                required
                value={editingSub.slug || ''}
                onChange={(e) => setEditingSub({ ...editingSub, slug: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={editingSub.description || ''}
                onChange={(e) => setEditingSub({ ...editingSub, description: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
              />
            </div>
            <div className="sm:col-span-3 flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingSub(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#1dbf73] hover:bg-[#19a463] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Save Subcategory
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-3.5">Subcategory Name</th>
              <th className="p-3.5">Parent Category</th>
              <th className="p-3.5">URL Slug</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subcategories.map((s) => {
              const cat = categories.find((c) => c.id === s.categoryId);
              return (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">{s.name}</td>
                  <td className="p-3.5 font-semibold text-slate-600">{cat?.name || '—'}</td>
                  <td className="p-3.5 font-mono text-slate-500">/{s.slug}</td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingSub(s)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => initiateDelete(s.id, s.name)}
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
                <h3 className="text-base font-black text-slate-900">
                  {deleteConfirm.message ? 'Force Delete Subcategory & All Contents?' : 'Delete Subcategory?'}
                </h3>
                <div className="text-xs text-slate-500 leading-relaxed">
                  {deleteConfirm.message ? (
                    <span className="text-rose-700 font-semibold">{deleteConfirm.message}</span>
                  ) : (
                    <>Are you sure you want to delete the subcategory <strong>{deleteConfirm.name}</strong>?</>
                  )}
                </div>
                {deleteConfirm.message && (
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-2 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                    ⚠️ Warning: This will cascade delete all calculators in this subcategory. This action is permanent and cannot be undone.
                  </p>
                )}
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
                    await api.deleteSubcategory(deleteConfirm.id, deleteConfirm.force);
                    setDeleteConfirm(null);
                    setStatusMsg(deleteConfirm.force ? 'Subcategory and all calculators deleted successfully!' : 'Subcategory deleted successfully!');
                    setTimeout(() => setStatusMsg(''), 3000);
                    loadData();
                  } catch (err: any) {
                    if (err.message && err.message.includes('contains')) {
                      setDeleteConfirm({
                        ...deleteConfirm,
                        force: true,
                        message: err.message
                      });
                    } else {
                      setErrorMsg(err.message || 'Error deleting subcategory');
                      setDeleteConfirm(null);
                      setTimeout(() => setErrorMsg(''), 5000);
                    }
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                {deleteConfirm.message ? 'Force Delete & Cascade' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
