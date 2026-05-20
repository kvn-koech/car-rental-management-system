#!/usr/bin/env bash
# exit on error
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt

echo "Initializing database tables..."
python -c "from app import create_app, db; app=create_app(); app.app_context().push(); db.create_all()"

echo "Fixing image URLs to absolute URLs in production..."
python -c "
import os
from app import create_app
from models import db, Car

app = create_app()
with app.app_context():
    base = os.environ.get('BACKEND_URL', 'https://car-rental-backend-ibnc.onrender.com').rstrip('/')
    Car.query.filter_by(model='Noah').update({'image_url': f'{base}/static/uploads/car_noah.png'})
    Car.query.filter_by(model='Prius').update({'image_url': f'{base}/static/uploads/car_prius.png'})
    Car.query.filter_by(model='Leaf').update({'image_url': f'{base}/static/uploads/car_leaf.png'})
    db.session.commit()
    print('Fixed image URLs successfully!')
"
