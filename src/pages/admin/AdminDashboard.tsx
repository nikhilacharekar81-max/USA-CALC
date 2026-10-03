import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Layers,
  Calculator as CalcIcon,
  Plus,
  CheckCircle2,
  FileCode,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { StatsResponse } from '../../types/schema.ts';

interface AdminDashboardProps {
  onNavigate: (
    tab:
      | 'dashboard'
      | 'categories'
      | 'subcategories'
      | 'calculators'
      | 'settings'
      | 'calculator-editor',
    param?: string
  ) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<StatsResponse>({
    totalCategories: 0,
    activeCategories: 0,
    totalSubcategories: 0,
    activeSubcategories: 0,
    totalCalculators: 0,
    activeCalculators: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Categories',
      total: stats.totalCategories,
      active: stats.activeCategories,
      icon: FolderTree,
      linkTab: 'categories' as const,
    },
    {
      title: 'Subcategories',
      total: stats.totalSubcategories,
      active: stats.activeSubcategories,
      icon: Layers,
      linkTab: 'subcategories' as const,
    },
    {
      title: 'Calculators',
      total: stats.totalCalculators,
      active: stats.activeCalculators,
      icon: CalcIcon,
      linkTab: 'calculators' as const,
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time status of categories, subcategories, mathematical models, and formula engines
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('categories')}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Category</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('calculator-editor', 'new')}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-usblue-600 hover:bg-usblue-700 rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Calculator</span>
          </button>
        </div>
      </div>

      {/* Numeric Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-usblue-500 hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {card.title}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-usblue-600 group-hover:bg-usblue-600 group-hover:text-white flex items-center justify-center transition-colors">
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black font-mono text-slate-900 tabular-nums">
                    {isLoading ? '-' : card.total}
                  </span>
                  <span className="text-xs text-slate-500">total records</span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {isLoading ? '-' : card.active}
                  </span>
                  <span>Active &amp; published</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onNavigate(card.linkTab)}
                  className="w-full flex items-center justify-between text-xs font-bold text-usblue-600 hover:text-usblue-700 transition-colors cursor-pointer"
                >
                  <span>Manage {card.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fresh Installation Guide */}
      {stats.totalCategories === 0 ? (
        <div className="p-8 bg-white border border-slate-200 rounded-2xl space-y-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-navy-900 text-usblue-400 flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Fresh Setup: Empty Database
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Your database is ready for new custom calculators. You can add parent categories, subcategories, or launch the interactive formula builder:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="text-xs font-bold font-mono text-usblue-600">STEP 1</div>
              <h4 className="text-sm font-bold text-slate-900">Create Category</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Define the top-level parent discipline (e.g. Finance, Health, Math).
              </p>
              <button
                type="button"
                onClick={() => onNavigate('categories')}
                className="mt-3 text-xs font-bold text-usblue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Add Category</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="text-xs font-bold font-mono text-usblue-600">STEP 2</div>
              <h4 className="text-sm font-bold text-slate-900">Add Subcategory</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Group related calculators under your parent category (e.g. Loans, Fitness).
              </p>
              <button
                type="button"
                onClick={() => onNavigate('subcategories')}
                className="mt-3 text-xs font-bold text-usblue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Add Subcategory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="text-xs font-bold font-mono text-usblue-600">STEP 3</div>
              <h4 className="text-sm font-bold text-slate-900">Build Calculator</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add input fields, configure mathematical formulas, and test the live engine.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('calculator-editor', 'new')}
                className="mt-3 text-xs font-bold text-usblue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Launch Builder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Dynamic SEO Permalinks &amp; Sitemap
            </h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            The platform generates 3-tier canonical slugs (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">/:category/:subcategory/:calculator</code>), JSON-LD schemas, and an up-to-date XML Sitemap.
          </p>
          <div className="pt-2 flex items-center gap-3 text-xs font-bold">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noreferrer"
              className="text-usblue-600 hover:underline"
            >
              Open Live Sitemap.xml
            </a>
            <span aria-hidden="true" className="text-slate-300">&middot;</span>
            <button
              onClick={() => onNavigate('settings')}
              className="text-slate-600 hover:text-usblue-600 hover:underline cursor-pointer"
            >
              Configure SEO Meta
            </button>
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Portable JSON Database Backup
            </h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Database writes are atomic and persistent. You can download complete JSON snapshot backups or restore at any time.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('settings')}
              className="text-xs font-bold text-usblue-600 hover:underline cursor-pointer"
            >
              Manage Database &amp; Backups &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
