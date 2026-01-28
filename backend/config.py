import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'baadaye-tutafanya-setup-vizuri'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'super-secret-jwt-key-change-in-prod'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///car_rental.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
