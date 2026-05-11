import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'baadaye-tutafanya-setup-vizuri'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'super-secret-jwt-key-change-in-prod'
    db_url = os.environ.get('DATABASE_URL', 'sqlite:///car_rental.db')
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    
    SQLALCHEMY_DATABASE_URI = db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'static/uploads')
    # File upload safety limits
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}
    # CORS — set FRONTEND_URL in your environment for production
    FRONTEND_URL = os.environ.get('FRONTEND_URL') or 'http://localhost:5173'
