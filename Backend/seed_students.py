import os
import sys
from datetime import datetime
from flask import Flask
from app import create_app
from app.models import db, User, UserRole, Student, Course, Enrollment, CourseMaterial
from app.password_utils import hash_password, generate_access_code

# Initialize the Flask app
app = create_app()

def seed_students():
    with app.app_context():
        # Check if student users already exist
        existing_students = User.query.filter_by(role=UserRole.STUDENT).all()
        if existing_students:
            print(f"Found {len(existing_students)} existing student users.")
        
        # Create sample student users with engineering focus
        student_users_data = [
            {
                "email": "student1@snu.edu.in",
                "password": "password123",
                "first_name": "John",
                "last_name": "Smith",
                "role": UserRole.STUDENT,
                "program": "Mechanical Engineering",
                "year_level": 2
            },
            {
                "email": "student2@snu.edu.in",
                "password": "password123",
                "first_name": "Emma",
                "last_name": "Johnson",
                "role": UserRole.STUDENT,
                "program": "Electrical Engineering",
                "year_level": 3
            },
            {
                "email": "student3@snu.edu.in",
                "password": "password123",
                "first_name": "Raj",
                "last_name": "Patel",
                "role": UserRole.STUDENT,
                "program": "Civil Engineering",
                "year_level": 2
            },
            {
                "email": "student4@snu.edu.in",
                "password": "password123",
                "first_name": "Maria",
                "last_name": "Garcia",
                "role": UserRole.STUDENT,
                "program": "Computer Engineering",
                "year_level": 4
            },
            {
                "email": "student5@snu.edu.in",
                "password": "password123",
                "first_name": "Ananya",
                "last_name": "Sharma",
                "role": UserRole.STUDENT,
                "program": "Chemical Engineering",
                "year_level": 3
            },
            {
                "email": "student6@snu.edu.in",
                "password": "password123",
                "first_name": "David",
                "last_name": "Wilson",
                "role": UserRole.STUDENT,
                "program": "Aerospace Engineering",
                "year_level": 2
            }
        ]
        
        created_students = []
        
        for user_data in student_users_data:
            # Check if user already exists
            existing_user = User.query.filter_by(email=user_data["email"]).first()
            if existing_user:
                print(f"User {user_data['email']} already exists. Skipping.")
                continue
                
            # Create user
            hashed_password = hash_password(user_data["password"])
            access_code = generate_access_code(user_data["email"], 1)  # 1 for STUDENT role
            
            new_user = User(
                email=user_data["email"],
                password_hash=hashed_password,
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                role=user_data["role"],
                access_code=access_code
            )
            
            db.session.add(new_user)
            db.session.flush()  # Get the user ID
            
            # Create student profile
            new_student = Student(
                user_id=new_user.id,
                student_id=f"STU{new_user.id:04d}",
                program=user_data["program"],
                year_level=user_data["year_level"]
            )
            
            db.session.add(new_student)
            created_students.append(new_student)
            
        if created_students:
            db.session.commit()
            print(f"Created {len(created_students)} new student users.")
        
        # Get all engineering courses
        engineering_courses = Course.query.filter_by(department="Engineering").all()
        
        if not engineering_courses:
            print("No engineering courses found. Please run seed_faculty_courses.py first.")
            return
        
        print(f"Found {len(engineering_courses)} engineering courses.")
        
        # Get all student profiles for enrollment
        students = Student.query.join(User).filter(User.role == UserRole.STUDENT).all()
        
        if not students:
            print("No student profiles found. Cannot create enrollments.")
            return
        
        print(f"Found {len(students)} student profiles for enrollment.")
        
        # Create enrollments
        enrollment_count = 0
        for student in students:
            # Check existing enrollments
            existing_enrollments = Enrollment.query.filter_by(student_id=student.id).all()
            existing_course_ids = [e.course_id for e in existing_enrollments]
            
            for course in engineering_courses:
                # Only create enrollment if student isn't already enrolled
                if course.id not in existing_course_ids:
                    enrollment = Enrollment(
                        student_id=student.id,
                        course_id=course.id,
                        enrollment_date=datetime.now(),
                        status="enrolled"
                    )
                    db.session.add(enrollment)
                    enrollment_count += 1
        
        if enrollment_count > 0:
            db.session.commit()
            print(f"Created {enrollment_count} new student enrollments.")
        
        # Check course materials to ensure they're accessible to students
        for course in engineering_courses:
            materials = CourseMaterial.query.filter_by(course_id=course.id).all()
            print(f"Course {course.course_code} has {len(materials)} materials.")

if __name__ == "__main__":
    seed_students()
    print("Student users and enrollments have been successfully seeded.") 