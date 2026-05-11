"""
seed.py — Populate the database with realistic Kenyan car rental data.
Usage:  python seed.py
"""

import sys
import os
import random
from datetime import datetime, timedelta

# Make sure we can import the app
sys.path.insert(0, os.path.dirname(__file__))

from faker import Faker
from app import create_app
from models import db, User, Car, CarImage, Booking

fake = Faker('en_GB')   # British English gives realistic phone/name formats
Faker.seed(42)
random.seed(42)

# ── Kenya-specific data ───────────────────────────────────────────────────────

LOCATIONS = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
    'Thika', 'Malindi', 'Naivasha', 'Nanyuki', 'Diani Beach',
]

# (make, model, category, seats, transmission, fuel_type, base_price)
CAR_CATALOGUE = [
    # Budget / Economy
    ('Toyota',    'Vitz',           'Economy',   5, 'automatic', 'petrol',  3500),
    ('Toyota',    'Axio',           'Economy',   5, 'automatic', 'petrol',  4000),
    ('Nissan',    'Note',           'Economy',   5, 'automatic', 'petrol',  3800),
    ('Suzuki',    'Swift',          'Economy',   5, 'manual',    'petrol',  3200),
    ('Honda',     'Fit',            'Economy',   5, 'automatic', 'petrol',  3600),
    # Mid-range / Saloon
    ('Toyota',    'Premio',         'Saloon',    5, 'automatic', 'petrol',  5500),
    ('Toyota',    'Allion',         'Saloon',    5, 'automatic', 'petrol',  5800),
    ('Mazda',     'Atenza',         'Saloon',    5, 'automatic', 'petrol',  6000),
    ('Subaru',    'Impreza',        'Saloon',    5, 'automatic', 'petrol',  6500),
    ('Honda',     'Accord',         'Saloon',    5, 'automatic', 'petrol',  7000),
    # SUV / 4x4
    ('Toyota',    'RAV4',           'SUV',       5, 'automatic', 'petrol',  8500),
    ('Toyota',    'Fortuner',       'SUV',       7, 'automatic', 'diesel',  12000),
    ('Toyota',    'Land Cruiser',   'SUV',       7, 'automatic', 'diesel',  18000),
    ('Mitsubishi','Pajero',         'SUV',       7, 'automatic', 'diesel',  14000),
    ('Nissan',    'X-Trail',        'SUV',       5, 'automatic', 'petrol',  9000),
    ('Subaru',    'Forester',       'SUV',       5, 'automatic', 'petrol',  9500),
    ('Land Rover','Defender',       'SUV',       5, 'automatic', 'diesel',  22000),
    # Premium
    ('Mercedes',  'C-Class',        'Premium',   5, 'automatic', 'petrol',  15000),
    ('BMW',       '3 Series',       'Premium',   5, 'automatic', 'petrol',  16000),
    ('Audi',      'A4',             'Premium',   5, 'automatic', 'petrol',  15500),
    # Vans / People Carriers
    ('Toyota',    'Hiace',          'Van',       14,'manual',    'diesel',  10000),
    ('Toyota',    'Noah',           'Van',       7, 'automatic', 'petrol',  7500),
    ('Nissan',    'Serena',         'Van',       8, 'automatic', 'petrol',  7000),
    # Electric / Hybrid
    ('Toyota',    'Prius',          'Hybrid',    5, 'automatic', 'hybrid',  6000),
    ('Nissan',    'Leaf',           'Electric',  5, 'automatic', 'electric',7000),
]

DESCRIPTIONS = {
    'Economy':  [
        "Perfect city runabout — fuel-efficient and easy to park anywhere in Nairobi.",
        "Ideal for short trips and errands around town. Great fuel economy.",
        "Compact and nimble. A solid choice for solo or couple travel on a budget.",
    ],
    'Saloon': [
        "Smooth, comfortable saloon — ideal for business travel and airport transfers.",
        "Spacious interior with a refined drive. Great for long highway journeys.",
        "A well-maintained sedan offering comfort and reliability on any road.",
    ],
    'SUV': [
        "Capable 4x4 ready for Kenyan roads — tarmac, murram, and everything in between.",
        "High ground clearance and powerful engine make this perfect for safari adventures.",
        "Commanding presence with a roomy cabin. Handles rough terrain with ease.",
        "The go-to choice for upcountry travel, game drives, and family road trips.",
    ],
    'Premium': [
        "Arrive in style. This luxury vehicle offers a first-class driving experience.",
        "Premium leather interior, advanced tech, and silky-smooth performance.",
        "Turn heads wherever you go. The ultimate in comfort and prestige.",
    ],
    'Van': [
        "Spacious people carrier — perfect for group transfers and corporate events.",
        "Ideal for family holidays or moving a team. Comfortable for long journeys.",
    ],
    'Hybrid': [
        "Eco-friendly hybrid — enjoy excellent fuel economy without compromising comfort.",
        "The smart choice for environmentally-conscious travellers.",
    ],
    'Electric': [
        "Zero emissions, zero noise. Experience the future of motoring in Nairobi.",
        "Fully electric — charge up overnight and drive all day for next to nothing.",
    ],
}

# Realistic Unsplash car image URLs (stable, no API key needed)
IMAGE_URLS = {
    'Toyota':     'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80',
    'Nissan':     'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80',
    'Honda':      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
    'Suzuki':     'https://images.unsplash.com/photo-1609752940005-4d0f8c42c8a6?w=800&q=80',
    'Mazda':      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    'Subaru':     'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
    'Mitsubishi': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80',
    'Land Rover': 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
    'Mercedes':   'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
    'BMW':        'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
    'Audi':       'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
    'Nissan':     'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80',
}

FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80'


def phone_ke():
    """Generate a realistic Kenyan phone number."""
    prefixes = ['0701', '0702', '0710', '0711', '0712', '0720', '0721',
                '0722', '0723', '0724', '0725', '0740', '0741', '0745']
    return random.choice(prefixes) + str(random.randint(100000, 999999))


def seed():
    app = create_app()
    with app.app_context():
        print("🌱  Seeding database…\n")

        # ── Wipe existing data ────────────────────────────────────────────────
        db.drop_all()
        db.create_all()

        # ── Admin user ────────────────────────────────────────────────────────
        admin = User(
            username='admin',
            email='admin@kpremiumrides.co.ke',
            phone_number='0700000000',
            is_admin=True,
        )
        admin.set_password('Admin@1234')
        db.session.add(admin)
        print("  ✓  Admin user created  (email: admin@kpremiumrides.co.ke  pw: Admin@1234)")

        # ── Sample customers ──────────────────────────────────────────────────
        customers = []
        for i in range(8):
            first = fake.first_name()
            last  = fake.last_name()
            u = User(
                username=f"{first.lower()}{last.lower()}{random.randint(1,99)}",
                email=fake.unique.email(),
                phone_number=phone_ke(),
                national_id=str(random.randint(10000000, 39999999)),
            )
            u.set_password('Customer@1234')
            db.session.add(u)
            customers.append(u)
        db.session.flush()   # get IDs before commit
        print(f"  ✓  {len(customers)} customer accounts created")

        # ── Cars ──────────────────────────────────────────────────────────────
        cars = []
        years = [2018, 2019, 2020, 2021, 2022, 2023, 2024]

        for make, model, category, seats, transmission, fuel_type, base_price in CAR_CATALOGUE:
            year = random.choice(years)
            # Slight price variation ±10%
            price = round(base_price * random.uniform(0.92, 1.10), -2)
            location = random.choice(LOCATIONS)
            status = random.choices(
                ['available', 'available', 'available', 'rented', 'maintenance'],
                weights=[60, 60, 60, 15, 5], k=1
            )[0]

            image_url = IMAGE_URLS.get(make, FALLBACK_IMAGE)
            desc = random.choice(DESCRIPTIONS.get(category, DESCRIPTIONS['Economy']))

            car = Car(
                make=make,
                model=model,
                year=year,
                price_per_day=price,
                location=location,
                status=status,
                seats=seats,
                transmission=transmission,
                fuel_type=fuel_type,
                description=desc,
                image_url=image_url,
            )
            db.session.add(car)
            cars.append(car)

        db.session.flush()
        print(f"  ✓  {len(cars)} cars added")

        # ── Bookings ──────────────────────────────────────────────────────────
        booking_statuses = ['pending', 'confirmed', 'completed', 'cancelled']
        booking_weights  = [20, 40, 30, 10]
        bookings_created = 0

        for _ in range(20):
            customer = random.choice(customers)
            car      = random.choice(cars)

            start = datetime.utcnow() - timedelta(days=random.randint(0, 60))
            duration = random.randint(1, 7)
            end = start + timedelta(days=duration)
            total = duration * car.price_per_day
            status = random.choices(booking_statuses, weights=booking_weights, k=1)[0]
            mpesa_code = f"MPS{random.randint(1000000000, 9999999999)}"

            b = Booking(
                user_id=customer.id,
                car_id=car.id,
                start_date=start,
                end_date=end,
                total_price=total,
                status=status,
                mpesa_code=mpesa_code,
                created_at=start - timedelta(hours=random.randint(1, 48)),
            )
            db.session.add(b)
            bookings_created += 1

        db.session.commit()
        print(f"  ✓  {bookings_created} sample bookings created\n")
        print("✅  Seeding complete!")
        print(f"\n   Frontend → http://localhost:5174/")
        print(f"   Admin login key: MY_SECRET_ADMIN_KEY")
        print(f"   Customer login  → email: any seeded user  pw: Customer@1234\n")


if __name__ == '__main__':
    seed()
