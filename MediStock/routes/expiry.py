"""
MediStock - Expiry Monitoring Blueprint
Monitors shelf-life countdowns, classifies risk tiers, and manages disposal actions.
MCA Python Mini Project
"""

from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from routes.auth import login_required
from database.db_connection import fetch_all, fetch_one, execute_query
from services.expiry_checker import ExpiryChecker

expiry_bp = Blueprint('expiry', __name__)

@expiry_bp.route('/expiry')
@login_required
def index():
    """Renders expiry monitoring dashboard and table with status filters."""
    filter_status = request.args.get('status', 'all')

    medicines = fetch_all("SELECT * FROM medicines ORDER BY expiry_date ASC")
    enriched_meds, summary = ExpiryChecker.process_medicine_records(medicines)

    if filter_status == 'expired':
        displayed_meds = [m for m in enriched_meds if m['expiry_status'] == ExpiryChecker.STATUS_EXPIRED]
    elif filter_status == '30':
        displayed_meds = [m for m in enriched_meds if m['expiry_status'] == ExpiryChecker.STATUS_CRITICAL_30]
    elif filter_status == '60':
        displayed_meds = [m for m in enriched_meds if m['expiry_status'] == ExpiryChecker.STATUS_WARNING_60]
    elif filter_status == '90':
        displayed_meds = [m for m in enriched_meds if m['expiry_status'] == ExpiryChecker.STATUS_ATTENTION_90]
    elif filter_status == 'safe':
        displayed_meds = [m for m in enriched_meds if m['expiry_status'] == ExpiryChecker.STATUS_SAFE]
    else:
        displayed_meds = enriched_meds

    return render_template(
        'expiry.html',
        medicines=displayed_meds,
        summary=summary,
        current_filter=filter_status
    )

@expiry_bp.route('/expiry/quarantine/<int:medicine_id>', methods=['POST'])
@login_required
def quarantine_batch(medicine_id):
    """
    Quarantines or writes off an expired batch.
    Sets quantity to 0 and logs an EXPIRED_DISCARD transaction.
    """
    med = fetch_one("SELECT * FROM medicines WHERE medicine_id = %s", (medicine_id,))
    if not med:
        flash('Medicine not found.', 'danger')
        return redirect(url_for('expiry.index'))

    discard_qty = med['quantity']
    if discard_qty <= 0:
        flash(f"Batch {med['batch_number']} is already at zero quantity.", 'info')
        return redirect(url_for('expiry.index'))

    try:
        execute_query("UPDATE medicines SET quantity = 0 WHERE medicine_id = %s", (medicine_id,))
        
        execute_query("""
            INSERT INTO inventory_transactions (medicine_id, transaction_type, quantity, description, performed_by)
            VALUES (%s, 'EXPIRED_DISCARD', %s, %s, %s)
        """, (
            medicine_id,
            discard_qty,
            f"Quarantined & discarded expired batch {med['batch_number']}",
            session.get('username', 'admin')
        ))

        flash(f"Batch {med['batch_number']} ({med['medicine_name']}) has been marked as quarantined and discarded ({discard_qty} units written off).", 'success')
    except Exception as e:
        flash(f"Failed to record disposal: {str(e)}", 'danger')

    return redirect(url_for('expiry.index'))
