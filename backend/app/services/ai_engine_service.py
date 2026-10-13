import os
import json
import logging
from typing import Dict, Any, List, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class AIEngineService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        self.client = None
        self._init_gemini()

    def _init_gemini(self):
        # ตรวจสอบ API key ล่าสุด
        self.api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                logger.info("Google GenAI client initialized successfully.")
            except Exception as e:
                logger.warning(f"Could not initialize GenAI client: {e}")
                self.client = None
        else:
            self.client = None

    def generate_content(
        self,
        subject: str,
        grade: str,
        is_multi_grade: bool,
        second_grade: str,
        topic: str,
        duration: int,
        low_resource: bool,
        standard: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        AI Content Generation Engine:
        1. พยายามเรียกใช้ Gemini 1.5 Flash API ก่อน
        2. หากไม่มี API key หรือเกิดข้อผิดพลาด จะ Fallback ไปยัง Heuristic Template โดยอัตโนมัติ
        """
        # ลองอัปเดต client หากเพิ่งมีการตั้งค่า key
        if not self.client and (settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")):
            self._init_gemini()

        if self.client:
            try:
                result = self._generate_with_gemini(
                    subject=subject,
                    grade=grade,
                    is_multi_grade=is_multi_grade,
                    second_grade=second_grade,
                    topic=topic,
                    duration=duration,
                    low_resource=low_resource,
                    standard=standard
                )
                if result:
                    return result
            except Exception as e:
                logger.error(f"Gemini API call failed, falling back to heuristic engine: {e}")

        # Fallback Engine (Reliable, fast, offline-ready)
        return self._generate_heuristic_template(
            subject=subject,
            grade=grade,
            is_multi_grade=is_multi_grade,
            second_grade=second_grade,
            topic=topic,
            duration=duration,
            low_resource=low_resource,
            standard=standard
        )

    def _generate_with_gemini(
        self,
        subject: str,
        grade: str,
        is_multi_grade: bool,
        second_grade: str,
        topic: str,
        duration: int,
        low_resource: bool,
        standard: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        grade_text = f"{grade} ควบ {second_grade}" if is_multi_grade else grade
        std_code = standard.get("standard_code", "") if standard else ""
        std_desc = standard.get("learning_objective", "") if standard else ""

        system_instruction = (
            "คุณคือผู้เชี่ยวชาญด้านหลักสูตรการศึกษาขั้นพื้นฐาน สพฐ. ของไทย "
            "เชี่ยวชาญการออกแบบการสอนสำหรับโรงเรียนขนาดเล็ก ครู 1 คนสอนหลายชั้นเรียน (Multi-grade) "
            "และการจัดการเรียนรู้แบบ Active Learning ในบริบทอุปกรณ์และอินเทอร์เน็ตจำกัด (Low-tech) "
            "จงตอบกลับเป็นรูปแบบ JSON บริสุทธิ์ (Pure JSON) เท่านั้น โดยไม่มี markdown formatting หรือ backticks"
        )

        user_prompt = f"""
กรุณาร่างชุดเอกสารการจัดการเรียนรู้ 4 ชนิดครบวงจร ตามเงื่อนไขต่อไปนี้:
- วิชา: {subject}
- ชั้นเรียน: {grade_text} (โหมดควบชั้น: {is_multi_grade})
- หัวข้อ: {topic}
- เวลาสอน: {duration} นาที
- โหมดอุปกรณ์และเน็ตจำกัด: {'เปิดใช้งาน (ใช้วัสดุจริง กระดาน ใบงาน ห้ามใช้โปรเจกเตอร์หรือเน็ต)' if low_resource else 'ห้องเรียนทั่วไป'}
- ตัวชี้วัด สพฐ. ที่อ้างอิง: {std_code} ({std_desc})

ให้ส่งออกผลลัพธ์เป็นโครงสร้าง JSON ดังนี้:
{{
  "objectives": ["จุดประสงค์ด้านความรู้ (K)", "จุดประสงค์ด้านทักษะกระบวนการ (P)", "จุดประสงค์ด้านเจตคติ (A)"],
  "materials": "ระบุสื่อการสอนที่สอดคล้องกับโหมดอุปกรณ์จำกัด",
  "steps": [
    {{"phase": "1. ขั้นนำเข้าสู่บทเรียน", "minutes": 8, "teacher": "บทบาทครู", "students": "บทบาทนักเรียน"}},
    {{"phase": "2. ขั้นจัดการเรียนรู้ (สอน)", "minutes": 17, "teacher": "บทบาทครู (ถ้าสอนควบระบุแบ่งบทบาท)", "students": "บทบาทนักเรียน"}},
    {{"phase": "3. ขั้นฝึกปฏิบัติ", "minutes": 18, "teacher": "บทบาทครู", "students": "บทบาทนักเรียน"}},
    {{"phase": "4. ขั้นสรุปและวัดผล", "minutes": 7, "teacher": "บทบาทครู", "students": "บทบาทนักเรียน"}}
  ],
  "worksheets": {{
    "levels": [
      {{"name": "ระดับ 1: พื้นฐาน (Scaffolding)", "instructions": "คำชี้แจง", "items": [{{"q": "โจทย์ 1", "a": "เฉลย"}}, {{"q": "โจทย์ 2", "a": "เฉลย"}}]}},
      {{"name": "ระดับ 2: ปานกลาง (Standard Level)", "instructions": "คำชี้แจง", "items": [{{"q": "โจทย์ 1", "a": "เฉลย"}}, {{"q": "โจทย์ 2", "a": "เฉลย"}}]}},
      {{"name": "ระดับ 3: ท้าทาย (Advanced Challenge)", "instructions": "คำชี้แจง", "items": [{{"q": "โจทย์ 1", "a": "เฉลย"}}]}}
    ]
  }},
  "quiz": [
    {{"q": "คำถามปรนัย 1", "choices": ["ก. ...", "ข. ...", "ค. ...", "ง. ..."], "answer": 0, "why": "คำอธิบายเหตุผล"}},
    {{"q": "คำถามปรนัย 2", "choices": ["ก. ...", "ข. ...", "ค. ...", "ง. ..."], "answer": 1, "why": "คำอธิบายเหตุผล"}}
  ],
  "rubric": [
    {{"name": "1. ความถูกต้องทางวิชาการ", "levels": ["ระดับดีมาก (4)", "ระดับดี (3)", "ระดับพอใช้ (2)", "ระดับปรับปรุง (1)"]}},
    {{"name": "2. ทักษะกระบวนการและการแก้ปัญหา", "levels": ["ระดับดีมาก (4)", "ระดับดี (3)", "ระดับพอใช้ (2)", "ระดับปรับปรุง (1)"]}},
    {{"name": "3. คุณลักษณะอันพึงประสงค์", "levels": ["ระดับดีมาก (4)", "ระดับดี (3)", "ระดับพอใช้ (2)", "ระดับปรับปรุง (1)"]}}
  ]
}}
เวลาใน 4 ขั้นรวมกันต้องเท่ากับ {duration} นาทีพอดี
"""

        try:
            response = self.client.models.generate_content(
                model="gemini-1.5-flash",
                contents=user_prompt,
                config={
                    "system_instruction": system_instruction,
                    "response_mime_type": "application/json",
                    "temperature": 0.4
                }
            )

            text_content = response.text.strip()
            # Clean possible markdown wrapping
            if text_content.startswith("```json"):
                text_content = text_content[7:]
            if text_content.startswith("```"):
                text_content = text_content[3:]
            if text_content.endswith("```"):
                text_content = text_content[:-3]
            
            parsed = json.loads(text_content.strip())
            
            # Enrich with common fields
            parsed["subject"] = subject
            parsed["grade_level"] = grade_text
            parsed["topic"] = topic
            parsed["duration_minutes"] = duration
            parsed["low_resource_mode"] = low_resource
            parsed["standard_code"] = std_code
            parsed["standard_desc"] = std_desc
            parsed["ai_provider"] = "Google Gemini 1.5 Flash"
            return parsed
        except Exception as e:
            logger.warning(f"Error parsing Gemini response: {e}")
            return None

    def _generate_heuristic_template(
        self,
        subject: str,
        grade: str,
        is_multi_grade: bool,
        second_grade: str,
        topic: str,
        duration: int,
        low_resource: bool,
        standard: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        grade_text = f"{grade} ควบ {second_grade}" if is_multi_grade else grade

        t1 = max(5, round(duration * 0.15))
        t2 = round(duration * 0.35)
        t3 = round(duration * 0.35)
        t4 = duration - (t1 + t2 + t3)

        std_code = standard.get("standard_code", "") if standard else ""
        std_desc = standard.get("learning_objective", "") if standard else ""

        steps = [
            {
                "phase": "1. ขั้นนำเข้าสู่บทเรียน",
                "minutes": t1,
                "teacher": f"ครูใช้คำถามกระตุ้นความคิด เชื่อมโยงสถานการณ์รอบตัวเข้ากับเรื่อง '{topic}' {'(ใช้วัสดุในท้องถิ่นหรือชอล์กวาดบนกระดาน ไม่ต้องพึ่งจอ)' if low_resource else ''}",
                "students": "นักเรียนร่วมกันสังเกต ตอบคำถาม และแลกเปลี่ยนประสบการณ์เดิมที่เกี่ยวข้อง"
            },
            {
                "phase": "2. ขั้นจัดการเรียนรู้ (สอน)",
                "minutes": t2,
                "teacher": f"ครูอธิบายมโนทัศน์สำคัญของ '{topic}' พร้อมสาธิตตัวอย่างรูปธรรม {f'โดยมอบหมายงานทบทวนให้ชั้น {second_grade} ก่อนสลับมาอธิบายชั้น {grade}' if is_multi_grade else ''}",
                "students": "นักเรียนลงมือปฏิบัติตามกิจกรรม จดบันทึกประเด็นสำคัญ และซักถามข้อสงสัย"
            },
            {
                "phase": "3. ขั้นฝึกปฏิบัติ",
                "minutes": t3,
                "teacher": "แจกใบงานแยกตามระดับความสามารถ (พื้นฐาน/ปานกลาง/ท้าทาย) ครูคอยเดินสังเกตและให้คำแนะนำแก่นักเรียนที่ต้องการการสนับสนุนเป็นพิเศษ",
                "students": "ลงมือทำใบงานตามระดับความสามารถของตนเอง สามารถปรึกษาคู่เพื่อน (Peer Tutoring) ได้"
            },
            {
                "phase": "4. ขั้นสรุปและวัดผล",
                "minutes": t4,
                "teacher": f"สุ่มตัวแทนนักเรียนนำเสนอข้อค้นพบ ครูและทั้งชั้นร่วมกันสรุปหลักการสำคัญของเรื่อง '{topic}'",
                "students": f"ร่วมกันสรุปบทเรียน บันทึกข้อคิด และทำแบบทดสอบวัดความเข้าใจประจำบท"
            }
        ]

        worksheets = {
            "levels": [
                {
                    "name": "ระดับ 1: พื้นฐาน (Scaffolding)",
                    "instructions": f"เติมคำหรือเลือกคำตอบที่ถูกต้องเกี่ยวกับ {topic} โดยสังเกตตัวอย่างที่กำหนดให้",
                    "items": [
                        {"q": f"1) จงระบุความหมายหรือลักษณะสำคัญของ {topic}", "a": "ตามเกณฑ์พื้นฐานที่ครูอธิบาย"},
                        {"q": f"2) จงเติมคำลงในช่องว่างเกี่ยวกับ {topic}", "a": "มโนทัศน์หลัก"}
                    ]
                },
                {
                    "name": "ระดับ 2: ปานกลาง (Standard Level)",
                    "instructions": f"แสดงวิธีคิดหรืออธิบายขั้นตอนการแก้ปัญหาเรื่อง {topic}",
                    "items": [
                        {"q": f"1) จงแสดงขั้นตอนการหาคำตอบเกี่ยวกับ {topic}", "a": "แสดงวิธีทำตามมาตรฐานหลักสูตร"},
                        {"q": f"2) เปรียบเทียบความแตกต่างระหว่างสองกรณีของ {topic}", "a": "วิเคราะห์ความสัมพันธ์"}
                    ]
                },
                {
                    "name": "ระดับ 3: ท้าทาย (Advanced Challenge)",
                    "instructions": f"วิเคราะห์สถานการณ์ปัญหาเชิงประยุกต์และเสนอแนวทางแก้ไข",
                    "items": [
                        {"q": f"1) หากพบปัญหาในชีวิตจริงเกี่ยวกับ {topic} นักเรียนจะวางแผนแก้อย่างไร?", "a": "การบูรณาการแก้ปัญหาเชิงสร้างสรรค์"}
                    ]
                }
            ]
        }

        quiz = [
            {
                "q": f"ข้อใดอธิบายความหมายของ '{topic}' ได้ถูกต้องที่สุด?",
                "choices": [
                    f"ก. หลักการและกระบวนการตามนิยามมาตรฐานของ {topic}",
                    "ข. การดำเนินการโดยไม่มีกฎเกณฑ์แน่นอน",
                    "ค. วิธีการที่ใช้ได้เฉพาะในห้องปฏิบัติการเท่านั้น",
                    "ง. ไม่มีข้อใดถูกต้อง"
                ],
                "answer": 0,
                "why": f"นิยามข้อ ก. เป็นไปตามหลักวิชาและมาตรฐานของกลุ่มสาระ {subject}"
            },
            {
                "q": f"การเรียนรู้เรื่อง '{topic}' มีประโยชน์ต่อชีวิตประจำวันอย่างไร?",
                "choices": [
                    "ก. ช่วยในการท่องจำเพื่อสอบเท่านั้น",
                    "ข. นำไปใช้วางแผน ตัดสินใจ และแก้ปัญหาในชีวิตจริงได้อย่างเป็นระบบ",
                    "ค. ทำให้ไม่ต้องเรียนวิชาอื่นเพิ่มเติม",
                    "ง. ไม่มีประโยชน์ในชีวิตประจำวัน"
                ],
                "answer": 1,
                "why": "ทักษะดังกล่าวช่วยเสริมสร้างกระบวนการคิดวิเคราะห์และการประยุกต์ใช้จริง"
            }
        ]

        rubric = [
            {
                "name": f"1. ความถูกต้องทางวิชาการ ({topic})",
                "levels": [
                    "ถูกต้องครบถ้วน แสดงวิธีคิดชัดเจนทุกข้อ (4 คะแนน)",
                    "ถูกต้องเป็นส่วนใหญ่ ผิดพลาดเล็กน้อย 1 จุด (3 คะแนน)",
                    "ถูกต้องบางส่วน ต้องมีคำแนะนำเพิ่มเติม (2 คะแนน)",
                    "ยังไม่เข้าใจหลักการสำคัญ (1 คะแนน)"
                ]
            },
            {
                "name": "2. ทักษะการปฏิบัติและแก้ปัญหา",
                "levels": [
                    "ปฏิบัติกิจกรรมได้อย่างคล่องแคล่วและแก้ปัญหาได้เอง (4 คะแนน)",
                    "ปฏิบัติกิจกรรมได้เรียบร้อยตามคำสั่ง (3 คะแนน)",
                    "ปฏิบัติได้เมื่อมีเพื่อนหรือครูคอยแนะนำ (2 คะแนน)",
                    "ไม่สามารถปฏิบัติกิจกรรมได้สำเร็จ (1 คะแนน)"
                ]
            },
            {
                "name": "3. การมีส่วนร่วมและการทำงานร่วมกัน",
                "levels": [
                    "กระตือรือร้นและช่วยเหลือเพื่อนร่วมชั้นอย่างสม่ำเสมอ (4 คะแนน)",
                    "ให้ความร่วมมือและทำงานของตนเสร็จสมบูรณ์ (3 คะแนน)",
                    "ร่วมกิจกรรมเมื่อครูกระตุ้นเตือน (2 คะแนน)",
                    "ไม่ให้ความร่วมมือในกิจกรรมกลุ่ม (1 คะแนน)"
                ]
            }
        ]

        return {
            "subject": subject,
            "grade_level": grade_text,
            "topic": topic,
            "duration_minutes": duration,
            "low_resource_mode": low_resource,
            "standard_code": std_code,
            "standard_desc": std_desc,
            "ai_provider": "Heuristic Adaptive Engine (Offline Fallback)",
            "objectives": [
                f"เข้าใจและอธิบายหลักการของ {topic} ได้อย่างถูกต้อง (K)",
                f"สามารถปฏิบัติและแก้ปัญหาโจทย์ {topic} ตามระดับความสามารถได้ (P)",
                "มีความรับผิดชอบและร่วมมือในการทำกิจกรรมในชั้นเรียน (A)"
            ],
            "materials": "กระดานดำ, ชอล์ก, บัตรคำหรือแถบกระดาษ, ใบงาน 3 ระดับ" if low_resource else "จอโปรเจกเตอร์, คอมพิวเตอร์, ใบงาน 3 ระดับ",
            "steps": steps,
            "worksheets": worksheets,
            "quiz": quiz,
            "rubric": rubric
        }

ai_engine_service = AIEngineService()
