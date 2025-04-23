"""
Base test class for all backend tests.
"""
import unittest
import json
from unittest import mock
from app import create_app
from app.models import db, User, UserRole, Student, Faculty, Admin, Course
from tests.config import TestConfig


class BaseTestCase(unittest.TestCase):
    """Base test case for all tests."""

    def setUp(self):
        """Set up test environment before each test."""
        # Mock JWT-related functions before creating the app
        # Create and apply patches
        self.patches = []
        
        # Patch both original and imported versions of jwt_required
        self.patches.append(mock.patch('flask_jwt_extended.jwt_required', self._mock_jwt_required))
        self.patches.append(mock.patch('app.auth.jwt_required', self._mock_jwt_required))
        
        # Patch get_jwt_identity
        self.patches.append(mock.patch('flask_jwt_extended.get_jwt_identity', self._mock_get_jwt_identity))
        self.patches.append(mock.patch('app.auth.get_jwt_identity', self._mock_get_jwt_identity))
        
        # Patch verify_jwt_in_request
        self.patches.append(mock.patch('flask_jwt_extended.verify_jwt_in_request', self._mock_verify_jwt))
        
        # Patch decode_token
        self.patches.append(mock.patch('flask_jwt_extended.decode_token', self._mock_decode_token))
        
        # Start all patches
        for patch in self.patches:
            patch.start()
            
        # Create the app after patching
        self.app = create_app()
        self.app.config.from_object(TestConfig)
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        
        # Set default user_id to admin (will be used by _mock_get_jwt_identity)
        self.current_user_id = 1
        
        # Drop and recreate all tables to ensure a clean state
        db.drop_all()
        db.create_all()
        
        # Add test data
        self._add_test_data()
        
        # Find and patch the role_required decorator in users.py
        self.role_required_patcher = mock.patch('app.routes.users.role_required')
        self.role_required_mock = self.role_required_patcher.start()
        
        # Make the decorator just return the function it decorates
        def mock_decorator(roles):
            return lambda f: f
        
        self.role_required_mock.side_effect = mock_decorator

    def _mock_jwt_required(self, optional=False):
        """Mock implementation of jwt_required decorator."""
        def decorator(fn):
            return fn
        return decorator
    
    def _mock_get_jwt_identity(self):
        """Mock implementation of get_jwt_identity."""
        return self.current_user_id
    
    def _mock_verify_jwt(self, optional=False):
        """Mock implementation of verify_jwt_in_request."""
        return True
    
    def _mock_decode_token(self, token):
        """Mock implementation of decode_token."""
        return {"sub": self.current_user_id}

    def tearDown(self):
        """Clean up after each test."""
        # Stop the role_required patch
        self.role_required_patcher.stop()
        
        # Stop all other patches
        for patch in self.patches:
            patch.stop()
        
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def _add_test_data(self):
        """Add test data to the database."""
        # Create test admin user
        admin = User(
            email="admin@test.com",
            password_hash="pbkdf2:sha256:150000$test$testadminpass",
            first_name="Admin",
            last_name="User",
            role=UserRole.ADMIN,
            access_code="ADMIN123"
        )
        db.session.add(admin)
        
        # Create test faculty user
        faculty = User(
            email="faculty@test.com",
            password_hash="pbkdf2:sha256:150000$test$testfaculty",
            first_name="Faculty",
            last_name="User",
            role=UserRole.FACULTY,
            access_code="FACULTY123"
        )
        db.session.add(faculty)
        
        # Create test student user
        student = User(
            email="student@test.com",
            password_hash="pbkdf2:sha256:150000$test$teststudent",
            first_name="Student",
            last_name="User",
            role=UserRole.STUDENT,
            access_code="STUDENT123"
        )
        db.session.add(student)
        
        # Commit users first to get their IDs
        db.session.commit()
        
        # Create admin profile
        admin_profile = Admin(
            user_id=admin.id,
            admin_id="ADM001",
            department="IT"
        )
        db.session.add(admin_profile)
        
        # Create faculty profile
        faculty_profile = Faculty(
            user_id=faculty.id,
            faculty_id="FAC001",
            department="Computer Science",
            position="Professor"
        )
        db.session.add(faculty_profile)
        
        # Create student profile
        student_profile = Student(
            user_id=student.id,
            student_id="STU001",
            program="Computer Science",
            year_level=3
        )
        db.session.add(student_profile)
        
        # Create test course
        course = Course(
            course_code="CS101",
            title="Introduction to Computer Science",
            description="Basic concepts of computer science",
            credits=3,
            department="Computer Science",
            capacity=30,
            is_active=True,
            created_by=faculty.id
        )
        db.session.add(course)
        
        # Final commit for all other objects
        db.session.commit()
    
    def get_auth_headers(self, email="admin@test.com", password="testpassword"):
        """Get authentication headers for a user."""
        return {"Authorization": "Bearer test-token"}
    
    def assert_status_code(self, response, expected_code):
        """Assert the response status code matches the expected code."""
        self.assertEqual(response.status_code, expected_code, 
                         f"Expected status code {expected_code}, got {response.status_code}: {response.data.decode('utf-8')}") 