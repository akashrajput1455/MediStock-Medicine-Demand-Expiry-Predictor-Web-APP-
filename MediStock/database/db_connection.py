"""
MediStock - Database Connection Manager
Provides connection handling to MySQL 8.x database using mysql-connector-python.
Demonstrates: Exception Handling, Connection Pooling, Parameterized Execution.
"""

import mysql.connector
from mysql.connector import Error
from config import Config

def get_db_connection():
    """
    Establishes and returns a connection to the MySQL database.
    Catches connection errors gracefully.
    """
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
    """
    Executes a SELECT query and returns all matching rows as dictionaries.
    Uses parameterized queries to prevent SQL injection.
    """
    conn = get_db_connection()
    if not conn:
        return []
    
    cursor = None
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params or ())
        records = cursor.fetchall()
        return records
    except Error as e:
        print(f"[ERROR] Query execution failed: {e}")
        return []
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()

def fetch_one(query, params=None):
    """
    Executes a SELECT query and returns a single row as a dictionary.
    """
    conn = get_db_connection()
    if not conn:
        return None
    
    cursor = None
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params or ())
        record = cursor.fetchone()
        return record
    except Error as e:
        print(f"[ERROR] Query execution failed: {e}")
        return None
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()

def execute_query(query, params=None):
    """
    Executes an INSERT, UPDATE, or DELETE query.
    Commits changes and returns lastrowid or affected rows.
    """
    conn = get_db_connection()
    if not conn:
        return None
    
    cursor = None
    try:
        cursor = conn.cursor()
        cursor.execute(query, params or ())
        conn.commit()
        return cursor.lastrowid
    except Error as e:
        conn.rollback()
        print(f"[ERROR] Database transaction failed: {e}")
        raise e
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()
