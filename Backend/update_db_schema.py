import sqlite3
import os

def add_status_column():
    """Add status column to users table if it doesn't exist"""
    # Locate the database file
    instance_dir = os.path.join(os.path.dirname(__file__), 'instance')
    db_path = os.path.join(instance_dir, 'udis.db')
    
    if not os.path.exists(db_path):
        print(f"Database file not found at {db_path}")
        # Look in current directory
        db_path = os.path.join(os.path.dirname(__file__), 'udis.db')
        if not os.path.exists(db_path):
            print(f"Database file not found at {db_path}")
            return
    
    print(f"Using database at {db_path}")
    
    # Connect to the database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if status column exists
    cursor.execute("PRAGMA table_info(users)")
    columns = cursor.fetchall()
    column_names = [col[1] for col in columns]
    
    if 'status' not in column_names:
        print("Adding 'status' column to users table...")
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active' NOT NULL")
            conn.commit()
            print("Column added successfully!")
        except sqlite3.Error as e:
            print(f"Error adding column: {e}")
    else:
        print("'status' column already exists in users table")
    
    conn.close()

if __name__ == "__main__":
    add_status_column()
    print("Database schema update complete") 