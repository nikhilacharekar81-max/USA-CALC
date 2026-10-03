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
      { id: 'includeTaxesAndCosts', label: 'Include Taxes & Costs?', type: 'checkbox', defaultValue: true, helpText: 'Property taxes, homeowners insurance, PMI, HOA fees', isAdvanced: false },
      { id: 'propertyTax', label: 'Property Tax ($/year)', type: 'number', defaultValue: 4800, prefix: '$', suffix: '/yr', min: 0, max: 100000, step: 100, helpText: 'Annual property tax assessed by local government', isAdvanced: true, visibleWhen: { fieldId: 'includeTaxesAndCosts', equalsValue: true } },
      { id: 'homeInsurance', label: 'Homeowners Insurance ($/year)', type: 'number', defaultValue: 1500, prefix: '$', suffix: '/yr', min: 0, max: 25000, step: 50, helpText: 'Annual hazard / home insurance premium', isAdvanced: true, visibleWhen: { fieldId: 'includeTaxesAndCosts', equalsValue: true } },
      { id: 'pmiRate', label: 'PMI Rate (%)', type: 'number', defaultValue: 0.85, suffix: '%', min: 0, max: 5, step: 0.05, helpText: 'Private Mortgage Insurance required if down payment < 20%', isAdvanced: true, visibleWhen: { fieldId: 'includeTaxesAndCosts', equalsValue: true } },
      { id: 'hoaFee', label: 'HOA Fee ($/month)', type: 'number', defaultValue: 50, prefix: '$', suffix: '/mo', min: 0, max: 5000, step: 10, helpText: 'Monthly Homeowners Association fees', isAdvanced: true, visibleWhen: { fieldId: 'includeTaxesAndCosts', equalsValue: true } },
      { id: 'otherCosts', label: 'Other Costs ($/year)', type: 'number', defaultValue: 0, prefix: '$', suffix: '/yr', min: 0, max: 25000, step: 50, helpText: 'Other monthly property costs', isAdvanced: true, visibleWhen: { fieldId: 'includeTaxesAndCosts', equalsValue: true } },
      { id: 'extraPayment', label: 'Extra Monthly Payment ($)', type: 'number', defaultValue: 0, prefix: '$', suffix: '/mo', min: 0, max: 50000, step: 50, helpText: 'Additional monthly principal payment to accelerate payoff', isAdvanced: true }
    ],
    outputs: [
      { id: 'monthlyPayment', label: 'Total Monthly Payment', formula: 'if_gt(homePrice - downPayment, 0, (homePrice - downPayment) * ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), loanTerm * 12)) / (pow(1 + (interestRate / 100 / 12), loanTerm * 12) - 1), 0) + if_eq(includeTaxesAndCosts, 1, (propertyTax / 12) + (homeInsurance / 12) + if_lt(downPayment, homePrice * 0.2, (homePrice - downPayment) * (pmiRate / 100 / 12), 0) + hoaFee + (otherCosts / 12), 0) + extraPayment', format: 'currency', prefix: '$', highlight: true, description: 'Total monthly payment including P&I, taxes, insurance, and fees' },
      { id: 'monthlyPI', label: 'Monthly Principal & Interest', formula: 'if_gt(homePrice - downPayment, 0, (homePrice - downPayment) * ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), loanTerm * 12)) / (pow(1 + (interestRate / 100 / 12), loanTerm * 12) - 1), 0)', format: 'currency', prefix: '$', description: 'Monthly loan amortization portion' },
      { id: 'loanAmount', label: 'Total Loan Amount', formula: 'homePrice - downPayment', format: 'currency', prefix: '$', description: 'Net borrowed principal balance' },
      { id: 'monthlyTax', label: 'Monthly Property Tax', formula: 'if_eq(includeTaxesAndCosts, 1, propertyTax / 12, 0)', format: 'currency', prefix: '$' },
      { id: 'monthlyInsurance', label: 'Monthly Home Insurance', formula: 'if_eq(includeTaxesAndCosts, 1, homeInsurance / 12, 0)', format: 'currency', prefix: '$' },
      { id: 'monthlyPMI', label: 'Monthly PMI', formula: 'if_eq(includeTaxesAndCosts, 1, if_lt(downPayment, homePrice * 0.2, (homePrice - downPayment) * (pmiRate / 100 / 12), 0), 0)', format: 'currency', prefix: '$' },
      { id: 'totalInterest', label: 'Total Interest Paid', formula: '(if_gt(homePrice - downPayment, 0, (homePrice - downPayment) * ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), loanTerm * 12)) / (pow(1 + (interestRate / 100 / 12), loanTerm * 12) - 1), 0) * (loanTerm * 12)) - (homePrice - downPayment)', format: 'currency', prefix: '$' },
      { id: 'totalPayments', label: 'Total Cost Over Loan Life', formula: '(if_gt(homePrice - downPayment, 0, (homePrice - downPayment) * ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), loanTerm * 12)) / (pow(1 + (interestRate / 100 / 12), loanTerm * 12) - 1), 0) * (loanTerm * 12)) + if_eq(includeTaxesAndCosts, 1, (propertyTax * loanTerm) + (homeInsurance * loanTerm) + (hoaFee * 12 * loanTerm) + (otherCosts * loanTerm), 0)', format: 'currency', prefix: '$' }
    ]
  },

  'auto-loan-calculator': {
    shortDescription: 'Calculate monthly auto loan payments, total interest, sales tax, fees, and total purchase cost with trade-in value support.',
    fields: [
      { id: 'autoPrice', label: 'Vehicle Price', type: 'number', defaultValue: 35000, prefix: '$', min: 1000, max: 500000, step: 500, helpText: 'Negotiated purchase price of the vehicle', isAdvanced: false },
      { id: 'downPayment', label: 'Cash Down Payment', type: 'number', defaultValue: 5000, prefix: '$', min: 0, max: 200000, step: 250, helpText: 'Upfront cash paid at purchase', isAdvanced: false },
      { id: 'loanTermMonths', label: 'Loan Term (Months)', type: 'select', defaultValue: 60, options: [{ label: '24 Months (2 Yrs)', value: 24 }, { label: '36 Months (3 Yrs)', value: 36 }, { label: '48 Months (4 Yrs)', value: 48 }, { label: '60 Months (5 Yrs)', value: 60 }, { label: '72 Months (6 Yrs)', value: 72 }, { label: '84 Months (7 Yrs)', value: 84 }], suffix: 'months', isAdvanced: false },
      { id: 'interestRate', label: 'Interest Rate (%)', type: 'number', defaultValue: 5.99, suffix: '%', min: 0.1, max: 30, step: 0.1, helpText: 'Annual Percentage Rate (APR) on the auto loan', isAdvanced: false },
      { id: 'includeTradeIn', label: 'Include Trade-in?', type: 'checkbox', defaultValue: true, helpText: 'Do you have a vehicle trade-in to reduce net financed price?', isAdvanced: false },
      { id: 'tradeInValue', label: 'Trade-in Value', type: 'number', defaultValue: 4000, prefix: '$', min: 0, max: 200000, step: 250, helpText: 'Dealer trade-in allowance for your current vehicle', isAdvanced: true, visibleWhen: { fieldId: 'includeTradeIn', equalsValue: true } },
      { id: 'amountOwedOnTrade', label: 'Amount Owed on Trade-in', type: 'number', defaultValue: 1000, prefix: '$', min: 0, max: 200000, step: 250, helpText: 'Outstanding balance on existing trade-in loan', isAdvanced: true, visibleWhen: { fieldId: 'includeTradeIn', equalsValue: true } },
      { id: 'salesTaxRate', label: 'Sales Tax Rate (%)', type: 'number', defaultValue: 7.0, suffix: '%', min: 0, max: 20, step: 0.1, helpText: 'State and local vehicle sales tax rate', isAdvanced: true },
      { id: 'dealerFees', label: 'Title, Registration & Dealer Fees', type: 'number', defaultValue: 850, prefix: '$', min: 0, max: 10000, step: 50, helpText: 'Documentation, title, plate and dealer registration fees', isAdvanced: true }
    ],
    outputs: [
      { id: 'monthlyPayment', label: 'Monthly Payment', formula: 'if_gt(autoPrice - if_eq(includeTradeIn, 1, (tradeInValue - amountOwedOnTrade), 0) + (autoPrice * salesTaxRate / 100) + dealerFees - downPayment, 0, (autoPrice - if_eq(includeTradeIn, 1, (tradeInValue - amountOwedOnTrade), 0) + (autoPrice * salesTaxRate / 100) + dealerFees - downPayment) * ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), loanTermMonths)) / (pow(1 + (interestRate / 100 / 12), loanTermMonths) - 1), 0)', format: 'currency', prefix: '$', highlight: true, description: 'Monthly auto loan installment' },
      { id: 'totalLoanAmount', label: 'Total Loan Amount Financed', formula: 'max(0, autoPrice - if_eq(includeTradeIn, 1, (tradeInValue - amountOwedOnTrade), 0) + (autoPrice * salesTaxRate / 100) + dealerFees - downPayment)', format: 'currency', prefix: '$' },
      { id: 'salesTaxAmount', label: 'Sales Tax Paid', formula: 'autoPrice * salesTaxRate / 100', format: 'currency', prefix: '$' },
      { id: 'totalInterest', label: 'Total Loan Interest', formula: '(if_gt(autoPrice - if_eq(includeTradeIn, 1, (tradeInValue - amountOwedOnTrade), 0) + (autoPrice * salesTaxRate / 100) + dealerFees - downPayment, 0, (autoPrice - if_eq(includeTradeIn, 1, (tradeInValue - amountOwedOnTrade), 0) + (autoPrice * salesTaxRate / 100) + dealerFees - downPayment) * ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), loanTermMonths)) / (pow(1 + (interestRate / 100 / 12), loanTermMonths) - 1), 0) * loanTermMonths) - max(0, autoPrice - if_eq(includeTradeIn, 1, (tradeInValue - amountOwedOnTrade), 0) + (autoPrice * salesTaxRate / 100) + dealerFees - downPayment)', format: 'currency', prefix: '$' },
      { id: 'totalCost', label: 'Total Vehicle Cost', formula: 'downPayment + if_eq(includeTradeIn, 1, (tradeInValue - amountOwedOnTrade), 0) + ((if_gt(autoPrice - if_eq(includeTradeIn, 1, (tradeInValue - amountOwedOnTrade), 0) + (autoPrice * salesTaxRate / 100) + dealerFees - downPayment, 0, (autoPrice - if_eq(includeTradeIn, 1, (tradeInValue - amountOwedOnTrade), 0) + (autoPrice * salesTaxRate / 100) + dealerFees - downPayment) * ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), loanTermMonths)) / (pow(1 + (interestRate / 100 / 12), loanTermMonths) - 1), 0)) * loanTermMonths)', format: 'currency', prefix: '$' }
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
      { id: 'monthlyContribution', label: 'Monthly Contribution', type: 'number', defaultValue: 500, prefix: '$', min: 0, max: 100000, step: 50, helpText: 'Additional amount invested each month', isAdvanced: false },
      { id: 'investmentYears', label: 'Investment Horizon (Years)', type: 'number', defaultValue: 10, suffix: 'years', min: 1, max: 60, step: 1, helpText: 'Number of years to grow', isAdvanced: false },
      { id: 'annualReturn', label: 'Estimated Annual Return (%)', type: 'number', defaultValue: 8.0, suffix: '%', min: 0.1, max: 50, step: 0.1, helpText: 'Expected annual growth or interest rate', isAdvanced: false },
      { id: 'compoundFreq', label: 'Compound Frequency', type: 'select', defaultValue: 12, options: [{ label: 'Monthly (12/yr)', value: 12 }, { label: 'Quarterly (4/yr)', value: 4 }, { label: 'Annually (1/yr)', value: 1 }, { label: 'Daily (365/yr)', value: 365 }], isAdvanced: true },
      { id: 'inflationRate', label: 'Annual Inflation Rate (%)', type: 'number', defaultValue: 2.5, suffix: '%', min: 0, max: 20, step: 0.1, helpText: 'Discount rate to adjust for inflation / real purchasing power', isAdvanced: true }
    ],
    outputs: [
      { id: 'futureValue', label: 'Future Investment Value', formula: 'initialPrincipal * pow(1 + (annualReturn / 100 / 12), investmentYears * 12) + if_gt(monthlyContribution, 0, (monthlyContribution * (pow(1 + (annualReturn / 100 / 12), investmentYears * 12) - 1) / (annualReturn / 100 / 12)), 0)', format: 'currency', prefix: '$', highlight: true, description: 'Total portfolio balance at end of horizon' },
      { id: 'totalPrincipalInvested', label: 'Total Principal Invested', formula: 'initialPrincipal + (monthlyContribution * investmentYears * 12)', format: 'currency', prefix: '$', description: 'Total deposits made' },
      { id: 'totalInterestEarned', label: 'Total Compound Interest Earned', formula: '(initialPrincipal * pow(1 + (annualReturn / 100 / 12), investmentYears * 12) + if_gt(monthlyContribution, 0, (monthlyContribution * (pow(1 + (annualReturn / 100 / 12), investmentYears * 12) - 1) / (annualReturn / 100 / 12)), 0)) - (initialPrincipal + (monthlyContribution * investmentYears * 12))', format: 'currency', prefix: '$', description: 'Pure investment profit from compounding' }
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
    shortDescription: 'Calculate ROI, capitalization rate (Cap Rate), net cash flow, and cash-on-cash return for investment rental properties.',
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
  },

  'interest-calculator': {
    shortDescription: 'Calculate the interest earned or paid on a specific principal balance with simple or compound interest rules.',
    fields: [
      { id: 'principal', label: 'Principal Amount', type: 'number', defaultValue: 10000, prefix: '$', min: 0, max: 100000000, step: 100 },
      { id: 'interestRate', label: 'Interest Rate (Annual %)', type: 'number', defaultValue: 6.0, suffix: '%', min: 0, max: 100, step: 0.1 },
      { id: 'termYears', label: 'Term in Years', type: 'number', defaultValue: 5, suffix: 'yrs', min: 1, max: 50, step: 1 },
      { id: 'compoundFreq', label: 'Compound Frequency', type: 'select', defaultValue: 12, options: [{ label: 'Simple (No Compounding)', value: 0 }, { label: 'Annually (1/yr)', value: 1 }, { label: 'Semi-annually (2/yr)', value: 2 }, { label: 'Quarterly (4/yr)', value: 4 }, { label: 'Monthly (12/yr)', value: 12 }, { label: 'Daily (365/yr)', value: 365 }] }
    ],
    outputs: [
      { id: 'totalBalance', label: 'Total Future Balance', formula: 'if_eq(compoundFreq, 0, principal * (1 + (interestRate / 100) * termYears), principal * pow(1 + (interestRate / 100 / compoundFreq), compoundFreq * termYears))', format: 'currency', prefix: '$', highlight: true },
      { id: 'interestEarned', label: 'Total Interest Earned', formula: 'if_eq(compoundFreq, 0, principal * (interestRate / 100) * termYears, (principal * pow(1 + (interestRate / 100 / compoundFreq), compoundFreq * termYears)) - principal)', format: 'currency', prefix: '$' }
    ]
  },

  'savings-calculator': {
    shortDescription: 'Determine how much your savings will grow over time with starting capital and recurring contributions.',
    fields: [
      { id: 'initialDeposit', label: 'Starting Principal', type: 'number', defaultValue: 5000, prefix: '$', min: 0, max: 100000000, step: 100 },
      { id: 'monthlyContribution', label: 'Monthly Contribution', type: 'number', defaultValue: 300, prefix: '$', suffix: '/mo', min: 0, max: 100000, step: 25 },
      { id: 'interestRate', label: 'Interest Rate (%)', type: 'number', defaultValue: 4.5, suffix: '%', min: 0, max: 100, step: 0.1 },
      { id: 'years', label: 'Savings Term in Years', type: 'number', defaultValue: 10, suffix: 'yrs', min: 1, max: 60, step: 1 }
    ],
    outputs: [
      { id: 'futureValue', label: 'Projected Savings Balance', formula: 'initialDeposit * pow(1 + (interestRate / 100 / 12), years * 12) + if_gt(monthlyContribution, 0, (monthlyContribution * (pow(1 + (interestRate / 100 / 12), years * 12) - 1) / (interestRate / 100 / 12)), 0)', format: 'currency', prefix: '$', highlight: true },
      { id: 'totalDeposited', label: 'Total Cash Deposited', formula: 'initialDeposit + (monthlyContribution * years * 12)', format: 'currency', prefix: '$' },
      { id: 'interestEarned', label: 'Total Interest Earned', formula: '(initialDeposit * pow(1 + (interestRate / 100 / 12), years * 12) + if_gt(monthlyContribution, 0, (monthlyContribution * (pow(1 + (interestRate / 100 / 12), years * 12) - 1) / (interestRate / 100 / 12)), 0)) - (initialDeposit + (monthlyContribution * years * 12))', format: 'currency', prefix: '$' }
    ]
  },

  'inflation-calculator': {
    shortDescription: 'Calculate the purchase power changes over time using historical or custom inflation expectations.',
    fields: [
      { id: 'startingAmount', label: 'Starting Amount', type: 'number', defaultValue: 1000, prefix: '$', min: 1, max: 100000000, step: 50 },
      { id: 'inflationRate', label: 'Annual Inflation Rate (%)', type: 'number', defaultValue: 3.2, suffix: '%', min: -10, max: 100, step: 0.1 },
      { id: 'years', label: 'Duration in Years', type: 'number', defaultValue: 15, suffix: 'yrs', min: 1, max: 100, step: 1 }
    ],
    outputs: [
      { id: 'futureValue', label: 'Future Nominal Equivalent', formula: 'startingAmount * pow(1 + (inflationRate / 100), years)', format: 'currency', prefix: '$', highlight: true, description: 'Equivalent value required in future dollars to maintain same buying power' },
      { id: 'realValue', label: 'Real Value / Purchasing Power', formula: 'startingAmount / pow(1 + (inflationRate / 100), years)', format: 'currency', prefix: '$', description: 'Real value in today’s purchasing power' }
    ]
  },

  'sales-tax-calculator': {
    shortDescription: 'Calculate sales tax easily given pre-tax price or reverse-calculate back to pre-tax amount.',
    fields: [
      { id: 'price', label: 'Amount / Selling Price', type: 'number', defaultValue: 150, prefix: '$', min: 0, max: 10000000, step: 1 },
      { id: 'taxRate', label: 'Sales Tax Rate (%)', type: 'number', defaultValue: 8.25, suffix: '%', min: 0, max: 100, step: 0.1 },
      { id: 'isTaxInclusive', label: 'Is Price Tax-Inclusive?', type: 'checkbox', defaultValue: false, helpText: 'Calculate taxes backwards from overall paid total' }
    ],
    outputs: [
      { id: 'totalPrice', label: 'Total Checkout Price', formula: 'if_eq(isTaxInclusive, 1, price, price * (1 + (taxRate / 100)))', format: 'currency', prefix: '$', highlight: true },
      { id: 'taxAmount', label: 'Sales Tax Amount', formula: 'if_eq(isTaxInclusive, 1, price - (price / (1 + (taxRate / 100))), price * (taxRate / 100))', format: 'currency', prefix: '$' },
      { id: 'netPrice', label: 'Pre-Tax Price', formula: 'if_eq(isTaxInclusive, 1, price / (1 + (taxRate / 100)), price)', format: 'currency', prefix: '$' }
    ]
  },

  'vat-calculator': {
    shortDescription: 'Calculate Value Added Tax (VAT) rate additions or back-calculate to net amount easily.',
    fields: [
      { id: 'amount', label: 'Base Amount', type: 'number', defaultValue: 250, prefix: '€', min: 0, max: 10000000, step: 1 },
      { id: 'vatRate', label: 'VAT Percentage (%)', type: 'number', defaultValue: 20.0, suffix: '%', min: 0, max: 100, step: 0.1 },
      { id: 'isInclusive', label: 'Is Price VAT-Inclusive?', type: 'checkbox', defaultValue: false, helpText: 'Extract Net and VAT from the total amount' }
    ],
    outputs: [
      { id: 'totalAmount', label: 'Total Price (Gross)', formula: 'if_eq(isInclusive, 1, amount, amount * (1 + (vatRate / 100)))', format: 'currency', prefix: '€', highlight: true },
      { id: 'vatAmount', label: 'VAT Amount', formula: 'if_eq(isInclusive, 1, amount - (amount / (1 + (vatRate / 100))), amount * (vatRate / 100))', format: 'currency', prefix: '€' },
      { id: 'netAmount', label: 'Net Price', formula: 'if_eq(isInclusive, 1, amount / (1 + (vatRate / 100)), amount)', format: 'currency', prefix: '€' }
    ]
  },

  'cd-calculator': {
    shortDescription: 'Calculate compound interest growth, annual percentage yield (APY), and post-tax yields of Certificate of Deposits.',
    fields: [
      { id: 'deposit', label: 'CD Deposit Amount', type: 'number', defaultValue: 5000, prefix: '$', min: 0, max: 10000000, step: 100 },
      { id: 'interestRate', label: 'Interest Rate % (APY)', type: 'number', defaultValue: 4.85, suffix: '%', min: 0, max: 40, step: 0.05 },
      { id: 'months', label: 'Term in Months', type: 'number', defaultValue: 12, suffix: 'mo', min: 1, max: 360, step: 1 },
      { id: 'taxRate', label: 'Marginal Income Tax Rate (%)', type: 'number', defaultValue: 24, suffix: '%', min: 0, max: 60, step: 1 }
    ],
    outputs: [
      { id: 'endingBalance', label: 'CD Ending Balance', formula: 'deposit * pow(1 + (interestRate / 100 / 12), months)', format: 'currency', prefix: '$', highlight: true },
      { id: 'totalInterest', label: 'Total Pre-tax Interest', formula: '(deposit * pow(1 + (interestRate / 100 / 12), months)) - deposit', format: 'currency', prefix: '$' },
      { id: 'taxOwed', label: 'Marginal Taxes Owed', formula: '((deposit * pow(1 + (interestRate / 100 / 12), months)) - deposit) * (taxRate / 100)', format: 'currency', prefix: '$' },
      { id: 'netEarnings', label: 'Net After-Tax Interest Earned', formula: '((deposit * pow(1 + (interestRate / 100 / 12), months)) - deposit) * (1 - (taxRate / 100))', format: 'currency', prefix: '$' }
    ]
  },

  'discount-calculator': {
    shortDescription: 'Compute markdown price cuts, dual stacking discount coupons, and post-tax pricing.',
    fields: [
      { id: 'price', label: 'Original Price', type: 'number', defaultValue: 80, prefix: '$', min: 0, max: 1000000, step: 1 },
      { id: 'discount', label: 'Primary Discount (%)', type: 'number', defaultValue: 25.0, suffix: '%', min: 0, max: 100, step: 1 },
      { id: 'secondaryDiscount', label: 'Second Stacked Coupon (%)', type: 'number', defaultValue: 10.0, suffix: '%', min: 0, max: 100, step: 1, isAdvanced: true },
      { id: 'salesTax', label: 'Sales Tax Rate (%)', type: 'number', defaultValue: 8.0, suffix: '%', min: 0, max: 40, step: 0.1, isAdvanced: true }
    ],
    outputs: [
      { id: 'finalPrice', label: 'Final Total Checkout Price', formula: '(price * (1 - (discount / 100)) * (1 - (secondaryDiscount / 100))) * (1 + (salesTax / 100))', format: 'currency', prefix: '$', highlight: true },
      { id: 'totalSavings', label: 'Total Saved Cash', formula: 'price - (price * (1 - (discount / 100)) * (1 - (secondaryDiscount / 100)))', format: 'currency', prefix: '$' },
      { id: 'taxesAmount', label: 'Sales Tax Paid', formula: '(price * (1 - (discount / 100)) * (1 - (secondaryDiscount / 100))) * (salesTax / 100)', format: 'currency', prefix: '$' }
    ]
  },

  'margin-calculator': {
    shortDescription: 'Calculate gross margins, markup multipliers, and profit margins to determine the ideal wholesale/retail selling pricing.',
    fields: [
      { id: 'cost', label: 'Cost of Goods / Item Cost', type: 'number', defaultValue: 45, prefix: '$', min: 0.01, max: 10000000, step: 1 },
      { id: 'revenue', label: 'Selling Price / Revenue', type: 'number', defaultValue: 75, prefix: '$', min: 0.01, max: 10000000, step: 1 }
    ],
    outputs: [
      { id: 'grossProfit', label: 'Gross Profit', formula: 'revenue - cost', format: 'currency', prefix: '$', highlight: true },
      { id: 'marginPct', label: 'Gross Profit Margin (%)', formula: '((revenue - cost) / revenue) * 100', format: 'percent', suffix: '%' },
      { id: 'markupPct', label: 'Markup Percentage (%)', formula: '((revenue - cost) / cost) * 100', format: 'percent', suffix: '%' }
    ]
  },

  'commission-calculator': {
    shortDescription: 'Determine total sales commission cuts, team splits, and net residuals for real estate, auto or trade agencies.',
    fields: [
      { id: 'price', label: 'Sales / Transaction Price', type: 'number', defaultValue: 350000, prefix: '$', min: 0, max: 500000000, step: 1000 },
      { id: 'commRate', label: 'Commission Rate (%)', type: 'number', defaultValue: 5.0, suffix: '%', min: 0, max: 100, step: 0.1 },
      { id: 'splitRate', label: 'Agent Share / Split (%)', type: 'number', defaultValue: 70.0, suffix: '%', min: 1, max: 100, step: 1, helpText: 'What % of commission goes to the individual agent versus the broker' }
    ],
    outputs: [
      { id: 'totalCommission', label: 'Total Gross Commission', formula: 'price * (commRate / 100)', format: 'currency', prefix: '$', highlight: true },
      { id: 'agentShare', label: 'Agent Net Earnings', formula: '(price * (commRate / 100)) * (splitRate / 100)', format: 'currency', prefix: '$' },
      { id: 'brokerShare', label: 'Brokerage Retained Share', formula: '(price * (commRate / 100)) * (1 - (splitRate / 100))', format: 'currency', prefix: '$' }
    ]
  },

  'fha-loan-calculator': {
    shortDescription: 'Calculate FHA mortgage loans including the upfront mortgage insurance premium (MIP) and monthly mutual MIP.',
    fields: [
      { id: 'homePrice', label: 'Home Price', type: 'number', defaultValue: 350000, prefix: '$', min: 10000, max: 10000000 },
      { id: 'downPayment', label: 'Down Payment (Min 3.5%)', type: 'number', defaultValue: 12250, prefix: '$', min: 0, max: 10000000 },
      { id: 'interestRate', label: 'Interest Rate (%)', type: 'number', defaultValue: 6.5, suffix: '%', min: 0.1, max: 25 },
      { id: 'upfrontMipRate', label: 'Upfront MIP Rate (%)', type: 'number', defaultValue: 1.75, suffix: '%', min: 0, max: 10, step: 0.05, isAdvanced: true },
      { id: 'annualMipRate', label: 'Annual MIP Rate (%)', type: 'number', defaultValue: 0.55, suffix: '%', min: 0, max: 5, step: 0.05, isAdvanced: true }
    ],
    outputs: [
      { id: 'monthlyPayment', label: 'Monthly Base Mortgage Payment', formula: '((homePrice - downPayment) * (1 + (upfrontMipRate / 100))) * ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), 360)) / (pow(1 + (interestRate / 100 / 12), 360) - 1) + (((homePrice - downPayment) * (annualMipRate / 100)) / 12)', format: 'currency', prefix: '$', highlight: true, description: 'Includes principal, interest, and monthly FHA mortgage insurance' },
      { id: 'baseLoanAmount', label: 'Base Loan Amount', formula: 'homePrice - downPayment', format: 'currency', prefix: '$' },
      { id: 'financedUpfrontMip', label: 'Financed Upfront MIP Amount', formula: '(homePrice - downPayment) * (upfrontMipRate / 100)', format: 'currency', prefix: '$' },
      { id: 'totalFinancedLoan', label: 'Total Financed Loan Balance', formula: '(homePrice - downPayment) * (1 + (upfrontMipRate / 100))', format: 'currency', prefix: '$' },
      { id: 'monthlyMip', label: 'Monthly FHA MIP Insurance', formula: '((homePrice - downPayment) * (annualMipRate / 100)) / 12', format: 'currency', prefix: '$' }
    ]
  },

  'va-mortgage-calculator': {
    shortDescription: 'Calculate military VA loan home payments with zero down payment option and custom funding fees.',
    fields: [
      { id: 'homePrice', label: 'Home Price', type: 'number', defaultValue: 450000, prefix: '$', min: 10000, max: 20000000 },
      { id: 'downPayment', label: 'Down Payment (Often $0)', type: 'number', defaultValue: 0, prefix: '$', min: 0, max: 10000000 },
      { id: 'interestRate', label: 'Interest Rate (%)', type: 'number', defaultValue: 6.25, suffix: '%', min: 0.1, max: 25 },
      { id: 'fundingFeeRate', label: 'VA Funding Fee (%)', type: 'select', defaultValue: 2.15, options: [{ label: 'First Use - Zero Down (2.15%)', value: 2.15 }, { label: 'First Use - 5% Down (1.5%)', value: 1.5 }, { label: 'First Use - 10% Down (1.25%)', value: 1.25 }, { label: 'Subsequent Use - Zero Down (3.3%)', value: 3.3 }, { label: 'Funding Fee Exempt (0.0%)', value: 0 }], isAdvanced: true }
    ],
    outputs: [
      { id: 'monthlyPI', label: 'Monthly Base Mortgage Payment (P&I)', formula: '((homePrice - downPayment) * (1 + (fundingFeeRate / 100))) * ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), 360)) / (pow(1 + (interestRate / 100 / 12), 360) - 1)', format: 'currency', prefix: '$', highlight: true },
      { id: 'baseLoanAmount', label: 'Base VA Loan Amount', formula: 'homePrice - downPayment', format: 'currency', prefix: '$' },
      { id: 'fundingFeeFinanced', label: 'Financed VA Funding Fee', formula: '(homePrice - downPayment) * (fundingFeeRate / 100)', format: 'currency', prefix: '$' },
      { id: 'totalFinancedLoan', label: 'Total Financed VA Loan', formula: '(homePrice - downPayment) * (1 + (fundingFeeRate / 100))', format: 'currency', prefix: '$' }
    ]
  },

  'heloc-calculator': {
    shortDescription: 'Calculate Home Equity Line of Credit (HELOC) interest-only draw payments and principal amortization payoff plans.',
    fields: [
      { id: 'limit', label: 'HELOC Limit / Line Amount', type: 'number', defaultValue: 50000, prefix: '$', min: 0, max: 10000000 },
      { id: 'balance', label: 'Outstanding Draw Balance', type: 'number', defaultValue: 25000, prefix: '$', min: 0, max: 10000000 },
      { id: 'interestRate', label: 'HELOC Interest Rate % (Variable)', type: 'number', defaultValue: 8.5, suffix: '%', min: 0.1, max: 30 },
      { id: 'isInterestOnly', label: 'Interest-Only Draw Period?', type: 'checkbox', defaultValue: true }
    ],
    outputs: [
      { id: 'monthlyPayment', label: 'Estimated Monthly Payment', formula: 'if_eq(isInterestOnly, 1, balance * (interestRate / 100 / 12), balance * ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), 180)) / (pow(1 + (interestRate / 100 / 12), 180) - 1))', format: 'currency', prefix: '$', highlight: true, description: 'Shows draw period interest-only versus 15-year amortized repayment amount' },
      { id: 'annualCost', label: 'Annual Interest Carrying Cost', formula: 'balance * (interestRate / 100)', format: 'currency', prefix: '$' }
    ]
  },

  'house-affordability-calculator': {
    shortDescription: 'Compute your maximum affordable purchase price based on lender front-end and back-end debt-to-income (DTI) thresholds.',
    fields: [
      { id: 'annualIncome', label: 'Gross Annual Income', type: 'number', defaultValue: 95000, prefix: '$', min: 10000, max: 100000000 },
      { id: 'downPayment', label: 'Cash Down Payment Saved', type: 'number', defaultValue: 40000, prefix: '$', min: 0, max: 10000000 },
      { id: 'monthlyDebts', label: 'Other Monthly Debts', type: 'number', defaultValue: 450, prefix: '$', suffix: '/mo', min: 0, max: 50000, helpText: 'Minimum monthly payments for cars, credit cards, student loans' },
      { id: 'interestRate', label: 'Interest Rate (%)', type: 'number', defaultValue: 6.5, suffix: '%', min: 0.1, max: 25 },
      { id: 'targetBackEndDti', label: 'Lender Max Back-End DTI (%)', type: 'select', defaultValue: 36, options: [{ label: 'Conservative (36%)', value: 36 }, { label: 'Standard Conventional (43%)', value: 43 }, { label: 'Aggressive FHA (50%)', value: 50 }], isAdvanced: true }
    ],
    outputs: [
      { id: 'maxPrice', label: 'Maximum Affordable Home Price', formula: 'downPayment + ((((annualIncome / 12) * (targetBackEndDti / 100)) - monthlyDebts) * (pow(1 + (interestRate / 100 / 12), 360) - 1) / ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), 360)))', format: 'currency', prefix: '$', highlight: true, description: 'Based on standard back-end debt limit and 30-year fixed loan terms' },
      { id: 'monthlyPI', label: 'Maximum Monthly P&I Allowance', formula: '(((annualIncome / 12) * (targetBackEndDti / 100)) - monthlyDebts)', format: 'currency', prefix: '$' },
      { id: 'monthlyGross', label: 'Gross Monthly Income', formula: 'annualIncome / 12', format: 'currency', prefix: '$' }
    ]
  },

  'credit-card-calculator': {
    shortDescription: 'Discover how long it will take to pay off a credit card balance making only minimum payments versus fixed monthly payments.',
    fields: [
      { id: 'balance', label: 'Credit Card Balance', type: 'number', defaultValue: 5000, prefix: '$', min: 0, max: 1000000 },
      { id: 'interestRate', label: 'Annual APR (%)', type: 'number', defaultValue: 21.99, suffix: '%', min: 1, max: 80 },
      { id: 'minPaymentPercent', label: 'Minimum Payment Percentage', type: 'number', defaultValue: 2.5, suffix: '%', min: 1, max: 20 },
      { id: 'minPaymentFloor', label: 'Minimum Payment Floor ($)', type: 'number', defaultValue: 25, prefix: '$', min: 5, max: 200 }
    ],
    outputs: [
      { id: 'firstMonthMin', label: 'First Month Minimum Payment', formula: 'max(minPaymentFloor, balance * (minPaymentPercent / 100))', format: 'currency', prefix: '$', highlight: true },
      { id: 'firstMonthInterest', label: 'First Month Interest Accrual', formula: 'balance * (interestRate / 100 / 12)', format: 'currency', prefix: '$' },
      { id: 'interestPaidLifecycle', label: 'Estimated Total Interest (If paying only min)', formula: 'balance * (interestRate / 100) * 1.5', format: 'currency', prefix: '$', description: 'Under standard minimum amortization rules' }
    ]
  },

  'debt-payoff-calculator': {
    shortDescription: 'Create a payment plan to accelerate payoff schedules using snowball or avalanche strategies.',
    fields: [
      { id: 'totalDebt', label: 'Total Debt Outstanding', type: 'number', defaultValue: 18000, prefix: '$', min: 0, max: 10000000 },
      { id: 'avgInterestRate', label: 'Weighted Average Rate (%)', type: 'number', defaultValue: 12.5, suffix: '%', min: 0, max: 100 },
      { id: 'monthlyPayment', label: 'Current Total Monthly Payment', type: 'number', defaultValue: 600, prefix: '$', suffix: '/mo', min: 10, max: 50000 },
      { id: 'extraPayment', label: 'Snowball Extra Monthly Payment', type: 'number', defaultValue: 150, prefix: '$', suffix: '/mo', min: 0, max: 50000 }
    ],
    outputs: [
      { id: 'monthsToPayoff', label: 'Months to Zero Debt (Standard)', formula: 'nper(avgInterestRate / 100 / 12, -monthlyPayment, totalDebt)', format: 'integer', suffix: ' months', highlight: true },
      { id: 'monthsAccelerated', label: 'Months to Zero (With Snowball Extra)', formula: 'nper(avgInterestRate / 100 / 12, -(monthlyPayment + extraPayment), totalDebt)', format: 'integer', suffix: ' months' },
      { id: 'interestSaved', label: 'Total Interest Saved', formula: '((monthlyPayment * nper(avgInterestRate / 100 / 12, -monthlyPayment, totalDebt)) - totalDebt) - (((monthlyPayment + extraPayment) * nper(avgInterestRate / 100 / 12, -(monthlyPayment + extraPayment), totalDebt)) - totalDebt)', format: 'currency', prefix: '$' }
    ]
  },

  'pension-calculator': {
    shortDescription: 'Estimate your future corporate or municipal pension payouts based on service years, final average salary, and multiplier caps.',
    fields: [
      { id: 'yearsOfService', label: 'Total Years of Service', type: 'number', defaultValue: 25, suffix: 'yrs', min: 1, max: 60 },
      { id: 'finalAverageSalary', label: 'Final Average Salary (High-3 or High-5)', type: 'number', defaultValue: 82000, prefix: '$', min: 1000, max: 5000000 },
      { id: 'pensionMultiplier', label: 'Pension Benefit Multiplier (%)', type: 'number', defaultValue: 2.0, suffix: '%', min: 0.1, max: 10, step: 0.05, helpText: 'Multiplier per year of service, typically 1.5% to 2.5%' }
    ],
    outputs: [
      { id: 'annualPayout', label: 'Annual Pension Benefit', formula: 'finalAverageSalary * (yearsOfService * (pensionMultiplier / 100))', format: 'currency', prefix: '$', highlight: true },
      { id: 'monthlyPayout', label: 'Monthly Pension Benefit', formula: '(finalAverageSalary * (yearsOfService * (pensionMultiplier / 100))) / 12', format: 'currency', prefix: '$' },
      { id: 'wageReplacementPct', label: 'Wage Replacement Ratio', formula: 'yearsOfService * pensionMultiplier', format: 'percent', suffix: '%' }
    ]
  },

  'student-loan-calculator': {
    shortDescription: 'Calculate monthly payments and amortization schedules for student loan balances, including standard and extended terms.',
    fields: [
      { id: 'balance', label: 'Student Loan Balance', type: 'number', defaultValue: 37000, prefix: '$', min: 0, max: 1000000 },
      { id: 'interestRate', label: 'Interest Rate (%)', type: 'number', defaultValue: 5.5, suffix: '%', min: 0, max: 30 },
      { id: 'termYears', label: 'Repayment Term (Years)', type: 'select', defaultValue: 10, options: [{ label: 'Standard 10-Year Plan', value: 10 }, { label: 'Extended 15-Year Plan', value: 15 }, { label: 'Extended 20-Year Plan', value: 20 }, { label: 'Extended 25-Year Plan', value: 25 }] }
    ],
    outputs: [
      { id: 'monthlyPayment', label: 'Monthly Payment', formula: 'balance * ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), termYears * 12)) / (pow(1 + (interestRate / 100 / 12), termYears * 12) - 1)', format: 'currency', prefix: '$', highlight: true },
      { id: 'totalInterest', label: 'Total Interest Paid', formula: '(balance * ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), termYears * 12)) / (pow(1 + (interestRate / 100 / 12), termYears * 12) - 1) * termYears * 12) - balance', format: 'currency', prefix: '$' },
      { id: 'totalPayments', label: 'Total Repayment Cost', formula: 'balance * ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), termYears * 12)) / (pow(1 + (interestRate / 100 / 12), termYears * 12) - 1) * termYears * 12', format: 'currency', prefix: '$' }
    ]
  },

  'roth-ira-calculator': {
    shortDescription: 'Determine your Roth IRA tax-free growth, projected retirement nest egg, and compare tax-exempt withdrawal compounding benefits.',
    fields: [
      { id: 'currentAge', label: 'Current Age', type: 'number', defaultValue: 30, suffix: 'yrs', min: 18, max: 80 },
      { id: 'retireAge', label: 'Retirement Age', type: 'number', defaultValue: 65, suffix: 'yrs', min: 59, max: 95 },
      { id: 'startingBalance', label: 'Roth IRA Starting Balance', type: 'number', defaultValue: 10000, prefix: '$', min: 0, max: 10000000 },
      { id: 'contribution', label: 'Annual Contributions', type: 'number', defaultValue: 7000, prefix: '$', min: 0, max: 20000, helpText: 'Standard IRS annual limits apply ($7,000 for 2024 plus catch-up)' },
      { id: 'rateOfReturn', label: 'Annual Rate of Return (%)', type: 'number', defaultValue: 8.0, suffix: '%', min: 0.1, max: 40 }
    ],
    outputs: [
      { id: 'futureValue', label: 'Projected Tax-Free Nest Egg', formula: 'startingBalance * pow(1 + (rateOfReturn / 100), retireAge - currentAge) + (contribution * (pow(1 + (rateOfReturn / 100), retireAge - currentAge) - 1) / (rateOfReturn / 100))', format: 'currency', prefix: '$', highlight: true },
      { id: 'totalContributed', label: 'Total Personal Contributions', formula: 'startingBalance + (contribution * (retireAge - currentAge))', format: 'currency', prefix: '$' },
      { id: 'totalTaxSavings', label: 'Total Tax-Free Compound Growth', formula: '(startingBalance * pow(1 + (rateOfReturn / 100), retireAge - currentAge) + (contribution * (pow(1 + (rateOfReturn / 100), retireAge - currentAge) - 1) / (rateOfReturn / 100))) - (startingBalance + (contribution * (retireAge - currentAge)))', format: 'currency', prefix: '$' }
    ]
  },

  'ira-calculator': {
    shortDescription: 'Compare Traditional tax-deductible contributions with Roth IRA options and determine the future value after tax adjustments.',
    fields: [
      { id: 'currentAge', label: 'Current Age', type: 'number', defaultValue: 30, suffix: 'yrs', min: 18, max: 80 },
      { id: 'retireAge', label: 'Retirement Age', type: 'number', defaultValue: 65, suffix: 'yrs', min: 59, max: 95 },
      { id: 'startingBalance', label: 'Starting Balance', type: 'number', defaultValue: 5000, prefix: '$', min: 0, max: 10000000 },
      { id: 'contribution', label: 'Annual Contributions', type: 'number', defaultValue: 7000, prefix: '$', min: 0, max: 20000 },
      { id: 'rateOfReturn', label: 'Expected Rate of Return (%)', type: 'number', defaultValue: 7.5, suffix: '%', min: 0.1, max: 40 },
      { id: 'currentTaxRate', label: 'Current Tax Rate (%)', type: 'number', defaultValue: 24.0, suffix: '%', min: 0, max: 60 }
    ],
    outputs: [
      { id: 'futureValue', label: 'Projected Traditional IRA Balance', formula: 'startingBalance * pow(1 + (rateOfReturn / 100), retireAge - currentAge) + (contribution * (pow(1 + (rateOfReturn / 100), retireAge - currentAge) - 1) / (rateOfReturn / 100))', format: 'currency', prefix: '$', highlight: true, description: 'Balance at retirement (taxable upon withdrawal)' },
      { id: 'totalContributed', label: 'Total Cash Contributions', formula: 'startingBalance + (contribution * (retireAge - currentAge))', format: 'currency', prefix: '$' },
      { id: 'taxSavingsUpfront', label: 'Annual Upfront Tax Deduction', formula: 'contribution * (currentTaxRate / 100)', format: 'currency', prefix: '$', description: 'Tax savings on current traditional deductions' }
    ]
  },

  'rmd-calculator': {
    shortDescription: 'Calculate IRS Required Minimum Distributions (RMD) from Traditional IRAs and 401(k) retirement accounts.',
    fields: [
      { id: 'accountBalance', label: 'Retirement Account Balance', type: 'number', defaultValue: 250000, prefix: '$', min: 0, max: 100000000 },
      { id: 'rmdAge', label: 'Beneficiary / Account Holder Age', type: 'select', defaultValue: 73, options: [{ label: 'Age 73 (1/26.5)', value: 73 }, { label: 'Age 74 (1/25.5)', value: 74 }, { label: 'Age 75 (1/24.6)', value: 75 }, { label: 'Age 80 (1/20.2)', value: 80 }, { label: 'Age 85 (1/16.0)', value: 85 }, { label: 'Age 90 (1/12.2)', value: 90 }] }
    ],
    outputs: [
      { id: 'rmdAmount', label: 'Required Minimum Distribution (RMD)', formula: 'if_eq(rmdAge, 73, accountBalance / 26.5, if_eq(rmdAge, 74, accountBalance / 25.5, if_eq(rmdAge, 75, accountBalance / 24.6, if_eq(rmdAge, 80, accountBalance / 20.2, if_eq(rmdAge, 85, accountBalance / 16.0, accountBalance / 12.2)))))', format: 'currency', prefix: '$', highlight: true, description: 'Minimum mandatory taxable withdrawal amount based on IRS uniform lifetime table' },
      { id: 'remainingBalance', label: 'Remaining Account Balance', formula: 'accountBalance - if_eq(rmdAge, 73, accountBalance / 26.5, if_eq(rmdAge, 74, accountBalance / 25.5, if_eq(rmdAge, 75, accountBalance / 24.6, if_eq(rmdAge, 80, accountBalance / 20.2, if_eq(rmdAge, 85, accountBalance / 16.0, accountBalance / 12.2)))))', format: 'currency', prefix: '$' }
    ]
  },

  'refinance-calculator': {
    shortDescription: 'Compare your current loan carrying rate to a new refi mortgage option and calculate the payback break-even month.',
    fields: [
      { id: 'remainingBalance', label: 'Remaining Loan Balance', type: 'number', defaultValue: 280000, prefix: '$', min: 1000, max: 10000000 },
      { id: 'currentRate', label: 'Current Interest Rate (%)', type: 'number', defaultValue: 7.25, suffix: '%', min: 0.1, max: 25 },
      { id: 'remainingTerm', label: 'Remaining Term (Years)', type: 'number', defaultValue: 25, suffix: 'yrs', min: 1, max: 40 },
      { id: 'newRate', label: 'New Refinance Rate (%)', type: 'number', defaultValue: 5.85, suffix: '%', min: 0.1, max: 25 },
      { id: 'closingCosts', label: 'Refinance Closing Costs', type: 'number', defaultValue: 4500, prefix: '$', min: 0, max: 100000 }
    ],
    outputs: [
      { id: 'monthlySavings', label: 'Net Monthly Payment Savings', formula: '(remainingBalance * ((currentRate / 100 / 12) * pow(1 + (currentRate / 100 / 12), remainingTerm * 12)) / (pow(1 + (currentRate / 100 / 12), remainingTerm * 12) - 1)) - (remainingBalance * ((newRate / 100 / 12) * pow(1 + (newRate / 100 / 12), remainingTerm * 12)) / (pow(1 + (newRate / 100 / 12), remainingTerm * 12) - 1))', format: 'currency', prefix: '$', highlight: true },
      { id: 'breakEvenMonths', label: 'Break-Even Payback Period', formula: 'if_gt((remainingBalance * ((currentRate / 100 / 12) * pow(1 + (currentRate / 100 / 12), remainingTerm * 12)) / (pow(1 + (currentRate / 100 / 12), remainingTerm * 12) - 1)) - (remainingBalance * ((newRate / 100 / 12) * pow(1 + (newRate / 100 / 12), remainingTerm * 12)) / (pow(1 + (newRate / 100 / 12), remainingTerm * 12) - 1)), 0, closingCosts / ((remainingBalance * ((currentRate / 100 / 12) * pow(1 + (currentRate / 100 / 12), remainingTerm * 12)) / (pow(1 + (currentRate / 100 / 12), remainingTerm * 12) - 1)) - (remainingBalance * ((newRate / 100 / 12) * pow(1 + (newRate / 100 / 12), remainingTerm * 12)) / (pow(1 + (newRate / 100 / 12), remainingTerm * 12) - 1))), 0)', format: 'integer', suffix: ' months', description: 'Month in which cumulative refi savings offset the upfront closing fees' },
      { id: 'currentPayment', label: 'Current Monthly Payment', formula: 'remainingBalance * ((currentRate / 100 / 12) * pow(1 + (currentRate / 100 / 12), remainingTerm * 12)) / (pow(1 + (currentRate / 100 / 12), remainingTerm * 12) - 1)', format: 'currency', prefix: '$' },
      { id: 'newPayment', label: 'New Monthly Payment', formula: 'remainingBalance * ((newRate / 100 / 12) * pow(1 + (newRate / 100 / 12), remainingTerm * 12)) / (pow(1 + (newRate / 100 / 12), remainingTerm * 12) - 1)', format: 'currency', prefix: '$' }
    ]
  },

  'rent-vs-buy-calculator': {
    shortDescription: 'Determine whether renting or homeownership makes more financial sense based on property costs, rental rates, and expected equity appreciation.',
    fields: [
      { id: 'monthlyRent', label: 'Monthly Rent Cost', type: 'number', defaultValue: 1800, prefix: '$', suffix: '/mo', min: 0, max: 50000 },
      { id: 'homePrice', label: 'Target Home Purchase Price', type: 'number', defaultValue: 350000, prefix: '$', min: 10000, max: 20000000 },
      { id: 'downPayment', label: 'Cash Down Payment Saved', type: 'number', defaultValue: 70000, prefix: '$', min: 0, max: 10000000 },
      { id: 'interestRate', label: 'Mortgage Interest Rate (%)', type: 'number', defaultValue: 6.5, suffix: '%', min: 0.1, max: 25 },
      { id: 'holdingYears', label: 'Duration / Holding Period', type: 'number', defaultValue: 7, suffix: 'yrs', min: 1, max: 30 }
    ],
    outputs: [
      { id: 'monthlyBuyPI', label: 'Estimated Buy Payment (P&I)', formula: '(homePrice - downPayment) * ((interestRate / 100 / 12) * pow(1 + (interestRate / 100 / 12), 360)) / (pow(1 + (interestRate / 100 / 12), 360) - 1)', format: 'currency', prefix: '$', highlight: true },
      { id: 'totalRentCost', label: 'Total Rent Paid Over Period', formula: 'monthlyRent * 12 * holdingYears', format: 'currency', prefix: '$' },
      { id: 'totalEquityBuilt', label: 'Projected Equity Built', formula: 'downPayment + (homePrice * 0.03 * holdingYears)', format: 'currency', prefix: '$', description: 'Assumes conservative 3% annual real estate appreciation' }
    ]
  },

  'payback-period-calculator': {
    shortDescription: 'Calculate the break-even timeline for capital investments, tooling, or project installations.',
    fields: [
      { id: 'initialCost', label: 'Initial Outlay Cost', type: 'number', defaultValue: 15000, prefix: '$', min: 1, max: 100000000 },
      { id: 'annualRevenue', label: 'Annual Net Cash Flows', type: 'number', defaultValue: 3800, prefix: '$', suffix: '/yr', min: 1, max: 10000000 }
    ],
    outputs: [
      { id: 'paybackPeriod', label: 'Payback Break-Even Period', formula: 'initialCost / annualRevenue', format: 'decimal_2', suffix: ' years', highlight: true, description: 'Number of years required to recover the initial cash investment' },
      { id: 'roiPct', label: 'Estimated Simple Annual ROI', formula: '(annualRevenue / initialCost) * 100', format: 'percent', suffix: '%' }
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
console.log(`Successfully populated ${updatedCount} calculators in data/db.json with specific + dynamic Calculator.net definitions!`);
