# ครูช่วยร่าง (KruChuai) - Production Platform

> **ผู้ช่วยครูลดงานเอกสารด้วย AI สำหรับโรงเรียนขนาดเล็ก**  
> AI-Powered Lesson Planning, Differentiated Worksheets & Multi-Grade Orchestration for Thai Teachers

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js 14](https://img.shields.io/badge/Frontend-Next.js%2014-black.svg?logo=next.js)]()
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.111-009688.svg?logo=fastapi)]()
[![Google Gemini](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-4285F4.svg?logo=google)]()
[![Docker Ready](https://img.shields.io/badge/Docker-Compose%20Ready-2496ED.svg?logo=docker)]()
[![Target: JUMP Hackathon 2026](https://img.shields.io/badge/JUMP%20Hackathon-Empowering%20Teachers-amber.svg)]()

---

## 📌 สารบัญ (Table of Contents)

- [1. ที่มาและปัญหา (Problem Statement)](#1-ที่มาและปัญหา-problem-statement)
- [2. ฟีเจอร์เด่นของแพลตฟอร์ม (Key Features)](#2-ฟีเจอร์เด่นของแพลตฟอร์ม-key-features)
- [3. สถาปัตยกรรมระบบ (System Architecture)](#3-สถาปัตยกรรมระบบ-system-architecture)
- [4. โครงสร้าง Repository (Directory Structure)](#4-โครงสร้าง-repository-directory-structure)
- [5. การเริ่มต้นใช้งานด่วน (Quick Start)](#5-การเริ่มต้นใช้งานด่วน-quick-start)
  - [5.1 รันบนเครื่องทันที (Local Development)](#51-รันบนเครื่องทันที-local-development)
  - [5.2 รันผ่าน Docker Compose (Full-Stack)](#52-รันผ่าน-docker-compose-full-stack)
  - [5.3 ใช้งานแบบ Standalone Demo (ไม่ต้องลงโปรแกรม)](#53-ใช้งานแบบ-standalone-demo-ไม่ต้องลงโปรแกรม)
- [6. เอกสารคู่มือและการวิจัย (Documentation & Guides)](#6-เอกสารคู่มือและการวิจัย-documentation--guides)
- [7. การตั้งค่า Environment Variables](#7-การตั้งค่า-environment-variables)
- [8. สิทธิ์การใช้งาน (License)](#8-สิทธิ์การใช้งาน-license)

---

## 1. ที่มาและปัญหา (Problem Statement)

ในบริบทของ**โรงเรียนขนาดเล็กในประเทศไทย** (ซึ่งมีสัดส่วนมากกว่าครึ่งหนึ่งของโรงเรียนสังกัด สพฐ.) คุณครูต้องแบกรับภาระงานหนักเป็นพิเศษ:
1. **การสอนควบหลายระดับชั้น (Multi-Grade):** ครู 1 คนต้องดูแลนักเรียนต่างระดับชั้นในห้องเดียวกัน เช่น ป.3 ควบ ป.4 ทำให้การจัดการชั้นเรียนและแบ่งเวลาเป็นเรื่องยาก
2. **ข้อจำกัดด้านอุปกรณ์ (Low-Tech / Limited Resources):** โรงเรียนส่วนใหญ่ไม่มีจอโปรเจกเตอร์หรือสัญญาณอินเทอร์เน็ตที่เสถียร สื่อการสอนต้องพึ่งพาสิ่งของรอบตัว กระดานดำ และใบงานกระดาษ
3. **ภาระงานเอกสารซ้ำซ้อน:** ทุกสัปดาห์ครูต้องจัดทำแผนการจัดการเรียนรู้ 4 ขั้นตอน (Active Learning), จัดทำใบงานแยกตามระดับความสามารถ, ออกแบบข้อสอบ และจัดทำเกณฑ์การประเมิน (Rubric K-P-A) ส่งฝ่ายวิชาการ

**"ครูช่วยร่าง (KruChuai)"** ถูกออกแบบมาเพื่อทำหน้าที่เป็น **"Human-in-the-Loop AI Assistant"** ที่ร่างโครงสร้างเอกสารราชการที่ถูกต้องตามหลักสูตรแกนกลาง สพฐ. 2551 ให้ครูตรวจสอบ ปรับแก้ และสั่งพิมพ์หรือดาวน์โหลด Word ไปใช้งานได้จริงภายในเวลาไม่ถึง 1 นาที

---

## 2. ฟีเจอร์เด่นของแพลตฟอร์ม (Key Features)

- ⚡ **1-Click Presets สาธิตทันที:** แม่แบบยอดนิยมสำหรับห้องเรียนขนาดเล็ก (สอนควบ ป.3+ป.4 เศษส่วน, ไร้เน็ต ส่วนประกอบพืช ป.2, อ่านเขียนสระเสียงยาว ป.1)
- 🏫 **โหมดสอนควบชั้น (Multi-Grade Parallel Orchestration):** AI จะสร้างกิจกรรมการเรียนรู้แบบสลับบทบาท (ครูสอนกลุ่มหนึ่ง มอบหมายงานอีกกลุ่มหนึ่ง) ป้องกันการเกิด Dead-air ในห้องเรียน
- 📶 **โหมดอุปกรณ์จำกัด (Low-Tech Mode):** ปรับสื่อการสอนอัตโนมัติ ไม่เสนอสื่อที่ต้องพึ่งพาจอหรืออินเทอร์เน็ต แต่เน้นใช้วัสดุธรรมชาติ กระดานดำ ชอล์ก และแถบกระดาษ
- 📄 **Studio Mode & In-place Editor:** หน้าจอผืนกระดาษเสมือนจริง A4 จัดหน้ากระดาษราชการ พร้อมให้คลิกพิมพ์แก้ไขข้อความได้ทันที (WYSIWYG)
- 📝 **ใบงานจำแนก 3 ระดับ (Differentiated Worksheets):** พร้อมกรอบหัวกระดาษของนักเรียน (ชื่อ, ชั้น, เลขที่, คะแนน) แยกการ์ดสีชัดเจน (พื้นฐาน / ปานกลาง / ท้าทาย)
- ❓ **Interactive Assessment Station:** แบบทดสอบปรนัยที่คลิกทำบนหน้าจอได้จริง พร้อมระบบเฉลยและคำอธิบายเชิงเหตุผลทางวิชาการ
- 📊 **Scoring Rubric Matrix:** ตารางประเมินผล 4 ระดับคุณภาพ ครอบคลุม K-P-A
- 📚 **ระบบคลังแผนการสอน (My Library):** บันทึกแผนการสอนลงสู่ฐานข้อมูลจริง และเปิดกลับมาแก้ไขได้ตลอดเวลา
- 📥 **Export to Word (.docx) & Print A4:** ส่งออกเป็นไฟล์ Word สารบรรณ ฟอนต์ TH Sarabun PSK กั้นหน้า 1 นิ้ว พร้อมพิมพ์หรือลงนามส่งผู้บริหารทันที

---

## 3. สถาปัตยกรรมระบบ (System Architecture)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 14)                           │
│  - Studio Mode Interactive Dashboard                                   │
│  - Tailwind CSS + PostCSS + Sarabun Typography                         │
│  - Inline Editable Document Viewer                                     │
│  - Print-to-A4 & Export Docx Engine                                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST API
┌───────────────────────────────────▼────────────────────────────────────┐
│                      Backend Core API (FastAPI)                        │
│  - Clean Architecture (api/v1, core, models, services)                 │
│  - Lesson Plan Lifecycle & History Manager                             │
│  - Official Docx Builder (python-docx + TH Sarabun PSK)                │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
┌───────────────────▼─────────────┐   ┌──────────────▼───────────────────┐
│  AI Engine & RAG Service        │   │  Storage & Persistence           │
│  - Google Gemini 1.5 Flash      │   │  - PostgreSQL 16 + pgvector      │
│  - Heuristic Offline Fallback   │   │  - SQLite (Local Dev Fallback)   │
│  - Curriculum Standards (สพฐ.)  │   │  - Redis 7 (Cache & Task Queue)  │
└─────────────────────────────────┘   └──────────────────────────────────┘
```

---

## 4. โครงสร้าง Repository (Directory Structure)

```
KruChuai/
├── docs/                                # เอกสารสถาปัตยกรรมและคู่มือการใช้งาน
│   ├── USER_GUIDE.md                    # 📖 คู่มือการใช้งานระบบฉบับสมบูรณ์สำหรับครู
│   ├── ARCHITECTURE.md                  # สถาปัตยกรรมระบบฉบับเต็ม
│   ├── CURRICULUM_DATA_SPEC.md          # สเปกข้อมูลตัวชี้วัดและ RAG
│   ├── DATABASE_SCHEMA.md               # รายละเอียด Data Model & ERD
│   ├── NEXT_PHASE_ROADMAP.md            # แผนงานการพัฒนาต่อยอด
│   └── USER_TESTING_GUIDE.md            # คู่มือทดสอบ A/B Testing กับครูจริง
├── backend/                             # Python FastAPI Backend & AI RAG
│   ├── app/
│   │   ├── api/v1/                      # REST API Endpoints (plans, curriculum, export)
│   │   ├── core/                        # Config, Database Engine & Settings
│   │   ├── models/                      # SQLAlchemy Data Models (User, Plan, Standard)
│   │   └── services/                    # Gemini AI Engine, Curriculum RAG & Docx Builder
│   │   └── main.py                      # FastAPI Application Entry Point
│   ├── data/curriculum/                 # ข้อมูลตัวชี้วัด สพฐ. 2551 (seed_standards.json)
│   ├── requirements.txt                 # รายการไลบรารี Python
│   ├── Dockerfile                       # Container สำหรับ Backend
│   └── .env.example                     # ตัวอย่างการตั้งค่า Environment Variables
├── frontend/                            # Next.js 14 Web Application
│   ├── src/
│   │   └── app/                         # App Router (Studio Dashboard, Layout, CSS)
│   ├── package.json                     # Node.js dependencies
│   ├── postcss.config.js                # PostCSS Tailwind Configuration
│   ├── tailwind.config.ts               # Tailwind CSS theme
│   └── Dockerfile                       # Container สำหรับ Frontend
├── index.html                           # ⚡ Standalone Prototype (เปิดทดสอบทันทีบน Browser)
├── docker-compose.yml                   # รันทั้งระบบ (DB, Backend, Frontend)
├── .env.example                         # ตัวอย่างค่าคอนฟิกสำหรับ Docker Compose
├── .gitignore                           # Git Ignore สำหรับโปรเจกต์
└── README.md                            # เอกสารภาพรวมโปรเจกต์ (เอกสารนี้)
```

---

## 5. การเริ่มต้นใช้งานด่วน (Quick Start)

### 5.1 รันบนเครื่องทันที (Local Development)

#### 1. ฝั่ง Backend (Python FastAPI):
```bash
cd backend

# ติดตั้ง Dependencies
pip install -r requirements.txt

# สั่งรัน API Server (พอร์ต 8000)
python -m uvicorn app.main:app --reload --port 8000
```
- API Documentation เข้าถึงได้ที่: `http://localhost:8000/docs`

#### 2. ฝั่ง Frontend (Next.js 14):
```bash
cd frontend

# ติดตั้ง Dependencies
npm install

# สั่งรัน Web Server (พอร์ต 3000)
npm run dev
```
- เปิดหน้าเว็บที่: `http://localhost:3000`

---

### 5.2 รันผ่าน Docker Compose (Full-Stack)

สำหรับการรันระบบเต็มรูปแบบ (PostgreSQL, Redis, Backend, Frontend) ในคำสั่งเดียว:

```bash
# คัดลอก environment file
cp .env.example .env

# รันระบบทั้งหมด
docker-compose up -d --build
```
- **Frontend Dashboard:** `http://localhost:3000`
- **Backend Swagger API:** `http://localhost:8000/docs`

---

### 5.3 ใช้งานแบบ Standalone Demo (ไม่ต้องลงโปรแกรม)

สำหรับกรรมการหรือผู้ใช้ที่ต้องการทดลองเล่นแนวคิดทันทีโดยไม่ต้องติดตั้ง Environment:
- ดับเบิลคลิกเปิดไฟล์ `index.html` บนเบราว์เซอร์ (Google Chrome, Edge หรือ Safari) ใช้งานได้ทันทีแบบ Offline

---

## 6. เอกสารคู่มือและการวิจัย (Documentation & Guides)

- 📖 **[คู่มือการใช้งานระบบฉบับสมบูรณ์ (User Guide)](docs/USER_GUIDE.md)** - สอนการใช้งานอย่างละเอียดทุกขั้นตอน
- 🏗️ **[คู่มือสถาปัตยกรรมระบบ (Architecture Spec)](docs/ARCHITECTURE.md)** - โครงสร้างระบบ แผนผัง C4 และมาตรการความปลอดภัย
- 🗄️ **[ข้อกำหนดฐานข้อมูล (Database Schema)](docs/DATABASE_SCHEMA.md)** - แผนผัง ER Diagram และ SQL DDL
- 🎯 **[ข้อมูลตัวชี้วัด สพฐ. และ RAG Pipeline](docs/CURRICULUM_DATA_SPEC.md)** - โครงสร้างข้อมูลหลักสูตรแกนกลาง
- 🧪 **[แบบแผนการทดสอบ A/B Testing ร่วมกับครู](docs/USER_TESTING_GUIDE.md)** - ระเบียบวิธีวิจัยและตัวชี้วัดความพึงพอใจ
- 🚀 **[แผนงานการพัฒนาต่อยอด 4 สปรินต์](docs/NEXT_PHASE_ROADMAP.md)** - แผนขยายผลสู่โรงเรียนขนาดเล็กทั่วประเทศ

---

## 7. การตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ `backend/` หรือ Root โดยมีค่าดังนี้:

```env
# Google Gemini API Key (ใส่ Key เพื่อใช้ AI จริง หรือปล่อยว่างเพื่อใช้ Heuristic Fallback)
GEMINI_API_KEY=your_gemini_api_key_here

# Database Connection (ใช้ PostgreSQL สำหรับ Docker หรือ SQLite สำหรับ Local)
DATABASE_URL=sqlite:///./kruchuai.db

# Redis Connection (สำหรับ Caching และ Queue)
REDIS_URL=redis://localhost:6379/0
```

---

## 8. สิทธิ์การใช้งาน (License)

โปรเจกต์นี้เผยแพร่ภายใต้สัญญาอนุญาต **MIT License** เปิดกว้างให้คุณครูและนักพัฒนาทั่วประเทศนำไปใช้งานและพัฒนาต่อยอดได้อย่างเสรี

---
*จัดทำขึ้นภายใต้โครงการ JUMP Hackathon 2026: AI for the Future of Thai Education*
