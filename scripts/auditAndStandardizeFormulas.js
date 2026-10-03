import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'data', 'db.json');

if (fs.existsSync(dbPath)) {
  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

  if (Array.isArray(dbData.calculators)) {
    let updatedCount = 0;

    dbData.calculators = dbData.calculators.map((calc) => {
      let modified = false;
      const outputs = calc.outputs || [];

      // Check outputs for investment/savings/401k/retirement calculators
      const isInvestmentType =
        calc.slug.includes('investment') ||
        calc.slug.includes('compound') ||
        calc.slug.includes('retirement') ||
        calc.slug.includes('401k') ||
        calc.slug.includes('savings') ||
        calc.slug.includes('annuity') ||
        calc.slug.includes('pension');

      if (isInvestmentType) {
        calc.outputs = outputs.map((out) => {
          if (out.id === 'totalInvested' || out.id === 'totalDeposits' || out.id === 'principalInvested') {
            modified = true;
            return {
              ...out,
              formula: 'startingAmount + (monthlyContribution * 12 * years)',
              description: 'Out-of-pocket cash deposits (Initial Principal + Total Monthly Contributions over time)',
            };
          }

          if (out.id === 'futureValue' || out.id === 'nominalFutureValue' || out.id === 'totalFutureValue') {
            modified = true;
            return {
              ...out,
              formula:
                '(startingAmount * pow(1 + (annualReturn / 100) / 12, 12 * years)) + (monthlyContribution * (pow(1 + (annualReturn / 100) / 12, 12 * years) - 1) / ((annualReturn / 100) / 12))',
              description: 'Nominal future wealth balance with monthly compounding',
            };
          }

          if (out.id === 'inflationAdjustedValue' || out.id === 'realValue' || out.id === 'todaysDollars') {
            modified = true;
            return {
              ...out,
              formula: 'totalFutureValue / pow(1 + (annualInflation / 100), years)',
              description: 'Real purchasing power in Today’s Dollars discounted by annual inflation rate',
            };
          }

          if (out.id === 'totalEarnings' || out.id === 'totalGrowth' || out.id === 'totalInterestEarned') {
            modified = true;
            return {
              ...out,
              formula: 'max(0, totalFutureValue - totalInvested)',
              description: 'Total compound interest and market returns earned over time',
            };
          }

          return out;
        });
      }

      if (modified) updatedCount++;
      return calc;
    });

    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf-8');
    console.log(`✅ Audited and standardized formulas across all calculators in db.json! Updated ${updatedCount} calculators.`);
  }
}
