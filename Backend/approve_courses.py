from app import create_app
from app.models import db, Course, CourseApproval, User, UserRole, ApprovalStatus
from datetime import datetime

def print_all_courses():
    app = create_app()
    
    with app.app_context():
        print("\nAll Courses in Database:")
        print("-" * 80)
        print(f"{'ID':<5} {'Code':<10} {'Title':<30} {'Department':<20} {'Active':<10}")
        print("-" * 80)
        
        courses = Course.query.all()
        for course in courses:
            print(f"{course.id:<5} {course.course_code:<10} {course.title[:30]:<30} {course.department:<20} {str(course.is_active):<10}")
        
        print(f"\nTotal courses: {len(courses)}")

def approve_all_courses():
    app = create_app()
    
    with app.app_context():
        # Get admin user
        admin = User.query.filter_by(role=UserRole.ADMIN).first()
        if not admin:
            print("No admin user found. Please create an admin user first.")
            return
            
        # Get all inactive courses
        inactive_courses = Course.query.filter_by(is_active=False).all()
        
        if not inactive_courses:
            print("No inactive courses found.")
            return
            
        print(f"Found {len(inactive_courses)} inactive courses. Approving them...")
        
        # Approve each course
        for course in inactive_courses:
            # Create or update approval record
            approval = CourseApproval.query.filter_by(course_id=course.id).first()
            if not approval:
                approval = CourseApproval(
                    course_id=course.id,
                    requested_by=course.created_by,
                    approved_by=admin.id,
                    status=ApprovalStatus.APPROVED,
                    comments="Auto-approved by script",
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.session.add(approval)
            else:
                approval.status = ApprovalStatus.APPROVED
                approval.approved_by = admin.id
                approval.updated_at = datetime.utcnow()
            
            # Activate the course
            course.is_active = True
            
        # Commit all changes
        db.session.commit()
        print("All courses have been approved and activated!")

if __name__ == "__main__":
    approve_all_courses()
    print_all_courses() 