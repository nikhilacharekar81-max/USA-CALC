import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Calculator, ArrowRight } from 'lucide-react';
import { Calculator as CalcType, Category, Subcategory } from '../../types/schema.ts';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculators: CalcType[];
  categories: Category[];
  subcategories: Subcategory[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  calculators = [],
  categories = [],
  subcategories = [],
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? calculators.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          (c.shortDescription && c.shortDescription.toLowerCase().includes(query.toLowerCase())) ||
          c.slug.toLowerCase().includes(query.toLowerCase())
      )
    : calculators.slice(0, 8);

  const getCalcUrl = (calc: CalcType) => {
    const sub = subcategories.find((s) => s.id === calc.subcategoryId);
    const cat = categories.find((c) => c.id === sub?.categoryId);
    if (cat && sub) {
      return `/${cat.slug}/${sub.slug}/${calc.slug}`;
    }
    return `/${calc.slug}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search calculators (e.g., mortgage, auto loan, investment, taxes)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm sm:text-base outline-none text-slate-900 placeholder:text-slate-400 bg-transparent font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 divide-y divide-slate-50">
          {filtered.length > 0 ? (
            filtered.map((calc) => (
              <a
                key={calc.id}
                href={getCalcUrl(calc)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50/60 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-[#1dbf73]/10 text-slate-600 group-hover:text-[#1dbf73] flex items-center justify-center transition-colors shrink-0">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#059669] transition-colors">
                      {calc.name}
                    </h4>
                    {calc.shortDescription && (
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {calc.shortDescription}
                      </p>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#1dbf73] group-hover:translate-x-0.5 transition-all shrink-0" />
              </a>
            ))
          ) : (
            <div className="text-center py-10 space-y-2">
              <p className="text-xs font-semibold text-slate-600">No calculators found for &quot;{query}&quot;</p>
              <p className="text-[11px] text-slate-400">Try searching for &apos;mortgage&apos;, &apos;interest&apos;, &apos;salary&apos;, or &apos;loan&apos;</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 px-4">
          <span>{calculators.length} calculators indexed</span>
          <span className="font-semibold text-slate-600">Calculator.net Engine</span>
        </div>
      </div>
    </div>
  );
};
