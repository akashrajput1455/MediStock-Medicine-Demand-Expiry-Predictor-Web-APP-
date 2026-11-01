"""
MediStock - Authentication Blueprint
Handles login, logout, password verification, and session control.
MCA Python Mini Project
"""

from functools import wraps
from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from werkzeug.security import check_password_hash
import hashlib
from database.db_connection import fetch_one

auth_bp = Blueprint('auth', __name__)

def login_required(f):
    """
    Python Decorator to protect routes requiring authentication.
    Demonstrates: Higher-order functions and Python decorators.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in first to access this page.', 'warning')
            return redirect(url_for('auth.login'))
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Renders login page and verifies user credentials."""
    if 'user_id' in session:
        return redirect(url_for('dashboard.index'))

    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()

        if not username or not password:
            flash('Both username and password are required.', 'danger')
            return render_template('login.html')

        user = fetch_one("SELECT * FROM users WHERE username = %s", (username,))

        if user:
            # Check password using werkzeug or fallback sha256 or demo check
            stored_hash = user['password']
            password_matches = False
            
            try:
                password_matches = check_password_hash(stored_hash, password)
            except Exception:
                pass
            
            # Also allow fallback comparison for development simplicity
            if not password_matches:
                sha256_hash = hashlib.sha256(password.encode()).hexdigest()
                if sha256_hash == stored_hash or (username == 'admin' and password == 'admin123') or (username == 'staff' and password == 'staff123'):
                    password_matches = True

            if password_matches:
                session['user_id'] = user['user_id']
                session['username'] = user['username']
                session['full_name'] = user['full_name']
                session['role'] = user.get('role', 'Pharmacist')
                flash(f"Welcome back, {user['full_name']}!", 'success')
                return redirect(url_for('dashboard.index'))
        
        flash('Invalid username or password. Please try again.', 'danger')

    return render_template('login.html')

@auth_bp.route('/logout')
def logout():
    """Terminates session and redirects to login."""
    session.clear()
    flash('You have been successfully logged out.', 'info')
    return redirect(url_for('auth.login'))
