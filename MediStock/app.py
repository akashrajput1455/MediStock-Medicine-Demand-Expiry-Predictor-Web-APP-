"""
MediStock – Medicine Demand & Expiry Predictor
Main Application Entry Point (Flask Web Server)
MCA Python Mini Project
"""

import os
from flask import Flask, render_template, redirect, url_for, session
from config import Config

# Import Blueprints
from routes.auth import auth_bp
from routes.dashboard import dashboard_bp
from routes.medicines import medicines_bp
from routes.inventory import inventory_bp
from routes.expiry import expiry_bp
from routes.prediction import prediction_bp
from routes.reports import reports_bp

def create_app():
    """Application factory pattern to configure and return Flask instance."""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Register Route Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(medicines_bp)
    app.register_blueprint(inventory_bp)
    app.register_blueprint(expiry_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(reports_bp)

    @app.context_processor
    def inject_global_vars():
        """Injects global template helpers and user session status."""
        return {
            'app_name': 'MediStock',
            'app_subtitle': 'Medicine Demand & Expiry Predictor',
            'current_user': session.get('username'),
            'user_role': session.get('role'),
            'full_name': session.get('full_name')
        }

    # Error Handlers
    @app.errorhandler(404)
    def page_not_found(e):
        return render_template('base.html', content="<div class='alert alert-warning m-4'><h3>404 - Page Not Found</h3><p>The requested URL was not found.</p></div>"), 404

    @app.errorhandler(500)
    def internal_server_error(e):
        return render_template('base.html', content="<div class='alert alert-danger m-4'><h3>500 - Internal Server Error</h3><p>An unexpected database or application error occurred.</p></div>"), 500

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"============================================================")
    print(f" MediStock - Medicine Demand & Expiry Predictor")
    print(f" Running locally on: http://127.0.0.1:{port}")
    print(f" Default Login -> Username: admin | Password: admin123")
    print(f"============================================================")
    app.run(host='0.0.0.0', port=port, debug=True)
