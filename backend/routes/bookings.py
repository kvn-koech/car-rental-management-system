from flask import Blueprint, request, jsonify
from models import db, Booking, Car, User
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
import random

bookings_bp = Blueprint('bookings', __name__)

VALID_STATUSES = {'pending', 'confirmed', 'completed', 'cancelled'}


@bookings_bp.route('/', methods=['POST'])
@jwt_required()
def create_booking():
    user_id = get_jwt_identity()
    if user_id == "admin":
        return jsonify({"message": "Admins cannot book cars. Please use a customer account."}), 403

    # Ensure user exists in DB
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User session invalid or not found. Please log in again."}), 401

    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    car_id = data.get('car_id')
    if not car_id:
        return jsonify({"message": "car_id is required"}), 400

    car = Car.query.get(car_id)
    if not car:
        return jsonify({"message": "Car not found"}), 404

    if car.status != 'available':
        return jsonify({"message": "This car is not currently available for booking"}), 409

    # Robust date parsing
    try:
        s_raw = data.get('start_date', '')
        e_raw = data.get('end_date', '')
        
        if not s_raw or not e_raw:
            return jsonify({"message": "Start and end dates are required"}), 400

        if 'T' in s_raw:
            start_date = datetime.fromisoformat(s_raw.replace('Z', '+00:00'))
        else:
            start_date = datetime.strptime(s_raw, '%Y-%m-%d')
            
        if 'T' in e_raw:
            end_date = datetime.fromisoformat(e_raw.replace('Z', '+00:00'))
        else:
            end_date = datetime.strptime(e_raw, '%Y-%m-%d')
            
    except (ValueError, KeyError, TypeError):
        return jsonify({"message": "Invalid date format. Please use YYYY-MM-DD."}), 400

    if end_date < start_date:
        return jsonify({"message": "End date cannot be before start date"}), 400

    # Double-booking / overlap check
    overlap = Booking.query.filter(
        Booking.car_id == car.id,
        Booking.status.in_(['confirmed', 'pending']),
        Booking.start_date < end_date,
        Booking.end_date > start_date
    ).first()
    if overlap:
        return jsonify({"message": "This car is already booked for the selected dates"}), 409

    delta = end_date - start_date
    days = max(delta.days, 1)
    total_price = days * car.price_per_day

    # M-Pesa phone validation
    mpesa_phone = data.get('mpesa_phone', '').strip()
    if not mpesa_phone:
        return jsonify({"message": "M-Pesa phone number is required"}), 400

    # Simulate M-Pesa payment code
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
    bookings = (
        Booking.query
        .filter_by(user_id=user_id)
        .order_by(Booking.created_at.desc())
        .all()
    )
    return jsonify([b.to_dict() for b in bookings]), 200


# ── ADMIN ROUTES ─────────────────────────────────────────────────────────────

@bookings_bp.route('/all-bookings', methods=['GET'])
@jwt_required()
def all_bookings():
    claims = get_jwt()
    if not claims.get('is_admin'):
        return jsonify({"message": "Admin access required"}), 403

    bookings = Booking.query.order_by(Booking.created_at.desc()).all()

    result = []
    for booking in bookings:
        entry = booking.to_dict()
        # Enrich with user info (user relationship already loaded)
        u = booking.user
        entry["user_id"] = booking.user_id
        entry["user_name"] = u.username if u else "Unknown"
        entry["user_phone"] = u.phone_number if u else "N/A"
        result.append(entry)

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

    if new_status not in VALID_STATUSES:
        return jsonify({"message": f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}"}), 400

    booking.status = new_status

    car = Car.query.get(booking.car_id)
    if car:
        if new_status == 'confirmed':
            car.status = 'rented'
        elif new_status in ('cancelled', 'completed'):
            # Free the car back to available when booking ends or is cancelled
            car.status = 'available'

    db.session.commit()
    return jsonify({"message": f"Booking status updated to {new_status}"}), 200
