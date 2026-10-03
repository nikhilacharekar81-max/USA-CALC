import React from 'react';
import { Shield } from 'lucide-react';

interface FooterProps {
  brandName?: string;
  footerNotice?: string;
}

export const Footer: React.FC<FooterProps> = ({
  brandName = 'USA Focus',
}) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-8 w-full max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center text-xs text-slate-500 space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 font-medium">
          <a href="/" className="hover:text-usblue-600 transition-colors">
            Home
          </a>
          <a href="/blog" className="hover:text-usblue-600 transition-colors">
            Financial Guides &amp; Blog
          </a>
          <a href="/admin" className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-700 transition-colors">
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </a>
        </div>

        <p className="text-slate-600">
          {brandName} Financial Resource Platform &copy; 2026.
        </p>

        <p className="text-[11px] text-slate-400 max-w-2xl mx-auto">
          Disclaimer: Content is published for educational and research purposes only. Consult a certified financial advisor or CPA for personal investment or tax advice.
        </p>
      </div>
    </footer>
  );
};
