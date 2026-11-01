"""
MediStock - Medicine Demand Prediction Blueprint
Analyzes consumption patterns, performs linear regression & moving average forecasting.
MCA Python Mini Project
"""

from flask import Blueprint, render_template, request, flash
from routes.auth import login_required
from database.db_connection import fetch_all, fetch_one
from services.demand_prediction import DemandPredictor

prediction_bp = Blueprint('prediction', __name__)

@prediction_bp.route('/prediction', methods=['GET', 'POST'])
@login_required
def index():
    """Renders demand prediction analysis page and handles calculation requests."""
    # Fetch all medicines for dropdown
    medicines = fetch_all("SELECT medicine_id, medicine_name, batch_number, quantity, minimum_stock FROM medicines ORDER BY medicine_name ASC")

    selected_med_id = request.args.get('medicine_id', type=int) or request.form.get('medicine_id', type=int)
    method = request.args.get('method', 'linear_regression') or request.form.get('method', 'linear_regression')
    
    # If no medicine selected yet, default to first medicine (e.g. Paracetamol) if available
    if not selected_med_id and medicines:
        selected_med_id = medicines[0]['medicine_id']

    selected_medicine = None
    prediction_result = None

    if selected_med_id:
        selected_medicine = fetch_one("SELECT * FROM medicines WHERE medicine_id = %s", (selected_med_id,))
        if selected_medicine:
            # Fetch all historical sales for this medicine
            sales_records = fetch_all("""
                SELECT quantity_sold, sale_date, total_amount 
                FROM sales 
                WHERE medicine_id = %s 
                ORDER BY sale_date ASC
            """, (selected_med_id,))

            prediction_result = DemandPredictor.predict_demand(
                sales_records=sales_records,
                current_stock=selected_medicine['quantity'],
                minimum_stock=selected_medicine['minimum_stock'],
                method=method
            )

    return render_template(
        'prediction.html',
        medicines=medicines,
        selected_medicine=selected_medicine,
        selected_med_id=selected_med_id,
        method=method,
        result=prediction_result
    )
