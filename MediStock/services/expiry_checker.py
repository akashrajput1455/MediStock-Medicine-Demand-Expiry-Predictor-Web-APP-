"""
MediStock - Expiry Monitoring Service
MCA Python Mini Project
Demonstrates:
- Python datetime module (date arithmetic, formatting, comparisons)
- Classification logic with conditional structures (if/elif/else)
- Business rule enforcement: preventing expired batches from counting towards active dispensable stock
"""

from datetime import date, datetime

class ExpiryChecker:
    """Classifies medicines based on remaining shelf life and generates alerts."""

    STATUS_EXPIRED = 'EXPIRED'
    STATUS_CRITICAL_30 = 'EXPIRING_30_DAYS'
    STATUS_WARNING_60 = 'EXPIRING_60_DAYS'
    STATUS_ATTENTION_90 = 'EXPIRING_90_DAYS'
    STATUS_SAFE = 'SAFE'

    @staticmethod
    def calculate_shelf_life(expiry_date_input, reference_date=None):
        """
        Calculates remaining days until expiration.
        Demonstrates: datetime.date arithmetic.
        """
        today = reference_date or date.today()
        if isinstance(expiry_date_input, str):
            expiry_date = datetime.strptime(expiry_date_input, '%Y-%m-%d').date()
        elif isinstance(expiry_date_input, datetime):
            expiry_date = expiry_date_input.date()
        else:
            expiry_date = expiry_date_input

        delta_days = (expiry_date - today).days
        return delta_days, expiry_date

    @classmethod
    def classify_expiry(cls, expiry_date_input, reference_date=None):
        """
        Categorizes medicine into five distinct safety levels:
        1. Expired (days < 0)
        2. Expiring in 30 days (0 <= days <= 30)
        3. Expiring in 60 days (31 <= days <= 60)
        4. Expiring in 90 days (61 <= days <= 90)
        5. Safe stock (days > 90)
        """
        days_left, expiry_date = cls.calculate_shelf_life(expiry_date_input, reference_date)

        if days_left < 0:
            return {
                'status': cls.STATUS_EXPIRED,
                'label': 'Expired',
                'badge_color': 'danger',
                'days_remaining': days_left,
                'action_required': 'Quarantine / Dispose immediately. Blocked from dispensing.',
                'is_dispensable': False
            }
        elif days_left <= 30:
            return {
                'status': cls.STATUS_CRITICAL_30,
                'label': 'Expiring within 30 days',
                'badge_color': 'warning-dark',
                'days_remaining': days_left,
                'action_required': 'High Alert: Dispense on priority (FEFO) or return to supplier.',
                'is_dispensable': True
            }
        elif days_left <= 60:
            return {
                'status': cls.STATUS_WARNING_60,
                'label': 'Expiring within 60 days',
                'badge_color': 'warning',
                'days_remaining': days_left,
                'action_required': 'Monitor stock movement; apply FEFO dispensing.',
                'is_dispensable': True
            }
        elif days_left <= 90:
            return {
                'status': cls.STATUS_ATTENTION_90,
                'label': 'Expiring within 90 days',
                'badge_color': 'info',
                'days_remaining': days_left,
                'action_required': 'Track monthly consumption trend.',
                'is_dispensable': True
            }
        else:
            return {
                'status': cls.STATUS_SAFE,
                'label': 'Safe Stock',
                'badge_color': 'success',
                'days_remaining': days_left,
                'action_required': 'No immediate action required.',
                'is_dispensable': True
            }

    @classmethod
    def process_medicine_records(cls, medicines, reference_date=None):
        """
        Enriches a list of medicine records with expiry status and calculates financial risk.
        """
        enriched_records = []
        expired_count = 0
        expiring_30_count = 0
        expiring_60_count = 0
        expiring_90_count = 0
        safe_count = 0
        expired_inventory_value = 0.0
        at_risk_value_30_days = 0.0

        for med in medicines:
            item = dict(med)
            classification = cls.classify_expiry(item['expiry_date'], reference_date)
            item['expiry_status'] = classification['status']
            item['expiry_label'] = classification['label']
            item['badge_color'] = classification['badge_color']
            item['days_remaining'] = classification['days_remaining']
            item['action_required'] = classification['action_required']
            item['is_dispensable'] = classification['is_dispensable']
            item['stock_value'] = float(item.get('quantity', 0)) * float(item.get('purchase_price', 0))

            status = classification['status']
            if status == cls.STATUS_EXPIRED:
                expired_count += 1
                expired_inventory_value += item['stock_value']
            elif status == cls.STATUS_CRITICAL_30:
                expiring_30_count += 1
                at_risk_value_30_days += item['stock_value']
            elif status == cls.STATUS_WARNING_60:
                expiring_60_count += 1
            elif status == cls.STATUS_ATTENTION_90:
                expiring_90_count += 1
            else:
                safe_count += 1

            enriched_records.append(item)

        summary = {
            'total_medicines': len(medicines),
            'expired_count': expired_count,
            'expiring_30_count': expiring_30_count,
            'expiring_60_count': expiring_60_count,
            'expiring_90_count': expiring_90_count,
            'safe_count': safe_count,
            'total_expiring_soon': expiring_30_count + expiring_60_count + expiring_90_count,
            'expired_inventory_value': round(expired_inventory_value, 2),
            'at_risk_value_30_days': round(at_risk_value_30_days, 2)
        }

        return enriched_records, summary
