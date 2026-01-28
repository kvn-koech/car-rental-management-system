from flask import Blueprint, request, jsonify
from models import db, User
from flask_jwt_extended import create_access_token

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Basic validation
    required_fields = ['username', 'email', 'password', 'phone_number']
    if not all(k in data for k in required_fields):
        return jsonify({"message": "Missing required fields"}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "Email already exists"}), 400
        
    user = User(
        username=data['username'],
        email=data['email'],
        phone_number=data['phone_number'],
        national_id=data.get('national_id')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({"message": "User registered successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    
    if user and user.check_password(data.get('password')):
        access_token = create_access_token(identity=user.id)
        return jsonify({
            "access_token": access_token, 
            "user": {
                "id": user.id, 
                "username": user.username,
                "is_admin": user.is_admin
            }
        }), 200
        
    return jsonify({"message": "Invalid email or password"}), 401

@auth_bp.route('/admin-login', methods=['POST'])
def admin_login():
    data = request.get_json()
    secret_key = data.get('secret_key')
    
    # In a real production app, this key should be in environment variables
    ADMIN_SECRET_KEY = "MY_SECRET_ADMIN_KEY" 
    
    if secret_key == ADMIN_SECRET_KEY:
        # Create a token with admin claims
        access_token = create_access_token(identity="admin", additional_claims={"is_admin": True})
        return jsonify({
            "access_token": access_token,
            "user": {
                "username": "Admin",
                "is_admin": True,
                "role": "admin"
            }
        }), 200
        
    return jsonify({"message": "Invalid Admin Key"}), 401
