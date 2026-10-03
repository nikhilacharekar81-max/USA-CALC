/**
 * Standardized Financial & Mathematical Engine (Calculator.net Specification)
 * Enforces:
 * 1. Precision Compounding & Fee Subtraction (Net Rate = Return % - Expense Ratio %).
 * 2. Deposit Timing Precision (End of Period vs. Beginning of Period).
 * 3. Out-of-pocket Principal tracking (Initial Deposit + Total Monthly Contributions + Total Annual Contributions).
 * 4. Distinct Monthly vs. Annual Contribution Compounding Logic.
 * 5. Present Purchasing Power Discounting: Real Present Value = Nominal Future Value / ((1 + Inflation Rate)^Years).
 * 6. Strict Balance Identity: Invested Principal + Compound Interest / Earnings = Total Nominal Future Value.
 */

export interface MathContext {
  [key: string]: number;
}

/**
 * Safely evaluates mathematical expressions with variables and built-in functions
 */
export function evaluateFormula(formula: string, context: MathContext): number {
  if (!formula || typeof formula !== 'string') return 0;

  try {
    const scope: { [key: string]: number | ((...args: number[]) => number) } = {
      PI: Math.PI,
      E: Math.E,
      pow: (x: number, y: number) => Math.pow(x, y),
      sqrt: (x: number) => Math.sqrt(Math.max(0, x)),
      abs: (x: number) => Math.abs(x),
      min: (...args: number[]) => Math.min(...args),
      max: (...args: number[]) => Math.max(...args),
      round: (x: number, dec = 2) => {
        const factor = Math.pow(10, dec);
        return Math.round(x * factor) / factor;
      },
      floor: (x: number) => Math.floor(x),
      ceil: (x: number) => Math.ceil(x),
      log: (x: number) => Math.log10(Math.max(0.000001, x)),
      ln: (x: number) => Math.log(Math.max(0.000001, x)),
      exp: (x: number) => Math.exp(x),
      ...context,
    };

    const keys = Object.keys(scope).sort((a, b) => b.length - a.length);
    const argNames = keys;
    const argValues = keys.map((k) => scope[k]);

    const fn = new Function(...argNames, `"use strict"; return (${formula});`);
    const result = fn(...argValues);

    if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
      return 0;
    }

    return result;
  } catch {
    return 0;
  }
}

/**
 * 1. PRINCIPAL & CONTRIBUTION TRACKING
 * Out-of-pocket Invested Principal = Initial Deposit + (Monthly Deposit * 12 * Years) + (Annual Deposit * Years)
 */
export function calculateTotalInvestedPrincipal(
  initialPrincipal: number,
  monthlyContribution = 0,
  annualContribution = 0,
  years = 0
): number {
  const init = Math.max(0, initialPrincipal);
  const mContrib = Math.max(0, monthlyContribution);
  const aContrib = Math.max(0, annualContribution);
  const y = Math.max(0, years);

  return init + (mContrib * 12 * y) + (aContrib * y);
}

/**
 * Employer Match calculation
 * Annual Match = MIN(Employee Contribution Amount, Salary * Match Cap %) * Match %
 * Total Match = Annual Match * Years
 */
export function calculateEmployerMatch(
  employeeAnnualContrib: number,
  annualSalary: number,
  matchCapPct: number,
  matchPct: number,
  years: number
): { annualMatch: number; totalMatch: number } {
  const contrib = Math.max(0, employeeAnnualContrib);
  const salary = Math.max(0, annualSalary);
  const cap = Math.max(0, matchCapPct) / 100;
  const matchRatio = Math.max(0, matchPct) / 100;
  const y = Math.max(0, years);

  const eligibleBase = Math.min(contrib, salary * cap);
  const annualMatch = eligibleBase * matchRatio;
  const totalMatch = annualMatch * y;

  return { annualMatch, totalMatch };
}

/**
 * 2. INFLATION DISCOUNTING ("Today's Dollars")
 * Real Present Value ("Today's Dollars") = Nominal Future Value / ((1 + Inflation Rate)^Years)
 */
export function calculateInflationAdjustedValue(
  nominalFutureValue: number,
  annualInflationRatePct: number,
  years: number
): number {
  const fv = Math.max(0, nominalFutureValue);
  const inf = Math.max(0, annualInflationRatePct) / 100;
  const y = Math.max(0, years);

  if (inf <= 0 || y <= 0) return fv;
  return fv / Math.pow(1 + inf, y);
}

/**
 * 3. COMPOUNDING, FEE SUBTRACTION & TIMING WITH SEPARATE MONTHLY AND ANNUAL CONTRIBUTIONS
 * Net Rate = Return Rate % - Expense Ratio %
 * Supports End of Period (Annuity Immediate) vs. Beginning of Period (Annuity Due)
 */
export function calculateNominalFutureValue(
  initialPrincipal: number,
  monthlyContribution = 0,
  annualContribution = 0,
  annualReturnRatePct = 0,
  years = 0,
  expenseRatioPct = 0,
  timing: 'end' | 'beginning' = 'end'
): {
  netReturnRatePct: number;
  fvInitial: number;
  fvMonthlyDeposits: number;
  fvAnnualDeposits: number;
  totalNominalFV: number;
  totalInvestedPrincipal: number;
  totalCompoundInterest: number;
} {
  const p = Math.max(0, initialPrincipal);
  const m = Math.max(0, monthlyContribution);
  const a = Math.max(0, annualContribution);
  const grossRate = Math.max(0, annualReturnRatePct);
  const feeRate = Math.max(0, expenseRatioPct);
  const netReturnRatePct = Math.max(0, grossRate - feeRate);
  const rNet = netReturnRatePct / 100;
  const t = Math.max(0, years);

  const monthlyRate = rNet / 12;
  const totalMonths = Math.round(t * 12);

  let fvInitial = p;
  let fvMonthlyDeposits = 0;
  let fvAnnualDeposits = 0;

  if (t > 0) {
    // 1. Initial Principal Compounding
    if (monthlyRate > 0) {
      fvInitial = p * Math.pow(1 + monthlyRate, totalMonths);
    } else {
      fvInitial = p;
    }

    // 2. Monthly Contribution Compounding
    if (totalMonths > 0 && m > 0) {
      if (monthlyRate > 0) {
        const monthlyAnnuityFactor = (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate;
        fvMonthlyDeposits = m * monthlyAnnuityFactor * (timing === 'beginning' ? (1 + monthlyRate) : 1);
      } else {
        fvMonthlyDeposits = m * totalMonths;
      }
    }

    // 3. Annual Contribution Compounding
    if (a > 0) {
      if (rNet > 0) {
        const annualAnnuityFactor = (Math.pow(1 + rNet, t) - 1) / rNet;
        fvAnnualDeposits = a * annualAnnuityFactor * (timing === 'beginning' ? (1 + rNet) : 1);
      } else {
        fvAnnualDeposits = a * t;
      }
    }
  }

  const totalNominalFV = fvInitial + fvMonthlyDeposits + fvAnnualDeposits;
  const totalInvestedPrincipal = calculateTotalInvestedPrincipal(p, m, a, t);
  const totalCompoundInterest = Math.max(0, totalNominalFV - totalInvestedPrincipal);

  return {
    netReturnRatePct,
    fvInitial,
    fvMonthlyDeposits,
    fvAnnualDeposits,
    totalNominalFV,
    totalInvestedPrincipal,
    totalCompoundInterest,
  };
}

/**
 * Annuity Growth & Payout Calculation
 */
export function calculateAnnuityPayoutAndGrowth(
  startingBalance: number,
  monthlyContribution = 0,
  annualContribution = 0,
  annualReturnPct = 0,
  expenseRatioPct = 0,
  years = 0,
  inflationPct = 0,
  timing: 'end' | 'beginning' = 'end'
): {
  netReturnRatePct: number;
  nominalFutureValue: number;
  realPresentValue: number;
  totalInvestedPrincipal: number;
  totalCompoundInterest: number;
} {
  const res = calculateNominalFutureValue(
    startingBalance,
    monthlyContribution,
    annualContribution,
    annualReturnPct,
    years,
    expenseRatioPct,
    timing
  );

  const realPresentValue = calculateInflationAdjustedValue(res.totalNominalFV, inflationPct, years);

  return {
    netReturnRatePct: res.netReturnRatePct,
    nominalFutureValue: res.totalNominalFV,
    realPresentValue,
    totalInvestedPrincipal: res.totalInvestedPrincipal,
    totalCompoundInterest: res.totalCompoundInterest,
  };
}

/**
 * Amortization Schedule Entry Interface
 */
export interface ScheduleEntry {
  period: number;
  year: number;
  month: number;
  dateStr: string;
  beginningBalance: number;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  extraPayment: number;
  endingBalance: number;
  totalInterestPaidToDate: number;
}

/**
 * Amortization Schedule Generator
 */
export function generateAmortizationSchedule(
  principal: number,
  annualInterestRate: number,
  termYears: number,
  extraMonthlyPayment = 0,
  extraYearlyPayment = 0,
  extraOneTimePayments: Array<{ monthIndex: number; amount: number }> = [],
  startMonth = 1,
  startYear = 2026
): {
  monthlySchedule: ScheduleEntry[];
  annualSchedule: ScheduleEntry[];
  payoffMonths: number;
  totalPrincipalPaid: number;
  totalInterestPaid: number;
  totalExtraPaid: number;
  totalPayments: number;
} {
  const p = Math.max(0, principal);
  const r = annualInterestRate / 100 / 12;
  const totalMonths = Math.max(1, termYears * 12);

  let baseMonthlyPayment = 0;
  if (r > 0) {
    baseMonthlyPayment = (p * (r * Math.pow(1 + r, totalMonths))) / (Math.pow(1 + r, totalMonths) - 1);
  } else {
    baseMonthlyPayment = p / totalMonths;
  }

  const monthlySchedule: ScheduleEntry[] = [];
  let balance = p;
  let cumInterest = 0;
  let cumExtra = 0;
  let currentMonth = startMonth;
  let currentYear = startYear;

  const oneTimeMap = new Map<number, number>();
  extraOneTimePayments.forEach((op) => {
    oneTimeMap.set(op.monthIndex, (oneTimeMap.get(op.monthIndex) || 0) + op.amount);
  });

  for (let m = 1; m <= totalMonths && balance > 0.001; m++) {
    const begBalance = balance;
    const interest = r > 0 ? balance * r : 0;
    const regularPrincipal = Math.min(balance, Math.max(0, baseMonthlyPayment - interest));

    let extra = extraMonthlyPayment;
    if (m % 12 === 0) {
      extra += extraYearlyPayment;
    }
    const oneTime = oneTimeMap.get(m) || 0;
    extra += oneTime;

    const maxAllowedExtra = Math.max(0, balance - regularPrincipal);
    extra = Math.min(extra, maxAllowedExtra);

    const principalPaid = regularPrincipal + extra;
    const totalMonthPayment = principalPaid + interest;
    balance = Math.max(0, balance - principalPaid);
    cumInterest += interest;
    cumExtra += extra;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateStr = `${monthNames[(currentMonth - 1) % 12]} ${currentYear}`;

    monthlySchedule.push({
      period: m,
      year: currentYear,
      month: currentMonth,
      dateStr,
      beginningBalance: begBalance,
      payment: totalMonthPayment,
      principalPaid,
      interestPaid: interest,
      extraPayment: extra,
      endingBalance: balance,
      totalInterestPaidToDate: cumInterest,
    });

    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }

  const annualSchedule: ScheduleEntry[] = [];
  const yearsMap = new Map<number, ScheduleEntry[]>();
  monthlySchedule.forEach((entry) => {
    const arr = yearsMap.get(entry.year) || [];
    arr.push(entry);
    yearsMap.set(entry.year, arr);
  });

  let annualIndex = 1;
  yearsMap.forEach((entries, yr) => {
    const first = entries[0];
    const last = entries[entries.length - 1];
    const totalPmt = entries.reduce((s, e) => s + e.payment, 0);
    const totalPrinc = entries.reduce((s, e) => s + e.principalPaid, 0);
    const totalInt = entries.reduce((s, e) => s + e.interestPaid, 0);
    const totalEx = entries.reduce((s, e) => s + e.extraPayment, 0);

    annualSchedule.push({
      period: annualIndex++,
      year: yr,
      month: 12,
      dateStr: `${yr}`,
      beginningBalance: first.beginningBalance,
      payment: totalPmt,
      principalPaid: totalPrinc,
      interestPaid: totalInt,
      extraPayment: totalEx,
      endingBalance: last.endingBalance,
      totalInterestPaidToDate: last.totalInterestPaidToDate,
    });
  });

  const totalPrincPaid = monthlySchedule.reduce((s, e) => s + e.principalPaid, 0);
  const totalIntPaid = monthlySchedule.reduce((s, e) => s + e.interestPaid, 0);

  return {
    monthlySchedule,
    annualSchedule,
    payoffMonths: monthlySchedule.length,
    totalPrincipalPaid: totalPrincPaid,
    totalInterestPaid: totalIntPaid,
    totalExtraPaid: cumExtra,
    totalPayments: totalPrincPaid + totalIntPaid,
  };
}

/**
 * Standardized Compound Growth / Investment Schedule
 */
export function generateInvestmentSchedule(
  initialPrincipal: number,
  monthlyContribution = 0,
  annualContribution = 0,
  annualReturnRatePct = 0,
  years = 0,
  annualInflationRatePct = 0,
  expenseRatioPct = 0,
  timing: 'end' | 'beginning' = 'end'
): {
  annualSchedule: Array<{
    year: number;
    startingBalance: number;
    contribution: number;
    growth: number;
    endingBalance: number;
    inflationAdjustedBalance: number;
  }>;
  finalBalance: number;
  totalContributed: number;
  totalGrowth: number;
  realPresentValue: number;
  netReturnRatePct: number;
} {
  const p = Math.max(0, initialPrincipal);
  const m = Math.max(0, monthlyContribution);
  const a = Math.max(0, annualContribution);
  const grossRate = Math.max(0, annualReturnRatePct);
  const feeRate = Math.max(0, expenseRatioPct);
  const netReturnRatePct = Math.max(0, grossRate - feeRate);
  const rNet = netReturnRatePct / 100;

  const totalYears = Math.max(1, years);
  const monthlyRate = rNet / 12;

  let currentBalance = p;
  let cumInvested = p;
  const annualSchedule = [];

  for (let yr = 1; yr <= totalYears; yr++) {
    const startBal = currentBalance;

    // Inject Annual Contribution at beginning of year if timing is 'beginning'
    if (timing === 'beginning' && a > 0) {
      currentBalance += a;
    }

    // Monthly compounding loop
    for (let sub = 0; sub < 12; sub++) {
      if (timing === 'beginning') {
        currentBalance = (currentBalance + m) * (1 + monthlyRate);
      } else {
        currentBalance = currentBalance * (1 + monthlyRate) + m;
      }
    }

    // Inject Annual Contribution at end of year if timing is 'end'
    if (timing === 'end' && a > 0) {
      currentBalance += a;
    }

    const yearCashInvested = (m * 12) + a;
    const yearGrowth = Math.max(0, currentBalance - startBal - yearCashInvested);
    cumInvested += yearCashInvested;

    const discountFactor = Math.pow(1 + Math.max(0, annualInflationRatePct) / 100, yr);
    const inflationAdjusted = currentBalance / discountFactor;

    annualSchedule.push({
      year: yr,
      startingBalance: startBal,
      contribution: yearCashInvested,
      growth: yearGrowth,
      endingBalance: currentBalance,
      inflationAdjustedBalance: inflationAdjusted,
    });
  }

  const finalBalance = currentBalance;
  const totalContributed = cumInvested; // Out-of-pocket deposits ONLY
  const totalGrowth = Math.max(0, finalBalance - totalContributed);
  const realPresentValue = calculateInflationAdjustedValue(finalBalance, annualInflationRatePct, totalYears);

  return {
    annualSchedule,
    finalBalance,
    totalContributed,
    totalGrowth,
    realPresentValue,
    netReturnRatePct,
  };
}

/**
 * Currency & Percent Formatters
 */
export function formatCurrencyValue(val: number, currencySymbol = '$', decimals = 2): string {
  if (isNaN(val) || !isFinite(val)) return `${currencySymbol}0.00`;
  const formatted = Math.abs(val).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return val < 0 ? `-${currencySymbol}${formatted}` : `${currencySymbol}${formatted}`;
}

export function formatPercentValue(val: number, decimals = 2): string {
  if (isNaN(val) || !isFinite(val)) return '0.00%';
  return `${val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}%`;
}
