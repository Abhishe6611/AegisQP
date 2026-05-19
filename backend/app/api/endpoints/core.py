from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.user import User
from app.models.core import Course, SystemSettings, AuditLog
from pydantic import BaseModel
import datetime

router = APIRouter()

# Schemas
class AuditLogResponse(BaseModel):
    id: str
    action_type: str
    actor: str
    details: str
    timestamp: str

class UserCreate(BaseModel):
    email: str
    password: str
    role: str

class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    is_active: bool

class CourseCreate(BaseModel):
    name: str
    code: str
    department: str
    semester: str

class CourseResponse(BaseModel):
    id: str
    name: str
    code: str
    department: str
    semester: str

class SettingsUpdate(BaseModel):
    college_name: str
    logo_path: str

# Users endpoints
@router.get("/users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [{"id": str(u.id), "email": u.email, "role": u.role, "is_active": u.is_active} for u in users]

@router.post("/users", response_model=UserResponse)
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    from app.core.security import get_password_hash
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=data.email,
        hashed_password=get_password_hash(data.password),
        role=data.role
    )
    db.add(user)
    
    log = AuditLog(action_type="USER_CREATED", actor="SUPERADMIN", details=f"Created user: {user.email} with role {user.role}")
    db.add(log)
    
    db.commit()
    db.refresh(user)
    return {"id": str(user.id), "email": user.email, "role": user.role, "is_active": user.is_active}

@router.delete("/users/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    
    log = AuditLog(action_type="USER_DELETED", actor="SUPERADMIN", details=f"Deleted user: {user.email}")
    db.add(log)
    
    db.commit()
    return {"detail": "User deleted"}

# Courses endpoints
@router.get("/courses", response_model=List[CourseResponse])
def get_courses(db: Session = Depends(get_db)):
    courses = db.query(Course).all()
    return [{"id": str(c.id), "name": c.name, "code": c.code, "department": c.department, "semester": c.semester} for c in courses]

@router.post("/courses", response_model=CourseResponse)
def create_course(data: CourseCreate, db: Session = Depends(get_db)):
    existing_code = db.query(Course).filter(Course.code == data.code).first()
    if existing_code:
        raise HTTPException(status_code=400, detail="Course code already exists")
        
    existing_name = db.query(Course).filter(Course.name == data.name).first()
    if existing_name:
        raise HTTPException(status_code=400, detail="Course name already exists")
    
    course = Course(name=data.name, code=data.code, department=data.department, semester=data.semester)
    db.add(course)
    
    log = AuditLog(action_type="COURSE_CREATED", actor="SUPERADMIN", details=f"Created course: {course.name} ({course.code})")
    db.add(log)
    
    db.commit()
    db.refresh(course)
    return {"id": str(course.id), "name": course.name, "code": course.code, "department": course.department, "semester": course.semester}

@router.delete("/courses/{course_id}")
def delete_course(course_id: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    
    log = AuditLog(action_type="COURSE_DELETED", actor="SUPERADMIN", details=f"Deleted course: {course.name} ({course.code})")
    db.add(log)
    
    db.commit()
    return {"detail": "Course deleted"}

# Settings endpoints
@router.get("/settings")
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(SystemSettings).first()
    if not settings:
        settings = SystemSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return {"college_name": settings.college_name, "logo_path": settings.logo_path}

@router.put("/settings")
def update_settings(data: SettingsUpdate, db: Session = Depends(get_db)):
    settings = db.query(SystemSettings).first()
    if not settings:
        settings = SystemSettings()
        db.add(settings)
    
    settings.college_name = data.college_name
    settings.logo_path = data.logo_path
    db.commit()
    
    log = AuditLog(action_type="SETTINGS_UPDATED", actor="SUPERADMIN", details=f"Updated college settings: {settings.college_name}")
    db.add(log)
    db.commit()
    
    return {"college_name": settings.college_name, "logo_path": settings.logo_path}

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()
    return [{"id": str(log.id), "action_type": log.action_type, "actor": log.actor, "details": log.details, "timestamp": log.timestamp.isoformat()} for log in logs]
