import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Home,
  FileText,
  Car,
  Activity,
  Percent,
  PiggyBank,
  Receipt,
  Scale,
  Heart,
  TrendingUp,
  Printer,
  Download,
  Info,
  ChevronRight,
  HelpCircle,
  Calendar,
  CheckCircle,
  AlertTriangle,
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

export type MainCategory = 'financial' | 'health' | 'math';
export type SubCalculator =
  | 'mortgage'
  | 'tax'
  | 'auto'
  | 'investment'
  | 'bmi'
  | 'bmr'
  | 'bodyfat'
  | 'tip'
  | 'percentage';

export interface CalculatorNetSuiteProps {
  initialCalc?: SubCalculator;
  initialCategory?: MainCategory;
  hideHeaderTabs?: boolean;
}

export const CalculatorNetSuite: React.FC<CalculatorNetSuiteProps> = ({
  initialCalc = 'mortgage',
  initialCategory = 'financial',
  hideHeaderTabs = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<MainCategory>(initialCategory);
  const [activeCalc, setActiveCalc] = useState<SubCalculator>(initialCalc);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // -------------------------------------------------------------
  // 1. MORTGAGE CALCULATOR STATE & LOGIC (Calculator.net exact)
  // -------------------------------------------------------------
  const [homePrice, setHomePrice] = useState<number>(400000);
  const [mortDownAmt, setMortDownAmt] = useState<number>(80000);
  const [mortDownPct, setMortDownPct] = useState<number>(20);
  const [mortInterest, setMortInterest] = useState<number>(7.31);
  const [mortTermYears, setMortTermYears] = useState<number>(30);
  const [mortStartMonth, setMortStartMonth] = useState<string>('Oct');
  const [mortStartYear, setMortStartYear] = useState<number>(2026);

  // Advanced Taxes & Costs
  const [includeTaxesAndCosts, setIncludeTaxesAndCosts] = useState<boolean>(true);
  const [mortPropertyTaxVal, setMortPropertyTaxVal] = useState<number>(1.2);
  const [mortPropertyTaxUnit, setMortPropertyTaxUnit] = useState<'%' | '$'>('%');
  const [mortHomeInsuranceVal, setMortHomeInsuranceVal] = useState<number>(1500);
  const [mortHomeInsuranceUnit, setMortHomeInsuranceUnit] = useState<'$' | '%'>('$');
  const [mortPmiVal, setMortPmiVal] = useState<number>(0);
  const [mortPmiUnit, setMortPmiUnit] = useState<'$' | '%'>('$');
  const [mortHoaVal, setMortHoaVal] = useState<number>(0);
  const [mortHoaUnit, setMortHoaUnit] = useState<'$' | '%'>('$');
  const [mortOtherCostsVal, setMortOtherCostsVal] = useState<number>(4000);
  const [mortOtherCostsUnit, setMortOtherCostsUnit] = useState<'$' | '%'>('$');

  // Advanced Options Collapsible Accordion (Fewer / More Options - Hidden by default to keep UI clean)
  const [showMoreOptions, setShowMoreOptions] = useState<boolean>(false);
  const [showTaxAdvanced, setShowTaxAdvanced] = useState<boolean>(false);
  const [showAutoAdvanced, setShowAutoAdvanced] = useState<boolean>(false);
  const [showInvAdvanced, setShowInvAdvanced] = useState<boolean>(false);
  const [taxIncreaseRate, setTaxIncreaseRate] = useState<number>(0);
  const [insIncreaseRate, setInsIncreaseRate] = useState<number>(0);
  const [hoaIncreaseRate, setHoaIncreaseRate] = useState<number>(0);
  const [otherIncreaseRate, setOtherIncreaseRate] = useState<number>(0);

  // Extra Payments
  const [extraMonthlyPay, setExtraMonthlyPay] = useState<number>(0);
  const [extraMonthlyMonth, setExtraMonthlyMonth] = useState<string>('Oct');
  const [extraMonthlyYear, setExtraMonthlyYear] = useState<number>(2026);

  const [extraYearlyPay, setExtraYearlyPay] = useState<number>(0);
  const [extraYearlyMonth, setExtraYearlyMonth] = useState<string>('Oct');
  const [extraYearlyYear, setExtraYearlyYear] = useState<number>(2026);

  const [extraOneTimePay, setExtraOneTimePay] = useState<number>(0);
  const [extraOneTimeMonth, setExtraOneTimeMonth] = useState<string>('Oct');
  const [extraOneTimeYear, setExtraOneTimeYear] = useState<number>(2026);

  const [showExtraOneTimeRows, setShowExtraOneTimeRows] = useState<boolean>(false);
  const [extraOneTimeRows, setExtraOneTimeRows] = useState<Array<{ id: number; amount: number; month: string; year: number }>>([
    { id: 1, amount: 0, month: 'Oct', year: 2026 },
    { id: 2, amount: 0, month: 'Oct', year: 2026 },
    { id: 3, amount: 0, month: 'Oct', year: 2026 },
    { id: 4, amount: 0, month: 'Oct', year: 2026 },
    { id: 5, amount: 0, month: 'Oct', year: 2026 },
  ]);

  const [mortScheduleView, setMortScheduleView] = useState<'yearly' | 'monthly'>('yearly');

  const handlePriceChange = (val: number) => {
    setHomePrice(val);
    setMortDownAmt(Math.round(val * (mortDownPct / 100)));
  };

  const handleDownAmtChange = (val: number) => {
    setMortDownAmt(val);
    if (homePrice > 0) {
      setMortDownPct(parseFloat(((val / homePrice) * 100).toFixed(1)));
    }
  };

  const handleDownPctChange = (pct: number) => {
    setMortDownPct(pct);
    setMortDownAmt(Math.round(homePrice * (pct / 100)));
  };

  const mortCalculations = useMemo(() => {
    const price = Math.max(0, homePrice);
    const down = Math.max(0, mortDownAmt);
    const loanAmt = Math.max(0, price - down);
    const annualRate = Math.max(0, mortInterest);
    const monthlyRate = annualRate / 100 / 12;
    const totalMonths = mortTermYears * 12;

    let monthlyPI = 0;
    if (monthlyRate > 0 && totalMonths > 0) {
      monthlyPI =
        (loanAmt * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    } else if (totalMonths > 0) {
      monthlyPI = loanAmt / totalMonths;
    }

    // Taxes & Costs per month
    let monthlyTaxes = 0;
    if (includeTaxesAndCosts) {
      monthlyTaxes = mortPropertyTaxUnit === '%' ? (price * (mortPropertyTaxVal / 100)) / 12 : mortPropertyTaxVal / 12;
    }

    let monthlyIns = 0;
    if (includeTaxesAndCosts) {
      monthlyIns = mortHomeInsuranceUnit === '%' ? (price * (mortHomeInsuranceVal / 100)) / 12 : mortHomeInsuranceVal / 12;
    }

    let monthlyHoa = 0;
    if (includeTaxesAndCosts) {
      monthlyHoa = mortHoaUnit === '%' ? (price * (mortHoaVal / 100)) / 12 : mortHoaVal;
    }

    let monthlyOther = 0;
    if (includeTaxesAndCosts) {
      monthlyOther = mortOtherCostsUnit === '%' ? (price * (mortOtherCostsVal / 100)) / 12 : mortOtherCostsVal / 12;
    }

    // PMI Calculation (Initial)
    // US Homeowners Protection Act: PMI cancels when balance drops to 78% of original home price
    const ltv = price > 0 ? (loanAmt / price) * 100 : 0;
    const isPmiRequired = ltv > 80;
    const pmiCancellationThreshold = price * 0.78;

    let initialMonthlyPmi = 0;
    if (includeTaxesAndCosts && isPmiRequired) {
      if (mortPmiVal > 0) {
        initialMonthlyPmi = mortPmiUnit === '%' ? (loanAmt * (mortPmiVal / 100)) / 12 : mortPmiVal / 12;
      } else {
        initialMonthlyPmi = (loanAmt * 0.005) / 12; // 0.5% default PMI
      }
    }

    const totalMonthlyOutOfPocket = monthlyPI + monthlyTaxes + monthlyIns + initialMonthlyPmi + monthlyHoa + monthlyOther + extraMonthlyPay;

    // Generate Full Month-by-Month Amortization Schedule (up to 360 months)
    const monthsNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const startMonthIdx = Math.max(0, monthsNames.indexOf(mortStartMonth));

    let balance = loanAmt;
    let cumInterestPaid = 0;
    let cumPmiPaid = 0;
    let cumPrincipalPaid = 0;
    let cumExtraPaid = 0;

    const monthly360Schedule: Array<{
      monthIndex: number;
      dateStr: string;
      beginningBalance: number;
      payment: number;
      principal: number;
      interest: number;
      extraPrincipal: number;
      pmiPaid: number;
      totalInterestToDate: number;
      endingBalance: number;
    }> = [];

    const trajectoryChart: Array<{ year: string; balance: number; equity: number }> = [
      { year: 'Yr 0', balance: Math.round(loanAmt), equity: Math.round(down) },
    ];

    let actualPayoffMonthIndex = totalMonths;

    for (let m = 1; m <= totalMonths && balance > 0.001; m++) {
      const begBal = balance;
      const curMonthIdx = (startMonthIdx + m - 1) % 12;
      const curYear = mortStartYear + Math.floor((startMonthIdx + m - 1) / 12);
      const dateStr = `${monthsNames[curMonthIdx]} ${curYear}`;

      // Monthly Interest & Regular Principal
      const monthInterest = monthlyRate > 0 ? balance * monthlyRate : 0;
      const regularPrincipal = Math.min(balance, Math.max(0, monthlyPI - monthInterest));

      // Check PMI Auto-cancellation at 78% LTV
      let monthPmi = 0;
      if (isPmiRequired && begBal > pmiCancellationThreshold) {
        monthPmi = initialMonthlyPmi;
      }

      // Extra Payments
      let extraThisMonth = extraMonthlyPay;
      if (m % 12 === 0) {
        extraThisMonth += extraYearlyPay;
      }
      if (extraOneTimePay > 0 && curMonthIdx === startMonthIdx && curYear === mortStartYear) {
        extraThisMonth += extraOneTimePay;
      }

      // Cap extra payment so balance does not go negative
      const maxAllowedExtra = Math.max(0, balance - regularPrincipal);
      extraThisMonth = Math.min(extraThisMonth, maxAllowedExtra);

      const totalMonthPrincipal = regularPrincipal + extraThisMonth;
      const totalMonthPayment = totalMonthPrincipal + monthInterest + monthPmi + monthlyTaxes + monthlyIns + monthlyHoa + monthlyOther;

      balance = Math.max(0, balance - totalMonthPrincipal);
      cumInterestPaid += monthInterest;
      cumPmiPaid += monthPmi;
      cumPrincipalPaid += totalMonthPrincipal;
      cumExtraPaid += extraThisMonth;

      monthly360Schedule.push({
        monthIndex: m,
        dateStr,
        beginningBalance: Math.round(begBal),
        payment: Math.round(totalMonthPayment),
        principal: Math.round(regularPrincipal),
        interest: Math.round(monthInterest),
        extraPrincipal: Math.round(extraThisMonth),
        pmiPaid: Math.round(monthPmi),
        totalInterestToDate: Math.round(cumInterestPaid),
        endingBalance: Math.round(balance),
      });

      if (m % 12 === 0 || balance <= 0) {
        trajectoryChart.push({
          year: `Yr ${Math.ceil(m / 12)}`,
          balance: Math.max(0, Math.round(balance)),
          equity: Math.round(down + cumPrincipalPaid),
        });
      }

      if (balance <= 0 && actualPayoffMonthIndex === totalMonths) {
        actualPayoffMonthIndex = m;
      }
    }

    // Aggregate into Yearly Schedule
    const yearlySchedule: Array<{
      year: number;
      interest: number;
      principal: number;
      endingBalance: number;
    }> = [];

    const yearsMap = new Map<number, typeof monthly360Schedule>();
    monthly360Schedule.forEach((entry) => {
      const yr = Math.ceil(entry.monthIndex / 12);
      const arr = yearsMap.get(yr) || [];
      arr.push(entry);
      yearsMap.set(yr, arr);
    });

    yearsMap.forEach((entries, yr) => {
      const yearInterest = entries.reduce((s, e) => s + e.interest, 0);
      const yearPrincipal = entries.reduce((s, e) => s + e.principal + e.extraPrincipal, 0);
      const lastEntry = entries[entries.length - 1];

      yearlySchedule.push({
        year: yr,
        interest: yearInterest,
        principal: yearPrincipal,
        endingBalance: lastEntry.endingBalance,
      });
    });

    // Payoff Date calculation based on actual months required
    const endPayoffYear = mortStartYear + Math.floor((startMonthIdx + actualPayoffMonthIndex) / 12);
    const endPayoffMonthIdx = (startMonthIdx + actualPayoffMonthIndex) % 12;
    const payoffDate = `${monthsNames[endPayoffMonthIdx]} ${endPayoffYear}`;

    const totalTaxesOverLoan = monthlyTaxes * actualPayoffMonthIndex;
    const totalInsOverLoan = monthlyIns * actualPayoffMonthIndex;
    const totalHoaOverLoan = monthlyHoa * actualPayoffMonthIndex;
    const totalOtherOverLoan = monthlyOther * actualPayoffMonthIndex;
    const totalMortgagePayments = cumPrincipalPaid + cumInterestPaid;
    const totalOutOfPocketAllYears = totalMortgagePayments + totalTaxesOverLoan + totalInsOverLoan + cumPmiPaid + totalHoaOverLoan + totalOtherOverLoan;

    // Donut chart percentages
    const denom = Math.max(1, totalMonthlyOutOfPocket);
    const pctPI = Math.round((monthlyPI / denom) * 100);
    const pctTax = Math.round((monthlyTaxes / denom) * 100);
    const pctIns = Math.round((monthlyIns / denom) * 100);
    const pctOther = Math.max(0, 100 - pctPI - pctTax - pctIns);

    const donutData = [
      { name: 'Principal & Interest', value: Math.max(0, Math.round(monthlyPI)), color: '#2563eb', pct: pctPI },
      ...(monthlyTaxes > 0 ? [{ name: 'Property Taxes', value: Math.max(0, Math.round(monthlyTaxes)), color: '#16a34a', pct: pctTax }] : []),
      ...(monthlyIns > 0 ? [{ name: 'Home Insurance', value: Math.max(0, Math.round(monthlyIns)), color: '#dc2626', pct: pctIns }] : []),
      ...(monthlyOther + monthlyHoa + initialMonthlyPmi > 0 ? [{ name: 'Other Fees & PMI', value: Math.max(0, Math.round(monthlyOther + monthlyHoa + initialMonthlyPmi)), color: '#0891b2', pct: pctOther }] : []),
    ];

    return {
      loanAmt,
      ltv,
      isPmiRequired,
      pmiCancellationThreshold,
      monthlyPI,
      monthlyTaxes,
      totalTaxesOverLoan,
      monthlyIns,
      totalInsOverLoan,
      monthlyPmi: initialMonthlyPmi,
      totalPmiOverLoan: cumPmiPaid,
      monthlyHoa,
      totalHoaOverLoan,
      monthlyOther,
      totalOtherOverLoan,
      totalMonthlyOutOfPocket,
      totalInterest: cumInterestPaid,
      totalMortgagePayments,
      totalOutOfPocketAllYears,
      payoffDate,
      monthsSaved: totalMonths - actualPayoffMonthIndex,
      donutData,
      monthly360Schedule,
      yearlySchedule,
      trajectoryChart,
    };
  }, [
    homePrice,
    mortDownAmt,
    mortInterest,
    mortTermYears,
    mortStartMonth,
    mortStartYear,
    includeTaxesAndCosts,
    mortPropertyTaxVal,
    mortPropertyTaxUnit,
    mortHomeInsuranceVal,
    mortHomeInsuranceUnit,
    mortPmiVal,
    mortPmiUnit,
    mortHoaVal,
    mortHoaUnit,
    mortOtherCostsVal,
    mortOtherCostsUnit,
    extraMonthlyPay,
  ]);

  // -------------------------------------------------------------
  // 2. US INCOME TAX & PAYROLL CALCULATOR STATE & LOGIC
  // -------------------------------------------------------------
  const [taxGrossIncome, setTaxGrossIncome] = useState<number>(105000);
  const [taxFilingStatus, setTaxFilingStatus] = useState<'single' | 'mfj' | 'hoh'>('single');
  const [taxDeductionMode, setTaxDeductionMode] = useState<'standard' | 'itemized'>('standard');
  const [taxItemizedDeductions, setTaxItemizedDeductions] = useState<number>(16000);
  const [taxStateRate, setTaxStateRate] = useState<number>(5.5); // %
  const [taxPretax401k, setTaxPretax401k] = useState<number>(6500); // $/yr

  const taxCalculations = useMemo(() => {
    const gross = Math.max(0, taxGrossIncome);
    const pretax = Math.min(Math.max(0, taxPretax401k), 23000); // 2024 IRS limit: $23,000

    // Standard Deductions (2024/2025 IRS)
    let stdDeduction = 14600; // Single
    if (taxFilingStatus === 'mfj') stdDeduction = 29200;
    if (taxFilingStatus === 'hoh') stdDeduction = 21900;

    const effectiveDeduction =
      taxDeductionMode === 'standard' ? stdDeduction : Math.max(0, taxItemizedDeductions);

    // FICA Calculations
    // Social Security: 6.2% up to $168,600 wage limit
    const ssWageLimit = 168600;
    const ssTax = Math.min(gross, ssWageLimit) * 0.062;

    // Medicare: 1.45% on all earnings + 0.9% additional on earnings above threshold
    const addMedicareThreshold = taxFilingStatus === 'mfj' ? 250000 : 200000;
    const baseMedicare = gross * 0.0145;
    const addMedicare = Math.max(0, gross - addMedicareThreshold) * 0.009;
    const medicareTax = baseMedicare + addMedicare;
    const totalFica = ssTax + medicareTax;

    // Federal Taxable Income
    const federalTaxableIncome = Math.max(0, gross - pretax - effectiveDeduction);

    // Federal Brackets 2024
    let brackets = [
      { limit: 11600, rate: 0.1 },
      { limit: 47150, rate: 0.12 },
      { limit: 100525, rate: 0.22 },
      { limit: 191950, rate: 0.24 },
      { limit: 243725, rate: 0.32 },
      { limit: 609350, rate: 0.35 },
      { limit: Infinity, rate: 0.37 },
    ];

    if (taxFilingStatus === 'mfj') {
      brackets = [
        { limit: 23200, rate: 0.1 },
        { limit: 94300, rate: 0.12 },
        { limit: 201050, rate: 0.22 },
        { limit: 383900, rate: 0.24 },
        { limit: 487450, rate: 0.32 },
        { limit: 731200, rate: 0.35 },
        { limit: Infinity, rate: 0.37 },
      ];
    } else if (taxFilingStatus === 'hoh') {
      brackets = [
        { limit: 16550, rate: 0.1 },
        { limit: 63100, rate: 0.12 },
        { limit: 100500, rate: 0.22 },
        { limit: 191950, rate: 0.24 },
        { limit: 243700, rate: 0.32 },
        { limit: 609350, rate: 0.35 },
        { limit: Infinity, rate: 0.37 },
      ];
    }

    let federalTax = 0;
    let prevLimit = 0;
    let marginalRate = 0;

    for (const b of brackets) {
      if (federalTaxableIncome > prevLimit) {
        const taxable = Math.min(federalTaxableIncome - prevLimit, b.limit - prevLimit);
        federalTax += taxable * b.rate;
        marginalRate = b.rate;
        prevLimit = b.limit;
      } else {
        break;
      }
    }

    const stateTax = federalTaxableIncome * (Math.max(0, taxStateRate) / 100);
    const totalTax = federalTax + totalFica + stateTax;
    const netTakeHome = Math.max(0, gross - totalTax - pretax);

    const effectiveTaxRate = gross > 0 ? (totalTax / gross) * 100 : 0;
    const takeHomeRate = gross > 0 ? (netTakeHome / gross) * 100 : 0;

    const donutData = [
      { name: 'Take-Home Pay', value: Math.round(netTakeHome), color: '#10b981' },
      { name: 'Federal Income Tax', value: Math.round(federalTax), color: '#2563eb' },
      { name: 'FICA (Social Security & Medicare)', value: Math.round(totalFica), color: '#6366f1' },
      { name: 'State Tax', value: Math.round(stateTax), color: '#f59e0b' },
      ...(pretax > 0 ? [{ name: 'Pre-Tax 401(k)', value: Math.round(pretax), color: '#0284c7' }] : []),
    ];

    return {
      gross,
      pretax,
      effectiveDeduction,
      federalTaxableIncome,
      federalTax,
      ssTax,
      medicareTax,
      totalFica,
      stateTax,
      totalTax,
      netTakeHome,
      effectiveTaxRate,
      marginalRate: marginalRate * 100,
      takeHomeRate,
      monthlyTakeHome: netTakeHome / 12,
      biweeklyTakeHome: netTakeHome / 26,
      donutData,
    };
  }, [
    taxGrossIncome,
    taxFilingStatus,
    taxDeductionMode,
    taxItemizedDeductions,
    taxStateRate,
    taxPretax401k,
  ]);

  // -------------------------------------------------------------
  // 3. AUTO LOAN CALCULATOR STATE & LOGIC
  // -------------------------------------------------------------
  const [autoPrice, setAutoPrice] = useState<number>(36000);
  const [autoDownPayment, setAutoDownPayment] = useState<number>(5000);
  const [autoTradeIn, setAutoTradeIn] = useState<number>(4000);
  const [autoTradeInTaxCredit, setAutoTradeInTaxCredit] = useState<boolean>(true);
  const [autoSalesTaxRate, setAutoSalesTaxRate] = useState<number>(7.0); // %
  const [autoDealerFees, setAutoDealerFees] = useState<number>(595); // Doc fee
  const [autoTitleReg, setAutoTitleReg] = useState<number>(325); // Registration
  const [autoInterestRate, setAutoInterestRate] = useState<number>(5.9); // APR %
  const [autoLoanTermMonths, setAutoLoanTermMonths] = useState<number>(60); // 60 months

  const autoCalculations = useMemo(() => {
    const price = Math.max(0, autoPrice);
    const down = Math.max(0, autoDownPayment);
    const trade = Math.max(0, autoTradeIn);

    // In most US states, trade-in value reduces taxable base
    const taxableAmount = autoTradeInTaxCredit ? Math.max(0, price - trade) : price;
    const salesTaxAmount = taxableAmount * (Math.max(0, autoSalesTaxRate) / 100);

    const totalVehicleCost = price + salesTaxAmount + autoDealerFees + autoTitleReg;
    const totalCredits = down + trade;
    const loanPrincipal = Math.max(0, totalVehicleCost - totalCredits);

    const monthlyRate = autoInterestRate / 100 / 12;
    const n = Math.max(1, autoLoanTermMonths);

    let monthlyPayment = 0;
    if (monthlyRate > 0) {
      monthlyPayment =
        (loanPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, n))) /
        (Math.pow(1 + monthlyRate, n) - 1);
    } else {
      monthlyPayment = loanPrincipal / n;
    }

    const totalLoanPayments = monthlyPayment * n;
    const totalInterest = Math.max(0, totalLoanPayments - loanPrincipal);
    const grandTotalPaid = totalCredits + totalLoanPayments;

    const donutData = [
      { name: 'Vehicle Principal', value: Math.round(price - down - trade), color: '#2563eb' },
      { name: 'Total Loan Interest', value: Math.round(totalInterest), color: '#ef4444' },
      { name: 'Sales Tax', value: Math.round(salesTaxAmount), color: '#f59e0b' },
      { name: 'Dealer & Title Fees', value: Math.round(autoDealerFees + autoTitleReg), color: '#64748b' },
    ];

    return {
      price,
      salesTaxAmount,
      totalVehicleCost,
      loanPrincipal,
      monthlyPayment,
      totalInterest,
      grandTotalPaid,
      donutData,
    };
  }, [
    autoPrice,
    autoDownPayment,
    autoTradeIn,
    autoTradeInTaxCredit,
    autoSalesTaxRate,
    autoDealerFees,
    autoTitleReg,
    autoInterestRate,
    autoLoanTermMonths,
  ]);

  // -------------------------------------------------------------
  // 4. INVESTMENT & 401(K) CALCULATOR STATE & LOGIC
  // -------------------------------------------------------------
  const [invCurrentBalance, setInvCurrentBalance] = useState<number>(35000);
  const [invAnnualSalary, setInvAnnualSalary] = useState<number>(90000);
  const [invContribPct, setInvContribPct] = useState<number>(9); // 9% of salary
  const [invAnnualContrib, setInvAnnualContrib] = useState<number>(0); // Direct annual contribution ($)
  const [invMonthlyContrib, setInvMonthlyContrib] = useState<number>(0); // Direct monthly contribution ($)
  const [invMatchPct, setInvMatchPct] = useState<number>(50); // 50% match
  const [invMatchCap, setInvMatchCap] = useState<number>(6); // up to 6% salary
  const [invYears, setInvYears] = useState<number>(25); // years
  const [invReturnRate, setInvReturnRate] = useState<number>(8.0); // %
  const [invAdjustInflation, setInvAdjustInflation] = useState<boolean>(true);

  const invCalculations = useMemo(() => {
    const curBal = Math.max(0, invCurrentBalance);
    const salary = Math.max(0, invAnnualSalary);
    const salaryContribAnnual = salary * (Math.max(0, invContribPct) / 100);
    const userContribAnnual = salaryContribAnnual + Math.max(0, invAnnualContrib);
    const userContribMonthly = Math.max(0, invMonthlyContrib) + (userContribAnnual / 12);

    // Employer match: Annual Match = MIN(Contrib, Salary * Match Cap %) * Match %
    const matchedSalaryPct = Math.min(Math.max(0, invContribPct), Math.max(0, invMatchCap));
    const employerMatchAnnual = salary * (matchedSalaryPct / 100) * (Math.max(0, invMatchPct) / 100);
    const employerMatchMonthly = employerMatchAnnual / 12;

    const annualRate = Math.max(0, invReturnRate) / 100;
    const monthlyRate = annualRate / 12;
    const inflationRate = 0.025; // 2.5% standard US inflation rate
    const totalYears = Math.max(1, invYears);

    let runningNominalBalance = curBal;
    let cumUserInvested = curBal;
    let cumEmployerMatch = 0;

    const chartData: Array<{ year: string; balance: number; invested: number }> = [
      { year: 'Yr 0', balance: Math.round(curBal), invested: Math.round(curBal) },
    ];

    for (let yr = 1; yr <= totalYears; yr++) {
      // 12 monthly iterations per year for standard monthly compounding
      for (let m = 0; m < 12; m++) {
        runningNominalBalance = (runningNominalBalance + userContribMonthly + employerMatchMonthly) * (1 + monthlyRate);
      }

      cumUserInvested += (userContribMonthly * 12);
      cumEmployerMatch += employerMatchAnnual;

      const discountFactor = Math.pow(1 + inflationRate, yr);
      const realBalance = runningNominalBalance / discountFactor;

      chartData.push({
        year: `Yr ${yr}`,
        balance: Math.round(invAdjustInflation ? realBalance : runningNominalBalance),
        invested: Math.round(cumUserInvested + cumEmployerMatch),
      });
    }

    const nominalFutureValue = runningNominalBalance;
    const realPresentValue = nominalFutureValue / Math.pow(1 + inflationRate, totalYears);
    const totalInvestedPrincipal = cumUserInvested; // Out-of-pocket cash principal ONLY
    const totalDeposited = cumUserInvested + cumEmployerMatch; // Total principal + match
    const totalCompoundInterest = Math.max(0, nominalFutureValue - totalDeposited);

    return {
      finalBalance: invAdjustInflation ? realPresentValue : nominalFutureValue,
      nominalFutureValue,
      realPresentValue,
      cumUserContrib: cumUserInvested,
      cumEmployerMatch,
      totalContributed: totalDeposited,
      totalInvestedPrincipal,
      totalGrowth: totalCompoundInterest,
      chartData,
    };
  }, [
    invCurrentBalance,
    invAnnualSalary,
    invContribPct,
    invAnnualContrib,
    invMonthlyContrib,
    invMatchPct,
    invMatchCap,
    invYears,
    invReturnRate,
    invAdjustInflation,
  ]);

  // -------------------------------------------------------------
  // 5. HEALTH: BMI CALCULATOR STATE & LOGIC
  // -------------------------------------------------------------
  const [bmiFeet, setBmiFeet] = useState<number>(5);
  const [bmiInches, setBmiInches] = useState<number>(10);
  const [bmiWeightLbs, setBmiWeightLbs] = useState<number>(165);

  const bmiCalculations = useMemo(() => {
    const totalInches = Math.max(1, bmiFeet * 12 + bmiInches);
    const weight = Math.max(1, bmiWeightLbs);

    // US Imperial Formula: 703 * (weight_lbs) / (height_inches^2)
    const bmi = (703 * weight) / (totalInches * totalInches);

    let category = 'Normal weight';
    let categoryColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
    let badge = 'Healthy Range';

    if (bmi < 18.5) {
      category = 'Underweight';
      categoryColor = 'text-blue-600 bg-blue-50 border-blue-200';
      badge = 'Below Normal';
    } else if (bmi >= 18.5 && bmi < 25) {
      category = 'Normal weight';
      categoryColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
      badge = 'Optimal Health';
    } else if (bmi >= 25 && bmi < 30) {
      category = 'Overweight';
      categoryColor = 'text-amber-600 bg-amber-50 border-amber-200';
      badge = 'Moderate Risk';
    } else {
      category = 'Obesity';
      categoryColor = 'text-rose-600 bg-rose-50 border-rose-200';
      badge = 'High Risk';
    }

    // Healthy weight range for this height (BMI 18.5 to 24.9)
    const minHealthyLbs = Math.round((18.5 * totalInches * totalInches) / 703);
    const maxHealthyLbs = Math.round((24.9 * totalInches * totalInches) / 703);

    return {
      bmi: parseFloat(bmi.toFixed(1)),
      category,
      categoryColor,
      badge,
      minHealthyLbs,
      maxHealthyLbs,
    };
  }, [bmiFeet, bmiInches, bmiWeightLbs]);

  // -------------------------------------------------------------
  // 6. HEALTH: BMR & TDEE CALCULATOR STATE & LOGIC
  // -------------------------------------------------------------
  const [bmrGender, setBmrGender] = useState<'male' | 'female'>('male');
  const [bmrAge, setBmrAge] = useState<number>(32);
  const [bmrFeet, setBmrFeet] = useState<number>(5);
  const [bmrInches, setBmrInches] = useState<number>(10);
  const [bmrWeightLbs, setBmrWeightLbs] = useState<number>(175);
  const [bmrActivity, setBmrActivity] = useState<number>(1.55); // Moderately active

  const bmrCalculations = useMemo(() => {
    // Mifflin-St Jeor Equation
    // Convert to kg and cm
    const totalInches = bmrFeet * 12 + bmrInches;
    const weightKg = bmrWeightLbs * 0.453592;
    const heightCm = totalInches * 2.54;

    let bmr = 10 * weightKg + 6.25 * heightCm - 5 * bmrAge;
    if (bmrGender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    const tdee = bmr * bmrActivity;

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      mildLoss: Math.round(tdee - 250), // 0.5 lb/week
      weightLoss: Math.round(tdee - 500), // 1.0 lb/week
      mildSurplus: Math.round(tdee + 250), // 0.5 lb muscle gain
    };
  }, [bmrGender, bmrAge, bmrFeet, bmrInches, bmrWeightLbs, bmrActivity]);

  // -------------------------------------------------------------
  // 7. HEALTH: US NAVY BODY FAT % STATE & LOGIC
  // -------------------------------------------------------------
  const [bfGender, setBfGender] = useState<'male' | 'female'>('male');
  const [bfHeightInches, setBfHeightInches] = useState<number>(70);
  const [bfNeckInches, setBfNeckInches] = useState<number>(16);
  const [bfWaistInches, setBfWaistInches] = useState<number>(34);
  const [bfHipInches, setBfHipInches] = useState<number>(38); // only used for females
  const [bfWeightLbs, setBfWeightLbs] = useState<number>(180);

  const bfCalculations = useMemo(() => {
    const h = Math.max(1, bfHeightInches);
    const n = Math.max(1, bfNeckInches);
    const w = Math.max(1, bfWaistInches);
    const hip = Math.max(1, bfHipInches);

    let bodyFatPct = 0;
    if (bfGender === 'male') {
      // US Navy Male formula: 86.010 * log10(waist - neck) - 70.041 * log10(height) + 36.76
      const diff = Math.max(0.1, w - n);
      bodyFatPct = 86.01 * Math.log10(diff) - 70.041 * Math.log10(h) + 36.76;
    } else {
      // US Navy Female formula: 163.205 * log10(waist + hip - neck) - 97.684 * log10(height) - 78.387
      const sumDiff = Math.max(0.1, w + hip - n);
      bodyFatPct = 163.205 * Math.log10(sumDiff) - 97.684 * Math.log10(h) - 78.387;
    }

    const clampedBf = Math.max(3, Math.min(55, bodyFatPct));
    const fatMassLbs = (clampedBf / 100) * bfWeightLbs;
    const leanMassLbs = Math.max(0, bfWeightLbs - fatMassLbs);

    return {
      bodyFatPct: parseFloat(clampedBf.toFixed(1)),
      fatMassLbs: Math.round(fatMassLbs),
      leanMassLbs: Math.round(leanMassLbs),
    };
  }, [bfGender, bfHeightInches, bfNeckInches, bfWaistInches, bfHipInches, bfWeightLbs]);

  // -------------------------------------------------------------
  // 8. MATH: TIP & SALES TAX CALCULATOR
  // -------------------------------------------------------------
  const [tipBill, setTipBill] = useState<number>(95);
  const [tipPctChoice, setTipPctChoice] = useState<number>(18);
  const [tipTaxRate, setTipTaxRate] = useState<number>(8.875); // NYC average
  const [tipSplit, setTipSplit] = useState<number>(2);

  const tipCalculations = useMemo(() => {
    const bill = Math.max(0, tipBill);
    const taxAmt = bill * (Math.max(0, tipTaxRate) / 100);
    const tipAmt = bill * (Math.max(0, tipPctChoice) / 100);
    const grandTotal = bill + taxAmt + tipAmt;
    const perPerson = grandTotal / Math.max(1, tipSplit);

    return {
      bill,
      taxAmt,
      tipAmt,
      grandTotal,
      perPerson,
    };
  }, [tipBill, tipPctChoice, tipTaxRate, tipSplit]);

  // -------------------------------------------------------------
  // Export & Print Helpers
  // -------------------------------------------------------------
  const exportMortgageScheduleToCsv = () => {
    const headers = 'Year,Principal Paid,Interest Paid,Ending Balance\n';
    const rows = mortCalculations.yearlySchedule
      .map(
        (s) =>
          `${s.year},"$${s.principal.toLocaleString()}","$${s.interest.toLocaleString()}","$${s.endingBalance.toLocaleString()}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mortgage_Amortization_Schedule_${homePrice}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (val: number, decimals: number = 0) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: decimals,
    }).format(val);
  };

  return (
    <div className="w-full space-y-6">
      {/* Calculator.net Style Category Header Navigation */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        {/* Top Category Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
          <button
            onClick={() => {
              setActiveCategory('financial');
              setActiveCalc('mortgage');
            }}
            className={`px-6 py-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeCategory === 'financial'
                ? 'border-emerald-600 text-emerald-800 bg-white font-extrabold shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Financial Calculators</span>
          </button>

          <button
            onClick={() => {
              setActiveCategory('health');
              setActiveCalc('bmi');
            }}
            className={`px-6 py-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeCategory === 'health'
                ? 'border-emerald-600 text-emerald-800 bg-white font-extrabold shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4 text-blue-600" />
            <span>Health & Fitness</span>
          </button>

          <button
            onClick={() => {
              setActiveCategory('math');
              setActiveCalc('tip');
            }}
            className={`px-6 py-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeCategory === 'math'
                ? 'border-emerald-600 text-emerald-800 bg-white font-extrabold shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Percent className="w-4 h-4 text-amber-600" />
            <span>Math & Daily Life</span>
          </button>
        </div>

        {/* Sub-Calculator Selector Pills */}
        <div className="p-3 bg-white border-b border-slate-100 flex flex-wrap gap-2 items-center">
          {activeCategory === 'financial' && (
            <>
              <button
                onClick={() => setActiveCalc('mortgage')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeCalc === 'mortgage'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Home className="w-3.5 h-3.5" /> Mortgage & Real Estate
              </button>
              <button
                onClick={() => setActiveCalc('tax')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeCalc === 'tax'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Income Tax & Payroll (FICA)
              </button>
              <button
                onClick={() => setActiveCalc('auto')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeCalc === 'auto'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Car className="w-3.5 h-3.5" /> Auto Loan & Trade-In
              </button>
              <button
                onClick={() => setActiveCalc('investment')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeCalc === 'investment'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <PiggyBank className="w-3.5 h-3.5" /> 401(k) / IRA Investment
              </button>
            </>
          )}

          {activeCategory === 'health' && (
            <>
              <button
                onClick={() => setActiveCalc('bmi')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeCalc === 'bmi'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Scale className="w-3.5 h-3.5" /> BMI Calculator (Imperial lbs/in)
              </button>
              <button
                onClick={() => setActiveCalc('bmr')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeCalc === 'bmr'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" /> BMR & TDEE (Mifflin-St Jeor)
              </button>
              <button
                onClick={() => setActiveCalc('bodyfat')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeCalc === 'bodyfat'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Heart className="w-3.5 h-3.5" /> Body Fat % (US Navy Method)
              </button>
            </>
          )}

          {activeCategory === 'math' && (
            <>
              <button
                onClick={() => setActiveCalc('tip')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeCalc === 'tip'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" /> Tip & State Sales Tax Splitter
              </button>
            </>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. MORTGAGE CALCULATOR VIEW */}
      {/* ------------------------------------------------------------- */}
      {activeCalc === 'mortgage' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Home className="w-6 h-6 text-emerald-600" />
                US Mortgage & Amortization Calculator
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Calculates fixed/ARM P&I, Private Mortgage Insurance (PMI under 20% down), US property tax, homeowners insurance, and HOA fees.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                title="Print Summary"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              <button
                onClick={exportMortgageScheduleToCsv}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                title="Export Amortization Schedule to CSV"
              >
                <Download className="w-3.5 h-3.5" /> Export Schedule
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input Controls */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center justify-between">
                <span>Mortgage Parameters</span>
                <span className="text-[11px] text-slate-400 font-normal">Real Estate Financing</span>
              </h3>

              {/* Home Price */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                  <label htmlFor="homePrice" className="flex items-center gap-1">
                    <span>Home Value / Purchase Price ($)</span>
                    <span className="text-[10px] text-slate-400 font-normal cursor-help" title="Total purchase price or appraised value of the property in USD ($50,000 - $2,000,000).">ⓘ</span>
                  </label>
                  <span className="text-emerald-600 font-mono font-bold">{formatCurrency(homePrice)}</span>
                </div>
                <input
                  type="range"
                  min={50000}
                  max={2000000}
                  step={5000}
                  value={homePrice}
                  onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mb-2"
                />
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-slate-400">$</span>
                  <input
                    id="homePrice"
                    type="number"
                    min={50000}
                    max={2000000}
                    value={homePrice}
                    onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Down Payment */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="downPaymentDollar" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <span>Down Payment ($)</span>
                    <span className="text-[10px] text-slate-400 font-normal cursor-help" title="Upfront cash payment toward the home purchase. 20% down avoids PMI.">ⓘ</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-slate-400">$</span>
                    <input
                      id="downPaymentDollar"
                      type="number"
                      value={mortDownAmt}
                      onChange={(e) => handleDownAmtChange(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="downPaymentPercent" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <span>Down Payment (%)</span>
                    <span className="text-[10px] text-slate-400 font-normal cursor-help" title="Down payment percentage relative to home purchase price.">ⓘ</span>
                  </label>
                  <div className="relative">
                    <input
                      id="downPaymentPercent"
                      type="number"
                      value={mortDownPct}
                      step={0.5}
                      min={0}
                      max={95}
                      onChange={(e) => handleDownPctChange(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 pr-7 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>
              </div>

              {/* Loan Term & Interest Rate */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="loanTerm" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <span>Loan Term</span>
                    <span className="text-[10px] text-slate-400 font-normal cursor-help" title="Duration of the mortgage amortization schedule (10 to 30 years).">ⓘ</span>
                  </label>
                  <select
                    id="loanTerm"
                    value={mortTermYears}
                    onChange={(e) => setMortTermYears(parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value={30}>30-yr fixed</option>
                    <option value={20}>20-yr fixed</option>
                    <option value={15}>15-yr fixed</option>
                    <option value={10}>10-yr fixed</option>
                    <option value={5}>5/1 ARM</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="interestRate" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <span>Interest Rate (%)</span>
                    <span className="text-[10px] text-slate-400 font-normal cursor-help" title="Annual mortgage interest rate APR (1.0% - 15.0%).">ⓘ</span>
                  </label>
                  <div className="relative">
                    <input
                      id="interestRate"
                      type="number"
                      step={0.01}
                      min={1.0}
                      max={15.0}
                      value={mortInterest}
                      onChange={(e) => setMortInterest(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 pr-7 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>
              </div>

              {/* Start Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="startDate" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <span>Start Month & Year</span>
                    <span className="text-[10px] text-slate-400 font-normal cursor-help" title="First payment month and year.">ⓘ</span>
                  </label>
                  <select
                    id="startDate"
                    value={mortStartMonth}
                    onChange={(e) => setMortStartMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-5">
                  <input
                    type="number"
                    value={mortStartYear}
                    onChange={(e) => setMortStartYear(parseInt(e.target.value) || 2026)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Include Taxes & Costs Below Checkbox */}
              <div className="pt-3 border-t border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-slate-900">
                  <input
                    type="checkbox"
                    checked={includeTaxesAndCosts}
                    onChange={(e) => setIncludeTaxesAndCosts(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>Include Taxes & Costs Below</span>
                </label>
              </div>

              {/* Annual Tax & Cost Fields (Matching Calculator.net) */}
              {includeTaxesAndCosts && (
                <div className="space-y-2.5 pt-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Annual Tax & Cost</div>

                  {/* Property Taxes */}
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="propertyTax" className="text-xs text-slate-700 font-medium w-36 flex items-center gap-1">
                      <span>Property Taxes</span>
                      <span className="text-[10px] text-slate-400 font-normal cursor-help" title="Annual property tax assessed by local government (avg 1.2% / $4,800/yr).">ⓘ</span>
                    </label>
                    <div className="flex-1 flex gap-1.5">
                      <input
                        id="propertyTax"
                        type="number"
                        step={mortPropertyTaxUnit === '%' ? 0.05 : 100}
                        value={mortPropertyTaxVal}
                        onChange={(e) => setMortPropertyTaxVal(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <select
                        value={mortPropertyTaxUnit}
                        onChange={(e) => setMortPropertyTaxUnit(e.target.value as '%' | '$')}
                        className="px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 font-bold"
                      >
                        <option value="%">%</option>
                        <option value="$">$</option>
                      </select>
                    </div>
                  </div>

                  {/* Home Insurance */}
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="homeInsurance" className="text-xs text-slate-700 font-medium w-36 flex items-center gap-1">
                      <span>Home Insurance</span>
                      <span className="text-[10px] text-slate-400 font-normal cursor-help" title="Annual hazard and homeowners insurance premium ($1,500/yr avg).">ⓘ</span>
                    </label>
                    <div className="flex-1 flex gap-1.5">
                      <input
                        id="homeInsurance"
                        type="number"
                        step={50}
                        value={mortHomeInsuranceVal}
                        onChange={(e) => setMortHomeInsuranceVal(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <select
                        value={mortHomeInsuranceUnit}
                        onChange={(e) => setMortHomeInsuranceUnit(e.target.value as '%' | '$')}
                        className="px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 font-bold"
                      >
                        <option value="$">$</option>
                        <option value="%">%</option>
                      </select>
                    </div>
                  </div>

                  {/* PMI Insurance */}
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="pmiRate" className="text-xs text-slate-700 font-medium w-36 flex items-center gap-1">
                      <span>PMI Insurance (%)</span>
                      <span className="text-[10px] text-slate-400 font-normal cursor-help" title="Private Mortgage Insurance rate (default 0.5%). Auto-cancels when balance drops to 78% LTV.">ⓘ</span>
                    </label>
                    <div className="flex-1 flex gap-1.5">
                      <input
                        id="pmiRate"
                        type="number"
                        step={0.1}
                        value={mortPmiVal}
                        onChange={(e) => setMortPmiVal(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <select
                        value={mortPmiUnit}
                        onChange={(e) => setMortPmiUnit(e.target.value as '%' | '$')}
                        className="px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 font-bold"
                      >
                        <option value="%">%</option>
                        <option value="$">$</option>
                      </select>
                    </div>
                  </div>

                  {/* HOA Fee */}
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="hoaFee" className="text-xs text-slate-700 font-medium w-36 flex items-center gap-1">
                      <span>HOA / Condo Fee</span>
                      <span className="text-[10px] text-slate-400 font-normal cursor-help" title="Monthly Homeowners Association or Condominium fee ($/mo).">ⓘ</span>
                    </label>
                    <div className="flex-1 flex gap-1.5">
                      <input
                        id="hoaFee"
                        type="number"
                        step={25}
                        value={mortHoaVal}
                        onChange={(e) => setMortHoaVal(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <select
                        value={mortHoaUnit}
                        onChange={(e) => setMortHoaUnit(e.target.value as '%' | '$')}
                        className="px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 font-bold"
                      >
                        <option value="$">$</option>
                        <option value="%">%</option>
                      </select>
                    </div>
                  </div>

                  {/* Other Costs */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-700 font-medium w-36">Other Costs</span>
                    <div className="flex-1 flex gap-1.5">
                      <input
                        type="number"
                        step={100}
                        value={mortOtherCostsVal}
                        onChange={(e) => setMortOtherCostsVal(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <select
                        value={mortOtherCostsUnit}
                        onChange={(e) => setMortOtherCostsUnit(e.target.value as '%' | '$')}
                        className="px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 font-bold"
                      >
                        <option value="$">$</option>
                        <option value="%">%</option>
                      </select>
                    </div>
                  </div>

                  {/* Advanced Collapsible Accordion Toggle Link */}
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setShowMoreOptions((prev) => !prev)}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
                    >
                      {showMoreOptions ? '– Fewer Options' : '+ More Options'}
                    </button>
                  </div>

                  {/* Advanced Collapsible Section: Cost Increase & Extra Payments */}
                  {showMoreOptions && (
                    <div className="space-y-4 pt-3 border-t border-slate-200">
                      {/* Annual Tax & Cost Increase */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-800">Annual Tax & Cost Increase</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] text-slate-600 truncate">Property Taxes Inc</span>
                            <div className="flex items-center gap-1 w-20">
                              <input
                                type="number"
                                value={taxIncreaseRate}
                                onChange={(e) => setTaxIncreaseRate(parseFloat(e.target.value) || 0)}
                                className="w-12 px-1.5 py-1 border border-slate-300 rounded text-xs text-center"
                              />
                              <span className="text-slate-400 font-bold">%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] text-slate-600 truncate">Home Ins Inc</span>
                            <div className="flex items-center gap-1 w-20">
                              <input
                                type="number"
                                value={insIncreaseRate}
                                onChange={(e) => setInsIncreaseRate(parseFloat(e.target.value) || 0)}
                                className="w-12 px-1.5 py-1 border border-slate-300 rounded text-xs text-center"
                              />
                              <span className="text-slate-400 font-bold">%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] text-slate-600 truncate">HOA Fee Inc</span>
                            <div className="flex items-center gap-1 w-20">
                              <input
                                type="number"
                                value={hoaIncreaseRate}
                                onChange={(e) => setHoaIncreaseRate(parseFloat(e.target.value) || 0)}
                                className="w-12 px-1.5 py-1 border border-slate-300 rounded text-xs text-center"
                              />
                              <span className="text-slate-400 font-bold">%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] text-slate-600 truncate">Other Costs Inc</span>
                            <div className="flex items-center gap-1 w-20">
                              <input
                                type="number"
                                value={otherIncreaseRate}
                                onChange={(e) => setOtherIncreaseRate(parseFloat(e.target.value) || 0)}
                                className="w-12 px-1.5 py-1 border border-slate-300 rounded text-xs text-center"
                              />
                              <span className="text-slate-400 font-bold">%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Extra Payments Accordion Section */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <h4 className="text-xs font-bold text-slate-800">Extra Payments</h4>

                        {/* Extra Monthly Pay */}
                        <div className="space-y-1">
                          <label htmlFor="extraMonthly" className="text-[11px] text-slate-600 font-semibold block flex items-center gap-1">
                            <span>Extra Monthly Payment ($/mo)</span>
                            <span className="text-[10px] text-slate-400 font-normal cursor-help" title="Additional principal payment made every month to accelerate loan payoff.">ⓘ</span>
                          </label>
                          <div className="flex items-center gap-1.5">
                            <div className="relative flex-1">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-xs text-slate-400">$</span>
                              <input
                                id="extraMonthly"
                                type="number"
                                value={extraMonthlyPay}
                                onChange={(e) => setExtraMonthlyPay(parseFloat(e.target.value) || 0)}
                                className="w-full pl-6 pr-2 py-1 border border-slate-300 rounded text-xs font-semibold"
                              />
                            </div>
                            <span className="text-[11px] text-slate-500">from</span>
                            <select
                              value={extraMonthlyMonth}
                              onChange={(e) => setExtraMonthlyMonth(e.target.value)}
                              className="px-1.5 py-1 border border-slate-300 rounded text-xs bg-white"
                            >
                              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                            <input
                              type="number"
                              value={extraMonthlyYear}
                              onChange={(e) => setExtraMonthlyYear(parseInt(e.target.value) || 2026)}
                              className="w-16 px-1.5 py-1 border border-slate-300 rounded text-xs"
                            />
                          </div>
                        </div>

                        {/* Extra Yearly Pay */}
                        <div className="space-y-1 pt-1">
                          <label htmlFor="extraYearly" className="text-[11px] text-slate-600 font-semibold block flex items-center gap-1">
                            <span>Extra Yearly Payment ($/yr)</span>
                            <span className="text-[10px] text-slate-400 font-normal cursor-help" title="Additional principal payment made annually on anniversary date.">ⓘ</span>
                          </label>
                          <div className="flex items-center gap-1.5">
                            <div className="relative flex-1">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-xs text-slate-400">$</span>
                              <input
                                id="extraYearly"
                                type="number"
                                value={extraYearlyPay}
                                onChange={(e) => setExtraYearlyPay(parseFloat(e.target.value) || 0)}
                                className="w-full pl-6 pr-2 py-1 border border-slate-300 rounded text-xs font-semibold"
                              />
                            </div>
                            <span className="text-[11px] text-slate-500">from</span>
                            <select
                              value={extraYearlyMonth}
                              onChange={(e) => setExtraYearlyMonth(e.target.value)}
                              className="px-1.5 py-1 border border-slate-300 rounded text-xs bg-white"
                            >
                              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                            <input
                              type="number"
                              value={extraYearlyYear}
                              onChange={(e) => setExtraYearlyYear(parseInt(e.target.value) || 2026)}
                              className="w-16 px-1.5 py-1 border border-slate-300 rounded text-xs"
                            />
                          </div>
                        </div>

                        {/* Extra One-time Pay */}
                        <div className="space-y-1 pt-1">
                          <label className="text-[11px] text-slate-600 font-semibold block">Extra One-time Pay</label>
                          <div className="flex items-center gap-1.5">
                            <div className="relative flex-1">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-xs text-slate-400">$</span>
                              <input
                                type="number"
                                value={extraOneTimePay}
                                onChange={(e) => setExtraOneTimePay(parseFloat(e.target.value) || 0)}
                                className="w-full pl-6 pr-2 py-1 border border-slate-300 rounded text-xs font-semibold"
                              />
                            </div>
                            <span className="text-[11px] text-slate-500">in</span>
                            <select
                              value={extraOneTimeMonth}
                              onChange={(e) => setExtraOneTimeMonth(e.target.value)}
                              className="px-1.5 py-1 border border-slate-300 rounded text-xs bg-white"
                            >
                              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                            <input
                              type="number"
                              value={extraOneTimeYear}
                              onChange={(e) => setExtraOneTimeYear(parseInt(e.target.value) || 2026)}
                              className="w-16 px-1.5 py-1 border border-slate-300 rounded text-xs"
                            />
                          </div>
                        </div>

                        {/* Expandable Rows of One-time Payments */}
                        <div className="pt-2 text-center">
                          <button
                            type="button"
                            onClick={() => setShowExtraOneTimeRows((prev) => !prev)}
                            className="text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
                          >
                            {showExtraOneTimeRows ? '– Hide Below Inputs' : '+ Add More One-time Payments'}
                          </button>
                        </div>

                        {showExtraOneTimeRows && (
                          <div className="space-y-1.5 pt-1">
                            {extraOneTimeRows.map((row) => (
                              <div key={row.id} className="flex items-center gap-1.5">
                                <div className="relative flex-1">
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-xs text-slate-400">$</span>
                                  <input
                                    type="number"
                                    value={row.amount || ''}
                                    placeholder="0"
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value) || 0;
                                      setExtraOneTimeRows((prev) =>
                                        prev.map((r) => (r.id === row.id ? { ...r, amount: val } : r))
                                      );
                                    }}
                                    className="w-full pl-6 pr-2 py-1 border border-slate-300 rounded text-xs"
                                  />
                                </div>
                                <span className="text-[11px] text-slate-500">in</span>
                                <select
                                  value={row.month}
                                  onChange={(e) => {
                                    const m = e.target.value;
                                    setExtraOneTimeRows((prev) =>
                                      prev.map((r) => (r.id === row.id ? { ...r, month: m } : r))
                                    );
                                  }}
                                  className="px-1.5 py-1 border border-slate-300 rounded text-xs bg-white"
                                >
                                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                  ))}
                                </select>
                                <input
                                  type="number"
                                  value={row.year}
                                  onChange={(e) => {
                                    const y = parseInt(e.target.value) || 2026;
                                    setExtraOneTimeRows((prev) =>
                                      prev.map((r) => (r.id === row.id ? { ...r, year: y } : r))
                                    );
                                  }}
                                  className="w-16 px-1.5 py-1 border border-slate-300 rounded text-xs"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Results & Visuals (Matching Calculator.net Screenshot) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Monthly Breakdown Table & Donut Chart Box */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Left Column: Breakdown Table */}
                  <div className="md:col-span-7">
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                          <tr>
                            <th className="p-2.5 text-left font-bold">Monthly Payment</th>
                            <th className="p-2.5 text-right font-bold">Per Month</th>
                            <th className="p-2.5 text-right font-bold">Total Over Loan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr>
                            <td className="p-2.5 flex items-center gap-1.5 font-medium text-slate-700">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb] shrink-0" />
                              <span>Mortgage Payment</span>
                            </td>
                            <td className="p-2.5 text-right font-semibold text-slate-900">{formatCurrency(mortCalculations.monthlyPI, 2)}</td>
                            <td className="p-2.5 text-right text-slate-700">{formatCurrency(mortCalculations.totalMortgagePayments, 2)}</td>
                          </tr>
                          {includeTaxesAndCosts && mortCalculations.monthlyTaxes > 0 && (
                            <tr>
                              <td className="p-2.5 flex items-center gap-1.5 font-medium text-slate-700">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a] shrink-0" />
                                <span>Property Taxes</span>
                              </td>
                              <td className="p-2.5 text-right font-semibold text-slate-900">{formatCurrency(mortCalculations.monthlyTaxes, 2)}</td>
                              <td className="p-2.5 text-right text-slate-700">{formatCurrency(mortCalculations.totalTaxesOverLoan, 2)}</td>
                            </tr>
                          )}
                          {includeTaxesAndCosts && mortCalculations.monthlyIns > 0 && (
                            <tr>
                              <td className="p-2.5 flex items-center gap-1.5 font-medium text-slate-700">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626] shrink-0" />
                                <span>Home Insurance</span>
                              </td>
                              <td className="p-2.5 text-right font-semibold text-slate-900">{formatCurrency(mortCalculations.monthlyIns, 2)}</td>
                              <td className="p-2.5 text-right text-slate-700">{formatCurrency(mortCalculations.totalInsOverLoan, 2)}</td>
                            </tr>
                          )}
                          {includeTaxesAndCosts && mortCalculations.monthlyOther > 0 && (
                            <tr>
                              <td className="p-2.5 flex items-center gap-1.5 font-medium text-slate-700">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#0891b2] shrink-0" />
                                <span>Other Costs</span>
                              </td>
                              <td className="p-2.5 text-right font-semibold text-slate-900">{formatCurrency(mortCalculations.monthlyOther, 2)}</td>
                              <td className="p-2.5 text-right text-slate-700">{formatCurrency(mortCalculations.totalOtherOverLoan, 2)}</td>
                            </tr>
                          )}
                          {includeTaxesAndCosts && mortCalculations.monthlyPmi > 0 && (
                            <tr>
                              <td className="p-2.5 flex items-center gap-1.5 font-medium text-rose-700">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0" />
                                <span>PMI Insurance</span>
                              </td>
                              <td className="p-2.5 text-right font-semibold text-rose-700">{formatCurrency(mortCalculations.monthlyPmi, 2)}</td>
                              <td className="p-2.5 text-right text-rose-700">{formatCurrency(mortCalculations.totalPmiOverLoan, 2)}</td>
                            </tr>
                          )}
                          {includeTaxesAndCosts && mortCalculations.monthlyHoa > 0 && (
                            <tr>
                              <td className="p-2.5 flex items-center gap-1.5 font-medium text-slate-700">
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-500 shrink-0" />
                                <span>HOA Fee</span>
                              </td>
                              <td className="p-2.5 text-right font-semibold text-slate-900">{formatCurrency(mortCalculations.monthlyHoa, 2)}</td>
                              <td className="p-2.5 text-right text-slate-700">{formatCurrency(mortCalculations.totalHoaOverLoan, 2)}</td>
                            </tr>
                          )}
                          <tr className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-200">
                            <td className="p-2.5 font-extrabold text-slate-900">Total Out-of-Pocket</td>
                            <td className="p-2.5 text-right font-extrabold text-emerald-700 text-sm">{formatCurrency(mortCalculations.totalMonthlyOutOfPocket, 2)}</td>
                            <td className="p-2.5 text-right font-extrabold text-slate-900">{formatCurrency(mortCalculations.totalOutOfPocketAllYears, 2)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right Column: Donut Chart with matching Calculator.net colors */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center">
                    <div className="h-44 w-44 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={mortCalculations.donutData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {mortCalculations.donutData.map((e, i) => (
                              <Cell key={`cell-${i}`} fill={e.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(val: any) => formatCurrency(Number(val), 2)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Donut Legend */}
                    <div className="space-y-1 text-[11px] w-full pt-2">
                      {mortCalculations.donutData.map((item) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                            <span>{item.name}</span>
                          </span>
                          <span className="font-bold text-slate-900">{item.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Table (Matching Calculator.net Screenshot) */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full divide-y divide-slate-100">
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-800 bg-slate-50/50 w-1/2">House Price</td>
                        <td className="p-3 font-mono font-bold text-slate-900 text-right">{formatCurrency(homePrice, 2)}</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-800 bg-slate-50/50">Loan Amount</td>
                        <td className="p-3 font-mono font-bold text-slate-900 text-right">{formatCurrency(mortCalculations.loanAmt, 2)}</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-800 bg-slate-50/50">Down Payment</td>
                        <td className="p-3 font-mono font-bold text-slate-900 text-right">{formatCurrency(mortDownAmt, 2)}</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-800 bg-slate-50/50">Total of {mortTermYears * 12} Mortgage Payments</td>
                        <td className="p-3 font-mono font-bold text-slate-900 text-right">{formatCurrency(mortCalculations.totalMortgagePayments, 2)}</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-800 bg-slate-50/50">Total Interest</td>
                        <td className="p-3 font-mono font-bold text-rose-600 text-right">{formatCurrency(mortCalculations.totalInterest, 2)}</td>
                      </tr>
                      <tr className="hover:bg-slate-50 bg-emerald-50/30">
                        <td className="p-3 font-extrabold text-emerald-900 bg-emerald-50/60">Mortgage Payoff Date</td>
                        <td className="p-3 font-bold text-emerald-800 text-right font-mono">{mortCalculations.payoffDate}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Loan Amortization Trajectory Area Chart */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Balance & Equity Over Time</h4>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mortCalculations.trajectoryChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                      <RechartsTooltip formatter={(val: any) => formatCurrency(Number(val), 2)} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Area type="monotone" dataKey="equity" name="Home Equity" stroke="#16a34a" fill="#16a34a" fillOpacity={0.2} />
                      <Area type="monotone" dataKey="balance" name="Remaining Loan Balance" stroke="#2563eb" fill="#2563eb" fillOpacity={0.1} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Annual & Monthly Amortization Schedule Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Mortgage Amortization Schedule</h3>
                <p className="text-xs text-slate-500">Interactive period-by-period principal, interest, and payoff progression</p>
              </div>

              {/* View Toggle */}
              <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setMortScheduleView('yearly')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mortScheduleView === 'yearly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Annual Schedule
                </button>
                <button
                  type="button"
                  onClick={() => setMortScheduleView('monthly')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mortScheduleView === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Monthly ({mortCalculations.monthly360Schedule.length} Mo)
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-96 custom-scrollbar border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold sticky top-0 border-b border-slate-200">
                  {mortScheduleView === 'yearly' ? (
                    <tr>
                      <th className="p-3">Year</th>
                      <th className="p-3">Principal Paid</th>
                      <th className="p-3">Interest Paid</th>
                      <th className="p-3">Total Paid</th>
                      <th className="p-3">Ending Balance</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="p-3 text-center">Mo #</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Payment</th>
                      <th className="p-3 text-right text-emerald-600">Principal</th>
                      <th className="p-3 text-right text-rose-600">Interest</th>
                      <th className="p-3 text-right text-blue-600">Extra Principal</th>
                      <th className="p-3 text-right">Total Interest</th>
                      <th className="p-3 text-right">Remaining Balance</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {mortScheduleView === 'yearly'
                    ? mortCalculations.yearlySchedule.map((row) => (
                        <tr key={row.year} className="hover:bg-slate-50 font-sans">
                          <td className="p-3 font-bold text-slate-800">Year {row.year}</td>
                          <td className="p-3 text-emerald-600 font-semibold">{formatCurrency(row.principal, 2)}</td>
                          <td className="p-3 text-rose-600 font-semibold">{formatCurrency(row.interest, 2)}</td>
                          <td className="p-3 text-slate-800">{formatCurrency(row.principal + row.interest, 2)}</td>
                          <td className="p-3 font-bold text-slate-900">{formatCurrency(row.endingBalance, 2)}</td>
                        </tr>
                      ))
                    : mortCalculations.monthly360Schedule.map((row) => (
                        <tr key={row.monthIndex} className="hover:bg-slate-50">
                          <td className="p-3 text-center font-bold text-slate-500 font-sans">{row.monthIndex}</td>
                          <td className="p-3 font-bold text-slate-800 font-sans">{row.dateStr}</td>
                          <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(row.payment, 2)}</td>
                          <td className="p-3 text-right text-emerald-600 font-bold">{formatCurrency(row.principal, 2)}</td>
                          <td className="p-3 text-right text-rose-600">{formatCurrency(row.interest, 2)}</td>
                          <td className="p-3 text-right text-blue-600">{formatCurrency(row.extraPrincipal, 2)}</td>
                          <td className="p-3 text-right text-slate-500">{formatCurrency(row.totalInterestToDate, 2)}</td>
                          <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(row.endingBalance, 2)}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. US INCOME TAX & PAYROLL CALCULATOR VIEW */}
      {/* ------------------------------------------------------------- */}
      {activeCalc === 'tax' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              US Federal & State Income Tax & FICA Calculator
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Computes Federal Tax brackets (Single, MFJ, HOH), FICA (Social Security wage cap $168,600 + Medicare 1.45% + 0.9% additional), and state income tax estimates.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input Controls */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Tax Filings & Deductions</h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Annual Gross Income ($)</label>
                <input
                  type="number"
                  step={1000}
                  value={taxGrossIncome}
                  onChange={(e) => setTaxGrossIncome(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Filing Status</label>
                <select
                  value={taxFilingStatus}
                  onChange={(e) => setTaxFilingStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="single">Single</option>
                  <option value="mfj">Married Filing Jointly</option>
                  <option value="hoh">Head of Household</option>
                </select>
              </div>

              {/* Advanced Options Collapsible Accordion */}
              <div className="pt-2 text-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTaxAdvanced((prev) => !prev)}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
                >
                  {showTaxAdvanced ? '– Fewer Options' : '+ More Options / Deductions & State Tax (3 extra fields)'}
                </button>
              </div>

              {showTaxAdvanced && (
                <div className="space-y-3 pt-3 border-t border-slate-200 bg-slate-50/75 p-3.5 rounded-xl">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Deduction Method</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTaxDeductionMode('standard')}
                        className={`py-2 text-xs font-bold rounded-lg border transition cursor-pointer ${
                          taxDeductionMode === 'standard'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        Standard Deduction
                      </button>
                      <button
                        type="button"
                        onClick={() => setTaxDeductionMode('itemized')}
                        className={`py-2 text-xs font-bold rounded-lg border transition cursor-pointer ${
                          taxDeductionMode === 'itemized'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        Itemized Deductions
                      </button>
                    </div>
                  </div>

                  {taxDeductionMode === 'itemized' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Itemized Amount ($)</label>
                      <input
                        type="number"
                        step={500}
                        value={taxItemizedDeductions}
                        onChange={(e) => setTaxItemizedDeductions(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Pre-Tax 401(k) ($/yr)</label>
                      <input
                        type="number"
                        max={23000}
                        step={500}
                        value={taxPretax401k}
                        onChange={(e) => setTaxPretax401k(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      />
                      <span className="text-[10px] text-slate-400">Max $23,000 for 2024</span>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">State Tax Rate (%)</label>
                      <input
                        type="number"
                        step={0.1}
                        value={taxStateRate}
                        onChange={(e) => setTaxStateRate(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      />
                      <span className="text-[10px] text-slate-400">0% for TX, FL, WA</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Results & Tax Cards */}
            <div className="lg:col-span-7 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Net Take-Home Pay
                  </span>
                  <span className="text-2xl font-black text-emerald-600 block mt-1">
                    {formatCurrency(taxCalculations.netTakeHome)}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {taxCalculations.takeHomeRate.toFixed(1)}% of gross income
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Total Tax Burden
                  </span>
                  <span className="text-2xl font-black text-rose-600 block mt-1">
                    {formatCurrency(taxCalculations.totalTax)}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Effective Rate: {taxCalculations.effectiveTaxRate.toFixed(1)}%
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Marginal Bracket
                  </span>
                  <span className="text-2xl font-black text-slate-800 block mt-1">
                    {taxCalculations.marginalRate.toFixed(0)}%
                  </span>
                  <span className="text-[11px] text-slate-400">Top IRS Tax Bracket</span>
                </div>
              </div>

              {/* Paycheck Cadence Table */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Paycheck Distribution</h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500 block font-semibold">Annual Take-Home</span>
                    <strong className="text-sm sm:text-base text-slate-900 font-extrabold block mt-0.5">
                      {formatCurrency(taxCalculations.netTakeHome)}
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500 block font-semibold">Monthly Paycheck</span>
                    <strong className="text-sm sm:text-base text-emerald-600 font-extrabold block mt-0.5">
                      {formatCurrency(taxCalculations.monthlyTakeHome)}
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500 block font-semibold">Bi-Weekly Paycheck</span>
                    <strong className="text-sm sm:text-base text-blue-600 font-extrabold block mt-0.5">
                      {formatCurrency(taxCalculations.biweeklyTakeHome)}
                    </strong>
                  </div>
                </div>

                {/* Tax Breakdown Rows */}
                <div className="mt-5 space-y-2 text-xs border-t border-slate-100 pt-4">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Federal Income Tax</span>
                    <strong className="text-slate-800">{formatCurrency(taxCalculations.federalTax)}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Social Security Tax (6.2% up to $168.6k)</span>
                    <strong className="text-slate-800">{formatCurrency(taxCalculations.ssTax)}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Medicare Tax (1.45% + add'l 0.9% high-earner)</span>
                    <strong className="text-slate-800">{formatCurrency(taxCalculations.medicareTax)}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">State Income Tax ({taxStateRate}%)</span>
                    <strong className="text-slate-800">{formatCurrency(taxCalculations.stateTax)}</strong>
                  </div>
                  <div className="flex justify-between py-1 font-bold">
                    <span className="text-slate-800">Total Taxes Paid</span>
                    <span className="text-rose-600">{formatCurrency(taxCalculations.totalTax)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. AUTO LOAN & TRADE-IN CALCULATOR VIEW */}
      {/* ------------------------------------------------------------- */}
      {activeCalc === 'auto' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Car className="w-6 h-6 text-emerald-600" />
              US Auto Loan & Trade-In Calculator
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Includes US vehicle sales tax rules, state trade-in tax credits, dealer doc fees, and DMV title/registration estimates.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Vehicle Purchase & Trade-In</h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Purchase Price ($)</label>
                <input
                  type="number"
                  step={500}
                  value={autoPrice}
                  onChange={(e) => setAutoPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cash Down Payment ($)</label>
                  <input
                    type="number"
                    step={250}
                    value={autoDownPayment}
                    onChange={(e) => setAutoDownPayment(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Interest Rate (APR %)</label>
                  <input
                    type="number"
                    step={0.1}
                    value={autoInterestRate}
                    onChange={(e) => setAutoInterestRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Loan Term</label>
                <select
                  value={autoLoanTermMonths}
                  onChange={(e) => setAutoLoanTermMonths(parseInt(e.target.value) || 60)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value={36}>36 Months (3 Yrs)</option>
                  <option value={48}>48 Months (4 Yrs)</option>
                  <option value={60}>60 Months (5 Yrs)</option>
                  <option value={72}>72 Months (6 Yrs)</option>
                  <option value={84}>84 Months (7 Yrs)</option>
                </select>
              </div>

              {/* Advanced Options Collapsible Accordion */}
              <div className="pt-2 text-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAutoAdvanced((prev) => !prev)}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
                >
                  {showAutoAdvanced ? '– Fewer Options' : '+ More Options / Trade-in & Fees (4 extra fields)'}
                </button>
              </div>

              {showAutoAdvanced && (
                <div className="space-y-3 pt-3 border-t border-slate-200 bg-slate-50/75 p-3.5 rounded-xl">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Trade-in Allowance ($)</label>
                    <input
                      type="number"
                      step={250}
                      value={autoTradeIn}
                      onChange={(e) => setAutoTradeIn(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={autoTradeInTaxCredit}
                      onChange={(e) => setAutoTradeInTaxCredit(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>Apply State Trade-In Sales Tax Credit (reduces tax)</span>
                  </label>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Sales Tax (%)</label>
                      <input
                        type="number"
                        step={0.1}
                        value={autoSalesTaxRate}
                        onChange={(e) => setAutoSalesTaxRate(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Dealer Doc Fee ($)</label>
                      <input
                        type="number"
                        step={50}
                        value={autoDealerFees}
                        onChange={(e) => setAutoDealerFees(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">DMV Title/Reg ($)</label>
                      <input
                        type="number"
                        step={25}
                        value={autoTitleReg}
                        onChange={(e) => setAutoTitleReg(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs outline-none bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Auto Loan Output */}
            <div className="lg:col-span-7 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Monthly Auto Pay
                  </span>
                  <span className="text-2xl font-black text-emerald-600 block mt-1">
                    {formatCurrency(autoCalculations.monthlyPayment)}
                  </span>
                  <span className="text-[11px] text-slate-400">For {autoLoanTermMonths} months</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Amount Financed
                  </span>
                  <span className="text-2xl font-black text-slate-800 block mt-1">
                    {formatCurrency(autoCalculations.loanPrincipal)}
                  </span>
                  <span className="text-[11px] text-slate-400">Net loan principal</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Total Financing Interest
                  </span>
                  <span className="text-2xl font-black text-rose-600 block mt-1">
                    {formatCurrency(autoCalculations.totalInterest)}
                  </span>
                  <span className="text-[11px] text-slate-400">Total finance charges</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-slate-900 border-b pb-2">Vehicle Transaction Breakdown</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Sticker / Agreed Price</span>
                    <strong className="text-slate-800">{formatCurrency(autoCalculations.price)}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">State Sales Tax ({autoSalesTaxRate}%)</span>
                    <strong className="text-slate-800">{formatCurrency(autoCalculations.salesTaxAmount)}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Dealer Documentation & Title Fees</span>
                    <strong className="text-slate-800">{formatCurrency(autoDealerFees + autoTitleReg)}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Less Down Payment & Trade-In</span>
                    <strong className="text-emerald-600">-{formatCurrency(autoDownPayment + autoTradeIn)}</strong>
                  </div>
                  <div className="flex justify-between py-1 font-bold text-sm">
                    <span className="text-slate-900">Total Out-of-Pocket Vehicle Cost</span>
                    <span className="text-slate-900">{formatCurrency(autoCalculations.grandTotalPaid)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. 401(K) & INVESTMENT CALCULATOR VIEW */}
      {/* ------------------------------------------------------------- */}
      {activeCalc === 'investment' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <PiggyBank className="w-6 h-6 text-emerald-600" />
              US 401(k) / IRA Retirement Growth Calculator
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Models employer matching, annual compound returns, IRS contribution bounds, and US CPI inflation adjustments.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Contribution & Match Plan</h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Starting Balance ($)</label>
                  <input
                    type="number"
                    step={1000}
                    value={invCurrentBalance}
                    onChange={(e) => setInvCurrentBalance(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Annual Salary ($)</label>
                  <input
                    type="number"
                    step={1000}
                    value={invAnnualSalary}
                    onChange={(e) => setInvAnnualSalary(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Employee Contrib (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={invContribPct}
                    onChange={(e) => setInvContribPct(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Investment Horizon (Yrs)</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={invYears}
                    onChange={(e) => setInvYears(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expected Return (% annual)</label>
                <input
                  type="number"
                  step={0.5}
                  value={invReturnRate}
                  onChange={(e) => setInvReturnRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Advanced Options Collapsible Accordion */}
              <div className="pt-2 text-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInvAdvanced((prev) => !prev)}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
                >
                  {showInvAdvanced ? '– Fewer Options' : '+ More Options / Employer Match & Inflation (3 extra fields)'}
                </button>
              </div>

              {showInvAdvanced && (
                <div className="space-y-3 pt-3 border-t border-slate-200 bg-slate-50/75 p-3.5 rounded-xl">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Employer Match (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={invMatchPct}
                        onChange={(e) => setInvMatchPct(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Match Cap (% salary)</label>
                      <input
                        type="number"
                        value={invMatchCap}
                        onChange={(e) => setInvMatchCap(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={invAdjustInflation}
                      onChange={(e) => setInvAdjustInflation(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>Adjust for Inflation (2.5% avg US CPI rate)</span>
                  </label>
                </div>
              )}
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Future Wealth Balance
                  </span>
                  <span className="text-2xl font-black text-emerald-600 block mt-1">
                    {formatCurrency(invCalculations.finalBalance)}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {invAdjustInflation ? 'In Today’s Dollars' : 'Nominal Value'}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Total Invested Principal
                  </span>
                  <span className="text-2xl font-black text-slate-800 block mt-1">
                    {formatCurrency(invCalculations.totalContributed)}
                  </span>
                  <span className="text-[11px] text-emerald-600">
                    Match: {formatCurrency(invCalculations.cumEmployerMatch)}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Total Compound Interest
                  </span>
                  <span className="text-2xl font-black text-blue-600 block mt-1">
                    {formatCurrency(invCalculations.totalGrowth)}
                  </span>
                  <span className="text-[11px] text-slate-400">Pure compound wealth</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Portfolio Growth vs. Capital Invested</h4>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={invCalculations.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                      <RechartsTooltip formatter={(val: any) => formatCurrency(Number(val))} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Area
                        type="monotone"
                        dataKey="balance"
                        name="Total Portfolio Value"
                        stroke="#059669"
                        fill="#059669"
                        fillOpacity={0.2}
                      />
                      <Area
                        type="monotone"
                        dataKey="invested"
                        name="Total Capital Invested"
                        stroke="#64748b"
                        strokeDasharray="4 4"
                        fill="none"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. HEALTH: BMI CALCULATOR VIEW */}
      {/* ------------------------------------------------------------- */}
      {activeCalc === 'bmi' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Scale className="w-6 h-6 text-blue-600" />
              US BMI (Body Mass Index) Calculator
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Calculates CDC classification for adults using standard US Imperial measurements (Feet, Inches, and Pounds).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Body Dimensions (US Imperial)</h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Height</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      min={3}
                      max={7}
                      value={bmiFeet}
                      onChange={(e) => setBmiFeet(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold outline-none"
                    />
                    <span className="text-[10px] text-slate-400">Feet</span>
                  </div>
                  <div>
                    <input
                      type="number"
                      min={0}
                      max={11}
                      value={bmiInches}
                      onChange={(e) => setBmiInches(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold outline-none"
                    />
                    <span className="text-[10px] text-slate-400">Inches</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Body Weight (lbs)</label>
                <input
                  type="number"
                  min={50}
                  max={600}
                  value={bmiWeightLbs}
                  onChange={(e) => setBmiWeightLbs(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold outline-none"
                />
              </div>
            </div>

            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="text-center py-4 border-b border-slate-100">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Your BMI Score</span>
                <span className="text-5xl font-black text-slate-900 block my-2">{bmiCalculations.bmi}</span>
                <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold border ${bmiCalculations.categoryColor}`}>
                  {bmiCalculations.category} &bull; {bmiCalculations.badge}
                </span>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">CDC Weight Categories</h4>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className={`p-2 rounded-lg border ${bmiCalculations.bmi < 18.5 ? 'bg-blue-100 border-blue-400 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <span>&lt; 18.5</span>
                    <span className="block text-[10px]">Underweight</span>
                  </div>
                  <div className={`p-2 rounded-lg border ${bmiCalculations.bmi >= 18.5 && bmiCalculations.bmi < 25 ? 'bg-emerald-100 border-emerald-400 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <span>18.5 - 24.9</span>
                    <span className="block text-[10px]">Normal</span>
                  </div>
                  <div className={`p-2 rounded-lg border ${bmiCalculations.bmi >= 25 && bmiCalculations.bmi < 30 ? 'bg-amber-100 border-amber-400 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <span>25 - 29.9</span>
                    <span className="block text-[10px]">Overweight</span>
                  </div>
                  <div className={`p-2 rounded-lg border ${bmiCalculations.bmi >= 30 ? 'bg-rose-100 border-rose-400 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <span>30.0+</span>
                    <span className="block text-[10px]">Obese</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                  <p>
                    <strong>Healthy Weight Range:</strong> For a height of {bmiFeet}&apos;{bmiInches}&quot;, the optimal healthy weight is between <strong>{bmiCalculations.minHealthyLbs} lbs</strong> and <strong>{bmiCalculations.maxHealthyLbs} lbs</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. HEALTH: BMR & TDEE VIEW */}
      {/* ------------------------------------------------------------- */}
      {activeCalc === 'bmr' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-600" />
              BMR & TDEE Calorie Calculator (Mifflin-St Jeor)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Computes Basal Metabolic Rate and Total Daily Energy Expenditure to determine exact calorie needs for weight maintenance, deficit, or gain.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Physical Attributes</h3>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBmrGender('male')}
                  className={`py-2 text-xs font-bold rounded-lg border cursor-pointer ${
                    bmrGender === 'male' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setBmrGender('female')}
                  className={`py-2 text-xs font-bold rounded-lg border cursor-pointer ${
                    bmrGender === 'female' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  Female
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  value={bmrAge}
                  onChange={(e) => setBmrAge(parseInt(e.target.value) || 25)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Height (Ft / In)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={bmrFeet}
                      onChange={(e) => setBmrFeet(parseInt(e.target.value) || 5)}
                      className="w-1/2 px-2 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                    <input
                      type="number"
                      value={bmrInches}
                      onChange={(e) => setBmrInches(parseInt(e.target.value) || 0)}
                      className="w-1/2 px-2 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Weight (lbs)</label>
                  <input
                    type="number"
                    value={bmrWeightLbs}
                    onChange={(e) => setBmrWeightLbs(parseFloat(e.target.value) || 150)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Daily Activity Level</label>
                <select
                  value={bmrActivity}
                  onChange={(e) => setBmrActivity(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white outline-none"
                >
                  <option value={1.2}>Sedentary (desk job, minimal exercise)</option>
                  <option value={1.375}>Lightly Active (1-3 days/week exercise)</option>
                  <option value={1.55}>Moderately Active (3-5 days/week exercise)</option>
                  <option value={1.725}>Very Active (6-7 days hard exercise)</option>
                  <option value={1.9}>Extra Active (heavy physical job or athlete)</option>
                </select>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Basal Metabolic Rate (BMR)
                  </span>
                  <span className="text-3xl font-black text-slate-900 block my-1">{bmrCalculations.bmr}</span>
                  <span className="text-[11px] text-slate-400">Calories burned at complete rest</span>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-center">
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">
                    Daily Maintenance (TDEE)
                  </span>
                  <span className="text-3xl font-black text-blue-700 block my-1">{bmrCalculations.tdee}</span>
                  <span className="text-[11px] text-blue-500">Calories to maintain current weight</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Calorie Intake Targets</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <span className="font-semibold text-emerald-800">Weight Loss (~1 lb/week deficit)</span>
                    <strong className="text-emerald-900 text-sm">{bmrCalculations.weightLoss} kcal / day</strong>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-semibold text-slate-700">Mild Weight Loss (~0.5 lb/week deficit)</span>
                    <strong className="text-slate-900 text-sm">{bmrCalculations.mildLoss} kcal / day</strong>
                  </div>
                  <div className="flex justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <span className="font-semibold text-indigo-800">Lean Muscle Gain (mild surplus)</span>
                    <strong className="text-indigo-900 text-sm">{bmrCalculations.mildSurplus} kcal / day</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. HEALTH: US NAVY BODY FAT VIEW */}
      {/* ------------------------------------------------------------- */}
      {activeCalc === 'bodyfat' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-600" />
              US Navy Body Fat % Calculator
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Computes Body Fat Percentage and Lean Body Mass using the official Department of Defense / US Navy circumference method.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Tape Measurements (Inches)</h3>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBfGender('male')}
                  className={`py-2 text-xs font-bold rounded-lg border cursor-pointer ${
                    bfGender === 'male' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setBfGender('female')}
                  className={`py-2 text-xs font-bold rounded-lg border cursor-pointer ${
                    bfGender === 'female' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  Female
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Height (Inches)</label>
                <input
                  type="number"
                  value={bfHeightInches}
                  onChange={(e) => setBfHeightInches(parseFloat(e.target.value) || 68)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Body Weight (lbs)</label>
                <input
                  type="number"
                  value={bfWeightLbs}
                  onChange={(e) => setBfWeightLbs(parseFloat(e.target.value) || 160)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Neck (Inches)</label>
                  <input
                    type="number"
                    step={0.25}
                    value={bfNeckInches}
                    onChange={(e) => setBfNeckInches(parseFloat(e.target.value) || 15)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Waist (Inches)</label>
                  <input
                    type="number"
                    step={0.25}
                    value={bfWaistInches}
                    onChange={(e) => setBfWaistInches(parseFloat(e.target.value) || 32)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {bfGender === 'female' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hips (Inches - widest point)</label>
                  <input
                    type="number"
                    step={0.25}
                    value={bfHipInches}
                    onChange={(e) => setBfHipInches(parseFloat(e.target.value) || 38)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              )}
            </div>

            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="text-center py-4 border-b border-slate-100">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                  Estimated Body Fat %
                </span>
                <span className="text-5xl font-black text-rose-600 block my-2">{bfCalculations.bodyFatPct}%</span>
                <span className="text-xs text-slate-500">Navy Protocol Standard Formula</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <span className="text-xs text-emerald-700 font-bold block">Lean Body Mass</span>
                  <span className="text-2xl font-black text-emerald-900 block mt-1">
                    {bfCalculations.leanMassLbs} lbs
                  </span>
                  <span className="text-[11px] text-emerald-600">Muscle, bones, & organs</span>
                </div>
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl">
                  <span className="text-xs text-rose-700 font-bold block">Total Fat Mass</span>
                  <span className="text-2xl font-black text-rose-900 block mt-1">{bfCalculations.fatMassLbs} lbs</span>
                  <span className="text-[11px] text-rose-600">Essential + adipose tissue</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 8. MATH: TIP & SALES TAX CALCULATOR VIEW */}
      {/* ------------------------------------------------------------- */}
      {activeCalc === 'tip' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Receipt className="w-6 h-6 text-amber-600" />
              US Tip & State Sales Tax Splitter
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Easily calculate standard US gratuity rates, add state/local sales tax, and divide the final check evenly among dining guests.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Dining Bill Details</h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Base Check Amount ($)</label>
                <input
                  type="number"
                  step={1}
                  value={tipBill}
                  onChange={(e) => setTipBill(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tip Percentage</label>
                <div className="grid grid-cols-5 gap-1.5 mb-2">
                  {[10, 15, 18, 20, 25].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setTipPctChoice(pct)}
                      className={`py-2 text-xs font-bold rounded-lg border transition cursor-pointer ${
                        tipPctChoice === pct ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sales Tax (%)</label>
                  <input
                    type="number"
                    step={0.1}
                    value={tipTaxRate}
                    onChange={(e) => setTipTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Split Among People</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={tipSplit}
                    onChange={(e) => setTipSplit(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center">
                  <span className="text-xs text-amber-700 font-bold block uppercase tracking-wider">
                    Total Per Person
                  </span>
                  <span className="text-3xl font-black text-amber-900 block mt-1">
                    {formatCurrency(tipCalculations.perPerson, 2)}
                  </span>
                  <span className="text-[11px] text-amber-600">Base, tax, and tip included</span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                  <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">
                    Grand Total Bill
                  </span>
                  <span className="text-3xl font-black text-slate-900 block mt-1">
                    {formatCurrency(tipCalculations.grandTotal, 2)}
                  </span>
                  <span className="text-[11px] text-slate-400">Total check amount</span>
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-100 pt-4">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">Subtotal</span>
                  <strong className="text-slate-800">{formatCurrency(tipCalculations.bill, 2)}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">Sales Tax ({tipTaxRate}%)</span>
                  <strong className="text-slate-800">{formatCurrency(tipCalculations.taxAmt, 2)}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">Gratuity Tip ({tipPctChoice}%)</span>
                  <strong className="text-amber-600 font-bold">{formatCurrency(tipCalculations.tipAmt, 2)}</strong>
                </div>
                <div className="flex justify-between py-1 font-bold text-sm">
                  <span className="text-slate-900">Total Bill</span>
                  <span className="text-slate-900">{formatCurrency(tipCalculations.grandTotal, 2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
