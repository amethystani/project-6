import os
from dotenv import load_dotenv
from datetime import timedelta

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base configuration class."""
    # Flask settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key-please-change')
    
    # Database settings
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URI', 'sqlite:///app.db')
    
    # JWT settings
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-key-please-change')
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_HEADER_NAME = "Authorization"
    JWT_HEADER_TYPE = "Bearer"
    
    # CORS settings
    CORS_HEADERS = 'Content-Type'
    
    # Other settings
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() in ('true', '1', 't') 