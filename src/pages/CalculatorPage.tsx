import React, { useEffect, useState } from 'react';
import { ArrowRight, Calculator as CalcIcon, Sparkles, BookOpen, Layers } from 'lucide-react';
import { Category, Subcategory, Calculator } from '../types/schema.ts';
import { Breadcrumbs } from '../components/layout/Breadcrumbs.tsx';
import { DynamicCalculatorRenderer } from '../components/calculator/DynamicCalculatorRenderer.tsx';
import { CalculatorNetSuite } from '../components/calculator/CalculatorNetSuite.tsx';
import { LoansCalculatorApp } from '../components/calculator/LoansCalculatorApp.tsx';
import { getAdminToken } from '../services/api.ts';

interface CalculatorPageProps {
  category: Category;
  subcategory: Subcategory;
  calculator: Calculator;
  relatedCalculators?: Calculator[];
}

export const CalculatorPage: React.FC<CalculatorPageProps> = ({
  category,
  subcategory,
  calculator,
  relatedCalculators = [],
}) => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(Boolean(getAdminToken()));
  }, []);

  const breadcrumbs = [
    { label: category.name, href: `/${category.slug}` },
    { label: subcategory.name, href: `/${category.slug}/${subcategory.slug}` },
    { label: calculator.name, isCurrent: true },
  ];

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Admin Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs items={breadcrumbs} />

        {isAdmin && (
          <div className="flex items-center gap-2">
            <a
              href={`/admin/calculators/${calculator.id}`}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>Edit Engine</span>
            </a>
          </div>
        )}
      </div>

      {/* Header Info Banner */}
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-[#1dbf73] uppercase tracking-wider">
          <CalcIcon className="w-4 h-4" />
          <span>{category.name} &bull; {subcategory.name}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {calculator.name}
        </h1>
        {calculator.shortDescription && (
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            {calculator.shortDescription}
          </p>
        )}
      </div>

      {/* Main Calculator Engine Rendering */}
      {calculator.slug === 'mortgage-calculator' ||
      calculator.slug === 'mortgage-payoff-calculator' ||
      calculator.slug === 'mortgage-amortization-calculator' ||
      calculator.slug === 'mortgage-calculator-uk' ||
      calculator.slug === 'canadian-mortgage-calculator' ? (
        <CalculatorNetSuite initialCalc="mortgage" initialCategory="financial" hideHeaderTabs={false} />
      ) : calculator.slug === 'auto-loan-calculator' ? (
        <CalculatorNetSuite initialCalc="auto" initialCategory="financial" hideHeaderTabs={false} />
      ) : calculator.slug === 'investment-calculator' || calculator.slug === 'compound-interest-calculator' ? (
        <CalculatorNetSuite initialCalc="investment" initialCategory="financial" hideHeaderTabs={false} />
      ) : calculator.slug.includes('india') || calculator.slug.includes('emi') ? (
        <LoansCalculatorApp calculator={calculator} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <main className="lg:col-span-8 xl:col-span-9 space-y-8">
            <DynamicCalculatorRenderer calculator={calculator} />
          </main>

          {/* Sidebar: Related Tools */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 sticky top-20">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Related {subcategory.name} Tools
              </h3>
              {relatedCalculators.length > 0 ? (
                <div className="space-y-2.5">
                  {relatedCalculators.map((rel) => (
                    <a
                      key={rel.id}
                      href={`/${category.slug}/${subcategory.slug}/${rel.slug}`}
                      className="block p-3.5 bg-white rounded-xl border border-slate-200 hover:border-[#1dbf73] hover:shadow-xs transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-[#1dbf73] truncate">
                          {rel.name}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#1dbf73] transition-colors shrink-0" />
                      </div>
                      {rel.shortDescription && (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                          {rel.shortDescription}
                        </p>
                      )}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Explore other calculators in this subcategory.
                </p>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
