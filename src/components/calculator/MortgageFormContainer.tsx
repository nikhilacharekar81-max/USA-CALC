import React from 'react';

export const MortgageFormContainer: React.FC = () => {
  return (
    <form id="mortgageCalculatorForm" className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 max-w-2xl mx-auto font-sans">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <span>US Mortgage Calculator Parameters</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Exact Calculator.net baseline configuration including primary financing, escrow taxes, fees, and extra payoff acceleration.
        </p>
      </div>

      {/* 1. Primary Loan Parameters Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          1. Primary Financing
        </h3>

        {/* 1. Home Value / Purchase Price ($) */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700">
            <label htmlFor="homePrice" className="flex items-center gap-1 cursor-pointer">
              <span>Home Value / Purchase Price ($)</span>
              <span className="text-[10px] text-slate-400 font-normal cursor-help" title="Total purchase price or appraised value of the property in USD.">ⓘ</span>
            </label>
          </div>
          <input
            type="range"
            min={50000}
            max={2000000}
            step={5000}
            defaultValue={400000}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-slate-400">$</span>
            <input
              id="homePrice"
              name="homePrice"
              type="number"
              min={50000}
              max={2000000}
              defaultValue={400000}
              placeholder="400,000"
              className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* 2 & 3. Down Payment ($ AND %) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="downPaymentDollar" className="block text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer">
              <span>Down Payment ($)</span>
              <span className="text-[10px] text-slate-400 font-normal cursor-help" title="Upfront cash payment towards the home purchase price.">ⓘ</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-slate-400">$</span>
              <input
                id="downPaymentDollar"
                name="downPaymentDollar"
                type="number"
                min={0}
                max={2000000}
                defaultValue={80000}
                placeholder="80,000"
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="downPaymentPercent" className="block text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer">
              <span>Down Payment (%)</span>
              <span className="text-[10px] text-slate-400 font-normal cursor-help" title="Percentage of home value paid upfront (20% avoids PMI).">ⓘ</span>
            </label>
            <input
              type="range"
              min={0}
              max={95}
              step={0.5}
              defaultValue={20}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="relative">
              <input
                id="downPaymentPercent"
                name="downPaymentPercent"
                type="number"
                min={0}
                max={95}
                step={0.5}
                defaultValue={20}
                placeholder="20"
                className="w-full px-3 pr-7 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-bold text-slate-400">%</span>
            </div>
          </div>
        </div>

        {/* 4 & 5. Interest Rate (%) & Loan Term */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="interestRate" className="block text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer">
              <span>Interest Rate (%)</span>
              <span className="text-[10px] text-slate-400 font-normal cursor-help" title="Annual mortgage interest rate APR.">ⓘ</span>
            </label>
            <input
              type="range"
              min={1.0}
              max={15.0}
              step={0.15}
              defaultValue={6.75}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="relative">
              <input
                id="interestRate"
                name="interestRate"
                type="number"
                min={1.0}
                max={15.0}
                step={0.01}
                defaultValue={6.75}
                placeholder="6.75"
                className="w-full px-3 pr-7 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-bold text-slate-400">%</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="loanTerm" className="block text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer">
              <span>Loan Term</span>
              <span className="text-[10px] text-slate-400 font-normal cursor-help" title="Select mortgage repayment duration.">ⓘ</span>
            </label>
            <select
              id="loanTerm"
              name="loanTerm"
              defaultValue="30"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
            >
              <option value="30">30-yr fixed</option>
              <option value="20">20-yr fixed</option>
              <option value="15">15-yr fixed</option>
              <option value="10">10-yr fixed</option>
              <option value="5">5/1 ARM</option>
            </select>
          </div>
        </div>

        {/* 6. Start Date (Month & Year Selectors) */}
        <div className="space-y-1.5">
          <label htmlFor="startDate" className="block text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer">
            <span>Start Date</span>
            <span className="text-[10px] text-slate-400 font-normal cursor-help" title="First mortgage payment month and year.">ⓘ</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <select
              id="startDate"
              name="startDate"
              defaultValue="Oct"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
            >
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              type="number"
              defaultValue={2026}
              min={2020}
              max={2050}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* 2. Escrow, Taxes & Fees Section */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          2. Escrow, Taxes & HOA Fees
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 7. Property Tax */}
          <div className="space-y-1.5">
            <label htmlFor="propertyTax" className="block text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer">
              <span>Property Taxes (% OR $/yr)</span>
              <span className="text-[10px] text-slate-400 font-normal cursor-help" title="Annual property tax rate or direct annual dollar amount.">ⓘ</span>
            </label>
            <div className="relative">
              <input
                id="propertyTax"
                name="propertyTax"
                type="number"
                step={0.05}
                defaultValue={1.2}
                placeholder="1.2"
                className="w-full px-3 pr-7 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-bold text-slate-400">%</span>
            </div>
          </div>

          {/* 8. Home Insurance */}
          <div className="space-y-1.5">
            <label htmlFor="homeInsurance" className="block text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer">
              <span>Homeowner&apos;s Insurance ($/yr)</span>
              <span className="text-[10px] text-slate-400 font-normal cursor-help" title="Annual hazard and property insurance premium.">ⓘ</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-slate-400">$</span>
              <input
                id="homeInsurance"
                name="homeInsurance"
                type="number"
                step={50}
                defaultValue={1500}
                placeholder="1,500"
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 9. PMI Rate */}
          <div className="space-y-1.5">
            <label htmlFor="pmiRate" className="block text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer">
              <span>PMI Rate (%)</span>
              <span className="text-[10px] text-slate-400 font-normal cursor-help" title="Private Mortgage Insurance rate applied if Down Payment < 20%. Auto-cancels at 78% LTV.">ⓘ</span>
            </label>
            <div className="relative">
              <input
                id="pmiRate"
                name="pmiRate"
                type="number"
                step={0.1}
                defaultValue={0.5}
                placeholder="0.5"
                className="w-full px-3 pr-7 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-bold text-slate-400">%</span>
            </div>
          </div>

          {/* 10. HOA Fee */}
          <div className="space-y-1.5">
            <label htmlFor="hoaFee" className="block text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer">
              <span>HOA / Condo Fee ($/mo)</span>
              <span className="text-[10px] text-slate-400 font-normal cursor-help" title="Monthly Homeowners Association or condo dues.">ⓘ</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-slate-400">$</span>
              <input
                id="hoaFee"
                name="hoaFee"
                type="number"
                step={25}
                defaultValue={0}
                placeholder="0"
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Extra Payments Section */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          3. Extra Payments & Acceleration
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 11. Extra Monthly Payment */}
          <div className="space-y-1.5">
            <label htmlFor="extraMonthly" className="block text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer">
              <span>Extra Monthly Payment ($/mo)</span>
              <span className="text-[10px] text-slate-400 font-normal cursor-help" title="Additional principal payment made every month to shorten payoff.">ⓘ</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-slate-400">$</span>
              <input
                id="extraMonthly"
                name="extraMonthly"
                type="number"
                step={50}
                defaultValue={0}
                placeholder="0"
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* 12. Extra Yearly Payment */}
          <div className="space-y-1.5">
            <label htmlFor="extraYearly" className="block text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer">
              <span>Extra Yearly Payment ($/yr)</span>
              <span className="text-[10px] text-slate-400 font-normal cursor-help" title="Additional principal payment made once every year on anniversary.">ⓘ</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-slate-400">$</span>
              <input
                id="extraYearly"
                name="extraYearly"
                type="number"
                step={500}
                defaultValue={0}
                placeholder="0"
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
