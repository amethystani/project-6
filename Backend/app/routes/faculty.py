from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, User, Faculty, Course, FacultyCourse, CourseMaterial, MaterialType, UserRole, Attendance, AttendanceStatus, Student, Enrollment
from datetime import datetime, date
import os
import csv
import io
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

# Route to get attendance records for a specific course
@faculty_bp.route('/courses/<int:faculty_course_id>/attendance', methods=['GET'])
@jwt_required()
def get_course_attendance(faculty_course_id):
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
            'message': 'Only faculty can access attendance records'
        }), 403
    
    # Check if faculty is assigned to this course
    faculty = Faculty.query.filter_by(user_id=user.id).first()
    if not faculty:
        return jsonify({
            'status': 'error',
            'message': 'Faculty profile not found'
        }), 404
    
    faculty_course = FacultyCourse.query.get(faculty_course_id)
    
    if not faculty_course or faculty_course.faculty_id != faculty.id:
        return jsonify({
            'status': 'error',
            'message': 'You are not assigned to this course'
        }), 403
    
    # Get query parameters
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    student_id = request.args.get('student_id')
    
    # Build query
    query = Attendance.query.filter_by(faculty_course_id=faculty_course_id)
    
    if start_date:
        query = query.filter(Attendance.date >= datetime.strptime(start_date, '%Y-%m-%d').date())
    
    if end_date:
        query = query.filter(Attendance.date <= datetime.strptime(end_date, '%Y-%m-%d').date())
    
    if student_id:
        student = Student.query.filter_by(student_id=student_id).first()
        if student:
            query = query.filter_by(student_id=student.id)
    
    # Get attendance records
    attendance_records = query.order_by(Attendance.date.desc()).all()
    
    # Format the response
    attendance_data = [record.to_dict() for record in attendance_records]
    
    return jsonify({
        'status': 'success',
        'data': attendance_data
    })

# Route to add attendance records
@faculty_bp.route('/courses/<int:faculty_course_id>/attendance', methods=['POST'])
@jwt_required()
def add_attendance(faculty_course_id):
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
            'message': 'Only faculty can add attendance records'
        }), 403
    
    # Check if faculty is assigned to this course
    faculty = Faculty.query.filter_by(user_id=user.id).first()
    if not faculty:
        return jsonify({
            'status': 'error',
            'message': 'Faculty profile not found'
        }), 404
    
    faculty_course = FacultyCourse.query.get(faculty_course_id)
    
    if not faculty_course or faculty_course.faculty_id != faculty.id:
        return jsonify({
            'status': 'error',
            'message': 'You are not assigned to this course'
        }), 403
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['date', 'records']
    for field in required_fields:
        if field not in data:
            return jsonify({
                'status': 'error',
                'message': f'Missing required field: {field}'
            }), 400
    
    try:
        attendance_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        
        # Process attendance records
        added_records = []
        
        for record in data['records']:
            if 'student_id' not in record or 'status' not in record:
                continue
            
            # Get student
            student = Student.query.filter_by(student_id=record['student_id']).first()
            if not student:
                continue
            
            # Check if student is enrolled in this course
            course_id = faculty_course.course_id
            enrollment = Enrollment.query.filter_by(
                student_id=student.id,
                course_id=course_id,
                status='enrolled'
            ).first()
            
            if not enrollment:
                continue
            
            # Check for existing attendance record
            existing_record = Attendance.query.filter_by(
                faculty_course_id=faculty_course_id,
                student_id=student.id,
                date=attendance_date
            ).first()
            
            if existing_record:
                # Update existing record
                existing_record.status = AttendanceStatus(record['status'])
                existing_record.remarks = record.get('remarks')
                existing_record.updated_at = datetime.utcnow()
                added_records.append(existing_record.to_dict())
            else:
                # Create new record
                attendance_record = Attendance(
                    faculty_course_id=faculty_course_id,
                    student_id=student.id,
                    date=attendance_date,
                    status=AttendanceStatus(record['status']),
                    remarks=record.get('remarks'),
                    created_by=user.id
                )
                
                db.session.add(attendance_record)
                added_records.append(attendance_record.to_dict())
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': f'Added {len(added_records)} attendance records',
            'data': added_records
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Failed to add attendance records: {str(e)}'
        }), 500

# Route to import attendance from CSV
@faculty_bp.route('/courses/<int:faculty_course_id>/attendance/import', methods=['POST'])
@jwt_required()
def import_attendance(faculty_course_id):
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
            'message': 'Only faculty can import attendance records'
        }), 403
    
    # Check if faculty is assigned to this course
    faculty = Faculty.query.filter_by(user_id=user.id).first()
    if not faculty:
        return jsonify({
            'status': 'error',
            'message': 'Faculty profile not found'
        }), 404
    
    faculty_course = FacultyCourse.query.get(faculty_course_id)
    
    if not faculty_course or faculty_course.faculty_id != faculty.id:
        return jsonify({
            'status': 'error',
            'message': 'You are not assigned to this course'
        }), 403
    
    if 'file' not in request.files:
        return jsonify({
            'status': 'error',
            'message': 'No file provided'
        }), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({
            'status': 'error',
            'message': 'No file selected'
        }), 400
    
    if not file.filename.endswith('.csv'):
        return jsonify({
            'status': 'error',
            'message': 'Only CSV files are supported'
        }), 400
    
    try:
        # Read CSV file
        csv_data = file.read().decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(csv_data))
        
        # Process records
        added_records = []
        errors = []
        
        for row in csv_reader:
            if 'student_id' not in row or 'date' not in row or 'status' not in row:
                errors.append(f"Missing required fields in row: {row}")
                continue
            
            # Get student
            student = Student.query.filter_by(student_id=row['student_id']).first()
            if not student:
                errors.append(f"Student not found: {row['student_id']}")
                continue
            
            # Check if student is enrolled in this course
            course_id = faculty_course.course_id
            enrollment = Enrollment.query.filter_by(
                student_id=student.id,
                course_id=course_id,
                status='enrolled'
            ).first()
            
            if not enrollment:
                errors.append(f"Student not enrolled in this course: {row['student_id']}")
                continue
            
            try:
                attendance_date = datetime.strptime(row['date'], '%Y-%m-%d').date()
                status = AttendanceStatus(row['status'])
            except ValueError as e:
                errors.append(f"Invalid date or status for student {row['student_id']}: {str(e)}")
                continue
            
            # Check for existing attendance record
            existing_record = Attendance.query.filter_by(
                faculty_course_id=faculty_course_id,
                student_id=student.id,
                date=attendance_date
            ).first()
            
            if existing_record:
                # Update existing record
                existing_record.status = status
                existing_record.remarks = row.get('remarks')
                existing_record.updated_at = datetime.utcnow()
                added_records.append(existing_record.to_dict())
            else:
                # Create new record
                attendance_record = Attendance(
                    faculty_course_id=faculty_course_id,
                    student_id=student.id,
                    date=attendance_date,
                    status=status,
                    remarks=row.get('remarks'),
                    created_by=user.id
                )
                
                db.session.add(attendance_record)
                added_records.append(attendance_record.to_dict())
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': f'Imported {len(added_records)} attendance records',
            'data': {
                'added_records': len(added_records),
                'errors': errors
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Failed to import attendance records: {str(e)}'
        }), 500

# Route to generate attendance report
@faculty_bp.route('/courses/<int:faculty_course_id>/attendance/report', methods=['GET'])
@jwt_required()
def generate_attendance_report(faculty_course_id):
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
            'message': 'Only faculty can generate attendance reports'
        }), 403
    
    # Check if faculty is assigned to this course
    faculty = Faculty.query.filter_by(user_id=user.id).first()
    if not faculty:
        return jsonify({
            'status': 'error',
            'message': 'Faculty profile not found'
        }), 404
    
    faculty_course = FacultyCourse.query.get(faculty_course_id)
    
    if not faculty_course or faculty_course.faculty_id != faculty.id:
        return jsonify({
            'status': 'error',
            'message': 'You are not assigned to this course'
        }), 403
    
    # Get query parameters
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    # Build query for attendance dates
    query = db.session.query(Attendance.date).filter_by(faculty_course_id=faculty_course_id).distinct()
    
    if start_date:
        query = query.filter(Attendance.date >= datetime.strptime(start_date, '%Y-%m-%d').date())
    
    if end_date:
        query = query.filter(Attendance.date <= datetime.strptime(end_date, '%Y-%m-%d').date())
    
    attendance_dates = [date[0] for date in query.order_by(Attendance.date).all()]
    
    # Get all students enrolled in the course
    course_id = faculty_course.course_id
    enrolled_students = db.session.query(Student).join(
        Enrollment, Student.id == Enrollment.student_id
    ).filter(
        Enrollment.course_id == course_id,
        Enrollment.status == 'enrolled'
    ).all()
    
    # Generate report
    report = []
    
    for student in enrolled_students:
        # Get attendance records for this student
        attendance_records = Attendance.query.filter_by(
            faculty_course_id=faculty_course_id,
            student_id=student.id
        ).order_by(Attendance.date).all()
        
        # Calculate statistics
        total_days = len(attendance_dates)
        present_count = sum(1 for record in attendance_records if record.status == AttendanceStatus.PRESENT)
        absent_count = sum(1 for record in attendance_records if record.status == AttendanceStatus.ABSENT)
        late_count = sum(1 for record in attendance_records if record.status == AttendanceStatus.LATE)
        excused_count = sum(1 for record in attendance_records if record.status == AttendanceStatus.EXCUSED)
        
        # Calculate attendance rate
        attendance_rate = (present_count / total_days * 100) if total_days > 0 else 0
        
        # Add to report
        report.append({
            'student': student.to_dict(),
            'total_days': total_days,
            'present_count': present_count,
            'absent_count': absent_count,
            'late_count': late_count,
            'excused_count': excused_count,
            'attendance_rate': round(attendance_rate, 2),
            'detailed_records': [record.to_dict() for record in attendance_records]
        })
    
    return jsonify({
        'status': 'success',
        'data': {
            'course': faculty_course.to_dict(),
            'attendance_dates': [date.isoformat() for date in attendance_dates],
            'student_reports': report
        }
    }) 