from fastapi import APIRouter
from app.api.v1.endpoints import plans, curriculum, export

api_router = APIRouter()

api_router.include_router(plans.router, prefix="/plans", tags=["Plans"])
api_router.include_router(curriculum.router, prefix="/curriculum", tags=["Curriculum"])
api_router.include_router(export.router, prefix="/export", tags=["Export"])
