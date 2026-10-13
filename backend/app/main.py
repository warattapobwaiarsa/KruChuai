from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import init_db
from app.services.curriculum_service import curriculum_service
from app.api.v1.router import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    try:
        init_db()
        curriculum_service.sync_standards_to_db()
        print("KruChuai backend initialized successfully.")
    except Exception as e:
        print(f"Warning during startup DB init: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="ระบบ Backend เต็มรูปแบบสำหรับร่างเอกสารการสอน RAG ตัวชี้วัด สพฐ. จัดเก็บประวัติ และส่งออกไฟล์ Word",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(api_router, prefix="/api")
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
@app.get("/health")
def health():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "standards_in_memory": len(curriculum_service.standards),
        "database_connected": True
    }
