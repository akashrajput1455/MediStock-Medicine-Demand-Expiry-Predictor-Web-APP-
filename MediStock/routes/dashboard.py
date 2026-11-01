"""
MediStock - Dashboard Blueprint
Aggregates KPIs, chart payloads, and recent inventory activity from MySQL.
MCA Python Mini Project
"""

from flask import Blueprint, render_template
from routes.auth import login_required
from database.db_connection import fetch_all
from services.inventory_analysis import InventoryAnalysisService

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/')
@dashboard_bp.route('/dashboard')
@login_required
def index():
    """Renders main executive dashboard with real-time analytics."""
    # 1. Fetch medicines from MySQL
    medicines = fetch_all("SELECT * FROM medicines ORDER BY medicine_name ASC")

    # 2. Fetch recent transactions
    recent_transactions = fetch_all("""
        SELECT t.*, m.medicine_name, m.batch_number 
        FROM inventory_transactions t
        JOIN medicines m ON t.medicine_id = m.medicine_id
        ORDER BY t.transaction_date DESC 
        LIMIT 6
    """)

    # 3. Fetch monthly sales for consumption chart
    monthly_sales = fetch_all("""
        SELECT DATE_FORMAT(sale_date, '%b %Y') as month_label,
               SUM(quantity_sold) as total_units,
               SUM(total_amount) as total_revenue
        FROM sales
        GROUP BY DATE_FORMAT(sale_date, '%Y-%m'), DATE_FORMAT(sale_date, '%b %Y')
        ORDER BY DATE_FORMAT(sale_date, '%Y-%m') ASC
    """)

    # 4. Compute metrics using InventoryAnalysisService
    metrics = InventoryAnalysisService.calculate_dashboard_metrics(medicines)

    # 5. Extract top critical medicines (low stock or expiring soon)
    alert_medicines = [
        m for m in metrics['enriched_medicines'] 
        if m['expiry_status'] in ['EXPIRED', 'EXPIRING_30_DAYS'] or m['quantity'] <= m['minimum_stock']
    ][:5]

    return render_template(
        'dashboard.html',
        metrics=metrics,
        recent_transactions=recent_transactions,
        monthly_sales=monthly_sales,
        alert_medicines=alert_medicines
    )
