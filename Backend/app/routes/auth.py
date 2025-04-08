from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from app.models import User, UserRole
from app.auth import register_user, login_user, check_user_exists, setup_user_password

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/check-user', methods=['POST', 'OPTIONS'])
def check_user():
    """Check if a user exists and needs setup"""
    # Handle OPTIONS request (for CORS preflight)
    if request.method == 'OPTIONS':
        return '', 200
        
    data = request.get_json()
    
    if 'email' not in data:
        return jsonify({
            "success": False,
            "message": "Email is required"
        }), 400
    
    result = check_user_exists(data['email'])
    
    if result["success"]:
        # Return the appropriate response based on existence
        if result.get("exists", False):
            return jsonify(result), 200
        else:
            # User does not exist
            return jsonify(result), 404
    else:
        return jsonify(result), 400

@auth_bp.route('/setup-password', methods=['POST'])
def setup_password():
    """Setup password for first-time registration"""
    data = request.get_json()
    
    # Validate input data
    if 'email' not in data or 'password' not in data:
        return jsonify({
            "success": False,
            "message": "Email and password are required"
        }), 400
    
    # Setup the password
    result = setup_user_password(
        email=data['email'],
        password=data['password']
    )
    
    if result["success"]:
        # Generate access token
        access_token = create_access_token(identity=result["user"]["id"])
        return jsonify({
            "success": True,
            "message": "Password set successfully",
            "user": result["user"],
            "access_token": access_token
        }), 200
    else:
        return jsonify(result), 400

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    # Validate input data
    required_fields = ['email', 'password', 'first_name', 'last_name', 'role']
    for field in required_fields:
        if field not in data:
            return jsonify({"success": False, "message": f"Missing required field: {field}"}), 400
    
    # Validate role
    try:
        role = UserRole(data['role'])
    except ValueError:
        valid_roles = [role.value for role in UserRole]
        return jsonify({
            "success": False, 
            "message": f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        }), 400
    
    # Register the user
    result = register_user(
        email=data['email'],
        password=data['password'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        role=role
    )
    
    if result["success"]:
        # Generate access token
        access_token = create_access_token(identity=result["user"]["id"])
        return jsonify({
            "success": True,
            "message": "User registered successfully",
            "user": result["user"],
            "access_token": access_token
        }), 201
    else:
        return jsonify(result), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login a user"""
    data = request.get_json()
    
    # Validate input data
    if 'email' not in data or 'password' not in data:
        return jsonify({
            "success": False,
            "message": "Email and password are required"
        }), 400
    
    # Login the user
    result = login_user(
        email=data['email'],
        password=data['password']
    )
    
    if result["success"]:
        # Generate access token
        access_token = create_access_token(identity=result["user"]["id"])
        return jsonify({
            "success": True,
            "message": "Login successful",
            "user": result["user"],
            "access_token": access_token
        }), 200
    else:
        return jsonify(result), 401

@auth_bp.route('/verify-token', methods=['GET'])
@jwt_required()
def verify_token():
    """Verify a JWT token and return the user"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({
            "success": False,
            "message": "Invalid token"
        }), 401
    
    return jsonify({
        "success": True,
        "user": user.to_dict()
    }), 200 