import React from 'react';
import { CalculatorOutput, OutputFormat } from '../../../types/schema.ts';
import { formatCurrencyValue, formatPercentValue } from '../../../utils/mathEngine.ts';
import { PieChart, DollarSign, TrendingUp, Info } from 'lucide-react';

interface ResultsModuleProps {
  outputs: CalculatorOutput[];
  calculatedValues: { [outputId: string]: number };
  currencySymbol?: string;
  donutData?: Array<{ label: string; value: number; color: string }>;
}

export const ResultsModule: React.FC<ResultsModuleProps> = ({
  outputs,
  calculatedValues,
  currencySymbol = '$',
  donutData,
}) => {
  // Identify primary highlight metric
  const highlightOutput = outputs.find((o) => o.highlight) || outputs[0];
  const secondaryOutputs = outputs.filter((o) => o.id !== highlightOutput?.id);

  const formatValue = (val: number, format?: OutputFormat, prefix?: string, suffix?: string) => {
    if (format === 'currency') {
      return formatCurrencyValue(val, prefix || currencySymbol, 2);
    }
    if (format === 'percent') {
      return formatPercentValue(val, 2);
    }
    const str = val.toLocaleString('en-US', { maximumFractionDigits: 2 });
    return `${prefix || ''}${str}${suffix || ''}`;
  };

  // Compute donut chart angles if provided
  const hasDonut = donutData && donutData.length > 0 && donutData.some((d) => d.value > 0);
  const totalDonutValue = hasDonut ? donutData!.reduce((acc, d) => acc + Math.max(0, d.value), 0) : 0;

  return (
    <div className="space-y-6">
      {/* Primary Result Banner */}
      {highlightOutput && (
        <div className="bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#1e293b] text-white p-6 sm:p-7 rounded-2xl shadow-lg border border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#1dbf73]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                {highlightOutput.label}
              </span>
              <div className="text-3xl sm:text-4xl font-black text-[#10b981] tracking-tight mt-1">
                {formatValue(
                  calculatedValues[highlightOutput.id] || 0,
                  highlightOutput.format,
                  highlightOutput.prefix,
                  highlightOutput.suffix
                )}
              </div>
              {highlightOutput.description && (
                <p className="text-xs text-slate-300 mt-1 max-w-md">
                  {highlightOutput.description}
                </p>
              )}
            </div>

            <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold self-start sm:self-auto flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Real-Time Computed</span>
            </div>
          </div>
        </div>
      )}

      {/* Breakdown Table & Donut Visual Container */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <PieChart className="w-4 h-4 text-[#1dbf73]" />
          <span>Calculation Summary & Breakdown</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Column: Data Breakdown Table */}
          <div className={hasDonut ? 'md:col-span-7' : 'md:col-span-12'}>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <tr>
                    <th className="p-3 text-left font-bold">Component / Metric</th>
                    <th className="p-3 text-right font-bold">Calculated Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {outputs.map((out) => {
                    const isHighlight = out.id === highlightOutput?.id;
                    const val = calculatedValues[out.id] || 0;
                    return (
                      <tr
                        key={out.id}
                        className={isHighlight ? 'bg-emerald-50/50 font-bold' : 'hover:bg-slate-50/80 transition-colors'}
                      >
                        <td className="p-3 text-slate-800">
                          <div className="flex items-center gap-2">
                            {isHighlight && (
                              <span className="w-2 h-2 rounded-full bg-[#1dbf73]" />
                            )}
                            <span>{out.label}</span>
                          </div>
                          {out.description && (
                            <span className="text-[10px] text-slate-400 block font-normal mt-0.5">
                              {out.description}
                            </span>
                          )}
                        </td>
                        <td className={`p-3 text-right font-semibold ${isHighlight ? 'text-[#059669] text-sm' : 'text-slate-900'}`}>
                          {formatValue(val, out.format, out.prefix, out.suffix)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Donut Visual (if available) */}
          {hasDonut && totalDonutValue > 0 && (
            <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {(() => {
                    let cumulativePercent = 0;
                    return donutData!.map((slice, idx) => {
                      if (slice.value <= 0) return null;
                      const percent = (slice.value / totalDonutValue) * 100;
                      const strokeDasharray = `${percent} ${100 - percent}`;
                      const strokeDashoffset = -cumulativePercent;
                      cumulativePercent += percent;

                      return (
                        <circle
                          key={idx}
                          cx="50"
                          cy="50"
                          r="35"
                          fill="transparent"
                          stroke={slice.color}
                          strokeWidth="18"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          pathLength="100"
                          className="transition-all duration-500 hover:opacity-90"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Share</span>
                  <span className="text-xs font-black text-slate-800">100%</span>
                </div>
              </div>

              {/* Donut Legend */}
              <div className="w-full mt-4 space-y-1 text-[11px]">
                {donutData!.map((d, i) => {
                  if (d.value <= 0) return null;
                  const pct = ((d.value / totalDonutValue) * 100).toFixed(1);
                  return (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-slate-600 truncate max-w-[110px]">{d.label}</span>
                      </div>
                      <span className="font-bold text-slate-800">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
