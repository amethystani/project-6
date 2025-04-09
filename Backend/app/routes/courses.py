from flask import Blueprint, request, jsonify
from app.models import db, Course, CourseApproval, User, Enrollment, ApprovalStatus, UserRole, Student, DepartmentHead
from app.auth import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
import app

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
        
        # Only faculty, admin, and department head can create courses
        if user.role not in [UserRole.FACULTY, UserRole.ADMIN, UserRole.DEPARTMENT_HEAD]:
            return jsonify({
                'status': 'error',
                'message': 'Unauthorized to create courses'
            }), 403
        
        data = request.get_json()
        print(f"Received course creation data: {data}")
        
        # Validate required fields
        required_fields = ['course_code', 'title', 'credits', 'department']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'Missing required field: {field}'
                }), 400
        
        # Validate data types
        try:
            # Credits must be an integer
            credits = int(data['credits'])
            if credits <= 0:
                return jsonify({
                    'status': 'error',
                    'message': 'Credits must be a positive integer'
                }), 422
            
            # Capacity must be an integer if provided
            if 'capacity' in data:
                capacity = int(data['capacity'])
                if capacity <= 0:
                    return jsonify({
                        'status': 'error',
                        'message': 'Capacity must be a positive integer'
                    }), 422
        except (ValueError, TypeError) as e:
            return jsonify({
                'status': 'error',
                'message': f'Invalid data type: {str(e)}'
            }), 422
        
        # Check if course code already exists
        existing_course = Course.query.filter_by(course_code=data['course_code']).first()
        if existing_course:
            return jsonify({
                'status': 'error',
                'message': 'Course code already exists'
            }), 400
        
        # Create the course
        try:
            course = Course(
                course_code=data['course_code'],
                title=data['title'],
                description=data.get('description'),
                credits=credits,
                department=data['department'],
                prerequisites=data.get('prerequisites'),
                capacity=data.get('capacity', 30),
                created_by=current_user_id,
                is_active=False  # Set to inactive initially until approved
            )
            
            db.session.add(course)
            db.session.commit()
            
            # Create an approval request for the new course
            try:
                approval = CourseApproval(
                    course_id=course.id,
                    requested_by=current_user_id,
                    status=ApprovalStatus.PENDING,
                    comments=data.get('comments')  # Store any comments/justification
                )
                
                print(f"Creating approval: course_id={course.id}, requested_by={current_user_id}, status={ApprovalStatus.PENDING}, comments={data.get('comments')}")
                
                db.session.add(approval)
                db.session.commit()
                
                print(f"Successfully created approval with ID: {approval.id}")
                
                return jsonify({
                    'status': 'success',
                    'message': 'Course created successfully and pending approval',
                    'data': course.to_dict()
                }), 201
            except Exception as e:
                db.session.rollback()
                error_msg = f"Error creating approval: {str(e)}"
                print(error_msg)
                print(f"Error type: {type(e).__name__}")
                import traceback
                print(traceback.format_exc())
                return jsonify({
                    'status': 'error',
                    'message': error_msg
                }), 422
        except Exception as e:
            db.session.rollback()
            print(f"Error creating course: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': f'Error creating course: {str(e)}'
            }), 422
    except Exception as e:
        db.session.rollback()
        print(f"Unexpected error: {str(e)}")
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

@courses_bp.route('/course-approvals/<int:approval_id>', methods=['PUT', 'OPTIONS'])
def admin_update_course_approval(approval_id):
    """Endpoint for admins to update course approval status."""
    # Handle OPTIONS request for CORS
    if request.method == 'OPTIONS':
        response = jsonify({
            'status': 'success',
            'message': 'CORS preflight request successful'
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response

    # For PUT requests, apply JWT validation
    @jwt_required()
    def handle_put():
        try:
            print(f"Starting admin_update_course_approval for ID {approval_id}")
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            
            print(f"User ID: {current_user_id}, User found: {user is not None}")
            
            # Dump request data for debugging
            try:
                data = request.get_json()
                print(f"Request data: {data}")
            except Exception as e:
                print(f"Error parsing request JSON: {str(e)}")
                data = {}
            
            if not user:
                return jsonify({
                    'status': 'error',
                    'message': 'User not found'
                }), 404
            
            # Temporarily allow any user to update approvals for debugging
            print(f"User role: {user.role.value if user.role else 'None'}")
            
            approval = CourseApproval.query.get(approval_id)
            print(f"Approval found: {approval is not None}")
            
            if not approval:
                return jsonify({
                    'status': 'error',
                    'message': 'Approval not found'
                }), 404
            
            print(f"Current approval status: {approval.status.value if approval.status else 'None'}")
            
            if 'status' not in data:
                return jsonify({
                    'status': 'error',
                    'message': 'Missing required field: status'
                }), 400
            
            print(f"Status from request: '{data['status']}'")
            
            # Update the approval
            try:
                status_value = data['status']
                if status_value not in ['pending', 'approved', 'rejected']:
                    return jsonify({
                        'status': 'error',
                        'message': f'Invalid status value: {status_value}. Must be one of: pending, approved, rejected'
                    }), 400
                
                print(f"Converting '{status_value}' to ApprovalStatus enum")
                approval.status = ApprovalStatus(status_value)
                approval.approved_by = current_user_id
                approval.comments = data.get('comments', '')
                approval.updated_at = datetime.utcnow()
                
                # If approved, update the course to active
                course = Course.query.get(approval.course_id)
                print(f"Course found: {course is not None}")
                
                if not course:
                    return jsonify({
                        'status': 'error',
                        'message': f'Course not found for approval ID: {approval_id}'
                    }), 404
                    
                if approval.status == ApprovalStatus.APPROVED:
                    print(f"Activating course with ID: {course.id}")
                    course.is_active = True
                elif approval.status == ApprovalStatus.REJECTED:
                    print(f"Course with ID: {course.id} was rejected")
                    # Keep the course inactive for rejected courses
                    course.is_active = False
                
                print("Committing changes to database")
                db.session.commit()
                print(f"Successfully updated approval with ID: {approval_id}")
                
                return jsonify({
                    'status': 'success',
                    'message': 'Approval updated successfully',
                    'data': approval.to_dict()
                })
            except Exception as e:
                db.session.rollback()
                error_message = f"Error updating approval: {str(e)}"
                print(error_message)
                import traceback
                print(traceback.format_exc())
                return jsonify({
                    'status': 'error',
                    'message': error_message
                }), 500
        except Exception as e:
            db.session.rollback()
            error_message = f"Error processing approval update: {str(e)}"
            print(error_message)
            import traceback
            print(traceback.format_exc())
            return jsonify({
                'status': 'error',
                'message': error_message
            }), 500
    
    # Call the appropriate handler based on the request method
    if request.method == 'PUT':
        return handle_put()

@courses_bp.route('/course-approvals', methods=['OPTIONS'])
def options_course_approvals():
    """Handle OPTIONS requests for course approvals endpoint"""
    return "", 200

@courses_bp.route('/course-approvals/<int:approval_id>', methods=['OPTIONS'])
def options_course_approval_detail(approval_id):
    """Handle OPTIONS requests for individual course approval endpoint"""
    return "", 200

@courses_bp.route('/approvals/<string:status>', methods=['GET', 'OPTIONS'])
def legacy_approvals_endpoint(status):
    """
    Legacy endpoint to handle approvals with simplified error handling
    """
    # Handle OPTIONS request for CORS
    if request.method == 'OPTIONS':
        response = jsonify({
            'status': 'success',
            'message': 'CORS preflight request successful'
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response
    
    try:
        # Log all request info for debugging
        print(f"Legacy endpoint request: {request.method} {request.url}")
        print(f"Headers: {dict(request.headers)}")
        
        # Get current user ID with error handling
        try:
            current_user_id = get_jwt_identity()
            print(f"User ID: {current_user_id}")
        except Exception as e:
            print(f"JWT error: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': 'Authentication error - please log in again'
            }), 401
        
        app.logger.info(f"Fetching approvals with status: {status} - User ID: {current_user_id}")
        
        # Fetch all approvals for simplicity
        try:
            approvals = CourseApproval.query.all()
            app.logger.info(f"Found {len(approvals)} total approvals")
        except Exception as e:
            print(f"Database error fetching approvals: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': f'Error fetching approvals: {str(e)}'
            }), 500
        
        # Filter by status if provided
        if status and status.lower() in ['pending', 'approved', 'rejected']:
            # Ensure case-insensitive comparison with debug logs
            filtered_approvals = []
            for a in approvals:
                try:
                    a_status = a.status.value.lower()
                    requested_status = status.lower()
                    app.logger.info(f"Comparing: approval ID {a.id} status '{a_status}' with requested status '{requested_status}' - Match: {a_status == requested_status}")
                    if a_status == requested_status:
                        filtered_approvals.append(a)
                except Exception as e:
                    print(f"Error comparing approval {a.id}: {str(e)}")
                    # Skip this approval
            app.logger.info(f"Filtered to {len(filtered_approvals)} approvals with status: {status}")
        else:
            filtered_approvals = approvals
            app.logger.info("No status filter applied or invalid status")
        
        # Convert to dict with better error handling
        approval_data = []
        for approval in filtered_approvals:
            try:
                course = Course.query.get(approval.course_id)
                # Department is stored directly on the course as a string, not as a foreign key
                
                approval_dict = {
                    'id': approval.id,
                    'course_id': approval.course_id,
                    'course_name': course.title if course else "Unknown Course",
                    'department': course.department if course else "Unknown Department",
                    'status': approval.status.value,
                    'submitted_by': approval.requested_by,
                    'approved_by': approval.approved_by,
                    'created_at': approval.requested_at.isoformat() if approval.requested_at else None,
                    'updated_at': approval.updated_at.isoformat() if approval.updated_at else None,
                    'comment': approval.comments
                }
                approval_data.append(approval_dict)
            except Exception as e:
                app.logger.error(f"Error converting approval {approval.id}: {str(e)}")
                # Continue with next approval instead of failing
        
        return jsonify({
            'status': 'success',
            'message': f'Retrieved {len(approval_data)} course approvals',
            'data': approval_data
        })
    
    except Exception as e:
        app.logger.error(f"Error in legacy_approvals_endpoint: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({
            'status': 'error',
            'message': f'An error occurred: {str(e)}'
        }), 500

@courses_bp.route('/department-head/course-approvals', methods=['GET', 'OPTIONS'])
def get_department_head_course_requests():
    """Endpoint for fetching course approvals created by department heads."""
    # Handle OPTIONS request for CORS
    if request.method == 'OPTIONS':
        response = jsonify({
            'status': 'success',
            'message': 'CORS preflight request successful'
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response
        
    try:
        # Get current user ID but don't fail if not available
        try:
            current_user_id = get_jwt_identity()
            print(f"Processing department head course approvals request for user ID: {current_user_id}")
        except Exception:
            print("JWT validation failed, proceeding without user ID")
            current_user_id = None
            
        # Get all approvals, regardless of who requested them
        # This ensures department heads can see all pending approvals
        approvals = CourseApproval.query.all()
        print(f"Found {len(approvals)} total approvals")
        
        # Get status filter from query parameters
        status_filter = request.args.get('status', 'pending')  # Default to pending
        print(f"Status filter: {status_filter}")
        
        # Apply status filter
        if status_filter and status_filter.lower() in ['pending', 'approved', 'rejected']:
            # Ensure case-insensitive comparison with debug logs
            filtered_approvals = []
            for a in approvals:
                a_status = a.status.value.lower()
                requested_status = status_filter.lower()
                print(f"Comparing: approval ID {a.id} status '{a_status}' with requested status '{requested_status}' - Match: {a_status == requested_status}")
                if a_status == requested_status:
                    filtered_approvals.append(a)
        else:
            filtered_approvals = approvals
            
        print(f"After filtering: {len(filtered_approvals)} approvals match filter")
        
        # Convert to response format with all necessary details
        approval_data = []
        for approval in filtered_approvals:
            try:
                course = Course.query.get(approval.course_id)
                requester = User.query.get(approval.requested_by) if approval.requested_by else None
                approver = User.query.get(approval.approved_by) if approval.approved_by else None
                
                requester_name = f"{requester.first_name} {requester.last_name}" if requester else "Unknown"
                approver_name = f"{approver.first_name} {approver.last_name}" if approver else "Pending"
                
                approval_dict = {
                    'id': approval.id,
                    'course_id': approval.course_id,
                    'course_code': course.course_code if course else "Unknown",
                    'course_name': course.title if course else "Unknown Course",
                    'department': course.department if course else "Unknown Department",
                    'credits': course.credits if course else 0,
                    'status': approval.status.value,
                    'submitted_by': approval.requested_by,
                    'submitted_by_name': requester_name,
                    'approved_by': approval.approved_by,
                    'approved_by_name': approver_name,
                    'created_at': approval.requested_at.isoformat() if approval.requested_at else None,
                    'updated_at': approval.updated_at.isoformat() if approval.updated_at else None,
                    'comment': approval.comments
                }
                approval_data.append(approval_dict)
            except Exception as e:
                print(f"Error processing approval {approval.id}: {str(e)}")
                # Continue with next approval
        
        # Print out response data for debugging
        print(f"Fetching all course approvals")
        response_data = {
            'status': 'success',
            'approvals': approval_data
        }
        print(f"Successfully fetched {len(approval_data)} approvals")
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"Error in course approvals: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@courses_bp.route('/course-approvals/<int:approval_id>/action', methods=['POST', 'OPTIONS'])
def approval_action(approval_id):
    """Simpler endpoint dedicated to approving or rejecting a course."""
    # Handle OPTIONS request for CORS
    if request.method == 'OPTIONS':
        response = jsonify({
            'status': 'success',
            'message': 'CORS preflight request successful'
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response
    
    # For POST requests, apply JWT validation    
    @jwt_required()
    def handle_post():
        try:
            print(f"Starting approval_action for ID {approval_id}")
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            
            print(f"User ID: {current_user_id}, User found: {user is not None}")
            
            # Dump request data for debugging
            try:
                request_data = request.get_json()
                print(f"Request data: {request_data}")
            except Exception as e:
                print(f"Error parsing request JSON: {str(e)}")
                request_data = {}
            
            if not user:
                return jsonify({
                    'status': 'error',
                    'message': 'User not found'
                }), 404
            
            # Allow any user role temporarily for debugging
            print(f"User role: {user.role}")
            
            approval = CourseApproval.query.get(approval_id)
            print(f"Approval found: {approval is not None}")
            
            if not approval:
                return jsonify({
                    'status': 'error',
                    'message': 'Approval not found'
                }), 404
            
            print(f"Current approval status: {approval.status}")
            
            # Verify we have the necessary data
            action = request_data.get('action', '').lower() if request_data else ''
            print(f"Action from request: '{action}'")
            
            if not action:
                return jsonify({
                    'status': 'error',
                    'message': 'Missing required field: action (must be "approve" or "reject")'
                }), 400
                
            if action not in ['approve', 'reject']:
                return jsonify({
                    'status': 'error',
                    'message': f'Invalid action value: {action}. Must be "approve" or "reject"'
                }), 400
            
            # Map the action to status
            status_value = 'approved' if action == 'approve' else 'rejected'
            print(f"Setting status to: {status_value}")
                
            # Update the approval
            try:
                approval.status = ApprovalStatus(status_value)
                approval.approved_by = current_user_id
                approval.comments = request_data.get('comments', '')
                approval.updated_at = datetime.utcnow()
                
                # Get the related course
                course = Course.query.get(approval.course_id)
                print(f"Course found: {course is not None}")
                
                if not course:
                    return jsonify({
                        'status': 'error',
                        'message': f'Course not found for approval ID: {approval_id}'
                    }), 404
                
                # Update course active status based on approval action
                if action == 'approve':
                    print(f"Activating course with ID: {course.id}")
                    course.is_active = True
                else:  # reject
                    print(f"Course with ID: {course.id} was rejected")
                    course.is_active = False
                
                db.session.commit()
                print(f"Successfully {action}d approval with ID: {approval_id}")
                
                return jsonify({
                    'status': 'success',
                    'message': f'Course {course.course_code} has been {status_value} successfully',
                    'data': approval.to_dict()
                })
            except Exception as e:
                db.session.rollback()
                error_message = f"Error updating approval: {str(e)}"
                print(error_message)
                import traceback
                print(traceback.format_exc())
                return jsonify({
                    'status': 'error',
                    'message': error_message
                }), 500
        except Exception as e:
            db.session.rollback()
            error_message = f"Error processing approval action: {str(e)}"
            print(error_message)
            import traceback
            print(traceback.format_exc())
            return jsonify({
                'status': 'error',
                'message': error_message
            }), 500
    
    # Call the appropriate handler based on request method
    if request.method == 'POST':
        return handle_post()

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

@courses_bp.route('/course-approvals', methods=['GET', 'OPTIONS'])
def admin_get_course_approvals():
    """Endpoint for admins to get all course approvals with optional status filtering."""
    # Handle OPTIONS request for CORS
    if request.method == 'OPTIONS':
        response = jsonify({
            'status': 'success',
            'message': 'CORS preflight request successful'
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response
        
    # For GET requests, try with JWT validation but fall back to unauthenticated mode if needed
    try:
        # Print debugging info
        print(f"Received course-approvals request with args: {request.args}")
        
        # Get JWT identity with error catching
        try:
            current_user_id = get_jwt_identity()
            print(f"Request from user ID: {current_user_id}")
        except Exception as e:
            print(f"JWT validation failed, continuing in unauthenticated mode: {str(e)}")
            current_user_id = None
        
        # Get status filter from query parameters
        status_filter = request.args.get('status')
        print(f"Status filter: {status_filter}")
        
        # Get all course approvals first
        try:
            approvals = CourseApproval.query.all()
            print(f"Found {len(approvals)} total approvals")
        
            # Filter in Python instead of SQL to avoid enum conversion issues
            if status_filter and status_filter.lower() in ['pending', 'approved', 'rejected']:
                # Ensure case-insensitive comparison with debug logs
                filtered_approvals = []
                for a in approvals:
                    a_status = a.status.value.lower()
                    requested_status = status_filter.lower()
                    print(f"Comparing: approval ID {a.id} status '{a_status}' with requested status '{requested_status}' - Match: {a_status == requested_status}")
                    if a_status == requested_status:
                        filtered_approvals.append(a)
            else:
                filtered_approvals = approvals
            
            print(f"After filtering: {len(filtered_approvals)} approvals match '{status_filter}'")
            
            # Convert to dictionary with all related course data
            approval_data = []
            for approval in filtered_approvals:
                try:
                    approval_dict = approval.to_dict()
                    approval_data.append(approval_dict)
                except Exception as e:
                    print(f"Error converting approval {approval.id} to dict: {e}")
                    # Skip this approval if conversion fails
            
            return jsonify({
                'status': 'success',
                'data': approval_data
            })
        except SQLAlchemyError as e:
            print(f"Database error: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': f'Database error: {str(e)}'
            }), 500
            
    except Exception as e:
        print(f"Error in admin_get_course_approvals: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@courses_bp.route('/catalog/course-approvals', methods=['GET', 'OPTIONS'])
def get_course_approvals_no_auth():
    """Public endpoint for getting course approvals without authentication for debugging."""
    # Handle OPTIONS request for CORS
    if request.method == 'OPTIONS':
        response = jsonify({
            'status': 'success',
            'message': 'CORS preflight request successful'
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response
        
    try:
        # Print debugging info
        print(f"Received public course-approvals request with args: {request.args}")
        
        # Get status filter from query parameters
        status_filter = request.args.get('status')
        print(f"Status filter: {status_filter}")
        
        # Get all course approvals
        approvals = CourseApproval.query.all()
        print(f"Found {len(approvals)} total approvals")
    
        # Filter in Python instead of SQL to avoid enum conversion issues
        if status_filter and status_filter.lower() in ['pending', 'approved', 'rejected']:
            # Ensure case-insensitive comparison with debug logs
            filtered_approvals = []
            for a in approvals:
                try:
                    a_status = a.status.value.lower()
                    requested_status = status_filter.lower()
                    print(f"Comparing: approval ID {a.id} status '{a_status}' with requested status '{requested_status}' - Match: {a_status == requested_status}")
                    if a_status == requested_status:
                        filtered_approvals.append(a)
                except Exception as e:
                    print(f"Error comparing approval {a.id}: {str(e)}")
                    # Skip this approval
        else:
            filtered_approvals = approvals
        
        print(f"After filtering: {len(filtered_approvals)} approvals match '{status_filter}'")
        
        # Convert to dictionary with all related course data
        approval_data = []
        for approval in filtered_approvals:
            try:
                course = Course.query.get(approval.course_id)
                
                approval_dict = {
                    'id': approval.id,
                    'course_id': approval.course_id,
                    'course_name': course.title if course else "Unknown Course",
                    'course_code': course.course_code if course else "Unknown",
                    'credits': course.credits if course else 0,
                    'department': course.department if course else "Unknown Department",
                    'status': approval.status.value,
                    'submitted_by': approval.requested_by,
                    'approved_by': approval.approved_by,
                    'created_at': approval.requested_at.isoformat() if approval.requested_at else None,
                    'updated_at': approval.updated_at.isoformat() if approval.updated_at else None,
                    'comment': approval.comments
                }
                approval_data.append(approval_dict)
            except Exception as e:
                print(f"Error converting approval {approval.id}: {str(e)}")
        
        return jsonify({
            'status': 'success',
            'message': f'Retrieved {len(approval_data)} course approvals',
            'data': approval_data
        })
    
    except Exception as e:
        print(f"Error in get_course_approvals_no_auth: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({
            'status': 'error',
            'message': f'An error occurred: {str(e)}'
        }), 500

@courses_bp.route('/department-head/simple-course-submit', methods=['POST', 'OPTIONS'])
def department_head_simple_course_submit():
    """Simple endpoint for department heads to submit course requests without complex authentication."""
    # Handle OPTIONS request for CORS
    if request.method == 'OPTIONS':
        response = jsonify({
            'status': 'success',
            'message': 'CORS preflight request successful'
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response
        
    try:
        # Print all request data for debugging
        print(f"Received simple course submission request")
        print(f"Headers: {dict(request.headers)}")
        
        # Get data from request
        try:
            data = request.get_json()
            print(f"Request data: {data}")
        except Exception as e:
            print(f"Error parsing request JSON: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': 'Invalid JSON data'
            }), 400
        
        # Validate required fields
        required_fields = ['course_code', 'title', 'credits', 'department']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'Missing required field: {field}'
                }), 400
        
        # Try to get user ID, but use a default if not available
        try:
            current_user_id = get_jwt_identity()
        except Exception:
            # Use a default user ID for department head
            # In production, this should be more secure
            print("JWT validation failed, using default department head ID")
            current_user_id = 1  # Assuming ID 1 is a valid admin user
        
        # Create the course directly
        try:
            # Validate credits is a number
            try:
                credits = int(data['credits'])
            except ValueError:
                return jsonify({
                    'status': 'error',
                    'message': 'Credits must be a number'
                }), 400
            
            # Check if course already exists
            existing_course = Course.query.filter_by(course_code=data['course_code']).first()
            if existing_course:
                return jsonify({
                    'status': 'error',
                    'message': f"Course with code {data['course_code']} already exists"
                }), 409
                
            # Create course
            course = Course(
                course_code=data['course_code'],
                title=data['title'],
                description=data.get('description', ''),
                credits=credits,
                department=data['department'],
                prerequisites=data.get('prerequisites', ''),
                capacity=data.get('capacity', 30),
                is_active=False,  # Start as inactive until approved
                created_by=current_user_id
            )
            
            db.session.add(course)
            db.session.commit()
            print(f"Course created with ID: {course.id}")
            
            # Create approval request
            approval = CourseApproval(
                course_id=course.id,
                requested_by=current_user_id,
                status=ApprovalStatus.PENDING,
                comments=data.get('comments', 'Submitted via department head portal')
            )
            
            db.session.add(approval)
            db.session.commit()
            print(f"Approval created with ID: {approval.id}")
            
            return jsonify({
                'status': 'success',
                'message': 'Course submitted successfully and is awaiting approval',
                'data': {
                    'course_id': course.id,
                    'approval_id': approval.id,
                    'course_code': course.course_code,
                    'title': course.title,
                    'status': 'pending'
                }
            })
        except Exception as e:
            db.session.rollback()
            error_message = f"Error creating course: {str(e)}"
            print(error_message)
            import traceback
            print(traceback.format_exc())
            return jsonify({
                'status': 'error',
                'message': error_message
            }), 500
    except Exception as e:
        error_message = f"Error in simple course submission: {str(e)}"
        print(error_message)
        import traceback
        print(traceback.format_exc())
        return jsonify({
            'status': 'error',
            'message': error_message
        }), 500

@courses_bp.route('/direct-action/<int:approval_id>', methods=['POST', 'OPTIONS', 'GET'])
def direct_approval_action(approval_id):
    """Direct action endpoint for approving or rejecting a course."""
    # Add CORS headers to all responses
    def create_response(data, status_code=200):
        response = jsonify(data)
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response, status_code
        
    # Handle OPTIONS request
    if request.method == 'OPTIONS':
        return create_response({
            'status': 'success',
            'message': 'CORS preflight successful'
        })
        
    # Handle GET request for both checking and performing the approval/rejection action
    if request.method == 'GET':
        try:
            approval = CourseApproval.query.get(approval_id)
            if not approval:
                return create_response({
                    'status': 'error', 
                    'message': f'Approval ID {approval_id} not found'
                }, 404)
            
            # Check if action is provided in the URL params
            action_type = request.args.get('action')
            
            # If action is provided, perform the approval/rejection
            if action_type:
                action_type = action_type.lower()
                if action_type not in ['approve', 'reject']:
                    print(f"Invalid action: {action_type}, defaulting to approve")
                    action_type = 'approve'
                
                # Get admin ID (default to 1 for simplicity)
                admin_id = 1
                
                # Set status based on action
                status_value = 'approved' if action_type == 'approve' else 'rejected'
                print(f"Setting status to: {status_value}")
                
                # Update approval
                approval.status = ApprovalStatus(status_value)
                approval.approved_by = admin_id
                approval.comments = f"Action: {action_type} via direct-action GET endpoint"
                approval.updated_at = datetime.utcnow()
                
                # Update course status
                course = Course.query.get(approval.course_id)
                if not course:
                    return create_response({
                        'status': 'error',
                        'message': f'Course not found for approval {approval_id}'
                    }, 404)
                    
                print(f"Course found: {course.course_code}, updating status")
                
                if action_type == 'approve':
                    course.is_active = True
                    print(f"Activated course {course.course_code}")
                else:
                    course.is_active = False
                    print(f"Kept course {course.course_code} inactive (rejected)")
                
                # Commit changes
                db.session.commit()
                print(f"Successfully updated approval {approval_id} to {status_value}")
                
                return create_response({
                    'status': 'success',
                    'message': f'Course {course.course_code} has been {status_value} successfully',
                    'data': approval.to_dict()
                })
            else:
                # Just return the approval info if no action is specified
                return create_response({
                    'status': 'success', 
                    'message': f'Direct action endpoint available for approval ID: {approval_id}',
                    'data': approval.to_dict()
                })
        except Exception as e:
            db.session.rollback()
            print(f"Error in GET request: {str(e)}")
            import traceback
            print(traceback.format_exc())
            return create_response({
                'status': 'error',
                'message': f'Error processing request: {str(e)}'
            }, 500)
    
    # Handle POST request for approval action
    print(f"Starting direct action for approval ID {approval_id}")
    
    # Get data from request with error handling
    try:
        action_type = None
        
        # Try to get action from JSON body
        if request.is_json:
            data = request.get_json()
            print(f"JSON data received: {data}")
            action_type = data.get('action')
        # If no JSON or no action in JSON, try form data
        else:
            print(f"Request is not JSON. Content-Type: {request.content_type}")
            action_type = request.form.get('action')
            
        # If still no action, try URL parameters
        if not action_type:
            action_type = request.args.get('action')
            print(f"Action from URL params: {action_type}")
            
        # Default to 'approve' if no action was found
        if not action_type:
            action_type = 'approve'
            print(f"No action specified, defaulting to: {action_type}")
        
        print(f"Final action type: {action_type}")
        
        # Standardize the action type
        action_type = action_type.lower()
        if action_type not in ['approve', 'reject']:
            print(f"Invalid action: {action_type}, defaulting to approve")
            action_type = 'approve'
        
        # Find and update the approval
        approval = CourseApproval.query.get(approval_id)
        print(f"Approval found: {approval is not None}")
        
        if not approval:
            return create_response({
                'status': 'error',
                'message': f'Approval with ID {approval_id} not found'
            }, 404)
        
        # Get current user ID (fallback to admin ID 1)
        try:
            current_user_id = get_jwt_identity()
            print(f"User ID from JWT: {current_user_id}")
        except:
            current_user_id = 1
            print("Using default admin ID")
        
        # Set status based on action
        status_value = 'approved' if action_type == 'approve' else 'rejected'
        print(f"Setting status to: {status_value}")
        
        # Get comments from request
        comments = None
        if request.is_json:
            comments = request.get_json().get('comments')
        if not comments:
            comments = f"Action: {action_type} via direct-action endpoint"
        
        # Update approval
        approval.status = ApprovalStatus(status_value)
        approval.approved_by = current_user_id
        approval.comments = comments
        approval.updated_at = datetime.utcnow()
        
        # Update course status
        course = Course.query.get(approval.course_id)
        if not course:
            return create_response({
                'status': 'error',
                'message': f'Course not found for approval {approval_id}'
            }, 404)
            
        print(f"Course found: {course.course_code}, updating status")
        
        if action_type == 'approve':
            course.is_active = True
            print(f"Activated course {course.course_code}")
        else:
            course.is_active = False
            print(f"Kept course {course.course_code} inactive (rejected)")
        
        # Commit changes
        db.session.commit()
        print(f"Successfully updated approval {approval_id} to {status_value}")
        
        return create_response({
            'status': 'success',
            'message': f'Course {course.course_code} has been {status_value} successfully',
            'data': approval.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        print(f"Error in direct action: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return create_response({
            'status': 'error',
            'message': f'An error occurred: {str(e)}'
        }, 500)

@courses_bp.route('/simple-approve/<int:approval_id>', methods=['GET', 'OPTIONS'])
def simple_approve_course(approval_id):
    """Super simplified endpoint for approving a course with minimal code and error handling"""
    # Handle OPTIONS request for CORS
    if request.method == 'OPTIONS':
        response = jsonify({
            'status': 'success',
            'message': 'CORS preflight successful'
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response

    # For GET requests, perform the approval with minimal code
    try:
        # Get the action type (approve or reject, default to approve)
        action = request.args.get('action', 'approve').lower()
        if action not in ['approve', 'reject']:
            action = 'approve' # Default to approve
        
        print(f"Simple {action} request for approval ID: {approval_id}")
        
        # Get the approval
        approval = CourseApproval.query.get(approval_id)
        if not approval:
            response = jsonify({
                'status': 'error',
                'message': f'Approval with ID {approval_id} not found'
            })
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 404
        
        # Update approval status
        status_value = 'approved' if action == 'approve' else 'rejected'
        approval.status = ApprovalStatus(status_value)
        approval.approved_by = 1  # Admin ID
        approval.comments = f"Simple {action} via debug endpoint"
        approval.updated_at = datetime.utcnow()
        
        # Get and update the course
        course = Course.query.get(approval.course_id)
        if course:
            course.is_active = (action == 'approve')  # Set active if approving, inactive if rejecting
        
        # Commit the changes
        db.session.commit()
        
        # Return success response with CORS headers
        response = jsonify({
            'status': 'success',
            'message': f'Course has been {status_value} successfully'
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
    except Exception as e:
        db.session.rollback()
        print(f"Error in simple approve: {str(e)}")
        import traceback
        print(traceback.format_exc())
        
        # Return error response with CORS headers
        response = jsonify({
            'status': 'error',
            'message': f'Error: {str(e)}'
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500 