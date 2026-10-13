import json
import os
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.curriculum import CurriculumStandard
from app.core.database import SessionLocal

CURRICULUM_FILE = os.path.join(os.path.dirname(__file__), "..", "..", "data", "curriculum", "seed_standards.json")

class CurriculumService:
    def __init__(self):
        self.standards: List[Dict[str, Any]] = []
        self._load_seed_file()

    def _load_seed_file(self):
        if os.path.exists(CURRICULUM_FILE):
            try:
                with open(CURRICULUM_FILE, "r", encoding="utf-8") as f:
                    self.standards = json.load(f)
            except Exception as e:
                print(f"Error loading curriculum JSON: {e}")
                self.standards = []

    def sync_standards_to_db(self):
        """
        นำเข้าข้อมูลตัวชี้วัด สพฐ. จากไฟล์ Seed เข้าสู่ฐานข้อมูลจริง (ถ้ายังไม่มี)
        """
        try:
            db: Session = SessionLocal()
            count = db.query(CurriculumStandard).count()
            if count == 0 and self.standards:
                for item in self.standards:
                    std = CurriculumStandard(
                        standard_code=item.get("standard_code"),
                        subject_group=item.get("subject_group"),
                        grade_level=item.get("grade_level"),
                        strand=item.get("strand"),
                        learning_objective=item.get("learning_objective", ""),
                        content_description=item.get("content_description", ""),
                        keywords=item.get("keywords", [])
                    )
                    db.add(std)
                db.commit()
                print(f"Synced {len(self.standards)} curriculum standards to DB.")
            db.close()
        except Exception as e:
            print(f"Database sync skipped/failed: {e}")

    def search_relevant_standard(self, subject: str, grade: str, topic: str) -> Optional[Dict[str, Any]]:
        """
        RAG Engine: ค้นหาตัวชี้วัด สพฐ. ที่ตรงกับวิชา ชั้น และหัวข้อเนื้อหา
        ค้นหาจาก Database ก่อน และ Fallback กลับมาหา Memory
        """
        topic_lower = topic.lower()

        # 1. ลองค้นหาจาก Database
        try:
            db: Session = SessionLocal()
            # กรองตามกลุ่มสาระและระดับชั้น
            db_standards = db.query(CurriculumStandard).filter(
                CurriculumStandard.subject_group == subject,
                CurriculumStandard.grade_level == grade
            ).all()

            if db_standards:
                for std in db_standards:
                    keywords = [k.lower() for k in (std.keywords or [])]
                    if any(k in topic_lower or topic_lower in k for k in keywords):
                        res = {
                            "standard_code": std.standard_code,
                            "subject_group": std.subject_group,
                            "grade_level": std.grade_level,
                            "learning_objective": std.learning_objective,
                            "content_description": std.content_description
                        }
                        db.close()
                        return res

                # fallback: ตัวแรกของวิชาและชั้นนั้น
                first_std = db_standards[0]
                res = {
                    "standard_code": first_std.standard_code,
                    "subject_group": first_std.subject_group,
                    "grade_level": first_std.grade_level,
                    "learning_objective": first_std.learning_objective,
                    "content_description": first_std.content_description
                }
                db.close()
                return res
            db.close()
        except Exception as e:
            # Fallback to local memory if DB fails
            pass

        # 2. Local memory lookup
        for std in self.standards:
            if std.get("subject_group") == subject and std.get("grade_level") == grade:
                keywords = [k.lower() for k in std.get("keywords", [])]
                if any(k in topic_lower or topic_lower in k for k in keywords):
                    return std

        for std in self.standards:
            if std.get("subject_group") == subject and std.get("grade_level") == grade:
                return std

        for std in self.standards:
            if std.get("subject_group") == subject:
                return std

        return None

curriculum_service = CurriculumService()
