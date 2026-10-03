import React, { useState } from 'react';
import { ScheduleEntry, formatCurrencyValue } from '../../../utils/mathEngine.ts';
import { Calendar, Download, Printer, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';

interface ScheduleModuleProps {
  annualSchedule: ScheduleEntry[];
  monthlySchedule: ScheduleEntry[];
  currencySymbol?: string;
  title?: string;
}

export const ScheduleModule: React.FC<ScheduleModuleProps> = ({
  annualSchedule,
  monthlySchedule,
  currencySymbol = '$',
  title = 'Amortization & Payoff Schedule',
}) => {
  const [viewMode, setViewMode] = useState<'annual' | 'monthly'>('annual');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 12;

  const currentData = viewMode === 'annual' ? annualSchedule : monthlySchedule;
  const totalPages = Math.ceil(currentData.length / rowsPerPage) || 1;
  const pageEntries = currentData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleExportCSV = () => {
    const headers = ['Period', 'Date/Year', 'Beginning Balance', 'Payment', 'Principal Paid', 'Interest Paid', 'Extra Payment', 'Ending Balance'];
    const rows = currentData.map((e) => [
      e.period,
      `"${e.dateStr}"`,
      e.beginningBalance.toFixed(2),
      e.payment.toFixed(2),
      e.principalPaid.toFixed(2),
      e.interestPaid.toFixed(2),
      e.extraPayment.toFixed(2),
      e.endingBalance.toFixed(2),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `amortization_schedule_${viewMode}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  if (!annualSchedule || annualSchedule.length === 0) return null;

  return (
    <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-5">
      {/* Schedule Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-black text-slate-900">{title}</h4>
            <p className="text-xs text-slate-500">Period-by-period principal, interest, and payoff progression</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setViewMode('annual');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'annual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('monthly');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
          </div>

          {/* Action Buttons */}
          <button
            type="button"
            onClick={handleExportCSV}
            title="Download CSV"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors border border-slate-200 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handlePrint}
            title="Print Schedule"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors border border-slate-200 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-3 text-center">{viewMode === 'annual' ? 'Year' : 'Mo / Date'}</th>
              <th className="p-3 text-right">Beginning Balance</th>
              <th className="p-3 text-right">Total Payment</th>
              <th className="p-3 text-right text-emerald-700">Principal</th>
              <th className="p-3 text-right text-rose-700">Interest</th>
              <th className="p-3 text-right">Ending Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageEntries.map((row) => (
              <tr key={row.period} className="hover:bg-slate-50/70 transition-colors">
                <td className="p-3 font-bold text-center text-slate-800">{row.dateStr}</td>
                <td className="p-3 text-right text-slate-600">{formatCurrencyValue(row.beginningBalance, currencySymbol, 2)}</td>
                <td className="p-3 text-right font-semibold text-slate-900">{formatCurrencyValue(row.payment, currencySymbol, 2)}</td>
                <td className="p-3 text-right font-bold text-emerald-600">{formatCurrencyValue(row.principalPaid, currencySymbol, 2)}</td>
                <td className="p-3 text-right text-rose-600">{formatCurrencyValue(row.interestPaid, currencySymbol, 2)}</td>
                <td className="p-3 text-right font-bold text-slate-900">{formatCurrencyValue(row.endingBalance, currencySymbol, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
          <span>
            Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, currentData.length)} of {currentData.length} entries
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-bold text-slate-800">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
