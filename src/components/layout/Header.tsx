import React, { useState } from 'react';
import {
  Search,
  Shield,
  Menu,
  X,
  BookOpen,
  Home,
} from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
  brandName?: string;
  activeTab?: string;
  onSelectTab?: (tab: any) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  brandName = 'USA Focus',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-navy-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-50 w-full max-w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-usblue-600 to-usred-500 flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-105 transition-transform shrink-0">
              US
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight block leading-none text-white">
                {brandName}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Financial Resource Platform
              </span>
            </div>
          </a>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center space-x-2">
            <a
              href="/"
              className="px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-2 text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <Home className="w-4 h-4 mr-1 shrink-0" />
              <span>Home</span>
            </a>

            <a
              href="/blog"
              className="px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-2 text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <BookOpen className="w-4 h-4 mr-1 shrink-0" />
              <span>Financial Guides &amp; Blog</span>
            </a>
          </nav>

          {/* Quick Actions (Search, Admin, Mobile Toggle) */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onOpenSearch}
              title="Search articles and resources"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>

            <a
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-usblue-500" />
              <span>Admin Console</span>
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 py-3 space-y-2">
            <a
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </a>
            <a
              href="/blog"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <BookOpen className="w-4 h-4" />
              <span>Financial Guides &amp; Blog</span>
            </a>
            <a
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <Shield className="w-4 h-4 text-usblue-500" />
              <span>Admin Console</span>
            </a>
          </div>
        )}
      </div>
    </header>
  );
};
