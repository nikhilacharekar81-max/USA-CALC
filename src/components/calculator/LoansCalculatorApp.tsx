import React, { useState } from 'react';
import {
  Calculator as CalcIcon,
  CreditCard,
  DollarSign,
  PieChart,
  Download,
  Printer,
  Calendar,
  Building,
  GraduationCap,
  Sparkles,
  ShieldAlert,
  Percent,
  CheckCircle2,
  TrendingUp,
  Info,
  AlertTriangle
} from 'lucide-react';
import { Calculator } from '../../types/schema.ts';

interface LoansCalculatorAppProps {
  calculator: Calculator;
  hideHeader?: boolean;
}

export const LoansCalculatorApp: React.FC<LoansCalculatorAppProps> = ({ calculator, hideHeader = false }) => {
  const slug = calculator.slug.toLowerCase();

  // Common State Defaults
  const [loanAmount, setLoanAmount] = useState<number>(
    slug.includes('home') || slug.includes('property') ? 5000000 :
    slug.includes('car') ? 800000 :
    slug.includes('bike') ? 120000 :
    slug.includes('education') ? 1500000 :
    slug.includes('business') ? 2500000 :
    slug.includes('personal') ? 500000 : 1000000
  );

  const [interestRate, setInterestRate] = useState<number>(
    slug.includes('home') ? 8.5 :
    slug.includes('property') ? 10.5 :
    slug.includes('car') ? 9.0 :
    slug.includes('bike') ? 11.5 :
    slug.includes('education') ? 9.5 :
    slug.includes('business') ? 14.0 :
    slug.includes('gold') ? 10.0 :
    slug.includes('personal') ? 12.5 : 9.0
  );

  const [tenureYears, setTenureYears] = useState<number>(
    slug.includes('home') || slug.includes('property') ? 20 :
    slug.includes('gold') ? 2 :
    slug.includes('personal') || slug.includes('business') ? 5 :
    slug.includes('car') ? 5 :
    slug.includes('bike') ? 3 :
    slug.includes('education') ? 7 : 10
  );

  // Gold Loan State
  const [goldGrams, setGoldGrams] = useState<number>(20);
  const [goldPurity, setGoldPurity] = useState<'24K' | '22K' | '18K'>('22K');
  const [goldRatePerGram, setGoldRatePerGram] = useState<number>(7000);

  // Property / LAP State
  const [propertyValue, setPropertyValue] = useState<number>(10000000); // ₹1 Cr
  const propertyLtv = 65; // 65% LTV standard
  const maxEligiblePropertyLoan = propertyValue * (propertyLtv / 100);

  // Loan Eligibility State
  const [monthlyIncome, setMonthlyIncome] = useState<number>(100000);
  const [existingEmis, setExistingEmis] = useState<number>(15000);
  const [foirPercent, setFoirPercent] = useState<number>(50);

  // Loan Prepayment State
  const [prepaymentAmount, setPrepaymentAmount] = useState<number>(200000);
  const [prepaymentType, setPrepaymentType] = useState<'reduce_tenure' | 'reduce_emi'>('reduce_tenure');

  // Loan Affordability State
  const [desiredEmi, setDesiredEmi] = useState<number>(30000);

  // Advanced Options Accordion State (Collapsed by default to keep UI clean)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [processingFeePct, setProcessingFeePct] = useState<number>(0.5);
  const [loanInsurance, setLoanInsurance] = useState<number>(0);
  const [extraAnnualPrepayment, setExtraAnnualPrepayment] = useState<number>(0);

  // Currency Formatter
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const formatLakhs = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakh`;
    return formatINR(val);
  };

  // Gold Loan Specific Calculations
  let goldPurityFactor = 1;
  if (goldPurity === '22K') goldPurityFactor = 22 / 24;
  if (goldPurity === '18K') goldPurityFactor = 18 / 24;

  const totalGoldValue = goldGrams * goldRatePerGram * goldPurityFactor;
  const maxGoldLoanAmount = totalGoldValue * 0.75; // RBI 75% LTV

  const effectivePrincipal = slug.includes('gold') ? maxGoldLoanAmount : loanAmount;

  // Standard EMI Formula: EMI = [P x R x (1+R)^N]/[(1+R)^N-1]
  const monthlyRate = interestRate / 12 / 100;
  const totalMonths = tenureYears * 12;

  let emi = 0;
  if (monthlyRate > 0 && totalMonths > 0) {
    emi = (effectivePrincipal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
  } else if (totalMonths > 0) {
    emi = effectivePrincipal / totalMonths;
  }

  const totalPayment = emi * totalMonths;
  const totalInterest = Math.max(0, totalPayment - effectivePrincipal);

  // Loan Eligibility Calculations
  const maxAllowableEmi = Math.max(0, (monthlyIncome * (foirPercent / 100)) - existingEmis);
  let maxEligibleLoan = 0;
  if (monthlyRate > 0 && totalMonths > 0) {
    maxEligibleLoan = (maxAllowableEmi * (Math.pow(1 + monthlyRate, totalMonths) - 1)) / (monthlyRate * Math.pow(1 + monthlyRate, totalMonths));
  }

  // Loan Affordability Calculations
  let maxAffordableLoan = 0;
  if (monthlyRate > 0 && totalMonths > 0) {
    maxAffordableLoan = (desiredEmi * (Math.pow(1 + monthlyRate, totalMonths) - 1)) / (monthlyRate * Math.pow(1 + monthlyRate, totalMonths));
  }

  // Loan Prepayment Calculations
  const origEmi = emi;
  const newPrincipal = Math.max(0, loanAmount - prepaymentAmount);
  let prepayNewEmi = origEmi;
  let prepayNewMonths = totalMonths;

  if (prepaymentType === 'reduce_tenure' && monthlyRate > 0 && newPrincipal > 0) {
    prepayNewMonths = Math.ceil(-Math.log(1 - (newPrincipal * monthlyRate) / origEmi) / Math.log(1 + monthlyRate));
  } else if (prepaymentType === 'reduce_emi' && monthlyRate > 0 && newPrincipal > 0) {
    prepayNewEmi = (newPrincipal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }

  const prepayNewTotalPayment = prepaymentType === 'reduce_tenure' ? (prepayNewEmi * prepayNewMonths) + prepaymentAmount : (prepayNewEmi * totalMonths) + prepaymentAmount;
  const interestSaved = Math.max(0, totalPayment - prepayNewTotalPayment);

  // Amortization Schedule Generation
  const generateAmortizationSchedule = () => {
    let balance = loanAmount;
    const schedule = [];
    for (let yr = 1; yr <= tenureYears; yr++) {
      let yrInterest = 0;
      let yrPrincipal = 0;
      for (let m = 1; m <= 12; m++) {
        const mInterest = balance * monthlyRate;
        const mPrincipal = Math.min(balance, emi - mInterest);
        yrInterest += mInterest;
        yrPrincipal += mPrincipal;
        balance = Math.max(0, balance - mPrincipal);
      }
      schedule.push({
        year: yr,
        principalPaid: yrPrincipal,
        interestPaid: yrInterest,
        totalPaid: yrPrincipal + yrInterest,
        closingBalance: balance
      });
    }
    return schedule;
  };

  const schedule = generateAmortizationSchedule();

  const handleExportJson = () => {
    const report = {
      calculatorName: calculator.name,
      slug: calculator.slug,
      loanAmount,
      interestRate,
      tenureYears,
      emi,
      totalInterest,
      totalPayment,
      generatedAt: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `${calculator.slug}_report_${Date.now()}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-8 font-sans">
      {/* Top Banner */}
      {!hideHeader && (
        <div className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-6 sm:p-10 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1dbf73]/20 text-[#1dbf73] text-xs font-bold uppercase tracking-wider border border-[#1dbf73]/30">
              <CreditCard className="w-4 h-4" />
              <span>India Loan Engine &bull; FY 2026-27</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {calculator.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {calculator.shortDescription}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleExportJson}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors border border-white/20 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#1dbf73]" />
              <span>Export JSON</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 bg-[#1dbf73] hover:bg-[#19a463] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-lg cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: INPUT CONTROLS (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-[#222325] flex items-center gap-2">
              <CalcIcon className="w-4 h-4 text-[#1dbf73]" />
              <span>Input Loan Parameters</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">₹ INR Currency</span>
          </div>

          {/* Special Property / Gold / Eligibility Inputs */}
          {slug.includes('property') ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Property Market Value (₹)</span>
                  <span className="text-[#1dbf73]">{formatLakhs(propertyValue)}</span>
                </div>
                <input
                  type="number"
                  min={500000}
                  max={100000000}
                  step={100000}
                  value={propertyValue}
                  onChange={(e) => setPropertyValue(parseFloat(e.target.value) || 0)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#222325]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Loan Amount (Principal) (₹)</span>
                  <span className="text-[#1dbf73]">{formatLakhs(loanAmount)}</span>
                </div>
                <input
                  type="number"
                  min={100000}
                  max={propertyValue}
                  step={50000}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#222325]"
                />
                {loanAmount > propertyValue * 0.70 && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Warning: Requested loan amount exceeds 70% of property value (Max recommended LTV limit for LAP).</span>
                  </div>
                )}
              </div>
            </div>
          ) : slug.includes('gold') ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Gold Weight (Grams)</label>
                <input
                  type="number"
                  value={goldGrams}
                  onChange={(e) => setGoldGrams(parseFloat(e.target.value) || 0)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#222325]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Gold Purity</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['24K', '22K', '18K'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setGoldPurity(p)}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        goldPurity === p ? 'bg-[#1dbf73]/10 border-[#1dbf73] text-[#1dbf73]' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Gold Rate per Gram (₹)</label>
                <input
                  type="number"
                  value={goldRatePerGram}
                  onChange={(e) => setGoldRatePerGram(parseFloat(e.target.value) || 0)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#222325]"
                />
              </div>
            </div>
          ) : slug.includes('eligibility') ? (
            /* Special Loan Eligibility Inputs */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Net Monthly Income / Salary (₹)</label>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(parseFloat(e.target.value) || 0)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#222325]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Existing Monthly EMIs (₹)</label>
                <input
                  type="number"
                  value={existingEmis}
                  onChange={(e) => setExistingEmis(parseFloat(e.target.value) || 0)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#222325]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">FOIR Ratio / Max EMI Capacity (%)</label>
                <input
                  type="number"
                  value={foirPercent}
                  onChange={(e) => setFoirPercent(parseFloat(e.target.value) || 0)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#222325]"
                />
              </div>
            </div>
          ) : slug.includes('affordability') ? (
            /* Special Loan Affordability Inputs */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Monthly EMI Budget (₹)</label>
                <input
                  type="number"
                  value={desiredEmi}
                  onChange={(e) => setDesiredEmi(parseFloat(e.target.value) || 0)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#222325]"
                />
              </div>
            </div>
          ) : (
            /* Standard Principal Input */
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Loan Amount (Principal) (₹)</span>
                  <span className="text-[#1dbf73]">{formatLakhs(loanAmount)}</span>
                </div>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#222325]"
                />
                <input
                  type="range"
                  min={10000}
                  max={slug.includes('home') || slug.includes('property') ? 50000000 : 5000000}
                  step={10000}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(parseFloat(e.target.value) || 0)}
                  className="w-full mt-2 accent-[#1dbf73]"
                />
              </div>
            </div>
          )}

          {/* Common Interest Rate & Tenure Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Interest Rate (% p.a.)</label>
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#222325]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tenure (Years)</label>
              <input
                type="number"
                value={tenureYears}
                onChange={(e) => setTenureYears(parseInt(e.target.value) || 1)}
                className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#222325]"
              />
            </div>
          </div>

          {/* Advanced Options Collapsible Accordion */}
          <div className="pt-2 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAdvancedOptions((prev) => !prev)}
              className="text-xs font-bold text-[#059669] hover:text-[#047857] hover:underline cursor-pointer"
            >
              {showAdvancedOptions ? '– Fewer Options' : '+ More Options / Fees, Insurance & Extra Payments (3 extra fields)'}
            </button>
          </div>

          {showAdvancedOptions && (
            <div className="space-y-3 pt-3 border-t border-slate-200 bg-slate-50/75 p-4 rounded-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bank Processing Fee (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={processingFeePct}
                    onChange={(e) => setProcessingFeePct(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-[#222325]"
                  />
                  <span className="text-[10px] text-slate-400">Est: {formatINR(effectivePrincipal * (processingFeePct / 100))}</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Loan / Life Insurance Premium (₹)</label>
                  <input
                    type="number"
                    step="1000"
                    value={loanInsurance}
                    onChange={(e) => setLoanInsurance(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-[#222325]"
                  />
                  <span className="text-[10px] text-slate-400">Optional credit shield cover</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Annual Prepayment / Bonus EMI (₹/year)</label>
                <input
                  type="number"
                  step="5000"
                  value={extraAnnualPrepayment}
                  onChange={(e) => setExtraAnnualPrepayment(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-[#222325]"
                />
                <span className="text-[10px] text-slate-400">Accelerates loan payoff and reduces interest</span>
              </div>
            </div>
          )}

          {/* Special Prepayment Inputs */}
          {slug.includes('prepayment') && (
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Prepayment Amount (Lump Sum) (₹)</label>
                <input
                  type="number"
                  value={prepaymentAmount}
                  onChange={(e) => setPrepaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#222325]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Prepayment Strategy</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPrepaymentType('reduce_tenure')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      prepaymentType === 'reduce_tenure' ? 'bg-[#1dbf73]/10 border-[#1dbf73] text-[#1dbf73]' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    Reduce Loan Tenure
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrepaymentType('reduce_emi')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      prepaymentType === 'reduce_emi' ? 'bg-[#1dbf73]/10 border-[#1dbf73] text-[#1dbf73]' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    Reduce Monthly EMI
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: STICKY RESULTS SUMMARY (5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="text-xs font-bold text-[#1dbf73] uppercase tracking-wider">
                Calculation Output
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase">
                FY 2026-27
              </span>
            </div>

            {slug.includes('gold') ? (
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Total Gold Valuation</div>
                  <div className="text-2xl font-black text-white">{formatINR(totalGoldValue)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Max Eligible Gold Loan (75% RBI LTV)</div>
                  <div className="text-3xl font-black text-[#1dbf73]">{formatINR(maxGoldLoanAmount)}</div>
                </div>
                <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>Monthly Loan EMI:</span>
                    <span className="font-bold text-[#1dbf73] text-sm">{formatINR(emi)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Interest Payable:</span>
                    <span className="font-bold text-amber-400">{formatINR(totalInterest)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-white">
                    <span>Total Amount Payable:</span>
                    <span>{formatINR(totalPayment)}</span>
                  </div>
                </div>
              </div>
            ) : slug.includes('property') ? (
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Max Eligible Loan Amount (65% LTV)</div>
                  <div className="text-3xl font-black text-[#1dbf73]">{formatINR(maxEligiblePropertyLoan)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Monthly Loan EMI</div>
                  <div className="text-2xl font-black text-white">{formatINR(emi)}</div>
                </div>
                <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>Requested Loan Principal:</span>
                    <span className="font-bold text-white">{formatINR(loanAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Interest Payable:</span>
                    <span className="font-bold text-amber-400">{formatINR(totalInterest)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-white">
                    <span>Total Amount Payable:</span>
                    <span>{formatINR(totalPayment)}</span>
                  </div>
                </div>
              </div>
            ) : slug.includes('eligibility') ? (
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Max Monthly EMI Capacity</div>
                  <div className="text-2xl font-black text-white">{formatINR(maxAllowableEmi)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Maximum Eligible Loan Amount</div>
                  <div className="text-3xl font-black text-[#1dbf73]">{formatINR(maxEligibleLoan)}</div>
                </div>
              </div>
            ) : slug.includes('affordability') ? (
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Target Monthly Budget</div>
                  <div className="text-2xl font-black text-white">{formatINR(desiredEmi)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Maximum Affordable Loan Principal</div>
                  <div className="text-3xl font-black text-[#1dbf73]">{formatINR(maxAffordableLoan)}</div>
                </div>
              </div>
            ) : slug.includes('prepayment') ? (
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Total Interest Saved</div>
                  <div className="text-3xl font-black text-[#1dbf73]">{formatINR(interestSaved)}</div>
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Revised EMI:</span>
                  <span className="font-bold text-white">{formatINR(prepayNewEmi)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Revised Tenure:</span>
                  <span className="font-bold text-white">{Math.ceil(prepayNewMonths / 12)} Years ({prepayNewMonths} Months)</span>
                </div>
              </div>
            ) : (
              /* Standard EMI Output */
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Monthly Loan EMI</div>
                  <div className="text-3xl font-black text-[#1dbf73]">{formatINR(emi)}</div>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>Principal Amount:</span>
                    <span className="font-bold text-white">{formatINR(loanAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Interest Payable:</span>
                    <span className="font-bold text-amber-400">{formatINR(totalInterest)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-white">
                    <span>Total Amount Payable:</span>
                    <span>{formatINR(totalPayment)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tax Benefits Callout Cards for India */}
            {slug.includes('home') && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300 space-y-1">
                <div className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Income Tax Benefit (Sec 24b & 80C)</span>
                </div>
                <p>Interest deduction up to ₹2 Lakhs under Sec 24(b) + Principal repayment deduction up to ₹1.5 Lakhs under Sec 80C (Old Tax Regime).</p>
              </div>
            )}

            {slug.includes('education') && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300 space-y-1">
                <div className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Section 80E Tax Exemption</span>
                </div>
                <p>100% of interest paid on education loans is deductible with no upper monetary cap for up to 8 consecutive years.</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleExportJson}
              className="w-full py-3 rounded-2xl bg-[#1dbf73] hover:bg-[#19a463] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Report (JSON)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Amortization Schedule Table */}
      {!slug.includes('eligibility') && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-[#222325]">
              Yearly Amortization Schedule
            </h3>
            <span className="text-xs text-slate-500">Breakdown of Principal vs Interest</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                  <th className="p-3">Year</th>
                  <th className="p-3">Principal Paid (₹)</th>
                  <th className="p-3">Interest Paid (₹)</th>
                  <th className="p-3">Total Payment (₹)</th>
                  <th className="p-3">Closing Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[#404145]">
                {schedule.map((row) => (
                  <tr key={row.year} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-[#222325]">Year {row.year}</td>
                    <td className="p-3 font-semibold text-emerald-700">{formatINR(row.principalPaid)}</td>
                    <td className="p-3 font-semibold text-amber-700">{formatINR(row.interestPaid)}</td>
                    <td className="p-3 font-bold">{formatINR(row.totalPaid)}</td>
                    <td className="p-3 font-bold text-slate-700">{formatINR(row.closingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
