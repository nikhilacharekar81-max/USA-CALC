import React from 'react';
import { ScheduleEntry, formatCurrencyValue } from '../../../utils/mathEngine.ts';
import { LineChart, TrendingUp, Info } from 'lucide-react';

interface ChartModuleProps {
  schedule: ScheduleEntry[];
  currencySymbol?: string;
  type?: 'payoff' | 'growth';
  title?: string;
}

export const ChartModule: React.FC<ChartModuleProps> = ({
  schedule,
  currencySymbol = '$',
  type = 'payoff',
  title = 'Balance Progression Over Time',
}) => {
  if (!schedule || schedule.length < 2) return null;

  // Use a max of 30 points for smooth SVG curve
  const step = Math.max(1, Math.floor(schedule.length / 25));
  const points = schedule.filter((_, idx) => idx % step === 0 || idx === schedule.length - 1);

  const maxVal = Math.max(...points.map((p) => Math.max(p.beginningBalance, p.endingBalance)));
  if (maxVal <= 0) return null;

  const width = 600;
  const height = 220;
  const padX = 40;
  const padY = 30;

  const getX = (index: number) => padX + (index / (points.length - 1)) * (width - 2 * padX);
  const getY = (val: number) => height - padY - (val / maxVal) * (height - 2 * padY);

  const pathD = points.reduce((acc, pt, i) => {
    const x = getX(i);
    const y = getY(pt.endingBalance);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const areaD = `${pathD} L ${getX(points.length - 1)} ${height - padY} L ${getX(0)} ${height - padY} Z`;

  return (
    <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#1dbf73]" />
          <span>{title}</span>
        </h4>
        <span className="text-xs text-slate-400">Curve Simulation</span>
      </div>

      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          <defs>
            <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padX} y1={getY(maxVal)} x2={width - padX} y2={getY(maxVal)} stroke="#e2e8f0" strokeDasharray="4 4" />
          <line x1={padX} y1={getY(maxVal / 2)} x2={width - padX} y2={getY(maxVal / 2)} stroke="#e2e8f0" strokeDasharray="4 4" />
          <line x1={padX} y1={height - padY} x2={width - padX} y2={height - padY} stroke="#cbd5e1" strokeWidth="1.5" />

          {/* Value labels */}
          <text x={padX - 5} y={getY(maxVal) + 4} textAnchor="end" className="text-[9px] fill-slate-400 font-sans">
            {formatCurrencyValue(maxVal, currencySymbol, 0)}
          </text>
          <text x={padX - 5} y={getY(maxVal / 2) + 4} textAnchor="end" className="text-[9px] fill-slate-400 font-sans">
            {formatCurrencyValue(maxVal / 2, currencySymbol, 0)}
          </text>
          <text x={padX - 5} y={height - padY + 4} textAnchor="end" className="text-[9px] fill-slate-400 font-sans">
            0
          </text>

          {/* Filled Area */}
          <path d={areaD} fill="url(#curveGradient)" />

          {/* Main Line */}
          <path d={pathD} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* First & Last Data Dots */}
          <circle cx={getX(0)} cy={getY(points[0].endingBalance)} r="4" fill="#10b981" />
          <circle cx={getX(points.length - 1)} cy={getY(points[points.length - 1].endingBalance)} r="4" fill="#059669" />

          {/* Time Labels */}
          <text x={getX(0)} y={height - 10} textAnchor="start" className="text-[10px] fill-slate-500 font-semibold font-sans">
            Start ({points[0].dateStr})
          </text>
          <text x={getX(points.length - 1)} y={height - 10} textAnchor="end" className="text-[10px] fill-slate-500 font-semibold font-sans">
            End ({points[points.length - 1].dateStr})
          </text>
        </svg>
      </div>
    </div>
  );
};
