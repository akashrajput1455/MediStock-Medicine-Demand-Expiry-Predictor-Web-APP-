import React from 'react';
import { 
  LayoutDashboard, 
  Pill, 
  Boxes, 
  ShieldAlert, 
  TrendingUp, 
  FileSpreadsheet, 
  Code2, 
  LogOut, 
  DownloadCloud,
  CheckCircle2
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  onDownloadZip: () => void;
  expiredCount: number;
  lowStockCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onDownloadZip,
  expiredCount,
  lowStockCount
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'medicines', label: 'Medicines Master', icon: Pill },
    { id: 'inventory', label: 'Inventory Flow', icon: Boxes, badge: lowStockCount > 0 ? `${lowStockCount} low` : null, badgeColor: 'bg-amber-100 text-amber-700' },
    { id: 'expiry', label: 'Expiry Monitor', icon: ShieldAlert, badge: expiredCount > 0 ? `${expiredCount} exp` : null, badgeColor: 'bg-red-100 text-red-700' },
    { id: 'prediction', label: 'Demand Predictor', icon: TrendingUp, highlight: 'AI/ML' },
    { id: 'reports', label: 'Reports & CSV', icon: FileSpreadsheet },
    { id: 'python-code', label: 'Python & Viva Code', icon: Code2, highlight: 'MCA' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-base leading-tight">MediStock</h1>
            <p className="text-[11px] text-teal-600 font-medium">Demand & Expiry AI/ML</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Core Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                  : 'text-slate-600 hover:text-sky-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.highlight && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                    isActive ? 'bg-sky-500 text-white' : 'bg-teal-50 text-teal-700 border border-teal-200'
                  }`}>
                    {item.highlight}
                  </span>
                )}
                {item.badge && !isActive && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Quick Download Python Zip Pill */}
      <div className="px-3 pb-3">
        <button
          onClick={onDownloadZip}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg text-xs font-semibold shadow-sm hover:from-teal-600 hover:to-emerald-700 transition"
          title="Download complete standalone Python Flask + MySQL code"
        >
          <DownloadCloud className="w-3.5 h-3.5" />
          <span>Download Python Code (.zip)</span>
        </button>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
              {currentUser?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate leading-tight">
                {currentUser?.full_name || 'Admin Pharmacist'}
              </p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] text-slate-400">{currentUser?.role || 'Administrator'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
