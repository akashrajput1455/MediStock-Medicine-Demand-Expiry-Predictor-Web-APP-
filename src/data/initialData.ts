import { Medicine, Sale, InventoryTransaction } from '../types';

export const INITIAL_MEDICINES: Medicine[] = [
  {
    medicine_id: 1,
    medicine_name: 'Paracetamol 650mg',
    category: 'Analgesics & Antipyretics',
    manufacturer: 'Cipla Ltd',
    batch_number: 'PCM-2025-01',
    purchase_price: 15.00,
    selling_price: 30.00,
    quantity: 450,
    minimum_stock: 60,
    manufacturing_date: '2025-06-15',
    expiry_date: '2027-06-14',
    supplier_name: 'Apollo Medical Supplies'
  },
  {
    medicine_id: 2,
    medicine_name: 'Cetirizine 10mg',
    category: 'Antihistamines',
    manufacturer: "Dr. Reddy's Labs",
    batch_number: 'CTZ-2025-88',
    purchase_price: 18.00,
    selling_price: 38.00,
    quantity: 280,
    minimum_stock: 50,
    manufacturing_date: '2025-08-01',
    expiry_date: '2027-07-31',
    supplier_name: 'MedPlus Wholesalers'
  },
  {
    medicine_id: 3,
    medicine_name: 'Azithromycin 500mg',
    category: 'Antibiotics',
    manufacturer: 'Sun Pharma',
    batch_number: 'AZI-2026-12',
    purchase_price: 65.00,
    selling_price: 120.00,
    quantity: 120,
    minimum_stock: 30,
    manufacturing_date: '2026-01-10',
    expiry_date: '2027-12-31',
    supplier_name: 'Global Health Distribution'
  },
  {
    medicine_id: 4,
    medicine_name: 'Amoxicillin 250mg',
    category: 'Antibiotics',
    manufacturer: 'GlaxoSmithKline India',
    batch_number: 'AMX-2025-44',
    purchase_price: 42.00,
    selling_price: 85.00,
    quantity: 190,
    minimum_stock: 40,
    manufacturing_date: '2025-09-01',
    expiry_date: '2027-08-31',
    supplier_name: 'Global Health Distribution'
  },
  {
    medicine_id: 5,
    medicine_name: 'Ibuprofen 400mg',
    category: 'Anti-inflammatory',
    manufacturer: 'Abbott India',
    batch_number: 'IBU-2026-03',
    purchase_price: 22.00,
    selling_price: 45.00,
    quantity: 310,
    minimum_stock: 50,
    manufacturing_date: '2026-02-15',
    expiry_date: '2028-02-14',
    supplier_name: 'Apollo Medical Supplies'
  },
  {
    medicine_id: 6,
    medicine_name: 'Vitamin C 500mg Chewable',
    category: 'Vitamins & Supplements',
    manufacturer: 'Himalaya Wellness',
    batch_number: 'VTC-2025-99',
    purchase_price: 18.00,
    selling_price: 35.00,
    quantity: 15, // Low stock: <= min 50
    minimum_stock: 50,
    manufacturing_date: '2025-07-10',
    expiry_date: '2027-01-10',
    supplier_name: 'Lifecare Distributors'
  },
  {
    medicine_id: 7,
    medicine_name: 'Metformin 500mg',
    category: 'Antidiabetic',
    manufacturer: 'Torrent Pharma',
    batch_number: 'MET-2025-31',
    purchase_price: 28.00,
    selling_price: 55.00,
    quantity: 18, // Low stock: <= min 40
    minimum_stock: 40,
    manufacturing_date: '2025-05-20',
    expiry_date: '2027-05-19',
    supplier_name: 'MedPlus Wholesalers'
  },
  {
    medicine_id: 8,
    medicine_name: 'Omeprazole 20mg',
    category: 'Antacids & Antiulcerants',
    manufacturer: 'Cadila Pharma',
    batch_number: 'OMP-2024-52',
    purchase_price: 32.00,
    selling_price: 65.00,
    quantity: 65,
    minimum_stock: 30,
    manufacturing_date: '2024-11-20',
    expiry_date: '2026-11-20', // Expiring in <= 30 days
    supplier_name: 'Apex Pharma Distributors'
  },
  {
    medicine_id: 9,
    medicine_name: 'ORS Electrolyte Sachet',
    category: 'Rehydration Solutions',
    manufacturer: 'FDC Limited',
    batch_number: 'ORS-2024-19',
    purchase_price: 12.00,
    selling_price: 22.00,
    quantity: 85,
    minimum_stock: 40,
    manufacturing_date: '2024-12-01',
    expiry_date: '2026-12-15', // Expiring in ~44 days (<= 60 days)
    supplier_name: 'Lifecare Distributors'
  },
  {
    medicine_id: 10,
    medicine_name: 'Pantoprazole 40mg',
    category: 'Antacids & Antiulcerants',
    manufacturer: 'Alkem Labs',
    batch_number: 'PAN-2024-05',
    purchase_price: 45.00,
    selling_price: 90.00,
    quantity: 40,
    minimum_stock: 25,
    manufacturing_date: '2024-06-01',
    expiry_date: '2026-09-30', // EXPIRED
    supplier_name: 'Apex Pharma Distributors'
  },
  {
    medicine_id: 11,
    medicine_name: 'Dextromethorphan Cough Syrup',
    category: 'Respiratory & Cough',
    manufacturer: 'Pfizer India',
    batch_number: 'DXM-2025-02',
    purchase_price: 55.00,
    selling_price: 98.00,
    quantity: 0, // OUT OF STOCK
    minimum_stock: 25,
    manufacturing_date: '2025-03-01',
    expiry_date: '2027-03-01',
    supplier_name: 'Global Health Distribution'
  },
  {
    medicine_id: 12,
    medicine_name: 'Atorvastatin 10mg',
    category: 'Cardiovascular',
    manufacturer: 'Lupin Pharma',
    batch_number: 'ATV-2025-15',
    purchase_price: 48.00,
    selling_price: 95.00,
    quantity: 110,
    minimum_stock: 30,
    manufacturing_date: '2025-01-15',
    expiry_date: '2027-01-25', // Expiring in ~85 days (<= 90 days)
    supplier_name: 'Apollo Medical Supplies'
  }
];

export const INITIAL_SALES: Sale[] = [
  // Paracetamol (100, 120, 110, 130, 140) at ₹30/unit
  { sale_id: 1, medicine_id: 1, quantity_sold: 100, sale_date: '2026-06-28', total_amount: 3000.00, patient_reference: 'Outpatient Clinic', medicine_name: 'Paracetamol 650mg', batch_number: 'PCM-2025-01' },
  { sale_id: 2, medicine_id: 1, quantity_sold: 120, sale_date: '2026-07-29', total_amount: 3600.00, patient_reference: 'Walk-in Prescriptions', medicine_name: 'Paracetamol 650mg', batch_number: 'PCM-2025-01' },
  { sale_id: 3, medicine_id: 1, quantity_sold: 110, sale_date: '2026-08-30', total_amount: 3300.00, patient_reference: 'Emergency Dept Dispensary', medicine_name: 'Paracetamol 650mg', batch_number: 'PCM-2025-01' },
  { sale_id: 4, medicine_id: 1, quantity_sold: 130, sale_date: '2026-09-28', total_amount: 3900.00, patient_reference: 'General Dispensary', medicine_name: 'Paracetamol 650mg', batch_number: 'PCM-2025-01' },
  { sale_id: 5, medicine_id: 1, quantity_sold: 140, sale_date: '2026-10-30', total_amount: 4200.00, patient_reference: 'Outpatient Clinic', medicine_name: 'Paracetamol 650mg', batch_number: 'PCM-2025-01' },

  // Cetirizine (60, 75, 85, 95, 110) at ₹38/unit
  { sale_id: 6, medicine_id: 2, quantity_sold: 60, sale_date: '2026-06-25', total_amount: 2280.00, patient_reference: 'Allergy Clinic', medicine_name: 'Cetirizine 10mg', batch_number: 'CTZ-2025-88' },
  { sale_id: 7, medicine_id: 2, quantity_sold: 75, sale_date: '2026-07-28', total_amount: 2850.00, patient_reference: 'Walk-in Pharmacy', medicine_name: 'Cetirizine 10mg', batch_number: 'CTZ-2025-88' },
  { sale_id: 8, medicine_id: 2, quantity_sold: 85, sale_date: '2026-08-27', total_amount: 3230.00, patient_reference: 'Pediatric Clinic', medicine_name: 'Cetirizine 10mg', batch_number: 'CTZ-2025-88' },
  { sale_id: 9, medicine_id: 2, quantity_sold: 95, sale_date: '2026-09-29', total_amount: 3610.00, patient_reference: 'Walk-in Prescriptions', medicine_name: 'Cetirizine 10mg', batch_number: 'CTZ-2025-88' },
  { sale_id: 10, medicine_id: 2, quantity_sold: 110, sale_date: '2026-10-28', total_amount: 4180.00, patient_reference: 'Seasonal Outbreak Dispensary', medicine_name: 'Cetirizine 10mg', batch_number: 'CTZ-2025-88' },

  // Azithromycin (35, 40, 45, 50, 58) at ₹120/unit
  { sale_id: 11, medicine_id: 3, quantity_sold: 35, sale_date: '2026-06-20', total_amount: 4200.00, patient_reference: 'Chest Medicine Ward', medicine_name: 'Azithromycin 500mg', batch_number: 'AZI-2026-12' },
  { sale_id: 12, medicine_id: 3, quantity_sold: 40, sale_date: '2026-07-22', total_amount: 4800.00, patient_reference: 'ENT Clinic', medicine_name: 'Azithromycin 500mg', batch_number: 'AZI-2026-12' },
  { sale_id: 13, medicine_id: 3, quantity_sold: 45, sale_date: '2026-08-25', total_amount: 5400.00, patient_reference: 'Internal Medicine', medicine_name: 'Azithromycin 500mg', batch_number: 'AZI-2026-12' },
  { sale_id: 14, medicine_id: 3, quantity_sold: 50, sale_date: '2026-09-24', total_amount: 6000.00, patient_reference: 'Outpatient Clinic', medicine_name: 'Azithromycin 500mg', batch_number: 'AZI-2026-12' },
  { sale_id: 15, medicine_id: 3, quantity_sold: 58, sale_date: '2026-10-26', total_amount: 6960.00, patient_reference: 'Hospital Clinic Orders', medicine_name: 'Azithromycin 500mg', batch_number: 'AZI-2026-12' },

  // Amoxicillin (50, 55, 52, 60, 65) at ₹85/unit
  { sale_id: 16, medicine_id: 4, quantity_sold: 50, sale_date: '2026-06-18', total_amount: 4250.00, patient_reference: 'General OPD', medicine_name: 'Amoxicillin 250mg', batch_number: 'AMX-2025-44' },
  { sale_id: 17, medicine_id: 4, quantity_sold: 55, sale_date: '2026-07-21', total_amount: 4675.00, patient_reference: 'Dental Surgery', medicine_name: 'Amoxicillin 250mg', batch_number: 'AMX-2025-44' },
  { sale_id: 18, medicine_id: 4, quantity_sold: 52, sale_date: '2026-08-19', total_amount: 4420.00, patient_reference: 'General OPD', medicine_name: 'Amoxicillin 250mg', batch_number: 'AMX-2025-44' },
  { sale_id: 19, medicine_id: 4, quantity_sold: 60, sale_date: '2026-09-20', total_amount: 5100.00, patient_reference: 'Walk-in Customers', medicine_name: 'Amoxicillin 250mg', batch_number: 'AMX-2025-44' },
  { sale_id: 20, medicine_id: 4, quantity_sold: 65, sale_date: '2026-10-23', total_amount: 5525.00, patient_reference: 'General OPD', medicine_name: 'Amoxicillin 250mg', batch_number: 'AMX-2025-44' },

  // Vitamin C (45, 60, 70, 80, 95) at ₹35/unit
  { sale_id: 21, medicine_id: 6, quantity_sold: 45, sale_date: '2026-06-10', total_amount: 1575.00, patient_reference: 'OTC Counter', medicine_name: 'Vitamin C 500mg Chewable', batch_number: 'VTC-2025-99' },
  { sale_id: 22, medicine_id: 6, quantity_sold: 60, sale_date: '2026-07-12', total_amount: 2100.00, patient_reference: 'OTC Counter', medicine_name: 'Vitamin C 500mg Chewable', batch_number: 'VTC-2025-99' },
  { sale_id: 23, medicine_id: 6, quantity_sold: 70, sale_date: '2026-08-14', total_amount: 2450.00, patient_reference: 'Wellness Pack', medicine_name: 'Vitamin C 500mg Chewable', batch_number: 'VTC-2025-99' },
  { sale_id: 24, medicine_id: 6, quantity_sold: 80, sale_date: '2026-09-15', total_amount: 2800.00, patient_reference: 'OTC Counter', medicine_name: 'Vitamin C 500mg Chewable', batch_number: 'VTC-2025-99' },
  { sale_id: 25, medicine_id: 6, quantity_sold: 95, sale_date: '2026-10-18', total_amount: 3325.00, patient_reference: 'Immunity Drive Promotion', medicine_name: 'Vitamin C 500mg Chewable', batch_number: 'VTC-2025-99' },

  // Metformin (30, 32, 35, 38, 42) at ₹55/unit
  { sale_id: 26, medicine_id: 7, quantity_sold: 30, sale_date: '2026-06-05', total_amount: 1650.00, patient_reference: 'Diabetes Care Unit', medicine_name: 'Metformin 500mg', batch_number: 'MET-2025-31' },
  { sale_id: 27, medicine_id: 7, quantity_sold: 32, sale_date: '2026-07-08', total_amount: 1760.00, patient_reference: 'Repeat Prescription Refill', medicine_name: 'Metformin 500mg', batch_number: 'MET-2025-31' },
  { sale_id: 28, medicine_id: 7, quantity_sold: 35, sale_date: '2026-08-09', total_amount: 1925.00, patient_reference: 'Diabetes Clinic', medicine_name: 'Metformin 500mg', batch_number: 'MET-2025-31' },
  { sale_id: 29, medicine_id: 7, quantity_sold: 38, sale_date: '2026-09-11', total_amount: 2090.00, patient_reference: 'Repeat Refill #982', medicine_name: 'Metformin 500mg', batch_number: 'MET-2025-31' },
  { sale_id: 30, medicine_id: 7, quantity_sold: 42, sale_date: '2026-10-12', total_amount: 2310.00, patient_reference: 'Endocrinology OPD', medicine_name: 'Metformin 500mg', batch_number: 'MET-2025-31' }
];

export const INITIAL_TRANSACTIONS: InventoryTransaction[] = [
  { transaction_id: 101, medicine_id: 1, transaction_type: 'IN', quantity: 500, transaction_date: '2026-10-25 09:30:00', description: 'Initial batch delivery received from Apollo Medical Supplies', performed_by: 'admin', medicine_name: 'Paracetamol 650mg', batch_number: 'PCM-2025-01' },
  { transaction_id: 102, medicine_id: 1, transaction_type: 'OUT', quantity: 50, transaction_date: '2026-10-28 14:15:00', description: 'Prescription dispensing to Outpatient Ward', performed_by: 'admin', medicine_name: 'Paracetamol 650mg', batch_number: 'PCM-2025-01' },
  { transaction_id: 103, medicine_id: 2, transaction_type: 'IN', quantity: 300, transaction_date: '2026-10-26 11:00:00', description: 'Stock delivery from MedPlus Wholesalers', performed_by: 'admin', medicine_name: 'Cetirizine 10mg', batch_number: 'CTZ-2025-88' },
  { transaction_id: 104, medicine_id: 2, transaction_type: 'OUT', quantity: 20, transaction_date: '2026-10-29 16:20:00', description: 'Direct OTC seasonal dispensing', performed_by: 'staff', medicine_name: 'Cetirizine 10mg', batch_number: 'CTZ-2025-88' },
  { transaction_id: 105, medicine_id: 3, transaction_type: 'IN', quantity: 150, transaction_date: '2026-10-27 10:10:00', description: 'Supplier shipment received from Global Health', performed_by: 'admin', medicine_name: 'Azithromycin 500mg', batch_number: 'AZI-2026-12' },
  { transaction_id: 106, medicine_id: 3, transaction_type: 'OUT', quantity: 30, transaction_date: '2026-10-30 15:45:00', description: 'Chest medicine clinic requisition', performed_by: 'admin', medicine_name: 'Azithromycin 500mg', batch_number: 'AZI-2026-12' },
  { transaction_id: 107, medicine_id: 6, transaction_type: 'OUT', quantity: 40, transaction_date: '2026-10-31 12:00:00', description: 'Bulk OTC community health purchase', performed_by: 'staff', medicine_name: 'Vitamin C 500mg Chewable', batch_number: 'VTC-2025-99' },
  { transaction_id: 108, medicine_id: 10, transaction_type: 'EXPIRED_DISCARD', quantity: 10, transaction_date: '2026-10-31 16:30:00', description: 'Expired packaging removed to quarantine area', performed_by: 'admin', medicine_name: 'Pantoprazole 40mg', batch_number: 'PAN-2024-05' },
  { transaction_id: 109, medicine_id: 11, transaction_type: 'OUT', quantity: 35, transaction_date: '2026-10-31 18:00:00', description: 'Seasonal stock depleted completely', performed_by: 'staff', medicine_name: 'Dextromethorphan Cough Syrup', batch_number: 'DXM-2025-02' }
];
