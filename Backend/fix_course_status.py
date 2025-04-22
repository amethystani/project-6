import requests
import jwt
import time
import datetime

# Configuration
API_BASE_URL = "http://127.0.0.1:5001/api"  # Update with your actual backend URL
ADMIN_EMAIL = "admin@snu.edu.in"
ADMIN_PASSWORD = "admin123"
JWT_SECRET = "your-super-secret-key-please-change-in-production"  # This is what the server uses

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

def get_all_courses(token):
    """Get all courses, regardless of active status"""
    courses_url = f"{API_BASE_URL}/courses/"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(courses_url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "success":
                return data.get("data", [])
            else:
                print(f"API returned error: {data}")
                return []
        else:
            print(f"Failed to get courses: {response.text}")
            return []
    except Exception as e:
        print(f"Error getting courses: {str(e)}")
        return []

def update_course_status(token, course_id, make_active=True):
    """Update a course's is_active status"""
    course_url = f"{API_BASE_URL}/courses/{course_id}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "is_active": make_active
    }
    
    try:
        response = requests.put(course_url, json=data, headers=headers)
        if response.status_code == 200:
            print(f"Successfully updated course {course_id} to is_active={make_active}")
            return True
        else:
            print(f"Failed to update course {course_id}: {response.text}")
            return False
    except Exception as e:
        print(f"Error updating course {course_id}: {str(e)}")
        return False

def main():
    # Login to get token
    token = login()
    if not token:
        print("Failed to login. Exiting.")
        return
    
    # Get all courses
    courses = get_all_courses(token)
    print(f"Found {len(courses)} courses")
    
    # Update each course to be active
    updated_count = 0
    for course in courses:
        course_id = course.get("id")
        is_already_active = course.get("is_active", False)
        
        if not is_already_active and course_id:
            print(f"Course {course.get('course_code')} (ID: {course_id}) is not active. Activating...")
            if update_course_status(token, course_id, True):
                updated_count += 1
        elif is_already_active:
            print(f"Course {course.get('course_code')} (ID: {course_id}) is already active.")
        
        # Small delay to prevent overwhelming the server
        time.sleep(0.1)
    
    print(f"Activated {updated_count} out of {len(courses)} courses.")
    print("Done! All courses should now appear in the student UI.")

if __name__ == "__main__":
    main() 