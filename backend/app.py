from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db
from routes.auth import auth_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    CORS(app)
    JWTManager(app)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    from routes.cars import cars_bp
    app.register_blueprint(cars_bp, url_prefix='/api/cars')
    
    from routes.bookings import bookings_bp
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')

    @app.route('/')
    def home():
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
