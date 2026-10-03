import React, { useState, useEffect } from 'react';
import { Shield, BookOpen, Calculator, Folder, Search, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../services/api.ts';
import { Category, Calculator as CalculatorType } from '../types/schema.ts';

interface HomePageProps {
  onOpenSearch?: () => void;
  brandName?: string;
  activeTab?: string;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenSearch, brandName = 'USA Focus' }) => {
  const [categories, setCategories] = useState<Array<Category & { subcategoriesCount: number; calculatorsCount: number; subcategories: any[] }>>([]);
  const [calculators, setCalculators] = useState<CalculatorType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [cats, calcs] = await Promise.all([
          api.getPublicCategories(),
          api.getPublicCalculators()
        ]);
        setCategories((cats as any) || []);
        setCalculators((calcs as any) || []);
      } catch (err) {
        console.error('Failed to load homepage categories and calculators:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="w-full max-w-full flex-1 flex flex-col py-10 px-4 sm:px-6 lg:px-8 space-y-12 overflow-x-hidden">
      {/* Hero Welcome & Search Banner */}
      <section className="bg-gradient-to-br from-navy-900 via-slate-900 to-navy-800 text-white rounded-3xl p-8 sm:p-12 shadow-lg relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-usblue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-usblue-500/20 border border-usblue-400/30 text-usblue-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{brandName} Directory &amp; Calculators</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Advanced Financial Calculators &amp; Categories
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Explore your custom financial calculators, categorized directories, and professional guides.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onOpenSearch}
              className="bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-sm text-slate-200 hover:text-white px-4 py-3 rounded-2xl flex items-center gap-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-inner"
            >
              <Search className="w-4 h-4 text-usblue-400" />
              <span>Search calculators &amp; articles...</span>
              <kbd className="bg-white/20 px-2 py-0.5 rounded text-[10px] text-white font-mono">⌘K</kbd>
            </button>

            <a
              href="/admin"
              className="bg-usblue-600 hover:bg-usblue-700 text-white px-5 py-3 rounded-2xl flex items-center gap-2 text-xs sm:text-sm font-bold transition-all shadow-md"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Console</span>
            </a>

            <a
              href="/blog"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-3 rounded-2xl flex items-center gap-2 text-xs sm:text-sm font-bold transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Blog &amp; Guides</span>
            </a>
          </div>
        </div>
      </section>

      {/* Categories & Calculators Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Folder className="w-5 h-5 text-usblue-600" />
              Categories &amp; Calculator Suite
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Your created categories and calculators are listed below.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 animate-pulse">
                <div className="h-6 bg-slate-100 rounded w-1/2" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const catCalculators = calculators.filter((c) => c.categoryId === cat.id);
              return (
                <div
                  key={cat.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-usblue-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-usblue-700 font-bold text-xs border border-blue-100 uppercase tracking-wide">
                        Category
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {cat.calculatorsCount || catCalculators.length} calculators
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 tracking-tight">
                      {cat.name}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {cat.description || 'Explore calculators in this category.'}
                    </p>

                    {catCalculators.length > 0 ? (
                      <div className="pt-2 space-y-1.5 border-t border-slate-100">
                        {catCalculators.slice(0, 4).map((calc) => (
                          <a
                            key={calc.id}
                            href={`/${cat.slug}/${calc.slug}`}
                            className="text-xs font-semibold text-slate-700 hover:text-usblue-600 flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <span className="flex items-center gap-2 truncate">
                              <Calculator className="w-3.5 h-3.5 text-usblue-500 shrink-0" />
                              <span className="truncate">{calc.name}</span>
                            </span>
                            <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-100">
                        No calculators added to this category yet. Go to Admin Console to add calculators.
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href={`/category/${cat.slug}`}
                      className="text-xs font-bold text-usblue-600 hover:text-usblue-700 flex items-center gap-1 transition-colors"
                    >
                      <span>View All in {cat.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center space-y-4">
            <Calculator className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800">No categories created yet</h3>
              <p className="text-xs text-slate-500">Create categories and calculators in the Admin Console.</p>
            </div>
            <a
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 bg-usblue-600 hover:bg-usblue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Open Admin Console</span>
            </a>
          </div>
        )}
      </section>
    </div>
  );
};
