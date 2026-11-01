"""
MediStock - Configuration Module
Defines MySQL database credentials and Flask secret key.
MCA Python Mini Project
"""

import os

class Config:
    """Application configuration parameters."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'medistock_secret_key_mca_2026_secure')
    
    # MySQL Database Configuration
    MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
    MYSQL_PORT = int(os.environ.get('MYSQL_PORT', 3306))
    MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', 'root')  # Change to your MySQL password
    MYSQL_DB = os.environ.get('MYSQL_DB', 'medistock_db')
    
    # Prediction Parameters
    DEFAULT_PREDICTION_MONTHS = 6
    SAFETY_STOCK_FACTOR = 1.25  # 25% safety stock buffer
