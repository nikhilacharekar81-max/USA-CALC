import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 overflow-x-auto py-1">
      <ol className="inline-flex items-center space-x-1 sm:space-x-2">
        <li className="inline-flex items-center">
          <a
            href="/"
            className="inline-flex items-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <Home className="w-3.5 h-3.5 mr-1 text-slate-400" />
            <span>Home</span>
          </a>
        </li>
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 mx-1" />
            {item.isCurrent || !item.href ? (
              <span className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-none">
                {item.label}
              </span>
            ) : (
              <a
                href={item.href}
                className="text-slate-500 hover:text-slate-800 transition-colors truncate max-w-[150px] sm:max-w-none"
              >
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
