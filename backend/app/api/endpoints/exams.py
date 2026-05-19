from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime
from app.api.deps import get_db
from app.models.exam import ExamSession, QPSubmission, Notification
from app.models.core import AuditLog
import uuid

router = APIRouter()


# ---- Schemas ----

class SectionSchema(BaseModel):
    section: str
    count: int
    marks: int

class ExamSessionCreate(BaseModel):
    title: str
    department: str
    semester: str
    subject: str
    course_code: Optional[str] = None
    duration: Optional[str] = None
    teacher_email: str
    sections: List[SectionSchema]

class ExamSessionUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[str] = None
    subject: Optional[str] = None
    course_code: Optional[str] = None
    duration: Optional[str] = None
    teacher_email: Optional[str] = None
    sections: Optional[List[SectionSchema]] = None

class QPSubmissionCreate(BaseModel):
    exam_session_id: Optional[str] = None
    title: str
    department: str
    semester: str
    subject: str
    course_code: Optional[str] = None
    duration: Optional[str] = None
    teacher_email: str
    paper: List[Any]

class ReviewAction(BaseModel):
    action: str  # "APPROVED" or "REJECTED"
    comment: Optional[str] = None

class NotificationCreate(BaseModel):
    to_role: Optional[str] = None
    to_email: Optional[str] = None
    message: str


# ---- Exam Session Endpoints ----

@router.get("/sessions")
def list_sessions(db: Session = Depends(get_db)):
    sessions = db.query(ExamSession).order_by(desc(ExamSession.created_at)).all()
    result = []
    for s in sessions:
        result.append({
            "id": str(s.id),
            "title": s.title,
            "department": s.department,
            "semester": s.semester,
            "subject": s.subject,
            "courseCode": s.course_code,
            "duration": s.duration,
            "teacherEmail": s.teacher_email,
            "sections": s.sections,
            "status": s.status,
            "createdAt": s.created_at.isoformat() if s.created_at else None,
        })
    return result


@router.post("/sessions")
def create_session(data: ExamSessionCreate, db: Session = Depends(get_db)):
    session = ExamSession(
        title=data.title,
        department=data.department,
        semester=data.semester,
        subject=data.subject,
        course_code=data.course_code,
        duration=data.duration,
        teacher_email=data.teacher_email,
        sections=[s.model_dump() for s in data.sections],
        status="Assigned to Teacher",
    )
    db.add(session)

    # Create notification for teacher
    notif = Notification(
        to_email=data.teacher_email,
        message=f"You have been assigned a new Exam Blueprint: {data.title} ({data.subject}).",
    )
    db.add(notif)

    # Audit log
    log = AuditLog(action_type="EXAM_CREATED", actor="COE", details=f"Created exam session: {data.title} ({data.subject})")
    db.add(log)

    db.commit()
    db.refresh(session)
    return {
        "id": str(session.id),
        "title": session.title,
        "department": session.department,
        "semester": session.semester,
        "subject": session.subject,
        "courseCode": session.course_code,
        "duration": session.duration,
        "teacherEmail": session.teacher_email,
        "sections": session.sections,
        "status": session.status,
        "createdAt": session.created_at.isoformat() if session.created_at else None,
    }


@router.put("/sessions/{session_id}")
def update_session(session_id: str, data: ExamSessionUpdate, db: Session = Depends(get_db)):
    session = db.query(ExamSession).filter(ExamSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if data.title is not None:
        session.title = data.title
    if data.department is not None:
        session.department = data.department
    if data.semester is not None:
        session.semester = data.semester
    if data.subject is not None:
        session.subject = data.subject
    if data.course_code is not None:
        session.course_code = data.course_code
    if data.duration is not None:
        session.duration = data.duration
    if data.teacher_email is not None:
        session.teacher_email = data.teacher_email
    if data.sections is not None:
        session.sections = [s.model_dump() for s in data.sections]

    session.status = "Assigned to Teacher"

    # Create notification for teacher
    notif = Notification(
        to_email=session.teacher_email,
        message=f"Exam Blueprint updated: {session.title} ({session.subject}).",
    )
    db.add(notif)

    # Audit log
    log = AuditLog(action_type="EXAM_UPDATED", actor="COE", details=f"Updated exam session: {session.title}")
    db.add(log)

    db.commit()
    db.refresh(session)
    return {
        "id": str(session.id),
        "title": session.title,
        "sections": session.sections,
        "status": session.status,
    }


@router.delete("/sessions/{session_id}")
def delete_session(session_id: str, db: Session = Depends(get_db)):
    session = db.query(ExamSession).filter(ExamSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session)
    
    # Audit log
    log = AuditLog(action_type="EXAM_DELETED", actor="COE", details=f"Deleted exam session: {session.title}")
    db.add(log)
    
    db.commit()
    return {"detail": "Session deleted"}


@router.get("/sessions/active")
def get_active_blueprint(teacher_email: str, db: Session = Depends(get_db)):
    """Get the latest active blueprint assigned to a teacher."""
    session = (
        db.query(ExamSession)
        .filter(
            ExamSession.teacher_email == teacher_email, 
            ExamSession.status.in_(["Assigned to Teacher", "REJECTED"])
        )
        .order_by(desc(ExamSession.created_at))
        .first()
    )
    if not session:
        return None
    return {
        "id": str(session.id),
        "title": session.title,
        "department": session.department,
        "semester": session.semester,
        "subject": session.subject,
        "courseCode": session.course_code,
        "duration": session.duration,
        "teacherEmail": session.teacher_email,
        "sections": session.sections,
        "status": session.status,
    }


# ---- QP Submission Endpoints ----

@router.get("/submissions")
def list_submissions(db: Session = Depends(get_db)):
    subs = db.query(QPSubmission).order_by(desc(QPSubmission.submitted_at)).all()
    result = []
    for s in subs:
        result.append({
            "id": str(s.id),
            "examSessionId": str(s.exam_session_id) if s.exam_session_id else None,
            "title": s.title,
            "department": s.department,
            "semester": s.semester,
            "subject": s.subject,
            "courseCode": s.course_code,
            "duration": s.duration,
            "teacherEmail": s.teacher_email,
            "status": s.status,
            "paper": s.paper,
            "reviewComment": s.review_comment,
            "submittedAt": s.submitted_at.isoformat() if s.submitted_at else None,
        })
    return result


@router.post("/submissions")
def create_submission(data: QPSubmissionCreate, db: Session = Depends(get_db)):
    sub = QPSubmission(
        exam_session_id=data.exam_session_id if data.exam_session_id else None,
        title=data.title,
        department=data.department,
        semester=data.semester,
        subject=data.subject,
        course_code=data.course_code,
        duration=data.duration,
        teacher_email=data.teacher_email,
        paper=data.paper,
        status="PENDING_REVIEW",
    )
    db.add(sub)

    # Update exam session status
    if data.exam_session_id:
        session = db.query(ExamSession).filter(ExamSession.id == data.exam_session_id).first()
        if session:
            session.status = "Submitted by Teacher"

    # Notify COE
    notif = Notification(
        to_role="COE",
        message=f"New QP Submission from {data.teacher_email} for {data.subject}",
    )
    db.add(notif)
    
    # Audit log
    log = AuditLog(action_type="QP_SUBMITTED", actor=data.teacher_email, details=f"Submitted QP for {data.subject}")
    db.add(log)

    db.commit()
    db.refresh(sub)
    return {"id": str(sub.id), "status": sub.status}


@router.put("/submissions/{sub_id}/review")
def review_submission(sub_id: str, data: ReviewAction, db: Session = Depends(get_db)):
    sub = db.query(QPSubmission).filter(QPSubmission.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    if data.action == "REJECTED" and not data.comment:
        raise HTTPException(status_code=400, detail="Comment is required for rejection")

    sub.status = data.action
    sub.review_comment = data.comment
    sub.reviewed_at = datetime.utcnow()

    # Update ExamSession status so the teacher knows it was rejected or approved
    if sub.exam_session_id:
        session = db.query(ExamSession).filter(ExamSession.id == sub.exam_session_id).first()
        if session:
            session.status = data.action

    # Notify teacher
    msg = f"Your QP for {sub.subject} has been {data.action}."
    if data.comment:
        msg += f" Comment: {data.comment}"

    notif = Notification(to_email=sub.teacher_email, message=msg)
    db.add(notif)
    
    # Audit log
    log = AuditLog(action_type=f"QP_{data.action}", actor="COE", details=f"Reviewed QP for {sub.subject} - {data.action}")
    db.add(log)

    db.commit()
    return {"status": sub.status}


# ---- Notification Endpoints ----

@router.get("/notifications")
def list_notifications(role: Optional[str] = None, email: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Notification).filter(Notification.is_read == False)
    if role:
        query = query.filter(Notification.to_role == role)
    if email:
        query = query.filter(Notification.to_email == email)
    notifs = query.order_by(desc(Notification.created_at)).all()
    return [
        {
            "id": str(n.id),
            "toRole": n.to_role,
            "toEmail": n.to_email,
            "message": n.message,
            "date": n.created_at.isoformat() if n.created_at else None,
        }
        for n in notifs
    ]


@router.delete("/notifications/clear")
def clear_notifications(role: Optional[str] = None, email: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Notification)
    if role:
        query = query.filter(Notification.to_role == role)
    if email:
        query = query.filter(Notification.to_email == email)
    query.update({Notification.is_read: True})
    db.commit()
    return {"detail": "Notifications cleared"}
