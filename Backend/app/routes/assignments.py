from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Assignment, Course, User
from datetime import datetime

assignments_bp = Blueprint('assignments', __name__)

@assignments_bp.route('/', methods=['GET'])
@jwt_required()
def get_assignments():
    """Get all assignments for the current user."""
    current_user_id = get_jwt_identity()
    
    # Get user's enrolled courses
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({
            'status': 'error',
            'message': 'User not found'
        }), 404
    
    # If user is a student, get assignments from enrolled courses
    if user.role == 'student':
        enrolled_course_ids = [e.course_id for e in user.enrollments]
        assignments = Assignment.query.filter(Assignment.course_id.in_(enrolled_course_ids)).all()
    # If user is faculty, get assignments from courses they teach
    elif user.role == 'faculty':
        taught_course_ids = [c.id for c in user.courses]
        assignments = Assignment.query.filter(Assignment.course_id.in_(taught_course_ids)).all()
    else:
        return jsonify({
            'status': 'error',
            'message': 'Unauthorized role'
        }), 403
    
    return jsonify({
        'status': 'success',
        'data': [assignment.to_dict() for assignment in assignments]
    })

@assignments_bp.route('/<int:course_id>', methods=['GET'])
@jwt_required()
def get_course_assignments(course_id):
    """Get all assignments for a specific course."""
    current_user_id = get_jwt_identity()
    
    # Check if course exists
    course = Course.query.get(course_id)
    if not course:
        return jsonify({
            'status': 'error',
            'message': 'Course not found'
        }), 404
    
    # Get user
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({
            'status': 'error',
            'message': 'User not found'
        }), 404
    
    # Check if user has access to this course
    if user.role == 'student':
        enrollment = user.enrollments.filter_by(course_id=course_id).first()
        if not enrollment:
            return jsonify({
                'status': 'error',
                'message': 'Not enrolled in this course'
            }), 403
    elif user.role == 'faculty':
        if course_id not in [c.id for c in user.courses]:
            return jsonify({
                'status': 'error',
                'message': 'Not teaching this course'
            }), 403
    else:
        return jsonify({
            'status': 'error',
            'message': 'Unauthorized role'
        }), 403
    
    # Get assignments for the course
    assignments = Assignment.query.filter_by(course_id=course_id).all()
    
    return jsonify({
        'status': 'success',
        'data': [assignment.to_dict() for assignment in assignments]
    })

@assignments_bp.route('/', methods=['POST'])
@jwt_required()
def create_assignment():
    """Create a new assignment (faculty only)."""
    current_user_id = get_jwt_identity()
    
    # Check if user is faculty
    user = User.query.get(current_user_id)
    if not user or user.role != 'faculty':
        return jsonify({
            'status': 'error',
            'message': 'Only faculty can create assignments'
        }), 403
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['title', 'description', 'due_date', 'course_id']
    for field in required_fields:
        if field not in data:
            return jsonify({
                'status': 'error',
                'message': f'Missing required field: {field}'
            }), 400
    
    # Check if course exists and user teaches it
    course = Course.query.get(data['course_id'])
    if not course:
        return jsonify({
            'status': 'error',
            'message': 'Course not found'
        }), 404
    
    if data['course_id'] not in [c.id for c in user.courses]:
        return jsonify({
            'status': 'error',
            'message': 'Not teaching this course'
        }), 403
    
    try:
        # Parse due date
        due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
        
        # Create assignment
        assignment = Assignment(
            title=data['title'],
            description=data['description'],
            due_date=due_date,
            course_id=data['course_id']
        )
        
        db.session.add(assignment)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Assignment created successfully',
            'data': assignment.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Failed to create assignment: {str(e)}'
        }), 500 