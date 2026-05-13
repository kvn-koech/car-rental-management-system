

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
