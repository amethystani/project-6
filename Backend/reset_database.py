from app import app, db
import os

def reset_database():
    """Drop all tables and recreate the database with the latest schema"""
    with app.app_context():
        # Get DB path from app config
        db_path = app.config.get('SQLALCHEMY_DATABASE_URI', '')
        
        # If it's a sqlite database, remove the file
        if db_path.startswith('sqlite:///'):
            db_file = db_path.replace('sqlite:///', '')
            if os.path.exists(db_file):
                print(f"Removing existing database file: {db_file}")
                os.remove(db_file)
                print("Database file removed")
        
        print("Dropping all tables...")
        db.drop_all()
        print("Creating all tables with latest schema...")
        db.create_all()
        print("Database reset complete")

if __name__ == "__main__":
    reset_database()
    print("Now you should run a script to populate initial data") 