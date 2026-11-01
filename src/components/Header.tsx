import React from 'react';
import { 
  Database, 
  Calendar, 
  AlertTriangle, 
  Plus, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onOpenAddMedicine: () => void;
  onResetData: () => void;
  expiredCount: number;
  lowStockCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenAddMedicine,
  onResetData,
  expiredCount,
  lowStockCount
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Executive Inventory & Expiry Dashboard';
      case 'medicines': return 'Medicine Inventory Master Catalog';
      case 'inventory': return 'Stock Movements & Dispensing Logs';
      case 'expiry': return 'Automated Shelf-Life & Expiry Watchlist';
      case 'prediction': return 'Medicine Demand & Procurement Predictor';
      case 'reports': return 'Reporting Portal & CSV Data Exports';
      case 'python-code': return 'Python Architecture & MCA Viva Preparation';
      default: return 'Overview';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>MediStock System</span>
            <span>/</span>
            <span className="capitalize text-slate-600 font-medium">{activeTab.replace('-', ' ')}</span>
          </div>
          <h2 className="text-base font-bold text-slate-800 leading-tight">
            {getTabTitle()}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* System Date Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-xs text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>System Date: <strong>Nov 1, 2026</strong></span>
        </div>

        {/* Database Connected Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-full text-xs text-teal-700 font-medium">
          <Database className="w-3.5 h-3.5 text-teal-600" />
          <span>MySQL 8.x Active</span>
        </div>

        {/* Expiry Alert Badge */}
        {expiredCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full text-xs text-red-700 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>{expiredCount} Expired Batch{expiredCount > 1 ? 'es' : ''}</span>
          </div>
        )}

        {/* Reset Data Button */}
        <button
          onClick={onResetData}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs flex items-center gap-1.5 transition"
          title="Reset to default demonstration sample data"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Reset Data</span>
        </button>

        {/* Add Medicine Action */}
        <button
          onClick={onOpenAddMedicine}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medicine</span>
        </button>
      </div>
    </header>
  );
};
