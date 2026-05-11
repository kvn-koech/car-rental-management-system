from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    phone_number = db.Column(db.String(20), nullable=False)
    national_id = db.Column(db.String(20), unique=True, nullable=True)
    is_admin = db.Column(db.Boolean, default=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Car(db.Model):
    __tablename__ = 'cars'
    id = db.Column(db.Integer, primary_key=True)
    make = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(50), nullable=False)
    year = db.Column(db.Integer)
    price_per_day = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(255))
    status = db.Column(db.String(20), default='available')  # available, rented, maintenance
    location = db.Column(db.String(50), nullable=False)
    # New descriptive fields
    seats = db.Column(db.Integer, default=5)
    transmission = db.Column(db.String(20), default='automatic')  # automatic, manual
    fuel_type = db.Column(db.String(20), default='petrol')        # petrol, diesel, electric, hybrid
    description = db.Column(db.Text, nullable=True)

    images = db.relationship('CarImage', backref='car', lazy=True, cascade="all, delete-orphan")
    bookings = db.relationship('Booking', backref='car', lazy='dynamic')

    def to_dict(self, include_images=True):
        data = {
            "id": self.id,
            "make": self.make,
            "model": self.model,
            "year": self.year,
            "price_per_day": self.price_per_day,
            "image_url": self.image_url,
            "status": self.status,
            "location": self.location,
            "seats": self.seats,
            "transmission": self.transmission,
            "fuel_type": self.fuel_type,
            "description": self.description,
        }
        if include_images:
            data["images"] = [img.image_url for img in self.images]
        return data


class CarImage(db.Model):
    __tablename__ = 'car_images'
    id = db.Column(db.Integer, primary_key=True)
    car_id = db.Column(db.Integer, db.ForeignKey('cars.id'), nullable=False)
    image_url = db.Column(db.String(255), nullable=False)


class Booking(db.Model):
    __tablename__ = 'bookings'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    car_id = db.Column(db.Integer, db.ForeignKey('cars.id'), nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, completed, cancelled
    mpesa_code = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='bookings')

    def to_dict(self):
        return {
            "id": self.id,
            "car_id": self.car_id,
            "car": f"{self.car.make} {self.car.model}" if self.car else "Unknown",
            "car_image": self.car.image_url if self.car else None,
            "start_date": self.start_date.isoformat(),
            "end_date": self.end_date.isoformat(),
            "total_price": self.total_price,
            "status": self.status,
            "mpesa_code": self.mpesa_code,
            "created_at": self.created_at.isoformat(),
        }
