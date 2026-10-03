import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Calendar,
  Percent,
  Play,
  RotateCcw,
  Printer,
  Download,
  Table as TableIcon,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  ArrowRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

export type CompoundFrequency =
  | 'annually'
  | 'semi-annually'
  | 'quarterly'
  | 'monthly'
  | 'semi-monthly'
  | 'biweekly'
  | 'weekly'
  | 'daily'
  | 'continuously';

export type PayBackFrequency =
  | 'monthly'
  | 'quarterly'
  | 'semi-annually'
  | 'annually'
  | 'biweekly'
  | 'weekly';

const COMPOUND_OPTIONS: Array<{ label: string; value: CompoundFrequency; periodsPerYear: number }> = [
  { label: 'Annually (APY)', value: 'annually', periodsPerYear: 1 },
  { label: 'Semi-annually', value: 'semi-annually', periodsPerYear: 2 },
  { label: 'Quarterly', value: 'quarterly', periodsPerYear: 4 },
  { label: 'Monthly (APR)', value: 'monthly', periodsPerYear: 12 },
  { label: 'Semi-monthly', value: 'semi-monthly', periodsPerYear: 24 },
  { label: 'Biweekly', value: 'biweekly', periodsPerYear: 26 },
  { label: 'Weekly', value: 'weekly', periodsPerYear: 52 },
  { label: 'Daily', value: 'daily', periodsPerYear: 365 },
  { label: 'Continuously', value: 'continuously', periodsPerYear: Infinity },
];

const PAYBACK_OPTIONS: Array<{ label: string; value: PayBackFrequency; periodsPerYear: number }> = [
  { label: 'Every Month', value: 'monthly', periodsPerYear: 12 },
  { label: 'Every Quarter', value: 'quarterly', periodsPerYear: 4 },
  { label: 'Every 6 Months', value: 'semi-annually', periodsPerYear: 2 },
  { label: 'Every Year', value: 'annually', periodsPerYear: 1 },
  { label: 'Every 2 Weeks (Biweekly)', value: 'biweekly', periodsPerYear: 26 },
  { label: 'Every Week', value: 'weekly', periodsPerYear: 52 },
];

export const LoanCalculatorNetSuite: React.FC = () => {
  // -------------------------------------------------------------
  // SECTION 1: AMORTIZED LOAN STATE
  // -------------------------------------------------------------
  const [amortAmount, setAmortAmount] = useState<number>(100000);
  const [amortYears, setAmortYears] = useState<number>(10);
  const [amortMonths, setAmortMonths] = useState<number>(0);
  const [amortRate, setAmortRate] = useState<number>(6.0);
  const [amortCompound, setAmortCompound] = useState<CompoundFrequency>('monthly');
  const [amortPayBack, setAmortPayBack] = useState<PayBackFrequency>('monthly');
  const [showAmortTable, setShowAmortTable] = useState<boolean>(false);
  const [amortScheduleView, setAmortScheduleView] = useState<'yearly' | 'monthly'>('yearly');

  // Trigger state for Calculate button animation/feedback
  const [amortCalcCount, setAmortCalcCount] = useState<number>(0);

  // -------------------------------------------------------------
  // SECTION 2: DEFERRED PAYMENT LOAN STATE
  // -------------------------------------------------------------
  const [deferAmount, setDeferAmount] = useState<number>(100000);
  const [deferYears, setDeferYears] = useState<number>(10);
  const [deferMonths, setDeferMonths] = useState<number>(0);
  const [deferRate, setDeferRate] = useState<number>(6.0);
  const [deferCompound, setDeferCompound] = useState<CompoundFrequency>('annually');
  const [showDeferTable, setShowDeferTable] = useState<boolean>(false);

  // -------------------------------------------------------------
  // SECTION 3: BOND CALCULATOR STATE
  // -------------------------------------------------------------
  const [bondFaceValue, setBondFaceValue] = useState<number>(1000);
  const [bondCouponRate, setBondCouponRate] = useState<number>(5.0);
  const [bondYears, setBondYears] = useState<number>(10);
  const [bondYtm, setBondYtm] = useState<number>(6.0);
  const [bondFrequency, setBondFrequency] = useState<number>(2); // semi-annual

  // -------------------------------------------------------------
  // AMORTIZED LOAN MATH
  // -------------------------------------------------------------
  const amortCalculations = useMemo(() => {
    const P = Math.max(0, amortAmount);
    const r = Math.max(0, amortRate) / 100;
    const totalTermYears = amortYears + amortMonths / 12;

    const payPerYear = PAYBACK_OPTIONS.find((p) => p.value === amortPayBack)?.periodsPerYear || 12;
    const totalPeriods = Math.round(totalTermYears * payPerYear);

    if (P === 0 || totalPeriods === 0) {
      return {
        paymentPerPeriod: 0,
        totalPayments: 0,
        totalInterest: 0,
        totalPeriods: 0,
        payPerYearLabel: 'Month',
        yearlySchedule: [],
        monthlySchedule: [],
        donutData: [{ name: 'Principal', value: 100, color: '#3b82f6' }],
        principalPct: 100,
        interestPct: 0,
      };
    }

    // Effective periodic interest rate based on compounding
    let i = 0;
    if (r > 0) {
      if (amortCompound === 'continuously') {
        i = Math.exp(r / payPerYear) - 1;
      } else {
        const compoundPerYear =
          COMPOUND_OPTIONS.find((c) => c.value === amortCompound)?.periodsPerYear || 12;
        i = Math.pow(1 + r / compoundPerYear, compoundPerYear / payPerYear) - 1;
      }
    }

    let pmt = 0;
    if (i > 0) {
      pmt = (P * (i * Math.pow(1 + i, totalPeriods))) / (Math.pow(1 + i, totalPeriods) - 1);
    } else {
      pmt = P / totalPeriods;
    }

    const totalPayments = pmt * totalPeriods;
    const totalInterest = Math.max(0, totalPayments - P);

    const principalPct = Math.round((P / totalPayments) * 100);
    const interestPct = Math.max(0, 100 - principalPct);

    // Build Amortization Schedule
    let balance = P;
    const monthlySchedule: Array<{
      period: number;
      interest: number;
      principal: number;
      balance: number;
    }> = [];

    const yearlySchedule: Array<{
      year: number;
      interest: number;
      principal: number;
      endingBalance: number;
    }> = [];

    let currentYearInterest = 0;
    let currentYearPrincipal = 0;
    let currentYear = 1;

    for (let p = 1; p <= totalPeriods; p++) {
      const interestPortion = balance * i;
      const principalPortion = Math.min(balance, pmt - interestPortion);
      balance = Math.max(0, balance - principalPortion);

      monthlySchedule.push({
        period: p,
        interest: Math.round(interestPortion * 100) / 100,
        principal: Math.round(principalPortion * 100) / 100,
        balance: Math.round(balance * 100) / 100,
      });

      currentYearInterest += interestPortion;
      currentYearPrincipal += principalPortion;

      if (p % payPerYear === 0 || p === totalPeriods) {
        yearlySchedule.push({
          year: currentYear,
          interest: Math.round(currentYearInterest * 100) / 100,
          principal: Math.round(currentYearPrincipal * 100) / 100,
          endingBalance: Math.round(balance * 100) / 100,
        });
        currentYearInterest = 0;
        currentYearPrincipal = 0;
        currentYear++;
      }
    }

    let payLabel = 'Month';
    if (amortPayBack === 'quarterly') payLabel = 'Quarter';
    if (amortPayBack === 'semi-annually') payLabel = 'Half-Year';
    if (amortPayBack === 'annually') payLabel = 'Year';
    if (amortPayBack === 'biweekly') payLabel = '2 Weeks';
    if (amortPayBack === 'weekly') payLabel = 'Week';

    const donutData = [
      { name: 'Principal', value: Math.round(P), color: '#3b82f6', pct: principalPct },
      { name: 'Interest', value: Math.round(totalInterest), color: '#22c55e', pct: interestPct },
    ];

    return {
      paymentPerPeriod: pmt,
      totalPayments,
      totalInterest,
      totalPeriods,
      payPerYearLabel: payLabel,
      yearlySchedule,
      monthlySchedule,
      donutData,
      principalPct,
      interestPct,
    };
  }, [amortAmount, amortYears, amortMonths, amortRate, amortCompound, amortPayBack, amortCalcCount]);

  // -------------------------------------------------------------
  // DEFERRED PAYMENT LOAN MATH
  // -------------------------------------------------------------
  const deferCalculations = useMemo(() => {
    const P = Math.max(0, deferAmount);
    const r = Math.max(0, deferRate) / 100;
    const t = deferYears + deferMonths / 12;

    if (P === 0 || t === 0) {
      return {
        amountDueAtMaturity: P,
        totalInterest: 0,
        donutData: [{ name: 'Principal', value: 100, color: '#3b82f6' }],
        principalPct: 100,
        interestPct: 0,
        schedule: [],
      };
    }

    let A = 0;
    if (deferCompound === 'continuously') {
      A = P * Math.exp(r * t);
    } else {
      const compoundPerYear =
        COMPOUND_OPTIONS.find((c) => c.value === deferCompound)?.periodsPerYear || 1;
      A = P * Math.pow(1 + r / compoundPerYear, compoundPerYear * t);
    }

    const totalInterest = Math.max(0, A - P);
    const principalPct = Math.round((P / A) * 100);
    const interestPct = Math.max(0, 100 - principalPct);

    // Build Yearly growth schedule
    const schedule: Array<{ year: number; interestAccrued: number; balance: number }> = [];
    const compoundPerYear =
      deferCompound === 'continuously'
        ? Infinity
        : COMPOUND_OPTIONS.find((c) => c.value === deferCompound)?.periodsPerYear || 1;

    for (let yr = 1; yr <= Math.ceil(t); yr++) {
      let yrBalance = 0;
      if (deferCompound === 'continuously') {
        yrBalance = P * Math.exp(r * yr);
      } else {
        yrBalance = P * Math.pow(1 + r / compoundPerYear, compoundPerYear * yr);
      }
      schedule.push({
        year: yr,
        interestAccrued: Math.round(yrBalance - P),
        balance: Math.round(yrBalance),
      });
    }

    const donutData = [
      { name: 'Principal', value: Math.round(P), color: '#3b82f6', pct: principalPct },
      { name: 'Interest', value: Math.round(totalInterest), color: '#84cc16', pct: interestPct },
    ];

    return {
      amountDueAtMaturity: A,
      totalInterest,
      donutData,
      principalPct,
      interestPct,
      schedule,
    };
  }, [deferAmount, deferYears, deferMonths, deferRate, deferCompound]);

  // Helper currency format
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  // Export Amortization Table to CSV
  const exportAmortizationCsv = () => {
    let csv = 'Period/Year,Principal Paid,Interest Paid,Ending Balance\n';
    if (amortScheduleView === 'yearly') {
      amortCalculations.yearlySchedule.forEach((row) => {
        csv += `Year ${row.year},${row.principal},${row.interest},${row.endingBalance}\n`;
      });
    } else {
      amortCalculations.monthlySchedule.forEach((row) => {
        csv += `Payment ${row.period},${row.principal},${row.interest},${row.balance}\n`;
      });
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Loan_Amortization_Schedule_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10 font-sans max-w-5xl mx-auto">
      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: AMORTIZED LOAN CALCULATOR */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Amortized Loan: Paying Back a Fixed Amount Periodically
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
            Use this calculator for basic calculations of common loan types such as{' '}
            <span className="text-blue-700 font-semibold underline cursor-pointer">mortgages</span>,{' '}
            <span className="text-blue-700 font-semibold underline cursor-pointer">auto loans</span>,{' '}
            <span className="text-blue-700 font-semibold underline cursor-pointer">student loans</span>, or{' '}
            <span className="text-blue-700 font-semibold underline cursor-pointer">personal loans</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Inputs Column */}
          <div className="lg:col-span-6 space-y-4">
            {/* Loan Amount */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-800 sm:w-32">Loan Amount</label>
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-slate-400">
                  $
                </span>
                <input
                  type="number"
                  value={amortAmount}
                  onChange={(e) => setAmortAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Loan Term (Dual Input: Years + Months) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-800 sm:w-32">Loan Term</label>
              <div className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-1.5 flex-1">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={amortYears}
                    onChange={(e) => setAmortYears(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none text-center"
                  />
                  <span className="text-xs text-slate-600 font-medium">years</span>
                </div>
                <div className="flex items-center gap-1.5 flex-1">
                  <input
                    type="number"
                    min={0}
                    max={11}
                    value={amortMonths}
                    onChange={(e) => setAmortMonths(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none text-center"
                  />
                  <span className="text-xs text-slate-600 font-medium">months</span>
                </div>
              </div>
            </div>

            {/* Interest Rate */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-800 sm:w-32">Interest Rate</label>
              <div className="relative flex-1">
                <input
                  type="number"
                  step={0.01}
                  value={amortRate}
                  onChange={(e) => setAmortRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 pr-7 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-bold text-slate-400">
                  %
                </span>
              </div>
            </div>

            {/* Compound Frequency */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-800 sm:w-32">Compound</label>
              <select
                value={amortCompound}
                onChange={(e) => setAmortCompound(e.target.value as CompoundFrequency)}
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {COMPOUND_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Pay Back Frequency */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-800 sm:w-32">Pay Back</label>
              <select
                value={amortPayBack}
                onChange={(e) => setAmortPayBack(e.target.value as PayBackFrequency)}
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {PAYBACK_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons: Calculate and Clear */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setAmortCalcCount((c) => c + 1)}
                className="px-6 py-2.5 bg-[#2e7d32] hover:bg-[#1b5e20] active:scale-95 text-white font-extrabold rounded-lg text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span>Calculate</span>
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setAmortAmount(100000);
                  setAmortYears(10);
                  setAmortMonths(0);
                  setAmortRate(6.0);
                  setAmortCompound('monthly');
                  setAmortPayBack('monthly');
                }}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Right Results Column (Signature Calculator.net Green Theme) */}
          <div className="lg:col-span-6 bg-[#f4fdf8] border border-[#d8f5e5] rounded-2xl overflow-hidden shadow-xs">
            {/* Header bar */}
            <div className="bg-[#2e7d32] text-white px-5 py-2.5 flex items-center justify-between">
              <h3 className="text-xs font-black tracking-wide uppercase">Results</h3>
              <span className="text-[11px] font-medium text-emerald-100">Amortized Schedule</span>
            </div>

            {/* Main Result Content */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-emerald-100/60 pb-2">
                  <span className="font-bold text-slate-700">Payment Every {amortCalculations.payPerYearLabel}:</span>
                  <span className="font-black text-slate-900 text-sm sm:text-base font-mono">
                    {formatCurrency(amortCalculations.paymentPerPeriod)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-emerald-100/60 pb-2">
                  <span className="font-medium text-slate-700">Total of {amortCalculations.totalPeriods} Payments:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {formatCurrency(amortCalculations.totalPayments)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-emerald-100/60 pb-2">
                  <span className="font-medium text-slate-700">Total Interest:</span>
                  <span className="font-bold text-[#2e7d32] font-mono">
                    {formatCurrency(amortCalculations.totalInterest)}
                  </span>
                </div>
              </div>

              {/* Donut Chart and Legend */}
              <div className="flex items-center justify-center gap-6 pt-2">
                <div className="w-28 h-28 relative shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={amortCalculations.donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={28}
                        outerRadius={48}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {amortCalculations.donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(val: any) => formatCurrency(Number(val))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1.5 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-[#3b82f6] shrink-0" />
                    <span className="text-slate-700">Principal ({amortCalculations.principalPct}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-[#22c55e] shrink-0" />
                    <span className="text-slate-700">Interest ({amortCalculations.interestPct}%)</span>
                  </div>
                </div>
              </div>

              {/* Interactive Amortization Table Link */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowAmortTable((prev) => !prev)}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>{showAmortTable ? 'Hide Amortization Table' : 'View Amortization Table'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Amortization Schedule Table */}
        {showAmortTable && (
          <div className="mt-6 pt-6 border-t border-slate-200 space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setAmortScheduleView('yearly')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                      amortScheduleView === 'yearly'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Annual Schedule
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmortScheduleView('monthly')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                      amortScheduleView === 'monthly'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Monthly Schedule
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={exportAmortizationCsv}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold sticky top-0">
                  <tr>
                    <th className="p-3">Period</th>
                    <th className="p-3 text-right">Principal Paid</th>
                    <th className="p-3 text-right">Interest Paid</th>
                    <th className="p-3 text-right">Ending Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {amortScheduleView === 'yearly'
                    ? amortCalculations.yearlySchedule.map((row) => (
                        <tr key={row.year} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-800">Year {row.year}</td>
                          <td className="p-3 text-right font-mono text-slate-700">{formatCurrency(row.principal)}</td>
                          <td className="p-3 text-right font-mono text-emerald-700">{formatCurrency(row.interest)}</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">
                            {formatCurrency(row.endingBalance)}
                          </td>
                        </tr>
                      ))
                    : amortCalculations.monthlySchedule.map((row) => (
                        <tr key={row.period} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-800">Payment {row.period}</td>
                          <td className="p-3 text-right font-mono text-slate-700">{formatCurrency(row.principal)}</td>
                          <td className="p-3 text-right font-mono text-emerald-700">{formatCurrency(row.interest)}</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">
                            {formatCurrency(row.balance)}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: DEFERRED PAYMENT LOAN CALCULATOR */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Deferred Payment Loan: Paying Back a Lump Sum Due at Maturity
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
            Use this calculator for loans where no interim payments are made during the loan term, and the total principal plus accumulated compound interest is repaid in a single lump sum at loan maturity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Inputs Column */}
          <div className="lg:col-span-6 space-y-4">
            {/* Loan Amount */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-800 sm:w-32">Loan Amount</label>
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-slate-400">
                  $
                </span>
                <input
                  type="number"
                  value={deferAmount}
                  onChange={(e) => setDeferAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Loan Term */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-800 sm:w-32">Loan Term</label>
              <div className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-1.5 flex-1">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={deferYears}
                    onChange={(e) => setDeferYears(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none text-center"
                  />
                  <span className="text-xs text-slate-600 font-medium">years</span>
                </div>
                <div className="flex items-center gap-1.5 flex-1">
                  <input
                    type="number"
                    min={0}
                    max={11}
                    value={deferMonths}
                    onChange={(e) => setDeferMonths(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none text-center"
                  />
                  <span className="text-xs text-slate-600 font-medium">months</span>
                </div>
              </div>
            </div>

            {/* Interest Rate */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-800 sm:w-32">Interest Rate</label>
              <div className="relative flex-1">
                <input
                  type="number"
                  step={0.01}
                  value={deferRate}
                  onChange={(e) => setDeferRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 pr-7 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-bold text-slate-400">
                  %
                </span>
              </div>
            </div>

            {/* Compound Frequency */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-800 sm:w-32">Compound</label>
              <select
                value={deferCompound}
                onChange={(e) => setDeferCompound(e.target.value as CompoundFrequency)}
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {COMPOUND_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                className="px-6 py-2.5 bg-[#2e7d32] hover:bg-[#1b5e20] active:scale-95 text-white font-extrabold rounded-lg text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span>Calculate</span>
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeferAmount(100000);
                  setDeferYears(10);
                  setDeferMonths(0);
                  setDeferRate(6.0);
                  setDeferCompound('annually');
                }}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Right Results Column */}
          <div className="lg:col-span-6 bg-[#f4fdf8] border border-[#d8f5e5] rounded-2xl overflow-hidden shadow-xs">
            <div className="bg-[#2e7d32] text-white px-5 py-2.5 flex items-center justify-between">
              <h3 className="text-xs font-black tracking-wide uppercase">Results</h3>
              <span className="text-[11px] font-medium text-emerald-100">Balloon Maturity</span>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-emerald-100/60 pb-2">
                  <span className="font-bold text-slate-700">Amount Due at Loan Maturity:</span>
                  <span className="font-black text-slate-900 text-sm sm:text-base font-mono">
                    {formatCurrency(deferCalculations.amountDueAtMaturity)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-emerald-100/60 pb-2">
                  <span className="font-medium text-slate-700">Total Interest:</span>
                  <span className="font-bold text-[#2e7d32] font-mono">
                    {formatCurrency(deferCalculations.totalInterest)}
                  </span>
                </div>
              </div>

              {/* Donut Chart */}
              <div className="flex items-center justify-center gap-6 pt-2">
                <div className="w-28 h-28 relative shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deferCalculations.donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={28}
                        outerRadius={48}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {deferCalculations.donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(val: any) => formatCurrency(Number(val))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1.5 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-[#3b82f6] shrink-0" />
                    <span className="text-slate-700">Principal ({deferCalculations.principalPct}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-[#84cc16] shrink-0" />
                    <span className="text-slate-700">Interest ({deferCalculations.interestPct}%)</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowDeferTable((prev) => !prev)}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>{showDeferTable ? 'Hide Schedule Table' : 'View Schedule Table'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Table */}
        {showDeferTable && (
          <div className="mt-6 pt-6 border-t border-slate-200 space-y-4 animate-fadeIn">
            <h4 className="text-xs font-bold text-slate-800">Annual Accrual Schedule</h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold sticky top-0">
                  <tr>
                    <th className="p-3">Year</th>
                    <th className="p-3 text-right">Cumulative Interest</th>
                    <th className="p-3 text-right">Payoff Balance Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deferCalculations.schedule.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-800">End of Year {row.year}</td>
                      <td className="p-3 text-right font-mono text-lime-700">
                        {formatCurrency(row.interestAccrued)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(row.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 3: BOND PAR VALUE INFORMATION */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          3. Bond: Predetermined Lump Sum Paid at Loan Maturity
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          A bond is a fixed-income instrument representing a loan made by an investor to a borrower (typically corporate or governmental). The face value (par value) of the bond is returned in full upon reaching the maturity date, while regular coupon interest payments are distributed throughout the term.
        </p>
      </div>
    </div>
  );
};
