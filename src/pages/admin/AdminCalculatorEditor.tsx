import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { Calculator, Subcategory, CalculatorField, CalculatorOutput } from '../../types/schema.ts';
import { Save, ArrowLeft, Plus, Trash2, Check, AlertCircle } from 'lucide-react';

interface AdminCalculatorEditorProps {
  id?: string;
}

export const AdminCalculatorEditor: React.FC<AdminCalculatorEditorProps> = ({ id }) => {
  const isNew = !id || id === 'new';
  const [calculator, setCalculator] = useState<Partial<Calculator>>({
    name: '',
    slug: '',
    shortDescription: '',
    subcategoryId: '',
    fields: [],
    outputs: [],
  });
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const subs = await api.getSubcategories();
        setSubcategories(subs);

        if (!isNew && id) {
          const calcs = await api.getCalculators();
          const target = calcs.find((c) => c.id === id);
          if (target) setCalculator(target);
        } else if (subs.length > 0) {
          setCalculator((prev) => ({ ...prev, subcategoryId: subs[0].id }));
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isNew]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calculator.name || !calculator.slug || !calculator.subcategoryId) return;
    try {
      setSaving(true);
      await api.saveCalculator(calculator);
      setStatusMsg('Calculator saved successfully!');
      setTimeout(() => {
        window.location.href = '/admin/calculators';
      }, 1000);
    } catch (err: any) {
      alert(err.message || 'Error saving calculator');
    } finally {
      setSaving(false);
    }
  };

  const addField = () => {
    const newField: CalculatorField = {
      id: `field_${Date.now().toString().slice(-4)}`,
      label: 'New Field',
      type: 'number',
      defaultValue: 1000,
      min: 0,
      max: 1000000,
      step: 10,
      isAdvanced: false,
    };
    setCalculator((prev) => ({
      ...prev,
      fields: [...(prev.fields || []), newField],
    }));
  };

  const addOutput = () => {
    const newOutput: CalculatorOutput = {
      id: `out_${Date.now().toString().slice(-4)}`,
      label: 'Result Value',
      formula: '0',
      format: 'currency',
      prefix: '$',
      highlight: (calculator.outputs || []).length === 0,
    };
    setCalculator((prev) => ({
      ...prev,
      outputs: [...(prev.outputs || []), newOutput],
    }));
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading calculator editor...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a
            href="/admin/calculators"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </a>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {isNew ? 'Create New Calculator' : `Edit: ${calculator.name}`}
            </h1>
            <p className="text-xs text-slate-500">Configure Calculator.net inputs, formulas, and outputs</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-[#1dbf73] hover:bg-[#19a463] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Calculator'}</span>
        </button>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* General Settings */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b pb-2">General Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Calculator Name</label>
            <input
              type="text"
              required
              value={calculator.name || ''}
              onChange={(e) =>
                setCalculator({
                  ...calculator,
                  name: e.target.value,
                  slug: isNew ? e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : calculator.slug,
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
              value={calculator.slug || ''}
              onChange={(e) => setCalculator({ ...calculator, slug: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subcategory</label>
            <select
              required
              value={calculator.subcategoryId || ''}
              onChange={(e) => setCalculator({ ...calculator, subcategoryId: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
            >
              {subcategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1">Short Description</label>
            <textarea
              rows={2}
              value={calculator.shortDescription || ''}
              onChange={(e) => setCalculator({ ...calculator, shortDescription: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
            />
          </div>
        </div>
      </div>

      {/* Input Fields Builder */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Input Parameters ({calculator.fields?.length || 0})</h3>
            <p className="text-xs text-slate-500">Inputs marked as &quot;Advanced&quot; are collapsed by default under &quot;+ More Options&quot;</p>
          </div>
          <button
            type="button"
            onClick={addField}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Field</span>
          </button>
        </div>

        <div className="space-y-3">
          {calculator.fields?.map((f, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-6 gap-3 items-center">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Label</label>
                <input
                  type="text"
                  value={f.label}
                  onChange={(e) => {
                    const fields = [...(calculator.fields || [])];
                    fields[idx].label = e.target.value;
                    setCalculator({ ...calculator, fields });
                  }}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Variable ID</label>
                <input
                  type="text"
                  value={f.id}
                  onChange={(e) => {
                    const fields = [...(calculator.fields || [])];
                    fields[idx].id = e.target.value;
                    setCalculator({ ...calculator, fields });
                  }}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Default Value</label>
                <input
                  type="number"
                  value={typeof f.defaultValue === 'number' ? f.defaultValue : ''}
                  onChange={(e) => {
                    const fields = [...(calculator.fields || [])];
                    fields[idx].defaultValue = parseFloat(e.target.value) || 0;
                    setCalculator({ ...calculator, fields });
                  }}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div className="flex items-center gap-2 pt-3 sm:pt-0">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={f.isAdvanced || false}
                    onChange={(e) => {
                      const fields = [...(calculator.fields || [])];
                      fields[idx].isAdvanced = e.target.checked;
                      setCalculator({ ...calculator, fields });
                    }}
                    className="rounded text-[#1dbf73]"
                  />
                  <span>Advanced</span>
                </label>
              </div>
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    const fields = (calculator.fields || []).filter((_, i) => i !== idx);
                    setCalculator({ ...calculator, fields });
                  }}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Outputs & Formulas Builder */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Output Formulas ({calculator.outputs?.length || 0})</h3>
            <p className="text-xs text-slate-500">Mathematical expressions using field IDs (e.g. `p * pow(1 + r, n)`)</p>
          </div>
          <button
            type="button"
            onClick={addOutput}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Output</span>
          </button>
        </div>

        <div className="space-y-3">
          {calculator.outputs?.map((out, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Output Label</label>
                  <input
                    type="text"
                    value={out.label}
                    onChange={(e) => {
                      const outputs = [...(calculator.outputs || [])];
                      outputs[idx].label = e.target.value;
                      setCalculator({ ...calculator, outputs });
                    }}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Variable ID</label>
                  <input
                    type="text"
                    value={out.id}
                    onChange={(e) => {
                      const outputs = [...(calculator.outputs || [])];
                      outputs[idx].id = e.target.value;
                      setCalculator({ ...calculator, outputs });
                    }}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={out.highlight || false}
                      onChange={(e) => {
                        const outputs = [...(calculator.outputs || [])];
                        outputs[idx].highlight = e.target.checked;
                        setCalculator({ ...calculator, outputs });
                      }}
                      className="rounded text-[#1dbf73]"
                    />
                    <span>Highlight (Hero)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const outputs = (calculator.outputs || []).filter((_, i) => i !== idx);
                      setCalculator({ ...calculator, outputs });
                    }}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Mathematical Formula</label>
                <input
                  type="text"
                  value={out.formula || ''}
                  onChange={(e) => {
                    const outputs = [...(calculator.outputs || [])];
                    outputs[idx].formula = e.target.value;
                    setCalculator({ ...calculator, outputs });
                  }}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-blue-700"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
};
