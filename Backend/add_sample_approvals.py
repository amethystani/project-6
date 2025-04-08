from app import create_app
from app.models import db, Course, CourseApproval, User, UserRole, ApprovalStatus
from app.password_utils import generate_access_code
from datetime import datetime

def add_sample_approvals():
    app = create_app()
    
    with app.app_context():
        # Find users with appropriate roles
        faculty = User.query.filter_by(role=UserRole.FACULTY).first()
        dept_head = User.query.filter_by(role=UserRole.DEPARTMENT_HEAD).first()
        
        if not faculty:
            print("No faculty user found. Creating one...")
            faculty = User(
                email="faculty@example.com",
                password_hash="$2b$12$tRIXY0A1BIrFB8yIX9MS6ebzKrYK5PUJUftfYDHAxuL86ZcDRbqYy",  # password123
                first_name="Faculty",
                last_name="Member",
                role=UserRole.FACULTY,
                access_code=generate_access_code("faculty@example.com", 3)  # 3 for FACULTY
            )
            db.session.add(faculty)
            db.session.commit()
        
        if not dept_head:
            print("No department head user found. Creating one...")
            dept_head = User(
                email="depthead@example.com",
                password_hash="$2b$12$tRIXY0A1BIrFB8yIX9MS6ebzKrYK5PUJUftfYDHAxuL86ZcDRbqYy",  # password123
                first_name="Department",
                last_name="Head",
                role=UserRole.DEPARTMENT_HEAD,
                access_code=generate_access_code("depthead@example.com", 2)  # 2 for DEPARTMENT_HEAD
            )
            db.session.add(dept_head)
            db.session.commit()
        
        # Sample courses to add
        sample_courses = [
            {
                "course_code": "CS101",
                "title": "Introduction to Computer Science",
                "description": "Fundamentals of computer science and programming",
                "credits": 3,
                "department": "Computer Science",
                "prerequisites": None,
                "capacity": 40
            },
            {
                "course_code": "MATH201",
                "title": "Calculus I",
                "description": "Introduction to differential and integral calculus",
                "credits": 4,
                "department": "Mathematics",
                "prerequisites": None,
                "capacity": 35
            },
            {
                "course_code": "ENG105",
                "title": "Academic Writing",
                "description": "Principles of effective writing in academic contexts",
                "credits": 3,
                "department": "English",
                "prerequisites": None,
                "capacity": 30
            }
        ]
        
        # Add courses and create approval records
        for course_data in sample_courses:
            # Check if course already exists
            existing_course = Course.query.filter_by(course_code=course_data["course_code"]).first()
            
            if not existing_course:
                # Create new course
                new_course = Course(
                    course_code=course_data["course_code"],
                    title=course_data["title"],
                    description=course_data["description"],
                    credits=course_data["credits"],
                    department=course_data["department"],
                    prerequisites=course_data["prerequisites"],
                    capacity=course_data["capacity"],
                    is_active=False,  # Not active until approved
                    created_by=faculty.id
                )
                db.session.add(new_course)
                db.session.flush()  # Get course ID
                
                # Create approval record
                approval = CourseApproval(
                    course_id=new_course.id,
                    requested_by=faculty.id,
                    approved_by=None,  # Not approved yet
                    status=ApprovalStatus.PENDING,
                    comments="Pending review",
                    requested_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.session.add(approval)
                print(f"Added course approval for: {course_data['course_code']} - {course_data['title']}")
            else:
                print(f"Course already exists: {course_data['course_code']}")
        
        db.session.commit()
        print("Sample course approvals added successfully!")

if __name__ == "__main__":
    add_sample_approvals() 