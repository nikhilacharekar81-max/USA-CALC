import React from 'react';
import { Category, Subcategory, Calculator } from '../types/schema.ts';
import { Breadcrumbs } from '../components/layout/Breadcrumbs.tsx';
import { ArrowRight, Calculator as CalcIcon, Layers } from 'lucide-react';

interface SubcategoryPageProps {
  category: Category;
  subcategory: Subcategory;
  calculators: Calculator[];
}

export const SubcategoryPage: React.FC<SubcategoryPageProps> = ({
  category,
  subcategory,
  calculators = [],
}) => {
  const breadcrumbs = [
    { label: category.name, href: `/${category.slug}` },
    { label: subcategory.name, isCurrent: true },
  ];

  return (
    <div className="space-y-8">
      <Breadcrumbs items={breadcrumbs} />

      {/* Subcategory Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-[#1dbf73] uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          <span>{category.name} &bull; Subcategory</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {subcategory.name}
        </h1>
        {subcategory.description && (
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            {subcategory.description}
          </p>
        )}
      </div>

      {/* Calculators Grid */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
          Available Calculators ({calculators.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {calculators.map((calc) => (
            <a
              key={calc.id}
              href={`/${category.slug}/${subcategory.slug}/${calc.slug}`}
              className="p-5 bg-slate-50/70 hover:bg-[#1dbf73]/5 rounded-xl border border-slate-200 hover:border-[#1dbf73] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-[#1dbf73]/10 text-[#1dbf73] flex items-center justify-center">
                    <CalcIcon className="w-3.5 h-3.5" />
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
              <div className="mt-4 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-bold text-slate-400 group-hover:text-[#1dbf73]">
                <span>Launch Tool</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
