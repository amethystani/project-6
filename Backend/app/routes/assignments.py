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

@assignments_bp.route('/submit/<int:assignment_id>', methods=['POST'])
@jwt_required()
def submit_assignment(assignment_id):
    """Submit an assignment (student only)."""
    current_user_id = get_jwt_identity()
    
    # Check if user is a student
    user = User.query.get(current_user_id)
    if not user or user.role != 'student':
        return jsonify({
            'status': 'error',
            'message': 'Only students can submit assignments'
        }), 403
    
    # Get the student profile
    student = user.student_profile
    if not student:
        return jsonify({
            'status': 'error',
            'message': 'Student profile not found'
        }), 404
    
    # Check if assignment exists
    assignment = Assignment.query.get(assignment_id)
    if not assignment:
        return jsonify({
            'status': 'error',
            'message': 'Assignment not found'
        }), 404
    
    # Check if student is enrolled in the course
    enrollment = student.enrollments.filter_by(course_id=assignment.course_id).first()
    if not enrollment:
        return jsonify({
            'status': 'error',
            'message': 'Not enrolled in this course'
        }), 403
    
    # Check if file was uploaded
    if 'file' not in request.files:
        return jsonify({
            'status': 'error',
            'message': 'No file provided'
        }), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({
            'status': 'error',
            'message': 'No selected file'
        }), 400
    
    # For testing purposes, we're just going to simulate file saving
    from app.models import AssignmentSubmission
    
    try:
        # Check if submission already exists
        existing_submission = AssignmentSubmission.query.filter_by(
            assignment_id=assignment_id,
            student_id=student.id
        ).first()
        
        if existing_submission:
            # Update existing submission
            existing_submission.file_name = file.filename
            existing_submission.file_size = len(file.read())
            file.seek(0)  # Reset file pointer after reading
            existing_submission.file_type = file.filename.split('.')[-1] if '.' in file.filename else 'unknown'
            existing_submission.submission_date = datetime.utcnow()
            existing_submission.is_late = datetime.utcnow() > assignment.due_date
            existing_submission.status = "submitted"
            existing_submission.comments = request.form.get('comments', '')
            db.session.commit()
            
            return jsonify({
                'status': 'success',
                'message': 'Assignment resubmitted successfully',
                'data': existing_submission.to_dict()
            })
        
        # For a real app, save the file to storage
        # file_path = f"uploads/assignments/{assignment_id}/{student.id}/{file.filename}"
        # Make fake path for testing
        file_path = f"fake_uploads/assignments/{assignment_id}/{student.id}/{file.filename}"
        
        # Create submission record
        submission = AssignmentSubmission(
            assignment_id=assignment_id,
            student_id=student.id,
            file_name=file.filename,
            file_path=file_path,
            file_size=len(file.read()),
            file_type=file.filename.split('.')[-1] if '.' in file.filename else 'unknown',
            is_late=datetime.utcnow() > assignment.due_date,
            comments=request.form.get('comments', '')
        )
        
        db.session.add(submission)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Assignment submitted successfully',
            'data': submission.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Failed to submit assignment: {str(e)}'
        }), 500

@assignments_bp.route('/submissions/<int:assignment_id>', methods=['GET'])
@jwt_required()
def get_assignment_submissions(assignment_id):
    """Get all submissions for an assignment (faculty only)."""
    current_user_id = get_jwt_identity()
    
    # Check if assignment exists
    assignment = Assignment.query.get(assignment_id)
    if not assignment:
        return jsonify({
            'status': 'error',
            'message': 'Assignment not found'
        }), 404
    
    # Get user
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({
            'status': 'error',
            'message': 'User not found'
        }), 404
    
    # Check if user is faculty and teaches this course
    if user.role == 'faculty':
        if assignment.course_id not in [c.id for c in user.courses]:
            return jsonify({
                'status': 'error',
                'message': 'Not teaching this course'
            }), 403
    # If user is student, check if they are enrolled and only show their submission
    elif user.role == 'student':
        student = user.student_profile
        if not student:
            return jsonify({
                'status': 'error',
                'message': 'Student profile not found'
            }), 404
        
        enrollment = student.enrollments.filter_by(course_id=assignment.course_id).first()
        if not enrollment:
            return jsonify({
                'status': 'error',
                'message': 'Not enrolled in this course'
            }), 403
        
        # Get student's submission
        from app.models import AssignmentSubmission
        submission = AssignmentSubmission.query.filter_by(
            assignment_id=assignment_id,
            student_id=student.id
        ).first()
        
        return jsonify({
            'status': 'success',
            'data': submission.to_dict() if submission else None
        })
    else:
        return jsonify({
            'status': 'error',
            'message': 'Unauthorized role'
        }), 403
    
    # Get all submissions for the assignment
    from app.models import AssignmentSubmission
    submissions = AssignmentSubmission.query.filter_by(assignment_id=assignment_id).all()
    
    return jsonify({
        'status': 'success',
        'data': [submission.to_dict() for submission in submissions]
    }) 