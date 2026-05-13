import pytest
from app import create_app
from models import db, User, Car, CarStatus

@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "JWT_SECRET_KEY": "test-secret"
    })

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_header(app, client):
    with app.app_context():
        user = User(username="testuser", email="test@example.com", phone_number="0712345678")
        user.set_password("password")
        db.session.add(user)
        db.session.commit()
        
        response = client.post('/api/auth/customer/login', json={
            'email': 'test@example.com',
            'password': 'password'
        })
        token = response.get_json()['access_token']
        return {'Authorization': f'Bearer {token}'}
