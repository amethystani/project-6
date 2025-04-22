import requests
import random
import string
import time
import json
import jwt
import datetime

# Configuration
API_BASE_URL = "http://127.0.0.1:5001/api"  # Update with your actual backend URL
ADMIN_EMAIL = "admin@snu.edu.in"  # Changed to use admin account
ADMIN_PASSWORD = "admin123"  # Typical admin password
JWT_SECRET = "your-super-secret-key-please-change-in-production"  # This is what the server uses
NUM_COURSES = 50  # Number of courses to add

# Departments to randomly assign courses to
DEPARTMENTS = [
    "Computer Science",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Engineering",
    "Business",
    "Economics",
    "Psychology",
    "Sociology"
]

def random_string(length=8):
    """Generate a random string of specified length"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def generate_course_data():
    """Generate random course data"""
    department = random.choice(DEPARTMENTS)
    course_code = f"{department[:3].upper()}{random.randint(100, 499)}"
    
    return {
        "course_code": course_code,
        "title": f"{department} Course {random_string(4)}",
        "description": f"This is an auto-generated course for {department}",
        "credits": random.randint(1, 4),
        "department": department,
        "prerequisites": "",
        "capacity": random.randint(20, 100),
        "is_active": True  # Ensure this is a boolean True, not string "true"
    }

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
        "role": user.get("role", "student"),
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
        print(f"Login response: {response.text}")
        
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

def test_auth(token):
    """Test if the token works"""
    test_url = f"{API_BASE_URL}/courses/"
    
    if not token:
        print("No token to test")
        return None
        
    print("\n=== TESTING AUTHENTICATION ===")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    try:
        print("\nTrying JWT token...")
        response = requests.get(test_url, headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:200]}")
        
        if response.status_code < 400:
            print(f"✅ Token works!")
            return token
        else:
            print(f"❌ Token authentication failed: {response.text}")
    except Exception as e:
        print(f"Error: {str(e)}")
    
    return token  # Return the token anyway to try course creation

def test_get_courses(token):
    """Test getting courses with various is_active parameters"""
    base_url = f"{API_BASE_URL}/courses/"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Try different query parameter formats
    test_urls = [
        f"{base_url}",
        f"{base_url}?is_active=true",
        f"{base_url}?is_active=True",
        f"{base_url}?is_active=TRUE",
        f"{base_url}?is_active=1"
    ]
    
    print("\n=== TESTING COURSE FETCHING ===")
    for url in test_urls:
        try:
            print(f"\nTrying URL: {url}")
            response = requests.get(url, headers=headers)
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                course_count = len(data.get("data", []))
                print(f"Courses returned: {course_count}")
                print("✅ URL works!")
            else:
                print(f"❌ Failed: {response.text[:100]}...")
        except Exception as e:
            print(f"Error: {str(e)}")
    
    return None

def create_course(token, course_data):
    """Create a new course"""
    courses_url = f"{API_BASE_URL}/courses/"
    
    # Use Bearer token format
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        print(f"Sending create course request with token: {token[:30]}...")
        response = requests.post(courses_url, json=course_data, headers=headers)
        
        if response.status_code == 201 or response.status_code == 200:
            return response.json()
        else:
            print(f"Failed to create course: {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Create course request failed: {str(e)}")
        return None

def approve_course(token, approval_id):
    """Approve a course"""
    approval_url = f"{API_BASE_URL}/courses/course-approvals/{approval_id}/action"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    approval_data = {
        "action": "approve",
        "comments": "Auto-approved"
    }
    
    try:
        response = requests.post(approval_url, json=approval_data, headers=headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Failed to approve course: {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Approve course request failed: {str(e)}")
        return None

def main():
    print(f"Starting to add {NUM_COURSES} courses...")
    
    # Login to get token
    token = login()
    if not token:
        print("Failed to login. Exiting.")
        return
    
    # Test if token works
    test_auth(token)
    
    # Test getting courses with different parameters
    test_get_courses(token)
    
    print("Proceeding with course creation")
    
    # Create courses
    courses_created = 0
    for i in range(NUM_COURSES):
        course_data = generate_course_data()
        print(f"Creating course {i+1}/{NUM_COURSES}: {course_data['course_code']} - {course_data['title']}")
        
        course_result = create_course(token, course_data)
        if course_result and course_result.get("status") == "success" and course_result.get("data"):
            course_id = course_result["data"]["id"]
            print(f"Course created with ID: {course_id}")
            courses_created += 1
            
            # Approve the course
            approval_result = approve_course(token, course_id)
            if approval_result and approval_result.get("status") == "success":
                print(f"Course {course_id} approved successfully")
            else:
                print(f"Failed to approve course {course_id}")
        else:
            print(f"Failed to create course {i+1}")
        
        # Small delay to prevent overwhelming the server
        time.sleep(0.2)
    
    # Test again after creating courses
    print("\nTesting course retrieval after adding courses:")
    test_get_courses(token)
    
    print(f"Process completed. Created {courses_created} out of {NUM_COURSES} courses.")

if __name__ == "__main__":
    main() 