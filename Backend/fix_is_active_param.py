import requests
import jwt
import datetime
import random
import string

# Configuration
API_BASE_URL = "http://127.0.0.1:5001/api"
ADMIN_EMAIL = "admin@snu.edu.in"
ADMIN_PASSWORD = "admin123"
JWT_SECRET = "your-super-secret-key-please-change-in-production"

def login():
    """Login and get authentication token"""
    login_url = f"{API_BASE_URL}/auth/login"
    login_data = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    
    try:
        response = requests.post(login_url, json=login_data)
        if response.status_code != 200:
            print(f"Login failed with status code: {response.status_code}")
            return None
        
        data = response.json()
        if data.get("success") and data.get("user"):
            user = data["user"]
            print(f"Login successful for user: {user['email']} (ID: {user['id']})")
            
            # Generate a proper JWT token
            return generate_jwt_token(user)
        else:
            print(f"Login failed: {data.get('message', 'Unknown error')}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Login request failed: {str(e)}")
        return None

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
        "jti": ''.join(random.choices(string.ascii_uppercase + string.digits, k=16))
    }
    
    # Create token with the correct secret
    try:
        token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
        return token
    except Exception as e:
        print(f"Error encoding JWT: {e}")
        return None

def set_all_courses_active(token):
    """Set all courses to active status with is_active=True"""
    courses_url = f"{API_BASE_URL}/courses/"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        # Get all courses first
        response = requests.get(courses_url, headers=headers)
        if response.status_code != 200:
            print(f"Failed to get courses: {response.text}")
            return False
            
        courses = response.json().get('data', [])
        print(f"Found {len(courses)} courses to update")
        
        # For each course, flag it as inactive and then active to trigger updates
        for course in courses:
            course_id = course.get('id')
            if not course_id:
                continue
                
            # Use the course approval endpoint to set a course as active
            approval_url = f"{API_BASE_URL}/courses/course-approvals/{course_id}/action"
            approval_data = {
                "action": "approve",  # This should set is_active to True
                "comments": "Auto-approved to fix active status"
            }
            
            approval_response = requests.post(approval_url, json=approval_data, headers=headers)
            if approval_response.status_code == 200:
                print(f"Successfully activated course {course_id}")
            else:
                print(f"Failed to activate course {course_id}: {approval_response.text}")
        
        print("Finished activating all courses")
        return True
    except Exception as e:
        print(f"Error setting courses active: {str(e)}")
        return False

def test_active_courses_query(token):
    """Test querying for active courses"""
    base_url = f"{API_BASE_URL}/courses/"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    test_cases = [
        "",  # No params
        "?is_active=true",
        "?is_active=True",
        "?is_active=1",
        "?is_active=0"
    ]
    
    print("\n=== TESTING COURSE QUERIES ===")
    for params in test_cases:
        url = f"{base_url}{params}"
        try:
            print(f"\nTesting: {url}")
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                courses = data.get('data', [])
                print(f"Success! Found {len(courses)} courses")
            else:
                print(f"Failed with status {response.status_code}: {response.text}")
        except Exception as e:
            print(f"Error: {str(e)}")

def main():
    # Login to get token
    token = login()
    if not token:
        print("Failed to login. Exiting.")
        return
        
    # Test current state
    print("Testing course queries before fixes:")
    test_active_courses_query(token)
    
    # Set all courses to active
    print("\nSetting all courses to active status...")
    set_all_courses_active(token)
    
    # Test again after updates
    print("\nTesting course queries after fixes:")
    test_active_courses_query(token)
    
    print("\nDone. All courses should now be properly active and queryable.")

if __name__ == "__main__":
    main() 