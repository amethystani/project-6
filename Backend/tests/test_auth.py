"""
Tests for authentication routes.
"""
import json
import unittest
from unittest import mock
from app.models import User, UserRole
from tests.test_base import BaseTestCase


class AuthTestCase(BaseTestCase):
    """Test case for authentication routes."""

    def test_check_user_exists(self):
        """Test check_user endpoint with existing user."""
        response = self.client.post(
            '/api/auth/check-user',
            json={"email": "admin@test.com"}
        )
        
        data = json.loads(response.data)
        self.assert_status_code(response, 200)
        self.assertTrue(data["success"])
        self.assertTrue(data["exists"])
    
    def test_check_user_not_exists(self):
        """Test check_user endpoint with non-existing user."""
        response = self.client.post(
            '/api/auth/check-user',
            json={"email": "nonexistent@test.com"}
        )
        
        data = json.loads(response.data)
        self.assert_status_code(response, 404)
        self.assertTrue(data["success"])
        self.assertFalse(data["exists"])
    
    def test_check_user_invalid_request(self):
        """Test check_user endpoint with invalid request data."""
        response = self.client.post(
            '/api/auth/check-user',
            json={}  # Missing email
        )
        
        data = json.loads(response.data)
        self.assert_status_code(response, 400)
        self.assertFalse(data["success"])
    
    def test_register_new_user(self):
        """Test register endpoint with valid data."""
        response = self.client.post(
            '/api/auth/register',
            json={
                "email": "newuser@test.com",
                "password": "password123",
                "first_name": "New",
                "last_name": "User",
                "role": "student"
            }
        )
        
        data = json.loads(response.data)
        self.assert_status_code(response, 201)
        self.assertTrue(data["success"])
        
        # Verify user was created in the database
        user = User.query.filter_by(email="newuser@test.com").first()
        self.assertIsNotNone(user)
        self.assertEqual(user.first_name, "New")
        self.assertEqual(user.last_name, "User")
        self.assertEqual(user.role, UserRole.STUDENT)
    
    def test_register_missing_fields(self):
        """Test register endpoint with missing required fields."""
        response = self.client.post(
            '/api/auth/register',
            json={
                "email": "incomplete@test.com",
                "password": "password123",
                # Missing first_name, last_name, role
            }
        )
        
        data = json.loads(response.data)
        self.assert_status_code(response, 400)
        self.assertFalse(data["success"])
    
    def test_register_invalid_role(self):
        """Test register endpoint with invalid role."""
        response = self.client.post(
            '/api/auth/register',
            json={
                "email": "invalidrole@test.com",
                "password": "password123",
                "first_name": "Invalid",
                "last_name": "Role",
                "role": "invalid_role"  # Not a valid role
            }
        )
        
        data = json.loads(response.data)
        self.assert_status_code(response, 400)
        self.assertFalse(data["success"])
    
    def test_register_duplicate_email(self):
        """Test register endpoint with duplicate email."""
        # First registration should succeed
        response1 = self.client.post(
            '/api/auth/register',
            json={
                "email": "duplicate@test.com",
                "password": "password123",
                "first_name": "First",
                "last_name": "User",
                "role": "student"
            }
        )
        
        # Second registration with same email should fail
        response2 = self.client.post(
            '/api/auth/register',
            json={
                "email": "duplicate@test.com",
                "password": "password456",
                "first_name": "Second",
                "last_name": "User",
                "role": "faculty"
            }
        )
        
        data = json.loads(response2.data)
        self.assert_status_code(response2, 400)
        self.assertFalse(data["success"])
    
    def test_login_success(self):
        """Test login endpoint with valid credentials."""
        # Use a fixed email and role value to avoid detached instance error
        test_email = "login@test.com" 
        test_role = UserRole.STUDENT.value
        
        # Mock the login_user function to return success
        with mock.patch('app.auth.login_user') as mock_login:
            mock_login.return_value = {
                "success": True, 
                "access_token": "test-token",
                "user": {
                    "id": 1,
                    "email": test_email,
                    "role": test_role
                }
            }
            
            response = self.client.post(
                '/api/auth/login',
                json={
                    "email": test_email,
                    "password": "correct-password"
                }
            )
            
            data = json.loads(response.data)
            self.assert_status_code(response, 200)
            self.assertTrue(data["success"])
            self.assertIn("access_token", data)
            self.assertIn("user", data)
    
    def test_login_missing_fields(self):
        """Test login endpoint with missing fields."""
        response = self.client.post(
            '/api/auth/login',
            json={
                "email": "user@test.com"
                # Missing password
            }
        )
        
        data = json.loads(response.data)
        self.assert_status_code(response, 400)
        self.assertFalse(data["success"])
    
    def test_login_invalid_credentials(self):
        """Test login endpoint with invalid credentials."""
        # Mock the login_user function to return failure
        with mock.patch('app.auth.login_user') as mock_login:
            mock_login.return_value = {
                "success": False,
                "message": "Invalid email or password"
            }
            
            response = self.client.post(
                '/api/auth/login',
                json={
                    "email": "user@test.com",
                    "password": "wrong-password"
                }
            )
            
            data = json.loads(response.data)
            self.assert_status_code(response, 401)
            self.assertFalse(data["success"])
    
    def test_verify_token_valid(self):
        """Test verify_token endpoint with valid token."""
        # Create a user and get a valid token
        # This is more complex and would normally involve mocking the JWT
        pass
    
    def test_verify_token_invalid(self):
        """Test verify_token endpoint with invalid token."""
        # Send an invalid token and check response
        response = self.client.get(
            '/api/auth/verify-token',
            headers={"Authorization": "Bearer invalid-token"}
        )
        
        # Expecting 401 or 422 status code
        self.assertIn(response.status_code, [401, 422])


if __name__ == '__main__':
    unittest.main() 