from fastapi import APIRouter
from app.api.endpoints import auth, exams, core

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(exams.router, prefix="/exams", tags=["exams"])
api_router.include_router(core.router, prefix="/core", tags=["core"])
