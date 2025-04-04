from app import create_app
from app.utils import populate_test_data

app = create_app()

@app.route('/')
def index():
    return {
        "message": "Welcome to UDIS API",
        "version": "1.0.0",
        "status": "running"
    }

if __name__ == "__main__":
    with app.app_context():
        # Populate test data
        populate_test_data()
    
    app.run(host="0.0.0.0", port=5001, debug=True) 