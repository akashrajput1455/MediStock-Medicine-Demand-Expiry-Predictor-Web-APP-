/**
 * MediStock – Medicine Demand & Expiry Predictor
 * MCA (Artificial Intelligence & Machine Learning) Python Mini Project
 * Frontend Application Controller
 */

import React, { useState, useEffect } from 'react';
import { Medicine, Sale, InventoryTransaction, User } from './types';
import { INITIAL_MEDICINES, INITIAL_SALES, INITIAL_TRANSACTIONS } from './data/initialData';
import { processMedicinesWithExpiry } from './services/expiryEngine';
import { downloadPythonProjectZip } from './services/zipExporter';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { MedicinesView } from './components/MedicinesView';
import { InventoryView } from './components/InventoryView';
import { ExpiryView } from './components/ExpiryView';
import { PredictionView } from './components/PredictionView';
import { ReportsView } from './components/ReportsView';
import { PythonInspectorView } from './components/PythonInspectorView';
import { LoginView } from './components/LoginView';

const STORAGE_KEY_MEDS = 'medistock_medicines_v3_inr';
const STORAGE_KEY_SALES = 'medistock_sales_v3_inr';
const STORAGE_KEY_TXS = 'medistock_transactions_v3_inr';
const STORAGE_KEY_USER = 'medistock_user_v3_inr';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      user_id: 1,
      username: 'admin',
      full_name: 'Dr. Akash Rajput (Head Pharmacist)',
      role: 'Administrator'
    };
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedPredictionMedId, setSelectedPredictionMedId] = useState<number>(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Core Datasets
  const [rawMedicines, setRawMedicines] = useState<Medicine[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MEDS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_MEDICINES;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SALES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_SALES;
  });

  const [transactions, setTransactions] = useState<InventoryTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TXS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_TRANSACTIONS;
  });

  // Toast Notification state
  const [toast, setToast] = useState<{ type: 'success' | 'danger' | 'info'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'danger' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MEDS, JSON.stringify(rawMedicines));
  }, [rawMedicines]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SALES, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, [currentUser]);

  // Compute shelf-life classifications using Expiry Engine
  const { enriched: medicines, summary: expirySummary } = processMedicinesWithExpiry(rawMedicines);
  const lowStockCount = medicines.filter(m => m.quantity > 0 && m.quantity <= m.minimum_stock).length;

  // Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    showToast(`Welcome back, ${user.full_name}! Session authenticated.`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('You have been logged out.', 'info');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all inventory records to initial demonstration sample data?')) {
      setRawMedicines(INITIAL_MEDICINES);
      setSales(INITIAL_SALES);
      setTransactions(INITIAL_TRANSACTIONS);
      showToast('Database reset to initial sample records.', 'info');
    }
  };

  const handleAddMedicine = (newMed: Omit<Medicine, 'medicine_id'>) => {
    const nextId = rawMedicines.length > 0 ? Math.max(...rawMedicines.map(m => m.medicine_id)) + 1 : 1;
    const medicineToAdd: Medicine = {
      ...newMed,
      medicine_id: nextId
    };

    setRawMedicines(prev => [medicineToAdd, ...prev]);

    // Automatically record an IN transaction
    if (medicineToAdd.quantity > 0) {
      const newTx: InventoryTransaction = {
        transaction_id: transactions.length > 0 ? Math.max(...transactions.map(t => t.transaction_id)) + 1 : 101,
        medicine_id: nextId,
        transaction_type: 'IN',
        quantity: medicineToAdd.quantity,
        transaction_date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        description: `Initial batch delivery registered for ${medicineToAdd.medicine_name}`,
        performed_by: currentUser?.username || 'admin',
        medicine_name: medicineToAdd.medicine_name,
        batch_number: medicineToAdd.batch_number
      };
      setTransactions(prev => [newTx, ...prev]);
    }

    showToast(`Medicine "${medicineToAdd.medicine_name}" added successfully!`, 'success');
  };

  const handleUpdateMedicine = (updatedMed: Medicine) => {
    setRawMedicines(prev => prev.map(m => m.medicine_id === updatedMed.medicine_id ? updatedMed : m));
    showToast(`Medicine "${updatedMed.medicine_name}" updated successfully.`, 'success');
  };

  const handleDeleteMedicine = (medicineId: number) => {
    const med = rawMedicines.find(m => m.medicine_id === medicineId);
    setRawMedicines(prev => prev.filter(m => m.medicine_id !== medicineId));
    showToast(`Medicine "${med?.medicine_name || medicineId}" deleted from database.`, 'info');
  };

  const handleStockAdjustment = (
    medicineId: number, 
    actionType: 'IN' | 'OUT', 
    quantity: number, 
    description: string
  ): { success: boolean; message: string } => {
    const med = medicines.find(m => m.medicine_id === medicineId);
    if (!med) {
      return { success: false, message: 'Medicine record not found.' };
    }

    // Business rule: Expired batches cannot be dispensed
    if (actionType === 'OUT' && med.expiry_status === 'EXPIRED') {
      return {
        success: false,
        message: `CRITICAL SAFETY ALERT: Cannot dispense "${med.medicine_name}" because batch ${med.batch_number} has EXPIRED. Please quarantine and write off this batch.`
      };
    }

    if (actionType === 'OUT' && quantity > med.quantity) {
      return {
        success: false,
        message: `Cannot dispense ${quantity} units. Only ${med.quantity} units currently available in stock.`
      };
    }

    const newQty = actionType === 'IN' ? med.quantity + quantity : med.quantity - quantity;

    // Update medicines state
    setRawMedicines(prev => prev.map(m => m.medicine_id === medicineId ? { ...m, quantity: newQty } : m));

    // Append to transactions audit log
    const txId = transactions.length > 0 ? Math.max(...transactions.map(t => t.transaction_id)) + 1 : 101;
    const newTx: InventoryTransaction = {
      transaction_id: txId,
      medicine_id: medicineId,
      transaction_type: actionType,
      quantity,
      transaction_date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      description,
      performed_by: currentUser?.username || 'admin',
      medicine_name: med.medicine_name,
      batch_number: med.batch_number
    };
    setTransactions(prev => [newTx, ...prev]);

    // If OUT, also append to sales ledger for AI/ML training
    if (actionType === 'OUT') {
      const saleId = sales.length > 0 ? Math.max(...sales.map(s => s.sale_id)) + 1 : 1;
      const newSale: Sale = {
        sale_id: saleId,
        medicine_id: medicineId,
        quantity_sold: quantity,
        sale_date: '2026-11-01',
        total_amount: quantity * med.selling_price,
        patient_reference: description,
        medicine_name: med.medicine_name,
        batch_number: med.batch_number
      };
      setSales(prev => [...prev, newSale]);
    }

    showToast(`Stock updated for ${med.medicine_name}. New balance: ${newQty} units.`, 'success');
    return { success: true, message: `Successfully logged ${actionType} movement of ${quantity} units.` };
  };

  const handleQuarantineBatch = (medicineId: number) => {
    const med = medicines.find(m => m.medicine_id === medicineId);
    if (!med) return;

    const discardQty = med.quantity;
    setRawMedicines(prev => prev.map(m => m.medicine_id === medicineId ? { ...m, quantity: 0 } : m));

    // Log EXPIRED_DISCARD transaction
    const txId = transactions.length > 0 ? Math.max(...transactions.map(t => t.transaction_id)) + 1 : 101;
    const newTx: InventoryTransaction = {
      transaction_id: txId,
      medicine_id: medicineId,
      transaction_type: 'EXPIRED_DISCARD',
      quantity: discardQty,
      transaction_date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      description: `Quarantined & written off expired batch ${med.batch_number}`,
      performed_by: currentUser?.username || 'admin',
      medicine_name: med.medicine_name,
      batch_number: med.batch_number
    };
    setTransactions(prev => [newTx, ...prev]);

    showToast(`Batch ${med.batch_number} (${med.medicine_name}) quarantined. ${discardQty} units written off.`, 'success');
  };

  const handleDownloadZip = async () => {
    try {
      showToast('Generating standalone Python Flask + MySQL ZIP archive...', 'info');
      await downloadPythonProjectZip();
      showToast('MediStock-Python-MCA-Mini-Project.zip downloaded successfully!', 'success');
    } catch (e) {
      showToast('Error generating zip archive.', 'danger');
    }
  };

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className={`px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' :
            toast.type === 'danger' ? 'bg-red-600 text-white border-red-500' :
            'bg-slate-800 text-white border-slate-700'
          }`}>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-white/80 hover:text-white">&times;</button>
          </div>
        </div>
      )}

      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        onDownloadZip={handleDownloadZip}
        expiredCount={expirySummary.expired_count}
        lowStockCount={lowStockCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header
          activeTab={activeTab}
          onOpenAddMedicine={() => setIsAddModalOpen(true)}
          onResetData={handleResetData}
          expiredCount={expirySummary.expired_count}
          lowStockCount={lowStockCount}
        />

        <main className="flex-1 p-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              medicines={medicines}
              sales={sales}
              transactions={transactions}
              expirySummary={expirySummary}
              onNavigateTab={setActiveTab}
              onSelectMedicineForPrediction={(id) => {
                setSelectedPredictionMedId(id);
                setActiveTab('prediction');
              }}
            />
          )}

          {activeTab === 'medicines' && (
            <MedicinesView
              medicines={medicines}
              onAddMedicine={handleAddMedicine}
              onUpdateMedicine={handleUpdateMedicine}
              onDeleteMedicine={handleDeleteMedicine}
              isAddModalOpen={isAddModalOpen}
              setIsAddModalOpen={setIsAddModalOpen}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              medicines={medicines}
              transactions={transactions}
              onStockAdjustment={handleStockAdjustment}
            />
          )}

          {activeTab === 'expiry' && (
            <ExpiryView
              medicines={medicines}
              summary={expirySummary}
              onQuarantineBatch={handleQuarantineBatch}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'prediction' && (
            <PredictionView
              medicines={medicines}
              sales={sales}
              selectedMedicineId={selectedPredictionMedId}
              onSelectMedicine={setSelectedPredictionMedId}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              medicines={medicines}
              sales={sales}
              summary={expirySummary}
            />
          )}

          {activeTab === 'python-code' && (
            <PythonInspectorView
              onDownloadZip={handleDownloadZip}
            />
          )}
        </main>
      </div>
    </div>
  );
}
