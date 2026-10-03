import React, { useState } from 'react';
import { ArrowRight, Lock, User, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '../services/api.ts';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.login({ username, passwordHash: password });
      if (res && res.token) {
        localStorage.setItem('calcplatform_admin_token', res.token);
        onLoginSuccess();
      } else {
        setError(res.message || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-usblue-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to public suite</span>
        </a>

        {/* USA Focus Emblem */}
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-usblue-600 to-usred-500 flex items-center justify-center text-white font-black text-2xl shadow-lg">
            US
          </div>
          <div className="text-left">
            <span className="font-black text-2xl tracking-tight block leading-none text-slate-900">
              USA Focus
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Admin Console Sign In
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Sign in to manage categories, subcategories, formulas, and SEO settings
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-8 border border-slate-200 rounded-2xl shadow-sm">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Admin Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:border-usblue-500 focus:ring-2 focus:ring-usblue-500/20 outline-none transition-all"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:border-usblue-500 focus:ring-2 focus:ring-usblue-500/20 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-usblue-600 hover:bg-usblue-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Authenticating...' : 'Sign In to Console'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-[11px] text-slate-500">
            Default credentials: <span className="font-mono font-bold text-slate-800">admin / admin123</span>
          </div>
        </div>
      </div>
    </div>
  );
};
