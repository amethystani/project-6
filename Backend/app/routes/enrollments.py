from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Enrollment, Course, User
from sqlalchemy.exc import IntegrityError

enrollments_bp = Blueprint('enrollments', __name__)

@enrollments_bp.route('/', methods=['GET'])
@jwt_required()
def get_enrollments():
    """Get all enrollments for the current user."""
    current_user_id = get_jwt_identity()
    
    enrollments = Enrollment.query.filter_by(student_id=current_user_id).all()
    
    return jsonify({
        'status': 'success',
        'data': [enrollment.to_dict() for enrollment in enrollments]
    })

@enrollments_bp.route('/<int:course_id>', methods=['POST'])
@jwt_required()
def enroll_in_course(course_id):
    """Enroll the current user in a course."""
    current_user_id = get_jwt_identity()
    
    # Check if course exists
    course = Course.query.get(course_id)
    if not course:
        return jsonify({
            'status': 'error',
            'message': 'Course not found'
        }), 404
    
    # Check if user is already enrolled
    existing_enrollment = Enrollment.query.filter_by(
        student_id=current_user_id,
        course_id=course_id
    ).first()
    
    if existing_enrollment:
        return jsonify({
            'status': 'error',
            'message': 'Already enrolled in this course'
        }), 400
    
    # Create new enrollment
    try:
        enrollment = Enrollment(
            student_id=current_user_id,
            course_id=course_id
        )
        db.session.add(enrollment)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Successfully enrolled in course',
            'data': enrollment.to_dict()
        }), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': 'Failed to enroll in course'
        }), 500

@enrollments_bp.route('/<int:course_id>', methods=['DELETE'])
@jwt_required()
def drop_course(course_id):
    """Drop a course enrollment for the current user."""
    current_user_id = get_jwt_identity()
    
    enrollment = Enrollment.query.filter_by(
        student_id=current_user_id,
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