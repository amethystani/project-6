import bcrypt
from datetime import datetime
import re
from app.models import db, User, UserRole
from email_validator import validate_email, EmailNotValidError
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token

def hash_password(password):
    """Hash a password for storing."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(stored_password, provided_password):
    """Verify a stored password against one provided by user"""
    return bcrypt.checkpw(provided_password.encode('utf-8'), stored_password.encode('utf-8'))

def generate_access_code(email, count):
    """Generate an access code based on email and registration count"""
    # Clean email to make it usable as part of an access code
    clean_email = re.sub(r'[^a-zA-Z0-9]', '', email.split('@')[0])
    # Limit to 10 characters and add the count
    clean_email = clean_email[:10]
    return f"{clean_email}{count}"

def check_user_exists(email):
    """Check if a user with the given email exists in the database"""
    try:
        # Validate email
        valid_email = validate_email(email)
        email = valid_email.normalized
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        
        if existing_user:
            # Check if the user has a password set
            has_password = existing_user.password_hash and existing_user.password_hash != "NEEDS_SETUP"
            return {
                "success": True, 
                "exists": True, 
                "needs_setup": not has_password,
                "user_details": {
                    "email": existing_user.email,
                    "first_name": existing_user.first_name,
                    "last_name": existing_user.last_name,
                    "role": existing_user.role.value
                }
            }
        else:
            # Return user not found instead of pretending user exists with admin role
            return {
                "success": True, 
                "exists": False, 
                "message": "User not found"
            }
        
    except EmailNotValidError as e:
        return {"success": False, "message": str(e)}
    except Exception as e:
        return {"success": False, "message": f"Error checking user: {str(e)}"}

def setup_user_password(email, password):
    """Set up password for a user during first-time registration"""
    try:
        # Validate email
        valid_email = validate_email(email)
        email = valid_email.normalized
        
        # Find the user
        user = User.query.filter_by(email=email).first()
        
        if not user:
            # Create a new user instead of returning an error
            count = User.query.count() + 1
            access_code = generate_access_code(email, count)
            
            # Create new user with default values
            user = User(
                email=email,
                password_hash="NEEDS_SETUP",  # Will be updated below
                first_name="User",
                last_name=str(count),
                role=UserRole.ADMIN,  # Default role
                access_code=access_code
            )
            
            db.session.add(user)
        
        # Update the password
        user.password_hash = hash_password(password)
        db.session.commit()
        
        return {"success": True, "user": user.to_dict()}
        
    except EmailNotValidError as e:
        return {"success": False, "message": str(e)}
    except Exception as e:
        db.session.rollback()
        return {"success": False, "message": f"Password setup failed: {str(e)}"}

def register_user(email, password, first_name, last_name, role):
    """Register a new user"""
    try:
        # Validate email
        valid_email = validate_email(email)
        email = valid_email.normalized
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return {"success": False, "message": "Email already registered"}
        
        # Generate access code
        # Count existing users to determine number suffix
        count = User.query.count() + 1
        access_code = generate_access_code(email, count)
        
        # Create new user
        new_user = User(
            email=email,
            password_hash=hash_password(password),
            first_name=first_name,
            last_name=last_name,
            role=role,
            access_code=access_code
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return {"success": True, "user": new_user.to_dict()}
        
    except EmailNotValidError as e:
        return {"success": False, "message": str(e)}
    except Exception as e:
        db.session.rollback()
        return {"success": False, "message": f"Registration failed: {str(e)}"}

def login_user(email, password):
    """Login a user"""
    try:
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return {"success": False, "message": "Invalid email or password"}
        
        # Uncomment password verification
        if not verify_password(user.password_hash, password):
            return {"success": False, "message": "Invalid email or password"}
            
        # Update last login time
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Create access token with the user's ID as the identity
        access_token = create_access_token(identity=user.id)
        
        return {
            "success": True, 
            "user": user.to_dict(),
            "access_token": access_token
        }
        
    except Exception as e:
        db.session.rollback()
        return {"success": False, "message": f"Login failed: {str(e)}"} 