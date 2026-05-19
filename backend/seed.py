from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

db = SessionLocal()

def seed_users():
    # Check if COE exists
    coe = db.query(User).filter(User.email == "coe@university.edu").first()
    if not coe:
        coe = User(
            email="coe@university.edu",
            hashed_password=get_password_hash("coe123"),
            role="COE"
        )
        db.add(coe)
        print("Created COE user: coe@university.edu / coe123")
    
    # Check if Teacher exists
    teacher = db.query(User).filter(User.email == "teacher@university.edu").first()
    if not teacher:
        teacher = User(
            email="teacher@university.edu",
            hashed_password=get_password_hash("teacher123"),
            role="Teacher"
        )
        db.add(teacher)
        print("Created Teacher user: teacher@university.edu / teacher123")
        
    # Check if SuperAdmin exists
    superadmin = db.query(User).filter(User.email == "superadmin@university.edu").first()
    if not superadmin:
        superadmin = User(
            email="superadmin@university.edu",
            hashed_password=get_password_hash("admin123"),
            role="SUPERADMIN"
        )
        db.add(superadmin)
        print("Created SuperAdmin user: superadmin@university.edu / admin123")
        
    db.commit()
    print("Database seeding complete!")

if __name__ == "__main__":
    seed_users()
