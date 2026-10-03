import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../data/db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Comprehensive dictionary for full Calculator.net definitions
const CALCULATOR_DEFINITIONS = {
  'mortgage-calculator': {
    shortDescription: 'Calculate your monthly mortgage payment including principal and interest, property taxes, homeowners insurance, PMI, and HOA fees with amortization schedule.',
    fields: [
      { id: 'homePrice', label: 'Home Price', type: 'number', defaultValue: 400000, prefix: '$', min: 10000, max: 20000000, step: 5000, helpText: 'Purchase price of the home', isAdvanced: false },
      { id: 'downPayment', label: 'Down Payment ($)', type: 'number', defaultValue: 80000, prefix: '$', min: 0, max: 10000000, step: 1000, helpText: 'Cash payment towards purchase (20% avoids PMI)', isAdvanced: false },
      { id: 'loanTerm', label: 'Loan Term (Years)', type: 'select', defaultValue: 30, options: [{ label: '30 Years Fixed', value: 30 }, { label: '20 Years Fixed', value: 20 }, { label: '15 Years Fixed', value: 15 }, { label: '10 Years Fixed', value: 10 }, { label: '7 Years Fixed', value: 7 }, { label: '5 Years Fixed', value: 5 }], suffix: 'years', isAdvanced: false },
      { id: 'interestRate', label: 'Interest Rate (%)', type: 'number', defaultValue: 6.75, suffix: '%', min: 0.1, max: 25, step: 0.05, helpText: 'Annual fixed mortgage interest rate', isAdvanced: false },
      { id: 'propertyTax', label: 'Property Tax ($/year)', type: 'number', defaultValue: 4800, prefix: '$', suffix: '/yr', min: 0, max: 100000, step: 100, helpText: 'Annual property tax assessed by local government (avg ~1.2%)', isAdvanced: true },
      { id: 'homeInsurance', label: 'Homeowners Insurance ($/year)', type: 'number', defaultValue: 1500, prefix: '$', suffix: '/yr', min: 0, max: 25000, step: 50, helpText: 'Annual hazard / home insurance premium', isAdvanced: true },
      { id: 'pmiRate', label: 'PMI Rate (%)', type: 'number', defaultValue: 0.85, suffix: '%', min: 0, max: 5, step: 0.05, helpText: 'Private Mortgage Insurance required if down payment < 20%', isAdvanced: true },
      { id: 'hoaFee', label: 'HOA Fee ($/month)', type: 'number', defaultValue: 50, prefix: '$', suffix: '/mo', min: 0, max: 5000, step: 10, helpText: 'Monthly Homeowners Association fees (if applicable)', isAdvanced: true },
      { id: 'otherCosts', label: 'Other Costs ($/year)', type: 'number', defaultValue: 0, prefix: '$', suffix: '/yr', min: 0, max: 25000, step: 50, helpText: 'Flood insurance or other municipal special assessments', isAdvanced: true },
      { id: 'extraPayment', label: 'Extra Monthly Payment ($)', type: 'number', defaultValue: 0, prefix: '$', suffix: '/mo', min: 0, max: 50000, step: 50, helpText: 'Additional monthly principal payment to accelerate payoff', isAdvanced: true }
    ],
    outputs: [
      { id: 'monthlyPayment', label: 'Total Monthly Payment', formula: '((homePrice - downPayment) > 0 ? ((homePrice - downPayment) * ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), loanTerm * 12)) / (pow(1 + (interestRate / 100 / 12), loanTerm * 12) - 1)) : 0) + (propertyTax / 12) + (homeInsurance / 12) + ((downPayment < homePrice * 0.2) ? ((homePrice - downPayment) * (pmiRate / 100 / 12)) : 0) + hoaFee + (otherCosts / 12) + extraPayment', format: 'currency', prefix: '$', highlight: true, description: 'Total monthly payment including P&I, taxes, insurance, and fees' },
      { id: 'monthlyPI', label: 'Monthly Principal & Interest', formula: '(homePrice - downPayment) > 0 ? ((homePrice - downPayment) * ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), loanTerm * 12)) / (pow(1 + (interestRate / 100 / 12), loanTerm * 12) - 1)) : 0', format: 'currency', prefix: '$', description: 'Monthly loan amortization portion' },
      { id: 'loanAmount', label: 'Total Loan Amount', formula: 'homePrice - downPayment', format: 'currency', prefix: '$', description: 'Net borrowed principal balance' },
      { id: 'monthlyTax', label: 'Monthly Property Tax', formula: 'propertyTax / 12', format: 'currency', prefix: '$' },
      { id: 'monthlyInsurance', label: 'Monthly Home Insurance', formula: 'homeInsurance / 12', format: 'currency', prefix: '$' },
      { id: 'monthlyPMI', label: 'Monthly PMI', formula: '(downPayment < homePrice * 0.2) ? ((homePrice - downPayment) * (pmiRate / 100 / 12)) : 0', format: 'currency', prefix: '$' },
      { id: 'totalInterest', label: 'Total Interest Paid', formula: '(((homePrice - downPayment) * ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), loanTerm * 12)) / (pow(1 + (interestRate / 100 / 12), loanTerm * 12) - 1)) * (loanTerm * 12)) - (homePrice - downPayment)', format: 'currency', prefix: '$' },
      { id: 'totalPayments', label: 'Total Cost Over Loan Life', formula: '(((homePrice - downPayment) * ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), loanTerm * 12)) / (pow(1 + (interestRate / 100 / 12), loanTerm * 12) - 1)) * (loanTerm * 12)) + (propertyTax * loanTerm) + (homeInsurance * loanTerm) + (hoaFee * 12 * loanTerm) + (otherCosts * loanTerm)', format: 'currency', prefix: '$' }
    ]
  },

  'auto-loan-calculator': {
    shortDescription: 'Calculate monthly auto loan payments, total interest, sales tax, fees, and total purchase cost with trade-in value support.',
    fields: [
      { id: 'autoPrice', label: 'Vehicle Price', type: 'number', defaultValue: 35000, prefix: '$', min: 1000, max: 500000, step: 500, helpText: 'Negotiated purchase price of the vehicle', isAdvanced: false },
      { id: 'downPayment', label: 'Cash Down Payment', type: 'number', defaultValue: 5000, prefix: '$', min: 0, max: 200000, step: 250, helpText: 'Upfront cash paid at purchase', isAdvanced: false },
      { id: 'loanTermMonths', label: 'Loan Term (Months)', type: 'select', defaultValue: 60, options: [{ label: '24 Months (2 Yrs)', value: 24 }, { label: '36 Months (3 Yrs)', value: 36 }, { label: '48 Months (4 Yrs)', value: 48 }, { label: '60 Months (5 Yrs)', value: 60 }, { label: '72 Months (6 Yrs)', value: 72 }, { label: '84 Months (7 Yrs)', value: 84 }], suffix: 'months', isAdvanced: false },
      { id: 'interestRate', label: 'Interest Rate (%)', type: 'number', defaultValue: 5.99, suffix: '%', min: 0.1, max: 30, step: 0.1, helpText: 'Annual Percentage Rate (APR) on the auto loan', isAdvanced: false },
      { id: 'tradeInValue', label: 'Trade-in Value', type: 'number', defaultValue: 4000, prefix: '$', min: 0, max: 200000, step: 250, helpText: 'Dealer trade-in allowance for your current vehicle', isAdvanced: true },
      { id: 'amountOwedOnTrade', label: 'Amount Owed on Trade-in', type: 'number', defaultValue: 1000, prefix: '$', min: 0, max: 200000, step: 250, helpText: 'Outstanding balance on existing trade-in loan', isAdvanced: true },
      { id: 'salesTaxRate', label: 'Sales Tax Rate (%)', type: 'number', defaultValue: 7.0, suffix: '%', min: 0, max: 20, step: 0.1, helpText: 'State and local vehicle sales tax rate', isAdvanced: true },
      { id: 'dealerFees', label: 'Title, Registration & Dealer Fees', type: 'number', defaultValue: 850, prefix: '$', min: 0, max: 10000, step: 50, helpText: 'Documentation, title, plate and dealer registration fees', isAdvanced: true }
    ],
    outputs: [
      { id: 'monthlyPayment', label: 'Monthly Payment', formula: '((autoPrice - (tradeInValue - amountOwedOnTrade) + (autoPrice * salesTaxRate / 100) + dealerFees - downPayment) > 0 ? ((autoPrice - (tradeInValue - amountOwedOnTrade) + (autoPrice * salesTaxRate / 100) + dealerFees - downPayment) * ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), loanTermMonths)) / (pow(1 + (interestRate / 100 / 12), loanTermMonths) - 1)) : 0)', format: 'currency', prefix: '$', highlight: true, description: 'Monthly auto loan installment' },
      { id: 'totalLoanAmount', label: 'Total Loan Amount Financed', formula: 'max(0, autoPrice - (tradeInValue - amountOwedOnTrade) + (autoPrice * salesTaxRate / 100) + dealerFees - downPayment)', format: 'currency', prefix: '$' },
      { id: 'salesTaxAmount', label: 'Sales Tax Paid', formula: 'autoPrice * salesTaxRate / 100', format: 'currency', prefix: '$' },
      { id: 'totalInterest', label: 'Total Loan Interest', formula: '(((autoPrice - (tradeInValue - amountOwedOnTrade) + (autoPrice * salesTaxRate / 100) + dealerFees - downPayment) * ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), loanTermMonths)) / (pow(1 + (interestRate / 100 / 12), loanTermMonths) - 1)) * loanTermMonths) - (autoPrice - (tradeInValue - amountOwedOnTrade) + (autoPrice * salesTaxRate / 100) + dealerFees - downPayment)', format: 'currency', prefix: '$' },
      { id: 'totalCost', label: 'Total Vehicle Cost', formula: 'downPayment + (tradeInValue - amountOwedOnTrade) + (((autoPrice - (tradeInValue - amountOwedOnTrade) + (autoPrice * salesTaxRate / 100) + dealerFees - downPayment) * ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), loanTermMonths)) / (pow(1 + (interestRate / 100 / 12), loanTermMonths) - 1)) * loanTermMonths)', format: 'currency', prefix: '$' }
    ]
  },

  'loan-calculator': {
    shortDescription: 'Compute monthly loan payments, total payments, and total interest for personal, consumer, or term loans.',
    fields: [
      { id: 'loanAmount', label: 'Loan Amount', type: 'number', defaultValue: 20000, prefix: '$', min: 500, max: 2000000, step: 500, helpText: 'Total amount borrowed', isAdvanced: false },
      { id: 'loanTermYears', label: 'Loan Term (Years)', type: 'number', defaultValue: 5, suffix: 'years', min: 1, max: 40, step: 1, helpText: 'Repayment period in years', isAdvanced: false },
      { id: 'interestRate', label: 'Interest Rate (%)', type: 'number', defaultValue: 7.5, suffix: '%', min: 0.1, max: 40, step: 0.1, helpText: 'Fixed annual interest rate', isAdvanced: false },
      { id: 'originationFee', label: 'Origination & Processing Fee ($)', type: 'number', defaultValue: 300, prefix: '$', min: 0, max: 20000, step: 50, helpText: 'Upfront lender fee deducted or added to principal', isAdvanced: true },
      { id: 'extraPayment', label: 'Extra Monthly Payment ($)', type: 'number', defaultValue: 0, prefix: '$', min: 0, max: 10000, step: 25, helpText: 'Additional monthly principal payment', isAdvanced: true }
    ],
    outputs: [
      { id: 'monthlyPayment', label: 'Monthly Payment', formula: '(loanAmount * ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), loanTermYears * 12)) / (pow(1 + (interestRate / 100 / 12), loanTermYears * 12) - 1)) + extraPayment', format: 'currency', prefix: '$', highlight: true },
      { id: 'totalInterest', label: 'Total Interest', formula: '((loanAmount * ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), loanTermYears * 12)) / (pow(1 + (interestRate / 100 / 12), loanTermYears * 12) - 1)) * loanTermYears * 12) - loanAmount', format: 'currency', prefix: '$' },
      { id: 'totalPayment', label: 'Total of All Payments', formula: '((loanAmount * ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), loanTermYears * 12)) / (pow(1 + (interestRate / 100 / 12), loanTermYears * 12) - 1)) * loanTermYears * 12) + originationFee', format: 'currency', prefix: '$' }
    ]
  },

  'compound-interest-calculator': {
    shortDescription: 'Calculate compound interest on investments, savings, or deposits with regular contributions and flexible compound frequencies.',
    fields: [
      { id: 'initialPrincipal', label: 'Initial Principal / Deposit', type: 'number', defaultValue: 10000, prefix: '$', min: 0, max: 100000000, step: 500, helpText: 'Starting balance', isAdvanced: false },
      { id: 'monthlyContribution', label: 'Monthly Contribution', type: 'number', defaultValue: 500, prefix: '$', min: 0, max: 1000000, step: 50, helpText: 'Additional amount invested each month', isAdvanced: false },
      { id: 'investmentYears', label: 'Investment Horizon (Years)', type: 'number', defaultValue: 10, suffix: 'years', min: 1, max: 60, step: 1, helpText: 'Number of years to grow', isAdvanced: false },
      { id: 'annualReturn', label: 'Estimated Annual Return (%)', type: 'number', defaultValue: 8.0, suffix: '%', min: 0.1, max: 50, step: 0.1, helpText: 'Expected annual growth or interest rate', isAdvanced: false },
      { id: 'compoundFreq', label: 'Compound Frequency', type: 'select', defaultValue: 12, options: [{ label: 'Monthly (12/yr)', value: 12 }, { label: 'Quarterly (4/yr)', value: 4 }, { label: 'Annually (1/yr)', value: 1 }, { label: 'Daily (365/yr)', value: 365 }], isAdvanced: true },
      { id: 'inflationRate', label: 'Annual Inflation Rate (%)', type: 'number', defaultValue: 2.5, suffix: '%', min: 0, max: 20, step: 0.1, helpText: 'Discount rate to adjust for inflation / real purchasing power', isAdvanced: true }
    ],
    outputs: [
      { id: 'futureValue', label: 'Future Investment Value', formula: 'initialPrincipal * pow(1 + (annualReturn / 100 / 12), investmentYears * 12) + (monthlyContribution > 0 ? (monthlyContribution * (pow(1 + (annualReturn / 100 / 12), investmentYears * 12) - 1) / (annualReturn / 100 / 12)) : 0)', format: 'currency', prefix: '$', highlight: true, description: 'Total portfolio balance at end of horizon' },
      { id: 'totalPrincipalInvested', label: 'Total Principal Invested', formula: 'initialPrincipal + (monthlyContribution * investmentYears * 12)', format: 'currency', prefix: '$', description: 'Total deposits made' },
      { id: 'totalInterestEarned', label: 'Total Compound Interest Earned', formula: '(initialPrincipal * pow(1 + (annualReturn / 100 / 12), investmentYears * 12) + (monthlyContribution > 0 ? (monthlyContribution * (pow(1 + (annualReturn / 100 / 12), investmentYears * 12) - 1) / (annualReturn / 100 / 12)) : 0)) - (initialPrincipal + (monthlyContribution * investmentYears * 12))', format: 'currency', prefix: '$', description: 'Pure investment profit from compounding' }
    ]
  },

  'retirement-calculator': {
    shortDescription: 'Plan your retirement readiness, projected nest egg, monthly retirement income, and shortfall analysis.',
    fields: [
      { id: 'currentAge', label: 'Current Age', type: 'number', defaultValue: 30, suffix: 'yrs', min: 18, max: 80, step: 1, isAdvanced: false },
      { id: 'retireAge', label: 'Target Retirement Age', type: 'number', defaultValue: 65, suffix: 'yrs', min: 35, max: 90, step: 1, isAdvanced: false },
      { id: 'currentSavings', label: 'Current Retirement Savings', type: 'number', defaultValue: 50000, prefix: '$', min: 0, max: 50000000, step: 2500, isAdvanced: false },
      { id: 'annualIncome', label: 'Current Annual Income', type: 'number', defaultValue: 85000, prefix: '$', min: 10000, max: 5000000, step: 1000, isAdvanced: false },
      { id: 'savingsPercent', label: 'Annual Savings Rate (% of income)', type: 'number', defaultValue: 15, suffix: '%', min: 1, max: 80, step: 1, isAdvanced: false },
      { id: 'lifeExpectancy', label: 'Life Expectancy', type: 'number', defaultValue: 90, suffix: 'yrs', min: 65, max: 110, step: 1, isAdvanced: true },
      { id: 'preRetireReturn', label: 'Pre-Retirement Investment Return (%)', type: 'number', defaultValue: 7.5, suffix: '%', min: 1, max: 20, step: 0.1, isAdvanced: true },
      { id: 'postRetireReturn', label: 'Post-Retirement Investment Return (%)', type: 'number', defaultValue: 5.0, suffix: '%', min: 1, max: 15, step: 0.1, isAdvanced: true },
      { id: 'annualInflation', label: 'Expected Annual Inflation Rate (%)', type: 'number', defaultValue: 2.5, suffix: '%', min: 0, max: 15, step: 0.1, isAdvanced: true }
    ],
    outputs: [
      { id: 'nestEggAtRetirement', label: 'Projected Retirement Nest Egg', formula: 'currentSavings * pow(1 + (preRetireReturn / 100), max(1, retireAge - currentAge)) + ((annualIncome * savingsPercent / 100) * (pow(1 + (preRetireReturn / 100), max(1, retireAge - currentAge)) - 1) / (preRetireReturn / 100))', format: 'currency', prefix: '$', highlight: true },
      { id: 'monthlyRetirementIncome', label: 'Estimated Monthly Retirement Income', formula: '(currentSavings * pow(1 + (preRetireReturn / 100), max(1, retireAge - currentAge)) + ((annualIncome * savingsPercent / 100) * (pow(1 + (preRetireReturn / 100), max(1, retireAge - currentAge)) - 1) / (preRetireReturn / 100))) * 0.04 / 12', format: 'currency', prefix: '$', description: 'Based on standard 4% safe withdrawal rule' },
      { id: 'totalContributed', label: 'Total Personal Contributions', formula: 'currentSavings + ((annualIncome * savingsPercent / 100) * max(0, retireAge - currentAge))', format: 'currency', prefix: '$' }
    ]
  },

  'rental-property-calculator': {
    shortDescription: 'Calculate ROI, capitalization rate (Cap Rate), net cash flow, and cash-on-cash return for investment properties.',
    fields: [
      { id: 'purchasePrice', label: 'Purchase Price', type: 'number', defaultValue: 320000, prefix: '$', min: 10000, max: 25000000, step: 5000, isAdvanced: false },
      { id: 'downPayment', label: 'Down Payment ($)', type: 'number', defaultValue: 64000, prefix: '$', min: 0, max: 25000000, step: 2500, isAdvanced: false },
      { id: 'interestRate', label: 'Mortgage Interest Rate (%)', type: 'number', defaultValue: 6.85, suffix: '%', min: 0.1, max: 25, step: 0.05, isAdvanced: false },
      { id: 'monthlyRent', label: 'Gross Monthly Rental Income', type: 'number', defaultValue: 2600, prefix: '$', suffix: '/mo', min: 100, max: 200000, step: 50, isAdvanced: false },
      { id: 'loanTermYears', label: 'Loan Term (Years)', type: 'number', defaultValue: 30, suffix: 'yrs', min: 5, max: 40, step: 1, isAdvanced: true },
      { id: 'vacancyRate', label: 'Vacancy Rate (%)', type: 'number', defaultValue: 5.0, suffix: '%', min: 0, max: 50, step: 0.5, isAdvanced: true },
      { id: 'annualPropertyTax', label: 'Annual Property Taxes', type: 'number', defaultValue: 3600, prefix: '$', suffix: '/yr', min: 0, max: 100000, step: 100, isAdvanced: true },
      { id: 'annualInsurance', label: 'Annual Property Insurance', type: 'number', defaultValue: 1400, prefix: '$', suffix: '/yr', min: 0, max: 50000, step: 50, isAdvanced: true },
      { id: 'annualMaintenance', label: 'Annual Repairs & Maintenance', type: 'number', defaultValue: 2000, prefix: '$', suffix: '/yr', min: 0, max: 50000, step: 100, isAdvanced: true },
      { id: 'managementFeePct', label: 'Property Management Fee (%)', type: 'number', defaultValue: 8.0, suffix: '%', min: 0, max: 30, step: 0.5, isAdvanced: true }
    ],
    outputs: [
      { id: 'monthlyCashFlow', label: 'Net Monthly Cash Flow', formula: '(monthlyRent * (1 - (vacancyRate / 100))) - ((annualPropertyTax + annualInsurance + annualMaintenance + (monthlyRent * 12 * (managementFeePct / 100))) / 12) - ((purchasePrice - downPayment) * ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), loanTermYears * 12)) / (pow(1 + (interestRate / 100 / 12), loanTermYears * 12) - 1))', format: 'currency', prefix: '$', highlight: true },
      { id: 'netOperatingIncome', label: 'Net Operating Income (NOI / Year)', formula: '(monthlyRent * 12 * (1 - (vacancyRate / 100))) - (annualPropertyTax + annualInsurance + annualMaintenance + (monthlyRent * 12 * (managementFeePct / 100)))', format: 'currency', prefix: '$' },
      { id: 'capRate', label: 'Cap Rate (Capitalization Rate)', formula: '(((monthlyRent * 12 * (1 - (vacancyRate / 100))) - (annualPropertyTax + annualInsurance + annualMaintenance + (monthlyRent * 12 * (managementFeePct / 100)))) / purchasePrice) * 100', format: 'percent', suffix: '%' },
      { id: 'cashOnCash', label: 'Cash on Cash Return (%)', formula: '((((monthlyRent * (1 - (vacancyRate / 100))) - ((annualPropertyTax + annualInsurance + annualMaintenance + (monthlyRent * 12 * (managementFeePct / 100))) / 12) - ((purchasePrice - downPayment) * ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), loanTermYears * 12)) / (pow(1 + (interestRate / 100 / 12), loanTermYears * 12) - 1))) * 12) / downPayment) * 100', format: 'percent', suffix: '%' }
    ]
  }
};

// Generic generator for any calculators not explicitly listed above
function generateDefaultCalculatorNetFields(calc) {
  const name = calc.name.toLowerCase();
  const slug = calc.slug.toLowerCase();

  if (name.includes('tax') || slug.includes('tax')) {
    return {
      fields: [
        { id: 'grossAmount', label: 'Gross Taxable Amount / Income', type: 'number', defaultValue: 75000, prefix: '$', min: 0, max: 10000000, step: 500, helpText: 'Base amount before taxation', isAdvanced: false },
        { id: 'taxRate', label: 'Tax Rate (%)', type: 'number', defaultValue: 15.0, suffix: '%', min: 0, max: 99, step: 0.1, helpText: 'Applicable percentage tax rate', isAdvanced: false },
        { id: 'deductions', label: 'Allowable Deductions / Exemptions', type: 'number', defaultValue: 5000, prefix: '$', min: 0, max: 1000000, step: 250, helpText: 'Standard or itemized deductions', isAdvanced: true },
        { id: 'taxCredits', label: 'Tax Credits', type: 'number', defaultValue: 1000, prefix: '$', min: 0, max: 50000, step: 50, helpText: 'Direct dollar-for-dollar tax credits', isAdvanced: true },
        { id: 'stateTaxRate', label: 'State / Local Tax Rate (%)', type: 'number', defaultValue: 4.5, suffix: '%', min: 0, max: 20, step: 0.1, helpText: 'Additional municipal or state tax rate', isAdvanced: true }
      ],
      outputs: [
        { id: 'netTaxOwed', label: 'Total Tax Owed', formula: 'max(0, (max(0, grossAmount - deductions) * ((taxRate + stateTaxRate) / 100)) - taxCredits)', format: 'currency', prefix: '$', highlight: true },
        { id: 'netAfterTaxAmount', label: 'Net After-Tax Income', formula: 'grossAmount - max(0, (max(0, grossAmount - deductions) * ((taxRate + stateTaxRate) / 100)) - taxCredits)', format: 'currency', prefix: '$' },
        { id: 'effectiveTaxRate', label: 'Effective Tax Rate', formula: '(max(0, (max(0, grossAmount - deductions) * ((taxRate + stateTaxRate) / 100)) - taxCredits) / max(1, grossAmount)) * 100', format: 'percent', suffix: '%' }
      ]
    };
  }

  if (name.includes('investment') || name.includes('fund') || name.includes('return') || name.includes('growth') || name.includes('roth') || name.includes('ira') || name.includes('annuity') || name.includes('cd') || name.includes('bond') || name.includes('savings')) {
    return {
      fields: [
        { id: 'startingAmount', label: 'Initial Principal / Balance', type: 'number', defaultValue: 15000, prefix: '$', min: 0, max: 50000000, step: 500, helpText: 'Starting investment deposit', isAdvanced: false },
        { id: 'annualContribution', label: 'Annual / Recurring Contribution', type: 'number', defaultValue: 6000, prefix: '$', min: 0, max: 1000000, step: 250, helpText: 'Annual contribution amount', isAdvanced: false },
        { id: 'growthRate', label: 'Estimated Annual Growth Rate (%)', type: 'number', defaultValue: 7.5, suffix: '%', min: 0.1, max: 40, step: 0.1, helpText: 'Expected annual return percentage', isAdvanced: false },
        { id: 'years', label: 'Investment Duration (Years)', type: 'number', defaultValue: 15, suffix: 'years', min: 1, max: 60, step: 1, helpText: 'Total length of investment period', isAdvanced: true },
        { id: 'annualFeePct', label: 'Expense Ratio / Management Fee (%)', type: 'number', defaultValue: 0.25, suffix: '%', min: 0, max: 5, step: 0.05, helpText: 'Annual fund expense ratio or advisor fee', isAdvanced: true },
        { id: 'inflationRate', label: 'Annual Inflation Rate (%)', type: 'number', defaultValue: 2.5, suffix: '%', min: 0, max: 20, step: 0.1, helpText: 'Expected annual inflation discount rate', isAdvanced: true }
      ],
      outputs: [
        { id: 'endingBalance', label: 'Future Value at End of Horizon', formula: 'startingAmount * pow(1 + ((growthRate - annualFeePct) / 100), years) + (annualContribution * (pow(1 + ((growthRate - annualFeePct) / 100), years) - 1) / ((growthRate - annualFeePct) / 100))', format: 'currency', prefix: '$', highlight: true },
        { id: 'totalPrincipal', label: 'Total Principal Invested', formula: 'startingAmount + (annualContribution * years)', format: 'currency', prefix: '$' },
        { id: 'totalEarnings', label: 'Total Investment Profit', formula: '(startingAmount * pow(1 + ((growthRate - annualFeePct) / 100), years) + (annualContribution * (pow(1 + ((growthRate - annualFeePct) / 100), years) - 1) / ((growthRate - annualFeePct) / 100))) - (startingAmount + (annualContribution * years))', format: 'currency', prefix: '$' }
      ]
    };
  }

  if (name.includes('loan') || name.includes('credit') || name.includes('debt') || name.includes('mortgage') || name.includes('heloc') || name.includes('repayment') || name.includes('fha') || name.includes('va') || name.includes('apr')) {
    return {
      fields: [
        { id: 'principalAmount', label: 'Loan / Debt Amount', type: 'number', defaultValue: 25000, prefix: '$', min: 500, max: 10000000, step: 500, helpText: 'Total borrowed amount', isAdvanced: false },
        { id: 'interestRate', label: 'Interest Rate (%)', type: 'number', defaultValue: 6.5, suffix: '%', min: 0.1, max: 40, step: 0.1, helpText: 'Annual interest percentage rate', isAdvanced: false },
        { id: 'termYears', label: 'Loan Term (Years)', type: 'select', defaultValue: 5, options: [{ label: '1 Year', value: 1 }, { label: '3 Years', value: 3 }, { label: '5 Years', value: 5 }, { label: '7 Years', value: 7 }, { label: '10 Years', value: 10 }, { label: '15 Years', value: 15 }, { label: '30 Years', value: 30 }], suffix: 'years', isAdvanced: false },
        { id: 'extraPayment', label: 'Extra Monthly Payment', type: 'number', defaultValue: 0, prefix: '$', min: 0, max: 10000, step: 25, helpText: 'Additional payment per month', isAdvanced: true },
        { id: 'fees', label: 'Origination & Closing Fees', type: 'number', defaultValue: 250, prefix: '$', min: 0, max: 25000, step: 25, helpText: 'Lender origination fees or doc fees', isAdvanced: true },
        { id: 'annualPrepayment', label: 'Annual Extra Principal ($/yr)', type: 'number', defaultValue: 0, prefix: '$', min: 0, max: 50000, step: 100, helpText: 'Extra lump sum paid once a year', isAdvanced: true }
      ],
      outputs: [
        { id: 'monthlyPayment', label: 'Monthly Payment', formula: '(principalAmount * ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), termYears * 12)) / (pow(1 + (interestRate / 100 / 12), termYears * 12) - 1)) + extraPayment', format: 'currency', prefix: '$', highlight: true },
        { id: 'totalInterest', label: 'Total Loan Interest Paid', formula: '((principalAmount * ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), termYears * 12)) / (pow(1 + (interestRate / 100 / 12), termYears * 12) - 1)) * termYears * 12) - principalAmount', format: 'currency', prefix: '$' },
        { id: 'totalCost', label: 'Total Payment (Principal + Interest + Fees)', formula: '((principalAmount * ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), termYears * 12)) / (pow(1 + (interestRate / 100 / 12), termYears * 12) - 1)) * termYears * 12) + fees', format: 'currency', prefix: '$' }
      ]
    };
  }

  if (name.includes('percentage') || name.includes('discount') || name.includes('margin') || name.includes('commission') || name.includes('vat') || name.includes('sales tax') || name.includes('depreciation') || name.includes('off')) {
    return {
      fields: [
        { id: 'price', label: 'Original Price / Base Value', type: 'number', defaultValue: 120, prefix: '$', min: 0, max: 10000000, step: 1, helpText: 'Base cost or sticker price', isAdvanced: false },
        { id: 'rate', label: 'Percentage Rate / Discount (%)', type: 'number', defaultValue: 20.0, suffix: '%', min: 0, max: 100, step: 0.5, helpText: 'Percentage off, tax rate, or commission rate', isAdvanced: false },
        { id: 'quantity', label: 'Quantity / Units', type: 'number', defaultValue: 1, suffix: 'qty', min: 1, max: 100000, step: 1, helpText: 'Number of units', isAdvanced: true },
        { id: 'extraDiscount', label: 'Additional Flat Coupon / Discount ($)', type: 'number', defaultValue: 0, prefix: '$', min: 0, max: 10000, step: 1, helpText: 'Direct cash coupon or rebate', isAdvanced: true },
        { id: 'salesTaxPct', label: 'Sales Tax Rate (%)', type: 'number', defaultValue: 0, suffix: '%', min: 0, max: 30, step: 0.1, helpText: 'Local sales tax added on post-discount total', isAdvanced: true }
      ],
      outputs: [
        { id: 'finalTotal', label: 'Final Total Amount', formula: 'max(0, (price * quantity * (1 - (rate / 100))) - extraDiscount) * (1 + (salesTaxPct / 100))', format: 'currency', prefix: '$', highlight: true },
        { id: 'totalDiscount', label: 'Total Savings / Discount Amount', formula: '(price * quantity * (rate / 100)) + extraDiscount', format: 'currency', prefix: '$' },
        { id: 'pricePerUnit', label: 'Net Price Per Unit', formula: 'max(0, (price * (1 - (rate / 100))) - (extraDiscount / quantity))', format: 'currency', prefix: '$' }
      ]
    };
  }

  // General financial & math calculator
  return {
    fields: [
      { id: 'baseAmount', label: 'Base Amount / Initial Value', type: 'number', defaultValue: 10000, prefix: '$', min: 0, max: 50000000, step: 100, helpText: 'Starting value or transaction amount', isAdvanced: false },
      { id: 'ratePct', label: 'Rate (%)', type: 'number', defaultValue: 6.0, suffix: '%', min: 0, max: 100, step: 0.1, helpText: 'Annual percentage rate or factor', isAdvanced: false },
      { id: 'period', label: 'Period / Time (Years)', type: 'number', defaultValue: 5, suffix: 'years', min: 1, max: 50, step: 1, helpText: 'Calculation timeframe', isAdvanced: true },
      { id: 'adjustment', label: 'Recurring Annual Adjustment ($)', type: 'number', defaultValue: 500, prefix: '$', min: 0, max: 100000, step: 50, helpText: 'Periodic contribution or expense', isAdvanced: true },
      { id: 'customInflation', label: 'Custom Inflation / Growth Adjustment (%)', type: 'number', defaultValue: 0, suffix: '%', min: 0, max: 20, step: 0.1, helpText: 'Optional annual rate adjustment', isAdvanced: true }
    ],
    outputs: [
      { id: 'computedResult', label: 'Estimated Total Value', formula: 'baseAmount * pow(1 + ((ratePct + customInflation) / 100), period) + (adjustment * period)', format: 'currency', prefix: '$', highlight: true },
      { id: 'totalAdjustments', label: 'Total Adjustments Over Time', formula: 'adjustment * period', format: 'currency', prefix: '$' },
      { id: 'growthAmount', label: 'Net Growth / Accrued Interest', formula: '(baseAmount * pow(1 + ((ratePct + customInflation) / 100), period)) - baseAmount', format: 'currency', prefix: '$' }
    ]
  };
}

// Update all 75 calculators in db.json
let updatedCount = 0;
for (const calc of db.calculators) {
  const specific = CALCULATOR_DEFINITIONS[calc.slug];
  if (specific) {
    calc.fields = specific.fields;
    calc.outputs = specific.outputs;
    if (specific.shortDescription) calc.shortDescription = specific.shortDescription;
    updatedCount++;
  } else {
    const generated = generateDefaultCalculatorNetFields(calc);
    calc.fields = generated.fields;
    calc.outputs = generated.outputs;
    updatedCount++;
  }
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log(`Successfully updated ${updatedCount} calculators in data/db.json with comprehensive Calculator.net inputs & outputs!`);
