import io
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

class DocxExportService:
    @staticmethod
    def set_cell_background(cell, fill_hex):
        tcPr = cell._tc.get_or_add_tcPr()
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
        tcPr.append(shd)

    @classmethod
    def generate_full_package(cls, data: dict) -> io.BytesIO:
        """
        สร้างไฟล์ .docx เอกสารทางการศึกษา (แผนการสอน, ใบงาน 3 ระดับ, แบบทดสอบ, Rubric)
        """
        doc = Document()

        # Page Setup A4
        for section in doc.sections:
            section.top_margin = Inches(0.8)
            section.bottom_margin = Inches(0.8)
            section.left_margin = Inches(0.8)
            section.right_margin = Inches(0.8)

        # Main Header
        title = doc.add_paragraph()
        title_run = title.add_run("แผนการจัดการเรียนรู้และชุดสื่อการสอน")
        title_run.font.name = "TH Sarabun PSK"
        title_run.font.size = Pt(20)
        title_run.font.bold = True
        title.alignment = WD_ALIGN_PARAGRAPH.CENTER

        sub = doc.add_paragraph()
        sub_run = sub.add_run(f"เรื่อง: {data.get('topic')} | กลุ่มสาระการเรียนรู้: {data.get('subject')} | ชั้น: {data.get('grade_level')}")
        sub_run.font.name = "TH Sarabun PSK"
        sub_run.font.size = Pt(16)
        sub_run.font.bold = True
        sub.alignment = WD_ALIGN_PARAGRAPH.CENTER

        # Metadata info
        meta_p = doc.add_paragraph()
        time_text = f"เวลาเรียน: {data.get('duration_minutes', 50)} นาที | โหมดห้องเรียน: {'อุปกรณ์และเน็ตจำกัด (Low-tech)' if data.get('low_resource_mode') else 'ปกติ'}"
        meta_run = meta_p.add_run(time_text)
        meta_run.font.name = "TH Sarabun PSK"
        meta_run.font.size = Pt(14)

        if data.get("standard_code"):
            std_p = doc.add_paragraph()
            std_run = std_p.add_run(f"ตัวชี้วัด สพฐ.: {data.get('standard_code')} - {data.get('standard_desc', '')}")
            std_run.font.name = "TH Sarabun PSK"
            std_run.font.size = Pt(14)
            std_run.font.italic = True

        doc.add_paragraph()

        # 1. Lesson Plan Section
        h1 = doc.add_paragraph()
        h1_run = h1.add_run("1. แผนการจัดการเรียนรู้ (กระบวนการ 4 ขั้นตอน)")
        h1_run.font.name = "TH Sarabun PSK"
        h1_run.font.size = Pt(16)
        h1_run.font.bold = True

        # Objectives
        doc.add_paragraph("จุดประสงค์การเรียนรู้:", style='List Bullet')
        for obj in data.get("objectives", []):
            p = doc.add_paragraph(obj, style='List Bullet 2')
            for r in p.runs:
                r.font.name = "TH Sarabun PSK"
                r.font.size = Pt(14)

        # Steps Table
        table = doc.add_table(rows=1, cols=4)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        hdr_cells = table.rows[0].cells
        headers = ["ขั้นตอน", "เวลา", "บทบาทครู", "บทบาทนักเรียน"]
        for idx, text in enumerate(headers):
            hdr_cells[idx].text = text
            cls.set_cell_background(hdr_cells[idx], "E2E8F0")
            for p in hdr_cells[idx].paragraphs:
                for r in p.runs:
                    r.font.name = "TH Sarabun PSK"
                    r.font.size = Pt(14)
                    r.font.bold = True

        steps = data.get("steps", [])
        for step in steps:
            row_cells = table.add_row().cells
            row_cells[0].text = step.get("phase", "")
            row_cells[1].text = f"{step.get('minutes', '')} นาที"
            row_cells[2].text = step.get("teacher", "")
            row_cells[3].text = step.get("students", "")
            for cell in row_cells:
                for p in cell.paragraphs:
                    for r in p.runs:
                        r.font.name = "TH Sarabun PSK"
                        r.font.size = Pt(13)

        doc.add_page_break()

        # 2. Differentiated Worksheets Section
        h2 = doc.add_paragraph()
        h2_run = h2.add_run("2. ใบงานการเรียนรู้แยก 3 ระดับความสามารถ")
        h2_run.font.name = "TH Sarabun PSK"
        h2_run.font.size = Pt(16)
        h2_run.font.bold = True

        levels = data.get("worksheets", {}).get("levels", [])
        for lvl in levels:
            lvl_p = doc.add_paragraph()
            lvl_run = lvl_p.add_run(f"• {lvl.get('name')}")
            lvl_run.font.name = "TH Sarabun PSK"
            lvl_run.font.size = Pt(14)
            lvl_run.font.bold = True

            inst_p = doc.add_paragraph(f"คำชี้แจง: {lvl.get('instructions')}")
            for r in inst_p.runs:
                r.font.name = "TH Sarabun PSK"
                r.font.size = Pt(13)

            for item in lvl.get("items", []):
                it_p = doc.add_paragraph(f"- {item.get('q')}  (คำตอบ: {item.get('a')})")
                for r in it_p.runs:
                    r.font.name = "TH Sarabun PSK"
                    r.font.size = Pt(13)
            doc.add_paragraph()

        doc.add_page_break()

        # 3. Quiz Section
        h3 = doc.add_paragraph()
        h3_run = h3.add_run("3. แบบทดสอบปรนัยวัดความเข้าใจ (พร้อมเฉลยและเหตุผล)")
        h3_run.font.name = "TH Sarabun PSK"
        h3_run.font.size = Pt(16)
        h3_run.font.bold = True

        for idx, q_item in enumerate(data.get("quiz", []), 1):
            qp = doc.add_paragraph(f"{idx}. {q_item.get('q')}")
            for r in qp.runs:
                r.font.name = "TH Sarabun PSK"
                r.font.size = Pt(14)
                r.font.bold = True

            for choice in q_item.get("choices", []):
                cp = doc.add_paragraph(f"    {choice}")
                for r in cp.runs:
                    r.font.name = "TH Sarabun PSK"
                    r.font.size = Pt(13)

            ans_p = doc.add_paragraph(f"เฉลย: {q_item.get('choices')[q_item.get('answer', 0)]} | เหตุผล: {q_item.get('why', '')}")
            for r in ans_p.runs:
                r.font.name = "TH Sarabun PSK"
                r.font.size = Pt(12)
                r.font.color.rgb = RGBColor(0x15, 0x80, 0x3D)
            doc.add_paragraph()

        # 4. Rubric Section
        h4 = doc.add_paragraph()
        h4_run = h4.add_run("4. เกณฑ์การประเมิน (Scoring Rubric)")
        h4_run.font.name = "TH Sarabun PSK"
        h4_run.font.size = Pt(16)
        h4_run.font.bold = True

        rubric_table = doc.add_table(rows=1, cols=5)
        rubric_table.alignment = WD_TABLE_ALIGNMENT.CENTER
        rhdr = rubric_table.rows[0].cells
        r_cols = ["เกณฑ์", "ดีมาก (4)", "ดี (3)", "พอใช้ (2)", "ปรับปรุง (1)"]
        for idx, text in enumerate(r_cols):
            rhdr[idx].text = text
            cls.set_cell_background(rhdr[idx], "FEE2E2")
            for p in rhdr[idx].paragraphs:
                for r in p.runs:
                    r.font.name = "TH Sarabun PSK"
                    r.font.size = Pt(14)
                    r.font.bold = True

        for crit in data.get("rubric", []):
            row_cells = rubric_table.add_row().cells
            row_cells[0].text = crit.get("name", "")
            for i in range(4):
                if i < len(crit.get("levels", [])):
                    row_cells[i+1].text = crit.get("levels")[i]
            for cell in row_cells:
                for p in cell.paragraphs:
                    for r in p.runs:
                        r.font.name = "TH Sarabun PSK"
                        r.font.size = Pt(12)

        file_stream = io.BytesIO()
        doc.save(file_stream)
        file_stream.seek(0)
        return file_stream

docx_service = DocxExportService()
