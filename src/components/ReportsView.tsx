import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  XOctagon, 
  Layers
} from 'lucide-react';
import { Medicine, Sale, ExpirySummary } from '../types';
import { computeDemandPrediction } from '../services/predictionEngine';

interface ReportsViewProps {
  medicines: Medicine[];
  sales: Sale[];
  summary: ExpirySummary;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  medicines,
  sales,
  summary
}) => {
  const [reportType, setReportType] = useState<string>('inventory');

  // Compute Demand Forecast rows for all medicines
  const forecastRows = medicines.map(med => {
    const medSales = sales.filter(s => s.medicine_id === med.medicine_id);
    const pred = computeDemandPrediction(medSales, med.quantity, med.minimum_stock);
    return {
      medicine: med,
      prediction: pred
    };
  });

  const generateAndDownloadCsv = () => {
    let csvContent = '';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    let filename = `medistock_${reportType}_${timestamp}.csv`;

    if (reportType === 'consumption') {
      const headers = ['Sale ID', 'Date', 'Medicine Name', 'Batch', 'Quantity Sold', 'Total Amount (₹)', 'Reference'];
      const rows = sales.map(s => [
        s.sale_id,
        s.sale_date,
        `"${s.medicine_name || ''}"`,
        `"${s.batch_number || ''}"`,
        s.quantity_sold,
        s.total_amount.toFixed(2),
        `"${s.patient_reference || ''}"`
      ]);
      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    } else if (reportType === 'demand_forecast') {
      const headers = ['Medicine Name', 'Batch', 'Current Stock', 'Minimum Stock', 'Predicted Demand', 'Recommended Reorder', 'Urgency'];
      const rows = forecastRows.map(f => [
        `"${f.medicine.medicine_name}"`,
        `"${f.medicine.batch_number}"`,
        f.medicine.quantity,
        f.medicine.minimum_stock,
        f.prediction.sufficient_data ? f.prediction.predicted_units : 'N/A',
        f.prediction.recommended_reorder,
        `"${f.prediction.urgency_level}"`
      ]);
      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    } else {
      let filtered = medicines;
      if (reportType === 'low_stock') {
        filtered = medicines.filter(m => m.quantity > 0 && m.quantity <= m.minimum_stock);
      } else if (reportType === 'expired') {
        filtered = medicines.filter(m => m.expiry_status === 'EXPIRED');
      } else if (reportType === 'expiring_soon') {
        filtered = medicines.filter(m => m.expiry_status === 'EXPIRING_30_DAYS' || m.expiry_status === 'EXPIRING_60_DAYS' || m.expiry_status === 'EXPIRING_90_DAYS');
      }

      const headers = [
        'ID', 'Medicine Name', 'Category', 'Manufacturer', 'Batch Number', 
        'Purchase Price (₹)', 'Selling Price (₹)', 'Quantity', 'Min Stock', 
        'Mfg Date', 'Expiry Date', 'Supplier', 'Status', 'Days Remaining'
      ];
      const rows = filtered.map(m => [
        m.medicine_id,
        `"${m.medicine_name}"`,
        `"${m.category}"`,
        `"${m.manufacturer}"`,
        `"${m.batch_number}"`,
        m.purchase_price.toFixed(2),
        m.selling_price.toFixed(2),
        m.quantity,
        m.minimum_stock,
        m.manufacturing_date,
        m.expiry_date,
        `"${m.supplier_name}"`,
        `"${m.expiry_label || ''}"`,
        m.days_remaining || 0
      ]);
      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'inventory': return 'Complete Medicine Inventory Catalog';
      case 'low_stock': return 'Low Stock Reorder Alert Report';
      case 'expired': return 'Expired Batches Write-Off Audit Report';
      case 'expiring_soon': return 'Medicines Expiring Soon (≤ 90 Days Watchlist)';
      case 'consumption': return 'Historical Outpatient Sales & Consumption Ledger';
      case 'demand_forecast': return 'AI/ML Demand Forecast & Reorder Plan';
      default: return 'Report';
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Selector & Action Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between no-print">
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'inventory', label: 'Complete Inventory' },
            { id: 'low_stock', label: 'Low Stock' },
            { id: 'expired', label: 'Expired Batches' },
            { id: 'expiring_soon', label: 'Expiring Soon (≤ 90d)' },
            { id: 'consumption', label: 'Sales & Consumption' },
            { id: 'demand_forecast', label: 'Demand Forecast' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                reportType === tab.id
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={generateAndDownloadCsv}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>

      </div>

      {/* Printable Report Paper Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        
        {/* Report Header */}
        <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
              MediStock Healthcare Inventory System &bull; MCA Project
            </div>
            <h2 className="text-lg font-bold text-slate-800">{getReportTitle()}</h2>
            <p className="text-xs text-slate-400">Generated on System Date: Nov 1, 2026</p>
          </div>

          <button
            onClick={generateAndDownloadCsv}
            className="no-print text-xs text-sky-600 font-semibold hover:underline flex items-center gap-1"
          >
            <Download className="w-3 h-3" />
            <span>Export this data to .CSV</span>
          </button>
        </div>

        {/* Dynamic Table Render */}
        <div className="overflow-x-auto">
          {reportType === 'consumption' ? (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold text-[10px] uppercase border-b border-slate-200">
                  <th className="py-2.5 px-3">Sale ID</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Medicine Name</th>
                  <th className="py-2.5 px-3">Batch</th>
                  <th className="py-2.5 px-3 text-right">Units Sold</th>
                  <th className="py-2.5 px-3 text-right">Revenue (₹)</th>
                  <th className="py-2.5 px-3">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((s) => (
                  <tr key={s.sale_id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 text-slate-400 font-mono">#{s.sale_id}</td>
                    <td className="py-2.5 px-3 font-mono">{s.sale_date}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{s.medicine_name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{s.batch_number}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-sky-700">{s.quantity_sold}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-800">₹{s.total_amount.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-slate-500">{s.patient_reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : reportType === 'demand_forecast' ? (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold text-[10px] uppercase border-b border-slate-200">
                  <th className="py-2.5 px-3">Medicine Name</th>
                  <th className="py-2.5 px-3">Batch</th>
                  <th className="py-2.5 px-3">Current Stock</th>
                  <th className="py-2.5 px-3">Safety Min</th>
                  <th className="py-2.5 px-3 font-bold text-sky-700">Predicted Demand</th>
                  <th className="py-2.5 px-3 font-bold text-emerald-700">Recommended Order</th>
                  <th className="py-2.5 px-3">Procurement Urgency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {forecastRows.map((f) => (
                  <tr key={f.medicine.medicine_id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-bold text-slate-800">{f.medicine.medicine_name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{f.medicine.batch_number}</td>
                    <td className="py-2.5 px-3 font-semibold">{f.medicine.quantity} units</td>
                    <td className="py-2.5 px-3 text-slate-500">{f.medicine.minimum_stock} units</td>
                    <td className="py-2.5 px-3 font-bold text-sky-700">
                      {f.prediction.sufficient_data ? `${f.prediction.predicted_units} units` : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-700">
                      {f.prediction.recommended_reorder} units
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        f.prediction.urgency_level.includes('Critical') || f.prediction.urgency_level.includes('High')
                          ? 'bg-red-100 text-red-700'
                          : f.prediction.urgency_level.includes('Medium')
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {f.prediction.urgency_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold text-[10px] uppercase border-b border-slate-200">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Medicine Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Batch Number</th>
                  <th className="py-2.5 px-3">Cost / Sell (₹)</th>
                  <th className="py-2.5 px-3">Stock</th>
                  <th className="py-2.5 px-3">Expiry Date</th>
                  <th className="py-2.5 px-3">Shelf Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medicines
                  .filter(m => {
                    if (reportType === 'low_stock') return m.quantity > 0 && m.quantity <= m.minimum_stock;
                    if (reportType === 'expired') return m.expiry_status === 'EXPIRED';
                    if (reportType === 'expiring_soon') return m.expiry_status === 'EXPIRING_30_DAYS' || m.expiry_status === 'EXPIRING_60_DAYS' || m.expiry_status === 'EXPIRING_90_DAYS';
                    return true;
                  })
                  .map((med) => (
                    <tr key={med.medicine_id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 text-slate-400 font-mono">#{med.medicine_id}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{med.medicine_name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{med.category}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{med.batch_number}</td>
                      <td className="py-2.5 px-3 font-semibold">₹{med.purchase_price.toFixed(2)} / ₹{med.selling_price.toFixed(2)}</td>
                      <td className="py-2.5 px-3 font-bold">{med.quantity}</td>
                      <td className="py-2.5 px-3 font-semibold">{med.expiry_date}</td>
                      <td className="py-2.5 px-3">
                        {med.expiry_status === 'EXPIRED' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">Expired</span>
                        ) : med.expiry_status === 'EXPIRING_30_DAYS' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700">≤ 30 Days</span>
                        ) : med.quantity <= med.minimum_stock ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">Low Stock</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">Safe Stock</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>MediStock Reporting Subsystem &bull; Built for MCA Mini Project demonstration</span>
          <span>Verified against MySQL schema <code>medistock_db</code></span>
        </div>

      </div>
    </div>
  );
};
