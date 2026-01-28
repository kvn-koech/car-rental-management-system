from flask import Blueprint, request, jsonify
from models import db, Booking, Car
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
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
        status='pending',
        mpesa_code=mpesa_code
    )
    
    db.session.add(booking)
    db.session.commit()
    
    return jsonify({
        "message": "Booking request sent successfully",
        "booking_id": booking.id,
        "total_price": total_price,
        "mpesa_code": mpesa_code,
        "status": "pending"
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

# ADMIN ROUTES

@bookings_bp.route('/all-bookings', methods=['GET'])
@jwt_required()
def all_bookings():
    claims = get_jwt()
    if not claims.get('is_admin'):
        return jsonify({"message": "Admin access required"}), 403
        
    bookings = Booking.query.order_by(Booking.created_at.desc()).all()
    
    result = []
    for booking in bookings:
        car = Car.query.get(booking.car_id)
        # Fetch user info too in a real app
        result.append({
            "id": booking.id,
            "user_id": booking.user_id,
            "car": f"{car.make} {car.model}",
            "start_date": booking.start_date.isoformat(),
            "end_date": booking.end_date.isoformat(),
            "total_price": booking.total_price,
            "status": booking.status,
            "mpesa_code": booking.mpesa_code,
            "created_at": booking.created_at.isoformat()
        })
        
    return jsonify(result), 200

@bookings_bp.route('/<int:id>/status', methods=['PATCH'])
@jwt_required()
def update_booking_status(id):
    claims = get_jwt()
    if not claims.get('is_admin'):
        return jsonify({"message": "Admin access required"}), 403
        
    booking = Booking.query.get_or_404(id)
    data = request.get_json()
    new_status = data.get('status')
    
    if new_status not in ['confirmed', 'cancelled', 'pending']:
        return jsonify({"message": "Invalid status"}), 400
        
    booking.status = new_status
    
    # Update car status if confirmed
    if new_status == 'confirmed':
        car = Car.query.get(booking.car_id)
        if car:
            car.status = 'rented'
    elif new_status == 'cancelled':
        # If cancelling a confirmed booking, free up the car
        # (Naive implementation, assumes car was rented by THIS booking. 
        # In logic-heavy apps, check overlaps etc.)
        car = Car.query.get(booking.car_id)
        if car and car.status == 'rented':
            car.status = 'available'
            
    db.session.commit()
    
    return jsonify({"message": f"Booking status updated to {new_status}"}), 200
