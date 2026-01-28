import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'baadaye-tutafanya-setup-vizuri'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///car_rental.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
