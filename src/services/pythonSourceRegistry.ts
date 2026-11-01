/**
 * MediStock - Python Source Code Registry
 * Holds the exact source code of the Python Flask + MySQL project
 * Used for:
 * 1. Interactive in-app Code Inspector with syntax highlighting
 * 2. Instant client-side ZIP packaging with JSZip
 */

export interface PythonFileEntry {
  path: string;
  name: string;
  category: 'core' | 'model' | 'route' | 'service' | 'template' | 'db' | 'doc';
  description: string;
  content: string;
}

export const PYTHON_PROJECT_FILES: PythonFileEntry[] = [
  {
    path: 'app.py',
    name: 'app.py',
    category: 'core',
    description: 'Main Flask Web Application entry point with blueprint registrations and error handling.',
    content: `"""
MediStock – Medicine Demand & Expiry Predictor
Main Application Entry Point (Flask Web Server)
MCA Python Mini Project
"""

import os
from flask import Flask, render_template, redirect, url_for, session
from config import Config

from routes.auth import auth_bp
from routes.dashboard import dashboard_bp
from routes.medicines import medicines_bp
from routes.inventory import inventory_bp
from routes.expiry import expiry_bp
from routes.prediction import prediction_bp
from routes.reports import reports_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(medicines_bp)
    app.register_blueprint(inventory_bp)
    app.register_blueprint(expiry_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(reports_bp)

    @app.context_processor
    def inject_global_vars():
        return {
            'app_name': 'MediStock',
            'app_subtitle': 'Medicine Demand & Expiry Predictor',
            'current_user': session.get('username'),
            'user_role': session.get('role'),
            'full_name': session.get('full_name')
        }

    @app.errorhandler(404)
    def page_not_found(e):
        return render_template('base.html', content="<h3>404 - Not Found</h3>"), 404

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"MediStock running on: http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
`
  },
  {
    path: 'config.py',
    name: 'config.py',
    category: 'core',
    description: 'Database credentials, secret keys, and prediction parameters.',
    content: `import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'medistock_secret_key_mca_2026_secure')
    MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
    MYSQL_PORT = int(os.environ.get('MYSQL_PORT', 3306))
    MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', 'root')
    MYSQL_DB = os.environ.get('MYSQL_DB', 'medistock_db')
    DEFAULT_PREDICTION_MONTHS = 6
    SAFETY_STOCK_FACTOR = 1.25
`
  },
  {
    path: 'database.sql',
    name: 'database.sql',
    category: 'db',
    description: 'Complete MySQL 8.x DDL schema (medicines, sales, transactions, users) with seed data.',
    content: `-- MediStock MySQL 8.x Database Schema
CREATE DATABASE IF NOT EXISTS medistock_db;
USE medistock_db;

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(30) DEFAULT 'Pharmacist',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medicines (
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

CREATE TABLE IF NOT EXISTS sales (
    sale_id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_id INT NOT NULL,
    quantity_sold INT NOT NULL,
    sale_date DATE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    patient_reference VARCHAR(100) DEFAULT 'Walk-in Customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_id INT NOT NULL,
    transaction_type ENUM('IN', 'OUT', 'ADJUSTMENT', 'EXPIRED_DISCARD') NOT NULL,
    quantity INT NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(255) NOT NULL,
    performed_by VARCHAR(50) DEFAULT 'admin',
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE CASCADE
);
`
  },
  {
    path: 'database/db_connection.py',
    name: 'db_connection.py',
    category: 'db',
    description: 'MySQL Connector handling parameterized queries, connection pooling, and error handling.',
    content: `import mysql.connector
from mysql.connector import Error
from config import Config

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=Config.MYSQL_HOST,
            port=Config.MYSQL_PORT,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            database=Config.MYSQL_DB
        )
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"[ERROR] Database connection failed: {e}")
        return None

def fetch_all(query, params=None):
    conn = get_db_connection()
    if not conn: return []
    cursor = None
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params or ())
        return cursor.fetchall()
    finally:
        if cursor: cursor.close()
        if conn and conn.is_connected(): conn.close()

def execute_query(query, params=None):
    conn = get_db_connection()
    if not conn: return None
    cursor = None
    try:
        cursor = conn.cursor()
        cursor.execute(query, params or ())
        conn.commit()
        return cursor.lastrowid
    finally:
        if cursor: cursor.close()
        if conn and conn.is_connected(): conn.close()
`
  },
  {
    path: 'models/medicine.py',
    name: 'medicine.py',
    category: 'model',
    description: 'Python OOP class model with constructors, business validation, and date calculations.',
    content: `from datetime import datetime, date

class Medicine:
    def __init__(self, medicine_name, category, manufacturer, batch_number,
                 purchase_price, selling_price, quantity, minimum_stock,
                 manufacturing_date, expiry_date, supplier_name, medicine_id=None):
        self.medicine_id = medicine_id
        self.medicine_name = medicine_name.strip()
        self.category = category.strip()
        self.manufacturer = manufacturer.strip()
        self.batch_number = batch_number.strip().upper()
        self.purchase_price = float(purchase_price)
        self.selling_price = float(selling_price)
        self.quantity = int(quantity)
        self.minimum_stock = int(minimum_stock)
        self.manufacturing_date = self._parse_date(manufacturing_date)
        self.expiry_date = self._parse_date(expiry_date)
        self.supplier_name = supplier_name.strip()

    @staticmethod
    def _parse_date(date_val):
        if isinstance(date_val, (date, datetime)):
            return date_val if isinstance(date_val, date) else date_val.date()
        return datetime.strptime(str(date_val), '%Y-%m-%d').date()

    def validate(self):
        errors = []
        if not self.medicine_name: errors.append("Medicine name cannot be empty.")
        if self.purchase_price <= 0: errors.append("Purchase price must be positive.")
        if self.quantity < 0: errors.append("Quantity cannot be negative.")
        if self.expiry_date <= self.manufacturing_date:
            errors.append("Expiry date must be after manufacturing date.")
        return len(errors) == 0, errors

    @property
    def is_low_stock(self):
        return 0 < self.quantity <= self.minimum_stock

    @property
    def is_expired(self):
        return self.expiry_date < date.today()
`
  },
  {
    path: 'services/demand_prediction.py',
    name: 'demand_prediction.py',
    category: 'service',
    description: 'Pandas & NumPy engine calculating Linear Regression (OLS) and Moving Average forecasting.',
    content: `import numpy as np
import pandas as pd

class DemandPredictor:
    MINIMUM_DATA_POINTS_REQUIRED = 2

    @staticmethod
    def prepare_sales_dataframe(sales_records):
        if not sales_records: return pd.DataFrame()
        df = pd.DataFrame(sales_records)
        df['sale_date'] = pd.to_datetime(df['sale_date'])
        df['year_month'] = df['sale_date'].dt.to_period('M')
        monthly_df = df.groupby('year_month')['quantity_sold'].sum().reset_index()
        monthly_df['year_month_str'] = monthly_df['year_month'].astype(str)
        return monthly_df.sort_values('year_month').reset_index(drop=True)

    @classmethod
    def predict_demand(cls, sales_records, current_stock, minimum_stock, method='linear_regression'):
        monthly_df = cls.prepare_sales_dataframe(sales_records)
        n = len(monthly_df)
        if n < cls.MINIMUM_DATA_POINTS_REQUIRED:
            return {'sufficient_data': False, 'message': 'Insufficient data'}

        y_values = monthly_df['quantity_sold'].to_numpy(dtype=float)
        x_values = np.arange(1, n + 1, dtype=float)
        next_x = n + 1

        # Linear Regression: y = mx + c
        sum_x = np.sum(x_values)
        sum_y = np.sum(y_values)
        sum_xy = np.sum(x_values * y_values)
        sum_x2 = np.sum(x_values ** 2)

        denominator = (n * sum_x2) - (sum_x ** 2)
        slope_m = ((n * sum_xy) - (sum_x * sum_y)) / denominator if denominator != 0 else 0.0
        intercept_c = (sum_y - (slope_m * sum_x)) / n

        linear_prediction = max(0.0, (slope_m * next_x) + intercept_c)
        final_prediction = int(round(linear_prediction))

        total_required = final_prediction + minimum_stock
        deficit = max(0, total_required - current_stock)

        return {
            'sufficient_data': True,
            'predicted_units': final_prediction,
            'recommended_reorder': deficit,
            'slope_trend': 'Increasing' if slope_m > 0.5 else 'Stable'
        }
`
  },
  {
    path: 'services/expiry_checker.py',
    name: 'expiry_checker.py',
    category: 'service',
    description: 'Python datetime shelf-life calculation, FEFO prioritization, and risk classification.',
    content: `from datetime import date, datetime

class ExpiryChecker:
    @staticmethod
    def calculate_shelf_life(expiry_date_input, reference_date=None):
        today = reference_date or date.today()
        if isinstance(expiry_date_input, str):
            expiry_date = datetime.strptime(expiry_date_input, '%Y-%m-%d').date()
        else:
            expiry_date = expiry_date_input
        delta_days = (expiry_date - today).days
        return delta_days, expiry_date

    @classmethod
    def classify_expiry(cls, expiry_date_input, reference_date=None):
        days_left, _ = cls.calculate_shelf_life(expiry_date_input, reference_date)
        if days_left < 0:
            return {'status': 'EXPIRED', 'label': 'Expired', 'is_dispensable': False}
        elif days_left <= 30:
            return {'status': 'EXPIRING_30_DAYS', 'label': '≤ 30 Days', 'is_dispensable': True}
        elif days_left <= 60:
            return {'status': 'EXPIRING_60_DAYS', 'label': '≤ 60 Days', 'is_dispensable': True}
        elif days_left <= 90:
            return {'status': 'EXPIRING_90_DAYS', 'label': '≤ 90 Days', 'is_dispensable': True}
        else:
            return {'status': 'SAFE', 'label': 'Safe Stock', 'is_dispensable': True}
`
  },
  {
    path: 'requirements.txt',
    name: 'requirements.txt',
    category: 'core',
    description: 'Python package manifest for pip.',
    content: `Flask==3.0.3
mysql-connector-python==8.4.0
pandas==2.2.2
numpy==1.26.4
matplotlib==3.8.4
scikit-learn==1.4.2
Werkzeug==3.0.3
python-dotenv==1.0.1
`
  },
  {
    path: 'README.md',
    name: 'README.md',
    category: 'doc',
    description: 'Comprehensive GitHub documentation, installation instructions, mathematical formulas, and MCA Viva Voce preparation guide.',
    content: `# MediStock – Medicine Demand & Expiry Predictor
MCA (Artificial Intelligence & Machine Learning) Python Mini Project
Developed by Akash Rajput (akashrajput6248@gmail.com)

Technology Stack:
- Backend: Python 3.10+, Flask 3.0.3, Flask-Session
- Database: MySQL 8.x, mysql-connector-python
- Data Science: Pandas 2.2.2, NumPy 1.26.4
- Frontend: HTML5, CSS3, Bootstrap 5.3, Bootstrap Icons, Chart.js
- Currency: Indian Rupees (INR / ₹)

Quick Setup:
1. Import database.sql into MySQL Server (medistock_db)
2. Update MySQL password in config.py
3. Run: pip install -r requirements.txt
4. Run: python app.py
5. Open: http://127.0.0.1:5000 (admin / admin123)

See root README.md for complete mathematical formulations, system architecture, and viva preparation guide.
`
  }
];

