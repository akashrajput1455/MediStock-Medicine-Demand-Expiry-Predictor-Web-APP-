import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Clock, 
  XOctagon, 
  CheckCircle, 
  AlertTriangle, 
  Trash2, 
  DollarSign, 
  ArrowRight,
  Filter,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Medicine, ExpirySummary } from '../types';

interface ExpiryViewProps {
  medicines: Medicine[];
  summary: ExpirySummary;
  onQuarantineBatch: (medicineId: number) => void;
  onNavigateTab: (tab: string) => void;
}

export const ExpiryView: React.FC<ExpiryViewProps> = ({
  medicines,
  summary,
  onQuarantineBatch,
  onNavigateTab
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredMedicines = medicines.filter(med => {
    if (filterStatus === 'expired') return med.expiry_status === 'EXPIRED';
    if (filterStatus === '30') return med.expiry_status === 'EXPIRING_30_DAYS';
    if (filterStatus === '60') return med.expiry_status === 'EXPIRING_60_DAYS';
    if (filterStatus === '90') return med.expiry_status === 'EXPIRING_90_DAYS';
    if (filterStatus === 'safe') return med.expiry_status === 'SAFE';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 4 Risk Tier Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Expired */}
        <div className="bg-white p-5 rounded-xl border-l-4 border-l-red-500 border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Critical: Expired Batches</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
              Quarantine
            </span>
          </div>
          <div className="text-3xl font-bold text-red-600">{summary.expired_count}</div>
          <div className="mt-2 text-xs text-red-700 font-medium flex items-center gap-1">
            <span className="font-bold">₹</span>
            <span>₹{summary.expired_inventory_value.toFixed(2)} write-off valuation</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Blocked from patient dispensing.</p>
        </div>

        {/* 2. Expiring in <= 30 Days */}
        <div className="bg-white p-5 rounded-xl border-l-4 border-l-orange-500 border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Expiring &le; 30 Days</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700">
              Urgent FEFO
            </span>
          </div>
          <div className="text-3xl font-bold text-orange-600">{summary.expiring_30_count}</div>
          <div className="mt-2 text-xs text-orange-700 font-medium flex items-center gap-1">
            <span className="font-bold">₹</span>
            <span>₹{summary.at_risk_value_30_days.toFixed(2)} at immediate risk</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Prioritize or return to distributor.</p>
        </div>

        {/* 3. Expiring in 31 - 90 Days */}
        <div className="bg-white p-5 rounded-xl border-l-4 border-l-amber-500 border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Expiring 31–90 Days</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">
              Watchlist
            </span>
          </div>
          <div className="text-3xl font-bold text-amber-600">
            {summary.expiring_60_count + summary.expiring_90_count}
          </div>
          <div className="mt-2 text-xs text-amber-700 font-medium">
            {summary.expiring_60_count} within 60d &bull; {summary.expiring_90_count} within 90d
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Track monthly consumption trends.</p>
        </div>

        {/* 4. Safe Stock */}
        <div className="bg-white p-5 rounded-xl border-l-4 border-l-emerald-500 border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Safe Stock (&gt; 90 Days)</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
              Healthy
            </span>
          </div>
          <div className="text-3xl font-bold text-emerald-600">{summary.safe_count}</div>
          <div className="mt-2 text-xs text-emerald-700 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Optimal shelf longevity</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">No urgent action required.</p>
        </div>

      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-2 items-center">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Filter:</span>

        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
            filterStatus === 'all' ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Medicines ({medicines.length})
        </button>

        <button
          onClick={() => setFilterStatus('expired')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
            filterStatus === 'expired' ? 'bg-red-600 text-white shadow-xs' : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          Expired ({summary.expired_count})
        </button>

        <button
          onClick={() => setFilterStatus('30')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
            filterStatus === '30' ? 'bg-orange-600 text-white shadow-xs' : 'bg-orange-50 text-orange-700 border border-orange-200'
          }`}
        >
          &le; 30 Days ({summary.expiring_30_count})
        </button>

        <button
          onClick={() => setFilterStatus('60')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
            filterStatus === '60' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          &le; 60 Days ({summary.expiring_60_count})
        </button>

        <button
          onClick={() => setFilterStatus('90')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
            filterStatus === '90' ? 'bg-sky-600 text-white shadow-xs' : 'bg-sky-50 text-sky-700 border border-sky-200'
          }`}
        >
          &le; 90 Days ({summary.expiring_90_count})
        </button>

        <button
          onClick={() => setFilterStatus('safe')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
            filterStatus === 'safe' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          Safe Stock ({summary.safe_count})
        </button>
      </div>

      {/* Expiry Surveillance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Shelf-Life Countdown & Dispensation Policy</h3>
            <p className="text-xs text-slate-400">
              Calculated using Python <code>datetime</code> arithmetic relative to system time (Nov 1, 2026)
            </p>
          </div>
          <span className="text-xs text-slate-400">
            Showing {filteredMedicines.length} batches
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Medicine Name</th>
                <th className="py-3 px-4">Batch Number</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Days Remaining</th>
                <th className="py-3 px-4">Risk Classification</th>
                <th className="py-3 px-4">Units at Risk</th>
                <th className="py-3 px-4">Financial Risk (₹)</th>
                <th className="py-3 px-4">Recommended Policy</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMedicines.map((med) => {
                const isExpired = med.expiry_status === 'EXPIRED';
                const days = med.days_remaining || 0;

                return (
                  <tr 
                    key={med.medicine_id}
                    className={`hover:bg-slate-50/70 transition ${isExpired ? 'bg-red-50/40' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 text-xs">{med.medicine_name}</div>
                      <div className="text-[10px] text-slate-400">{med.category}</div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700">
                      <code>{med.batch_number}</code>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {med.expiry_date}
                    </td>

                    <td className="py-3 px-4">
                      {isExpired ? (
                        <span className="font-bold text-red-600">
                          {Math.abs(days)} days ago
                        </span>
                      ) : days <= 30 ? (
                        <span className="font-bold text-orange-600">
                          {days} days left!
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-700">
                          {days} days
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {isExpired ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 flex items-center gap-1 w-max">
                          <XOctagon className="w-3 h-3" /> Expired
                        </span>
                      ) : med.expiry_status === 'EXPIRING_30_DAYS' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200 flex items-center gap-1 w-max">
                          <AlertTriangle className="w-3 h-3" /> &le; 30 Days
                        </span>
                      ) : med.expiry_status === 'EXPIRING_60_DAYS' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 w-max">
                          &le; 60 Days
                        </span>
                      ) : med.expiry_status === 'EXPIRING_90_DAYS' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-700 border border-sky-200 w-max">
                          &le; 90 Days
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-max">
                          <CheckCircle className="w-3 h-3" /> Safe Stock
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-800">
                      {med.quantity} units
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-700">
                      ₹{((med.stock_value || 0)).toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-slate-500 max-w-xs text-[11px]">
                      {med.action_required}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {isExpired && med.quantity > 0 ? (
                        <button
                          onClick={() => {
                            if (window.confirm(`Quarantine and discard ${med.quantity} expired units of ${med.medicine_name} (Batch ${med.batch_number})? This will write off ₹${(med.stock_value || 0).toFixed(2)} and log EXPIRED_DISCARD transaction.`)) {
                              onQuarantineBatch(med.medicine_id);
                            }
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-xs flex items-center gap-1 ml-auto transition"
                          title="Quarantine & write off expired batch"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Discard</span>
                        </button>
                      ) : isExpired && med.quantity === 0 ? (
                        <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 bg-slate-100 rounded">
                          Quarantined (0)
                        </span>
                      ) : (
                        <button
                          onClick={() => onNavigateTab('inventory')}
                          className="px-2 py-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
                          title="Manage in inventory"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
