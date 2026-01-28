from flask import Blueprint, request, jsonify
from models import db, Car
from flask_jwt_extended import jwt_required, get_jwt

cars_bp = Blueprint('cars', __name__)

@cars_bp.route('/', methods=['GET'])
def get_cars():
    location = request.args.get('location')
    
    query = Car.query
    if location:
        query = query.filter(Car.location.ilike(f'%{location}%'))
    
    # Optional: Filter by status available if not admin? 
    # For now, let everyone see all cars, but maybe UI filters it.
        
    cars = query.all()
    
    result = []
    for car in cars:
        result.append({
            "id": car.id,
            "make": car.make,
            "model": car.model,
            "year": car.year,
            "price_per_day": car.price_per_day,
            "image_url": car.image_url,
            "status": car.status,
            "location": car.location
        })
        
    return jsonify(result), 200

@cars_bp.route('/', methods=['POST'])
@jwt_required()
def add_car():
    claims = get_jwt()
    if not claims.get('is_admin'):
        return jsonify({"message": "Admin access required"}), 403

    data = request.get_json()
    new_car = Car(
        make=data['make'],
        model=data['model'],
        year=data.get('year'),
        price_per_day=data['price_per_day'],
        image_url=data.get('image_url'),
        location=data['location'],
        status=data.get('status', 'available')
    )
    db.session.add(new_car)
    db.session.commit()
    return jsonify({"message": "Car added successfully", "id": new_car.id}), 201

@cars_bp.route('/<int:id>', methods=['GET'])
def get_car(id):
    car = Car.query.get_or_404(id)
    return jsonify({
        "id": car.id,
        "make": car.make,
        "model": car.model,
        "price_per_day": car.price_per_day,
        "location": car.location,
        "image_url": car.image_url,
        "status": car.status,
        "year": car.year
    }), 200

@cars_bp.route('/<int:id>', methods=['PATCH'])
@jwt_required()
def update_car(id):
    claims = get_jwt()
    if not claims.get('is_admin'):
        return jsonify({"message": "Admin access required"}), 403
        
    car = Car.query.get_or_404(id)
    data = request.get_json()
    
    if 'price_per_day' in data:
        car.price_per_day = data['price_per_day']
    if 'status' in data:
        car.status = data['status']
    if 'image_url' in data:
        car.image_url = data['image_url']
    if 'location' in data:
        car.location = data['location']
    if 'make' in data:
        car.make = data['make']
    if 'model' in data:
        car.model = data['model']
    if 'year' in data:
        car.year = data['year']
        
    db.session.commit()
    return jsonify({"message": "Car updated successfully"}), 200

@cars_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_car(id):
    claims = get_jwt()
    if not claims.get('is_admin'):
        return jsonify({"message": "Admin access required"}), 403
        
    car = Car.query.get_or_404(id)
    db.session.delete(car)
    db.session.commit()
    return jsonify({"message": "Car deleted successfully"}), 200
