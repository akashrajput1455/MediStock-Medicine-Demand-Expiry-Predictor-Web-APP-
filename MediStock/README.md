# MediStock – Medicine Demand & Expiry Predictor

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0.3-000000?style=for-the-badge&logo=flask&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-2.2.2-150458?style=for-the-badge&logo=pandas&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-1.26.4-013243?style=for-the-badge&logo=numpy&logoColor=white)
![Bootstrap 5](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
![Currency](https://img.shields.io/badge/Currency-INR%20(%E2%82%B9)-0078D4?style=for-the-badge)

**MCA (Artificial Intelligence & Machine Learning) Python Mini Project**

*A complete, production-grade pharmacy inventory management, shelf-life monitoring, and transparent demand forecasting system tailored for Indian healthcare dispensaries.*

</div>

---

## 📌 Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. Problem Statement & Healthcare Impact](#2-problem-statement--healthcare-impact)
- [3. Key Modules & Features](#3-key-modules--features)
- [4. Technology Stack](#4-technology-stack)
- [5. System Architecture](#5-system-architecture)
- [6. MySQL Database Design (`medistock_db`)](#6-mysql-database-design-medistock_db)
- [7. Step-by-Step Installation & Localhost Setup](#7-step-by-step-installation--localhost-setup)
- [8. Default Demo Credentials](#8-default-demo-credentials)
- [9. Demand Prediction Mathematical Logic](#9-demand-prediction-mathematical-logic)
- [10. Python Concepts Demonstrated (MCA Syllabus)](#10-python-concepts-demonstrated-mca-syllabus)
- [11. Complete MCA Viva Voce Preparation Guide](#11-complete-mca-viva-voce-preparation-guide)
- [12. Folder Structure](#12-folder-structure)
- [13. Author & Acknowledgements](#13-author--acknowledgements)

---

## 1. Project Overview

**MediStock** is an end-to-end pharmaceutical stock control and predictive intelligence platform designed for small-to-medium retail pharmacies, hospital dispensaries, and community clinics across India.

### Core Objectives:
1. **Eliminate Medicine Expiry Losses**: Automatically calculates remaining shelf life in days using Python `datetime`, proactively classifies stock into 5 safety tiers, and blocks expired medicines from being dispensed.
2. **Prevent Stock Shortages**: Identifies low-stock items against minimum safety thresholds and generates dynamic reorder recommendations.
3. **Explainable Demand Forecasting**: Uses transparent mathematical algorithms (Linear Regression via Ordinary Least Squares and Moving Averages) powered by **Pandas** and **NumPy** to predict next-month consumption based on historical sales.
4. **Indian Currency & Market Realism**: All financial analytics, valuation KPIs, and unit prices are localized in **Indian Rupees (₹ / INR)**.

---

## 2. Problem Statement & Healthcare Impact

In retail pharmacies across India:
- **Financial Loss via Expiry**: 10%–15% of purchased pharmaceuticals expire undetected on shelves, causing massive annual financial write-offs.
- **Patient Safety Hazards**: Accidental dispensation of expired or near-expiry medicines poses severe clinical and legal risks.
- **Stockout Crises**: Essential antipyretics, antibiotics, and cardiovascular drugs frequently go out of stock due to manual, intuitive purchasing rather than data-driven demand forecasting.
- **High ERP Barrier**: Commercial ERPs are bloated, expensive, and act as opaque "black boxes". MediStock provides an open, transparent, lightweight Python-driven alternative.

---

## 3. Key Modules & Features

### 📊 Module 1: Executive Analytics Dashboard
- **Real-Time KPIs**: Total Medicines Cataloged, Available Stock Units, Low-Stock Alerts, Expired Batches, Expiring Within 30 Days, and Total Inventory Valuation in Indian Rupees (₹).
- **Interactive Visualizations**:
  - *Medicine Category Distribution* (Donut Chart)
  - *Monthly Consumption & Sales History* (Bar Chart)
  - *Stock Health Distribution* (Pie Chart)
  - *Predicted vs. Actual Demand Trends* (Area Chart)
- **Recent Stock Activity Log**: Audited view of the latest inward/outward inventory transactions.

### 💊 Module 2: Medicine Management
- Full **CRUD** operations (Create, Read, Update, Delete) for medicine records.
- **Attributes Tracked**: Medicine Name, Category (Antibiotics, Analgesics, Antidiabetic, Cardiovascular, etc.), Manufacturer, Batch Number (Unique), Purchase Cost (₹), Selling Price (₹), Quantity, Minimum Stock Level, Manufacturing Date, Expiry Date, and Supplier Name.
- **Strict Business Validations**:
  - Expiry Date must be strictly after Manufacturing Date.
  - Non-negative quantities and positive pricing checks.
  - Batch number uniqueness enforcement.
- Real-time search by medicine name, category filter, and stock-status filter.

### 📦 Module 3: Inventory Monitoring & Movement
- Dedicated stock-level tracking with color-coded badges (`In Stock`, `Low Stock`, `Out of Stock`).
- **Stock Movement Operations**:
  - **Stock IN**: Add newly arrived supplier consignments with batch updates.
  - **Stock OUT**: Dispense medicine for patient sales with automated stock deduction.
- **Immutable Transaction History**: Every movement logs timestamp, transaction type (`IN`, `OUT`, `ADJUSTMENT`, `EXPIRED_DISCARD`), quantity delta, reason, and user ID into `inventory_transactions`.

### ⏳ Module 4: Expiry Monitoring & Safety Quarantine
- Automated day-to-day shelf-life computation using Python's `datetime.date`.
- **5-Tier Expiry Classification**:
  | Tier | Days Remaining | Action / Status |
  |---|---|---|
  | **Expired** | $< 0$ Days | Immediate Quarantine. Dispensation strictly blocked. |
  | **Critical** | $1 - 30$ Days | High alert. Immediate FEFO discount or supplier return. |
  | **Warning** | $31 - 60$ Days | Expedited stock movement recommended. |
  | **Attention** | $61 - 90$ Days | Monitored stock. |
  | **Safe** | $> 90$ Days | Healthy active stock. |
- **Quarantine & Discard Action**: 1-click write-off that marks the batch as discarded and logs a zero-stock adjustment.

### 📈 Module 5: Demand Prediction Engine
- Transparent, explainable predictive analytics using **NumPy** and **Pandas**.
- Select any cataloged medicine to analyze its historical monthly sales.
- **Calculates**:
  - Average monthly consumption rate.
  - Trend direction & slope ($m$).
  - Estimated next-month demand ($y_{pred}$).
  - Recommended procurement reorder quantity based on buffer formulas.
- Displays historical consumption bar charts and trend regression lines.
- Safe handling of new items: displays *"Insufficient Historical Data"* if fewer than 2 monthly data points exist.

### 📑 Module 6: Reports & Dynamic CSV Export
- View and filter reports across:
  - Complete Medicine Inventory
  - Low-Stock Medicines
  - Expired & Quarantined Batches
  - Medicines Expiring Soon (Within 90 Days)
  - Sales & Consumption Ledger
  - Demand Forecasting & Reorder Matrix
- **Native CSV Export**: Uses Python's built-in `csv` module and `io.StringIO` to generate downloadable `.csv` spreadsheets on demand with proper currency headers in Indian Rupees (`₹`).

---

## 4. Technology Stack

| Layer | Component | Description |
|---|---|---|
| **Programming Language** | **Python 3.10+** | Object-Oriented backend logic, date computations, algorithms |
| **Web Framework** | **Flask 3.0.3** | WSGI routing, blueprints, templating, session state management |
| **Relational Database** | **MySQL 8.x** | Persistent ACID-compliant relational storage |
| **Database Driver** | **`mysql-connector-python`** | Parameterized queries preventing SQL Injection |
| **Data Processing** | **Pandas 2.2.2** | Grouping, monthly time-period aggregations, dataframes |
| **Numerical Calculations** | **NumPy 1.26.4** | Ordinary Least Squares regression, array mathematics |
| **Frontend UI** | **HTML5 + CSS3 + Bootstrap 5.3** | Clean, responsive healthcare administrative dashboard |
| **Icons & Visuals** | **Bootstrap Icons & Chart.js** | Medical iconography and dynamic SVG/Canvas charts |
| **Currency Format** | **Indian Rupees (₹ / INR)** | Localized numbering and retail pricing |

---

## 5. System Architecture

```text
                     ┌────────────────────────────────┐
                     │   Web Browser (Client Tier)    │
                     │  HTML5 + Bootstrap 5 + Chart.js │
                     └───────────────┬────────────────┘
                                     │ HTTP (GET / POST)
                                     ▼
                     ┌────────────────────────────────┐
                     │     Flask Web Application      │
                     │             app.py             │
                     └───────┬──────────────┬─────────┘
                             │              │
              ┌──────────────┴──────┐ ┌─────┴────────────────┐
              │  Route Blueprints   │ │   Business Services  │
              │  ├─ auth.py         │ │  ├─ expiry_checker   │
              │  ├─ dashboard.py    │ │  ├─ demand_predict   │
              │  ├─ medicines.py    │ │  └─ inventory_analys │
              │  ├─ inventory.py    │ └──────────────┬───────┘
              │  ├─ expiry.py       │                │
              │  ├─ prediction.py   │                │
              │  └─ reports.py      │                │
              └──────────────┬──────┘                │
                             │                       │
                             ▼                       ▼
                     ┌────────────────────────────────┐
                     │    Database Abstraction Layer  │
                     │    database/db_connection.py   │
                     │    (mysql-connector-python)    │
                     └───────────────┬────────────────┘
                                     │ Parameterized Queries
                                     ▼
                     ┌────────────────────────────────┐
                     │        MySQL 8.x Server        │
                     │         medistock_db           │
                     │ ├─ users                       │
                     │ ├─ medicines                   │
                     │ ├─ sales                       │
                     │ └─ inventory_transactions      │
                     └────────────────────────────────┘
```

---

## 6. MySQL Database Design (`medistock_db`)

The relational database adheres to Boyce-Codd Normal Form (BCNF) principles with referential integrity constraints:

### 1. `users` Table
Stores authenticated pharmacy staff credentials.
```sql
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(30) DEFAULT 'Pharmacist',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. `medicines` Table
Central catalog storing medicine batches, costs, and expiry dates.
```sql
CREATE TABLE medicines (
    medicine_id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_name VARCHAR(150) NOT NULL,
    category VARCHAR(80) NOT NULL,
    manufacturer VARCHAR(150) NOT NULL,
    batch_number VARCHAR(50) NOT NULL UNIQUE,
    purchase_price DECIMAL(10, 2) NOT NULL,
    selling_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    minimum_stock INT NOT NULL DEFAULT 20,
    manufacturing_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    supplier_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. `sales` Table
Historical dispensation records used for demand prediction.
```sql
CREATE TABLE sales (
    sale_id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_id INT NOT NULL,
    quantity_sold INT NOT NULL,
    sale_date DATE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    patient_reference VARCHAR(100) DEFAULT 'Walk-in Customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE CASCADE
);
```

### 4. `inventory_transactions` Table
Audited log of all inward and outward inventory adjustments.
```sql
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
```

---

## 7. Step-by-Step Installation & Localhost Setup

### Prerequisites
1. **Python 3.10+** installed ([python.org](https://www.python.org/downloads/)).
2. **MySQL Server 8.x** installed via MySQL Community Server, XAMPP, or WAMP.
3. Git installed.

---

### Step 1: Clone or Extract the Repository
```bash
git clone https://github.com/your-username/medistock-pharmacy-predictor.git
cd medistock-pharmacy-predictor/MediStock
```

---

### Step 2: Initialize the MySQL Database
Open your MySQL prompt or MySQL Workbench:
```bash
mysql -u root -p
```
Run the `database.sql` script to create `medistock_db` and seed realistic Indian pharmacy data:
```sql
source database.sql;
```
*(On Windows PowerShell, you can also run):*
```powershell
Get-Content database.sql | mysql -u root -p
```

---

### Step 3: Configure Database Credentials
Open `config.py` in Visual Studio Code or any text editor and set your MySQL password:
```python
class Config:
    SECRET_KEY = 'medistock_secret_key_mca_2026_secure'
    MYSQL_HOST = 'localhost'
    MYSQL_PORT = 3306
    MYSQL_USER = 'root'
    MYSQL_PASSWORD = 'your_mysql_password_here'  # <-- Change this to your MySQL password
    MYSQL_DB = 'medistock_db'
```

---

### Step 4: Create Virtual Environment & Install Dependencies
```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Windows Command Prompt:
.\venv\Scripts\activate.bat
# On Linux / macOS:
source venv/bin/activate

# Install required Python packages
pip install -r requirements.txt
```

---

### Step 5: Start the Flask Web Server
```bash
python app.py
```
You should see:
```text
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

Open your browser and navigate to: **`http://127.0.0.1:5000`**

*(Pro-tip: On Windows, you can also double-click `run_project.bat` or run `.\run_project.ps1` for 1-click startup!)*

---

## 8. Default Demo Credentials

The seeded database comes pre-loaded with two test accounts:

| Role | Username | Password | Access Level |
|---|---|---|---|
| **Head Pharmacist** | `admin` | `admin123` | Full Administrative Privileges (CRUD, Stock Adjustments, Reports) |
| **Pharmacy Assistant** | `staff` | `staff123` | Operational Access (Dispensing, Stock Check, Expiry View) |

---

## 9. Demand Prediction Mathematical Logic

Rather than relying on opaque deep learning models that cannot be explained during project evaluations, MediStock implements **transparent, mathematically rigorous algorithms**:

### 1. Ordinary Least Squares (OLS) Linear Regression
Given monthly sales data points $(x_1, y_1), (x_2, y_2), \dots, (x_n, y_n)$ where $x$ is the month index ($1, 2, 3 \dots$) and $y$ is the quantity sold:

1. **Calculate Slope ($m$)**:
   $$\large m = \frac{n \sum (xy) - (\sum x)(\sum y)}{n \sum (x^2) - (\sum x)^2}$$
   - If $m > 0$: Demand is increasing over time (upward seasonal trend).
   - If $m < 0$: Demand is decreasing.

2. **Calculate Intercept ($c$)**:
   $$\large c = \frac{\sum y - m \sum x}{n}$$

3. **Predict Next-Month Demand ($y_{pred}$)**:
   $$\large y_{pred} = m(n + 1) + c$$

### 2. Simple Moving Average (SMA)
For steady-state demand without strong slopes:
$$\large SMA = \frac{1}{k} \sum_{i=n-k+1}^{n} y_i$$
*(Where $k = 3$ represents the 3-month rolling window).*

### 3. Reorder Procurement Logic
- **Safety Stock Buffer**: Calculated as $\text{Minimum Stock Level}$ (or $20\%$ of predicted demand).
- **Total Required**: $\text{Predicted Demand} + \text{Minimum Stock}$.
- **Net Reorder Quantity**:
  $$\large \text{Recommended Reorder} = \max\left(0, (\text{Predicted Demand} + \text{Minimum Stock}) - \text{Available Stock}\right)$$

---

## 10. Python Concepts Demonstrated (MCA Syllabus)

This project has been engineered specifically to satisfy MCA academic viva and evaluation criteria:

1. **Object-Oriented Programming (OOP)**:
   - Encapsulation in `Medicine` and `InventoryTransaction` classes (`models/medicine.py`).
   - Constructor validation, getter properties (`is_expired`, `is_low_stock`).
2. **Modular Flask Blueprints**:
   - Clean separation of concerns with 7 dedicated blueprints (`auth`, `dashboard`, `medicines`, `inventory`, `expiry`, `prediction`, `reports`).
3. **Python Decorators**:
   - Custom `@login_required` decorator built with `functools.wraps` to protect routes from unauthorized URL tampering.
4. **Data Science with NumPy & Pandas**:
   - `pandas.DataFrame.groupby()`, `dt.to_period('M')` for temporal grouping.
   - Vectorized dot products (`np.sum`, `np.dot`) for OLS regression.
5. **Datetime Arithmetic**:
   - `datetime.date` subtraction returning exact `timedelta.days` for shelf-life classification.
6. **In-Memory Streaming & File I/O**:
   - `io.StringIO` streaming dynamically created CSV bytes without saving junk files to disk.
7. **Robust Error Handling**:
   - `try-except-finally` blocks ensuring database cursors and connections are properly closed even upon query failure.

---

## 11. Complete MCA Viva Voce Preparation Guide

### Top Viva Questions & Model Answers:

#### Q1: Why did you choose Python and Flask over PHP or Django for this mini project?
> **Answer**: Flask is a lightweight WSGI framework that gives full architectural transparency without hidden boilerplate. Python offers native numerical libraries like Pandas and NumPy, which allows us to integrate data analysis and demand forecasting directly into the web application within a single runtime.

#### Q2: How does the system prevent expired medicines from being sold?
> **Answer**: In `services/expiry_checker.py`, the method `classify_expiry()` computes the difference between `expiry_date` and `date.today()`. If the delta is less than 0, `is_dispensable` is flagged as `False`. When an operator attempts a "Stock OUT" transaction in `routes/inventory.py`, the system validates this flag and rejects the sale if expired.

#### Q3: Why did you use Linear Regression instead of a Deep Learning Neural Network?
> **Answer**: In small retail pharmacies, historical records typically span 6 to 12 months. Deep neural networks require thousands of data points to avoid severe overfitting. Linear regression and moving averages provide explainable, auditable equations ($y = mx + c$) where pharmacists can clearly understand why a specific reorder quantity is recommended.

#### Q4: How is SQL Injection prevented?
> **Answer**: We use parameterized queries exclusively through `mysql-connector-python` using `%s` placeholders. User inputs are treated strictly as query parameters by the MySQL driver, never concatenated into raw SQL strings.

#### Q5: What is the significance of FEFO in pharmacy inventory?
> **Answer**: FEFO stands for **First Expired, First Out**. The system sorts expiring batches so that medicines closest to their expiry date are prioritized for dispensing before newer batches, minimizing wastage.

---

## 12. Folder Structure

```text
MediStock/
├── app.py                     # Main Flask Application Entry Point
├── config.py                  # Database & Secret Configurations
├── database.sql               # MySQL 8.x DDL Schema & Realistic Seed Data
├── requirements.txt           # Python Package Manifest
├── README.md                  # Project Documentation & Viva Guide
├── run_project.bat            # 1-Click Windows Batch Launcher
├── run_project.ps1            # 1-Click PowerShell Launcher
│
├── database/
│   └── db_connection.py       # MySQL Connector with Connection Pooling
│
├── models/
│   ├── medicine.py            # Medicine OOP Model with Business Validations
│   └── inventory.py           # Inventory Movement Class
│
├── routes/
│   ├── auth.py                # Authentication, Login/Logout & Session Guard
│   ├── dashboard.py           # Executive KPIs & 4 Interactive Visualizations
│   ├── medicines.py           # Medicine CRUD, Search & Category Filters
│   ├── inventory.py           # Stock IN/OUT Movements & Audit Ledger
│   ├── expiry.py              # Expiry Risk Classifier & Batch Quarantine
│   ├── prediction.py          # AI/ML Demand Prediction Dashboard
│   └── reports.py             # Tabular Reports & Dynamic CSV Streaming
│
├── services/
│   ├── demand_prediction.py   # Pandas & NumPy Regression / Moving Average Engine
│   ├── expiry_checker.py      # Datetime Shelf-Life Calculator & FEFO Engine
│   └── inventory_analysis.py  # Valuation in ₹ & Stock Health Aggregator
│
├── templates/                 # Jinja2 HTML5 Bootstrap 5 Templates
│   ├── base.html              # Layout Master with Responsive Sidebar
│   ├── login.html             # User Authentication View
│   ├── dashboard.html         # Main Executive Analytics Portal
│   ├── medicines.html         # Catalog Table with Search & Filters
│   ├── add_medicine.html      # Add New Medicine Form with Validations
│   ├── edit_medicine.html     # Edit Medicine Details Form
│   ├── inventory.html         # Inward/Outward Stock Adjustment Panel
│   ├── expiry.html            # Shelf-Life Monitoring & Quarantining Table
│   ├── prediction.html        # Interactive Forecast & Mathematical Breakdown
│   └── reports.html           # Comprehensive Reports & CSV Exporter
│
└── static/
    ├── css/
    │   └── style.css          # Healthcare UI Theme & Modern Cards
    └── js/
        └── script.js          # Client-Side Form Enhancements & Alerts
```

---

## 13. Author & Acknowledgements

- **Developed By**: **Akash Rajput**
- **Email**: [akashrajput6248@gmail.com](mailto:akashrajput6248@gmail.com)
- **Degree**: Master of Computer Applications (MCA) – Artificial Intelligence & Machine Learning
- **Academic Project**: Python Mini Project (Healthcare Inventory & Predictive Analysis)

---

<div align="center">
  <sub>Built with ❤️ for pharmacy managers, healthcare staff, and MCA academic evaluation.</sub>
</div>
