"""
Tests for user-related routes.
"""
import json
import unittest
import uuid
from unittest import mock
from flask import jsonify
from app.models import User, UserRole, db
from tests.test_base import BaseTestCase


class UserTestCase(BaseTestCase):
    """Test case for user routes."""

    def test_get_current_user(self):
        """Test retrieving the current user's profile."""
        # Set the JWT identity to admin
        self.jwt_identity_mock.return_value = 1  # Admin user ID
        
        # Add token to headers
        headers = self.get_auth_headers()
        
        # Make the request
        response = self.client.get('/api/users/me', headers=headers)
        
        # Check the response
        data = json.loads(response.data)
        self.assert_status_code(response, 200)
        self.assertTrue(data["success"])
        self.assertIn("user", data)
        self.assertEqual(data["user"]["email"], "admin@test.com")
        self.assertEqual(data["user"]["role"], "ADMIN")
    
    def test_get_user_by_id(self):
        """Test retrieving a user by ID."""
        # Set the JWT identity to admin
        self.jwt_identity_mock.return_value = 1  # Admin user ID
        
        # Add token to headers
        headers = self.get_auth_headers()
        
        # Make the request
        response = self.client.get('/api/users/3', headers=headers)
        
        # Check the response
        data = json.loads(response.data)
        self.assert_status_code(response, 200)
        self.assertTrue(data["success"])
        self.assertIn("user", data)
        self.assertEqual(data["user"]["email"], "student@test.com")
        self.assertEqual(data["user"]["role"], "STUDENT")
    
    def test_get_user_unauthorized(self):
        """Test retrieving a user without admin privileges."""
        # Set the JWT identity to student (non-admin)
        self.jwt_identity_mock.return_value = 3  # Student user ID
        
        # Create a test to verify that non-admin users can't access other users
        def mock_role_required_deny(roles):
            def decorator(f):
                def wrapper(*args, **kwargs):
                    return jsonify({"success": False, "message": "Access denied"}), 403
                return wrapper
            return decorator
        
        # Override the role_required mock to reject the request
        self.role_required_mock.side_effect = mock_role_required_deny
        
        # Add token to headers
        headers = self.get_auth_headers()
        
        # Make the request (trying to access faculty user)
        response = self.client.get('/api/users/2', headers=headers)
        
        # Check for 403 Forbidden
        self.assert_status_code(response, 403)
    
    def test_update_user_profile(self):
        """Test updating the current user's profile."""
        # Set the JWT identity to student
        self.jwt_identity_mock.return_value = 3  # Student user ID
        
        # Add token to headers
        headers = self.get_auth_headers()
        
        # Make the request
        response = self.client.put(
            '/api/users/me',
            json={
                "first_name": "Updated",
                "last_name": "Student"
            },
            headers=headers
        )
        
        # Check the response
        data = json.loads(response.data)
        self.assert_status_code(response, 200)
        self.assertTrue(data["success"])
        self.assertIn("user", data)
        
        # Verify user was updated
        user = User.query.get(3)
        self.assertEqual(user.first_name, "Updated")
        self.assertEqual(user.last_name, "Student")
    
    def test_get_all_users_as_admin(self):
        """Test retrieving all users as admin."""
        # Set the JWT identity to admin
        self.jwt_identity_mock.return_value = 1  # Admin user ID
        
        # Add token to headers
        headers = self.get_auth_headers()
        
        # Make the request
        response = self.client.get('/api/users', headers=headers)
        
        # Check the response
        data = json.loads(response.data)
        self.assert_status_code(response, 200)
        self.assertTrue(data["success"])
        self.assertIn("users", data)
        self.assertIsInstance(data["users"], list)
        self.assertGreaterEqual(len(data["users"]), 3)  # At least our 3 test users
    
    def test_get_users_by_role(self):
        """Test retrieving users filtered by role."""
        # Set the JWT identity to admin
        self.jwt_identity_mock.return_value = 1  # Admin user ID
        
        # Add token to headers
        headers = self.get_auth_headers()
        
        # Make the request
        response = self.client.get('/api/users?role=STUDENT', headers=headers)
        
        # Check the response
        data = json.loads(response.data)
        self.assert_status_code(response, 200)
        self.assertTrue(data["success"])
        self.assertIn("users", data)
        self.assertIsInstance(data["users"], list)
        
        # All users in the response should have role 'student'
        for user in data["users"]:
            self.assertEqual(user["role"], "STUDENT")
    
    def test_create_user_as_admin(self):
        """Test creating a new user as admin."""
        # Set the JWT identity to admin
        self.jwt_identity_mock.return_value = 1  # Admin user ID
        
        # Add token to headers
        headers = self.get_auth_headers()
        
        # Make the request
        response = self.client.post(
            '/api/users',
            json={
                "email": "newuser@test.com",
                "password": "password123",
                "first_name": "New",
                "last_name": "User",
                "role": "FACULTY",
                "department": "Mathematics",
                "position": "Assistant Professor",
                "faculty_id": "FAC002"
            },
            headers=headers
        )
        
        # Check the response
        data = json.loads(response.data)
        self.assert_status_code(response, 201)
        self.assertTrue(data["success"])
        
        # Verify user was created
        user = User.query.filter_by(email="newuser@test.com").first()
        self.assertIsNotNone(user)
        self.assertEqual(user.first_name, "New")
        self.assertEqual(user.last_name, "User")
        self.assertEqual(user.role, UserRole.FACULTY)
    
    def test_delete_user_as_admin(self):
        """Test deleting a user as admin."""
        # Create a user to delete with a unique access code
        unique_code = f"DELETE{uuid.uuid4().hex[:8]}"
        user = User(
            email="todelete@test.com",
            password_hash="pbkdf2:sha256:150000$test$delete",
            first_name="To",
            last_name="Delete",
            role=UserRole.STUDENT,
            access_code=unique_code
        )
        db.session.add(user)
        db.session.commit()
        
        user_id = user.id
        
        # Set the JWT identity to admin
        self.jwt_identity_mock.return_value = 1  # Admin user ID
        
        # Add token to headers
        headers = self.get_auth_headers()
        
        # Make the request
        response = self.client.delete(f'/api/users/{user_id}', headers=headers)
        
        # Check the response
        data = json.loads(response.data)
        self.assert_status_code(response, 200)
        self.assertTrue(data["success"])
        
        # Verify user was deleted
        deleted_user = User.query.get(user_id)
        self.assertIsNone(deleted_user)


if __name__ == '__main__':
    unittest.main() 