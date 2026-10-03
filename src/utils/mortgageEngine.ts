/**
 * US Mortgage Calculator Engine (Calculator.net Replica)
 * Hooks into all 12 input IDs:
 * 1. homePrice
 * 2. downPaymentPercent
 * 3. downPaymentDollar
 * 4. interestRate
 * 5. loanTerm
 * 6. startDate
 * 7. propertyTax
 * 8. homeInsurance
 * 9. pmiRate
 * 10. hoaFee
 * 11. extraMonthly
 * 12. extraYearly
 */

export interface MortgageInputState {
  homePrice: number;
  downPaymentPercent: number;
  downPaymentDollar: number;
  interestRate: number;
  loanTermYears: number;
  startMonth: string;
  startYear: number;
  propertyTaxVal: number;
  homeInsuranceVal: number;
  pmiRateVal: number;
  hoaFeeVal: number;
  extraMonthlyVal: number;
  extraYearlyVal: number;
}

export interface MonthlyAmortizationRow {
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
}

export function calculateMortgageEngine(inputs: MortgageInputState) {
  const price = Math.max(0, inputs.homePrice);
  const downDollar = Math.max(0, inputs.downPaymentDollar);
  const loanAmt = Math.max(0, price - downDollar);
  const annualRate = Math.max(0, inputs.interestRate) / 100;
  const monthlyRate = annualRate / 12;
  const totalMonths = Math.max(1, inputs.loanTermYears * 12);

  // 1. Monthly Principal & Interest (P&I)
  let monthlyPI = 0;
  if (monthlyRate > 0 && totalMonths > 0) {
    monthlyPI = (loanAmt * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
  } else if (totalMonths > 0) {
    monthlyPI = loanAmt / totalMonths;
  }

  // 2. Monthly Property Tax, Insurance, PMI, HOA
  const monthlyPropertyTax = (price * (inputs.propertyTaxVal / 100)) / 12;
  const monthlyHomeInsurance = inputs.homeInsuranceVal / 12;
  const monthlyHoa = inputs.hoaFeeVal;

  const initialLtv = price > 0 ? (loanAmt / price) * 100 : 0;
  const isPmiRequired = initialLtv > 80;
  const pmiCancellationThreshold = price * 0.78; // Auto-cancels at 78% LTV balance
  const initialMonthlyPmi = isPmiRequired ? (loanAmt * (inputs.pmiRateVal / 100)) / 12 : 0;

  const totalMonthlyPayment = monthlyPI + monthlyPropertyTax + monthlyHomeInsurance + initialMonthlyPmi + monthlyHoa;

  // 3. Full 360-Month Amortization Schedule & Acceleration Calculation
  const monthsNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const startMonthIdx = Math.max(0, monthsNames.indexOf(inputs.startMonth));

  let balance = loanAmt;
  let cumInterestPaid = 0;
  let cumPmiPaid = 0;
  let cumPrincipalPaid = 0;

  const schedule: MonthlyAmortizationRow[] = [];
  let actualPayoffMonth = totalMonths;

  for (let m = 1; m <= totalMonths && balance > 0.001; m++) {
    const begBal = balance;
    const curMonthIdx = (startMonthIdx + m - 1) % 12;
    const curYear = inputs.startYear + Math.floor((startMonthIdx + m - 1) / 12);
    const dateStr = `${monthsNames[curMonthIdx]} ${curYear}`;

    // Monthly Interest & Regular Principal
    const monthInterest = monthlyRate > 0 ? balance * monthlyRate : 0;
    const regularPrincipal = Math.min(balance, Math.max(0, monthlyPI - monthInterest));

    // PMI Auto-Cancellation Check at 78% LTV
    let monthPmi = 0;
    if (isPmiRequired && begBal > pmiCancellationThreshold) {
      monthPmi = initialMonthlyPmi;
    }

    // Extra Payments (Monthly + Yearly on Anniversary)
    let extraThisMonth = inputs.extraMonthlyVal;
    if (m % 12 === 0) {
      extraThisMonth += inputs.extraYearlyVal;
    }

    const maxAllowedExtra = Math.max(0, balance - regularPrincipal);
    extraThisMonth = Math.min(extraThisMonth, maxAllowedExtra);

    const totalPrincipalThisMonth = regularPrincipal + extraThisMonth;
    const totalPaymentThisMonth = totalPrincipalThisMonth + monthInterest + monthPmi + monthlyPropertyTax + monthlyHomeInsurance + monthlyHoa;

    balance = Math.max(0, balance - totalPrincipalThisMonth);
    cumInterestPaid += monthInterest;
    cumPmiPaid += monthPmi;
    cumPrincipalPaid += totalPrincipalThisMonth;

    schedule.push({
      monthIndex: m,
      dateStr,
      beginningBalance: Math.round(begBal),
      payment: Math.round(totalPaymentThisMonth),
      principal: Math.round(regularPrincipal),
      interest: Math.round(monthInterest),
      extraPrincipal: Math.round(extraThisMonth),
      pmiPaid: Math.round(monthPmi),
      totalInterestToDate: Math.round(cumInterestPaid),
      endingBalance: Math.round(balance),
    });

    if (balance <= 0 && actualPayoffMonth === totalMonths) {
      actualPayoffMonth = m;
    }
  }

  // Payoff Date String
  const endPayoffYear = inputs.startYear + Math.floor((startMonthIdx + actualPayoffMonth) / 12);
  const endPayoffMonthIdx = (startMonthIdx + actualPayoffMonth) % 12;
  const payoffDateStr = `${monthsNames[endPayoffMonthIdx]} ${endPayoffYear}`;

  return {
    loanAmt,
    initialLtv,
    monthlyPI,
    monthlyPropertyTax,
    monthlyHomeInsurance,
    initialMonthlyPmi,
    monthlyHoa,
    totalMonthlyPayment,
    totalInterestPaid: cumInterestPaid,
    totalPmiPaid: cumPmiPaid,
    payoffDateStr,
    monthsSaved: totalMonths - actualPayoffMonth,
    schedule,
  };
}

/**
 * Generates CSV content string from amortization schedule
 */
export function exportToCsv(schedule: MonthlyAmortizationRow[]): string {
  const headers = 'Month #,Date,Payment,Principal,Interest,Extra Principal,Total Interest,Remaining Balance\n';
  const rows = schedule
    .map(
      (r) =>
        `${r.monthIndex},"${r.dateStr}",$${r.payment},"$${r.principal}","$${r.interest}","$${r.extraPrincipal}","$${r.totalInterestToDate}","$${r.endingBalance}"`
    )
    .join('\n');
  return headers + rows;
}
