import os

class Config:
    IS_RENDER = os.environ.get('RENDER', '').lower() == 'true'
    SECRET_KEY = os.environ.get('SECRET_KEY')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    ADMIN_SECRET_KEY = os.environ.get('ADMIN_SECRET_KEY')
    FRONTEND_URL = os.environ.get('FRONTEND_URL')
    db_url = os.environ.get('DATABASE_URL')

    if IS_RENDER:
        missing = [
            name for name, value in {
                'SECRET_KEY': SECRET_KEY,
                'JWT_SECRET_KEY': JWT_SECRET_KEY,
                'ADMIN_SECRET_KEY': ADMIN_SECRET_KEY,
                'FRONTEND_URL': FRONTEND_URL,
                'DATABASE_URL': db_url,
            }.items() if not value
        ]
        if missing:
            raise RuntimeError(f"Missing required Render environment variables: {', '.join(missing)}")
    else:
        SECRET_KEY = SECRET_KEY or 'baadaye-tutafanya-setup-vizuri'
        JWT_SECRET_KEY = JWT_SECRET_KEY or 'super-secret-jwt-key-change-in-prod'
        ADMIN_SECRET_KEY = ADMIN_SECRET_KEY or 'MY_SECRET_ADMIN_KEY'
        FRONTEND_URL = FRONTEND_URL or 'http://localhost:5173'
        db_url = db_url or 'sqlite:///car_rental.db'

    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+psycopg://", 1)
    elif db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)
    
    SQLALCHEMY_DATABASE_URI = db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'static/uploads')
    # File upload safety limits
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}
