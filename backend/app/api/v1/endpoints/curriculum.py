from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.curriculum import CurriculumStandard
from app.services.curriculum_service import curriculum_service

router = APIRouter()

@router.get("/search")
def search_curriculum(subject: str, grade: str, topic: str):
    """
    RAG Endpoint: ค้นหาตัวชี้วัด สพฐ. ที่ตรงกับหัวข้อ
    """
    std = curriculum_service.search_relevant_standard(subject, grade, topic)
    return {"found": bool(std), "standard": std}

@router.get("/standards")
def list_standards(subject: Optional[str] = None, grade: Optional[str] = None, db: Session = Depends(get_db)):
    """
    ดึงรายการตัวชี้วัดทั้งหมด หรือกรองตามวิชาและชั้น
    """
    query = db.query(CurriculumStandard)
    if subject:
        query = query.filter(CurriculumStandard.subject_group == subject)
    if grade:
        query = query.filter(CurriculumStandard.grade_level == grade)
    
    standards = query.limit(50).all()
    results = [
        {
            "standard_code": s.standard_code,
            "subject_group": s.subject_group,
            "grade_level": s.grade_level,
            "learning_objective": s.learning_objective,
            "keywords": s.keywords
        }
        for s in standards
    ]
    return {"success": True, "count": len(results), "standards": results}
