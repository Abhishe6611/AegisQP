from app.db.session import SessionLocal
from app.models.user import User
from app.models.core import Course, SystemSettings
from app.core.security import get_password_hash

db = SessionLocal()

def seed_database():
    print("Starting database seeding...")
    
    # 1. Seed Users
    users_to_seed = [
        {"email": "coe@university.edu", "password": "coe123", "role": "COE"},
        {"email": "teacher@university.edu", "password": "teacher123", "role": "Internal Teacher"},
        {"email": "superadmin@university.edu", "password": "superadmin123", "role": "SUPERADMIN"},
    ]
    
    for u in users_to_seed:
        existing = db.query(User).filter(User.email == u["email"]).first()
        if not existing:
            new_user = User(
                email=u["email"],
                hashed_password=get_password_hash(u["password"]),
                role=u["role"]
            )
            db.add(new_user)
            print(f"Created user: {u['email']} | Role: {u['role']}")
            
    # 2. Seed System Settings
    settings = db.query(SystemSettings).first()
    if not settings:
        settings = SystemSettings(
            college_name="T. JOHN COLLEGE",
            logo_path="/clglogo.png"
        )
        db.add(settings)
        print("Created default System Settings.")

    # 3. Seed Initial Courses
    courses_to_seed = [
        {"name": "Operating Systems", "code": "CS501", "department": "COMPUTER SCIENCE ENGINEERING", "semester": "SEMESTER 5"},
        {"name": "Data Structures", "code": "CS301", "department": "COMPUTER SCIENCE ENGINEERING", "semester": "SEMESTER 3"},
        {"name": "Cloud Computing for IoT", "code": "BCA601", "department": "BCA", "semester": "SEMESTER 6"},
        {"name": "Machine Learning", "code": "IT701", "department": "INFORMATION TECHNOLOGY", "semester": "SEMESTER 7"},
    ]
    
    for c in courses_to_seed:
        existing_course = db.query(Course).filter(Course.code == c["code"]).first()
        if not existing_course:
            new_course = Course(
                name=c["name"],
                code=c["code"],
                department=c["department"],
                semester=c["semester"]
            )
            db.add(new_course)
            print(f"Created course: {c['name']} ({c['code']}) for {c['department']} - {c['semester']}")

    try:
        db.commit()
        print("✅ Database seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"❌ Error during seeding: {e}")

if __name__ == "__main__":
    seed_database()

