/**
 * MediStock - Client Script Helpers
 * Handles UI interactions, alert dismissals, and quick filters.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Auto-dismiss alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert-dismissible');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = bootstrap.Alert.getInstance(alert);
            if (bsAlert) {
                bsAlert.close();
            }
        }, 5000);
    });

    console.log("MediStock Pharmacy Management System loaded successfully.");
});
