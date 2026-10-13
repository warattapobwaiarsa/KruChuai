# ข้อกำหนดฐานข้อมูลและ Data Model (Database Schema)

ระบบใช้งาน **PostgreSQL 16** ร่วมกับส่วนขยาย **pgvector**

---

## 1. ผังความสัมพันธ์ของข้อมูล (Entity Relationship Diagram)

```mermaid
erDiagram
    SCHOOLS ||--o{ USERS : "has many"
    USERS ||--o{ LESSON_PLANS : "creates"
    LESSON_PLANS ||--o{ PLAN_ITEMS : "has steps"
    LESSON_PLANS ||--o{ WORKSHEETS : "has differentiated levels"
    LESSON_PLANS ||--o{ QUIZZES : "has assessment questions"
    LESSON_PLANS ||--o{ RUBRICS : "has scoring criteria"
    CURRICULUM_STANDARDS ||--o{ LESSON_PLANS : "referenced by"

    SCHOOLS {
        uuid id PK
        string name
        string province
        string area_office
        boolean is_small_school
        timestamp created_at
    }

    USERS {
        uuid id PK
        uuid school_id FK
        string email UK
        string full_name
        string role "teacher | school_admin"
        string avatar_url
        timestamp created_at
    }

    CURRICULUM_STANDARDS {
        string standard_code PK "เช่น ค 1.1 ป.4/3"
        string subject_group "คณิตศาสตร์"
        string grade_level "ป.4"
        text learning_objective
        text content_description
        vector embedding_vector "1536 dim"
    }

    LESSON_PLANS {
        uuid id PK
        uuid user_id FK
        string standard_code FK
        string subject
        string grade_level
        string second_grade "สำหรับห้องควบ"
        string topic
        integer duration_minutes
        boolean low_resource_mode
        text materials_summary
        text adaptation_note
        boolean is_public_shared
        timestamp created_at
        timestamp updated_at
    }

    PLAN_ITEMS {
        uuid id PK
        uuid plan_id FK
        integer step_order "1, 2, 3, 4"
        string phase_name "นำ, สอน, ฝึก, สรุป"
        integer minutes
        text teacher_action
        text student_action
    }

    WORKSHEETS {
        uuid id PK
        uuid plan_id FK
        string level_name "basic | standard | advanced"
        text instructions
        jsonb questions_data "array of {question, answer}"
    }

    QUIZZES {
        uuid id PK
        uuid plan_id FK
        jsonb questions_data "array of {q, choices, answer_idx, explanation}"
    }

    RUBRICS {
        uuid id PK
        uuid plan_id FK
        jsonb criteria_data "array of {criterion, levels: [4, 3, 2, 1]}"
    }
```

---

## 2. ตัวอย่าง SQL DDL (Table Definitions)

```sql
-- เปิดส่วนขยาย UUID และ Vector
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ตารางมาตรฐานตัวชี้วัด สพฐ.
CREATE TABLE curriculum_standards (
    standard_code VARCHAR(50) PRIMARY KEY,
    subject_group VARCHAR(100) NOT NULL,
    grade_level VARCHAR(20) NOT NULL,
    learning_objective TEXT NOT NULL,
    content_description TEXT,
    embedding vector(1536)
);

-- ตารางแผนการสอน
CREATE TABLE lesson_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    standard_code VARCHAR(50) REFERENCES curriculum_standards(standard_code),
    subject VARCHAR(100) NOT NULL,
    grade_level VARCHAR(20) NOT NULL,
    second_grade VARCHAR(20),
    topic VARCHAR(255) NOT NULL,
    duration_minutes INTEGER DEFAULT 50,
    low_resource_mode BOOLEAN DEFAULT TRUE,
    adaptation_note TEXT,
    is_public_shared BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
