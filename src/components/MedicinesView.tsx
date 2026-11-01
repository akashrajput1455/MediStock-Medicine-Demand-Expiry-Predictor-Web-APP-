import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { Medicine } from '../types';

interface MedicinesViewProps {
  medicines: Medicine[];
  onAddMedicine: (med: Omit<Medicine, 'medicine_id'>) => void;
  onUpdateMedicine: (med: Medicine) => void;
  onDeleteMedicine: (id: number) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export const MedicinesView: React.FC<MedicinesViewProps> = ({
  medicines,
  onAddMedicine,
  onUpdateMedicine,
  onDeleteMedicine,
  isAddModalOpen,
  setIsAddModalOpen
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  // Form state
  const [formState, setFormState] = useState({
    medicine_name: '',
    category: 'Analgesics & Antipyretics',
    manufacturer: '',
    batch_number: '',
    purchase_price: 1.00,
    selling_price: 2.00,
    quantity: 100,
    minimum_stock: 20,
    manufacturing_date: '2026-01-01',
    expiry_date: '2027-12-31',
    supplier_name: ''
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Extract distinct categories
  const categories = Array.from(new Set(medicines.map(m => m.category))).sort();

  // Filter medicines
  const filteredMedicines = medicines.filter(med => {
    const matchesSearch = 
      med.medicine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.supplier_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory ? med.category === selectedCategory : true;

    let matchesStatus = true;
    if (selectedStatus === 'safe') {
      matchesStatus = med.quantity > med.minimum_stock && med.expiry_status !== 'EXPIRED';
    } else if (selectedStatus === 'low') {
      matchesStatus = med.quantity > 0 && med.quantity <= med.minimum_stock;
    } else if (selectedStatus === 'out') {
      matchesStatus = med.quantity === 0;
    } else if (selectedStatus === 'expired') {
      matchesStatus = med.expiry_status === 'EXPIRED';
    } else if (selectedStatus === 'expiring_soon') {
      matchesStatus = med.expiry_status === 'EXPIRING_30_DAYS' || med.expiry_status === 'EXPIRING_60_DAYS';
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingMedicine(null);
    setFormState({
      medicine_name: '',
      category: 'Analgesics & Antipyretics',
      manufacturer: '',
      batch_number: `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
      purchase_price: 2.50,
      selling_price: 5.00,
      quantity: 50,
      minimum_stock: 25,
      manufacturing_date: '2026-01-01',
      expiry_date: '2027-12-31',
      supplier_name: 'Apex Pharma Distributors'
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (med: Medicine) => {
    setEditingMedicine(med);
    setFormState({
      medicine_name: med.medicine_name,
      category: med.category,
      manufacturer: med.manufacturer,
      batch_number: med.batch_number,
      purchase_price: med.purchase_price,
      selling_price: med.selling_price,
      quantity: med.quantity,
      minimum_stock: med.minimum_stock,
      manufacturing_date: med.manufacturing_date,
      expiry_date: med.expiry_date,
      supplier_name: med.supplier_name
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Business rule validations
    if (!formState.medicine_name.trim()) {
      setFormError('Medicine name cannot be empty.');
      return;
    }
    if (!formState.batch_number.trim()) {
      setFormError('Batch number is required.');
      return;
    }
    if (formState.purchase_price <= 0 || formState.selling_price <= 0) {
      setFormError('Purchase and selling prices must be greater than zero.');
      return;
    }
    if (formState.quantity < 0) {
      setFormError('Stock quantity cannot be negative.');
      return;
    }
    if (new Date(formState.expiry_date) <= new Date(formState.manufacturing_date)) {
      setFormError('Validation Rule: Expiry date must be after manufacturing date.');
      return;
    }

    if (editingMedicine) {
      onUpdateMedicine({
        ...editingMedicine,
        ...formState
      });
    } else {
      onAddMedicine(formState);
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        
        <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by medicine name, batch number, manufacturer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="w-full sm:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-700"
            >
              <option value="">All Categories ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Stock Status Dropdown */}
          <div className="w-full sm:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-700"
            >
              <option value="">All Stock Levels</option>
              <option value="safe">Safe Stock (&gt; Min)</option>
              <option value="low">Low Stock (≤ Min)</option>
              <option value="out">Out of Stock (0 units)</option>
              <option value="expired">Expired Batches</option>
              <option value="expiring_soon">Expiring Soon (≤ 60d)</option>
            </select>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {(searchTerm || selectedCategory || selectedStatus) && (
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory(''); setSelectedStatus(''); }}
              className="px-3 py-2 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              Clear
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-sm transition whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Medicine</span>
          </button>
        </div>

      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Medicine Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Batch Number</th>
                <th className="py-3 px-4">Cost / Retail (₹)</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4">Mfg / Expiry</th>
                <th className="py-3 px-4">Shelf Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMedicines.map((med) => {
                const isExpired = med.expiry_status === 'EXPIRED';
                const isLow = med.quantity > 0 && med.quantity <= med.minimum_stock;
                const isOut = med.quantity === 0;

                return (
                  <tr 
                    key={med.medicine_id}
                    className={`hover:bg-slate-50/70 transition ${isExpired ? 'bg-red-50/30' : ''}`}
                  >
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      #{med.medicine_id}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 text-xs">{med.medicine_name}</div>
                      <div className="text-[11px] text-slate-400">
                        {med.manufacturer} &bull; {med.supplier_name}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {med.category}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <code className="text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold">
                        {med.batch_number}
                      </code>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">₹{med.purchase_price.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-400">Sell: ₹{med.selling_price.toFixed(2)}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-slate-800'}`}>
                          {med.quantity}
                        </span>
                        <span className="text-[10px] text-slate-400">/ min {med.minimum_stock}</span>
                      </div>
                      <div className="w-20 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isOut ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, (med.quantity / (med.minimum_stock * 2)) * 100)}%` }}
                        ></div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-[11px] text-slate-500">Mfg: {med.manufacturing_date}</div>
                      <div className="text-[11px] font-semibold text-slate-700">Exp: {med.expiry_date}</div>
                    </td>

                    <td className="py-3 px-4">
                      {isExpired ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                          Expired ({Math.abs(med.days_remaining || 0)}d ago)
                        </span>
                      ) : med.expiry_status === 'EXPIRING_30_DAYS' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200">
                          {med.days_remaining}d left
                        </span>
                      ) : med.expiry_status === 'EXPIRING_60_DAYS' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                          {med.days_remaining}d left
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          Safe Stock
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(med)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
                          title="Edit Medicine"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${med.medicine_name}?`)) {
                              onDeleteMedicine(med.medicine_id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Medicine"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredMedicines.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">No medicine records match the criteria.</p>
                    <p className="text-xs text-slate-400">Try adjusting your search terms or filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing <strong>{filteredMedicines.length}</strong> of {medicines.length} medicines</span>
          <span className="text-[11px] text-slate-400">Real-time synchronized with in-memory / MySQL state</span>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  {editingMedicine ? `Edit Medicine #${editingMedicine.medicine_id}` : 'Register New Medicine'}
                </h3>
                <p className="text-xs text-slate-400">
                  {editingMedicine ? 'Update medicine parameters & pricing' : 'Add medicine batch with shelf-life dates to MySQL'}
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Basic Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-700 border-b border-sky-100 pb-1">
                  1. Identification
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Medicine Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Paracetamol 650mg"
                      value={formState.medicine_name}
                      onChange={(e) => setFormState({ ...formState, medicine_name: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Category *</label>
                    <select
                      value={formState.category}
                      onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="Analgesics & Antipyretics">Analgesics & Antipyretics</option>
                      <option value="Antibiotics">Antibiotics</option>
                      <option value="Antihistamines">Antihistamines</option>
                      <option value="Anti-inflammatory">Anti-inflammatory</option>
                      <option value="Antacids & Antiulcerants">Antacids & Antiulcerants</option>
                      <option value="Antidiabetic">Antidiabetic</option>
                      <option value="Cardiovascular">Cardiovascular</option>
                      <option value="Respiratory & Cough">Respiratory & Cough</option>
                      <option value="Vitamins & Supplements">Vitamins & Supplements</option>
                      <option value="Rehydration Solutions">Rehydration Solutions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Manufacturer *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cipla Ltd"
                      value={formState.manufacturer}
                      onChange={(e) => setFormState({ ...formState, manufacturer: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Batch Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PCM-2026-99"
                      value={formState.batch_number}
                      onChange={(e) => setFormState({ ...formState, batch_number: e.target.value.toUpperCase() })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-700 border-b border-sky-100 pb-1">
                  2. Pricing & Quantities
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Purchase Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={formState.purchase_price}
                      onChange={(e) => setFormState({ ...formState, purchase_price: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Selling Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={formState.selling_price}
                      onChange={(e) => setFormState({ ...formState, selling_price: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Quantity *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formState.quantity}
                      onChange={(e) => setFormState({ ...formState, quantity: parseInt(e.target.value) || 0 })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Min Threshold *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formState.minimum_stock}
                      onChange={(e) => setFormState({ ...formState, minimum_stock: parseInt(e.target.value) || 20 })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Shelf-Life & Dates */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-700 border-b border-sky-100 pb-1">
                  3. Shelf Life & Procurement Dates
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Mfg Date *</label>
                    <input
                      type="date"
                      required
                      value={formState.manufacturing_date}
                      onChange={(e) => setFormState({ ...formState, manufacturing_date: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={formState.expiry_date}
                      onChange={(e) => setFormState({ ...formState, expiry_date: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Supplier Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apollo Medical"
                      value={formState.supplier_name}
                      onChange={(e) => setFormState({ ...formState, supplier_name: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-sm transition"
                >
                  {editingMedicine ? 'Update Medicine' : 'Save Medicine'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  );
};
