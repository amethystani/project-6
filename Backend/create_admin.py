from app import create_app
from app.models import db, User, UserRole, Admin, DepartmentHead
from app.password_utils import hash_password, generate_access_code

def create_admin_and_dept_head():
    app = create_app()
    
    with app.app_context():
        # Create admin user if not exists
        admin = User.query.filter_by(email="admin@example.com").first()
        if not admin:
            admin = User(
                email="admin@example.com",
                password_hash=hash_password("password123"),
                first_name="Admin",
                last_name="User",
                role=UserRole.ADMIN,
                access_code=generate_access_code("admin@example.com", 1)
            )
            db.session.add(admin)
            db.session.flush()
            
            # Create admin profile
            admin_profile = Admin(
                user_id=admin.id,
                admin_id=f"ADM{admin.id:04d}",
                department="Administration"
            )
            db.session.add(admin_profile)
            print("Created admin user")
        
        # Create department head if not exists
        dept_head = User.query.filter_by(email="depthead@example.com").first()
        if not dept_head:
            dept_head = User(
                email="depthead@example.com",
                password_hash=hash_password("password123"),
                first_name="Department",
                last_name="Head",
                role=UserRole.DEPARTMENT_HEAD,
                access_code=generate_access_code("depthead@example.com", 2)
            )
            db.session.add(dept_head)
            db.session.flush()
            
            # Create department head profile
            dept_head_profile = DepartmentHead(
                user_id=dept_head.id,
                department="Computer Science"
            )
            db.session.add(dept_head_profile)
            print("Created department head user")
        
        db.session.commit()
        print("Done!")

if __name__ == "__main__":
    create_admin_and_dept_head() 