from sqlalchemy import Column, String, Text, JSON
from app.core.database import Base

class CurriculumStandard(Base):
    __tablename__ = "curriculum_standards"

    standard_code = Column(String(50), primary_key=True, index=True)
    subject_group = Column(String(100), nullable=False, index=True)
    grade_level = Column(String(20), nullable=False, index=True)
    strand = Column(String(100), nullable=True)
    learning_objective = Column(Text, nullable=False)
    content_description = Column(Text, nullable=True)
    keywords = Column(JSON, default=list)
