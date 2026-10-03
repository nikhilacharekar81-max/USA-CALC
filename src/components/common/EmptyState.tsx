import React from 'react';
import { Calculator, ArrowLeft, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  actionHref?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Results Found',
  description = 'We could not find any calculators matching your request.',
  actionText = 'Back to Home',
  onAction,
  actionHref = '/',
}) => {
  return (
    <div className="text-center py-16 px-4 max-w-md mx-auto space-y-4">
      <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto border border-slate-200">
        <Calculator className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500">{description}</p>
      <div className="pt-2">
        {onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="px-4 py-2 bg-[#1dbf73] hover:bg-[#19a463] text-white rounded-xl text-xs font-bold transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{actionText}</span>
          </button>
        ) : (
          <a
            href={actionHref}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors shadow-sm inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{actionText}</span>
          </a>
        )}
      </div>
    </div>
  );
};
