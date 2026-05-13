from flask import Blueprint, request, jsonify, current_app, url_for
from models import db, Car, CarImage
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
    """Save a list of FileStorage objects; return list of public URL strings."""
    image_urls = []
    for file in files:
        if file and file.filename:
            if not allowed_file(file.filename):
                continue  # skip disallowed file types
            filename = secure_filename(file.filename)
            unique_name = f"{int(datetime.now().timestamp())}_{filename}"
            file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_name)
            file.save(file_path)
            full_url = url_for('static', filename=f'uploads/{unique_name}', _external=True)
            image_urls.append(full_url)
    return image_urls




@cars_bp.route('/', methods=['POST'])
@jwt_required()
def add_car():
    claims = get_jwt()
    if not claims.get('is_admin'):
        return jsonify({"message": "Admin access required"}), 403

    make = request.form.get('make')
    model = request.form.get('model')
    year = request.form.get('year')
    price_per_day = request.form.get('price_per_day')
    location = request.form.get('location')
    status = request.form.get('status', 'available')
    seats = request.form.get('seats', 5)
    transmission = request.form.get('transmission', 'automatic')
    fuel_type = request.form.get('fuel_type', 'petrol')
    description = request.form.get('description', '')

    if not all([make, model, year, price_per_day, location]):
        return jsonify({"message": "Missing required fields"}), 400

    new_car = Car(
        make=make,
        model=model,
        year=int(year),
        price_per_day=float(price_per_day),
        location=location,
        status=status,
        seats=int(seats),
        transmission=transmission,
        fuel_type=fuel_type,
        description=description,
    )

    # Save uploaded images (single pass, no duplication)
    image_urls = []
    if 'images' in request.files:
        image_urls = save_uploaded_images(request.files.getlist('images'))

    if image_urls:
        new_car.image_url = image_urls[0]

    db.session.add(new_car)
    db.session.commit()  # commit to get new_car.id

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

    updatable = ['price_per_day', 'status', 'location', 'make', 'model',
                 'year', 'seats', 'transmission', 'fuel_type', 'description']
    for field in updatable:
        if field in data and data[field] != '':
            # Cast numeric fields
            if field in ('price_per_day',):
                setattr(car, field, float(data[field]))
            elif field in ('year', 'seats'):
                setattr(car, field, int(data[field]))
            else:
                setattr(car, field, data[field])

    # Handle image_url text update (optional)
    if 'image_url' in data and data['image_url']:
        car.image_url = data['image_url']

    # Handle new file uploads (appended, not replaced)
    if 'images' in request.files:
        new_urls = save_uploaded_images(request.files.getlist('images'))
        for url in new_urls:
            db.session.add(CarImage(car_id=car.id, image_url=url))
        # If no main image yet, set the first new one
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
