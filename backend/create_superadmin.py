import asyncio
from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

db = SessionLocal()
superadmin = db.query(User).filter(User.email == "superadmin@university.edu").first()
if superadmin:
    superadmin.hashed_password = get_password_hash("superadmin123")
    superadmin.role = "SUPERADMIN"
    superadmin.is_active = True
    db.commit()
    print("Reset superadmin password to superadmin123 and role to SUPERADMIN")
