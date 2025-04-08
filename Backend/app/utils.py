from app.models import db, User, UserRole, Student, Faculty, Admin, DepartmentHead, Course, CourseApproval, Enrollment, ApprovalStatus
from app.password_utils import hash_password, generate_access_code

def create_role_specific_profile(user, role):
    """Create role-specific profile for a user"""
    if role == UserRole.STUDENT:
        student = Student(
            user_id=user.id,
            student_id=f"STU{user.id:04d}",
            program="Computer Science",
            year_level=2
        )
        db.session.add(student)
    
    elif role == UserRole.FACULTY:
        faculty = Faculty(
            user_id=user.id,
            faculty_id=f"FAC{user.id:04d}",
            department="Computer Science",
            position="Assistant Professor"
        )
        db.session.add(faculty)
    
    elif role == UserRole.ADMIN:
        admin = Admin(
            user_id=user.id,
            admin_id=f"ADM{user.id:04d}",
            department="Administration"
        )
        db.session.add(admin)
    
    elif role == UserRole.DEPARTMENT_HEAD:
        dept_head = DepartmentHead(
            user_id=user.id,
            department="Computer Science"
        )
        db.session.add(dept_head)

def create_test_user(email, password, first_name, last_name, role, user_count):
    """Create a test user with the specified role"""
    access_code = generate_access_code(email, user_count)
    
    user = User(
        email=email,
        password_hash=hash_password(password),
        first_name=first_name,
        last_name=last_name,
        role=role,
        access_code=access_code,
        is_active=True
    )
    
    db.session.add(user)
    db.session.flush()  # Flush to get the user ID
    
    create_role_specific_profile(user, role)
    
    return user

def create_enrolled_user_without_password(email, first_name, last_name, role, user_count):
    """Create a user that is enrolled but has not set up a password yet"""
    access_code = generate_access_code(email, user_count)
    
    user = User(
        email=email,
        password_hash="NEEDS_SETUP",  # Special marker for users who need to set up passwords
        first_name=first_name,
        last_name=last_name,
        role=role,
        access_code=access_code,
        is_active=True
    )
    
    db.session.add(user)
    db.session.flush()  # Flush to get the user ID
    
    create_role_specific_profile(user, role)
    
    return user

def populate_test_data():
    """Populate the database with test data"""
    # Check if there are already users in the database
    if User.query.count() > 0:
        print("Database already contains users. Skipping test data creation.")
        return
    
    # Create test users for each role
    users_data = [
        {
            "email": "admin@example.com",
            "password": "password123", 
            "first_name": "Admin",
            "last_name": "User",
            "role": UserRole.ADMIN
        },
        {
            "email": "depthead@example.com",
            "password": "password123",
            "first_name": "Department",
            "last_name": "Head",
            "role": UserRole.DEPARTMENT_HEAD
        },
        {
            "email": "faculty@example.com",
            "password": "password123",
            "first_name": "Faculty",
            "last_name": "Member",
            "role": UserRole.FACULTY
        },
        {
            "email": "student@example.com",
            "password": "password123",
            "first_name": "Student",
            "last_name": "User",
            "role": UserRole.STUDENT
        }
    ]
    
    user_count = 1
    
    for user_data in users_data:
        create_test_user(
            email=user_data["email"],
            password=user_data["password"],
            first_name=user_data["first_name"],
            last_name=user_data["last_name"],
            role=user_data["role"],
            user_count=user_count
        )
        user_count += 1
    
    # Create enrolled students who haven't set up passwords yet
    enrolled_students = [
        {
            "email": "enrolled1@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "role": UserRole.STUDENT
        },
        {
            "email": "enrolled2@example.com",
            "first_name": "Jane",
            "last_name": "Smith",
            "role": UserRole.STUDENT
        },
        {
            "email": "enrolled3@example.com",
            "first_name": "Michael",
            "last_name": "Johnson",
            "role": UserRole.STUDENT
        }
    ]
    
    for student_data in enrolled_students:
        create_enrolled_user_without_password(
            email=student_data["email"],
            first_name=student_data["first_name"],
            last_name=student_data["last_name"],
            role=student_data["role"],
            user_count=user_count
        )
        user_count += 1
    
    # Create sample courses (pre-approved)
    dept_head = User.query.filter_by(role=UserRole.DEPARTMENT_HEAD).first()
    admin = User.query.filter_by(role=UserRole.ADMIN).first()
    
    if dept_head and admin:
        approved_courses = [
            # Computer Science Department
            {
                "course_code": "CS101",
                "title": "Introduction to Programming",
                "description": "An introduction to programming concepts using Python. Covers basic syntax, data types, control structures, and functions.",
                "credits": 3,
                "department": "Computer Science",
                "prerequisites": "None",
                "capacity": 40
            },
            {
                "course_code": "CS102",
                "title": "Object-Oriented Programming",
                "description": "Introduction to object-oriented programming concepts using Java. Covers classes, inheritance, polymorphism, and encapsulation.",
                "credits": 3,
                "department": "Computer Science",
                "prerequisites": "CS101",
                "capacity": 35
            },
            {
                "course_code": "CS201",
                "title": "Data Structures and Algorithms",
                "description": "Study of fundamental data structures and algorithms. Covers arrays, linked lists, trees, graphs, sorting, and searching algorithms.",
                "credits": 4,
                "department": "Computer Science",
                "prerequisites": "CS102",
                "capacity": 30
            },
            {
                "course_code": "CS202",
                "title": "Database Systems",
                "description": "Introduction to database design and management. Covers SQL, normalization, indexing, and transaction management.",
                "credits": 3,
                "department": "Computer Science",
                "prerequisites": "CS201",
                "capacity": 35
            },
            {
                "course_code": "CS301",
                "title": "Operating Systems",
                "description": "Study of operating system concepts including process management, memory management, file systems, and scheduling.",
                "credits": 4,
                "department": "Computer Science",
                "prerequisites": "CS201",
                "capacity": 30
            },
            {
                "course_code": "CS302",
                "title": "Computer Networks",
                "description": "Introduction to computer networking concepts, protocols, and architecture. Covers OSI model, TCP/IP, and network security.",
                "credits": 3,
                "department": "Computer Science",
                "prerequisites": "CS201",
                "capacity": 35
            },
            {
                "course_code": "CS401",
                "title": "Software Engineering",
                "description": "Software development methodologies, requirements engineering, design patterns, testing, and project management.",
                "credits": 4,
                "department": "Computer Science",
                "prerequisites": "CS202, CS301",
                "capacity": 30
            },
            {
                "course_code": "CS402",
                "title": "Artificial Intelligence",
                "description": "Introduction to AI concepts including machine learning, neural networks, and natural language processing.",
                "credits": 4,
                "department": "Computer Science",
                "prerequisites": "CS201, MATH201",
                "capacity": 30
            },

            # Mathematics Department
            {
                "course_code": "MATH101",
                "title": "Calculus I",
                "description": "Introduction to differential and integral calculus. Covers limits, derivatives, and basic integration techniques.",
                "credits": 4,
                "department": "Mathematics",
                "prerequisites": "None",
                "capacity": 40
            },
            {
                "course_code": "MATH102",
                "title": "Calculus II",
                "description": "Advanced integration techniques, sequences, series, and applications of calculus.",
                "credits": 4,
                "department": "Mathematics",
                "prerequisites": "MATH101",
                "capacity": 35
            },
            {
                "course_code": "MATH201",
                "title": "Linear Algebra",
                "description": "Study of vector spaces, linear transformations, matrices, and eigenvalues.",
                "credits": 4,
                "department": "Mathematics",
                "prerequisites": "MATH101",
                "capacity": 35
            },
            {
                "course_code": "MATH202",
                "title": "Discrete Mathematics",
                "description": "Logic, sets, relations, functions, combinatorics, and graph theory.",
                "credits": 3,
                "department": "Mathematics",
                "prerequisites": "MATH101",
                "capacity": 40
            },
            {
                "course_code": "MATH301",
                "title": "Abstract Algebra",
                "description": "Groups, rings, fields, and their applications in modern mathematics.",
                "credits": 4,
                "department": "Mathematics",
                "prerequisites": "MATH201, MATH202",
                "capacity": 30
            },
            {
                "course_code": "MATH302",
                "title": "Real Analysis",
                "description": "Rigorous study of real numbers, sequences, series, and functions.",
                "credits": 4,
                "department": "Mathematics",
                "prerequisites": "MATH102",
                "capacity": 30
            },

            # Physics Department
            {
                "course_code": "PHYS101",
                "title": "Physics I: Mechanics",
                "description": "Classical mechanics, including kinematics, dynamics, energy, momentum, and rotational motion.",
                "credits": 4,
                "department": "Physics",
                "prerequisites": "MATH101",
                "capacity": 35
            },
            {
                "course_code": "PHYS102",
                "title": "Physics II: Electricity and Magnetism",
                "description": "Electric fields, magnetic fields, electromagnetic waves, and Maxwell's equations.",
                "credits": 4,
                "department": "Physics",
                "prerequisites": "PHYS101, MATH102",
                "capacity": 35
            },
            {
                "course_code": "PHYS201",
                "title": "Modern Physics",
                "description": "Special relativity, quantum mechanics, and atomic physics.",
                "credits": 4,
                "department": "Physics",
                "prerequisites": "PHYS102, MATH201",
                "capacity": 30
            },
            {
                "course_code": "PHYS202",
                "title": "Thermal Physics",
                "description": "Thermodynamics, statistical mechanics, and kinetic theory.",
                "credits": 3,
                "department": "Physics",
                "prerequisites": "PHYS101, MATH102",
                "capacity": 30
            },

            # Chemistry Department
            {
                "course_code": "CHEM101",
                "title": "General Chemistry I",
                "description": "Atomic structure, chemical bonding, stoichiometry, and basic thermodynamics.",
                "credits": 4,
                "department": "Chemistry",
                "prerequisites": "MATH101",
                "capacity": 40
            },
            {
                "course_code": "CHEM102",
                "title": "General Chemistry II",
                "description": "Chemical equilibrium, acids and bases, electrochemistry, and kinetics.",
                "credits": 4,
                "department": "Chemistry",
                "prerequisites": "CHEM101",
                "capacity": 35
            },
            {
                "course_code": "CHEM201",
                "title": "Organic Chemistry I",
                "description": "Structure and reactivity of organic compounds, mechanisms, and synthesis.",
                "credits": 4,
                "department": "Chemistry",
                "prerequisites": "CHEM102",
                "capacity": 35
            },
            {
                "course_code": "CHEM202",
                "title": "Physical Chemistry",
                "description": "Quantum mechanics, spectroscopy, and statistical thermodynamics.",
                "credits": 4,
                "department": "Chemistry",
                "prerequisites": "CHEM102, MATH102, PHYS102",
                "capacity": 30
            },

            # Biology Department
            {
                "course_code": "BIO101",
                "title": "Introduction to Biology",
                "description": "Cell structure, genetics, evolution, and basic biological processes.",
                "credits": 4,
                "department": "Biology",
                "prerequisites": "None",
                "capacity": 40
            },
            {
                "course_code": "BIO102",
                "title": "Cell Biology",
                "description": "Detailed study of cell structure, function, and cellular processes.",
                "credits": 4,
                "department": "Biology",
                "prerequisites": "BIO101, CHEM101",
                "capacity": 35
            },
            {
                "course_code": "BIO201",
                "title": "Genetics",
                "description": "Mendelian genetics, molecular genetics, and population genetics.",
                "credits": 4,
                "department": "Biology",
                "prerequisites": "BIO101",
                "capacity": 35
            },
            {
                "course_code": "BIO202",
                "title": "Molecular Biology",
                "description": "DNA replication, transcription, translation, and gene regulation.",
                "credits": 4,
                "department": "Biology",
                "prerequisites": "BIO102, CHEM102",
                "capacity": 30
            }
        ]
        
        for course_data in approved_courses:
            course = Course(
                course_code=course_data["course_code"],
                title=course_data["title"],
                description=course_data["description"],
                credits=course_data["credits"],
                department=course_data["department"],
                prerequisites=course_data["prerequisites"],
                capacity=course_data["capacity"],
                is_active=True,  # These are pre-approved
                created_by=dept_head.id
            )
            
            db.session.add(course)
            db.session.flush()  # Get course ID
            
            # Create approval record (already approved)
            approval = CourseApproval(
                course_id=course.id,
                requested_by=dept_head.id,
                approved_by=admin.id,
                status=ApprovalStatus.APPROVED
            )
            
            db.session.add(approval)
        
        # Create pending course approval requests
        pending_courses = [
            {
                "course_code": "CS301",
                "title": "Software Engineering",
                "description": "Introduction to software engineering principles and practices.",
                "credits": 4,
                "department": "Computer Science",
                "prerequisites": "CS201",
                "capacity": 25
            },
            {
                "course_code": "PHYS101",
                "title": "Physics I",
                "description": "Introduction to mechanics and thermodynamics.",
                "credits": 4,
                "department": "Physics",
                "prerequisites": "MATH101",
                "capacity": 30
            }
        ]
        
        for course_data in pending_courses:
            course = Course(
                course_code=course_data["course_code"],
                title=course_data["title"],
                description=course_data["description"],
                credits=course_data["credits"],
                department=course_data["department"],
                prerequisites=course_data["prerequisites"],
                capacity=course_data["capacity"],
                is_active=False,  # These are pending approval
                created_by=dept_head.id
            )
            
            db.session.add(course)
            db.session.flush()  # Get course ID
            
            # Create approval record (pending)
            approval = CourseApproval(
                course_id=course.id,
                requested_by=dept_head.id,
                status=ApprovalStatus.PENDING
            )
            
            db.session.add(approval)
        
        # Create some enrollments for the student
        student = Student.query.first()
        if student:
            # Get the first two approved courses
            courses = Course.query.filter_by(is_active=True).limit(2).all()
            
            for course in courses:
                enrollment = Enrollment(
                    student_id=student.id,
                    course_id=course.id
                )
                db.session.add(enrollment)
    
    db.session.commit()
    print(f"Successfully added {len(users_data) + len(enrolled_students)} users to the database.")
    print("Added sample courses and enrollments.")

def get_user_counts():
    """Get counts of users by role"""
    counts = {
        "total": User.query.count(),
        "students": User.query.filter_by(role=UserRole.STUDENT).count(),
        "faculty": User.query.filter_by(role=UserRole.FACULTY).count(),
        "admins": User.query.filter_by(role=UserRole.ADMIN).count(),
        "department_heads": User.query.filter_by(role=UserRole.DEPARTMENT_HEAD).count()
    }
    
    return counts 