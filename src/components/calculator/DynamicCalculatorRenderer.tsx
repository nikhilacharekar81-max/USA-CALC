import React, { useState, useMemo } from 'react';
import { Calculator } from '../../types/schema.ts';
import { InputsModule } from './modules/InputsModule.tsx';
import { ResultsModule } from './modules/ResultsModule.tsx';
import { ScheduleModule } from './modules/ScheduleModule.tsx';
import { ChartModule } from './modules/ChartModule.tsx';
import { FormulaGuideModule } from './modules/FormulaGuideModule.tsx';
import {
  evaluateFormula,
  generateAmortizationSchedule,
  generateInvestmentSchedule,
} from '../../utils/mathEngine.ts';
import { Calculator as CalcIcon, RefreshCw, Share2, Printer, Check, Copy } from 'lucide-react';

interface DynamicCalculatorRendererProps {
  calculator: Calculator;
}

export const DynamicCalculatorRenderer: React.FC<DynamicCalculatorRendererProps> = ({ calculator }) => {
  const fields = calculator.fields || [];
  const outputs = calculator.outputs || [];

  // Initialize form values from field defaults
  const initialValues = useMemo(() => {
    const vals: Record<string, any> = {};
    fields.forEach((f) => {
      vals[f.id] = f.defaultValue ?? 0;
    });
    return vals;
  }, [calculator]);

  const [formValues, setFormValues] = useState<Record<string, any>>(initialValues);
  const [copied, setCopied] = useState(false);

  // Update a single field
  const handleValueChange = (fieldId: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: typeof value === 'string' && !isNaN(Number(value)) && value !== '' ? Number(value) : value,
    }));
  };

  // Reset to initial defaults
  const handleReset = () => {
    setFormValues(initialValues);
  };

  // Compute calculated outputs using the mathematical engine
  const calculatedValues = useMemo(() => {
    const results: Record<string, number> = {};
    const context: Record<string, number> = {};

    // Prepare numeric context from form values
    fields.forEach((f) => {
      const v = formValues[f.id];
      context[f.id] = typeof v === 'number' ? v : parseFloat(v) || 0;
    });

    // Evaluate each formula
    outputs.forEach((out) => {
      if (out.formula) {
        const computed = evaluateFormula(out.formula, { ...context, ...results });
        results[out.id] = computed;
      } else {
        results[out.id] = 0;
      }
    });

    return results;
  }, [formValues, fields, outputs]);

  // Compute Donut visualization breakdown slices
  const donutData = useMemo(() => {
    const isLoan =
      calculator.slug.includes('mortgage') ||
      calculator.slug.includes('loan') ||
      calculator.slug.includes('auto') ||
      calculator.slug.includes('credit') ||
      calculator.slug.includes('debt');

    const isInvestment =
      calculator.slug.includes('investment') ||
      calculator.slug.includes('compound') ||
      calculator.slug.includes('retirement') ||
      calculator.slug.includes('savings') ||
      calculator.slug.includes('401k') ||
      calculator.slug.includes('annuity') ||
      calculator.slug.includes('pension') ||
      calculator.slug.includes('cd') ||
      calculator.slug.includes('ira') ||
      calculator.slug.includes('bond') ||
      calculator.slug.includes('interest') ||
      calculator.slug.includes('roi') ||
      calculator.slug.includes('irr');

    if (isLoan) {
      const principal =
        formValues['homePrice'] && formValues['downPayment']
          ? Math.max(0, formValues['homePrice'] - formValues['downPayment'])
          : formValues['loanAmount'] || formValues['principalAmount'] || formValues['autoPrice'] || 10000;
      const interest = calculatedValues['totalInterest'] || (calculatedValues['monthlyPayment'] ? calculatedValues['monthlyPayment'] * 12 : 5000);
      const tax = (formValues['propertyTax'] || formValues['salesTaxAmount'] || 0) * (formValues['loanTerm'] || 5);
      const insurance = (formValues['homeInsurance'] || 0) * (formValues['loanTerm'] || 5);
      const hoa = (formValues['hoaFee'] || 0) * 12 * (formValues['loanTerm'] || 5);

      return [
        { label: 'Principal', value: Math.max(0, principal), color: '#2563eb' },
        { label: 'Total Interest', value: Math.max(0, interest), color: '#ef4444' },
        ...(tax > 0 ? [{ label: 'Property Tax', value: tax, color: '#10b981' }] : []),
        ...(insurance > 0 ? [{ label: 'Insurance', value: insurance, color: '#f59e0b' }] : []),
        ...(hoa > 0 ? [{ label: 'HOA Fees', value: hoa, color: '#8b5cf6' }] : []),
      ];
    }

    if (isInvestment) {
      const initialDep = formValues['startingAmount'] || formValues['initialPrincipal'] || formValues['currentSavings'] || formValues['initialDeposit'] || 10000;
      const years = formValues['years'] || formValues['investmentYears'] || (formValues['retireAge'] && formValues['currentAge'] ? formValues['retireAge'] - formValues['currentAge'] : 10);
      const monthlyDep = formValues['monthlyContribution'] || (formValues['annualContribution'] ? formValues['annualContribution'] / 12 : 0);
      const annualDep = formValues['annualContribution'] || (monthlyDep ? monthlyDep * 12 : 0);

      const totalInvestedPrincipal = initialDep + (monthlyDep * 12 * years) + (annualDep * years);
      const totalFV = calculatedValues['futureValue'] || calculatedValues['nominalFutureValue'] || calculatedValues['totalFutureValue'] || calculatedValues['finalBalance'] || 25000;
      const totalProfit = calculatedValues['totalEarnings'] || calculatedValues['totalInterestEarned'] || calculatedValues['totalGrowth'] || Math.max(0, totalFV - totalInvestedPrincipal);

      return [
        { label: 'Total Principal Invested', value: Math.max(0, totalInvestedPrincipal), color: '#2563eb' },
        { label: 'Total Investment Profit / Growth', value: Math.max(0, totalProfit), color: '#10b981' },
      ];
    }

    // Default breakdown from output fields
    const positiveOutputs = outputs
      .filter((o) => !o.highlight && (calculatedValues[o.id] || 0) > 0)
      .slice(0, 4);

    const colors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'];
    return positiveOutputs.map((o, idx) => ({
      label: o.label,
      value: calculatedValues[o.id] || 0,
      color: colors[idx % colors.length],
    }));
  }, [formValues, calculatedValues, calculator.slug, outputs]);

  // Compute Amortization / Payoff / Growth Schedule
  const scheduleData = useMemo(() => {
    const isLoan =
      calculator.slug.includes('mortgage') ||
      calculator.slug.includes('loan') ||
      calculator.slug.includes('auto') ||
      calculator.slug.includes('credit') ||
      calculator.slug.includes('debt') ||
      calculator.slug.includes('repayment');

    const isInvestment =
      calculator.slug.includes('investment') ||
      calculator.slug.includes('compound') ||
      calculator.slug.includes('retirement') ||
      calculator.slug.includes('savings') ||
      calculator.slug.includes('401k') ||
      calculator.slug.includes('cd');

    if (isLoan) {
      const principal =
        formValues['homePrice'] && formValues['downPayment']
          ? Math.max(0, formValues['homePrice'] - formValues['downPayment'])
          : formValues['loanAmount'] || formValues['principalAmount'] || formValues['autoPrice'] || 25000;
      const rate = formValues['interestRate'] || 6.5;
      const termYears = formValues['loanTerm'] || formValues['loanTermYears'] || (formValues['loanTermMonths'] ? formValues['loanTermMonths'] / 12 : 5);
      const extraMonthly = formValues['extraPayment'] || 0;

      return generateAmortizationSchedule(principal, rate, termYears, extraMonthly);
    }

    if (isInvestment) {
      const initPrincipal = formValues['startingAmount'] || formValues['initialPrincipal'] || formValues['currentSavings'] || 10000;
      const monthlyContrib = formValues['monthlyContribution'] || 0;
      const annualContrib = formValues['annualContribution'] || (formValues['monthlyContribution'] ? 0 : 6000);
      const returnRate = formValues['growthRate'] || formValues['annualReturn'] || formValues['preRetireReturn'] || 7.5;
      const years = formValues['years'] || formValues['investmentYears'] || (formValues['retireAge'] && formValues['currentAge'] ? formValues['retireAge'] - formValues['currentAge'] : 15);
      const inflation = formValues['inflationRate'] || formValues['annualInflation'] || 0;
      const expenseRatio = formValues['expenseRatio'] || 0;

      const inv = generateInvestmentSchedule(initPrincipal, monthlyContrib, annualContrib, returnRate, years, inflation, expenseRatio);

      // Map to standard schedule entries
      const mappedAnnual = inv.annualSchedule.map((a, i) => ({
        period: a.year,
        year: a.year,
        month: 12,
        dateStr: `Year ${a.year}`,
        beginningBalance: a.startingBalance,
        payment: a.contribution,
        principalPaid: a.contribution,
        interestPaid: a.growth,
        extraPayment: 0,
        endingBalance: a.endingBalance,
        totalInterestPaidToDate: a.growth,
      }));

      return {
        annualSchedule: mappedAnnual,
        monthlySchedule: mappedAnnual,
        payoffMonths: mappedAnnual.length * 12,
        totalPrincipalPaid: inv.totalContributed,
        totalInterestPaid: inv.totalGrowth,
        totalExtraPaid: 0,
        totalPayments: inv.finalBalance,
      };
    }

    return null;
  }, [formValues, calculator.slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-8 font-sans">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1dbf73]" />
          <span className="text-xs font-bold text-slate-700">Calculator.net Engine Active</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1.5 bg-[#1dbf73]/10 hover:bg-[#1dbf73]/20 text-[#059669] rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Exact Calculator.net Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Inputs & Parameters Module (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <InputsModule
            fields={fields}
            formValues={formValues}
            onValueChange={handleValueChange}
            onReset={handleReset}
            settings={{
              title: `${calculator.name} Inputs`,
              layout: 'two-column',
              showResetButton: true,
            }}
          />
        </div>

        {/* RIGHT COLUMN: Results & Mathematical Summary Module (5 cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
          <ResultsModule
            outputs={outputs}
            calculatedValues={calculatedValues}
            currencySymbol="$"
            donutData={donutData}
          />
        </div>
      </div>

      {/* Interactive Payoff / Growth Curve Visual Simulation */}
      {scheduleData && scheduleData.annualSchedule.length > 1 && (
        <ChartModule
          schedule={scheduleData.annualSchedule}
          currencySymbol="$"
          title={`${calculator.name} Progression Curve`}
        />
      )}

      {/* Amortization / Payoff / Savings Schedule Table */}
      {scheduleData && (
        <ScheduleModule
          annualSchedule={scheduleData.annualSchedule}
          monthlySchedule={scheduleData.monthlySchedule}
          currencySymbol="$"
          title={`${calculator.name} Full Schedule`}
        />
      )}
    </div>
  );
};
