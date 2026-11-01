"""
MediStock - Medicine Model
Demonstrates Python Object-Oriented Programming (OOP):
- Classes and Objects
- Constructor (__init__)
- Encapsulation & Validation methods
- Dictionary Serialization
"""

from datetime import datetime, date

class Medicine:
    """Represents a medicine entity in the pharmacy inventory."""

    def __init__(self, medicine_name, category, manufacturer, batch_number,
                 purchase_price, selling_price, quantity, minimum_stock,
                 manufacturing_date, expiry_date, supplier_name, medicine_id=None):
        self.medicine_id = medicine_id
        self.medicine_name = medicine_name.strip()
        self.category = category.strip()
        self.manufacturer = manufacturer.strip()
        self.batch_number = batch_number.strip().upper()
        self.purchase_price = float(purchase_price)
        self.selling_price = float(selling_price)
        self.quantity = int(quantity)
        self.minimum_stock = int(minimum_stock)
        self.manufacturing_date = self._parse_date(manufacturing_date)
        self.expiry_date = self._parse_date(expiry_date)
        self.supplier_name = supplier_name.strip()

    @staticmethod
    def _parse_date(date_val):
        """Converts string date to date object if needed."""
        if isinstance(date_val, (date, datetime)):
            return date_val if isinstance(date_val, date) else date_val.date()
        return datetime.strptime(str(date_val), '%Y-%m-%d').date()

    def validate(self):
        """
        Validates business rules for medicine data.
        Returns: (bool, list of error messages)
        """
        errors = []
        if not self.medicine_name:
            errors.append("Medicine name cannot be empty.")
        if not self.batch_number:
            errors.append("Batch number is required.")
        if self.purchase_price <= 0:
            errors.append("Purchase price must be greater than zero.")
        if self.selling_price <= 0:
            errors.append("Selling price must be greater than zero.")
        if self.selling_price < self.purchase_price:
            errors.append("Selling price should normally be greater than purchase price.")
        if self.quantity < 0:
            errors.append("Available quantity cannot be negative.")
        if self.minimum_stock < 0:
            errors.append("Minimum stock level cannot be negative.")
        if self.expiry_date <= self.manufacturing_date:
            errors.append("Expiry date must be after manufacturing date.")
        
        return len(errors) == 0, errors

    @property
    def is_low_stock(self):
        """Checks if current quantity is below or equal to the minimum threshold."""
        return 0 < self.quantity <= self.minimum_stock

    @property
    def is_out_of_stock(self):
        """Checks if current quantity is depleted."""
        return self.quantity == 0

    @property
    def is_expired(self):
        """Checks if the batch expiry date has passed relative to today."""
        return self.expiry_date < date.today()

    def days_until_expiry(self, reference_date=None):
        """Calculates exact days left until expiration."""
        today = reference_date or date.today()
        return (self.expiry_date - today).days

    def to_dict(self):
        """Serializes medicine object into a dictionary for JSON/template rendering."""
        return {
            'medicine_id': self.medicine_id,
            'medicine_name': self.medicine_name,
            'category': self.category,
            'manufacturer': self.manufacturer,
            'batch_number': self.batch_number,
            'purchase_price': self.purchase_price,
            'selling_price': self.selling_price,
            'quantity': self.quantity,
            'minimum_stock': self.minimum_stock,
            'manufacturing_date': str(self.manufacturing_date),
            'expiry_date': str(self.expiry_date),
            'supplier_name': self.supplier_name,
            'is_low_stock': self.is_low_stock,
            'is_out_of_stock': self.is_out_of_stock,
            'is_expired': self.is_expired
        }
