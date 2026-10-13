import uuid
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.plan import LessonPlan
from app.services.curriculum_service import curriculum_service
from app.services.ai_engine_service import ai_engine_service

router = APIRouter()

class GeneratePlanRequest(BaseModel):
    subject: str
    grade_level: str
    is_multi_grade: bool = False
    second_grade: Optional[str] = None
    topic: str
    duration_minutes: int = 50
    low_resource_mode: bool = True
    standard_code: Optional[str] = None

class SavePlanRequest(BaseModel):
    plan_data: Dict[str, Any]

@router.post("/generate")
def generate_plan(req: GeneratePlanRequest):
    """
    สร้างชุดเอกสารการสอน 4 ชนิดครบวงจร ผ่าน RAG Pipeline และ Google Gemini / Heuristic Engine
    """
    std = curriculum_service.search_relevant_standard(req.subject, req.grade_level, req.topic)

    content = ai_engine_service.generate_content(
        subject=req.subject,
        grade=req.grade_level,
        is_multi_grade=req.is_multi_grade,
        second_grade=req.second_grade or "ป.5",
        topic=req.topic,
        duration=req.duration_minutes,
        low_resource=req.low_resource_mode,
        standard=std
    )
    return {"success": True, "data": content}

@router.post("/save")
def save_plan(req: SavePlanRequest, db: Session = Depends(get_db)):
    """
    บันทึกแผนการสอนลงสู่ฐานข้อมูลจริง (PostgreSQL / SQLite)
    """
    data = req.plan_data
    plan = LessonPlan(
        id=str(uuid.uuid4()),
        subject=data.get("subject", "ทั่วไป"),
        grade_level=data.get("grade_level", "ป.1"),
        is_multi_grade="ควบ" in str(data.get("grade_level", "")),
        topic=data.get("topic", "ไม่มีหัวข้อ"),
        duration_minutes=data.get("duration_minutes", 50),
        low_resource_mode=data.get("low_resource_mode", True),
        standard_code=data.get("standard_code"),
        full_plan_json=data
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return {"success": True, "id": plan.id, "message": "บันทึกแผนการสอนเรียบร้อยแล้ว"}

@router.get("/history")
def get_plans_history(limit: int = 20, db: Session = Depends(get_db)):
    """
    ดึงประวัติแผนการสอนที่เคยบันทึกไว้ในระบบ
    """
    plans = db.query(LessonPlan).order_by(LessonPlan.created_at.desc()).limit(limit).all()
    results = []
    for p in plans:
        results.append({
            "id": p.id,
            "topic": p.topic,
            "subject": p.subject,
            "grade_level": p.grade_level,
            "duration_minutes": p.duration_minutes,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "full_plan_json": p.full_plan_json
        })
    return {"success": True, "count": len(results), "plans": results}

@router.get("/{plan_id}")
def get_plan_by_id(plan_id: str, db: Session = Depends(get_db)):
    """
    ดึงข้อมูลแผนการสอนฉบับสมบูรณ์ตาม ID
    """
    plan = db.query(LessonPlan).filter(LessonPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return {"success": True, "plan": plan.full_plan_json}
