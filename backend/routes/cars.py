from flask import Blueprint, request, jsonify, current_app, url_for
from models import db, Car, CarImage, CarStatus
from flask_jwt_extended import jwt_required, get_jwt
import os
from werkzeug.utils import secure_filename
from datetime import datetime

cars_bp = Blueprint('cars', __name__)

def allowed_file(filename):
    return (
        '.' in filename
        and filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']
    )

def save_uploaded_images(files):
    image_urls = []
    for file in files:
        if file and file.filename:
            if not allowed_file(file.filename):
                continue
            filename = secure_filename(file.filename)
            unique_name = f"{int(datetime.now().timestamp())}_{filename}"
            file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_name)
            file.save(file_path)
            full_url = url_for('static', filename=f'uploads/{unique_name}', _external=True)
            image_urls.append(full_url)
    return image_urls

@cars_bp.route('/', methods=['GET'])
def get_cars():
    location = request.args.get('location')
    status = request.args.get('status')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)

    query = Car.query
    if location:
        query = query.filter(Car.location.ilike(f'%{location}%'))
    if status:
        query = query.filter(Car.status == status)
    if min_price is not None:
        query = query.filter(Car.price_per_day >= min_price)
    if max_price is not None:
        query = query.filter(Car.price_per_day <= max_price)

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        "cars": [car.to_dict() for car in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": pagination.page,
        "per_page": pagination.per_page
    }), 200

@cars_bp.route('/', methods=['POST'])
@jwt_required()
def add_car():
    claims = get_jwt()
    if not claims.get('is_admin'):
        return jsonify({"message": "Admin access required"}), 403

    data = request.form
    new_car = Car(
        make=data.get('make'),
        model=data.get('model'),
        year=int(data.get('year', 2024)),
        price_per_day=float(data.get('price_per_day', 0)),
        location=data.get('location'),
        status=data.get('status', CarStatus.AVAILABLE),
        seats=int(data.get('seats', 5)),
        transmission=data.get('transmission', 'automatic'),
        fuel_type=data.get('fuel_type', 'petrol'),
        description=data.get('description', '')
    )

    image_urls = []
    if 'images' in request.files:
        image_urls = save_uploaded_images(request.files.getlist('images'))

    if image_urls:
        new_car.image_url = image_urls[0]

    db.session.add(new_car)
    db.session.commit()

    for url in image_urls:
        db.session.add(CarImage(car_id=new_car.id, image_url=url))
    db.session.commit()

    return jsonify({"message": "Car added successfully", "id": new_car.id}), 201

@cars_bp.route('/<int:id>', methods=['GET'])
def get_car(id):
    car = Car.query.get_or_404(id)
    return jsonify(car.to_dict()), 200

@cars_bp.route('/<int:id>', methods=['PATCH'])
@jwt_required()
def update_car(id):
    claims = get_jwt()
    if not claims.get('is_admin'):
        return jsonify({"message": "Admin access required"}), 403

    car = Car.query.get_or_404(id)
    data = request.get_json() if request.is_json else request.form

    updatable = ['price_per_day', 'status', 'location', 'make', 'model', 'year', 'seats', 'transmission', 'fuel_type', 'description']
    for field in updatable:
        if field in data and data[field] != '':
            if field == 'price_per_day': setattr(car, field, float(data[field]))
            elif field in ('year', 'seats'): setattr(car, field, int(data[field]))
            else: setattr(car, field, data[field])

    if 'images' in request.files:
        new_urls = save_uploaded_images(request.files.getlist('images'))
        for url in new_urls:
            db.session.add(CarImage(car_id=car.id, image_url=url))
        if not car.image_url and new_urls:
            car.image_url = new_urls[0]

    db.session.commit()
    return jsonify({"message": "Car updated successfully", "car": car.to_dict()}), 200

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
