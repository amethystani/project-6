from flask import Blueprint, request, jsonify
from app.models import db, Course, CourseApproval, User, Enrollment, ApprovalStatus, UserRole, Student
from app.auth import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime

courses_bp = Blueprint('courses', __name__)

# Route to get all courses
@courses_bp.route('/', methods=['GET'])
@jwt_required()
def get_courses():
    try:
        # Get query parameters for filtering
        department = request.args.get('department')
        is_active = request.args.get('is_active')
        search = request.args.get('search')  # Search in course_code and title
        credits = request.args.get('credits')  # Filter by credits
        semester = request.args.get('semester')  # Filter by semester
        min_capacity = request.args.get('min_capacity')  # Filter by minimum capacity
        max_capacity = request.args.get('max_capacity')  # Filter by maximum capacity
        
        # Build the query
        query = Course.query
        
        if department:
            query = query.filter_by(department=department)
        
        if is_active:
            is_active_bool = is_active.lower() == 'true'
            query = query.filter_by(is_active=is_active_bool)
            
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Course.course_code.ilike(search_term)) |
                (Course.title.ilike(search_term)) |
                (Course.description.ilike(search_term))
            )
            
        if credits:
            query = query.filter_by(credits=credits)
            
        if semester:
            query = query.filter_by(semester=semester)
            
        if min_capacity:
            query = query.filter(Course.capacity >= int(min_capacity))
            
        if max_capacity:
            query = query.filter(Course.capacity <= int(max_capacity))
        
        # Execute the query
        courses = query.all()
        
        # Return the courses
        return jsonify({
            'status': 'success',
            'data': [course.to_dict() for course in courses]
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@courses_bp.route('/<int:course_id>', methods=['GET'])
@jwt_required()
def get_course(course_id):
    try:
        course = Course.query.get(course_id)
        if not course:
            return jsonify({
                'status': 'error',
                'message': 'Course not found'
            }), 404
        
        return jsonify({
            'status': 'success',
            'data': course.to_dict()
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@courses_bp.route('/', methods=['POST'])
@jwt_required()
def create_course():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'User not found'
            }), 404
        
        # Only faculty and admin can create courses
        if user.role not in [UserRole.FACULTY, UserRole.ADMIN]:
            return jsonify({
                'status': 'error',
                'message': 'Unauthorized to create courses'
            }), 403
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['course_code', 'title', 'credits', 'department']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'Missing required field: {field}'
                }), 400
        
        # Check if course code already exists
        existing_course = Course.query.filter_by(course_code=data['course_code']).first()
        if existing_course:
            return jsonify({
                'status': 'error',
                'message': 'Course code already exists'
            }), 400
        
        # Create the course
        course = Course(
            course_code=data['course_code'],
            title=data['title'],
            description=data.get('description'),
            credits=data['credits'],
            department=data['department'],
            prerequisites=data.get('prerequisites'),
            capacity=data.get('capacity', 30),
            created_by=current_user_id
        )
        
        db.session.add(course)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Course created successfully',
            'data': course.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@courses_bp.route('/approvals', methods=['GET'])
@jwt_required()
def get_course_approvals():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'User not found'
            }), 404
        
        # Get approvals based on user role
        if user.role == UserRole.DEPARTMENT_HEAD:
            approvals = CourseApproval.query.filter_by(approved_by=None).all()
        elif user.role == UserRole.FACULTY:
            approvals = CourseApproval.query.filter_by(requested_by=current_user_id).all()
        else:
            return jsonify({
                'status': 'error',
                'message': 'Unauthorized to view approvals'
            }), 403
        
        return jsonify({
            'status': 'success',
            'data': [approval.to_dict() for approval in approvals]
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@courses_bp.route('/department-head/approvals', methods=['GET'])
@jwt_required()
def get_department_head_approvals():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != UserRole.DEPARTMENT_HEAD:
            return jsonify({
                'status': 'error',
                'message': 'Unauthorized to view approvals'
            }), 403
        
        # Get all pending approvals
        approvals = CourseApproval.query.filter_by(approved_by=None).all()
        
        return jsonify({
            'status': 'success',
            'data': [approval.to_dict() for approval in approvals]
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@courses_bp.route('/approvals/<int:approval_id>', methods=['PUT'])
@jwt_required()
def update_course_approval(approval_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != UserRole.DEPARTMENT_HEAD:
            return jsonify({
                'status': 'error',
                'message': 'Unauthorized to update approvals'
            }), 403
        
        approval = CourseApproval.query.get(approval_id)
        if not approval:
            return jsonify({
                'status': 'error',
                'message': 'Approval not found'
            }), 404
        
        data = request.get_json()
        
        if 'status' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Missing required field: status'
            }), 400
        
        # Update the approval
        approval.status = ApprovalStatus(data['status'])
        approval.approved_by = current_user_id
        approval.comments = data.get('comments')
        approval.updated_at = datetime.utcnow()
        
        # If approved, update the course
        if approval.status == ApprovalStatus.APPROVED:
            course = Course.query.get(approval.course_id)
            if course:
                course.is_active = True
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Approval updated successfully',
            'data': approval.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@courses_bp.route('/enrollments', methods=['POST'])
@jwt_required()
def enroll_in_course():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != UserRole.STUDENT:
            return jsonify({
                'status': 'error',
                'message': 'Only students can enroll in courses'
            }), 403
        
        data = request.get_json()
        
        if 'course_id' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Missing required field: course_id'
            }), 400
        
        course = Course.query.get(data['course_id'])
        if not course:
            return jsonify({
                'status': 'error',
                'message': 'Course not found'
            }), 404
        
        # Check if course is active
        if not course.is_active:
            return jsonify({
                'status': 'error',
                'message': 'Course is not active'
            }), 400
        
        # Check if student is already enrolled
        existing_enrollment = Enrollment.query.filter_by(
            student_id=user.student_profile.id,
            course_id=course.id
        ).first()
        
        if existing_enrollment:
            return jsonify({
                'status': 'error',
                'message': 'Already enrolled in this course'
            }), 400
        
        # Check if course is full
        current_enrollments = Enrollment.query.filter_by(course_id=course.id).count()
        if current_enrollments >= course.capacity:
            return jsonify({
                'status': 'error',
                'message': 'Course is full'
            }), 400
        
        # Create enrollment
        enrollment = Enrollment(
            student_id=user.student_profile.id,
            course_id=course.id
        )
        
        db.session.add(enrollment)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Successfully enrolled in course',
            'data': enrollment.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@courses_bp.route('/enrollments', methods=['GET'])
@jwt_required()
def get_enrollments():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'User not found'
            }), 404
        
        # Get enrollments based on user role
        if user.role == UserRole.STUDENT:
            enrollments = Enrollment.query.filter_by(student_id=user.student_profile.id).all()
        elif user.role == UserRole.FACULTY:
            # Get courses taught by the faculty
            taught_course_ids = [c.id for c in user.courses]
            enrollments = Enrollment.query.filter(Enrollment.course_id.in_(taught_course_ids)).all()
        else:
            return jsonify({
                'status': 'error',
                'message': 'Unauthorized to view enrollments'
            }), 403
        
        return jsonify({
            'status': 'success',
            'data': [enrollment.to_dict() for enrollment in enrollments]
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500 