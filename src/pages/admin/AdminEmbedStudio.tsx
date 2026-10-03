import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { Calculator } from '../../types/schema.ts';
import { Code, Copy, Check } from 'lucide-react';

export const AdminEmbedStudio: React.FC = () => {
  const [calculators, setCalculators] = useState<Calculator[]>([]);
  const [selectedCalc, setSelectedCalc] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.getCalculators().then((calcs) => {
      setCalculators(calcs);
      if (calcs.length > 0) setSelectedCalc(calcs[0].slug);
    }).catch(console.error);
  }, []);

  const embedCode = `<iframe src="${window.location.origin}/embed/${selectedCalc}" width="100%" height="650" frameborder="0" style="border:1px solid #e2e8f0; border-radius:16px;"></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">Embed & Widget Studio</h1>
        <p className="text-xs text-slate-500">Generate iframe embed codes to place calculators on third-party sites</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Select Calculator to Embed</label>
          <select
            value={selectedCalc}
            onChange={(e) => setSelectedCalc(e.target.value)}
            className="w-full max-w-md p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none"
          >
            {calculators.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name} ({c.slug})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">HTML Embed Code</span>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 bg-[#1dbf73] hover:bg-[#19a463] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre-wrap">
            {embedCode}
          </pre>
        </div>
      </div>
    </div>
  );
};
