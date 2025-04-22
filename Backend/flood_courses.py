import time
import random
import string
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

# Configuration
LOGIN_URL = "http://localhost:5173/login"  # Update with your actual frontend URL
ADMIN_EMAIL = "student3@snu.edu.in"  # Update with valid admin credentials
ADMIN_PASSWORD = "student123"
NUM_COURSES = 20  # Number of courses to add

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
    }

def main():
    # Set up the WebDriver
    options = webdriver.ChromeOptions()
    # Uncomment next line if you want to run headless
    # options.add_argument("--headless")
    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 10)
    
    try:
        # Login
        print("Logging in...")
        driver.get(LOGIN_URL)
        
        # Wait for login form to load
        email_field = wait.until(EC.presence_of_element_located((By.ID, "email")))
        password_field = driver.find_element(By.ID, "password")
        
        # Enter login credentials
        email_field.send_keys(ADMIN_EMAIL)
        password_field.send_keys(ADMIN_PASSWORD)
        
        # Submit the form
        login_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Login')]")
        login_button.click()
        
        # Wait for login to complete - look for dashboard or navigation element
        wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(text(), 'Dashboard')]")))
        print("Login successful!")
        
        # Get authentication token from localStorage
        auth_token = driver.execute_script("return localStorage.getItem('token');")
        
        # Use JavaScript to add courses directly via API calls
        print(f"Adding {NUM_COURSES} courses...")
        for i in range(NUM_COURSES):
            course_data = generate_course_data()
            print(f"Creating course {i+1}/{NUM_COURSES}: {course_data['course_code']} - {course_data['title']}")
            
            # Create course via API
            create_course_script = f"""
                fetch('http://localhost:5001/api/courses/', {{
                    method: 'POST',
                    headers: {{
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + '{auth_token}'
                    }},
                    body: JSON.stringify({json.dumps(course_data)})
                }})
                .then(response => response.json())
                .then(data => {{
                    console.log('Course created:', data);
                    if (data.status === 'success' && data.data && data.data.id) {{
                        // Auto-approve the course
                        fetch('http://localhost:5001/api/courses/course-approvals/' + data.data.id + '/action', {{
                            method: 'POST',
                            headers: {{
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + '{auth_token}'
                            }},
                            body: JSON.stringify({{
                                'action': 'approve',
                                'comments': 'Auto-approved'
                            }})
                        }})
                        .then(resp => resp.json())
                        .then(result => console.log('Course approval result:', result))
                        .catch(err => console.error('Error approving course:', err));
                    }}
                }})
                .catch(error => console.error('Error creating course:', error));
            """
            
            driver.execute_script(create_course_script)
            # Small delay to prevent overwhelming the server
            time.sleep(0.5)
        
        # Give some time for the last requests to complete
        time.sleep(5)
        print("All courses have been created and auto-approved!")
        
    except TimeoutException:
        print("Timeout error - page elements not found in time")
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        # Close the browser
        driver.quit()

if __name__ == "__main__":
    main() 