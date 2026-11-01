-- ====================================================================
-- MediStock – Medicine Demand & Expiry Predictor Database Schema
-- MCA Python Mini Project
-- Database: MySQL 8.x
-- ====================================================================

DROP DATABASE IF EXISTS medistock_db;
CREATE DATABASE medistock_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE medistock_db;

-- --------------------------------------------------------------------
-- Table 1: users (Authentication & Access Control)
-- --------------------------------------------------------------------
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Stored as SHA256 / Werkzeug hash
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(30) DEFAULT 'Pharmacist',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default Admin Account: username = 'admin', password = 'pbkdf2:sha256:...' (admin123)
-- We also insert plain SHA-256 for easy reference: 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822808f74c50549
INSERT INTO users (username, password, full_name, role) VALUES 
('admin', 'scrypt:32768:8:1$uH2M9QjX$8df99fb9aa2d44fc600e12140bbd21396a86e927cbdbf9a1ea2b8b990b7933923d8c5f5906ef57bf4b1aefea19b338e55e394f92d6e4922982d56a3bcf5d6910', 'Head Pharmacist', 'Administrator'),
('staff', 'scrypt:32768:8:1$uH2M9QjX$8df99fb9aa2d44fc600e12140bbd21396a86e927cbdbf9a1ea2b8b990b7933923d8c5f5906ef57bf4b1aefea19b338e55e394f92d6e4922982d56a3bcf5d6910', 'Pharmacy Assistant', 'Staff');

-- --------------------------------------------------------------------
-- Table 2: medicines (Medicine Master & Stock)
-- --------------------------------------------------------------------
CREATE TABLE medicines (
    medicine_id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_name VARCHAR(150) NOT NULL,
    category VARCHAR(80) NOT NULL,
    manufacturer VARCHAR(150) NOT NULL,
    batch_number VARCHAR(50) NOT NULL,
    purchase_price DECIMAL(10, 2) NOT NULL,
    selling_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    minimum_stock INT NOT NULL DEFAULT 20,
    manufacturing_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    supplier_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_expiry (expiry_date),
    INDEX idx_quantity (quantity)
);

-- --------------------------------------------------------------------
-- Table 3: sales (Historical Consumption & Dispensing Records)
-- --------------------------------------------------------------------
CREATE TABLE sales (
    sale_id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_id INT NOT NULL,
    quantity_sold INT NOT NULL,
    sale_date DATE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    patient_reference VARCHAR(100) DEFAULT 'Walk-in Customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE CASCADE,
    INDEX idx_sale_date (sale_date)
);

-- --------------------------------------------------------------------
-- Table 4: inventory_transactions (Stock Movement Audit Log)
-- --------------------------------------------------------------------
CREATE TABLE inventory_transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_id INT NOT NULL,
    transaction_type ENUM('IN', 'OUT', 'ADJUSTMENT', 'EXPIRED_DISCARD') NOT NULL,
    quantity INT NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(255) NOT NULL,
    performed_by VARCHAR(50) DEFAULT 'admin',
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE CASCADE
);

-- ====================================================================
-- SEED SAMPLE DATA (Realistic Pharmacy Data with Varied Stock & Expiry)
-- Note: Dates are relative to late 2026 for accurate demonstration
-- ====================================================================

INSERT INTO medicines (medicine_id, medicine_name, category, manufacturer, batch_number, purchase_price, selling_price, quantity, minimum_stock, manufacturing_date, expiry_date, supplier_name) VALUES
-- Normal safe stock
(1, 'Paracetamol 650mg', 'Analgesics & Antipyretics', 'Cipla Ltd', 'PCM-2025-01', 15.00, 30.00, 450, 60, '2025-06-15', '2027-06-14', 'Apollo Medical Supplies'),
(2, 'Cetirizine 10mg', 'Antihistamines', 'Dr. Reddy\'s Labs', 'CTZ-2025-88', 18.00, 38.00, 280, 50, '2025-08-01', '2027-07-31', 'MedPlus Wholesalers'),
(3, 'Azithromycin 500mg', 'Antibiotics', 'Sun Pharma', 'AZI-2026-12', 65.00, 120.00, 120, 30, '2026-01-10', '2027-12-31', 'Global Health Distribution'),
(4, 'Amoxicillin 250mg', 'Antibiotics', 'GlaxoSmithKline India', 'AMX-2025-44', 42.00, 85.00, 190, 40, '2025-09-01', '2027-08-31', 'Global Health Distribution'),
(5, 'Ibuprofen 400mg', 'Anti-inflammatory', 'Abbott India', 'IBU-2026-03', 22.00, 45.00, 310, 50, '2026-02-15', '2028-02-14', 'Apollo Medical Supplies'),

-- Low stock medicines (Trigger alert: quantity <= minimum_stock)
(6, 'Vitamin C 500mg Chewable', 'Vitamins & Supplements', 'Himalaya Wellness', 'VTC-2025-99', 18.00, 35.00, 15, 50, '2025-07-10', '2027-01-10', 'Lifecare Distributors'),
(7, 'Metformin 500mg', 'Antidiabetic', 'Torrent Pharma', 'MET-2025-31', 28.00, 55.00, 18, 40, '2025-05-20', '2027-05-19', 'MedPlus Wholesalers'),

-- Expiring Soon (< 30 days and < 60 days)
(8, 'Omeprazole 20mg', 'Antacids & Antiulcerants', 'Cadila Pharma', 'OMP-2024-52', 32.00, 65.00, 65, 30, '2024-11-20', '2026-11-20', 'Apex Pharma Distributors'),
(9, 'ORS Electrolyte Sachet', 'Rehydration Solutions', 'FDC Limited', 'ORS-2024-19', 12.00, 22.00, 85, 40, '2024-12-01', '2026-12-15', 'Lifecare Distributors'),

-- Expired Batch (Already expired relative to Nov 2026)
(10, 'Pantoprazole 40mg', 'Antacids & Antiulcerants', 'Alkem Labs', 'PAN-2024-05', 45.00, 90.00, 40, 25, '2024-06-01', '2026-09-30', 'Apex Pharma Distributors'),

-- Out of Stock (0 quantity)
(11, 'Dextromethorphan Cough Syrup', 'Respiratory & Cough', 'Pfizer India', 'DXM-2025-02', 55.00, 98.00, 0, 25, '2025-03-01', '2027-03-01', 'Global Health Distribution'),

-- Additional Expiring in 60-90 days
(12, 'Atorvastatin 10mg', 'Cardiovascular', 'Lupin Pharma', 'ATV-2025-15', 48.00, 95.00, 110, 30, '2025-01-15', '2027-01-25', 'Apollo Medical Supplies');

-- --------------------------------------------------------------------
-- SEED HISTORICAL SALES (For Demand Prediction Analysis)
-- 5 months of realistic historical consumption (June - October 2026 in INR)
-- --------------------------------------------------------------------

-- Paracetamol 650mg (Historical: 100, 120, 110, 130, 140) at ₹30/unit
INSERT INTO sales (medicine_id, quantity_sold, sale_date, total_amount) VALUES
(1, 100, '2026-06-28', 3000.00),
(1, 120, '2026-07-29', 3600.00),
(1, 110, '2026-08-30', 3300.00),
(1, 130, '2026-09-28', 3900.00),
(1, 140, '2026-10-30', 4200.00);

-- Cetirizine 10mg at ₹38/unit
INSERT INTO sales (medicine_id, quantity_sold, sale_date, total_amount) VALUES
(2, 60, '2026-06-25', 2280.00),
(2, 75, '2026-07-28', 2850.00),
(2, 85, '2026-08-27', 3230.00),
(2, 95, '2026-09-29', 3610.00),
(2, 110, '2026-10-28', 4180.00);

-- Azithromycin 500mg at ₹120/unit
INSERT INTO sales (medicine_id, quantity_sold, sale_date, total_amount) VALUES
(3, 35, '2026-06-20', 4200.00),
(3, 40, '2026-07-22', 4800.00),
(3, 45, '2026-08-25', 5400.00),
(3, 50, '2026-09-24', 6000.00),
(3, 58, '2026-10-26', 6960.00);

-- Amoxicillin 250mg at ₹85/unit
INSERT INTO sales (medicine_id, quantity_sold, sale_date, total_amount) VALUES
(4, 50, '2026-06-18', 4250.00),
(4, 55, '2026-07-21', 4675.00),
(4, 52, '2026-08-19', 4420.00),
(4, 60, '2026-09-20', 5100.00),
(4, 65, '2026-10-23', 5525.00);

-- Ibuprofen 400mg at ₹45/unit
INSERT INTO sales (medicine_id, quantity_sold, sale_date, total_amount) VALUES
(5, 70, '2026-06-15', 3150.00),
(5, 75, '2026-07-16', 3375.00),
(5, 80, '2026-08-18', 3600.00),
(5, 85, '2026-09-17', 3825.00),
(5, 90, '2026-10-19', 4050.00);

-- Vitamin C at ₹35/unit
INSERT INTO sales (medicine_id, quantity_sold, sale_date, total_amount) VALUES
(6, 45, '2026-06-10', 1575.00),
(6, 60, '2026-07-12', 2100.00),
(6, 70, '2026-08-14', 2450.00),
(6, 80, '2026-09-15', 2800.00),
(6, 95, '2026-10-18', 3325.00);

-- Metformin 500mg at ₹55/unit
INSERT INTO sales (medicine_id, quantity_sold, sale_date, total_amount) VALUES
(7, 30, '2026-06-05', 1650.00),
(7, 32, '2026-07-08', 1760.00),
(7, 35, '2026-08-09', 1925.00),
(7, 38, '2026-09-11', 2090.00),
(7, 42, '2026-10-12', 2310.00);

-- --------------------------------------------------------------------
-- SEED INITIAL INVENTORY TRANSACTIONS
-- --------------------------------------------------------------------
INSERT INTO inventory_transactions (medicine_id, transaction_type, quantity, description, performed_by) VALUES
(1, 'IN', 500, 'Initial batch receipt from Apollo Medical Supplies', 'admin'),
(1, 'OUT', 50, 'Prescription dispensing to Outpatient Ward', 'admin'),
(2, 'IN', 300, 'Stock delivery from MedPlus Wholesalers', 'admin'),
(2, 'OUT', 20, 'Direct OTC dispensing', 'staff'),
(3, 'IN', 150, 'Supplier shipment received', 'admin'),
(3, 'OUT', 30, 'Hospital clinic order', 'admin'),
(6, 'OUT', 40, 'Bulk OTC purchase', 'staff'),
(10, 'EXPIRED_DISCARD', 10, 'Damaged & expired packaging removed to quarantine', 'admin'),
(11, 'OUT', 35, 'Seasonal stock depleted completely', 'staff');
