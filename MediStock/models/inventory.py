"""
MediStock - Inventory Transaction Model
Handles inventory movements (IN, OUT, ADJUSTMENT, EXPIRED_DISCARD)
Demonstrates: Transaction tracking and audit logging.
"""

from datetime import datetime

class InventoryTransaction:
    """Represents an audit entry whenever stock increases or decreases."""
    
    TRANSACTION_TYPES = ['IN', 'OUT', 'ADJUSTMENT', 'EXPIRED_DISCARD']

    def __init__(self, medicine_id, transaction_type, quantity, description, performed_by='admin', transaction_id=None, transaction_date=None):
        self.transaction_id = transaction_id
        self.medicine_id = medicine_id
        self.transaction_type = transaction_type.upper()
        self.quantity = int(quantity)
        self.description = description.strip()
        self.performed_by = performed_by
        self.transaction_date = transaction_date or datetime.now()

    def validate(self):
        """Validates transaction integrity."""
        errors = []
        if self.transaction_type not in self.TRANSACTION_TYPES:
            errors.append(f"Invalid transaction type: {self.transaction_type}")
        if self.quantity <= 0:
            errors.append("Transaction quantity must be greater than zero.")
        if not self.description:
            errors.append("Transaction description / reason is required.")
        return len(errors) == 0, errors

    def to_dict(self):
        return {
            'transaction_id': self.transaction_id,
            'medicine_id': self.medicine_id,
            'transaction_type': self.transaction_type,
            'quantity': self.quantity,
            'description': self.description,
            'performed_by': self.performed_by,
            'transaction_date': str(self.transaction_date)
        }
