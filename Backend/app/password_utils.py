import hashlib
import secrets
import string

def hash_password(password: str) -> str:
    """Hash a password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_access_code(email: str, user_count: int) -> str:
    """Generate a unique access code for a user"""
    # Create a random string of 8 characters
    alphabet = string.ascii_letters + string.digits
    random_part = ''.join(secrets.choice(alphabet) for _ in range(8))
    
    # Combine with user count to ensure uniqueness
    return f"{random_part}{user_count:04d}" 