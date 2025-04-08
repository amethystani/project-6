from flask import Blueprint, request, jsonify
from app.models import db, Course, CourseApproval, User, UserRole, ApprovalStatus, Faculty, Enrollment, Student, Policy, Report, ReportType
from app.auth import jwt_required, get_jwt_identity
from datetime import datetime
from sqlalchemy import func
import json

department_head_bp = Blueprint('department_head', __name__)

@department_head_bp.route('/course-approvals', methods=['GET'])
def get_course_approvals():
    try:
        # Simplified approach - get all course approvals without strict authentication
        approvals = CourseApproval.query.all()
        
        return jsonify({
            'status': 'success',
            'data': [approval.to_dict() for approval in approvals]
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@department_head_bp.route('/course-approvals/<int:approval_id>', methods=['PUT'])
@jwt_required()
def update_course_approval(approval_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'User not found'
            }), 404
        
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

@department_head_bp.route('/analytics', methods=['GET'])
def get_department_analytics():
    try:
        # Sample department for demonstration
        department = "Computer Science"
        
        # Get all courses in the department
        courses = Course.query.filter_by(department=department).all()
        course_ids = [course.id for course in courses]
        
        # Get course statistics
        course_count = len(courses)
        active_course_count = Course.query.filter_by(department=department, is_active=True).count()
        
        # Get enrollment statistics for these courses
        enrollment_count = Enrollment.query.filter(Enrollment.course_id.in_(course_ids)).count() if course_ids else 0
        
        # Get faculty members in the department
        faculty_count = Faculty.query.filter_by(department=department).count()
        
        # Get course approval statistics
        approval_stats = db.session.query(
            CourseApproval.status,
            func.count(CourseApproval.id)
        ).join(Course, CourseApproval.course_id == Course.id)\
        .filter(Course.department == department)\
        .group_by(CourseApproval.status)\
        .all()
        
        approval_data = {status.value: 0 for status in ApprovalStatus}
        for status, count in approval_stats:
            approval_data[status.value] = count
        
        # Get most popular courses (based on enrollment)
        popular_courses = []
        if course_ids:
            popular_course_data = db.session.query(
                Course,
                func.count(Enrollment.id).label('enrollment_count')
            ).join(Enrollment, Course.id == Enrollment.course_id)\
            .filter(Course.id.in_(course_ids))\
            .group_by(Course.id)\
            .order_by(func.count(Enrollment.id).desc())\
            .limit(5)\
            .all()
            
            popular_courses = [{
                'course': course.to_dict(),
                'enrollment_count': count
            } for course, count in popular_course_data]
        
        # Return all analytics data
        data = {
            'department': department,
            'course_statistics': {
                'total_courses': course_count,
                'active_courses': active_course_count,
                'inactive_courses': course_count - active_course_count
            },
            'enrollment_statistics': {
                'total_enrollments': enrollment_count
            },
            'faculty_statistics': {
                'total_faculty': faculty_count
            },
            'approval_statistics': approval_data,
            'popular_courses': popular_courses
        }
        
        return jsonify({
            'status': 'success',
            'data': data
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@department_head_bp.route('/policy', methods=['GET'])
def get_department_policies():
    try:
        # Query actual policies from database instead of sample data
        policies = Policy.query.filter_by(is_active=True).all()
        
        return jsonify({
            'status': 'success',
            'data': [policy.to_dict() for policy in policies]
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@department_head_bp.route('/policy', methods=['POST'])
@jwt_required()
def create_policy():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'User not found'
            }), 404
        
        # Only department heads can create policies
        if user.role != UserRole.DEPARTMENT_HEAD:
            return jsonify({
                'status': 'error',
                'message': 'Only department heads can create policies'
            }), 403
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'content', 'department']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'status': 'error',
                'message': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Create new policy
        policy = Policy(
            title=data['title'],
            description=data.get('description', ''),
            content=data['content'],
            department=data['department'],
            created_by=current_user_id
        )
        
        db.session.add(policy)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Policy created successfully',
            'data': policy.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@department_head_bp.route('/policy/<int:policy_id>', methods=['PUT'])
@jwt_required()
def update_policy(policy_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'User not found'
            }), 404
        
        # Only department heads can update policies
        if user.role != UserRole.DEPARTMENT_HEAD:
            return jsonify({
                'status': 'error',
                'message': 'Only department heads can update policies'
            }), 403
        
        policy = Policy.query.get(policy_id)
        if not policy:
            return jsonify({
                'status': 'error',
                'message': 'Policy not found'
            }), 404
        
        data = request.get_json()
        
        # Update policy fields
        if 'title' in data:
            policy.title = data['title']
        if 'description' in data:
            policy.description = data['description']
        if 'content' in data:
            policy.content = data['content']
        if 'is_active' in data:
            policy.is_active = data['is_active']
        
        policy.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Policy updated successfully',
            'data': policy.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@department_head_bp.route('/reports', methods=['GET'])
def get_department_reports():
    try:
        # Query actual reports from database instead of sample data
        reports = Report.query.all()
        
        return jsonify({
            'status': 'success',
            'data': [report.to_dict() for report in reports]
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@department_head_bp.route('/reports', methods=['POST'])
@jwt_required()
def create_report():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'User not found'
            }), 404
        
        # Only department heads can create reports
        if user.role != UserRole.DEPARTMENT_HEAD:
            return jsonify({
                'status': 'error',
                'message': 'Only department heads can create reports'
            }), 403
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'type', 'content', 'department']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'status': 'error',
                'message': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Validate report type
        try:
            report_type = ReportType(data['type'])
        except ValueError:
            return jsonify({
                'status': 'error',
                'message': f'Invalid report type. Must be one of: {", ".join([t.value for t in ReportType])}'
            }), 400
        
        # Ensure content is valid JSON if provided as string
        content = data['content']
        if isinstance(content, str):
            try:
                # Try to parse it to ensure it's valid JSON
                json.loads(content)
            except json.JSONDecodeError:
                return jsonify({
                    'status': 'error',
                    'message': 'Report content must be valid JSON'
                }), 400
        else:
            # If it's not a string, convert it to a JSON string
            content = json.dumps(content)
        
        # Create new report
        report = Report(
            title=data['title'],
            description=data.get('description', ''),
            type=report_type,
            content=content,
            summary=data.get('summary', ''),
            date_range=data.get('date_range', ''),
            department=data['department'],
            created_by=current_user_id
        )
        
        db.session.add(report)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Report created successfully',
            'data': report.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@department_head_bp.route('/reports/<int:report_id>', methods=['PUT'])
@jwt_required()
def update_report(report_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'User not found'
            }), 404
        
        # Only department heads can update reports
        if user.role != UserRole.DEPARTMENT_HEAD:
            return jsonify({
                'status': 'error',
                'message': 'Only department heads can update reports'
            }), 403
        
        report = Report.query.get(report_id)
        if not report:
            return jsonify({
                'status': 'error',
                'message': 'Report not found'
            }), 404
        
        data = request.get_json()
        
        # Update report fields
        if 'title' in data:
            report.title = data['title']
        if 'description' in data:
            report.description = data['description']
        if 'type' in data:
            try:
                report.type = ReportType(data['type'])
            except ValueError:
                return jsonify({
                    'status': 'error',
                    'message': f'Invalid report type. Must be one of: {", ".join([t.value for t in ReportType])}'
                }), 400
        if 'content' in data:
            content = data['content']
            if isinstance(content, str):
                try:
                    # Try to parse it to ensure it's valid JSON
                    json.loads(content)
                    report.content = content
                except json.JSONDecodeError:
                    return jsonify({
                        'status': 'error',
                        'message': 'Report content must be valid JSON'
                    }), 400
            else:
                # If it's not a string, convert it to a JSON string
                report.content = json.dumps(content)
        if 'summary' in data:
            report.summary = data['summary']
        if 'date_range' in data:
            report.date_range = data['date_range']
        
        report.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Report updated successfully',
            'data': report.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500 