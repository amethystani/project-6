# Course Generator Scripts

This directory contains two scripts for generating and adding multiple courses to the system:

1. `flood_courses.py` - Uses Selenium to automate course creation through a web browser
2. `add_courses_api.py` - Uses direct API calls to create courses (faster and more reliable)

## Prerequisites

- Python 3.8+
- Required Python packages:
  - For Selenium script: `selenium`, `webdriver-manager`
  - For API script: `requests`

You can install these packages using pip:

```bash
# For Selenium script
pip install selenium webdriver-manager

# For API script
pip install requests
```

- The backend server must be running at `http://localhost:5001`
- For the Selenium script, the frontend must be running at `http://localhost:3000`

## Configuration

Before running either script, you need to update the configuration variables at the top of each file:

- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: Valid credentials for an admin or department head user who has permission to create courses
- `NUM_COURSES`: The number of courses to create (default is 20 for Selenium, 50 for API)
- `API_BASE_URL` or `LOGIN_URL`: Update if your backend or frontend is running on different URLs

## Running the Scripts

### API Script (Recommended)

```bash
python add_courses_api.py
```

This will:
1. Log in to get an authentication token
2. Create the specified number of courses with random data
3. Approve each course automatically
4. Print progress information

### Selenium Script

```bash
python flood_courses.py
```

This will:
1. Open a Chrome browser window
2. Navigate to the login page
3. Log in with the provided credentials
4. Use JavaScript to make API calls to create and approve courses
5. Close the browser when done

## Troubleshooting

- If you get authentication errors, make sure the email and password are correct
- For the Selenium script, make sure the HTML element IDs and XPaths match your frontend implementation
- If courses are created but not approved, check if the API endpoints for course approval are correct
- For the API script, if you get CORS errors, make sure your backend has proper CORS configuration

## Customizing Course Data

You can modify the `generate_course_data()` function in either script to change how courses are generated. You can:

- Add more specific course titles
- Change the departments
- Adjust credit ranges
- Add more detailed descriptions
- Set specific prerequisites

The generated courses will be visible to all students in the "available courses" section of the student page once they're created and approved. 