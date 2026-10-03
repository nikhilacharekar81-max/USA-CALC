import React, { useState } from 'react';
import { Layers, Sliders, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export const AdminModules: React.FC = () => {
  const [activeModules, setActiveModules] = useState({
    inputs: true,
    results: true,
    donutChart: true,
    schedule: true,
    curveChart: true,
    formulaGuide: true,
    seoSchemas: true,
  });

  const toggle = (key: keyof typeof activeModules) => {
    setActiveModules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">Modular Engine Architecture</h1>
        <p className="text-xs text-slate-500">Enable or disable Calculator.net calculation modules globally</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#1dbf73]" />
              <span>Inputs & More Options Accordion</span>
            </h3>
            <button
              type="button"
              onClick={() => toggle('inputs')}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                activeModules.inputs ? 'bg-[#1dbf73]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  activeModules.inputs ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Renders dynamic inputs with primary fields visible and secondary metrics in the collapsible accordion.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1dbf73]" />
              <span>Results & Breakdown Tables</span>
            </h3>
            <button
              type="button"
              onClick={() => toggle('results')}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                activeModules.results ? 'bg-[#1dbf73]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  activeModules.results ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Real-time calculation results, highlight banners, and comprehensive breakdown matrices.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1dbf73]" />
              <span>Amortization & Payoff Schedules</span>
            </h3>
            <button
              type="button"
              onClick={() => toggle('schedule')}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                activeModules.schedule ? 'bg-[#1dbf73]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  activeModules.schedule ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Annual and monthly amortization tables with pagination, CSV export, and print formatting.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1dbf73]" />
              <span>Formula Reference Guides</span>
            </h3>
            <button
              type="button"
              onClick={() => toggle('formulaGuide')}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                activeModules.formulaGuide ? 'bg-[#1dbf73]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  activeModules.formulaGuide ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Mathematical methodology, formula equations, and variable definition glossaries.
          </p>
        </div>
      </div>
    </div>
  );
};
