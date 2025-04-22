import os
import sys
from datetime import datetime, timedelta
from flask import Flask
from app import create_app
from app.models import db, User, Faculty, Course, FacultyCourse, CourseMaterial, MaterialType, UserRole

# Initialize the Flask app
app = create_app()

def seed_faculty_courses():
    with app.app_context():
        # Find the user with email faculty@snu.edu.in
        faculty_user = User.query.filter_by(email='faculty@snu.edu.in').first()
        
        if not faculty_user:
            print("Faculty user with email faculty@snu.edu.in not found.")
            return
        
        if faculty_user.role != UserRole.FACULTY:
            print(f"User {faculty_user.email} is not a faculty member. Role: {faculty_user.role}")
            return
        
        # Check if faculty profile exists, create one if it doesn't
        faculty_profile = Faculty.query.filter_by(user_id=faculty_user.id).first()
        if not faculty_profile:
            faculty_profile = Faculty(
                user_id=faculty_user.id,
                faculty_id=f"FAC{faculty_user.id:04d}",
                department="Engineering",
                position="Professor"
            )
            db.session.add(faculty_profile)
            db.session.commit()
            print(f"Created new faculty profile for {faculty_user.email}")
        
        # Check if there are any engineering courses
        engineering_courses = Course.query.filter_by(department="Engineering").all()
        
        # If no engineering courses exist, create some
        if len(engineering_courses) == 0:
            print("No engineering courses found. Creating sample courses...")
            eng_courses_data = [
                {
                    "course_code": "ENG101",
                    "title": "Introduction to Engineering",
                    "description": "Fundamentals of engineering principles and problem-solving methodologies.",
                    "credits": 3,
                    "department": "Engineering",
                    "prerequisites": "",
                    "capacity": 40,
                    "created_by": faculty_user.id
                },
                {
                    "course_code": "ENG201",
                    "title": "Engineering Mechanics",
                    "description": "Principles of statics and dynamics applied to engineering systems.",
                    "credits": 4,
                    "department": "Engineering",
                    "prerequisites": "ENG101",
                    "capacity": 30,
                    "created_by": faculty_user.id
                },
                {
                    "course_code": "ENG301",
                    "title": "Digital Systems Design",
                    "description": "Design and implementation of digital circuits and systems.",
                    "credits": 4,
                    "department": "Engineering",
                    "prerequisites": "ENG201",
                    "capacity": 25,
                    "created_by": faculty_user.id
                }
            ]
            
            for course_data in eng_courses_data:
                course = Course(**course_data)
                db.session.add(course)
            
            db.session.commit()
            print("Created sample engineering courses")
            
            # Refresh the engineering_courses list
            engineering_courses = Course.query.filter_by(department="Engineering").all()
        
        # Assign faculty to engineering courses
        semester = "Spring 2024"
        current_assignments = FacultyCourse.query.filter_by(
            faculty_id=faculty_profile.id, 
            semester=semester
        ).all()
        existing_course_ids = [fc.course_id for fc in current_assignments]
        
        for course in engineering_courses:
            if course.id not in existing_course_ids:
                faculty_course = FacultyCourse(
                    faculty_id=faculty_profile.id,
                    course_id=course.id,
                    semester=semester,
                    schedule=f"Mon, Wed {9 + engineering_courses.index(course)}:00-{10 + engineering_courses.index(course)}:30 AM",
                    room=f"Engineering {100 + engineering_courses.index(course)}",
                    is_active=True
                )
                db.session.add(faculty_course)
                print(f"Assigned {course.course_code}: {course.title} to {faculty_user.email}")
        
        db.session.commit()
        
        # Add course materials to each assigned course
        for course in engineering_courses:
            # Check if materials already exist for this course
            existing_materials = CourseMaterial.query.filter_by(course_id=course.id).count()
            
            if existing_materials == 0:
                course_materials = [
                    {
                        "course_id": course.id,  # Make sure to set this explicitly
                        "title": f"Week 1: Introduction to {course.title}",
                        "description": f"Introduction to key concepts in {course.title}",
                        "file_name": f"{course.course_code}_intro.pdf",
                        "file_path": f"/uploads/courses/{course.id}/{course.course_code}_intro.pdf",
                        "file_size": 1024 * 1024,  # 1MB
                        "file_type": "pdf",
                        "material_type": MaterialType.LECTURE,
                        "is_published": True,
                        "release_date": datetime.now(),
                        "created_by": faculty_user.id
                    },
                    {
                        "course_id": course.id,  # Make sure to set this explicitly
                        "title": f"Course Syllabus: {course.title}",
                        "description": f"Complete syllabus and course expectations for {course.title}",
                        "file_name": f"{course.course_code}_syllabus.pdf",
                        "file_path": f"/uploads/courses/{course.id}/{course.course_code}_syllabus.pdf",
                        "file_size": 512 * 1024,  # 512KB
                        "file_type": "pdf",
                        "material_type": MaterialType.RESOURCE,
                        "is_published": True,
                        "release_date": datetime.now(),
                        "created_by": faculty_user.id
                    },
                    {
                        "course_id": course.id,  # Make sure to set this explicitly
                        "title": f"Assignment 1: {course.title} Fundamentals",
                        "description": f"First assignment covering foundational concepts in {course.title}",
                        "file_name": f"{course.course_code}_assignment1.docx",
                        "file_path": f"/uploads/courses/{course.id}/{course.course_code}_assignment1.docx",
                        "file_size": 256 * 1024,  # 256KB
                        "file_type": "docx",
                        "material_type": MaterialType.ASSIGNMENT,
                        "is_published": True,
                        "release_date": datetime.now() + timedelta(days=7),  # Due in one week
                        "created_by": faculty_user.id
                    }
                ]
                
                for material_data in course_materials:
                    material = CourseMaterial(**material_data)
                    db.session.add(material)
                    print(f"Added material '{material.title}' to {course.course_code}")
                
                db.session.commit()

if __name__ == "__main__":
    seed_faculty_courses()
    print("Faculty courses and materials have been successfully seeded.") 