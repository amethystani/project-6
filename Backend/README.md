# UDIS Backend

This is the backend API for the University Department Information System (UDIS), providing role-based access control and user management.

## Features

- User authentication (register, login, token verification)
- Role-based access control (Student, Faculty, Admin, Department Head)
- User profile management
- SQLite database with SQLAlchemy ORM

## Installation

1. Clone the repository
2. Navigate to the backend directory
3. Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

4. Install dependencies:

```bash
pip install -r requirements.txt
```

5. Configure environment variables:
   - Create a `.env` file based on the provided example
   - Update the database URL and JWT secret key

## Running the Application

1. Start the Flask server:

```bash
python app.py
```

2. The server will run at `http://localhost:5000`
3. Test data will be automatically populated on first run

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login an existing user
- `GET /api/auth/verify-token` - Verify JWT token

### User Management

- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `GET /api/users/` - Get all users (Admin/Department Head only)
- `GET /api/users/<user_id>` - Get specific user (Admin/Department Head only)
- `GET /api/users/by-role/<role>` - Get users by role (Admin/Department Head only)
- `GET /api/users/access-code/<code>` - Get user by access code (Admin only)

## Testing the API

You can use tools like cURL, Postman or a programming language with HTTP capabilities to test the API endpoints.

### Example: Register a new user

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "secure123",
    "first_name": "New",
    "last_name": "User",
    "role": "student"
  }'
```

### Example: Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'
```

### Example: Access a protected endpoint

```bash
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Default Test Users

The system is pre-populated with the following test users:

1. Admin
   - Email: admin@example.com
   - Password: password123
   - Access Code: admin1

2. Department Head
   - Email: depthead@example.com
   - Password: password123
   - Access Code: depthead2

3. Faculty
   - Email: faculty@example.com
   - Password: password123
   - Access Code: faculty3

4. Student
   - Email: student@example.com
   - Password: password123
   - Access Code: student4 