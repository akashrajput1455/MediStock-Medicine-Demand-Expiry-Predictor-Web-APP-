"""
MediStock - Medicine Management Blueprint
Handles CRUD operations for medicines with validation and audit logging.
MCA Python Mini Project
"""

from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from routes.auth import login_required
from database.db_connection import fetch_all, fetch_one, execute_query
from models.medicine import Medicine
from services.expiry_checker import ExpiryChecker

medicines_bp = Blueprint('medicines', __name__)

@medicines_bp.route('/medicines')
@login_required
def index():
    """List all medicines with optional search and filter parameters."""
    search_query = request.args.get('search', '').strip()
    category_filter = request.args.get('category', '').strip()
    status_filter = request.args.get('status', '').strip()

    sql = "SELECT * FROM medicines WHERE 1=1"
    params = []

    if search_query:
        sql += " AND (medicine_name LIKE %s OR batch_number LIKE %s OR manufacturer LIKE %s OR supplier_name LIKE %s)"
        pattern = f"%{search_query}%"
        params.extend([pattern, pattern, pattern, pattern])

    if category_filter:
        sql += " AND category = %s"
        params.append(category_filter)

    sql += " ORDER BY medicine_name ASC"
    raw_medicines = fetch_all(sql, params)

    # Enrich with expiry details
    enriched_meds, _ = ExpiryChecker.process_medicine_records(raw_medicines)

    # Apply client-side status filter if requested
    if status_filter == 'low':
        enriched_meds = [m for m in enriched_meds if 0 < m['quantity'] <= m['minimum_stock']]
    elif status_filter == 'out':
        enriched_meds = [m for m in enriched_meds if m['quantity'] == 0]
    elif status_filter == 'expired':
        enriched_meds = [m for m in enriched_meds if m['expiry_status'] == 'EXPIRED']
    elif status_filter == 'safe':
        enriched_meds = [m for m in enriched_meds if m['quantity'] > m['minimum_stock'] and m['expiry_status'] != 'EXPIRED']

    # Get distinct categories for dropdown
    categories = fetch_all("SELECT DISTINCT category FROM medicines ORDER BY category ASC")

    return render_template(
        'medicines.html',
        medicines=enriched_meds,
        categories=categories,
        search_query=search_query,
        selected_category=category_filter,
        selected_status=status_filter
    )

@medicines_bp.route('/medicines/add', methods=['GET', 'POST'])
@login_required
def add():
    """Adds a new medicine with OOP validation and logs initial transaction."""
    if request.method == 'POST':
        med = Medicine(
            medicine_name=request.form.get('medicine_name', ''),
            category=request.form.get('category', ''),
            manufacturer=request.form.get('manufacturer', ''),
            batch_number=request.form.get('batch_number', ''),
            purchase_price=request.form.get('purchase_price', 0),
            selling_price=request.form.get('selling_price', 0),
            quantity=request.form.get('quantity', 0),
            minimum_stock=request.form.get('minimum_stock', 20),
            manufacturing_date=request.form.get('manufacturing_date', ''),
            expiry_date=request.form.get('expiry_date', ''),
            supplier_name=request.form.get('supplier_name', '')
        )

        is_valid, errors = med.validate()
        if not is_valid:
            for err in errors:
                flash(err, 'danger')
            return render_template('add_medicine.html', med=request.form)

        # Check unique batch number
        existing_batch = fetch_one("SELECT medicine_id FROM medicines WHERE batch_number = %s", (med.batch_number,))
        if existing_batch:
            flash(f"Batch number '{med.batch_number}' already exists in database.", 'danger')
            return render_template('add_medicine.html', med=request.form)

        # Insert medicine record
        insert_sql = """
            INSERT INTO medicines 
            (medicine_name, category, manufacturer, batch_number, purchase_price, 
             selling_price, quantity, minimum_stock, manufacturing_date, expiry_date, supplier_name)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        try:
            medicine_id = execute_query(insert_sql, (
                med.medicine_name, med.category, med.manufacturer, med.batch_number,
                med.purchase_price, med.selling_price, med.quantity, med.minimum_stock,
                med.manufacturing_date, med.expiry_date, med.supplier_name
            ))

            # Automatically log inventory transaction
            if med.quantity > 0:
                execute_query("""
                    INSERT INTO inventory_transactions (medicine_id, transaction_type, quantity, description, performed_by)
                    VALUES (%s, 'IN', %s, %s, %s)
                """, (medicine_id, med.quantity, f"Initial batch receipt for {med.medicine_name}", session.get('username', 'admin')))

            flash(f"Medicine '{med.medicine_name}' added successfully!", 'success')
            return redirect(url_for('medicines.index'))
        except Exception as e:
            flash(f"Database error while saving medicine: {str(e)}", 'danger')

    return render_template('add_medicine.html', med={})

@medicines_bp.route('/medicines/edit/<int:medicine_id>', methods=['GET', 'POST'])
@login_required
def edit(medicine_id):
    """Updates an existing medicine."""
    medicine_record = fetch_one("SELECT * FROM medicines WHERE medicine_id = %s", (medicine_id,))
    if not medicine_record:
        flash('Medicine not found.', 'danger')
        return redirect(url_for('medicines.index'))

    if request.method == 'POST':
        med = Medicine(
            medicine_name=request.form.get('medicine_name', ''),
            category=request.form.get('category', ''),
            manufacturer=request.form.get('manufacturer', ''),
            batch_number=request.form.get('batch_number', ''),
            purchase_price=request.form.get('purchase_price', 0),
            selling_price=request.form.get('selling_price', 0),
            quantity=request.form.get('quantity', 0),
            minimum_stock=request.form.get('minimum_stock', 20),
            manufacturing_date=request.form.get('manufacturing_date', ''),
            expiry_date=request.form.get('expiry_date', ''),
            supplier_name=request.form.get('supplier_name', ''),
            medicine_id=medicine_id
        )

        is_valid, errors = med.validate()
        if not is_valid:
            for err in errors:
                flash(err, 'danger')
            return render_template('edit_medicine.html', med=request.form, medicine_id=medicine_id)

        update_sql = """
            UPDATE medicines SET 
                medicine_name = %s, category = %s, manufacturer = %s, batch_number = %s,
                purchase_price = %s, selling_price = %s, quantity = %s, minimum_stock = %s,
                manufacturing_date = %s, expiry_date = %s, supplier_name = %s
            WHERE medicine_id = %s
        """
        try:
            execute_query(update_sql, (
                med.medicine_name, med.category, med.manufacturer, med.batch_number,
                med.purchase_price, med.selling_price, med.quantity, med.minimum_stock,
                med.manufacturing_date, med.expiry_date, med.supplier_name, medicine_id
            ))
            flash(f"Medicine '{med.medicine_name}' updated successfully!", 'success')
            return redirect(url_for('medicines.index'))
        except Exception as e:
            flash(f"Error updating medicine: {str(e)}", 'danger')

    return render_template('edit_medicine.html', med=medicine_record, medicine_id=medicine_id)

@medicines_bp.route('/medicines/delete/<int:medicine_id>', methods=['POST'])
@login_required
def delete(medicine_id):
    """Deletes a medicine record and its associated history."""
    medicine = fetch_one("SELECT medicine_name FROM medicines WHERE medicine_id = %s", (medicine_id,))
    if not medicine:
        flash('Medicine not found.', 'danger')
        return redirect(url_for('medicines.index'))

    try:
        execute_query("DELETE FROM medicines WHERE medicine_id = %s", (medicine_id,))
        flash(f"Medicine '{medicine['medicine_name']}' deleted successfully.", 'success')
    except Exception as e:
        flash(f"Error deleting medicine: {str(e)}", 'danger')

    return redirect(url_for('medicines.index'))
