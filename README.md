# ครูช่วยร่าง (KruChuai) - Production Platform

> **ผู้ช่วยครูลดงานเอกสารด้วย AI สำหรับโรงเรียนขนาดเล็ก**  
> AI-Powered Lesson Planning, Differentiated Worksheets & Multi-Grade Orchestration for Thai Teachers

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status: Architecture & Prototype](https://img.shields.io/badge/Status-Prototype%20v1%20Ready-green.svg)]()
[![Target: JUMP Hackathon 2026](https://img.shields.io/badge/JUMP%20Hackathon-Empowering%20Teachers-amber.svg)]()

---

## 📌 สารบัญ

- [1. ที่มาและปัญหา (Problem Statement)](#1-ที่มาและปัญหา-problem-statement)
- [2. สถาปัตยกรรมระบบ (System Architecture)](#2-สถาปัตยกรรมระบบ-system-architecture)
- [3. โครงสร้าง Repository (Directory Tree)](#3-โครงสร้าง-repository-directory-tree)
- [4. แผนงานการพัฒนา (Roadmap)](#4-แผนงานการพัฒนา-roadmap)
- [5. การเริ่มต้นใช้งาน Prototype ทันที (Quick Start Demo)](#5-การเริ่มต้นใช้งาน-prototype-ทันที-quick-start-demo)
- [6. แนวทางการติดตั้งระบบ Full-stack Production](#6-แนวทางการติดตั้งระบบ-full-stack-production)
- [7. เอกสารอ้างอิงและคู่มือในโปรเจกต์](#7-เอกสารอ้างอิงและคู่มือในโปรเจกต์)

---

## 1. ที่มาและปัญหา (Problem Statement)

ในบริบทของ**โรงเรียนขนาดเล็กในประเทศไทย** คุณครูมักต้องแบกรับภาระหนัก:
1. **การสอนควบหลายชั้นเรียน (Multi-grade):** ต้องจัดการสอน ป.3 ควบ ป.4 หรือ ป.1 ควบ ป.2 ในห้องเดียวกัน
2. **ข้อจำกัดด้านอุปกรณ์ (Low-tech / Limited Resource):** ไม่มีสัญญาณอินเทอร์เน็ตที่เสถียรหรือโปรเจกเตอร์ในห้องเรียน
3. **ภาระงานเอกสารซ้ำซ้อน:** ต้องจัดทำแผนการสอน 4 ขั้น, ใบงานแยกตามระดับความสามารถ, แบบทดสอบ และ Rubric ประเมินผลทุกสัปดาห์

**"ครูช่วยร่าง"** ถูกออกแบบมาเพื่อทำหน้าที่เป็น **"ผู้ช่วยร่างแรก (Human-in-the-loop AI Assistant)"** ให้ครูควบคุม ตรวจสอบ และสั่งพิมพ์หรือคัดลอกไปใช้งานได้จริงในห้องเรียน

---

## 2. สถาปัตยกรรมระบบ (System Architecture)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 14)                           │
│  - Dual-Pane Interactive Dashboard                                     │
│  - Inline Editable Document Viewer                                     │
│  - 1-Click Multi-grade / Low-tech Presets                              │
│  - Print-to-A4 & Export Docx Engine                                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST / Server Actions
┌───────────────────────────────────▼────────────────────────────────────┐
│                   Backend Core API (FastAPI / Node.js)                 │
│  - Auth (Google for Education / LINE Login)                            │
│  - Lesson Plan Lifecycle & Storage Manager                             │
│  - Document Exporter (python-docx + WeasyPrint)                        │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
┌───────────────────▼─────────────┐   ┌──────────────▼───────────────────┐
│  AI Engine & RAG Service        │   │  Storage & Persistence           │
│  - Curriculum Vector Store      │   │  - PostgreSQL (User & Plans)     │
│    (ตัวชี้วัด สพฐ. แกนกลาง 2551) │   │  - Redis (Queue & Caching)       │
│  - Differentiated Worksheet AI  │   │  - S3 / R2 (Exported Files)      │
│  - LLM: Gemini / OpenAI / Thai  │   └──────────────────────────────────┘
└─────────────────────────────────┘
```

---

## 3. โครงสร้าง Repository (Directory Tree)

```
KruChuai/
├── docs/                                # เอกสารสถาปัตยกรรมและการวิจัย
│   ├── ARCHITECTURE.md                  # สถาปัตยกรรมระบบจริงฉบับเต็ม
│   ├── CURRICULUM_DATA_SPEC.md          # สเปกข้อมูลตัวชี้วัดและ RAG
│   ├── DATABASE_SCHEMA.md               # รายละเอียด Data Model & ERD
│   └── USER_TESTING_GUIDE.md            # คู่มือทดสอบ A/B Testing กับครูจริง
├── backend/                             # Python FastAPI Backend & AI RAG
│   ├── app/
│   │   ├── api/                         # REST API Endpoints (plans, export)
│   │   ├── core/                        # Config, Database & Security
│   │   ├── models/                      # SQLAlchemy Data Models & Pydantic
│   │   └── services/                    # AI Agent, RAG Pipeline & Docx Builder
│   ├── data/curriculum/                 # ไฟล์ข้อมูลตัวชี้วัด สพฐ. (JSON/Vector)
│   ├── requirements.txt                 # รายการไลบรารี Python
│   └── Dockerfile                       # Container สำหรับ Backend
├── frontend/                            # Next.js 14 Web Application
│   ├── src/
│   │   ├── app/                         # Next.js App Router (Dashboard, View)
│   │   ├── components/                  # UI Components (Forms, DocViewer)
│   │   └── lib/                         # Utilities (Export docx, API client)
│   ├── package.json                     # Node.js dependencies
│   └── tailwind.config.ts               # Tailwind CSS theme
├── index.html                           # ⚡ Functional Prototype (พร้อมทดสอบทันที)
├── KruChuai_Prototype_Design.md         # เอกสารการออกแบบฉบับดั้งเดิม
├── docker-compose.yml                   # รันทั้งระบบ (DB, Backend, Frontend)
└── README.md                            # คำอธิบายโปรเจกต์ (เอกสารนี้)
```

---

## 4. แผนงานการพัฒนา (Roadmap)

```
Phase 1: Foundation (สัปดาห์ 1-3)
├── Setup Next.js, Postgres & Auth
└── สร้างฐานข้อมูลตัวชี้วัดหลักสูตรแกนกลาง สพฐ. 2551

Phase 2: Core Platform (สัปดาห์ 4-6)
├── ระบบ RAG & In-place Editor
└── Document Exporter (.docx สารบรรณราชการ)

Phase 3: Pilot Testing (สัปดาห์ 7-9)
├── นำร่องทดสอบในโรงเรียนขนาดเล็ก 5 แห่ง (A/B Test)
└── ปรับปรุง Prompt และความถูกต้องวิชาการ

Phase 4: Community & Scale (สัปดาห์ 10-12)
└── Teacher Sharing Hub (คลังแผนการสอนเพื่อเพื่อนครู)
```

---

## 5. การเริ่มต้นใช้งาน Prototype ทันที (Quick Start Demo)

สำหรับกรรมการหรือผู้ใช้ที่ต้องการทดสอบฟังก์ชันทันที โดยไม่ต้องติดตั้ง environment ใดๆ:

1. เปิดไฟล์ `index.html` บนเบราว์เซอร์ (Google Chrome, Edge หรือ Safari)
2. ทดลองคลิกปุ่ม **1-Click Preset** ด้านบน เช่น:
   - 🏫 **สอนควบ ป.3 + ป.4 (เศษส่วน)**
   - 📶 **ไร้เน็ต/ไร้จอ (ส่วนประกอบของพืช ป.2)**
   - 📖 **อ่านเขียนเบื้องต้น (สระเสียงยาว ป.1)**
3. คลิกแก้ไขข้อความในเอกสารขวามือได้ทันที
4. ทดสอบกดปุ่ม **"💾 ดาวน์โหลด Word"** หรือ **"🖨️ พิมพ์เอกสาร A4"**

---

## 6. แนวทางการติดตั้งระบบ Full-stack Production

### สิ่งที่ต้องติดตั้งล่วงหน้า (Prerequisites)
- Docker & Docker Compose
- Node.js 18+ และ Python 3.10+

### การรันผ่าน Docker Compose
```bash
# คัดลอก environment variable
cp backend/.env.example backend/.env

# รันระบบทั้งหมด
docker-compose up -d
```
- Frontend เข้าถึงได้ที่: `http://localhost:3000`
- Backend Swagger API เข้าถึงได้ที่: `http://localhost:8000/docs`

---

## 7. เอกสารอ้างอิงและคู่มือในโปรเจกต์

- [คู่มือสถาปัตยกรรมระบบฉบับเต็ม](docs/ARCHITECTURE.md)
- [ข้อกำหนดฐานข้อมูลและ Data Model](docs/DATABASE_SCHEMA.md)
- [กระบวนการ RAG และฐานข้อมูลหลักสูตร สพฐ.](docs/CURRICULUM_DATA_SPEC.md)
- [แบบแผนการทดสอบ A/B Testing ร่วมกับครู](docs/USER_TESTING_GUIDE.md)

---
*จัดทำขึ้นภายใต้โครงการ JUMP Hackathon 2026: AI for the Future of Thai Education*
