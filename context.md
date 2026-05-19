# Project Context: AI-Powered Multi-University Examination Governance Platform

## Overview

Enterprise-grade AI-assisted Examination Governance & Question Paper Management Platform.
**Goal:** Digitalize and secure the question paper preparation workflow using AI (Bloom taxonomy transformation, duplicate detection) with a multi-tenant university architecture.

## Tech Stack

* **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind CSS
* **Backend:** FastAPI + SQLAlchemy + Alembic (PostgreSQL)
* **Database:** PostgreSQL (Active)
* **AI Model:** Qwen2.5-1.5B-Instruct (local, via HuggingFace Transformers)
* **Auth:** JWT (PyJWT) + bcrypt (passlib) — stateless, token-based
* **UI Style:** Minimalist Neo-Brutalist — black/white, dark blue (#0a192f), red (#dc2626), sharp borders, solid shadows, lucide-react icons

## User Accounts (Seeded)

| Role       | Email                     | Password      |
| ---------- | ------------------------- | ------------- |
| COE        | coe@university.edu        | coe123        |
| Teacher    | teacher@university.edu    | teacher123    |
| SUPERADMIN | superadmin@university.edu | superadmin123 |

## Running the Project

* **Backend:** `cd backend && .\venv\Scripts\uvicorn main:app --reload`
* **Frontend:** `cd frontend && npm run dev`
* **Seed DB:** `cd backend && .\venv\Scripts\python.exe seed.py`
* **Create Superadmin:** `cd backend && .\venv\Scripts\python.exe create_superadmin.py`

---

## 🟢 What Has Been Done (Additions & Iterations)

**1. Foundation & Architecture**

- Initialized FastAPI backend and Next.js frontend.
- Setup PostgreSQL database with Alembic migrations.
- Configured JWT Authentication and RBAC (Superadmin, COE, Teacher).
- Implemented core models: User, University, Course, SystemSettings, ExamSession, QPSubmission, Notification.

**2. Superadmin Governance Dashboard (`/superadmin`)**

- Created comprehensive Superadmin dashboard with two main tabs: **Global Settings & Users** and **Course Management**.
- **System Settings:** Configurable College Name and Logo.
- **User Management:** Superadmins can provision new users with specific roles (Internal Teacher, COE, SUPERADMIN) and delete them.
- **Course Management:** Hierarchical course creation. Added support for dynamically typing custom Departments, mapping them to specific Semesters, and storing unique Course Codes and Names.
- Integrated a unified `Course Management` quick-access card directly onto the `/dashboard`.

**3. Academic Workflow (COE)**

- **Exam Sessions (`/exam-sessions`):** Dynamic dropdowns that auto-fill Course Codes based on the selected Course Name.
- COE can define blueprints (Section Name, Question Count, Marks).
- **Review Submissions (`/review-qps`):** Replaced flat search with a hierarchical **Shelf Browser** (collapsible accordion tree grouped by Semester -> Department -> Subject -> Submissions).
- **Print & Export Standardization:** Implemented `@media print` CSS rules (`print-color-adjust: exact`, margin clearing, and strict `page-break-inside: avoid` table behaviors) to perfectly mimic formal university `.docx` templates when exporting submissions to PDF.

**4. Question Paper Building (Teacher)**

- **Strict Blueprint Builder (`/qp-builder`):** Left panel strictly maps to the COE's assigned blueprint.
- Integrated AI-driven Bloom's Taxonomy rephrasing (`ai-service/bloom_ai.py` using Qwen 2.5). Iterated prompts to ensure robust, strict adherence to taxonomy templates without generating useless repetitive patterns.
- Right panel provides a live preview table mirroring the identical strict `.docx` structure seen in the COE review page, fully print-ready.

**5. Notifications & Audit Logging**

- **Notifications:** PostgreSQL-backed system alerting Teachers when assigned an exam, and alerting COEs when a paper is submitted.
- **Audit Logs (`/audit-logs`):** Immutable tracking interface for high-level security events.

---

## 🔴 Current Blockers & Issues

* **None at the moment.** The system is highly stable, interconnected, and ready for production workflows.

---

## ⚪ What Has NOT Been Done (Roadmap)

### Phase 3 & 4: Advanced Features & Scaling

- [ ] Centralized Question Bank & Semantic Search.
- [ ] Multi-level Approval Workflow Engine (e.g., adding an external reviewer/HOD layer before COE).
- [ ] Real-time Immutable Audit Logging (backend trigger integration for all DB inserts/updates).
- [ ] Document Security (Watermarking, PDF Encryption).
- [ ] Multi-tenant university architecture activation (isolating databases or rows per University ID).

---

## File Structure (Key Files)

```
examcell/
├── backend/
│   ├── main.py                          # FastAPI entry point
│   ├── seed.py                          # DB seeder
│   ├── create_superadmin.py             # Script to provision superadmin
│   ├── alembic/                         # DB migrations
│   └── app/
│       ├── core/config.py               # Pydantic settings
│       ├── core/security.py             # JWT + bcrypt
│       ├── models/                      # SQLAlchemy models (core.py, user.py, exam.py)
│       ├── api/endpoints/               # REST APIs (auth.py, core.py, exams.py)
│       └── schemas/                     # Pydantic validation
├── frontend/
│   └── src/app/
│       ├── login/page.tsx               # Unified login
│       ├── dashboard/page.tsx           # RBAC dashboard mapping
│       ├── superadmin/page.tsx          # Tabbed admin governance & course hierarchy
│       ├── exam-sessions/page.tsx       # COE workflow (Course mapping)
│       ├── qp-builder/page.tsx          # Teacher workflow (AI gen & Table preview)
│       ├── review-qps/page.tsx          # COE workflow (Shelf browser & Print layout)
│       └── audit-logs/page.tsx          # Security logs
├── ai-service/
│   ├── bloom_ai.py                      # Local Qwen2.5 transformer pipeline
│   └── requirements.txt
└── context.md                           # THIS FILE
```
