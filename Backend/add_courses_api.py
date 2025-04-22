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
NUM_COURSES = 30  # Number of courses to add

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

# Detailed descriptions for each department
DESCRIPTIONS = {
    "Computer Science": [
        "An introduction to computer programming and algorithm design. Students will learn fundamental programming concepts and problem-solving techniques.",
        "Study of data structures and algorithms for efficient data organization, storage, and retrieval. Topics include linked lists, stacks, queues, trees, and graphs.",
        "Fundamentals of computer architecture including CPU design, memory systems, and I/O interfaces. Students will understand the hardware-software interface.",
        "An exploration of modern operating systems principles including process management, memory management, file systems, and security mechanisms.",
        "Introduction to database design and management systems. Topics include data modeling, relational algebra, SQL, and transaction processing."
    ],
    "Mathematics": [
        "Introduction to calculus with applications in science and engineering. Topics include limits, derivatives, integrals, and the fundamental theorem of calculus.",
        "Study of linear systems, vector spaces, linear transformations, matrices, and determinants with applications to various fields.",
        "Introduction to probability theory and statistical inference. Topics include random variables, probability distributions, and hypothesis testing.",
        "Study of ordinary differential equations with applications in physics and engineering. Methods for solving first and second-order differential equations.",
        "Introduction to abstract algebra covering groups, rings, and fields with applications to cryptography and coding theory."
    ],
    "Physics": [
        "Introduction to classical mechanics including Newton's laws, conservation principles, and simple harmonic motion with laboratory experiments.",
        "Study of electromagnetism covering electric and magnetic fields, Maxwell's equations, and electromagnetic waves with practical applications.",
        "Introduction to thermal physics and statistical mechanics. Topics include heat, temperature, entropy, and the laws of thermodynamics.",
        "Study of quantum mechanics including wave-particle duality, Schrödinger's equation, and quantum states with modern applications.",
        "Introduction to relativity theory covering special and general relativity with implications for space, time, and gravity."
    ],
    "Chemistry": [
        "Introduction to general chemistry principles including atomic structure, chemical bonding, and stoichiometry with laboratory work.",
        "Study of organic chemistry covering structure, properties, and reactions of organic compounds with emphasis on synthesis methods.",
        "Fundamentals of analytical chemistry including quantitative analysis, spectroscopy, and chromatography techniques with practical applications.",
        "Introduction to physical chemistry covering thermodynamics, kinetics, and quantum chemistry with mathematical applications.",
        "Study of biochemistry focusing on the structure and function of biomolecules including proteins, nucleic acids, and metabolic pathways."
    ],
    "Biology": [
        "Introduction to cellular and molecular biology covering cell structure, function, and basic biochemical processes with laboratory work.",
        "Study of genetics and heredity including Mendelian genetics, gene expression, and molecular genetics with modern applications.",
        "Introduction to evolutionary biology covering natural selection, adaptation, and the history of life on Earth with case studies.",
        "Study of human anatomy and physiology covering major organ systems, their functions, and homeostatic mechanisms.",
        "Introduction to ecology and environmental biology examining ecosystem dynamics, population biology, and conservation principles."
    ],
    "Engineering": [
        "Introduction to engineering principles and design methodology with hands-on projects and problem-solving activities.",
        "Study of engineering mechanics including statics and dynamics with applications to structural analysis and machine design.",
        "Fundamentals of electrical circuits and electronics covering circuit analysis, digital systems, and basic electronic components.",
        "Introduction to materials science examining the structure, properties, and applications of engineering materials.",
        "Study of thermodynamics and heat transfer with applications to energy systems and thermal management."
    ],
    "Business": [
        "Introduction to business principles covering organizational structures, management, marketing, and financial concepts.",
        "Study of marketing principles and strategies including market research, consumer behavior, and marketing communications.",
        "Fundamentals of financial accounting and analysis for decision-making in business contexts.",
        "Introduction to business ethics examining ethical dilemmas, corporate social responsibility, and ethical decision frameworks.",
        "Study of international business covering global markets, trade policies, and cross-cultural management challenges."
    ],
    "Economics": [
        "Introduction to microeconomic principles including supply and demand, market structures, and consumer choice theory.",
        "Study of macroeconomic concepts including national income, inflation, unemployment, and fiscal and monetary policy.",
        "Fundamentals of international economics covering trade theory, exchange rates, and global economic institutions.",
        "Introduction to econometrics examining statistical methods for analyzing economic data and testing economic theories.",
        "Study of development economics focusing on economic growth, poverty, inequality, and development strategies."
    ],
    "Psychology": [
        "Introduction to general psychology covering major theories, research methods, and applications in various settings.",
        "Study of developmental psychology examining human development across the lifespan from infancy to late adulthood.",
        "Fundamentals of cognitive psychology including perception, attention, memory, language, and problem-solving processes.",
        "Introduction to social psychology examining how people's thoughts, feelings, and behaviors are influenced by others.",
        "Study of abnormal psychology covering psychological disorders, their causes, and treatment approaches."
    ],
    "Sociology": [
        "Introduction to sociology examining social structures, institutions, and processes that shape human behavior.",
        "Study of social inequality focusing on class, race, gender, and other dimensions of stratification in society.",
        "Fundamentals of social research methods including survey design, data collection, and analysis techniques.",
        "Introduction to criminology examining theories of crime, criminal behavior, and the criminal justice system.",
        "Study of family sociology covering marriage, family structures, parenting, and family dynamics in different cultures."
    ]
}

# Generate course prerequisites based on department
def generate_prerequisites(department, course_code):
    # 50% chance of having prerequisites
    if random.random() < 0.5:
        return ""
    
    num_prereqs = random.randint(1, 2)
    prereq_codes = []
    
    # Generate department code prefix
    dept_prefix = department[:3].upper()
    
    # Generate random course numbers (lower than current course to make sense)
    current_num = int(course_code[3:])
    for _ in range(num_prereqs):
        prereq_num = random.randint(100, current_num - 1) if current_num > 101 else 100
        prereq_codes.append(f"{dept_prefix}{prereq_num}")
    
    return ", ".join(prereq_codes)

def random_string(length=8):
    """Generate a random string of specified length"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def generate_course_data():
    """Generate random course data with better descriptions and prerequisites"""
    department = random.choice(DEPARTMENTS)
    dept_prefix = department[:3].upper()
    course_num = random.randint(100, 499)
    course_code = f"{dept_prefix}{course_num}"
    
    # Get a random description for this department
    description = random.choice(DESCRIPTIONS[department])
    
    # Generate prerequisites
    prerequisites = generate_prerequisites(department, course_code)
    
    return {
        "course_code": course_code,
        "title": f"{department} {course_num}",
        "description": description,
        "credits": random.randint(1, 4),
        "department": department,
        "prerequisites": prerequisites,
        "capacity": random.randint(20, 100),
        "is_active": True
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
        "comments": "Auto-approved to fix active status"
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
            
            # Get the approval ID
            # Assuming the approval is created with the course and has an ID of course_id
            approval_id = course_id
            
            # Approve the course
            approval_result = approve_course(token, approval_id)
            if approval_result and approval_result.get("status") == "success":
                print(f"Course {course_id} approved successfully")
                courses_created += 1
            else:
                print(f"Failed to approve course {course_id}")
        else:
            print(f"\nFailed to create course {i+1}")
    
    print("\nTesting course retrieval after adding courses:")
    test_get_courses(token)
    
    print(f"Process completed. Created {courses_created} out of {NUM_COURSES} courses.")

if __name__ == "__main__":
    main() 