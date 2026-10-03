import React from 'react';
import { Category, Subcategory, Calculator } from '../types/schema.ts';
import { Breadcrumbs } from '../components/layout/Breadcrumbs.tsx';
import { ArrowRight, Calculator as CalcIcon, Layers } from 'lucide-react';

interface CategoryPageProps {
  category: Category;
  subcategories?: Subcategory[];
  calculators?: Calculator[];
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  category,
  subcategories = [],
  calculators = [],
}) => {
  const breadcrumbs = [{ label: category.name, isCurrent: true }];

  return (
    <div className="space-y-8">
      <Breadcrumbs items={breadcrumbs} />

      {/* Category Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-[#1dbf73] uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          <span>Category Directory</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {category.name.endsWith('Calculators') ? category.name : `${category.name} Calculators`}
          </h1>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 self-start sm:self-auto">
            {calculators.length} Total Calculators
          </span>
        </div>
        {category.description && (
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            {category.description}
          </p>
        )}
      </div>

      {/* Render Subcategories (if available) */}
      {subcategories.length > 0 && (
        <div className="space-y-8">
          {subcategories.map((sub) => {
            const subCalcs = calculators.filter((c) => c.subcategoryId === sub.id);
            if (subCalcs.length === 0) return null;
            return (
              <div key={sub.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <CalcIcon className="w-4 h-4 text-[#1dbf73]" />
                      <span>{sub.name}</span>
                    </h2>
                    {sub.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{sub.description}</p>
                    )}
                  </div>
                  <a
                    href={`/${category.slug}/${sub.slug}`}
                    className="text-xs font-bold text-[#1dbf73] hover:text-[#19a463] flex items-center gap-1 shrink-0"
                  >
                    <span>View Subcategory ({subCalcs.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {subCalcs.map((calc) => (
                    <a
                      key={calc.id}
                      href={`/${category.slug}/${sub.slug}/${calc.slug}`}
                      className="p-4 bg-slate-50/70 hover:bg-[#1dbf73]/5 rounded-xl border border-slate-200 hover:border-[#1dbf73] transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#059669] transition-colors">
                          {calc.name}
                        </h3>
                        {calc.shortDescription && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
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
              </div>
            );
          })}
        </div>
      )}

      {/* Render Direct Calculators Grid (All Calculators in Category) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <CalcIcon className="w-5 h-5 text-[#1dbf73]" />
            <span>All {category.name}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select any tool below to launch instant calculations
          </p>
        </div>

        {calculators.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {calculators.map((calc) => (
              <a
                key={calc.id}
                href={`/${calc.slug}`}
                className="p-4 bg-slate-50 hover:bg-[#1dbf73]/5 rounded-xl border border-slate-200 hover:border-[#1dbf73] transition-all group flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                    <span>{category.name}</span>
                    <span className="text-[#1dbf73] font-bold">ACTIVE</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#059669] transition-colors">
                    {calc.name}
                  </h3>
                  {calc.shortDescription && (
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {calc.shortDescription}
                    </p>
                  )}
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-[#1dbf73]">
                  <span>Launch Engine</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            No calculators currently assigned to this category.
          </div>
        )}
      </div>
    </div>
  );
};
