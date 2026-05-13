import re
import random
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db, Booking, Car, User, BookingStatus, CarStatus

bookings_bp = Blueprint('bookings', __name__)

VALID_STATUSES = {'pending', 'confirmed', 'completed', 'cancelled'}

@bookings_bp.route('/', methods=['POST'])
@jwt_required()
def create_booking():
    user_id = get_jwt_identity()
    if user_id == "admin":
        return jsonify({"message": "Admins cannot book cars. Please use a customer account."}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User session invalid"}), 401

    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid request body"}), 400

    car_id = data.get('car_id')
    car = Car.query.get(car_id)
    if not car:
        return jsonify({"message": "Car not found"}), 404

    if car.status != CarStatus.AVAILABLE:
        return jsonify({"message": "This car is not currently available"}), 409

    try:
        s_raw = data.get('start_date', '')
        e_raw = data.get('end_date', '')
        start_date = datetime.fromisoformat(s_raw.replace('Z', '+00:00')) if 'T' in s_raw else datetime.strptime(s_raw, '%Y-%m-%d')
        end_date = datetime.fromisoformat(e_raw.replace('Z', '+00:00')) if 'T' in e_raw else datetime.strptime(e_raw, '%Y-%m-%d')
    except:
        return jsonify({"message": "Invalid date format"}), 400

    if end_date < start_date:
        return jsonify({"message": "End date cannot be before start date"}), 400

    overlap = Booking.query.filter(
        Booking.car_id == car.id,
        Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.PENDING]),
        Booking.start_date < end_date,
        Booking.end_date > start_date
    ).first()
    if overlap:
        return jsonify({"message": "This car is already booked for the selected dates"}), 409

    mpesa_phone = data.get('mpesa_phone', '').strip()
    if not mpesa_phone or not re.match(r'^(?:254|\+254|0)?([71]\d{8})$', mpesa_phone):
        return jsonify({"message": "Valid Kenyan phone number required for M-Pesa"}), 400

    days = max((end_date - start_date).days, 1)
    total_price = days * car.price_per_day
    mpesa_code = f"MPS{random.randint(1000000000, 9999999999)}"

    booking = Booking(
        user_id=user_id,
        car_id=car.id,
        start_date=start_date,
        end_date=end_date,
        total_price=total_price,
        status=BookingStatus.PENDING,
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
    return jsonify([b.to_dict() for b in bookings]), 200

@bookings_bp.route('/all-bookings', methods=['GET'])
@jwt_required()
def all_bookings():
    claims = get_jwt()
    if not claims.get('is_admin'):
        return jsonify({"message": "Admin access required"}), 403

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    pagination = Booking.query.order_by(Booking.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    
    result = []
    for b in pagination.items:
        entry = b.to_dict()
        entry["user_name"] = b.user.username if b.user else "Unknown"
        entry["user_phone"] = b.user.phone_number if b.user else "N/A"
        result.append(entry)

    return jsonify({
        "bookings": result,
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": pagination.page
    }), 200

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
        return jsonify({"message": "Invalid status"}), 400

    booking.status = new_status
    car = Car.query.get(booking.car_id)
    if car:
        if new_status == 'confirmed':
            car.status = CarStatus.RENTED
        elif new_status in ('cancelled', 'completed'):
            car.status = CarStatus.AVAILABLE

    db.session.commit()
    return jsonify({"message": f"Booking status updated to {new_status}"}), 200
