from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models import db, User, UserRole, Student, Faculty, Admin, DepartmentHead
from functools import wraps

users_bp = Blueprint('users', __name__)

# Role-based access control decorator
def role_required(roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            
            if not user:
                return jsonify({"success": False, "message": "User not found"}), 404
            
            if isinstance(roles, list) and user.role not in roles:
                return jsonify({
                    "success": False, 
                    "message": f"Access denied. Required roles: {[r.value for r in roles]}"
                }), 403
            elif not isinstance(roles, list) and user.role != roles:
                return jsonify({
                    "success": False, 
                    "message": f"Access denied. Required role: {roles.value}"
                }), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator

@users_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get the current user's profile"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    
    # Get role-specific profile
    profile = None
    if user.role == UserRole.STUDENT:
        profile = Student.query.filter_by(user_id=user.id).first()
    elif user.role == UserRole.FACULTY:
        profile = Faculty.query.filter_by(user_id=user.id).first()
    elif user.role == UserRole.ADMIN:
        profile = Admin.query.filter_by(user_id=user.id).first()
    elif user.role == UserRole.DEPARTMENT_HEAD:
        profile = DepartmentHead.query.filter_by(user_id=user.id).first()
    
    profile_data = profile.to_dict() if profile else None
    
    return jsonify({
        "success": True,
        "user": user.to_dict(),
        "profile": profile_data
    }), 200

@users_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_current_user():
    """Update the current user's profile"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    
    data = request.get_json()
    
    # Update basic user information
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    
    # Update role-specific profile
    if 'profile' in data:
        profile_data = data['profile']
        
        if user.role == UserRole.STUDENT:
            profile = Student.query.filter_by(user_id=user.id).first()
            if profile and 'program' in profile_data:
                profile.program = profile_data['program']
            if profile and 'year_level' in profile_data:
                profile.year_level = profile_data['year_level']
        
        elif user.role == UserRole.FACULTY:
            profile = Faculty.query.filter_by(user_id=user.id).first()
            if profile and 'department' in profile_data:
                profile.department = profile_data['department']
            if profile and 'position' in profile_data:
                profile.position = profile_data['position']
        
        elif user.role == UserRole.ADMIN:
            profile = Admin.query.filter_by(user_id=user.id).first()
            if profile and 'department' in profile_data:
                profile.department = profile_data['department']
        
        elif user.role == UserRole.DEPARTMENT_HEAD:
            profile = DepartmentHead.query.filter_by(user_id=user.id).first()
            if profile and 'department' in profile_data:
                profile.department = profile_data['department']
    
    try:
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Profile updated successfully",
            "user": user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Failed to update profile: {str(e)}"
        }), 500

@users_bp.route('/', methods=['GET'])
@jwt_required()
@role_required([UserRole.ADMIN, UserRole.DEPARTMENT_HEAD])
def get_all_users():
    """Get all users (admin only)"""
    users = User.query.all()
    
    return jsonify({
        "success": True,
        "users": [user.to_dict() for user in users]
    }), 200

@users_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
@role_required([UserRole.ADMIN, UserRole.DEPARTMENT_HEAD])
def get_user(user_id):
    """Get a specific user (admin only)"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    
    # Get role-specific profile
    profile = None
    if user.role == UserRole.STUDENT:
        profile = Student.query.filter_by(user_id=user.id).first()
    elif user.role == UserRole.FACULTY:
        profile = Faculty.query.filter_by(user_id=user.id).first()
    elif user.role == UserRole.ADMIN:
        profile = Admin.query.filter_by(user_id=user.id).first()
    elif user.role == UserRole.DEPARTMENT_HEAD:
        profile = DepartmentHead.query.filter_by(user_id=user.id).first()
    
    profile_data = profile.to_dict() if profile else None
    
    return jsonify({
        "success": True,
        "user": user.to_dict(),
        "profile": profile_data
    }), 200

@users_bp.route('/by-role/<role>', methods=['GET'])
@jwt_required()
@role_required([UserRole.ADMIN, UserRole.DEPARTMENT_HEAD])
def get_users_by_role(role):
    """Get users by role (admin only)"""
    try:
        role_enum = UserRole(role)
    except ValueError:
        valid_roles = [role.value for role in UserRole]
        return jsonify({
            "success": False, 
            "message": f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        }), 400
    
    users = User.query.filter_by(role=role_enum).all()
    
    return jsonify({
        "success": True,
        "users": [user.to_dict() for user in users]
    }), 200

@users_bp.route('/access-code/<code>', methods=['GET'])
@jwt_required()
@role_required([UserRole.ADMIN])
def get_user_by_access_code(code):
    """Get user by access code (admin only)"""
    user = User.query.filter_by(access_code=code).first()
    
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    
    return jsonify({
        "success": True,
        "user": user.to_dict()
    }), 200 