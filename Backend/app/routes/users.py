from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models import db, User, UserRole, Student, Faculty, Admin, DepartmentHead
from functools import wraps
import secrets
from app.auth import hash_password, generate_access_code

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

@users_bp.route('/', methods=['POST'])
@jwt_required()
@role_required([UserRole.ADMIN])
def create_user():
    """Create a new user (admin only)"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['first_name', 'last_name', 'email', 'role']
    for field in required_fields:
        if field not in data:
            return jsonify({
                "success": False, 
                "message": f"Missing required field: {field}"
            }), 400
    
    # Check if email already exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({
            "success": False,
            "message": "Email already in use"
        }), 400
    
    try:
        # Validate role
        try:
            role = UserRole(data['role'])
        except ValueError:
            valid_roles = [r.value for r in UserRole]
            return jsonify({
                "success": False,
                "message": f"Invalid role. Must be one of: {', '.join(valid_roles)}"
            }), 400
        
        # Create the new user
        new_user = User(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            role=role
        )
        
        # Generate temporary password
        temp_password = secrets.token_hex(4)  # 8 character hex string
        
        # Hash the password
        new_user.password_hash = hash_password(temp_password)
        
        # Generate access code
        count = User.query.count() + 1
        new_user.access_code = generate_access_code(data['email'], count)
        
        db.session.add(new_user)
        db.session.commit()
        
        # Create role-specific profile
        profile = None
        if role == UserRole.STUDENT:
            # Generate a student ID (e.g., S followed by user ID and random digits)
            student_id = f"S{new_user.id}{secrets.randbelow(10000):04d}"
            profile = Student(user_id=new_user.id, student_id=student_id)
            db.session.add(profile)
        elif role == UserRole.FACULTY:
            # Generate a faculty ID (e.g., F followed by user ID and random digits)
            faculty_id = f"F{new_user.id}{secrets.randbelow(10000):04d}"
            profile = Faculty(user_id=new_user.id, faculty_id=faculty_id)
            db.session.add(profile)
        elif role == UserRole.ADMIN:
            # Generate an admin ID (e.g., A followed by user ID and random digits)
            admin_id = f"A{new_user.id}{secrets.randbelow(10000):04d}"
            profile = Admin(user_id=new_user.id, admin_id=admin_id)
            db.session.add(profile)
        elif role == UserRole.DEPARTMENT_HEAD:
            # Department head profiles may need a department
            profile = DepartmentHead(
                user_id=new_user.id, 
                department=data.get('department', 'General')
            )
            db.session.add(profile)
        
        if profile:
            db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "User created successfully",
            "user": new_user.to_dict(),
            "temporary_password": temp_password,
            "access_code": new_user.access_code
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Failed to create user: {str(e)}"
        }), 500

@users_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
@role_required([UserRole.ADMIN])
def update_user(user_id):
    """Update a specific user (admin only)"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    
    data = request.get_json()
    
    # Update user fields
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'email' in data and data['email'] != user.email:
        # Check if email is unique
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user and existing_user.id != user.id:
            return jsonify({
                "success": False,
                "message": "Email already in use by another user"
            }), 400
        user.email = data['email']
    if 'role' in data:
        try:
            role = UserRole(data['role'])
            # Only update if role has changed
            if role != user.role:
                user.role = role
                # Handle role-specific profile updates
                # This is a simplified implementation - you may need to create/update profiles
        except ValueError:
            valid_roles = [r.value for r in UserRole]
            return jsonify({
                "success": False,
                "message": f"Invalid role. Must be one of: {', '.join(valid_roles)}"
            }), 400
    
    try:
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "User updated successfully",
            "user": user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Failed to update user: {str(e)}"
        }), 500

@users_bp.route('/<int:user_id>/status', methods=['PATCH'])
@jwt_required()
@role_required([UserRole.ADMIN])
def update_user_status(user_id):
    """This endpoint is deprecated - status is now handled client-side only"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    
    # Just return success without making changes
    return jsonify({
        "success": True,
        "message": "User status updated (note: status field is not stored in the database)",
        "user": user.to_dict()
    }), 200

@users_bp.route('/<int:user_id>/reset-password', methods=['POST'])
@jwt_required()
@role_required([UserRole.ADMIN])
def reset_user_password(user_id):
    """Reset a user's password (admin only)"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    
    try:
        # Generate new password
        temp_password = secrets.token_hex(4)  # 8 character hex string
        
        # Hash the password
        user.password_hash = hash_password(temp_password)
        
        # Update access code
        count = User.query.count()
        user.access_code = generate_access_code(user.email, count)
        
        db.session.commit()
        
        # In a real app, you would send an email with the temporary password
        # For now, we'll just return it in the response
        return jsonify({
            "success": True,
            "message": "Password reset successfully",
            "temporary_password": temp_password,
            "access_code": user.access_code
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Failed to reset password: {str(e)}"
        }), 500

@users_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
@role_required([UserRole.ADMIN])
def delete_user(user_id):
    """Delete a specific user (admin only)"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    
    # Check if user is the current admin (prevent self-deletion)
    current_user_id = get_jwt_identity()
    if user_id == current_user_id:
        return jsonify({
            "success": False,
            "message": "Cannot delete your own account"
        }), 400
    
    try:
        # Delete role-specific profile first (to maintain referential integrity)
        if user.role == UserRole.STUDENT:
            profile = Student.query.filter_by(user_id=user.id).first()
            if profile:
                db.session.delete(profile)
        elif user.role == UserRole.FACULTY:
            profile = Faculty.query.filter_by(user_id=user.id).first()
            if profile:
                db.session.delete(profile)
        elif user.role == UserRole.ADMIN:
            profile = Admin.query.filter_by(user_id=user.id).first()
            if profile:
                db.session.delete(profile)
        elif user.role == UserRole.DEPARTMENT_HEAD:
            profile = DepartmentHead.query.filter_by(user_id=user.id).first()
            if profile:
                db.session.delete(profile)
        
        # Delete the user
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "User deleted successfully"
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Failed to delete user: {str(e)}"
        }), 500 