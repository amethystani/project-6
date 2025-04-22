from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.models import db
from app.routes.auth import auth_bp
from app.routes.users import users_bp
from app.routes.courses import courses_bp
from app.routes.department_head import department_head_bp
from app.routes.enrollments import enrollments_bp
from config import Config
import logging
import os

app = Flask(__name__)

# Configure the app with settings from Config class
app.config.from_object(Config)

# Initialize JWT manager
jwt = JWTManager(app)

# Add JWT error handlers to fix 422 errors
@jwt.invalid_token_loader
def invalid_token_callback(error_string):
    return jsonify({
        'status': 'error',
        'message': f'Invalid token: {error_string}'
    }), 401

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({
        'status': 'error',
        'message': 'Token has expired'
    }), 401

@jwt.unauthorized_loader
def missing_token_callback(error_string):
    return jsonify({
        'status': 'error',
        'message': f'Missing or invalid authorization header: {error_string}'
    }), 401

@jwt.token_in_blocklist_loader
def token_in_blocklist_callback(jwt_header, jwt_payload):
    return False  # We don't have a blocklist yet

@jwt.needs_fresh_token_loader
def needs_fresh_token_callback(jwt_header, jwt_payload):
    return jsonify({
        'status': 'error',
        'message': 'Fresh token required'
    }), 401

@jwt.revoked_token_loader
def revoked_token_callback(jwt_header, jwt_payload):
    return jsonify({
        'status': 'error',
        'message': 'Token has been revoked'
    }), 401

@jwt.user_lookup_error_loader
def user_lookup_error_callback(jwt_header, jwt_payload):
    return jsonify({
        'status': 'error',
        'message': 'User not found'
    }), 404

# Enable CORS for all routes and all origins
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize database
db.init_app(app)

# Register blueprints with URL prefix
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(users_bp, url_prefix='/api/users')
app.register_blueprint(courses_bp, url_prefix='/api/courses')
app.register_blueprint(department_head_bp, url_prefix='/api/department-head')
app.register_blueprint(enrollments_bp, url_prefix='/api/enrollments')

# Create tables if they don't exist
with app.app_context():
    db.create_all()

@app.after_request
def after_request(response):
    # Add CORS headers to every response
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Max-Age', '3600')
    
    # Handle OPTIONS method for CORS preflight requests
    if request.method == 'OPTIONS':
        response.status_code = 200
    
    return response

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint."""
    return jsonify({
        'status': 'success',
        'message': 'API is healthy'
    })

if __name__ == '__main__':
    # Set host to 0.0.0.0 to make it accessible from outside the container
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True) 