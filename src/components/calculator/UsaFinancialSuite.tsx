import React, { useState, useMemo } from 'react';
import {
  FileText,
  Home,
  TrendingUp,
  Receipt,
  Calendar,
  Sliders,
  DollarSign,
  PieChart as PieIcon,
  PiggyBank,
  CheckCircle2,
  Lock,
  Minus,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

interface UsaFinancialSuiteProps {
  initialTab?: 'tax' | 'mortgage' | 'retirement' | 'sales';
}

export const UsaFinancialSuite: React.FC<UsaFinancialSuiteProps> = ({
  initialTab = 'tax',
}) => {
  const [activeTab, setActiveTab] = useState<'tax' | 'mortgage' | 'retirement' | 'sales'>(initialTab);

  // -------------------------------------------------------------
  // 1. TAX CALCULATOR STATE & LOGIC
  // -------------------------------------------------------------
  const [taxGross, setTaxGross] = useState<number>(95000);
  const [taxFilingStatus, setTaxFilingStatus] = useState<'single' | 'mfj' | 'hoh'>('single');
  const [taxDeductionType, setTaxDeductionType] = useState<'standard' | 'itemized'>('standard');
  const [taxItemizedAmt, setTaxItemizedAmt] = useState<number>(18000);
  const [taxState, setTaxState] = useState<string>('CA');
  const [taxPretax401k, setTaxPretax401k] = useState<number>(5000);

  const taxResults = useMemo(() => {
    const gross = Math.max(0, taxGross || 0);
    const pretax = Math.min(Math.max(0, taxPretax401k || 0), 23000);

    // Standard Deductions (2024/2025 IRS)
    let stdDeduction = 14600; // Single
    if (taxFilingStatus === 'mfj') stdDeduction = 29200;
    if (taxFilingStatus === 'hoh') stdDeduction = 21900;

    const effectiveDeduction = taxDeductionType === 'standard' ? stdDeduction : Math.max(0, taxItemizedAmt || 0);

    // FICA (Social Security 6.2% up to $168,600 + Medicare 1.45%)
    const ssLimit = 168600;
    const ssTax = Math.min(gross, ssLimit) * 0.062;
    const medicareTax = gross * 0.0145;
    const totalFica = ssTax + medicareTax;

    // Federal Taxable Income
    const taxableFedIncome = Math.max(0, gross - pretax - effectiveDeduction);

    // Federal Brackets (2024/2025)
    let brackets = [
      { limit: 11600, rate: 0.10 },
      { limit: 47150, rate: 0.12 },
      { limit: 100525, rate: 0.22 },
      { limit: 191950, rate: 0.24 },
      { limit: 243725, rate: 0.32 },
      { limit: 609350, rate: 0.35 },
      { limit: Infinity, rate: 0.37 },
    ];

    if (taxFilingStatus === 'mfj') {
      brackets = [
        { limit: 23200, rate: 0.10 },
        { limit: 94300, rate: 0.12 },
        { limit: 201050, rate: 0.22 },
        { limit: 383900, rate: 0.24 },
        { limit: 487450, rate: 0.32 },
        { limit: 731200, rate: 0.35 },
        { limit: Infinity, rate: 0.37 },
      ];
    } else if (taxFilingStatus === 'hoh') {
      brackets = [
        { limit: 16550, rate: 0.10 },
        { limit: 63100, rate: 0.12 },
        { limit: 100500, rate: 0.22 },
        { limit: 191950, rate: 0.24 },
        { limit: 243700, rate: 0.32 },
        { limit: 609350, rate: 0.35 },
        { limit: Infinity, rate: 0.37 },
      ];
    }

    let fedTax = 0;
    let prevLimit = 0;
    let marginalRate = 0;

    for (const b of brackets) {
      if (taxableFedIncome > prevLimit) {
        const taxableInBracket = Math.min(taxableFedIncome - prevLimit, b.limit - prevLimit);
        fedTax += taxableInBracket * b.rate;
        marginalRate = b.rate;
        prevLimit = b.limit;
      } else {
        break;
      }
    }

    // State Tax Rates
    let stateTaxRate = 0;
    if (taxState === 'CA') stateTaxRate = 0.065;
    else if (taxState === 'NY') stateTaxRate = 0.055;
    else if (taxState === 'IL') stateTaxRate = 0.0495;
    else if (taxState === 'MA') stateTaxRate = 0.05;
    else if (taxState === 'PA') stateTaxRate = 0.0307;
    else if (taxState === 'NC') stateTaxRate = 0.0475;
    else if (taxState === 'GA') stateTaxRate = 0.0549;

    const stateTax = taxableFedIncome * stateTaxRate;
    const totalTax = fedTax + totalFica + stateTax;
    const takeHome = Math.max(0, gross - totalTax - pretax);
    const effectiveRate = gross > 0 ? (totalTax / gross) * 100 : 0;
    const takeHomePct = gross > 0 ? (takeHome / gross) * 100 : 0;

    const chartData = [
      { name: 'Take-Home Pay', value: Math.round(takeHome), color: '#10b981' },
      { name: 'Federal Tax', value: Math.round(fedTax), color: '#2563eb' },
      { name: 'FICA (SS & Med)', value: Math.round(totalFica), color: '#6366f1' },
      { name: 'State Tax', value: Math.round(stateTax), color: '#f59e0b' },
    ];

    return {
      gross,
      pretax,
      effectiveDeduction,
      taxableFedIncome,
      fedTax,
      totalFica,
      stateTax,
      totalTax,
      takeHome,
      effectiveRate,
      marginalRate: marginalRate * 100,
      takeHomePct,
      monthlyPay: takeHome / 12,
      chartData,
    };
  }, [taxGross, taxFilingStatus, taxDeductionType, taxItemizedAmt, taxState, taxPretax401k]);

  // -------------------------------------------------------------
  // 2. MORTGAGE CALCULATOR STATE & LOGIC
  // -------------------------------------------------------------
  const [mortPrice, setMortPrice] = useState<number>(420000);
  const [mortDpAmt, setMortDpAmt] = useState<number>(84000);
  const [mortDpPct, setMortDpPct] = useState<number>(20);
  const [mortRate, setMortRate] = useState<number>(6.75);
  const [mortTerm, setMortTerm] = useState<number>(30);
  const [mortPropTaxPct, setMortPropTaxPct] = useState<number>(1.2);
  const [mortInsuranceAnnual, setMortInsuranceAnnual] = useState<number>(1500);
  const [mortHoaMonthly, setMortHoaMonthly] = useState<number>(0);

  const handleMortPriceChange = (val: number) => {
    setMortPrice(val);
    const newDpAmt = Math.round(val * (mortDpPct / 100));
    setMortDpAmt(newDpAmt);
  };

  const handleMortDpAmtChange = (val: number) => {
    setMortDpAmt(val);
    if (mortPrice > 0) {
      setMortDpPct(parseFloat(((val / mortPrice) * 100).toFixed(1)));
    }
  };

  const handleMortDpPctChange = (pct: number) => {
    setMortDpPct(pct);
    setMortDpAmt(Math.round(mortPrice * (pct / 100)));
  };

  const mortResults = useMemo(() => {
    const price = Math.max(0, mortPrice || 0);
    const dp = Math.max(0, mortDpAmt || 0);
    const loanAmt = Math.max(0, price - dp);
    const rateYearly = Math.max(0, mortRate || 0);
    const r = rateYearly / 100 / 12;
    const n = mortTerm * 12;

    let monthlyPI = 0;
    if (r > 0 && n > 0) {
      monthlyPI = (loanAmt * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
    } else if (n > 0) {
      monthlyPI = loanAmt / n;
    }

    const monthlyPropTax = (price * ((mortPropTaxPct || 0) / 100)) / 12;
    const monthlyIns = (mortInsuranceAnnual || 0) / 12;

    const dpPct = price > 0 ? (dp / price) * 100 : 0;
    let monthlyPMI = 0;
    if (dpPct < 20) {
      monthlyPMI = (loanAmt * 0.0075) / 12;
    }

    const hoa = mortHoaMonthly || 0;
    const totalMonthly = monthlyPI + monthlyPropTax + monthlyIns + monthlyPMI + hoa;
    const totalPaidOverTerm = monthlyPI * n;
    const totalInterest = Math.max(0, totalPaidOverTerm - loanAmt);

    const chartData = [
      { name: 'P & I', value: Math.round(monthlyPI), color: '#059669' },
      { name: 'Property Tax', value: Math.round(monthlyPropTax), color: '#3b82f6' },
      { name: 'Home Insurance', value: Math.round(monthlyIns), color: '#f59e0b' },
      { name: 'PMI', value: Math.round(monthlyPMI), color: '#a855f7' },
      { name: 'HOA', value: Math.round(hoa), color: '#94a3b8' },
    ].filter((item) => item.value > 0);

    return {
      loanAmt,
      monthlyPI,
      monthlyPropTax,
      monthlyIns,
      monthlyPMI,
      hoa,
      totalMonthly,
      totalInterest,
      isPmiActive: dpPct < 20,
      chartData,
    };
  }, [mortPrice, mortDpAmt, mortRate, mortTerm, mortPropTaxPct, mortInsuranceAnnual, mortHoaMonthly]);

  // -------------------------------------------------------------
  // 3. RETIREMENT 401(K) STATE & LOGIC
  // -------------------------------------------------------------
  const [retCurrentAge, setRetCurrentAge] = useState<number>(30);
  const [retTargetAge, setRetTargetAge] = useState<number>(65);
  const [retBalanceCurrent, setRetBalanceCurrent] = useState<number>(25000);
  const [retSalary, setRetSalary] = useState<number>(85000);
  const [retContribPct, setRetContribPct] = useState<number>(10);
  const [retMatchPct, setRetMatchPct] = useState<number>(50);
  const [retMatchCap, setRetMatchCap] = useState<number>(6);
  const [retReturnRate, setRetReturnRate] = useState<number>(7.5);
  const [retAdjustInflation, setRetAdjustInflation] = useState<boolean>(true);

  const retResults = useMemo(() => {
    const curAge = Math.max(18, retCurrentAge || 30);
    const targetAge = Math.max(curAge + 1, retTargetAge || 65);
    const currentBalance = Math.max(0, retBalanceCurrent || 0);
    const salary = Math.max(0, retSalary || 0);
    const userContribPct = Math.max(0, retContribPct || 0);
    const matchPct = Math.max(0, retMatchPct || 0);
    const matchCapPct = Math.max(0, retMatchCap || 0);
    const returnRate = (retReturnRate || 0) / 100;
    const inflationRate = 0.025;

    const totalYears = targetAge - curAge;
    const userAnnualContrib = salary * (userContribPct / 100);
    const matchedSalaryPct = Math.min(userContribPct, matchCapPct);
    const employerAnnualMatch = salary * (matchedSalaryPct / 100) * (matchPct / 100);

    let totalUserContribCum = 0;
    let totalMatchContribCum = 0;
    let runningBalance = currentBalance;

    const trajectory = [];

    for (let i = 0; i <= totalYears; i++) {
      const ageLabel = `Age ${curAge + i}`;
      if (i === 0) {
        trajectory.push({
          age: ageLabel,
          portfolio: Math.round(runningBalance),
          invested: Math.round(currentBalance),
        });
        continue;
      }

      totalUserContribCum += userAnnualContrib;
      totalMatchContribCum += employerAnnualMatch;

      runningBalance = (runningBalance + userAnnualContrib + employerAnnualMatch) * (1 + returnRate);

      let displayBalance = runningBalance;
      if (retAdjustInflation) {
        displayBalance = runningBalance / Math.pow(1 + inflationRate, i);
      }

      trajectory.push({
        age: ageLabel,
        portfolio: Math.round(displayBalance),
        invested: Math.round(currentBalance + totalUserContribCum + totalMatchContribCum),
      });
    }

    const finalItem = trajectory[trajectory.length - 1];
    const finalBalance = finalItem ? finalItem.portfolio : 0;
    const totalContribCombined = currentBalance + totalUserContribCum + totalMatchContribCum;
    const totalInterestEarned = Math.max(0, finalBalance - totalContribCombined);

    return {
      finalBalance,
      userContribTotal: currentBalance + totalUserContribCum,
      matchContribTotal: totalMatchContribCum,
      totalInterestEarned,
      trajectory,
    };
  }, [
    retCurrentAge,
    retTargetAge,
    retBalanceCurrent,
    retSalary,
    retContribPct,
    retMatchPct,
    retMatchCap,
    retReturnRate,
    retAdjustInflation,
  ]);

  // -------------------------------------------------------------
  // 4. TIP & SALES TAX STATE & LOGIC
  // -------------------------------------------------------------
  const [tipBillAmt, setTipBillAmt] = useState<number>(120.0);
  const [tipPct, setTipPct] = useState<number>(20);
  const [salesTaxPreset, setSalesTaxPreset] = useState<string>('8.875');
  const [salesTaxPct, setSalesTaxPct] = useState<number>(8.875);
  const [splitCount, setSplitCount] = useState<number>(2);

  const handleSalesTaxPresetChange = (preset: string) => {
    setSalesTaxPreset(preset);
    if (preset !== 'custom') {
      setSalesTaxPct(parseFloat(preset));
    }
  };

  const tipResults = useMemo(() => {
    const bill = Math.max(0, tipBillAmt || 0);
    const taxP = Math.max(0, salesTaxPct || 0);
    const tipP = Math.max(0, tipPct || 0);
    const count = Math.max(1, splitCount || 1);

    const taxAmount = bill * (taxP / 100);
    const tipAmount = bill * (tipP / 100);
    const grandTotal = bill + taxAmount + tipAmount;
    const perPerson = grandTotal / count;

    return {
      bill,
      taxAmount,
      tipAmount,
      grandTotal,
      perPerson,
      splitCount: count,
    };
  }, [tipBillAmt, tipPct, salesTaxPct, splitCount]);

  // Utility currency formatter
  const formatCurrency = (val: number, maxFractionDigits: number = 0) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: maxFractionDigits,
    }).format(val);
  };

  return (
    <div className="w-full space-y-6">
      {/* Navigation Sub-Tabs Bar (if not embedded in main header) */}
      <div className="bg-navy-900 rounded-2xl p-2 shadow-md flex items-center justify-between border border-slate-800 overflow-x-auto">
        <div className="flex space-x-1 sm:space-x-2">
          <button
            onClick={() => setActiveTab('tax')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'tax'
                ? 'bg-usblue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Income Tax</span>
          </button>
          <button
            onClick={() => setActiveTab('mortgage')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'mortgage'
                ? 'bg-usblue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Mortgage</span>
          </button>
          <button
            onClick={() => setActiveTab('retirement')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'retirement'
                ? 'bg-usblue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>401(k) / IRA</span>
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'sales'
                ? 'bg-usblue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Tip & Sales Tax</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: INCOME TAX CALCULATOR */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'tax' && (
        <section id="sec-tax" className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-navy-800 to-usblue-700 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                US Federal & State Income Tax Calculator
              </h1>
              <p className="text-slate-300 text-sm mt-1">
                Estimate your Federal Tax, FICA (Social Security & Medicare), and State Tax liability based on current IRS brackets.
              </p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-200 border border-blue-400/30 shrink-0">
              <Calendar className="w-3.5 h-3.5 mr-1.5" /> Tax Year 2024 / 2025
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Controls Panel */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
                <Sliders className="w-4 h-4 text-usblue-600 mr-2" />
                Tax Parameters
              </h2>

              {/* Gross Income Input */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Annual Gross Income ($)
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold">
                    $
                  </div>
                  <input
                    type="number"
                    value={taxGross}
                    min={0}
                    step={1000}
                    onChange={(e) => setTaxGross(parseFloat(e.target.value) || 0)}
                    className="block w-full pl-8 pr-4 py-3 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-usblue-500 focus:border-usblue-500 outline-none"
                  />
                </div>
              </div>

              {/* Filing Status */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Filing Status
                </label>
                <select
                  value={taxFilingStatus}
                  onChange={(e) => setTaxFilingStatus(e.target.value as any)}
                  className="block w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-usblue-500 focus:border-usblue-500 bg-white outline-none"
                >
                  <option value="single">Single</option>
                  <option value="mfj">Married Filing Jointly</option>
                  <option value="hoh">Head of Household</option>
                </select>
              </div>

              {/* Deduction Type */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Deduction Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center p-3 border rounded-xl cursor-pointer transition ${
                      taxDeductionType === 'standard' ? 'border-usblue-500 bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tax-deduction-type"
                      checked={taxDeductionType === 'standard'}
                      onChange={() => setTaxDeductionType('standard')}
                      className="text-usblue-600 focus:ring-usblue-500"
                    />
                    <span className="ml-2 text-xs font-semibold text-slate-800">Standard Deduction</span>
                  </label>
                  <label
                    className={`flex items-center p-3 border rounded-xl cursor-pointer transition ${
                      taxDeductionType === 'itemized' ? 'border-usblue-500 bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tax-deduction-type"
                      checked={taxDeductionType === 'itemized'}
                      onChange={() => setTaxDeductionType('itemized')}
                      className="text-usblue-600 focus:ring-usblue-500"
                    />
                    <span className="ml-2 text-xs font-semibold text-slate-800">Itemized</span>
                  </label>
                </div>
              </div>

              {/* Itemized Amount (Hidden if Standard) */}
              {taxDeductionType === 'itemized' && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Custom Itemized Deductions ($)
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold">
                      $
                    </div>
                    <input
                      type="number"
                      value={taxItemizedAmt}
                      min={0}
                      step={500}
                      onChange={(e) => setTaxItemizedAmt(parseFloat(e.target.value) || 0)}
                      className="block w-full pl-8 pr-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-usblue-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* State Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  State of Residence
                </label>
                <select
                  value={taxState}
                  onChange={(e) => setTaxState(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-usblue-500 focus:border-usblue-500 bg-white outline-none"
                >
                  <option value="CA">California (CA) - High Rate</option>
                  <option value="NY">New York (NY) - Medium-High</option>
                  <option value="TX">Texas (TX) - No Income Tax</option>
                  <option value="FL">Florida (FL) - No Income Tax</option>
                  <option value="WA">Washington (WA) - No Income Tax</option>
                  <option value="IL">Illinois (IL) - Flat 4.95%</option>
                  <option value="MA">Massachusetts (MA) - Flat 5%</option>
                  <option value="PA">Pennsylvania (PA) - Flat 3.07%</option>
                  <option value="NC">North Carolina (NC) - Flat 4.75%</option>
                  <option value="GA">Georgia (GA) - Flat 5.49%</option>
                </select>
              </div>

              {/* 401k Pre-tax Contribution */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Pre-Tax 401(k) Contribution ($)
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold">
                    $
                  </div>
                  <input
                    type="number"
                    value={taxPretax401k}
                    min={0}
                    max={23000}
                    step={500}
                    onChange={(e) => setTaxPretax401k(parseFloat(e.target.value) || 0)}
                    className="block w-full pl-8 pr-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-usblue-500 outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">2024 IRS limit: $23,000 (reduces taxable income).</p>
              </div>
            </div>

            {/* Results & Visuals Panel */}
            <div className="lg:col-span-7 space-y-6">
              {/* Key KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
                    Take-Home Pay
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-600 block mt-1">
                    {formatCurrency(taxResults.takeHome)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {taxResults.takeHomePct.toFixed(1)}% of gross
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
                    Total Tax Liability
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-usred-600 block mt-1">
                    {formatCurrency(taxResults.totalTax)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Effective: {taxResults.effectiveRate.toFixed(1)}%
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
                    Marginal Bracket
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-slate-800 block mt-1">
                    {taxResults.marginalRate.toFixed(0)}%
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Top Federal Bracket</span>
                </div>
              </div>

              {/* Breakdown Box & Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
                  <span>Tax Breakdown Visualizer</span>
                  <span className="text-xs text-slate-500 font-normal">
                    Monthly Paycheck: <strong className="text-slate-800">{formatCurrency(taxResults.monthlyPay)}</strong>
                  </span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="h-56 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={taxResults.chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {taxResults.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(val: any) => formatCurrency(Number(val))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="flex items-center text-slate-600">
                        <span className="w-3 h-3 rounded-full bg-blue-600 mr-2 shrink-0" />
                        Federal Income Tax
                      </span>
                      <span className="font-bold text-slate-800">{formatCurrency(taxResults.fedTax)}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="flex items-center text-slate-600">
                        <span className="w-3 h-3 rounded-full bg-indigo-500 mr-2 shrink-0" />
                        FICA (SS & Medicare)
                      </span>
                      <span className="font-bold text-slate-800">{formatCurrency(taxResults.totalFica)}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="flex items-center text-slate-600">
                        <span className="w-3 h-3 rounded-full bg-amber-500 mr-2 shrink-0" />
                        State Income Tax
                      </span>
                      <span className="font-bold text-slate-800">{formatCurrency(taxResults.stateTax)}</span>
                    </div>

                    <div className="flex justify-between items-center pt-1 font-semibold">
                      <span className="text-slate-700">Taxable Federal Income</span>
                      <span className="text-slate-900">{formatCurrency(taxResults.taxableFedIncome)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: MORTGAGE & HOUSING CALCULATOR */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'mortgage' && (
        <section id="sec-mortgage" className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-navy-800 to-emerald-700 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                US Mortgage & Home Financing Calculator
              </h1>
              <p className="text-slate-300 text-sm mt-1">
                Calculate monthly P&I, Property Taxes, Homeowners Insurance, HOA fees, and PMI requirements.
              </p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 shrink-0">
              <Lock className="w-3.5 h-3.5 mr-1.5" /> Amortization Ready
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Controls Panel */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
                <Sliders className="w-4 h-4 text-emerald-600 mr-2" />
                Home Loan Details
              </h2>

              {/* Home Price Input with synced slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Home Purchase Price
                  </label>
                  <span className="text-sm font-black text-emerald-600">
                    {formatCurrency(mortPrice)}
                  </span>
                </div>
                <input
                  type="range"
                  min={100000}
                  max={2000000}
                  step={10000}
                  value={mortPrice}
                  onChange={(e) => handleMortPriceChange(parseFloat(e.target.value) || 0)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="mt-2 relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    value={mortPrice}
                    onChange={(e) => handleMortPriceChange(parseFloat(e.target.value) || 0)}
                    className="block w-full pl-7 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Down Payment ($ and %) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Down Payment ($)
                  </label>
                  <input
                    type="number"
                    value={mortDpAmt}
                    onChange={(e) => handleMortDpAmtChange(parseFloat(e.target.value) || 0)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Down Payment (%)
                  </label>
                  <input
                    type="number"
                    value={mortDpPct}
                    min={0}
                    max={90}
                    step={0.5}
                    onChange={(e) => handleMortDpPctChange(parseFloat(e.target.value) || 0)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Interest Rate & Loan Term */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    value={mortRate}
                    min={1}
                    max={15}
                    step={0.125}
                    onChange={(e) => setMortRate(parseFloat(e.target.value) || 0)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Loan Term
                  </label>
                  <select
                    value={mortTerm}
                    onChange={(e) => setMortTerm(parseInt(e.target.value) || 30)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-white outline-none"
                  >
                    <option value={30}>30 Years Fixed</option>
                    <option value={20}>20 Years Fixed</option>
                    <option value={15}>15 Years Fixed</option>
                    <option value={10}>10 Years Fixed</option>
                  </select>
                </div>
              </div>

              {/* Additional Expenses */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Taxes, Insurance & Fees
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Prop Tax %</label>
                    <input
                      type="number"
                      value={mortPropTaxPct}
                      step={0.1}
                      onChange={(e) => setMortPropTaxPct(parseFloat(e.target.value) || 0)}
                      className="block w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Home Ins ($/yr)</label>
                    <input
                      type="number"
                      value={mortInsuranceAnnual}
                      step={100}
                      onChange={(e) => setMortInsuranceAnnual(parseFloat(e.target.value) || 0)}
                      className="block w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">HOA ($/mo)</label>
                    <input
                      type="number"
                      value={mortHoaMonthly}
                      step={25}
                      onChange={(e) => setMortHoaMonthly(parseFloat(e.target.value) || 0)}
                      className="block w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Results & Visuals Panel */}
            <div className="lg:col-span-7 space-y-6">
              {/* Key Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
                    Total Monthly Pay
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-600 block mt-1">
                    {formatCurrency(mortResults.totalMonthly)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Principal, Tax, Ins & Fees</span>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
                    Loan Amount
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-slate-800 block mt-1">
                    {formatCurrency(mortResults.loanAmt)}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      mortResults.isPmiActive ? 'text-amber-600' : 'text-emerald-600'
                    }`}
                  >
                    {mortResults.isPmiActive ? 'PMI: Active (DP < 20%)' : 'PMI: Excluded (20%+ DP)'}
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
                    Total Interest Paid
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-slate-800 block mt-1">
                    {formatCurrency(mortResults.totalInterest)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Over full loan duration</span>
                </div>
              </div>

              {/* Chart & Monthly Breakdown */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-base font-bold text-slate-900 mb-4">Monthly Payment Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="h-56 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mortResults.chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {mortResults.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(val: any) => formatCurrency(Number(val))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="flex items-center text-slate-600">
                        <span className="w-3 h-3 rounded-full bg-emerald-600 mr-2 shrink-0" />
                        Principal & Interest
                      </span>
                      <span className="font-bold text-slate-800">{formatCurrency(mortResults.monthlyPI)}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="flex items-center text-slate-600">
                        <span className="w-3 h-3 rounded-full bg-blue-500 mr-2 shrink-0" />
                        Property Tax
                      </span>
                      <span className="font-bold text-slate-800">{formatCurrency(mortResults.monthlyPropTax)}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="flex items-center text-slate-600">
                        <span className="w-3 h-3 rounded-full bg-amber-500 mr-2 shrink-0" />
                        Home Insurance
                      </span>
                      <span className="font-bold text-slate-800">{formatCurrency(mortResults.monthlyIns)}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="flex items-center text-slate-600">
                        <span className="w-3 h-3 rounded-full bg-purple-500 mr-2 shrink-0" />
                        PMI (Private Mort Ins)
                      </span>
                      <span className="font-bold text-slate-800">{formatCurrency(mortResults.monthlyPMI)}</span>
                    </div>

                    <div className="flex justify-between items-center pt-1 font-medium">
                      <span className="flex items-center text-slate-600">
                        <span className="w-3 h-3 rounded-full bg-slate-400 mr-2 shrink-0" />
                        HOA Fees
                      </span>
                      <span className="font-bold text-slate-800">{formatCurrency(mortResults.hoa)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 3: 401(K) & RETIREMENT CALCULATOR */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'retirement' && (
        <section id="sec-retirement" className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-navy-800 to-indigo-700 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                US 401(k) & IRA Retirement Growth Calculator
              </h1>
              <p className="text-slate-300 text-sm mt-1">
                Project your wealth accumulation with employer matching, compound interest, and inflation adjustment.
              </p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 shrink-0">
              <PiggyBank className="w-3.5 h-3.5 mr-1.5" /> Compound Wealth Engine
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Controls Panel */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
                <Sliders className="w-4 h-4 text-indigo-600 mr-2" />
                Savings Inputs
              </h2>

              {/* Current Age & Target Age */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Current Age
                  </label>
                  <input
                    type="number"
                    value={retCurrentAge}
                    min={18}
                    max={80}
                    onChange={(e) => setRetCurrentAge(parseInt(e.target.value) || 18)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Target Ret. Age
                  </label>
                  <input
                    type="number"
                    value={retTargetAge}
                    min={40}
                    max={90}
                    onChange={(e) => setRetTargetAge(parseInt(e.target.value) || 65)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Balance & Salary */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Current Balance ($)
                  </label>
                  <input
                    type="number"
                    value={retBalanceCurrent}
                    step={1000}
                    onChange={(e) => setRetBalanceCurrent(parseFloat(e.target.value) || 0)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Annual Salary ($)
                  </label>
                  <input
                    type="number"
                    value={retSalary}
                    step={1000}
                    onChange={(e) => setRetSalary(parseFloat(e.target.value) || 0)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Contribution % and Employer Match */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Your Contrib (% salary)
                  </label>
                  <input
                    type="number"
                    value={retContribPct}
                    min={0}
                    max={100}
                    step={1}
                    onChange={(e) => setRetContribPct(parseFloat(e.target.value) || 0)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Employer Match (%)
                  </label>
                  <input
                    type="number"
                    value={retMatchPct}
                    min={0}
                    max={100}
                    step={5}
                    onChange={(e) => setRetMatchPct(parseFloat(e.target.value) || 0)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500">Example: 50% match up to 6% of salary.</p>

              {/* Match Cap & Expected Return */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Match Cap (% salary)
                  </label>
                  <input
                    type="number"
                    value={retMatchCap}
                    min={0}
                    max={20}
                    step={0.5}
                    onChange={(e) => setRetMatchCap(parseFloat(e.target.value) || 0)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Expected Return (%)
                  </label>
                  <input
                    type="number"
                    value={retReturnRate}
                    min={1}
                    max={15}
                    step={0.5}
                    onChange={(e) => setRetReturnRate(parseFloat(e.target.value) || 0)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Inflation Toggle */}
              <div className="pt-2">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={retAdjustInflation}
                    onChange={(e) => setRetAdjustInflation(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Adjust for Inflation (2.5% avg rate)</span>
                </label>
              </div>
            </div>

            {/* Results & Visuals Panel */}
            <div className="lg:col-span-7 space-y-6">
              {/* Key Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
                    Projected Balance
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-indigo-600 block mt-1">
                    {formatCurrency(retResults.finalBalance)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {retAdjustInflation ? 'Inflation Adjusted (Today $)' : 'Nominal Future Value'}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
                    Total Contributions
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-slate-800 block mt-1">
                    {formatCurrency(retResults.userContribTotal)}
                  </span>
                  <span className="text-xs text-emerald-600 font-medium">
                    Match: {formatCurrency(retResults.matchContribTotal)}
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
                    Total Interest Growth
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-slate-800 block mt-1">
                    {formatCurrency(retResults.totalInterestEarned)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Compound earnings</span>
                </div>
              </div>

              {/* Growth Projection Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-base font-bold text-slate-900 mb-4">Wealth Growth Over Time</h3>
                <div className="h-64 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={retResults.trajectory}
                      margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="age" tick={{ fontSize: 11 }} />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                      />
                      <RechartsTooltip
                        formatter={(val: any) => formatCurrency(Number(val))}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          fontSize: '12px',
                        }}
                      />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                      <Area
                        type="monotone"
                        dataKey="portfolio"
                        name="Total Portfolio Value"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorPortfolio)"
                      />
                      <Area
                        type="monotone"
                        dataKey="invested"
                        name="Total Capital Invested"
                        stroke="#94a3b8"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        fill="none"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 4: TIP & SALES TAX CALCULATOR */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'sales' && (
        <section id="sec-sales" className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-navy-800 to-amber-600 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                US Tip & State Sales Tax Quick Calculator
              </h1>
              <p className="text-slate-300 text-sm mt-1">
                Easily split dining bills, apply standard gratuity rates, and calculate state sales tax.
              </p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-200 border border-amber-400/30 shrink-0">
              <Receipt className="w-3.5 h-3.5 mr-1.5" /> Fast Split & Tax
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Controls Panel */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
                <Sliders className="w-4 h-4 text-amber-600 mr-2" />
                Bill Details
              </h2>

              {/* Bill Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Base Bill Amount ($)
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold">
                    $
                  </div>
                  <input
                    type="number"
                    value={tipBillAmt}
                    min={0}
                    step={1}
                    onChange={(e) => setTipBillAmt(parseFloat(e.target.value) || 0)}
                    className="block w-full pl-8 pr-4 py-3 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Tip Selection Buttons */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Tip Percentage
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[15, 18, 20, 25].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setTipPct(pct)}
                      className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        tipPct === pct
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-amber-500 hover:text-white text-slate-700'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={tipPct}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(e) => setTipPct(parseFloat(e.target.value) || 0)}
                  placeholder="Custom Tip %"
                  className="block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* State Sales Tax Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  State Sales Tax Preset
                </label>
                <select
                  value={salesTaxPreset}
                  onChange={(e) => handleSalesTaxPresetChange(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 bg-white outline-none"
                >
                  <option value="7.25">California (7.25% Base)</option>
                  <option value="8.875">New York City (8.875%)</option>
                  <option value="6.25">Texas (6.25% State)</option>
                  <option value="6.0">Florida (6.0% State)</option>
                  <option value="0.0">Oregon / DE / NH / MT (0% Sales Tax)</option>
                  <option value="custom">Custom Rate</option>
                </select>
              </div>

              {/* Custom Tax % Input */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Sales Tax (%)
                </label>
                <input
                  type="number"
                  value={salesTaxPct}
                  step={0.1}
                  min={0}
                  max={20}
                  onChange={(e) => {
                    setSalesTaxPct(parseFloat(e.target.value) || 0);
                    setSalesTaxPreset('custom');
                  }}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* Split Bill Between People */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Split Among People
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
                    className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center text-lg transition cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xl font-black text-slate-800 w-12 text-center">
                    {tipResults.splitCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSplitCount(splitCount + 1)}
                    className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center text-lg transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results & Visuals Panel */}
            <div className="lg:col-span-7 space-y-6">
              {/* Key Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
                    Total Per Person
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-amber-600 block mt-1">
                    {formatCurrency(tipResults.perPerson, 2)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Everything included</span>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
                    Grand Total Bill
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-800 block mt-1">
                    {formatCurrency(tipResults.grandTotal, 2)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Base + Tax + Tip</span>
                </div>
              </div>

              {/* Breakdown Table */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Bill Breakdown
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Base Bill</span>
                    <span className="font-bold text-slate-800">{formatCurrency(tipResults.bill, 2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Sales Tax Amount</span>
                    <span className="font-bold text-slate-800">{formatCurrency(tipResults.taxAmount, 2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Tip / Gratuity Amount</span>
                    <span className="font-bold text-amber-600">{formatCurrency(tipResults.tipAmount, 2)}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-base font-bold">
                    <span className="text-slate-900">Total Bill</span>
                    <span className="text-slate-900">{formatCurrency(tipResults.grandTotal, 2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
