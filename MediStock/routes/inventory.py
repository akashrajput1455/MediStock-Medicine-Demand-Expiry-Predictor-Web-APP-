"""
MediStock - Inventory Management Blueprint
Monitors stock levels, manages Stock In / Stock Out, and maintains transaction audit trail.
MCA Python Mini Project
"""

from datetime import date
from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from routes.auth import login_required
from database.db_connection import fetch_all, fetch_one, execute_query
from services.expiry_checker import ExpiryChecker

inventory_bp = Blueprint('inventory', __name__)

@inventory_bp.route('/inventory')
@login_required
def index():
    """Renders inventory monitoring view and recent transaction history."""
    filter_type = request.args.get('filter', 'all')

    medicines = fetch_all("SELECT * FROM medicines ORDER BY quantity ASC, medicine_name ASC")
    enriched_meds, _ = ExpiryChecker.process_medicine_records(medicines)

    if filter_type == 'low':
        filtered_meds = [m for m in enriched_meds if 0 < m['quantity'] <= m['minimum_stock']]
    elif filter_type == 'out':
        filtered_meds = [m for m in enriched_meds if m['quantity'] == 0]
    elif filter_type == 'adequate':
        filtered_meds = [m for m in enriched_meds if m['quantity'] > m['minimum_stock']]
    else:
        filtered_meds = enriched_meds

    # Fetch recent transactions
    transactions = fetch_all("""
        SELECT t.*, m.medicine_name, m.batch_number 
        FROM inventory_transactions t
        JOIN medicines m ON t.medicine_id = m.medicine_id
        ORDER BY t.transaction_date DESC 
        LIMIT 25
    """)

    return render_template(
        'inventory.html',
        medicines=filtered_meds,
        all_medicines=medicines,
        transactions=transactions,
        current_filter=filter_type
    )

@inventory_bp.route('/inventory/adjust', methods=['POST'])
@login_required
def adjust_stock():
    """
    Records a Stock In (addition) or Stock Out (deduction/dispensing).
    Enforces business logic: prevents negative balances and expired medicine dispensing.
    """
    medicine_id = request.form.get('medicine_id', type=int)
    action_type = request.form.get('action_type', '').upper()  # 'IN' or 'OUT'
    quantity = request.form.get('quantity', type=int)
    description = request.form.get('description', '').strip()

    if not medicine_id or not quantity or quantity <= 0:
        flash('Invalid medicine or quantity.', 'danger')
        return redirect(url_for('inventory.index'))

    med = fetch_one("SELECT * FROM medicines WHERE medicine_id = %s", (medicine_id,))
    if not med:
        flash('Medicine not found.', 'danger')
        return redirect(url_for('inventory.index'))

    # Check expiry before dispensing
    classification = ExpiryChecker.classify_expiry(med['expiry_date'])
    if action_type == 'OUT' and not classification['is_dispensable']:
        flash(f"CRITICAL: Cannot dispense '{med['medicine_name']}' because this batch has EXPIRED. Please quarantine or dispose it.", 'danger')
        return redirect(url_for('inventory.index'))

    current_qty = med['quantity']

    if action_type == 'OUT':
        if quantity > current_qty:
            flash(f"Cannot dispense {quantity} units. Only {current_qty} units available in stock.", 'danger')
            return redirect(url_for('inventory.index'))
        new_qty = current_qty - quantity
        trans_type = 'OUT'
        if not description:
            description = 'Prescription dispensing / Outward stock'

        # Also log to sales table for demand prediction tracking
        total_price = quantity * float(med['selling_price'])
        execute_query("""
            INSERT INTO sales (medicine_id, quantity_sold, sale_date, total_amount, patient_reference)
            VALUES (%s, %s, %s, %s, %s)
        """, (medicine_id, quantity, date.today().strftime('%Y-%m-%d'), total_price, 'Direct Dispensation'))

    elif action_type == 'IN':
        new_qty = current_qty + quantity
        trans_type = 'IN'
        if not description:
            description = 'Restock delivery / Inward shipment'
    else:
        flash('Invalid transaction action type.', 'danger')
        return redirect(url_for('inventory.index'))

    try:
        # Update medicine table
        execute_query("UPDATE medicines SET quantity = %s WHERE medicine_id = %s", (new_qty, medicine_id))
        
        # Log to inventory_transactions table
        operator = session.get('username', 'admin')
        execute_query("""
            INSERT INTO inventory_transactions (medicine_id, transaction_type, quantity, description, performed_by)
            VALUES (%s, %s, %s, %s, %s)
        """, (medicine_id, trans_type, quantity, description, operator))

        flash(f"Stock updated for '{med['medicine_name']}'. New quantity: {new_qty} units.", 'success')
    except Exception as e:
        flash(f"Transaction failed: {str(e)}", 'danger')

    return redirect(url_for('inventory.index'))
