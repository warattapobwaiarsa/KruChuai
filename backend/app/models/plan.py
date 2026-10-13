import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, JSON, ForeignKey
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=True)
    full_name = Column(String(255), default="คุณครูผู้สอน")
    school_name = Column(String(255), default="โรงเรียนขนาดเล็ก")
    role = Column(String(50), default="teacher")
    created_at = Column(DateTime, default=datetime.utcnow)

class LessonPlan(Base):
    __tablename__ = "lesson_plans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    subject = Column(String(100), nullable=False)
    grade_level = Column(String(50), nullable=False)
    is_multi_grade = Column(Boolean, default=False)
    second_grade = Column(String(50), nullable=True)
    topic = Column(String(255), nullable=False)
    duration_minutes = Column(Integer, default=50)
    low_resource_mode = Column(Boolean, default=True)
    standard_code = Column(String(50), nullable=True)
    full_plan_json = Column(JSON, nullable=False)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
