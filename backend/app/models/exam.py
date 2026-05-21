import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Integer, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.base import Base


class ExamSession(Base):
    __tablename__ = "exam_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    department = Column(String, nullable=False)
    semester = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    course_code = Column(String, nullable=True)
    duration = Column(String, nullable=True, default="3 Hours")
    teacher_email = Column(String, nullable=False)
    # Sections stored as JSON array: [{section, count, marks}, ...]
    sections = Column(JSON, nullable=False, default=[])
    status = Column(String, nullable=False, default="Assigned to Teacher")
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class QPSubmission(Base):
    __tablename__ = "qp_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_session_id = Column(UUID(as_uuid=True), ForeignKey("exam_sessions.id"), nullable=True)
    title = Column(String, nullable=False)
    department = Column(String, nullable=False)
    semester = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    course_code = Column(String, nullable=True)
    duration = Column(String, nullable=True, default="3 Hours")
    teacher_email = Column(String, nullable=False)
    status = Column(String, nullable=False, default="PENDING_REVIEW")
    # Full paper data as JSON
    paper = Column(JSON, nullable=False, default=[])
    review_comment = Column(String, nullable=True)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    to_role = Column(String, nullable=True)
    to_email = Column(String, nullable=True)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
