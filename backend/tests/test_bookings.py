import pytest
from models import db, Car, CarStatus, Booking

def test_create_booking(app, client, auth_header):
    with app.app_context():
        car = Car(
            make="Toyota", model="Camry", year=2022, 
            price_per_day=5000, location="Nairobi",
            status=CarStatus.AVAILABLE
        )
        db.session.add(car)
        db.session.commit()
        car_id = car.id

    response = client.post('/api/bookings/', json={
        'car_id': car_id,
        'start_date': '2026-06-01',
        'end_date': '2026-06-05',
        'mpesa_phone': '0712345678'
    }, headers=auth_header)

    assert response.status_code == 201
    assert 'mpesa_code' in response.get_json()

def test_double_booking_prevention(app, client, auth_header):
    with app.app_context():
        car = Car(
            make="Honda", model="Civic", year=2021, 
            price_per_day=4000, location="Mombasa",
            status=CarStatus.AVAILABLE
        )
        db.session.add(car)
        db.session.commit()
        car_id = car.id

    # First booking
    client.post('/api/bookings/', json={
        'car_id': car_id,
        'start_date': '2026-07-01',
        'end_date': '2026-07-10',
        'mpesa_phone': '0712345678'
    }, headers=auth_header)

    # Overlapping booking
    response = client.post('/api/bookings/', json={
        'car_id': car_id,
        'start_date': '2026-07-05',
        'end_date': '2026-07-15',
        'mpesa_phone': '0712345678'
    }, headers=auth_header)

    assert response.status_code == 409
    assert 'already booked' in response.get_json()['message']
