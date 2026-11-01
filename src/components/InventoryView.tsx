import React, { useState } from 'react';
import { 
  Boxes, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Filter, 
  Plus, 
  Clock, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Medicine, InventoryTransaction } from '../types';

interface InventoryViewProps {
  medicines: Medicine[];
  transactions: InventoryTransaction[];
  onStockAdjustment: (
    medicineId: number, 
    actionType: 'IN' | 'OUT', 
    quantity: number, 
    description: string
  ) => { success: boolean; message: string };
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  medicines,
  transactions,
  onStockAdjustment
}) => {
  const [filterType, setFilterType] = useState<'all' | 'low' | 'out' | 'adequate'>('all');
  
  // Modal state
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT'>('IN');
  const [selectedMedId, setSelectedMedId] = useState<number>(medicines[0]?.medicine_id || 1);
  const [adjustQuantity, setAdjustQuantity] = useState<number>(10);
  const [adjustDescription, setAdjustDescription] = useState<string>('');
  const [modalFeedback, setModalFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Filtered medicines
  const filteredMedicines = medicines.filter(med => {
    if (filterType === 'low') return med.quantity > 0 && med.quantity <= med.minimum_stock;
    if (filterType === 'out') return med.quantity === 0;
    if (filterType === 'adequate') return med.quantity > med.minimum_stock;
    return true;
  });

  const openAdjust = (type: 'IN' | 'OUT', medId?: number) => {
    setAdjustType(type);
    if (medId) setSelectedMedId(medId);
    setAdjustQuantity(type === 'IN' ? 50 : 10);
    setAdjustDescription(type === 'IN' ? 'Stock delivery received from vendor' : 'Outpatient prescription dispensation');
    setModalFeedback(null);
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalFeedback(null);

    const res = onStockAdjustment(selectedMedId, adjustType, adjustQuantity, adjustDescription);
    if (!res.success) {
      setModalFeedback({ type: 'error', text: res.message });
    } else {
      setModalFeedback({ type: 'success', text: res.message });
      setTimeout(() => {
        setIsAdjustModalOpen(false);
      }, 1200);
    }
  };

  const selectedMed = medicines.find(m => m.medicine_id === selectedMedId);

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              filterType === 'all'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Stock Items ({medicines.length})
          </button>
          
          <button
            onClick={() => setFilterType('low')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
              filterType === 'low'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Low Stock (≤ Min)</span>
          </button>

          <button
            onClick={() => setFilterType('out')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
              filterType === 'out'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
            }`}
          >
            <XCircle className="w-3 h-3" />
            <span>Out of Stock (0)</span>
          </button>

          <button
            onClick={() => setFilterType('adequate')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
              filterType === 'adequate'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <CheckCircle className="w-3 h-3" />
            <span>Adequate Stock</span>
          </button>
        </div>

        {/* Quick IN / OUT Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => openAdjust('IN')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Stock IN (Receive)</span>
          </button>

          <button
            onClick={() => openAdjust('OUT')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Stock OUT (Dispense)</span>
          </button>
        </div>

      </div>

      {/* Stock Levels Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Real-time Stock Monitor</h3>
            <p className="text-xs text-slate-400">Available units vs safety minimum thresholds</p>
          </div>
          <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-medium">
            {filteredMedicines.length} Item(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Medicine Name</th>
                <th className="py-3 px-4">Batch Number</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Available Units</th>
                <th className="py-3 px-4">Safety Minimum</th>
                <th className="py-3 px-4">Stock Health Status</th>
                <th className="py-3 px-4">Batch Valuation (₹)</th>
                <th className="py-3 px-4 text-right">Quick Movement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMedicines.map((med) => {
                const isOut = med.quantity === 0;
                const isLow = med.quantity > 0 && med.quantity <= med.minimum_stock;
                const isExpired = med.expiry_status === 'EXPIRED';

                return (
                  <tr key={med.medicine_id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 text-xs">{med.medicine_name}</div>
                      <div className="text-[10px] text-slate-400">{med.manufacturer}</div>
                    </td>

                    <td className="py-3 px-4">
                      <code className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-mono">
                        {med.batch_number}
                      </code>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {med.category}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-base font-bold ${
                          isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-slate-800'
                        }`}>
                          {med.quantity}
                        </span>
                        <span className="text-slate-400 text-[10px]">units</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-500 font-medium">
                      {med.minimum_stock} units
                    </td>

                    <td className="py-3 px-4">
                      {isExpired ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                          Expired Batch (Blocked)
                        </span>
                      ) : isOut ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                          Depleted (0 units)
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                          Low Stock Warning
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          Sufficient Stock
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-700">
                      ₹{(med.quantity * med.purchase_price).toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openAdjust('IN', med.medicine_id)}
                          className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                          title="Stock IN: Receive shipment"
                        >
                          + IN
                        </button>
                        <button
                          onClick={() => openAdjust('OUT', med.medicine_id)}
                          disabled={med.quantity === 0 || isExpired}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition ${
                            med.quantity === 0 || isExpired
                              ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                              : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200'
                          }`}
                          title={isExpired ? "Cannot dispense expired stock" : "Stock OUT: Dispense"}
                        >
                          - OUT
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction History Audit Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Inventory Movement Audit Trail</h3>
            <p className="text-xs text-slate-400">Complete immutable log stored in <code>inventory_transactions</code></p>
          </div>
          <span className="text-xs text-slate-400">
            Total Logged Events: <strong>{transactions.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Tx ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Medicine</th>
                <th className="py-3 px-4">Batch</th>
                <th className="py-3 px-4">Movement Type</th>
                <th className="py-3 px-4">Quantity Change</th>
                <th className="py-3 px-4">Description / Reference</th>
                <th className="py-3 px-4">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <tr key={tx.transaction_id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                    #{tx.transaction_id}
                  </td>

                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {tx.transaction_date}
                  </td>

                  <td className="py-3 px-4 font-bold text-slate-800">
                    {tx.medicine_name}
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-600">
                    {tx.batch_number}
                  </td>

                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tx.transaction_type === 'IN' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      tx.transaction_type === 'OUT' ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                      tx.transaction_type === 'EXPIRED_DISCARD' ? 'bg-red-100 text-red-800 border border-red-200' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {tx.transaction_type}
                    </span>
                  </td>

                  <td className={`py-3 px-4 font-bold ${
                    tx.transaction_type === 'IN' ? 'text-emerald-600' : 'text-slate-800'
                  }`}>
                    {tx.transaction_type === 'IN' ? `+${tx.quantity}` : `-${tx.quantity}`}
                  </td>

                  <td className="py-3 px-4 text-slate-600">
                    {tx.description}
                  </td>

                  <td className="py-3 px-4 text-slate-500">
                    <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">
                      {tx.performed_by}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className={`font-bold text-base ${adjustType === 'IN' ? 'text-emerald-700' : 'text-sky-700'}`}>
                  {adjustType === 'IN' ? 'Stock IN (Receive Batch)' : 'Stock OUT (Dispense / Issue)'}
                </h3>
                <p className="text-xs text-slate-400">
                  {adjustType === 'IN' ? 'Log supplier shipment into MySQL' : 'Dispense to patient and update sales ledger'}
                </p>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-5 space-y-4">
              
              {modalFeedback && (
                <div className={`p-3 rounded-xl flex items-center gap-2 text-xs ${
                  modalFeedback.type === 'error'
                    ? 'bg-red-50 border border-red-200 text-red-700'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                }`}>
                  {modalFeedback.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
                  <span>{modalFeedback.text}</span>
                </div>
              )}

              {/* Medicine Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Medicine *</label>
                <select
                  value={selectedMedId}
                  onChange={(e) => setSelectedMedId(parseInt(e.target.value))}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {medicines.map((m) => (
                    <option key={m.medicine_id} value={m.medicine_id}>
                      {m.medicine_name} ({m.batch_number}) &mdash; Curr: {m.quantity} {m.expiry_status === 'EXPIRED' ? '[EXPIRED]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {selectedMed && (
                <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Stock:</span>
                    <strong className="text-slate-800">{selectedMed.quantity} units</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Expiry Date:</span>
                    <strong className={selectedMed.expiry_status === 'EXPIRED' ? 'text-red-600' : 'text-slate-800'}>
                      {selectedMed.expiry_date} ({selectedMed.expiry_label})
                    </strong>
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Quantity to {adjustType === 'IN' ? 'Add' : 'Deduct'} *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(parseInt(e.target.value) || 1)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Description / Reference */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Description / Audit Reason *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Outpatient prescription RX-7712"
                  value={adjustDescription}
                  onChange={(e) => setAdjustDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {adjustType === 'OUT' && (
                <p className="text-[11px] text-teal-700 bg-teal-50 p-2.5 rounded-lg border border-teal-100">
                  Dispensation records automatically synchronize with the <code>sales</code> table to train the AI/ML Demand Prediction algorithm.
                </p>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition ${
                    adjustType === 'IN' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-sky-600 hover:bg-sky-700'
                  }`}
                >
                  Confirm {adjustType === 'IN' ? 'Stock In' : 'Stock Out'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  );
};
