import re

with open(r'e:\examcell\backend\app\api\endpoints\exams.py', 'r') as f:
    content = f.read()

# Fix list_sessions
content = re.sub(
    r'("subject": s\.subject,)(\s*)("teacherEmail": s\.teacher_email,)',
    r'\1\2"courseCode": s.course_code,\2"duration": s.duration,\2\3',
    content
)

# Fix create_session
content = re.sub(
    r'(subject=data\.subject,)(\s*)(teacher_email=data\.teacher_email,)',
    r'\1\2course_code=data.course_code,\2duration=data.duration,\2\3',
    content
)
content = re.sub(
    r'("subject": session\.subject,)(\s*)("teacherEmail": session\.teacher_email,)',
    r'\1\2"courseCode": session.course_code,\2"duration": session.duration,\2\3',
    content
)

# Fix get_active_blueprint
content = re.sub(
    r'("subject": session\.subject,)(\s*)("teacherEmail": session\.teacher_email,)',
    r'\1\2"courseCode": session.course_code,\2"duration": session.duration,\2\3',
    content
)

# Fix list_submissions
content = re.sub(
    r'("subject": s\.subject,)(\s*)("teacherEmail": s\.teacher_email,)',
    r'\1\2"courseCode": s.course_code,\2"duration": s.duration,\2\3',
    content
)

# Fix create_submission
content = re.sub(
    r'(subject=data\.subject,)(\s*)(teacher_email=data\.teacher_email,)',
    r'\1\2course_code=data.course_code,\2duration=data.duration,\2\3',
    content
)

with open(r'e:\examcell\backend\app\api\endpoints\exams.py', 'w') as f:
    f.write(content)
