import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configure CORS
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
    
    # Configure CORS
    CORS(app, 
         resources={r"/*": {"origins": "*"}}, 
         supports_credentials=True,
         methods=["GET", "HEAD", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
         allow_headers=["Content-Type", "Authorization", "X-Requested-With"])
    
    # Configure CORS
    CORS(app, 
         resources={r"/*": {"origins": "*"}}, 
         supports_credentials=True,
         methods=["GET", "HEAD", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
         allow_headers=["Content-Type", "Authorization", "X-Requested-With"])
    
    # Add CORS headers to all responses
    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
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
    
    # Import and register blueprints
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.courses import courses_bp
    
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(courses_bp, url_prefix='/api')
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app 