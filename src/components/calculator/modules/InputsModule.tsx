import React, { useState } from 'react';
import { Sliders, RotateCcw, HelpCircle, ChevronDown, ChevronUp, PlusCircle, MinusCircle } from 'lucide-react';
import { CalculatorField } from '../../../types/schema.ts';

interface InputsModuleProps {
  fields: CalculatorField[];
  formValues: Record<string, any>;
  onValueChange: (fieldId: string, value: any) => void;
  onReset?: () => void;
  settings?: {
    title?: string;
    layout?: 'single' | 'two-column';
    showResetButton?: boolean;
    primaryFieldCount?: number;
  };
}

export const InputsModule: React.FC<InputsModuleProps> = ({
  fields = [],
  formValues,
  onValueChange,
  onReset,
  settings = {},
}) => {
  const title = settings.title || 'Parameters & Inputs';
  const isTwoColumn = settings.layout !== 'single';
  const showReset = settings.showResetButton !== false;
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Group fields into primary and advanced collapsible sets
  // Hide complex metrics by default to keep UI clean (e.g. extra monthly principal payments, custom tax inflation rates, HOA fees)
  const isAdvancedField = (field: CalculatorField, index: number) => {
    if (field.isAdvanced === true) return true;
    if (field.isAdvanced === false) return false;
    if (fields.length <= 3) return false;

    const id = field.id.toLowerCase();
    const label = field.label.toLowerCase();

    const matchesAdvanced = (
      id.includes('extra') ||
      id.includes('prepay') ||
      id.includes('tax') ||
      id.includes('insurance') ||
      id.includes('pmi') ||
      id.includes('hoa') ||
      id.includes('other') ||
      id.includes('fee') ||
      id.includes('deduction') ||
      id.includes('credit') ||
      id.includes('increase') ||
      id.includes('inflation') ||
      id.includes('adjustment') ||
      id.includes('maintenance') ||
      id.includes('vacancy') ||
      id.includes('management') ||
      id.includes('closing') ||
      id.includes('depreciation') ||
      id.includes('match') ||
      id.includes('cap') ||
      label.includes('extra') ||
      label.includes('fee') ||
      label.includes('insurance') ||
      label.includes('hoa') ||
      label.includes('tax') ||
      label.includes('inflation') ||
      label.includes('increase') ||
      label.includes('deduction') ||
      label.includes('adjustment') ||
      label.includes('maintenance') ||
      label.includes('closing')
    );

    if (matchesAdvanced && index >= 2) return true;
    if (fields.length > 4 && index >= 4) return true;
    return false;
  };

  let primaryFields = fields.filter((f, idx) => !isAdvancedField(f, idx));
  let advancedFields = fields.filter((f, idx) => isAdvancedField(f, idx));

  // Ensure there are always at least 2 primary fields visible if total fields >= 2
  if (primaryFields.length < 2 && fields.length >= 2) {
    const splitPoint = Math.min(3, fields.length);
    primaryFields = fields.slice(0, splitPoint);
    advancedFields = fields.slice(splitPoint);
  }

  const renderSingleField = (field: CalculatorField) => {
    const val = formValues[field.id] !== undefined ? formValues[field.id] : field.defaultValue;

    if (field.type === 'slider') {
      const min = field.min ?? 0;
      const max = field.max ?? 100;
      const step = field.step ?? 1;
      const currentNum = typeof val === 'number' ? val : parseFloat(val) || min;

      return (
        <div key={field.id} className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor={field.id} className="font-bold text-[#222325] flex items-center gap-1">
              {field.label}
              {field.helpText && (
                <span className="text-[#95979d]" title={field.helpText}>
                  <HelpCircle className="w-3.5 h-3.5" />
                </span>
              )}
            </label>
            <span className="font-mono font-bold text-[#1dbf73] bg-[#f4fdf8] px-2 py-0.5 rounded border border-[#d8f5e5]">
              {field.prefix || ''}{currentNum.toLocaleString()}{field.suffix || ''}
            </span>
          </div>
          <input
            type="range"
            id={field.id}
            min={min}
            max={max}
            step={step}
            value={currentNum}
            onChange={(e) => onValueChange(field.id, parseFloat(e.target.value))}
            className="w-full accent-[#1dbf73] h-2 bg-[#e4e5e7] rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#95979d] font-mono">
            <span>{field.prefix || ''}{min.toLocaleString()}{field.suffix || ''}</span>
            <span>{field.prefix || ''}{max.toLocaleString()}{field.suffix || ''}</span>
          </div>
        </div>
      );
    }

    if (field.type === 'select') {
      return (
        <div key={field.id} className="space-y-1.5">
          <label htmlFor={field.id} className="block text-xs font-bold text-[#222325]">
            {field.label}
          </label>
          <select
            id={field.id}
            value={val}
            onChange={(e) => onValueChange(field.id, e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#e4e5e7] rounded-lg text-sm text-[#222325] font-semibold focus:outline-none focus:border-[#1dbf73] focus:ring-1 focus:ring-[#1dbf73]"
          >
            {field.options?.map((opt) => (
              <option key={String(opt.value)} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {field.helpText && <p className="text-[11px] text-[#74767e]">{field.helpText}</p>}
        </div>
      );
    }

    if (field.type === 'checkbox') {
      return (
        <div key={field.id} className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id={field.id}
            checked={Boolean(val)}
            onChange={(e) => onValueChange(field.id, e.target.checked)}
            className="w-4 h-4 text-[#1dbf73] accent-[#1dbf73] rounded border-[#e4e5e7] focus:ring-[#1dbf73] cursor-pointer"
          />
          <label htmlFor={field.id} className="text-xs font-bold text-[#222325] cursor-pointer">
            {field.label}
            {field.helpText && <span className="block text-[11px] font-normal text-[#74767e]">{field.helpText}</span>}
          </label>
        </div>
      );
    }

    if (field.type === 'date') {
      return (
        <div key={field.id} className="space-y-1.5">
          <label htmlFor={field.id} className="block text-xs font-bold text-[#222325]">
            {field.label}
          </label>
          <input
            type="date"
            id={field.id}
            value={String(val || '')}
            onChange={(e) => onValueChange(field.id, e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#e4e5e7] rounded-lg text-sm text-[#222325] focus:outline-none focus:border-[#1dbf73] focus:ring-1 focus:ring-[#1dbf73]"
          />
          {field.helpText && <p className="text-[11px] text-[#74767e]">{field.helpText}</p>}
        </div>
      );
    }

    // Default: Number or Text input
    return (
      <div key={field.id} className="space-y-1.5">
        <label htmlFor={field.id} className="block text-xs font-bold text-[#222325] flex items-center justify-between">
          <span>{field.label}</span>
          {field.helpText && (
            <span className="text-[11px] font-normal text-[#74767e] line-clamp-1" title={field.helpText}>
              {field.helpText}
            </span>
          )}
        </label>
        <div className="relative rounded-lg shadow-2xs">
          {field.prefix && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-xs font-semibold text-[#74767e]">{field.prefix}</span>
            </div>
          )}
          <input
            type="number"
            id={field.id}
            min={field.min}
            max={field.max}
            step={field.step || 'any'}
            placeholder={field.placeholder}
            value={val !== undefined ? val : ''}
            onChange={(e) => {
              const parsed = parseFloat(e.target.value);
              onValueChange(field.id, isNaN(parsed) ? '' : parsed);
            }}
            className={`w-full py-2.5 bg-white border border-[#e4e5e7] rounded-lg text-sm text-[#222325] font-semibold focus:outline-none focus:border-[#1dbf73] focus:ring-1 focus:ring-[#1dbf73] ${
              field.prefix ? 'pl-8' : 'pl-3.5'
            } ${field.suffix ? 'pr-12' : 'pr-3.5'}`}
          />
          {field.suffix && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-xs font-semibold text-[#74767e]">{field.suffix}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-[#e4e5e7] p-6 sm:p-7 shadow-2xs space-y-6">
      <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#f4fdf8] text-[#1dbf73] flex items-center justify-center border border-[#d8f5e5]">
            <Sliders className="w-4 h-4" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#222325]">{title}</h2>
        </div>
        {showReset && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#74767e] hover:text-[#1dbf73] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Primary Parameters Grid */}
      <div className={`grid gap-5 ${isTwoColumn ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {(primaryFields.length > 0 ? primaryFields : fields).map(renderSingleField)}
      </div>

      {/* Advanced Options Collapsible Accordion (Calculator.net style) */}
      {advancedFields.length > 0 && primaryFields.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#059669] hover:text-[#047857] hover:underline transition-colors cursor-pointer py-1.5"
            >
              {showAdvanced ? (
                <>
                  <MinusCircle className="w-4 h-4 text-emerald-600" />
                  <span>– Fewer Options</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  <span>+ More Options / Advanced Parameters ({advancedFields.length} extra fields)</span>
                </>
              )}
            </button>
            <span className="text-[11px] text-slate-400 font-medium">
              {showAdvanced ? 'Showing extra taxes, fees & adjustments' : 'Taxes, HOA, PMI & Prepayments hidden'}
            </span>
          </div>

          {showAdvanced && (
            <div className="mt-4 p-5 bg-slate-50/75 rounded-xl border border-slate-200/80 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Advanced Options & Additional Expenses</span>
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">Custom adjustments</span>
              </div>
              <div className={`grid gap-4 ${isTwoColumn ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                {advancedFields.map(renderSingleField)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
