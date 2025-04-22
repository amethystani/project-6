import requests
import jwt
import datetime
import time
import json

# Configuration
API_BASE_URL = "http://127.0.0.1:5001/api"  # Update with your actual backend URL
ADMIN_EMAIL = "admin@snu.edu.in"
ADMIN_PASSWORD = "admin123"
JWT_SECRET = "your-super-secret-key-please-change-in-production"

def random_string(length=8):
    """Generate a random string of specified length"""
    import random
    import string
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def generate_jwt_token(user):
    """Generate a JWT token with the correct secret key"""
    # JWT payload
    now = datetime.datetime.now(datetime.UTC)
    payload = {
        "sub": str(user["id"]),
        "iat": now,
        "exp": now + datetime.timedelta(hours=1),
        "fresh": True,
        "type": "access",
        "email": user["email"],
        "role": user.get("role", "admin"),
        "jti": random_string(16)
    }
    
    print("Creating JWT token with payload:", payload)
    
    # Create token with the correct secret
    try:
        token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
        return token
    except Exception as e:
        print(f"Error encoding JWT: {e}")
        return None

def login():
    """Login and get authentication token"""
    login_url = f"{API_BASE_URL}/auth/login"
    login_data = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    
    try:
        response = requests.post(login_url, json=login_data)
        print(f"Login response status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Login failed with status code: {response.status_code}")
            return None
        
        data = response.json()
        if data.get("success") and data.get("user"):
            user = data["user"]
            print(f"Login successful for user: {user['email']} (ID: {user['id']})")
            
            # Try to get token from the response
            if data.get("access_token"):
                print("Using access_token from response")
                return data["access_token"]
                
            if data.get("token"):
                print("Using token from response")
                return data["token"]
            
            # Generate a proper JWT token
            return generate_jwt_token(user)
        else:
            print(f"Login failed: {data.get('message', 'Unknown error')}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Login request failed: {str(e)}")
        return None

def test_courses_endpoint(token):
    """Test the courses endpoint with different is_active parameter values"""
    base_url = f"{API_BASE_URL}/courses/"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    test_cases = [
        "",  # No parameter
        "?is_active=1",
        "?is_active=0", 
        "?is_active=true",
        "?is_active=True",
        "?is_active=TRUE",
        "?is_active=false",
        "?is_active=False",
    ]
    
    print("\n=== TESTING COURSES ENDPOINT ===")
    for param in test_cases:
        url = f"{base_url}{param}"
        try:
            print(f"\nTesting: {url}")
            response = requests.get(url, headers=headers)
            print(f"Status code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Success! Found {len(data.get('data', []))} courses")
                print(f"First few courses: {json.dumps([c.get('course_code') for c in data.get('data', [])[:5]])}")
            else:
                print(f"Failed: {response.text[:200]}")
        except Exception as e:
            print(f"Error: {str(e)}")

def main():
    # Login to get token
    token = login()
    if not token:
        print("Failed to login. Exiting.")
        return
    
    # Test the courses endpoint
    test_courses_endpoint(token)
    
if __name__ == "__main__":
    main() 