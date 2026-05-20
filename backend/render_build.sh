#!/usr/bin/env bash
# exit on error
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt

echo "Initializing database tables..."
python -c "from app import create_app, db; app=create_app(); app.app_context().push(); db.create_all()"

echo "Updating image URLs for featured cars in production..."
python -c "
from app import create_app
from models import db, Car

app = create_app()
with app.app_context():
    Car.query.filter_by(model='Pajero').update({'image_url': '/static/uploads/car_pajero_new.png'})
    Car.query.filter_by(model='Defender').update({'image_url': '/static/uploads/car_defender_new.png'})
    Car.query.filter_by(model='3 Series').update({'image_url': '/static/uploads/car_bmw_3series_new.png'})
    db.session.commit()
    print('Updated images successfully!')
"
