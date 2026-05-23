import random
from datetime import datetime, timedelta
import os
import sys

# Ensure the script can find the 'app' module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.session import SessionLocal
from app.models.core import AuditLog
from app.core.config import settings

db = SessionLocal()

def seed_audit_logs():
    print("--- Audit Log Seeding Script ---")
    print(f"Connecting to database: {settings.SQLALCHEMY_DATABASE_URI}")

    try:
        # 1. Clear existing audit logs
        num_deleted = db.query(AuditLog).delete()
        db.commit()
        print(f"Cleared {num_deleted} existing audit logs.")

        # 2. Define actors and action types
        actors = ["coe@university.edu", "teacher@university.edu", "superadmin@university.edu", "teacher2@university.edu"]
        action_types = {
            "USER_LOGIN": "User {} logged in successfully.",
            "USER_LOGOUT": "User {} logged out.",
            "EXAM_CREATED": "Created exam session: Mid-Term Exam (Data Structures)",
            "EXAM_UPDATED": "Updated exam session: Final Exam (Operating Systems)",
            "EXAM_DELETED": "Deleted exam session: Quiz 1 (Algorithms)",
            "QP_SUBMITTED": "Submitted QP for Cloud Computing for IoT",
            "QP_APPROVED": "Reviewed QP for Machine Learning - APPROVED",
            "QP_REJECTED": "Reviewed QP for Data Structures - REJECTED",
            "AI_TRANSFORM_INITIATED": "Initiated AI Transform for 15 questions.",
            "USER_CREATED": "Created user: new_teacher@university.edu with role Internal Teacher",
            "USER_DELETED": "Deleted user: old_teacher@university.edu",
            "COURSE_CREATED": "Created course: Advanced DB (CS801)",
            "COURSE_DELETED": "Deleted course: Intro to C (CS101)",
            "SETTINGS_UPDATED": "Updated college settings: T. JOHN INSTITUTE OF TECHNOLOGY"
        }

        # 3. Generate 25 new log entries
        logs_to_create = []
        for i in range(25):
            actor = random.choice(actors)
            action_key = random.choice(list(action_types.keys()))
            details_template = action_types[action_key]
            
            details = details_template
            if "{}" in details_template:
                details = details_template.format(actor)

            log = AuditLog(
                action_type=action_key,
                actor=actor,
                details=details,
                timestamp=datetime.utcnow() - timedelta(days=random.randint(0, 15), hours=random.randint(0, 23))
            )
            logs_to_create.append(log)

        # 4. Add and commit the new logs
        db.add_all(logs_to_create)
        db.commit()
        
        # 5. Verify the new count
        new_count = db.query(AuditLog).count()
        print(f"Successfully seeded {new_count} new audit logs.")

    except Exception as e:
        db.rollback()
        print(f"ERROR during audit log seeding: {e}")
    finally:
        db.close()
        print("Database session closed.")
        print("---------------------------------")

if __name__ == "__main__":
    seed_audit_logs()
