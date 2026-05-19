import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base

class Course(Base):
    __tablename__ = "courses"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, unique=True)
    code = Column(String, nullable=False, unique=True)
    department = Column(String, nullable=False, default="Computer Science Engineering")
    semester = Column(String, nullable=False, default="Semester 1")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SystemSettings(Base):
    __tablename__ = "system_settings"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    college_name = Column(String, nullable=False, default="My College")
    logo_path = Column(String, nullable=False, default="/clglogo.png")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    action_type = Column(String, nullable=False)
    actor = Column(String, nullable=False)
    details = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
