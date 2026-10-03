import React, { useState } from 'react';
import { ErrorBoundary } from '../common/ErrorBoundary.tsx';
import {
  LayoutDashboard,
  FolderTree,
  Layers,
  Calculator,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  BookOpen,
  Code,
  FileText,
} from 'lucide-react';
import { api } from '../../services/api.ts';

interface AdminLayoutProps {
  currentTab:
    | 'dashboard'
    | 'categories'
    | 'subcategories'
    | 'calculators'
    | 'modules'
    | 'content-seo'
    | 'settings'
    | 'calculator-editor'
    | 'embed-studio'
    | 'blogs'
    | 'blog-editor'
    | 'blog-categories'
    | 'blog-dashboard';
  onNavigate: (
    tab:
      | 'dashboard'
      | 'categories'
      | 'subcategories'
      | 'calculators'
      | 'modules'
      | 'content-seo'
      | 'settings'
      | 'calculator-editor'
      | 'embed-studio'
      | 'blogs'
      | 'blog-editor'
      | 'blog-categories'
      | 'blog-dashboard',
    param?: string
  ) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onNavigate,
  onLogout,
  children,
}) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const calcNavItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'categories', label: 'Calc Categories', icon: FolderTree },
    { id: 'subcategories', label: 'Calc Subcategories', icon: Layers },
    { id: 'calculators', label: 'Calculators', icon: Calculator },
    { id: 'modules', label: 'Modules & Order', icon: Layers },
  ] as const;

  const blogNavItems = [
    { id: 'blog-dashboard', label: 'Blog CMS Dashboard', icon: LayoutDashboard },
    { id: 'blogs', label: 'Blog Articles', icon: FileText },
    { id: 'blog-categories', label: 'Blog Categories & Subs', icon: FolderTree },
  ] as const;

  const customNavItems = [
    { id: 'content-seo', label: 'Rich-Text & SEO Content', icon: BookOpen },
    { id: 'embed-studio', label: 'Embed & Rich HTML Studio', icon: Code },
    { id: 'settings', label: 'Settings & SEO', icon: Settings },
  ] as const;

  const allNavItems = [...calcNavItems, ...blogNavItems, ...customNavItems];

  const handleLogoutClick = async () => {
    await api.logout();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans selection:bg-usblue-500 selection:text-white">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-navy-900 border-r border-slate-800 text-white shrink-0 select-none">
        {/* Brand Bar */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between">
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-usblue-600 to-usred-500 flex items-center justify-center text-white font-black text-sm shadow-md group-hover:scale-105 transition-transform">
              US
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight block leading-none text-white">
                USA Focus
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Admin Console
              </span>
            </div>
          </a>
        </div>

        {/* Navigation links */}
        <div className="flex-1 p-3 space-y-4 overflow-y-auto custom-scrollbar">
          {/* Group 1: Calculators */}
          <div className="space-y-1">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 py-1">
              Calculator Management
            </div>
            {calcNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentTab === item.id ||
                (item.id === 'calculators' && currentTab === 'calculator-editor');

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-usblue-600 text-white shadow-sm font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Group 2: Editorial CMS */}
          <div className="space-y-1">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 py-1 border-t border-slate-800 pt-3">
              Editorial Blog CMS
            </div>
            {blogNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentTab === item.id ||
                (item.id === 'blogs' && currentTab === 'blog-editor');

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-usblue-600 text-white shadow-sm font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Group 3: Settings & Customisation */}
          <div className="space-y-1">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 py-1 border-t border-slate-800 pt-3">
              Settings &amp; Tools
            </div>
            {customNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-usblue-600 text-white shadow-sm font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <span>Live Public Suite</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          <button
            type="button"
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-navy-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between text-white">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-usblue-600 to-usred-500 flex items-center justify-center text-white font-black text-xs shadow-md">
            US
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white">USA Focus Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden bg-navy-900 border-b border-slate-800 p-4 space-y-1.5 z-30 text-white">
          {allNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  setMobileNavOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl text-left ${
                  isActive
                    ? 'bg-usblue-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 text-usblue-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <a href="/" className="text-xs font-semibold text-slate-300 hover:text-white">
              View Public Site
            </a>
            <button
              onClick={handleLogoutClick}
              className="text-xs font-bold text-rose-400 hover:text-rose-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200 px-8 items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold capitalize">
            <span>Admin</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">{currentTab.replace('-', ' ')}</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-usblue-600 hover:text-usblue-700 px-3.5 py-1.5 rounded-lg border border-usblue-200 hover:bg-blue-50 flex items-center gap-1.5 transition-colors"
            >
              <span>View Public Platform</span>
              <ExternalLink className="w-3.5 h-3.5 text-usblue-600" />
            </a>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};
