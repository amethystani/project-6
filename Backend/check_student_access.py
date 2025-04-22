import requests
import jwt
import datetime
import random
import string

# Configuration
API_BASE_URL = "http://127.0.0.1:5001/api"
STUDENT_EMAIL = "student3@snu.edu.in"
STUDENT_PASSWORD = "student123"
JWT_SECRET = "your-super-secret-key-please-change-in-production"

def login_student():
    """Login as a student and get authentication token"""
    login_url = f"{API_BASE_URL}/auth/login"
    login_data = {
        "email": STUDENT_EMAIL,
        "password": STUDENT_PASSWORD
    }
    
    try:
        response = requests.post(login_url, json=login_data)
        if response.status_code != 200:
            print(f"Student login failed with status code: {response.status_code}")
            return None
        
        data = response.json()
        if data.get("success") and data.get("user"):
            user = data["user"]
            print(f"Student login successful for user: {user['email']} (ID: {user['id']})")
            
            # Generate a proper JWT token
            return generate_jwt_token(user)
        else:
            print(f"Student login failed: {data.get('message', 'Unknown error')}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Student login request failed: {str(e)}")
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
        "role": user.get("role", "student"),
        "jti": ''.join(random.choices(string.ascii_uppercase + string.digits, k=16))
    }
    
    # Create token with the correct secret
    try:
        token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
        return token
    except Exception as e:
        print(f"Error encoding JWT: {e}")
        return None

def check_available_courses(token):
    """Check available courses as a student would"""
    # This URL mimics exactly what the student frontend would call
    courses_url = f"{API_BASE_URL}/courses/?is_active=true"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        print(f"Checking available courses with URL: {courses_url}")
        response = requests.get(courses_url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            courses = data.get('data', [])
            print(f"Success! Found {len(courses)} available courses")
            
            # Print a few sample courses
            if courses:
                print("\nSample courses:")
                for i in range(min(5, len(courses))):
                    course = courses[i]
                    print(f"  {i+1}. {course.get('course_code')}: {course.get('title')} ({course.get('department')})")
            
            return courses
        else:
            print(f"Failed to get courses: {response.status_code} - {response.text}")
            return []
    except Exception as e:
        print(f"Error checking courses: {str(e)}")
        return []

def test_cors():
    """Test if CORS is properly configured for the frontend"""
    courses_url = f"{API_BASE_URL}/courses/?is_active=true"
    headers = {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "GET"
    }
    
    try:
        print("\nTesting CORS preflight request...")
        response = requests.options(courses_url, headers=headers)
        if response.status_code < 400:
            print(f"CORS preflight success: {response.status_code}")
            print("CORS Headers:")
            for key, value in response.headers.items():
                if key.lower().startswith('access-control'):
                    print(f"  {key}: {value}")
        else:
            print(f"CORS preflight failed: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error testing CORS: {str(e)}")

def main():
    # Login as student
    token = login_student()
    if not token:
        print("Failed to login as student. Exiting.")
        return
    
    # Check if student can access available courses
    courses = check_available_courses(token)
    
    # Test CORS configuration
    test_cors()
    
    if courses:
        print("\nFrontend troubleshooting tips:")
        print("1. Clear browser cache and refresh the page")
        print("2. Check browser console for any errors")
        print("3. Make sure the backend API URL is correctly set in the frontend")
        print("4. Verify the frontend is sending the correct authentication token")
        print("5. Check if any other filters are being applied")
    else:
        print("\nNo courses found. Fix the backend issue first.")

if __name__ == "__main__":
    main() 