import React, { useState } from 'react';
import { 
  TrendingUp, 
  Calculator, 
  HelpCircle, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Sparkles,
  Info,
  DollarSign
} from 'lucide-react';
import { Medicine, Sale } from '../types';
import { computeDemandPrediction } from '../services/predictionEngine';

interface PredictionViewProps {
  medicines: Medicine[];
  sales: Sale[];
  selectedMedicineId: number;
  onSelectMedicine: (id: number) => void;
  onNavigateTab: (tab: string) => void;
}

export const PredictionView: React.FC<PredictionViewProps> = ({
  medicines,
  sales,
  selectedMedicineId,
  onSelectMedicine,
  onNavigateTab
}) => {
  const [method, setMethod] = useState<'linear_regression' | 'moving_average'>('linear_regression');
  const [showVivaNotes, setShowVivaNotes] = useState(true);

  const selectedMed = medicines.find(m => m.medicine_id === selectedMedicineId) || medicines[0];

  // Filter sales for the selected medicine
  const medSales = sales.filter(s => s.medicine_id === selectedMed?.medicine_id);

  // Compute prediction result
  const prediction = computeDemandPrediction(
    medSales,
    selectedMed?.quantity || 0,
    selectedMed?.minimum_stock || 20,
    method
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls Toolbar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end justify-between">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full">
            {/* Medicine Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Select Medicine to Analyze:
              </label>
              <select
                value={selectedMed?.medicine_id}
                onChange={(e) => onSelectMedicine(parseInt(e.target.value))}
                className="w-full text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-800"
              >
                {medicines.map((m) => (
                  <option key={m.medicine_id} value={m.medicine_id}>
                    {m.medicine_name} ({m.batch_number}) &mdash; Stock: {m.quantity} units
                  </option>
                ))}
              </select>
            </div>

            {/* Algorithm Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Forecasting Algorithm (MCA Syllabus):
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-800"
              >
                <option value="linear_regression">
                  Linear Regression (Ordinary Least Squares: y = mx + c) [Recommended]
                </option>
                <option value="moving_average">
                  Simple Moving Average (SMA - Last 3 Periods)
                </option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVivaNotes(!showVivaNotes)}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
              <span>{showVivaNotes ? 'Hide Viva Guide' : 'Show Viva Guide'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Results Container */}
      {!prediction.sufficient_data ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center max-w-2xl mx-auto my-8">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-amber-900 mb-1">Insufficient Historical Sales Data</h3>
          <p className="text-xs text-amber-700 mb-4">{prediction.message}</p>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-amber-700 transition"
          >
            Record Outpatient Dispensation in Inventory Flow &rarr;
          </button>
        </div>
      ) : (
        <>
          {/* 4 Forecast KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Predicted Demand */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-sky-600">
              <span className="text-xs font-semibold text-slate-400">Predicted Demand (Next Month)</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-sky-700">{prediction.predicted_units}</span>
                <span className="text-xs text-slate-500">units</span>
              </div>
              <div className="mt-2 text-xs text-sky-800 font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Trend Direction: <strong>{prediction.slope_trend}</strong></span>
              </div>
            </div>

            {/* 2. Available Stock */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-teal-600">
              <span className="text-xs font-semibold text-slate-400">Current Available Stock</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-slate-800">{prediction.current_stock}</span>
                <span className="text-xs text-slate-500">units</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Safety minimum: <strong>{prediction.minimum_stock} units</strong>
              </div>
            </div>

            {/* 3. Stock Health & Deficit */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
              <span className="text-xs font-semibold text-slate-400">Stock Adequacy Assessment</span>
              <div className="mt-2">
                <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                  prediction.stock_status === 'Deficit'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {prediction.stock_status === 'Deficit' ? 'Deficit Expected' : 'Stock Sufficient'}
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-600">
                Priority: <strong>{prediction.urgency_level}</strong>
              </div>
            </div>

            {/* 4. Recommended Purchase Order */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-600">
              <span className="text-xs font-semibold text-slate-400">Recommended Purchase Order</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-emerald-600">{prediction.recommended_reorder}</span>
                <span className="text-xs text-slate-500">units to order</span>
              </div>
              <div className="mt-2 text-xs text-emerald-800 font-medium">
                Includes +{prediction.safety_stock_buffer} units safety stock buffer
              </div>
            </div>

          </div>

          {/* Historical Data & Visual Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Historical Consumption Chart */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Monthly Consumption vs Forecast Point</h3>
                  <p className="text-xs text-slate-400">{selectedMed.medicine_name} &bull; Batch: {selectedMed.batch_number}</p>
                </div>
                <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-medium">
                  {prediction.total_periods} Periods
                </span>
              </div>

              {/* Chart Visual */}
              <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-100 px-2">
                {prediction.historical_data.map((item, idx) => {
                  const maxUnits = Math.max(...prediction.historical_data.map(d => d.units), prediction.predicted_units, 50);
                  const heightPct = Math.round((item.units / maxUnits) * 100);

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                      <div className="opacity-0 group-hover:opacity-100 transition absolute -top-8 bg-slate-800 text-white text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                        {item.units} units sold
                      </div>
                      <div 
                        className="w-full bg-sky-500 hover:bg-sky-600 rounded-t-md transition-all duration-300 relative"
                        style={{ height: `${heightPct}%` }}
                      >
                        <div className="absolute top-1 inset-x-0 text-center text-[10px] font-bold text-white">
                          {item.units}
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500">{item.month}</span>
                    </div>
                  );
                })}

                {/* Forecast Bar */}
                <div className="flex-1 flex flex-col items-center gap-2 group relative">
                  <div className="opacity-0 group-hover:opacity-100 transition absolute -top-8 bg-emerald-800 text-white text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                    Predicted: {prediction.predicted_units} units
                  </div>
                  <div 
                    className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-t-md transition-all duration-300 border-2 border-dashed border-emerald-300 relative"
                    style={{ 
                      height: `${Math.round((prediction.predicted_units / Math.max(...prediction.historical_data.map(d => d.units), prediction.predicted_units, 50)) * 100)}%` 
                    }}
                  >
                    <div className="absolute top-1 inset-x-0 text-center text-[10px] font-bold text-white">
                      {prediction.predicted_units}*
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700">Next Month</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-sky-700">
                  <span className="w-2.5 h-2.5 rounded-sm bg-sky-500"></span> Actual Historical Sales
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 border border-dashed border-emerald-300"></span> Predicted Next Demand
                </span>
              </div>
            </div>

            {/* Historical Breakdown Table */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm mb-3">Historical Consumption Ledger</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] font-semibold">
                        <th className="py-2.5 px-3">Period</th>
                        <th className="py-2.5 px-3 text-right">Units Sold</th>
                        <th className="py-2.5 px-3 text-right">Deviation from Mean</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {prediction.historical_data.map((row, idx) => {
                        const dev = row.units - prediction.average_monthly_consumption;
                        return (
                          <tr key={idx} className="hover:bg-slate-50/70">
                            <td className="py-2.5 px-3 font-semibold text-slate-700">{row.month}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-800">{row.units}</td>
                            <td className={`py-2.5 px-3 text-right font-medium ${dev > 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {dev > 0 ? `+${dev.toFixed(1)}` : dev.toFixed(1)}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-slate-50 font-bold border-t border-slate-200">
                        <td className="py-2.5 px-3 text-slate-800">Average Monthly Mean</td>
                        <td className="py-2.5 px-3 text-right text-sky-700">{prediction.average_monthly_consumption}</td>
                        <td className="py-2.5 px-3 text-right text-slate-400">&plusmn; 0.0</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Total Periods: <strong>{prediction.total_periods} months</strong></span>
                <span>Algorithm: <strong>{prediction.formula_used}</strong></span>
              </div>
            </div>

          </div>

          {/* Mathematical Logic & Transparency Box (MCA Project Viva Star Feature) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">
                  Mathematical Logic & Formula Walkthrough (Transparent Algorithm)
                </h3>
                <p className="text-xs text-slate-400">
                  Full step-by-step transparency using Python NumPy arrays and mathematical formulas (Zero black-box AI claims)
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-sky-800 mb-1">{prediction.formula_used}</div>
              <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
                {prediction.formula_details}
              </pre>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs">
                <strong className="text-slate-800 block mb-1">1. Gross Need:</strong>
                <code className="text-slate-600 block mb-1">Gross Need = Predicted Demand + Minimum Stock</code>
                <span className="text-slate-700 font-medium">
                  {prediction.predicted_units} + {prediction.minimum_stock} = <strong>{prediction.predicted_units + prediction.minimum_stock} units</strong>
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs">
                <strong className="text-slate-800 block mb-1">2. Safety Buffer:</strong>
                <code className="text-slate-600 block mb-1">Buffer = round(0.20 &times; Predicted Demand)</code>
                <span className="text-slate-700 font-medium">
                  20% of {prediction.predicted_units} = <strong>+{prediction.safety_stock_buffer} units</strong>
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs">
                <strong className="text-slate-800 block mb-1">3. Net Order:</strong>
                <code className="text-slate-600 block mb-1">Order = max(0, Gross Need - Current Stock)</code>
                <span className="text-emerald-700 font-bold">
                  Recommended Order: {prediction.recommended_reorder} units
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Viva Preparation Guidance (Collapsible) */}
      {showVivaNotes && (
        <div className="bg-gradient-to-br from-teal-50 to-sky-50 border border-teal-200 p-5 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>How to Explain this Demand Prediction in your MCA Viva Examination</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
            <div className="space-y-1.5">
              <strong className="text-teal-900 block font-semibold">Q: Why did you use Linear Regression instead of a Deep Learning neural network?</strong>
              <p className="text-slate-600 leading-relaxed">
                <strong>Answer:</strong> In retail medical inventory, deep neural networks require thousands of data points and act as unexplainable black boxes. Pharmacists need transparent accountability. Ordinary Least Squares (OLS) Linear Regression explicitly computes the trend rate ($m$) and baseline ($c$) with minimal computational overhead.
              </p>
            </div>

            <div className="space-y-1.5">
              <strong className="text-teal-900 block font-semibold">Q: How does Python process the calculation?</strong>
              <p className="text-slate-600 leading-relaxed">
                <strong>Answer:</strong> In <code>services/demand_prediction.py</code>, we pass raw SQL rows from the <code>sales</code> table into a <strong>Pandas DataFrame</strong>. We aggregate sales by month using <code>df.groupby()</code>. Then we convert the consumption series into <strong>NumPy arrays</strong> to perform vectorized least-squares calculations in constant time.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
