import urllib.parse
from typing import Dict, Any
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.services.docx_service import docx_service

router = APIRouter()

class DocxExportRequest(BaseModel):
    plan_data: Dict[str, Any]

@router.post("/docx")
def export_docx(req: DocxExportRequest):
    """
    สร้างและส่งออกไฟล์ Microsoft Word (.docx) ตามระเบียบสารบรรณจริง
    """
    try:
        stream = docx_service.generate_full_package(req.plan_data)
        topic = req.plan_data.get("topic", "เอกสารการสอน")
        filename = f"KruChuai_{topic}.docx"
        encoded_filename = urllib.parse.quote(filename)
        return StreamingResponse(
            stream,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
