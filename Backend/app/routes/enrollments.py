from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Enrollment, Course, User, Student, UserRole
from sqlalchemy.exc import IntegrityError

enrollments_bp = Blueprint('enrollments', __name__)

@enrollments_bp.route('/', methods=['GET'])
@jwt_required()
def get_enrollments():
    """Get all enrollments for the current user."""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({
            'status': 'error',
            'message': 'User not found'
        }), 404
    
    if user.role != UserRole.STUDENT:
        return jsonify({
            'status': 'error',
            'message': 'Only students can view their enrollments'
        }), 403
    
    # Check for student profile and create one if it doesn't exist
    if not hasattr(user, 'student_profile') or user.student_profile is None:
        print(f"Creating missing student profile for user {user.id}")
        student = Student(
            user_id=user.id,
            student_id=f"STU{user.id:04d}",
            program="Computer Science",
            year_level=1
        )
        db.session.add(student)
        db.session.commit()
        # Refresh the user to get the new student_profile
        db.session.refresh(user)
    
    enrollments = Enrollment.query.filter_by(student_id=user.student_profile.id).all()
    
    return jsonify({
        'status': 'success',
        'data': [enrollment.to_dict() for enrollment in enrollments]
    })

@enrollments_bp.route('', methods=['POST'])
@jwt_required()
def enroll_in_course():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'User not found'
            }), 404
        
        if user.role != UserRole.STUDENT:
            return jsonify({
                'status': 'error',
                'message': 'Only students can enroll in courses'
            }), 403
        
        # Check for student profile and create one if it doesn't exist
        if not hasattr(user, 'student_profile') or user.student_profile is None:
            print(f"Creating missing student profile for user {user.id}")
            student = Student(
                user_id=user.id,
                student_id=f"STU{user.id:04d}",
                program="Computer Science",
                year_level=1
            )
            db.session.add(student)
            db.session.commit()
            # Refresh the user to get the new student_profile
            db.session.refresh(user)
        
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
        print(f"Error in enrollment: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@enrollments_bp.route('/<int:course_id>', methods=['DELETE'])
@jwt_required()
def drop_course(course_id):
    """Drop a course enrollment for the current user."""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({
            'status': 'error',
            'message': 'User not found'
        }), 404
    
    if user.role != UserRole.STUDENT:
        return jsonify({
            'status': 'error',
            'message': 'Only students can drop courses'
        }), 403
    
    # Check for student profile and create one if it doesn't exist (though this shouldn't happen for dropping)
    if not hasattr(user, 'student_profile') or user.student_profile is None:
        return jsonify({
            'status': 'error',
            'message': 'No student profile found'
        }), 404
    
    enrollment = Enrollment.query.filter_by(
        student_id=user.student_profile.id,
        course_id=course_id
    ).first()
    
    if not enrollment:
        return jsonify({
            'status': 'error',
            'message': 'Enrollment not found'
        }), 404
    
    try:
        db.session.delete(enrollment)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Successfully dropped course'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Failed to drop course: {str(e)}'
        }), 500 