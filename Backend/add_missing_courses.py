from app import create_app
from app.models import db, Course, CourseApproval, User, UserRole, ApprovalStatus
from datetime import datetime

def add_missing_courses():
    app = create_app()
    
    with app.app_context():
        # Get admin and department head users
        admin = User.query.filter_by(role=UserRole.ADMIN).first()
        dept_head = User.query.filter_by(role=UserRole.DEPARTMENT_HEAD).first()
        
        if not admin or not dept_head:
            print("Admin or department head not found. Please create them first.")
            return
        
        # List of courses to add
        courses_to_add = [
            # Chemistry Department
            {
                "course_code": "CHEM101",
                "title": "Introduction to Chemistry",
                "description": "Basic principles of chemistry, atomic structure, chemical bonding, and reactions",
                "credits": 4,
                "department": "Chemistry",
                "prerequisites": "",
                "capacity": 35
            },
            {
                "course_code": "CHEM102",
                "title": "Organic Chemistry",
                "description": "Study of organic compounds, their structure, properties, and reactions",
                "credits": 4,
                "department": "Chemistry",
                "prerequisites": "CHEM101",
                "capacity": 30
            },
            {
                "course_code": "CHEM201",
                "title": "Physical Chemistry",
                "description": "Thermodynamics, kinetics, and quantum mechanics in chemistry",
                "credits": 4,
                "department": "Chemistry",
                "prerequisites": "CHEM102, MATH201",
                "capacity": 25
            },
            {
                "course_code": "CHEM202",
                "title": "Analytical Chemistry",
                "description": "Chemical analysis techniques and instrumentation",
                "credits": 3,
                "department": "Chemistry",
                "prerequisites": "CHEM101",
                "capacity": 30
            },
            
            # Biology Department
            {
                "course_code": "BIO101",
                "title": "Introduction to Biology",
                "description": "Basic principles of biology, cell structure, and function",
                "credits": 4,
                "department": "Biology",
                "prerequisites": "",
                "capacity": 40
            },
            {
                "course_code": "BIO102",
                "title": "Genetics",
                "description": "Principles of inheritance, gene expression, and genetic engineering",
                "credits": 4,
                "department": "Biology",
                "prerequisites": "BIO101",
                "capacity": 35
            },
            {
                "course_code": "BIO201",
                "title": "Cell Biology",
                "description": "Advanced study of cell structure, function, and cellular processes",
                "credits": 4,
                "department": "Biology",
                "prerequisites": "BIO101, CHEM101",
                "capacity": 30
            },
            {
                "course_code": "BIO202",
                "title": "Evolutionary Biology",
                "description": "Study of evolutionary processes and patterns",
                "credits": 3,
                "department": "Biology",
                "prerequisites": "BIO101",
                "capacity": 35
            },
            
            # Engineering Department
            {
                "course_code": "ENG101",
                "title": "Introduction to Engineering",
                "description": "Basic engineering principles and problem-solving techniques",
                "credits": 3,
                "department": "Engineering",
                "prerequisites": "",
                "capacity": 40
            },
            {
                "course_code": "ENG102",
                "title": "Engineering Design",
                "description": "Principles of engineering design and project management",
                "credits": 3,
                "department": "Engineering",
                "prerequisites": "ENG101",
                "capacity": 35
            },
            {
                "course_code": "ENG201",
                "title": "Materials Science",
                "description": "Study of engineering materials and their properties",
                "credits": 4,
                "department": "Engineering",
                "prerequisites": "ENG101, CHEM101",
                "capacity": 30
            },
            {
                "course_code": "ENG202",
                "title": "Thermodynamics",
                "description": "Principles of thermodynamics and heat transfer",
                "credits": 4,
                "department": "Engineering",
                "prerequisites": "ENG101, MATH201",
                "capacity": 30
            },
            
            # Business Department
            {
                "course_code": "BUS101",
                "title": "Introduction to Business",
                "description": "Basic business concepts and principles",
                "credits": 3,
                "department": "Business",
                "prerequisites": "",
                "capacity": 50
            },
            {
                "course_code": "BUS102",
                "title": "Business Ethics",
                "description": "Ethical principles in business decision-making",
                "credits": 3,
                "department": "Business",
                "prerequisites": "BUS101",
                "capacity": 45
            },
            {
                "course_code": "BUS201",
                "title": "Marketing Management",
                "description": "Principles and strategies of marketing",
                "credits": 3,
                "department": "Business",
                "prerequisites": "BUS101",
                "capacity": 40
            },
            {
                "course_code": "BUS202",
                "title": "Financial Management",
                "description": "Financial analysis and decision-making",
                "credits": 3,
                "department": "Business",
                "prerequisites": "BUS101",
                "capacity": 40
            },
            
            # Arts Department
            {
                "course_code": "ART101",
                "title": "Introduction to Art",
                "description": "Basic principles of art and visual expression",
                "credits": 3,
                "department": "Arts",
                "prerequisites": "",
                "capacity": 35
            },
            {
                "course_code": "ART102",
                "title": "Art History",
                "description": "Survey of art history from ancient to modern times",
                "credits": 3,
                "department": "Arts",
                "prerequisites": "ART101",
                "capacity": 35
            },
            {
                "course_code": "ART201",
                "title": "Digital Art",
                "description": "Digital art creation and manipulation techniques",
                "credits": 3,
                "department": "Arts",
                "prerequisites": "ART101",
                "capacity": 30
            },
            {
                "course_code": "ART202",
                "title": "Sculpture",
                "description": "Three-dimensional art creation and techniques",
                "credits": 3,
                "department": "Arts",
                "prerequisites": "ART101",
                "capacity": 25
            },
            
            # Humanities Department
            {
                "course_code": "HUM101",
                "title": "Introduction to Humanities",
                "description": "Survey of human culture and expression",
                "credits": 3,
                "department": "Humanities",
                "prerequisites": "",
                "capacity": 45
            },
            {
                "course_code": "HUM102",
                "title": "World Literature",
                "description": "Study of significant literary works from around the world",
                "credits": 3,
                "department": "Humanities",
                "prerequisites": "HUM101",
                "capacity": 40
            },
            {
                "course_code": "HUM201",
                "title": "Philosophy",
                "description": "Introduction to philosophical thinking and major schools of thought",
                "credits": 3,
                "department": "Humanities",
                "prerequisites": "HUM101",
                "capacity": 35
            },
            {
                "course_code": "HUM202",
                "title": "Cultural Studies",
                "description": "Analysis of contemporary culture and society",
                "credits": 3,
                "department": "Humanities",
                "prerequisites": "HUM101",
                "capacity": 35
            }
        ]

        # Add each course if it doesn't already exist
        courses_added = 0
        for course_data in courses_to_add:
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
                    is_active=True,
                    created_by=dept_head.id
                )
                db.session.add(new_course)
                db.session.flush()  # Get course ID
                
                # Create approval record
                approval = CourseApproval(
                    course_id=new_course.id,
                    requested_by=dept_head.id,
                    approved_by=admin.id,
                    status=ApprovalStatus.APPROVED,
                    comments="Auto-approved during course addition"
                )
                db.session.add(approval)
                courses_added += 1
                print(f"Added course: {course_data['course_code']} - {course_data['title']}")
            else:
                print(f"Course already exists: {course_data['course_code']}")
        
        if courses_added > 0:
            db.session.commit()
            print(f"\nSuccessfully added {courses_added} new courses!")
        else:
            print("\nNo new courses were added.")

        # Print all courses by department
        departments = sorted(list(set(course.department for course in Course.query.all())))
        
        for dept in departments:
            print(f"\n{dept} Department Courses:")
            print("-" * 100)
            print(f"{'Code':<10} {'Title':<30} {'Credits':<8} {'Prerequisites':<40} {'Capacity':<8}")
            print("-" * 100)
            
            dept_courses = Course.query.filter_by(department=dept).order_by(Course.course_code).all()
            for course in dept_courses:
                print(f"{course.course_code:<10} {course.title[:30]:<30} {course.credits:<8} {course.prerequisites:<40} {course.capacity:<8}")
        
        print(f"\nTotal courses: {Course.query.count()}")

if __name__ == "__main__":
    add_missing_courses() 