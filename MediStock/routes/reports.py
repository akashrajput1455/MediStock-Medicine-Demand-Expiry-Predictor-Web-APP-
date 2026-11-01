"""
MediStock - Reports & CSV Export Blueprint
Generates tabular inventory reports and dynamic CSV downloads.
MCA Python Mini Project
Demonstrates: Python csv module, StringIO, Response headers, Data formatting.
"""

import io
import csv
from datetime import datetime, date
from flask import Blueprint, render_template, request, Response
from routes.auth import login_required
from database.db_connection import fetch_all
from services.expiry_checker import ExpiryChecker
from services.demand_prediction import DemandPredictor

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/reports')
@login_required
def index():
    """Renders reports portal with selection of report types."""
    report_type = request.args.get('type', 'inventory')
    
    medicines = fetch_all("SELECT * FROM medicines ORDER BY medicine_name ASC")
    enriched_meds, summary = ExpiryChecker.process_medicine_records(medicines)

    report_data = []
    report_title = "Complete Medicine Inventory Report"

    if report_type == 'inventory':
        report_title = "Complete Medicine Inventory Report"
        report_data = enriched_meds

    elif report_type == 'low_stock':
        report_title = "Low-Stock Medicines Report"
        report_data = [m for m in enriched_meds if 0 < m['quantity'] <= m['minimum_stock']]

    elif report_type == 'expired':
        report_title = "Expired Medicines Report"
        report_data = [m for m in enriched_meds if m['expiry_status'] == 'EXPIRED']

    elif report_type == 'expiring_soon':
        report_title = "Medicines Expiring Soon (Within 90 Days)"
        report_data = [m for m in enriched_meds if m['expiry_status'] in ['EXPIRING_30_DAYS', 'EXPIRING_60_DAYS', 'EXPIRING_90_DAYS']]

    elif report_type == 'consumption':
        report_title = "Medicine Consumption & Sales History"
        report_data = fetch_all("""
            SELECT s.sale_id, s.sale_date, m.medicine_name, m.batch_number,
                   s.quantity_sold, s.total_amount, s.patient_reference
            FROM sales s
            JOIN medicines m ON s.medicine_id = m.medicine_id
            ORDER BY s.sale_date DESC
        """)

    elif report_type == 'demand_forecast':
        report_title = "Medicine Demand Forecast & Reorder Recommendations"
        report_data = []
        for med in enriched_meds:
            sales = fetch_all("SELECT quantity_sold, sale_date FROM sales WHERE medicine_id = %s", (med['medicine_id'],))
            pred = DemandPredictor.predict_demand(sales, med['quantity'], med['minimum_stock'])
            report_data.append({
                'medicine_id': med['medicine_id'],
                'medicine_name': med['medicine_name'],
                'batch_number': med['batch_number'],
                'current_stock': med['quantity'],
                'minimum_stock': med['minimum_stock'],
                'predicted_demand': pred.get('predicted_units', 0) if pred.get('sufficient_data') else 'N/A',
                'recommended_reorder': pred.get('recommended_reorder', 0),
                'urgency': pred.get('urgency_level', 'Normal')
            })

    return render_template(
        'reports.html',
        report_type=report_type,
        report_title=report_title,
        data=report_data,
        summary=summary,
        today=date.today()
    )

@reports_bp.route('/reports/export/csv')
@login_required
def export_csv():
    """
    Dynamically generates a downloadable CSV file using Python's csv module.
    Demonstrates: In-memory file buffer (io.StringIO) and HTTP attachment streaming.
    """
    report_type = request.args.get('type', 'inventory')
    output = io.StringIO()
    writer = csv.writer(output)

    timestamp_str = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"medistock_{report_type}_{timestamp_str}.csv"

    if report_type == 'consumption':
        writer.writerow(['Sale ID', 'Sale Date', 'Medicine Name', 'Batch Number', 'Quantity Sold', 'Total Amount (₹)', 'Reference'])
        rows = fetch_all("""
            SELECT s.sale_id, s.sale_date, m.medicine_name, m.batch_number,
                   s.quantity_sold, s.total_amount, s.patient_reference
            FROM sales s
            JOIN medicines m ON s.medicine_id = m.medicine_id
            ORDER BY s.sale_date DESC
        """)
        for r in rows:
            writer.writerow([r['sale_id'], r['sale_date'], r['medicine_name'], r['batch_number'], r['quantity_sold'], r['total_amount'], r['patient_reference']])

    elif report_type == 'demand_forecast':
        writer.writerow(['Medicine Name', 'Batch Number', 'Current Stock', 'Minimum Stock', 'Predicted Next Month Demand', 'Recommended Reorder Quantity', 'Urgency Status'])
        medicines = fetch_all("SELECT * FROM medicines ORDER BY medicine_name ASC")
        for m in medicines:
            sales = fetch_all("SELECT quantity_sold, sale_date FROM sales WHERE medicine_id = %s", (m['medicine_id'],))
            pred = DemandPredictor.predict_demand(sales, m['quantity'], m['minimum_stock'])
            pred_val = pred.get('predicted_units', 'N/A') if pred.get('sufficient_data') else 'N/A (Insufficient Data)'
            writer.writerow([m['medicine_name'], m['batch_number'], m['quantity'], m['minimum_stock'], pred_val, pred.get('recommended_reorder', 0), pred.get('urgency_level', 'Normal')])

    else:
        # Standard medicine reports (inventory, low_stock, expired, expiring_soon)
        writer.writerow(['ID', 'Medicine Name', 'Category', 'Manufacturer', 'Batch Number', 'Purchase Price (₹)', 'Selling Price (₹)', 'Quantity', 'Min Stock', 'Mfg Date', 'Expiry Date', 'Supplier', 'Expiry Status', 'Days Left'])
        medicines = fetch_all("SELECT * FROM medicines ORDER BY medicine_name ASC")
        enriched_meds, _ = ExpiryChecker.process_medicine_records(medicines)

        if report_type == 'low_stock':
            enriched_meds = [m for m in enriched_meds if 0 < m['quantity'] <= m['minimum_stock']]
        elif report_type == 'expired':
            enriched_meds = [m for m in enriched_meds if m['expiry_status'] == 'EXPIRED']
        elif report_type == 'expiring_soon':
            enriched_meds = [m for m in enriched_meds if m['expiry_status'] in ['EXPIRING_30_DAYS', 'EXPIRING_60_DAYS', 'EXPIRING_90_DAYS']]

        for m in enriched_meds:
            writer.writerow([
                m['medicine_id'], m['medicine_name'], m['category'], m['manufacturer'],
                m['batch_number'], m['purchase_price'], m['selling_price'], m['quantity'],
                m['minimum_stock'], m['manufacturing_date'], m['expiry_date'],
                m['supplier_name'], m['expiry_label'], m['days_remaining']
            ])

    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment;filename={filename}"}
    )
