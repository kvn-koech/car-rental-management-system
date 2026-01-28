from flask import Blueprint, request, jsonify
from models import db, Booking, Car
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import random

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('/', methods=['POST'])
@jwt_required()
def create_booking():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    car = Car.query.get_or_404(data['car_id'])
    
    try:
        start_date = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(data['end_date'].replace('Z', '+00:00'))
    except ValueError:
        return jsonify({"message": "Invalid date format"}), 400
    
    delta = end_date - start_date
    days = delta.days
    if days < 1:
        days = 1
        
    total_price = days * car.price_per_day
    
    # Simulate M-Pesa Payment
    mpesa_phone = data.get('mpesa_phone')
    if not mpesa_phone:
        return jsonify({"message": "M-Pesa phone number required"}), 400
        
    # Simulate processing...
    mpesa_code = f"MPS{random.randint(1000000000, 9999999999)}"
    
    booking = Booking(
        user_id=user_id,
        car_id=car.id,
        start_date=start_date,
        end_date=end_date,
        total_price=total_price,
        status='confirmed',
        mpesa_code=mpesa_code
    )
    
    db.session.add(booking)
    db.session.commit()
    
    return jsonify({
        "message": "Booking confirmed successfully",
        "booking_id": booking.id,
        "total_price": total_price,
        "mpesa_code": mpesa_code,
        "status": "confirmed"
    }), 201

@bookings_bp.route('/my-bookings', methods=['GET'])
@jwt_required()
def my_bookings():
    user_id = get_jwt_identity()
    bookings = Booking.query.filter_by(user_id=user_id).order_by(Booking.created_at.desc()).all()
    
    result = []
    for booking in bookings:
        car = Car.query.get(booking.car_id)
        result.append({
            "id": booking.id,
            "car": f"{car.make} {car.model}",
            "start_date": booking.start_date.isoformat(),
            "end_date": booking.end_date.isoformat(),
            "total_price": booking.total_price,
            "status": booking.status,
            "mpesa_code": booking.mpesa_code
        })
        
    return jsonify(result), 200
