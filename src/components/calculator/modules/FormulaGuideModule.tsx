import React from 'react';
import { Calculator } from '../../../types/schema.ts';
import { BookOpen, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';

interface FormulaGuideModuleProps {
  calculator: Calculator;
}

export const FormulaGuideModule: React.FC<FormulaGuideModuleProps> = ({ calculator }) => {
  const fields = calculator.fields || [];
  const outputs = calculator.outputs || [];

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
          <BookOpen className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900">
            Mathematical Methodology & Formulas ({calculator.name})
          </h3>
          <p className="text-xs text-slate-500">
            How this calculation is mathematically computed according to industry standards
          </p>
        </div>
      </div>

      {/* Formulas List */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Primary Calculation Formulas
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outputs.map((out) => (
            <div key={out.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-900 block">{out.label}</span>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-blue-700 break-all overflow-x-auto shadow-2xs">
                {out.formula || 'Calculated dynamically based on inputs'}
              </div>
              {out.description && (
                <p className="text-[11px] text-slate-500">{out.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Variables Dictionary */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Input Variables & Parameter Glossary
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {fields.map((f) => (
            <div key={f.id} className="p-3 bg-slate-50/75 rounded-xl border border-slate-100 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>{f.label}</span>
                <span className="text-[10px] text-slate-400 font-mono">({f.id})</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {f.helpText || `Default: ${f.defaultValue}${f.suffix ? ` ${f.suffix}` : ''}`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
