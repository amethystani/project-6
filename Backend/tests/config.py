"""
Test configuration for the SNU Management System backend.
"""
import os

class TestConfig:
    """Test configuration class."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = "test-secret-key"
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour 