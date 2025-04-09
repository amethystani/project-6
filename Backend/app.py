from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.models import db
from app.routes.auth import auth_bp
from app.routes.users import users_bp
from app.routes.courses import courses_bp
from app.routes.department_head import department_head_bp
from config import Config
import logging
import os

app = Flask(__name__)

# Configure the app with settings from Config class
app.config.from_object(Config)

# Initialize JWT manager
jwt = JWTManager(app)

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

# Create tables if they don't exist
with app.app_context():
    db.create_all()

@app.after_request
def after_request(response):
    # Add CORS headers to every response
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
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