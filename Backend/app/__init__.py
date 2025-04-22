import os
from flask import Flask, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from config import Config

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Configure CORS - Update with more permissive settings
    CORS(app, 
         resources={r"/*": {"origins": "*"}}, 
         supports_credentials=True,
         methods=["GET", "HEAD", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
         allow_headers=["Content-Type", "Authorization", "X-Requested-With"])
    
    # Add CORS headers to all responses
    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        # Handle OPTIONS request specifically to respond with 200 OK
        if request.method == 'OPTIONS':
            response.status_code = 200
        return response
    
    # Get current directory
    basedir = os.path.abspath(os.path.dirname(__file__))
    parent_dir = os.path.dirname(basedir)
    
    # Configure SQLAlchemy with absolute path
    default_db_path = os.path.join(parent_dir, 'udis.db')
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", f"sqlite:///{default_db_path}")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    
    print(f"Using database: {app.config['SQLALCHEMY_DATABASE_URI']}")
    
    # Configure JWT
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-key-please-change")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 3600  # 1 hour
    
    # Initialize extensions
    # Import db here to avoid circular imports
    from app.models import db
    db.init_app(app)
    jwt = JWTManager(app)
    
    # Set up JWT error handlers
    @jwt.invalid_token_loader
    def invalid_token_callback(error_string):
        return {
            'status': 'error',
            'message': f'Invalid token: {error_string}'
        }, 401
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {
            'status': 'error',
            'message': 'Token has expired'
        }, 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error_string):
        return {
            'status': 'error',
            'message': f'Missing or invalid authorization header: {error_string}'
        }, 401
    
    # Import and register blueprints
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.courses import courses_bp
    from app.routes.enrollments import enrollments_bp
    from app.routes.assignments import assignments_bp
    from app.routes.notifications import notifications_bp
    from app.routes.department_head import department_head_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(courses_bp, url_prefix='/api/courses')
    app.register_blueprint(enrollments_bp, url_prefix='/api/enrollments')
    app.register_blueprint(assignments_bp, url_prefix='/api/assignments')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(department_head_bp, url_prefix='/api/department-head')
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app 