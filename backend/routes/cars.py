from flask import Blueprint, request, jsonify, current_app, url_for
from models import db, Car, CarImage
from flask_jwt_extended import jwt_required, get_jwt
import os
from werkzeug.utils import secure_filename
from datetime import datetime

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
            "image_url": car.image_url, # Main image (thumbnail)
            "status": car.status,
            "location": car.location,
            "images": [img.image_url for img in car.images]
        })
        
    return jsonify(result), 200

@cars_bp.route('/', methods=['POST'])
@jwt_required()
def add_car():
    claims = get_jwt()
    if not claims.get('is_admin'):
        return jsonify({"message": "Admin access required"}), 403

    # Handle non-file data which comes as form data now
    # If content-type is multipart/form-data, request.get_json() might return None or differ.
    # We use request.form for text fields
    
    make = request.form.get('make')
    model = request.form.get('model')
    year = request.form.get('year')
    price_per_day = request.form.get('price_per_day')
    location = request.form.get('location')
    status = request.form.get('status', 'available')
    
    new_car = Car(
        make=make,
        model=model,
        year=year,
        price_per_day=price_per_day,
        location=location,
        status=status
    )
    
    # Handle File Uploads
    if 'images' in request.files:
        files = request.files.getlist('images')
        for i, file in enumerate(files):
            if file and file.filename:
                filename = secure_filename(file.filename)
                # Ensure unique filename
                filename = f"{datetime.now().timestamp()}_{filename}"
                file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
                
                # Construct URL
                # Assuming app serves static files from /static/uploads
                image_path = url_for('static', filename=f'uploads/{filename}', _external=True)
                
                # Set first image as main thumbnail
                if i == 0:
                    new_car.image_url = image_path
                
                # Create CarImage record (after commit of car? No, need car id. So add car first)
                
    db.session.add(new_car)
    db.session.commit()
    
    # Now add images
    if 'images' in request.files:
        files = request.files.getlist('images')
        for i, file in enumerate(files):
            if file and file.filename:
                # We essentially re-save or just re-loop? 
                # Better to save filenames in list above and loop here.
                # Simplification: Just re-do the logic or optimize.
                # Optimization:
                pass 

    # Correct Logic:
    # 1. Save files, collect URLs.
    # 2. Add Car.
    # 3. Add CarImages.
    
    image_urls = []
    if 'images' in request.files:
        files = request.files.getlist('images')
        for file in files:
            if file and file.filename:
                filename = secure_filename(file.filename)
                unique_name = f"{int(datetime.now().timestamp())}_{filename}"
                file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_name)
                file.save(file_path)
                
                full_url = url_for('static', filename=f'uploads/{unique_name}', _external=True)
                image_urls.append(full_url)
    
    if image_urls:
        new_car.image_url = image_urls[0] # First one as main
        
    db.session.add(new_car)
    db.session.commit() # Get ID
    
    for url in image_urls:
        img = CarImage(car_id=new_car.id, image_url=url)
        db.session.add(img)
    
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
        "year": car.year,
        "images": [img.image_url for img in car.images]
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
