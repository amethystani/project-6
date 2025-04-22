import os
import sys

# Check if Flask is installed, if not install it
try:
    import flask
except ImportError:
    print("Flask not found, installing...")
    os.system("pip install flask flask-cors")

# Create a simple CORS test server
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/')
def home():
    return jsonify({
        "message": "CORS test server running",
        "instructions": "Check your browser console for CORS issues"
    })

@app.route('/cors-test')
def cors_test():
    return jsonify({
        "cors": "enabled",
        "status": "success",
        "message": "If you can see this in your browser, CORS is working"
    })

def print_instructions():
    print("""
=== CORS Troubleshooting ===

1. Run this server: 
   python fix_cors.py run

2. In your browser, open the JavaScript console and run:
   fetch('http://localhost:8080/cors-test')
     .then(response => response.json())
     .then(data => console.log('CORS Test:', data))
     .catch(error => console.error('CORS Test Error:', error));

3. If successful, you'll see a success message
   If it fails with a CORS error, your browser has CORS issues

Frontend Fix Instructions:
1. Make sure your frontend's .env file has:
   VITE_API_URL=http://127.0.0.1:5001

2. Also ensure you're using:
   axios.defaults.withCredentials = true; 
   in your main.tsx or App.tsx

3. Clear browser cache (Ctrl+F5 or Cmd+Shift+R)
""")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "run":
        print("Starting CORS test server on http://localhost:8080")
        app.run(host='0.0.0.0', port=8080)
    else:
        print_instructions() 