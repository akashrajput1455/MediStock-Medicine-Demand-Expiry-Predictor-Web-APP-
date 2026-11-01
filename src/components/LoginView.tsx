import React, { useState } from 'react';
import { Pill, Lock, User as UserIcon, ArrowRight, ShieldCheck, Database, Sparkles } from 'lucide-react';
import { User } from '../types';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (username === 'admin' && password === 'admin123') {
      onLogin({
        user_id: 1,
        username: 'admin',
        full_name: 'Dr. Akash Rajput (Head Pharmacist)',
        role: 'Administrator'
      });
    } else if (username === 'staff' && password === 'staff123') {
      onLogin({
        user_id: 2,
        username: 'staff',
        full_name: 'Pooja Verma (Pharmacy Assistant)',
        role: 'Staff'
      });
    } else {
      setError('Invalid credentials. Use admin / admin123 or staff / staff123.');
    }
  };

  const fillQuick = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 mx-auto">
            <Pill className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">MediStock</h1>
          <p className="text-xs text-slate-500 font-medium">Medicine Demand & Expiry Predictor System</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-[11px] font-semibold">
            <Sparkles className="w-3 h-3 text-teal-600" />
            <span>MCA (AI & ML) Python Mini Project</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-800">Sign in to Pharmacy Dashboard</h2>
            <p className="text-xs text-slate-400">Enter your credentials to manage medicine stock and forecast demand.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Username</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-800"
                  placeholder="e.g. admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-800"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-md shadow-sky-600/20 flex items-center justify-center gap-1.5 transition"
            >
              <span>Access MediStock</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 block mb-2">1-Click Demonstration Login:</span>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => fillQuick('admin', 'admin123')}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                Admin (admin / admin123)
              </button>
              <button
                type="button"
                onClick={() => fillQuick('staff', 'staff123')}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                Staff (staff / staff123)
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400 space-y-1">
          <p>&copy; 2026 MediStock. Python 3 &bull; Flask &bull; MySQL 8.x &bull; Pandas</p>
          <p className="text-[11px]">Designed for Pharmacy Inventory Optimization</p>
        </div>

      </div>
    </div>
  );
};
