import React, { useState } from 'react';
import { 
  Pill, 
  Boxes, 
  AlertTriangle, 
  XOctagon, 
  Clock, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Medicine, Sale, InventoryTransaction, ExpirySummary } from '../types';
import { formatINR } from '../utils/currency';

interface DashboardViewProps {
  medicines: Medicine[];
  sales: Sale[];
  transactions: InventoryTransaction[];
  expirySummary: ExpirySummary;
  onNavigateTab: (tab: string) => void;
  onSelectMedicineForPrediction: (medicineId: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  medicines,
  sales,
  transactions,
  expirySummary,
  onNavigateTab,
  onSelectMedicineForPrediction
}) => {
  const [selectedChartPoint, setSelectedChartPoint] = useState<string | null>(null);

  // Core metrics
  const totalMedicines = medicines.length;
  const totalStockUnits = medicines.reduce((acc, m) => acc + m.quantity, 0);
  const lowStockMeds = medicines.filter(m => m.quantity > 0 && m.quantity <= m.minimum_stock);
  const outOfStockMeds = medicines.filter(m => m.quantity === 0);
  const totalValuation = medicines.reduce((acc, m) => acc + m.quantity * m.purchase_price, 0);
  const totalRetailValuation = medicines.reduce((acc, m) => acc + m.quantity * m.selling_price, 0);
  const profitMargin = totalRetailValuation - totalValuation;

  // 1. Category Distribution
  const categoryMap: Record<string, number> = {};
  medicines.forEach(m => {
    categoryMap[m.category] = (categoryMap[m.category] || 0) + 1;
  });
  const categoryEntries = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

  // Colors for categories
  const palette = ['#0284c7', '#0d9488', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#64748b', '#06b6d4'];

  // 2. Monthly Consumption
  const monthlyConsumption: Record<string, number> = {};
  sales.forEach(s => {
    const monthKey = s.sale_date.substring(0, 7); // YYYY-MM
    monthlyConsumption[monthKey] = (monthlyConsumption[monthKey] || 0) + s.quantity_sold;
  });
  const sortedMonths = Object.keys(monthlyConsumption).sort();
  const maxMonthlySales = Math.max(...Object.values(monthlyConsumption), 100);

  // 3. Stock Health Breakdown
  const stockHealth = [
    { label: 'Safe Stock', count: medicines.filter(m => m.quantity > m.minimum_stock && m.expiry_status !== 'EXPIRED').length, color: 'bg-emerald-500' },
    { label: 'Low Stock', count: lowStockMeds.length, color: 'bg-amber-500' },
    { label: 'Expiring Soon', count: expirySummary.total_expiring_soon, color: 'bg-orange-500' },
    { label: 'Expired', count: expirySummary.expired_count, color: 'bg-red-500' },
    { label: 'Out of Stock', count: outOfStockMeds.length, color: 'bg-rose-700' },
  ];

  // 4. Paracetamol Demand Trend Data
  const paracetamolActual = [100, 120, 110, 130, 140];
  const paracetamolTrend = [102, 111, 120, 129, 138, 147]; // OLS projection
  const trendMonths = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov (Est)'];

  // Priority alert items
  const priorityMeds = medicines
    .filter(m => m.expiry_status === 'EXPIRED' || m.expiry_status === 'EXPIRING_30_DAYS' || m.quantity <= m.minimum_stock)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Alert Banner if any expired or low stock */}
      {(expirySummary.expired_count > 0 || lowStockMeds.length > 0) && (
        <div className="bg-gradient-to-r from-amber-500/10 via-red-500/10 to-transparent border-l-4 border-amber-500 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Action Required: {expirySummary.expired_count} Expired Batch{expirySummary.expired_count > 1 ? 'es' : ''} & {lowStockMeds.length} Low-Stock SKU(s)
              </h3>
              <p className="text-xs text-slate-600">
                Expired medicines are quarantined from dispensing. Review expiry watchlist and trigger procurement reorders.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onNavigateTab('expiry')}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              Open Expiry Monitor
            </button>
            <button
              onClick={() => onNavigateTab('prediction')}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              Run Demand Prediction
            </button>
          </div>
        </div>
      )}

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* 1. Total Medicines */}
        <div 
          onClick={() => onNavigateTab('medicines')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Total Catalog</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Pill className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800">{totalMedicines}</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>Active SKUs</span>
          </div>
        </div>

        {/* 2. Total Stock Units */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Total Units</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800">{totalStockUnits.toLocaleString()}</div>
          <div className="mt-1 text-[11px] text-slate-500">
            Across {medicines.length} medicine batches
          </div>
        </div>

        {/* 3. Low-Stock Medicines */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Low Stock Alert</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold ${lowStockMeds.length > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
            {lowStockMeds.length}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-700">
            <ArrowDownRight className="w-3 h-3" />
            <span>&le; Minimum threshold</span>
          </div>
        </div>

        {/* 4. Expired Medicines */}
        <div 
          onClick={() => onNavigateTab('expiry')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Expired Batches</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <XOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold ${expirySummary.expired_count > 0 ? 'text-red-600' : 'text-slate-800'}`}>
            {expirySummary.expired_count}
          </div>
          <div className="mt-1 text-[11px] text-red-600 font-medium">
            Blocked from dispensing
          </div>
        </div>

        {/* 5. Expiring Soon */}
        <div 
          onClick={() => onNavigateTab('expiry')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Expiring &le; 90d</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {expirySummary.total_expiring_soon}
          </div>
          <div className="mt-1 text-[11px] text-orange-700">
            {expirySummary.expiring_30_count} batch(es) &le; 30 days
          </div>
        </div>

        {/* 6. Inventory Valuation */}
        <div 
          onClick={() => onNavigateTab('reports')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Inventory Valuation</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
              ₹
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {formatINR(totalValuation)}
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 font-medium">
            +{formatINR(profitMargin)} margin
          </div>
        </div>
      </div>

      {/* 4 Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Category Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">1. Medicine Category Distribution</h3>
              <p className="text-xs text-slate-400">Share of SKUs by therapeutic category in MySQL</p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-medium">
              {categoryEntries.length} Categories
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {categoryEntries.slice(0, 6).map(([category, count], idx) => {
              const pct = Math.round((count / totalMedicines) * 100);
              const color = palette[idx % palette.length];
              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{category}</span>
                    <span className="text-slate-500 font-semibold">{count} item{count > 1 ? 's' : ''} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Monthly Medicine Consumption */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">2. Monthly Medicine Consumption (Units Sold)</h3>
              <p className="text-xs text-slate-400">Historical pharmacy sales volume used for AI/ML training</p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full font-medium">
              Pandas Aggregated
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-100 px-2">
            {sortedMonths.map((m) => {
              const units = monthlyConsumption[m];
              const heightPct = Math.round((units / maxMonthlySales) * 100);
              const label = new Date(m + '-01').toLocaleDateString('en-US', { month: 'short' });

              return (
                <div key={m} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow pointer-events-none whitespace-nowrap z-10">
                    {units} units dispensed
                  </div>
                  <div 
                    className="w-full bg-sky-500 hover:bg-sky-600 rounded-t-md transition-all duration-300 relative"
                    style={{ height: `${heightPct}%` }}
                  >
                    <div className="absolute top-1 inset-x-0 text-center text-[10px] font-bold text-white">
                      {units}
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">{label}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 text-center text-xs text-slate-400">
            Total historical sales volume: <strong>{sales.reduce((a, s) => a + s.quantity_sold, 0)} units</strong>
          </div>
        </div>

        {/* Chart 3: Stock Health Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">3. Stock Health & Shelf Status</h3>
              <p className="text-xs text-slate-400">Operational condition breakdown across all inventory</p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-medium">
              FEFO Priority
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stockHealth.map((item) => (
              <div key={item.label} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                  <span className="text-xs text-slate-600 font-medium truncate">{item.label}</span>
                </div>
                <div className="text-xl font-bold text-slate-800">{item.count}</div>
                <span className="text-[10px] text-slate-400">
                  {Math.round((item.count / totalMedicines) * 100)}% of catalog
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: Demand Trend vs Linear Regression Forecast */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">4. Medicine Demand Trend vs Forecast</h3>
              <p className="text-xs text-slate-400">Paracetamol 650mg: Historical vs Ordinary Least Squares ($y = mx + c$)</p>
            </div>
            <button
              onClick={() => onSelectMedicineForPrediction(1)}
              className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
            >
              Analyze in Predictor &rarr;
            </button>
          </div>

          {/* SVG Trend Line Graph */}
          <div className="h-44 relative flex items-center justify-center border-b border-slate-100 pb-2">
            <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="#e2e8f0" strokeWidth="1" />

              {/* Linear Regression Trend Line (Dashed) */}
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="5,5"
                points="60,135 140,115 220,95 300,75 380,55 460,35"
              />

              {/* Actual Consumption Line */}
              <polyline
                fill="none"
                stroke="#0284c7"
                strokeWidth="3"
                points="60,140 140,95 220,115 300,75 380,55"
              />

              {/* Data points (Actual) */}
              {[
                { x: 60, y: 140, val: 100 },
                { x: 140, y: 95, val: 120 },
                { x: 220, y: 115, val: 110 },
                { x: 300, y: 75, val: 130 },
                { x: 380, y: 55, val: 140 },
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="5" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                  <text x={pt.x} y={pt.y - 10} textAnchor="middle" fill="#0284c7" fontSize="10" fontWeight="bold">
                    {pt.val}
                  </text>
                </g>
              ))}

              {/* Forecast Point */}
              <circle cx="460" cy="35" r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
              <text x="460" y="22" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="bold">
                147*
              </text>
            </svg>
          </div>

          <div className="flex items-center justify-between pt-3 text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-sky-700 font-medium">
                <span className="w-3 h-1 bg-sky-600 rounded"></span> Actual Sales
              </span>
              <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                <span className="w-3 h-1 bg-amber-500 rounded border-dashed"></span> OLS Regression ($m=+9.0$)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Predicted Next Month
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Formula: $y = 9.0x + 93.0$</span>
          </div>
        </div>

      </div>

      {/* Bottom Section: Recent Activities & Priority Attention Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Inventory Transactions (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Recent Inventory Movements</h3>
              <p className="text-xs text-slate-400">Recorded audit events in <code>inventory_transactions</code></p>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs text-sky-600 hover:text-sky-700 font-semibold"
            >
              View All History &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Date / Time</th>
                  <th className="py-2.5 px-3">Medicine</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Quantity</th>
                  <th className="py-2.5 px-3">Reason / Description</th>
                  <th className="py-2.5 px-3">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.slice(0, 6).map((tx) => (
                  <tr key={tx.transaction_id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {tx.transaction_date.substring(0, 16)}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {tx.medicine_name}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.transaction_type === 'IN' ? 'bg-emerald-100 text-emerald-800' :
                        tx.transaction_type === 'OUT' ? 'bg-sky-100 text-sky-800' :
                        tx.transaction_type === 'EXPIRED_DISCARD' ? 'bg-red-100 text-red-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {tx.transaction_type === 'IN' ? 'STOCK IN' :
                         tx.transaction_type === 'OUT' ? 'STOCK OUT' :
                         tx.transaction_type === 'EXPIRED_DISCARD' ? 'DISCARDED' : tx.transaction_type}
                      </span>
                    </td>
                    <td className={`py-2.5 px-3 font-bold ${tx.transaction_type === 'IN' ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {tx.transaction_type === 'IN' ? `+${tx.quantity}` : `-${tx.quantity}`}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">
                      {tx.description}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-600">
                        {tx.performed_by}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Priority Attention Items (1 col) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Priority Attention Items</h3>
                <p className="text-xs text-slate-400">Expired & low-stock triggers</p>
              </div>
              <button
                onClick={() => onNavigateTab('expiry')}
                className="text-xs text-sky-600 hover:text-sky-700 font-semibold"
              >
                Watchlist &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {priorityMeds.map((med) => (
                <div key={med.medicine_id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{med.medicine_name}</h4>
                    <p className="text-[11px] text-slate-500">
                      Batch: <code className="text-slate-700">{med.batch_number}</code> | Stock: <strong>{med.quantity}</strong>
                    </p>
                  </div>
                  <div className="text-right">
                    {med.expiry_status === 'EXPIRED' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                        Expired
                      </span>
                    ) : med.expiry_status === 'EXPIRING_30_DAYS' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200">
                        &le; 30 Days
                      </span>
                    ) : med.quantity <= med.minimum_stock ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                        Low Stock
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Quick Links:</span>
            <div className="flex gap-2">
              <button 
                onClick={() => onNavigateTab('medicines')}
                className="text-xs text-sky-600 hover:underline font-medium"
              >
                Catalog
              </button>
              <span className="text-slate-300">&bull;</span>
              <button 
                onClick={() => onNavigateTab('reports')}
                className="text-xs text-sky-600 hover:underline font-medium"
              >
                Reports
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
