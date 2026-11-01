# MediStock – Medicine Demand & Expiry Predictor

> **MCA (Artificial Intelligence & Machine Learning) Python Mini Project**  
> A complete, beginner-friendly healthcare inventory management and predictive analysis system built using **Python 3**, **Flask**, **MySQL 8.x**, **Pandas**, **NumPy**, and **Bootstrap 5**.

---

## 1. Project Introduction

**MediStock** is a web-based pharmaceutical inventory management application designed specifically for small pharmacies, retail medical stores, and healthcare dispensaries. The system automates stock control, proactively tracks medicine shelf life using date arithmetic, prevents expired medicine dispensing, and forecasts future medicine demand using mathematical and machine learning techniques.

---

## 2. Problem Statement

Small pharmacies and clinics frequently face two major financial and clinical dilemmas:
1. **Medicine Expiration & Wastage**: Over 10-15% of pharmacy stock expires on shelves unnoticed, leading to heavy financial write-offs and potential safety hazards if dispensed inadvertently.
2. **Stockouts of Essential Medicines**: Stock shortages of critical medicines (e.g., antipyretics, antibiotics, insulin) disrupt patient therapy due to reactive, manual reordering.
3. **Lack of Explainable Forecasting**: Enterprise ERPs are prohibitively expensive and act as "black boxes". Pharmacy managers need a transparent, easy-to-understand demand predictor.

---

## 3. Project Objectives

- **Reduce Wastage**: Monitor expiration dates automatically and classify inventory into 5 distinct risk tiers (Expired, &le;30 days, &le;60 days, &le;90 days, Safe Stock).
- **Enforce Dispensing Safety**: Automatically prevent expired batches from being dispensed or treated as active stock.
- **Predict Future Demand**: Calculate transparent next-month demand based on historical monthly consumption using **Pandas**, **NumPy**, and **Linear Regression (Ordinary Least Squares)**.
- **Maintain Audit Integrity**: Track every stock addition, outward dispensation, and write-off in an immutable transaction log.
- **Demonstrate Python Core Concepts**: Serve as an exemplary MCA academic project demonstrating OOP, database integration, statistical calculations, file I/O, and clean web architecture.

---

## 4. Technologies Used

| Tier | Technology | Description |
|---|---|---|
| **Backend** | Python 3.10+ | Core application logic and data processing |
| **Framework** | Flask 3.x | Lightweight WSGI web framework & routing |
| **Sessions** | Flask Sessions | Secure user authentication state management |
| **Database** | MySQL 8.x | Relational database management system |
| **DB Driver** | `mysql-connector-python` | Official Python-to-MySQL parameterized connector |
| **Data Analysis** | Pandas & NumPy | Historical grouping, aggregations, matrix & array math |
| **Visualization** | Chart.js & Matplotlib | Interactive canvas charts and trend graphs |
| **Frontend** | HTML5, CSS3, JS, Bootstrap 5 | Clean, responsive, modern medical SaaS UI |
| **Icons** | Bootstrap Icons | Consistent iconography |

---

## 5. System Architecture

```
[ Web Browser / Client ]
         │ (HTTP Requests: GET, POST)
         ▼
[ Flask Application (app.py) ]
    ├── Authentication & Session Guard (routes/auth.py)
    ├── Route Blueprints (routes/medicines.py, inventory.py, expiry.py, etc.)
    ├── OOP Models (models/medicine.py, models/inventory.py)
    ├── Core Services:
    │     ├── ExpiryChecker (services/expiry_checker.py)
    │     ├── DemandPredictor (services/demand_prediction.py - Pandas/NumPy)
    │     └── InventoryAnalysisService (services/inventory_analysis.py)
    ▼
[ MySQL 8.x Database (medistock_db) ]
    ├── users (Authentication)
    ├── medicines (Master catalog & batch details)
    ├── sales (Historical consumption logs)
    └── inventory_transactions (Stock movement audit trail)
```

---

## 6. Database Design (`medistock_db`)

The database consists of 4 relational tables:

### 1. `medicines`
- `medicine_id`: INT AUTO_INCREMENT PRIMARY KEY
- `medicine_name`: VARCHAR(150) NOT NULL
- `category`: VARCHAR(80) NOT NULL
- `manufacturer`: VARCHAR(150) NOT NULL
- `batch_number`: VARCHAR(50) NOT NULL UNIQUE
- `purchase_price`: DECIMAL(10, 2) NOT NULL
- `selling_price`: DECIMAL(10, 2) NOT NULL
- `quantity`: INT NOT NULL DEFAULT 0
- `minimum_stock`: INT NOT NULL DEFAULT 20
- `manufacturing_date`: DATE NOT NULL
- `expiry_date`: DATE NOT NULL
- `supplier_name`: VARCHAR(150) NOT NULL
- `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 2. `sales`
- `sale_id`: INT AUTO_INCREMENT PRIMARY KEY
- `medicine_id`: INT (Foreign Key &rarr; `medicines.medicine_id`)
- `quantity_sold`: INT NOT NULL
- `sale_date`: DATE NOT NULL
- `total_amount`: DECIMAL(10, 2) NOT NULL
- `patient_reference`: VARCHAR(100)
- `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 3. `inventory_transactions`
- `transaction_id`: INT AUTO_INCREMENT PRIMARY KEY
- `medicine_id`: INT (Foreign Key &rarr; `medicines.medicine_id`)
- `transaction_type`: ENUM('IN', 'OUT', 'ADJUSTMENT', 'EXPIRED_DISCARD')
- `quantity`: INT NOT NULL
- `transaction_date`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `description`: VARCHAR(255) NOT NULL
- `performed_by`: VARCHAR(50)

### 4. `users`
- `user_id`: INT AUTO_INCREMENT PRIMARY KEY
- `username`: VARCHAR(50) NOT NULL UNIQUE
- `password`: VARCHAR(255) NOT NULL
- `full_name`: VARCHAR(100) NOT NULL
- `role`: VARCHAR(30)
- `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

---

## 7. Project Folder Structure

```
MediStock/
├── app.py                     # Main Flask Application Entry Point
├── config.py                  # Database & Flask Secret Configurations
├── database.sql               # Complete MySQL Schema & Seed Sample Data
├── requirements.txt           # Python Package Dependencies
├── README.md                  # Project Documentation & Viva Guide
├── run_project.bat            # 1-Click Windows Batch Runner
├── run_project.ps1            # 1-Click PowerShell Script
│
├── database/
│   └── db_connection.py       # MySQL Connection & Parameterized Execution
│
├── models/
│   ├── medicine.py            # Medicine OOP Class with Business Validation
│   └── inventory.py           # Inventory Transaction Model
│
├── routes/
│   ├── auth.py                # Login, Logout, Session Decorator
│   ├── dashboard.py           # Executive KPIs & 4 Interactive Charts
│   ├── medicines.py           # Medicine CRUD, Filtering & Searching
│   ├── inventory.py           # Stock IN/OUT Movements & Audit Log
│   ├── expiry.py              # Shelf-Life Monitoring & Batch Quarantining
│   ├── prediction.py          # AI/ML Demand Forecasting Engine
│   └── reports.py             # Tabular Reports & Python CSV Streaming
│
├── services/
│   ├── demand_prediction.py   # Pandas & NumPy Regression / Moving Average
│   ├── expiry_checker.py      # Python Datetime Shelf-Life Classifier
│   └── inventory_analysis.py  # KPI & Valuation Aggregations
│
├── templates/                 # Jinja2 HTML5 Bootstrap 5 Templates
│   ├── base.html
│   ├── login.html
│   ├── dashboard.html
│   ├── medicines.html
│   ├── add_medicine.html
│   ├── edit_medicine.html
│   ├── inventory.html
│   ├── expiry.html
│   ├── prediction.html
│   └── reports.html
│
└── static/
    ├── css/style.css          # Healthcare UI Theme Stylesheet
    └── js/script.js           # Client Interactions & Alert Dismissals
```

---

## 8. Installation & Setup Instructions (Windows Localhost)

### Prerequisites:
1. **Python 3.10+**: Download from [python.org](https://www.python.org/downloads/) (Check "Add Python to PATH").
2. **MySQL Server 8.x**: Installed via MySQL Community Server or XAMPP/WAMP.

### Step 1: Open PowerShell or Command Prompt
Navigate to the extracted `MediStock` folder:
```powershell
cd path\to\MediStock
```

### Step 2: Set Up MySQL Database
Open your MySQL terminal (or MySQL Workbench):
```bash
mysql -u root -p
```
Run the provided `database.sql` script:
```sql
source database.sql;
```
*(Or in PowerShell)*:
```powershell
Get-Content database.sql | mysql -u root -p
```

### Step 3: Configure Database Password
Open `config.py` in any text editor and update your MySQL password if different from `'root'`:
```python
MYSQL_PASSWORD = 'your_mysql_password'
```

### Step 4: Install Dependencies & Run
Using the provided automated script:
```powershell
.\run_project.ps1
```
*Or manually step-by-step*:
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

### Step 5: Open in Browser
Open your web browser and visit:
```
http://127.0.0.1:5000
```

---

## 9. Default Login Credentials

| Username | Password | Full Name | Role |
|---|---|---|---|
| `admin` | `admin123` | Head Pharmacist | Administrator |
| `staff` | `staff123` | Pharmacy Assistant | Staff |

---

## 10. Explanation of the Demand Prediction Algorithm

The project implements two transparent, explainable prediction algorithms using **NumPy** and **Pandas**:

### 1. Linear Regression (Ordinary Least Squares: $y = mx + c$)
For a medicine with historical monthly sales $(x_1, y_1), (x_2, y_2), \dots, (x_n, y_n)$ where $x$ represents chronological monthly index and $y$ represents units sold:

1. **Calculate Slope ($m$)**:
   $$m = \frac{n \sum (xy) - (\sum x)(\sum y)}{n \sum (x^2) - (\sum x)^2}$$
   - Positive $m$: Medicine demand is trending upward (e.g. seasonal outbreak).
   - Negative $m$: Medicine demand is declining.

2. **Calculate Intercept ($c$)**:
   $$c = \frac{\sum y - m \sum x}{n}$$

3. **Predict Next Period ($x_{n+1}$)**:
   $$y_{predicted} = m(n + 1) + c$$

### 2. Simple Moving Average (SMA)
Calculates the arithmetic mean of the last $k$ periods (e.g., $k = 3$ months):
$$SMA = \frac{1}{k} \sum_{i=n-k+1}^{n} y_i$$

### 3. Inventory Procurement Logic:
- **Deficit**: `Deficit = (Predicted Demand + Minimum Stock) - Available Stock`
- **Safety Stock Buffer**: 20% of predicted demand
- **Recommended Order**: `max(0, Deficit)`

---

## 11. Python Programming Concepts Demonstrated

1. **Object-Oriented Programming (OOP)**: `Medicine` and `InventoryTransaction` classes with constructors, property getters, encapsulation, and validation methods.
2. **Exception Handling**: `try-except-finally` blocks in database operations and data parsing.
3. **Python Decorators**: Custom `@login_required` decorator using `functools.wraps` for route protection.
4. **NumPy Arrays & Mathematical Functions**: `np.array`, `np.mean`, `np.sum`, vector multiplication for linear regression.
5. **Pandas DataFrames**: Grouping monthly sales with `.groupby()`, date period casting `.dt.to_period('M')`.
6. **Date & Time Arithmetic**: `datetime.date` subtraction to compute remaining shelf life in days.
7. **In-Memory File Generation**: `io.StringIO` and Python's built-in `csv` module for dynamic CSV streaming.
8. **Parameterized SQL Queries**: `%s` place-holders preventing SQL Injection.

---

## 12. Guide for Demonstrating the Project to a Teacher (Viva Guide)

### Key Demonstration Workflow:
1. **Show Login**: Log in as `admin` (`admin123`). Explain session management and password hashing.
2. **Dashboard Overview**: Point out the 6 real-time KPI cards and the 4 interactive charts (Category Share, Monthly Sales, Stock Health, Demand Trend).
3. **Medicine Management**: Add a new medicine (demonstrate that entering an expiry date before the manufacturing date triggers instant validation).
4. **Inventory Movement**: Perform a "Stock IN" and "Stock OUT". Show how the stock updates immediately and an audit entry is saved in `inventory_transactions`.
5. **Expiry Monitoring**:
   - Highlight the red **Expired** badge (e.g. Pantoprazole).
   - Explain why the system blocks expired batches from being dispensed.
   - Click "Discard / Quarantine" to show the automated stock write-off.
6. **Demand Prediction**:
   - Select **Paracetamol 650mg**.
   - Show the historical sales chart (100, 120, 110, 130, 140 units).
   - Walk through the mathematical calculation box showing slope $m = +9.0$, intercept $c = 93.0$, predicted next month demand $= 147$ units, and recommended reorder quantity.
7. **Reports & CSV Export**: Select "Complete Inventory" or "Demand Forecast" and click "Download CSV File" to show genuine `.csv` file generation.

### Common Viva Questions & Answers:
- **Q1: Why did you use Linear Regression instead of Deep Learning?**  
  *Answer*: Pharmacy inventory managers need transparent, explainable recommendations rather than black-box models. Linear regression clearly shows the trend slope ($m$) and seasonal direction.
- **Q2: How do you prevent SQL injection?**  
  *Answer*: By using parameterized queries (`cursor.execute(sql, (params,))`) through `mysql-connector-python`, ensuring user input is never concatenated into raw SQL strings.
- **Q3: How are expired medicines prevented from being dispensed?**  
  *Answer*: In `routes/inventory.py`, before processing any `OUT` transaction, the application checks `ExpiryChecker.classify_expiry()`. If `is_dispensable` is False, the transaction is rejected.
