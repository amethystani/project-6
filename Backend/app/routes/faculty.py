from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, User, Faculty, Course, FacultyCourse, CourseMaterial, MaterialType, UserRole
from datetime import datetime
import os
from werkzeug.utils import secure_filename

faculty_bp = Blueprint('faculty', __name__)

# Route to get courses assigned to the current faculty
@faculty_bp.route('/courses', methods=['GET'])
@jwt_required()
def get_faculty_courses():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({
            'status': 'error',
            'message': 'User not found'
        }), 404
    
    if user.role != UserRole.FACULTY:
        return jsonify({
            'status': 'error',
            'message': 'Only faculty can access this endpoint'
        }), 403
    
    # Get the faculty profile
    faculty = Faculty.query.filter_by(user_id=user.id).first()
    
    if not faculty:
        return jsonify({
            'status': 'error',
            'message': 'Faculty profile not found'
        }), 404
    
    # Get courses assigned to this faculty
    faculty_courses = FacultyCourse.query.filter_by(faculty_id=faculty.id).all()
    
    # Format the response
    courses_data = [{
        'id': fc.id,
        'course': fc.course.to_dict(),
        'semester': fc.semester,
        'schedule': fc.schedule,
        'room': fc.room,
        'is_active': fc.is_active,
        'student_count': len(fc.course.enrollments) if fc.course.enrollments else 0
    } for fc in faculty_courses]
    
    return jsonify({
        'status': 'success',
        'data': courses_data
    })

# Route to assign a course to a faculty
@faculty_bp.route('/courses', methods=['POST'])
@jwt_required()
def assign_course():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({
            'status': 'error',
            'message': 'User not found'
        }), 404
    
    # Only admins can assign courses to faculty
    if user.role != UserRole.ADMIN:
        return jsonify({
            'status': 'error',
            'message': 'Only administrators can assign courses to faculty'
        }), 403
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['faculty_id', 'course_id', 'semester']
    for field in required_fields:
        if field not in data:
            return jsonify({
                'status': 'error',
                'message': f'Missing required field: {field}'
            }), 400
    
    # Check if faculty exists
    faculty = Faculty.query.get(data['faculty_id'])
    if not faculty:
        return jsonify({
            'status': 'error',
            'message': 'Faculty not found'
        }), 404
    
    # Check if course exists
    course = Course.query.get(data['course_id'])
    if not course:
        return jsonify({
            'status': 'error',
            'message': 'Course not found'
        }), 404
    
    # Check if assignment already exists
    existing_assignment = FacultyCourse.query.filter_by(
        faculty_id=data['faculty_id'],
        course_id=data['course_id'],
        semester=data['semester']
    ).first()
    
    if existing_assignment:
        return jsonify({
            'status': 'error',
            'message': 'Course is already assigned to this faculty for the specified semester'
        }), 400
    
    # Create new assignment
    faculty_course = FacultyCourse(
        faculty_id=data['faculty_id'],
        course_id=data['course_id'],
        semester=data['semester'],
        schedule=data.get('schedule'),
        room=data.get('room'),
        is_active=data.get('is_active', True)
    )
    
    try:
        db.session.add(faculty_course)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Course assigned successfully',
            'data': faculty_course.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Failed to assign course: {str(e)}'
        }), 500

# Route to get course materials for a specific course
@faculty_bp.route('/courses/<int:course_id>/materials', methods=['GET'])
@jwt_required()
def get_course_materials(course_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({
            'status': 'error',
            'message': 'User not found'
        }), 404
    
    # Check if course exists
    course = Course.query.get(course_id)
    if not course:
        return jsonify({
            'status': 'error',
            'message': 'Course not found'
        }), 404
    
    # If user is faculty, check if they're assigned to this course
    if user.role == UserRole.FACULTY:
        faculty = Faculty.query.filter_by(user_id=user.id).first()
        if not faculty:
            return jsonify({
                'status': 'error',
                'message': 'Faculty profile not found'
            }), 404
        
        faculty_course = FacultyCourse.query.filter_by(
            faculty_id=faculty.id,
            course_id=course_id
        ).first()
        
        if not faculty_course:
            return jsonify({
                'status': 'error',
                'message': 'You are not assigned to this course'
            }), 403
    
    # Get materials for this course
    materials = CourseMaterial.query.filter_by(course_id=course_id).all()
    
    # Format the response
    materials_data = [material.to_dict() for material in materials]
    
    return jsonify({
        'status': 'success',
        'data': materials_data
    })

# Route to add a new course material
@faculty_bp.route('/courses/<int:course_id>/materials', methods=['POST'])
@jwt_required()
def add_course_material(course_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({
            'status': 'error',
            'message': 'User not found'
        }), 404
    
    if user.role != UserRole.FACULTY:
        return jsonify({
            'status': 'error',
            'message': 'Only faculty can add course materials'
        }), 403
    
    # Check if faculty is assigned to this course
    faculty = Faculty.query.filter_by(user_id=user.id).first()
    if not faculty:
        return jsonify({
            'status': 'error',
            'message': 'Faculty profile not found'
        }), 404
    
    faculty_course = FacultyCourse.query.filter_by(
        faculty_id=faculty.id,
        course_id=course_id
    ).first()
    
    if not faculty_course:
        return jsonify({
            'status': 'error',
            'message': 'You are not assigned to this course'
        }), 403
    
    # In a real implementation, we would handle file uploads
    # For now, we'll just create a record without actual file upload
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['title', 'material_type', 'is_published']
    for field in required_fields:
        if field not in data:
            return jsonify({
                'status': 'error',
                'message': f'Missing required field: {field}'
            }), 400
    
    try:
        # Create placeholder data for file that would normally come from upload
        file_name = data.get('file_name', 'example.pdf')
        file_size = data.get('file_size', 1024)  # 1KB placeholder
        file_type = file_name.split('.')[-1] if '.' in file_name else 'pdf'
        file_path = f'/uploads/courses/{course_id}/{file_name}'  # Placeholder path
        
        # Parse material type
        try:
            material_type = MaterialType[data['material_type'].upper()]
        except (KeyError, ValueError):
            return jsonify({
                'status': 'error',
                'message': f'Invalid material type. Must be one of: {", ".join([t.name.lower() for t in MaterialType])}'
            }), 400
        
        # Create the material record
        material = CourseMaterial(
            course_id=course_id,
            title=data['title'],
            description=data.get('description', ''),
            file_name=file_name,
            file_path=file_path,
            file_size=file_size,
            file_type=file_type,
            material_type=material_type,
            is_published=data['is_published'],
            release_date=datetime.fromisoformat(data['release_date']) if 'release_date' in data else None,
            created_by=user.id
        )
        
        db.session.add(material)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Course material added successfully',
            'data': material.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Failed to add course material: {str(e)}'
        }), 500

# Route to update a course material
@faculty_bp.route('/courses/<int:course_id>/materials/<int:material_id>', methods=['PUT'])
@jwt_required()
def update_course_material(course_id, material_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({
            'status': 'error',
            'message': 'User not found'
        }), 404
    
    if user.role != UserRole.FACULTY:
        return jsonify({
            'status': 'error',
            'message': 'Only faculty can update course materials'
        }), 403
    
    # Check if material exists
    material = CourseMaterial.query.get(material_id)
    if not material:
        return jsonify({
            'status': 'error',
            'message': 'Course material not found'
        }), 404
    
    # Check if this material belongs to the specified course
    if material.course_id != course_id:
        return jsonify({
            'status': 'error',
            'message': 'Material does not belong to this course'
        }), 400
    
    # Check if user created this material or is assigned to this course
    faculty = Faculty.query.filter_by(user_id=user.id).first()
    if not faculty:
        return jsonify({
            'status': 'error',
            'message': 'Faculty profile not found'
        }), 404
    
    faculty_course = FacultyCourse.query.filter_by(
        faculty_id=faculty.id,
        course_id=course_id
    ).first()
    
    if not faculty_course and material.created_by != user.id:
        return jsonify({
            'status': 'error',
            'message': 'You do not have permission to update this material'
        }), 403
    
    data = request.get_json()
    
    try:
        # Update fields that are present in the request
        if 'title' in data:
            material.title = data['title']
        
        if 'description' in data:
            material.description = data['description']
        
        if 'is_published' in data:
            material.is_published = data['is_published']
        
        if 'release_date' in data:
            material.release_date = datetime.fromisoformat(data['release_date']) if data['release_date'] else None
        
        if 'material_type' in data:
            try:
                material.material_type = MaterialType[data['material_type'].upper()]
            except (KeyError, ValueError):
                return jsonify({
                    'status': 'error',
                    'message': f'Invalid material type. Must be one of: {", ".join([t.name.lower() for t in MaterialType])}'
                }), 400
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Course material updated successfully',
            'data': material.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Failed to update course material: {str(e)}'
        }), 500

# Route to delete a course material
@faculty_bp.route('/courses/<int:course_id>/materials/<int:material_id>', methods=['DELETE'])
@jwt_required()
def delete_course_material(course_id, material_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({
            'status': 'error',
            'message': 'User not found'
        }), 404
    
    if user.role != UserRole.FACULTY:
        return jsonify({
            'status': 'error',
            'message': 'Only faculty can delete course materials'
        }), 403
    
    # Check if material exists
    material = CourseMaterial.query.get(material_id)
    if not material:
        return jsonify({
            'status': 'error',
            'message': 'Course material not found'
        }), 404
    
    # Check if this material belongs to the specified course
    if material.course_id != course_id:
        return jsonify({
            'status': 'error',
            'message': 'Material does not belong to this course'
        }), 400
    
    # Check if user created this material
    if material.created_by != user.id:
        return jsonify({
            'status': 'error',
            'message': 'You do not have permission to delete this material'
        }), 403
    
    try:
        db.session.delete(material)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Course material deleted successfully'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Failed to delete course material: {str(e)}'
        }), 500 