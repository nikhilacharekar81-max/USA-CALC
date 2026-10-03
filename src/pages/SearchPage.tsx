import React, { useState } from 'react';
import { Calculator, Category, Subcategory } from '../types/schema.ts';
import { Breadcrumbs } from '../components/layout/Breadcrumbs.tsx';
import { Search, Calculator as CalcIcon, ArrowRight } from 'lucide-react';

interface SearchPageProps {
  calculators: Calculator[];
  categories: Category[];
  subcategories: Subcategory[];
  initialQuery?: string;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  calculators = [],
  categories = [],
  subcategories = [],
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);

  const filtered = query.trim()
    ? calculators.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          (c.shortDescription && c.shortDescription.toLowerCase().includes(query.toLowerCase())) ||
          c.slug.toLowerCase().includes(query.toLowerCase())
      )
    : calculators;

  const getCalcUrl = (calc: Calculator) => {
    const sub = subcategories.find((s) => s.id === calc.subcategoryId);
    const cat = categories.find((c) => c.id === sub?.categoryId);
    if (cat && sub) {
      return `/${cat.slug}/${sub.slug}/${calc.slug}`;
    }
    return `/${calc.slug}`;
  };

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: 'Search Calculators', isCurrent: true }]} />

      {/* Search Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Search Financial & Math Calculators
        </h1>
        <div className="relative max-w-xl">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Type any calculator name, topic or keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-[#1dbf73] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Results */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-700">
            {filtered.length} Calculator{filtered.length === 1 ? '' : 's'} Found
          </h2>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((calc) => (
              <a
                key={calc.id}
                href={getCalcUrl(calc)}
                className="p-4 bg-slate-50/70 hover:bg-[#1dbf73]/5 rounded-xl border border-slate-200 hover:border-[#1dbf73] transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-md bg-[#1dbf73]/10 text-[#1dbf73] flex items-center justify-center shrink-0">
                      <CalcIcon className="w-3 h-3" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#059669] transition-colors">
                      {calc.name}
                    </h3>
                  </div>
                  {calc.shortDescription && (
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {calc.shortDescription}
                    </p>
                  )}
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-bold text-slate-400 group-hover:text-[#1dbf73]">
                  <span>Calculate Now</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 space-y-2">
            <p className="text-sm font-bold text-slate-700">No calculators matching &quot;{query}&quot;</p>
            <p className="text-xs text-slate-400">Try searching for mortgage, auto, tax, interest, or loan</p>
          </div>
        )}
      </div>
    </div>
  );
};
