from flask import Blueprint, request, jsonify
from models import db, Car
from flask_jwt_extended import jwt_required

cars_bp = Blueprint('cars', __name__)

@cars_bp.route('/', methods=['GET'])
def get_cars():
    location = request.args.get('location')
    
    query = Car.query
    if location:
        query = query.filter(Car.location.ilike(f'%{location}%'))
    
    # Filter by status available?
    # query = query.filter_by(status='available')
        
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
    # In real app, check if user is admin
    data = request.get_json()
    new_car = Car(
        make=data['make'],
        model=data['model'],
        year=data.get('year'),
        price_per_day=data['price_per_day'],
        image_url=data.get('image_url'),
        location=data['location']
    )
    db.session.add(new_car)
    db.session.commit()
    return jsonify({"message": "Car added successfully"}), 201

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
