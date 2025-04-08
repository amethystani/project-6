import os
from app import create_app
from app.models import db
from app.utils import populate_test_data

def reset_database():
    app = create_app()
    
    with app.app_context():
        # Drop all tables
        db.drop_all()
        print("Dropped all tables")
        
        # Create all tables
        db.create_all()
        print("Created all tables")
        
        # Populate with test data
        populate_test_data()
        print("Database reset complete!")

if __name__ == "__main__":
    reset_database() 