import os
import logging
from logging.handlers import RotatingFileHandler
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config import Config
from models import db
from routes.auth import auth_bp

def setup_logging(app):
    if not os.path.exists('logs'):
        os.mkdir('logs')
    
    file_handler = RotatingFileHandler('logs/car_rental.log', maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)

    app.logger.setLevel(logging.INFO)
    app.logger.info('Car Rental System Startup')

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    app.url_map.strict_slashes = False

    # Setup Logging
    setup_logging(app)

    # Initialize extensions
    db.init_app(app)
    
    # Configure CORS
    frontend_url = app.config.get('FRONTEND_URL', 'http://localhost:5173').rstrip('/')
    origins = [
        frontend_url, 
        f"{frontend_url}/",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ]
    CORS(app, origins=list(set(origins)), supports_credentials=True)
    
    JWTManager(app)

    # Initialize Limiter
    limiter = Limiter(
        key_func=get_remote_address,
        app=app,
        default_limits=["200 per day", "50 per hour"],
        storage_uri="memory://"
    )

    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    from routes.cars import cars_bp
    app.register_blueprint(cars_bp, url_prefix='/api/cars')

    from routes.bookings import bookings_bp
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')

    @app.route('/')
    def home():
        app.logger.info('Home route accessed')
        return {"message": "Karibu! Car Rental Management System Backend is Running."}

    @app.route('/health')
    def health():
        return {"status": "healthy"}

    return app


if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(debug=True)
