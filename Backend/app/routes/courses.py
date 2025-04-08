from flask import Blueprint, request, jsonify
from app.models import db, Course, CourseApproval, User, Enrollment, ApprovalStatus, UserRole, Student
from app.auth import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime

courses_bp = Blueprint('courses', __name__)

# Route to get all courses
@courses_bp.route('/courses', methods=['GET'])
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
        
        courses = query.all()
        return jsonify({
            'status': 'success',
            'data': [course.to_dict() for course in courses]
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

# Route to get a specific course
@courses_bp.route('/courses/<int:course_id>', methods=['GET'])
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
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

# Route to create a new course (only for department heads)
@courses_bp.route('/courses', methods=['POST'])
@jwt_required()
def create_course():
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Check if user is department head
        if user.role != UserRole.DEPARTMENT_HEAD:
            return jsonify({
                'status': 'error',
                'message': 'Only department heads can create courses'
            }), 403
            
        # Get request data
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['course_code', 'title', 'credits', 'department']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'Missing required field: {field}'
                }), 400
                
        # Create new course
        new_course = Course(
            course_code=data['course_code'],
            title=data['title'],
            description=data.get('description', ''),
            credits=data['credits'],
            department=data['department'],
            prerequisites=data.get('prerequisites', ''),
            capacity=data.get('capacity', 30),
            is_active=False,  # Course is not active until approved
            created_by=current_user_id
        )
        
        db.session.add(new_course)
        db.session.flush()  # This assigns the ID to new_course
        
        # Create approval request
        approval_request = CourseApproval(
            course_id=new_course.id,
            requested_by=current_user_id,
            status=ApprovalStatus.PENDING
        )
        
        db.session.add(approval_request)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Course created and pending approval',
            'data': {
                'course': new_course.to_dict(),
                'approval': approval_request.to_dict()
            }
        }), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

# Route to get all approval requests (admin only)
@courses_bp.route('/course-approvals', methods=['GET'])
@jwt_required()
def get_course_approvals():
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Check if user is admin
        if user.role != UserRole.ADMIN:
            return jsonify({
                'status': 'error',
                'message': 'Only admins can view all approval requests'
            }), 403
            
        # Get status filter
        status = request.args.get('status')
        
        # Build query
        query = CourseApproval.query
        
        if status:
            query = query.filter_by(status=ApprovalStatus(status))
            
        approvals = query.all()
        
        return jsonify({
            'status': 'success',
            'data': [approval.to_dict() for approval in approvals]
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

# Route to get approval requests for a specific department head
@courses_bp.route('/department-head/course-approvals', methods=['GET'])
@jwt_required()
def get_department_head_approvals():
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Check if user is department head
        if user.role != UserRole.DEPARTMENT_HEAD:
            return jsonify({
                'status': 'error',
                'message': 'Only department heads can access this endpoint'
            }), 403
            
        # Get approvals for courses created by this department head
        approvals = CourseApproval.query.join(Course).filter(Course.created_by == current_user_id).all()
        
        return jsonify({
            'status': 'success',
            'data': [approval.to_dict() for approval in approvals]
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

# Route to approve or reject a course (admin only)
@courses_bp.route('/course-approvals/<int:approval_id>', methods=['PUT'])
@jwt_required()
def update_course_approval(approval_id):
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Check if user is admin
        if user.role != UserRole.ADMIN:
            return jsonify({
                'status': 'error',
                'message': 'Only admins can approve or reject courses'
            }), 403
            
        # Get approval request
        approval = CourseApproval.query.get(approval_id)
        if not approval:
            return jsonify({
                'status': 'error',
                'message': 'Approval request not found'
            }), 404
            
        # Get request data
        data = request.get_json()
        
        if 'status' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Missing status field'
            }), 400
            
        # Update approval status
        try:
            new_status = ApprovalStatus(data['status'])
            approval.status = new_status
            approval.approved_by = current_user_id
            approval.comments = data.get('comments', '')
            approval.updated_at = datetime.utcnow()
            
            # If approved, activate the course
            if new_status == ApprovalStatus.APPROVED:
                course = Course.query.get(approval.course_id)
                course.is_active = True
                
            db.session.commit()
            
            return jsonify({
                'status': 'success',
                'message': f'Course {new_status.value}',
                'data': approval.to_dict()
            }), 200
        except ValueError:
            return jsonify({
                'status': 'error',
                'message': 'Invalid status value'
            }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

# Route to enroll a student in a course
@courses_bp.route('/enrollments', methods=['POST'])
@jwt_required()
def enroll_in_course():
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Check if user is a student
        if user.role != UserRole.STUDENT:
            return jsonify({
                'status': 'error',
                'message': 'Only students can enroll in courses'
            }), 403
            
        # Get student profile or create one if it doesn't exist
        student = user.student_profile
        if not student:
            # Create a new student profile
            new_student = Student(
                user_id=user.id,
                student_id=f"S{user.id:06d}",  # Generate a student ID
                program="Undeclared",
                year_level=1
            )
            db.session.add(new_student)
            db.session.commit()
            student = new_student
            
        # Get request data
        data = request.get_json()
        
        if 'course_id' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Missing course_id field'
            }), 400
            
        course_id = data['course_id']
        
        # Check if course exists and is active
        course = Course.query.get(course_id)
        if not course:
            return jsonify({
                'status': 'error',
                'message': 'Course not found'
            }), 404
            
        if not course.is_active:
            return jsonify({
                'status': 'error',
                'message': 'Cannot enroll in inactive course'
            }), 400
            
        # Check if student is already enrolled
        existing_enrollment = Enrollment.query.filter_by(
            student_id=student.id,
            course_id=course_id
        ).first()
        
        if existing_enrollment:
            return jsonify({
                'status': 'error',
                'message': 'Already enrolled in this course'
            }), 400
        
        # Check prerequisites
        if course.prerequisites and course.prerequisites.strip() and course.prerequisites.lower() != 'none':
            # Parse prerequisites (comma-separated course codes)
            required_courses = [prereq.strip() for prereq in course.prerequisites.split(',') if prereq.strip() and prereq.lower() != 'none']
            
            if required_courses:  # Only check if there are actual prerequisites
                # Get all courses the student is enrolled in
                student_enrollments = Enrollment.query.filter_by(student_id=student.id).all()
                enrolled_courses = [Course.query.get(enrollment.course_id) for enrollment in student_enrollments]
                enrolled_course_codes = [enrolled_course.course_code for enrolled_course in enrolled_courses if enrolled_course]
                
                # Check if all prerequisites are met
                missing_prerequisites = [prereq for prereq in required_courses if prereq not in enrolled_course_codes]
                
                if missing_prerequisites:
                    print(f"Missing prerequisites: {missing_prerequisites}")
                    return jsonify({
                        'status': 'error',
                        'message': 'Missing prerequisites',
                        'details': {
                            'missing_prerequisites': missing_prerequisites,
                            'required_prerequisites': required_courses
                        }
                    }), 400
            
        # Create enrollment
        enrollment = Enrollment(
            student_id=student.id,
            course_id=course_id
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

# Route to get student enrollments
@courses_bp.route('/enrollments', methods=['GET'])
@jwt_required()
def get_enrollments():
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Check if user is a student
        if user.role != UserRole.STUDENT:
            return jsonify({
                'status': 'error',
                'message': 'Only students can access their enrollments'
            }), 403
            
        # Get student profile
        student = user.student_profile
        if not student:
            return jsonify({
                'status': 'error',
                'message': 'Student profile not found'
            }), 404
            
        # Get enrollments
        enrollments = Enrollment.query.filter_by(student_id=student.id).all()
        
        return jsonify({
            'status': 'success',
            'data': [enrollment.to_dict() for enrollment in enrollments]
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500 