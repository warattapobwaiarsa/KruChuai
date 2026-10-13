# ข้อกำหนดข้อมูลหลักสูตรแกนกลาง & กระบวนการ RAG (Curriculum Data & RAG Specification)

หัวใจสำคัญที่ทำให้ระบบ "ครูช่วยร่าง" แตกต่างจาก AI ทั่วไป คือการไม่สร้างรหัสตัวชี้วัดปลอม (No Hallucination on Curriculum) ผ่านการสืบค้นข้อมูลจริงจากหลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน พ.ศ. 2551 (ฉบับปรับปรุง 2560)

---

## 1. โครงสร้างชุดข้อมูลตัวชี้วัด (Curriculum Schema)

แต่ละรายการตัวชี้วัดจะถูกจัดเก็บในรูปแบบ JSON สำหรับนำไปทำ Embedding:

```json
{
  "standard_code": "ค 1.1 ป.4/3",
  "subject_group": "คณิตศาสตร์",
  "strand": "สาระที่ 1 จำนวนและพีชคณิต",
  "standard_title": "มาตรฐาน ค 1.1 เข้าใจความหลากหลายของการแสดงจำนวน ระบบจำนวน การดำเนินการของจำนวน...",
  "grade_level": "ป.4",
  "learning_objective": "ระบุ เขียน และอ่านเศษส่วน จำนวนคละ แสดงปริมาณของสิ่งต่าง ๆ และแสดงสิ่งต่าง ๆ ตามเศษส่วน จำนวนคละที่กำหนด",
  "keywords": ["เศษส่วน", "เศษส่วนที่เท่ากัน", "จำนวนคละ", "เศษส่วนอย่างต่ำ"]
}
```

---

## 2. ขั้นตอนการทำงานของ RAG Engine

```mermaid
sequenceDiagram
    autonumber
    actor Teacher as คุณครู
    participant API as FastAPI Backend
    participant VectorDB as Vector Database (Qdrant)
    participant LLM as AI Model (Gemini / GPT)

    Teacher->>API: ส่งคำขอ: วิชา "คณิตศาสตร์", ชั้น "ป.4", หัวข้อ "เศษส่วนที่เท่ากัน"
    API->>VectorDB: ค้นหาด้วย Semantic Search + กรอง Filter: subject='คณิตศาสตร์', grade='ป.4'
    VectorDB-->>API: ส่งคืนตัวชี้วัดที่ตรงที่สุด: "ค 1.1 ป.4/3"
    
    rect rgb(240, 248, 255)
    Note over API,LLM: ประกอบ System Prompt พร้อม Context จริง
    API->>LLM: ส่ง Prompt บังคับใช้ตัวชี้วัดจริง ห้ามแต่งรหัสเพิ่ม
    LLM-->>API: สร้างแผน 4 ขั้น + ใบงาน 3 ระดับ + ข้อสอบ
    end

    API-->>Teacher: แสดงผลเอกสารพร้อมแนบรหัสตัวชี้วัดทางการ
```

---

## 3. ตัวอย่างการเก็บไฟล์ชุดข้อมูลตัวชี้วัด (Sample Seed Data)

ไฟล์ตั้งต้นถูกจัดเก็บไว้ใน `backend/data/curriculum/seed_standards.json` เพื่อใช้เป็นฐานข้อมูลนำร่อง
