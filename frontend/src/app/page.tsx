"use client";

import React, { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function HomePage() {
  const [subject, setSubject] = useState("คณิตศาสตร์");
  const [grade, setGrade] = useState("ป.4");
  const [isMultiGrade, setIsMultiGrade] = useState(false);
  const [secondGrade, setSecondGrade] = useState("ป.3");
  const [topic, setTopic] = useState("เศษส่วนที่เท่ากัน");
  const [minutes, setMinutes] = useState(50);
  const [isLowTech, setIsLowTech] = useState(true);
  const [activeTab, setActiveTab] = useState<"plan" | "worksheets" | "quiz" | "rubric">("plan");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Interactive Quiz State (Which choice user clicked for each question)
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number }>({});

  // Modals
  const [showHistory, setShowHistory] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [customApiKey, setCustomApiKey] = useState("");
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Document contents
  const [docData, setDocData] = useState<any>({
    title: "แผนการจัดการเรียนรู้: เศษส่วนที่เท่ากัน",
    subject: "คณิตศาสตร์",
    grade_level: "ป.4",
    duration_minutes: 50,
    low_resource_mode: true,
    standard_code: "ค 1.1 ป.4/1",
    standard_desc: "เปรียบเทียบและเรียงลำดับเศษส่วนและจำนวนคละที่ตัวส่วนตัวหนึ่งเป็นพหุคูณของอีกตัวหนึ่ง",
    ai_provider: "ระบบพร้อมเชื่อมต่อ AI (Google Gemini 1.5 Flash)",
    objectives: [
      "อธิบายความหมายและลักษณะของเศษส่วนที่เท่ากันได้ถูกต้อง (K)",
      "หาเศษส่วนที่เท่ากันโดยการพับกระดาษและการคูณหรือหารด้วยจำนวนเดียวกันได้ (P)",
      "มีความกระตือรือร้นและมีส่วนร่วมในการทำกิจกรรมกลุ่ม (A)",
    ],
    materials: "แถบกระดาษ A4 ตัดเป็นเส้นยาว (คนละ 3 เส้น), กรรไกร, ไม้บรรทัด, สีไม้, กระดานดำและชอล์ก",
    steps: [
      {
        phase: "1. ขั้นนำเข้าสู่บทเรียน",
        minutes: 8,
        teacher: "ครูถือกระดาษ 1 แผ่น พับครึ่งแล้วถามนักเรียนว่าแต่ละส่วนคือเท่าไร (1/2) จากนั้นหยิบอีกแผ่นพับเป็น 4 ส่วน ระบายสี 2 ส่วนแล้วถามว่าพื้นที่เท่ากันไหม",
        students: "ร่วมกันสังเกต ตอบคำถาม เปรียบเทียบพื้นที่กระดาษทั้งสองแผ่นด้วยสายตา"
      },
      {
        phase: "2. ขั้นจัดการเรียนรู้ (สอน)",
        minutes: 17,
        teacher: "แจกแถบกระดาษให้นักเรียนคนละ 3 เส้น นำนักเรียนพับเส้นที่ 1 เป็น 2 ส่วน (1/2), เส้นที่ 2 เป็น 4 ส่วน (2/4), เส้นที่ 3 เป็น 6 ส่วน (3/6) เชื่อมโยงสู่หลักคณิตศาสตร์: การคูณตัวเศษและส่วนด้วยตัวเลขเดียวกัน",
        students: "ลงมือพับกระดาษตามขั้นตอน ระบายสีตามเศษส่วนที่กำหนด แล้วนำแถบกระดาษมาวางทาบเทียบความยาวร่วมกัน"
      },
      {
        phase: "3. ขั้นฝึกปฏิบัติ",
        minutes: 18,
        teacher: "แจกใบงานแยกตามระดับความสามารถ (ระดับพื้นฐาน/กลาง/ท้าทาย) เดินสังเกตและให้คำแนะนำกลุ่มที่ต้องการความช่วยเหลือเป็นพิเศษ",
        students: "ทำใบงานตามระดับของตนเอง ปรึกษาเพื่อนข้างเคียงได้ หากทำเสร็จก่อนสามารถช่วยอธิบายเพื่อนในคู่ของตนได้"
      },
      {
        phase: "4. ขั้นสรุปและวัดผล",
        minutes: 7,
        teacher: "สุ่มตัวแทน 2 คนออกมาเขียนเศษส่วนที่เท่ากันบนกระดาน ครูและเพื่อนช่วยกันตรวจทาน สรุปบทเรียนร่วมกัน",
        students: "สรุปหลักการร่วมกันว่า เศษส่วนที่เท่ากันเกิดจากการคูณหรือหารทั้งตัวเศษและส่วนด้วยจำนวนเดียวกันที่ไม่ใช่ศูนย์"
      },
    ],
    worksheets: {
      levels: [
        {
          name: "ระดับ 1: พื้นฐาน (Scaffolding)",
          theme: "emerald",
          description: "เหมาะสำหรับนักเรียนที่ต้องการโครงสร้างช่วยจำ มีตัวอย่างและกรอบใบ้ชัดเจน",
          instructions: "เติมตัวเลขลงในช่องว่างเพื่อให้ได้เศษส่วนที่เท่ากัน โดยสังเกตรูปภาพหรือตัวคูณที่กำหนด",
          items: [
            { q: "1) 1/2 = [ ? ] / 4 (สังเกต: นำ 2 มาคูณทั้งเศษและส่วน)", a: "2" },
            { q: "2) 1/3 = [ ? ] / 6 (สังเกต: นำ 2 มาคูณทั้งเศษและส่วน)", a: "2" },
            { q: "3) 2/5 = [ ? ] / 10 (สังเกต: นำ 2 มาคูณทั้งเศษและส่วน)", a: "4" }
          ]
        },
        {
          name: "ระดับ 2: ปานกลาง (Standard Level)",
          theme: "blue",
          description: "เหมาะสำหรับนักเรียนส่วนใหญ่ แสดงขั้นตอนการคำนวณตามเกณฑ์มาตรฐาน",
          instructions: "จงหาเศษส่วนที่เท่ากับเศษส่วนต่อไปนี้มาอีก 2 จำนวน พร้อมแสดงวิธีคิด",
          items: [
            { q: "1) 3/4 = ............ และ ............", a: "6/8 (คูณ 2) และ 9/12 (คูณ 3)" },
            { q: "2) 5/6 = ............ และ ............", a: "10/12 (คูณ 2) และ 15/18 (คูณ 3)" }
          ]
        },
        {
          name: "ระดับ 3: ท้าทาย (Advanced Challenge)",
          theme: "purple",
          description: "โจทย์ประยุกต์สถานการณ์จริง พัฒนาทักษะการคิดวิเคราะห์ขั้นสูง",
          instructions: "วิเคราะห์โจทย์สถานการณ์ปัญหาในชีวิตประจำวันและแสดงวิธีคิด",
          items: [
            { q: "1) ขนมเค้กขนาดเท่ากัน ก้อนแรกตัด 8 ชิ้น กิน 6 ชิ้น ก้อนสองตัด 4 ชิ้น ต้องกินกี่ชิ้นจึงเท่ากัน?", a: "3 ชิ้น (เพราะ 6/8 ทอนเป็นอย่างต่ำได้ 3/4)" },
            { q: "2) ถ้า A / 15 มีค่าเท่ากับ 2 / 3 จงหาว่าค่า A คือเท่าไร พร้อมอธิบายเหตุผล", a: "A = 10 (เพราะ 3 x 5 = 15 ดังนั้น 2 x 5 = 10)" }
          ]
        }
      ]
    },
    quiz: [
      {
        q: "ข้อใดคือเศษส่วนที่มีค่าเท่ากับ 2/3?",
        choices: ["ก. 4/6", "ข. 3/2", "ค. 4/9", "ง. 5/6"],
        answer: 0,
        why: "เมื่อนำ 2 มาคูณทั้งตัวเศษและส่วน: (2x2)/(3x2) = 4/6 จึงมีค่าเท่ากัน"
      },
      {
        q: "การหาเศษส่วนที่เท่ากันสามารถทำได้ด้วยวิธีใด?",
        choices: [
          "ก. นำจำนวนเดียวกันมาบวกทั้งตัวเศษและตัวส่วน",
          "ข. นำจำนวนเดียวกันมาลบทั้งตัวเศษและตัวส่วน",
          "ค. นำจำนวนนับเดียวกันที่ไม่ใช่ศูนย์มาคูณหรือหารทั้งตัวเศษและตัวส่วน",
          "ง. สลับตำแหน่งระหว่างตัวเศษและตัวส่วน"
        ],
        answer: 2,
        why: "ตามกฎทางคณิตศาสตร์ เศษส่วนจะคงค่าเดิมเมื่อคูณหรือหารทั้งเศษและส่วนด้วยจำนวนเดียวกันที่ไม่ใช่ศูนย์"
      }
    ],
    rubric: [
      {
        name: "1. ความรู้ความเข้าใจทางคณิตศาสตร์ (K)",
        levels: [
          "อธิบายหลักการและหาเศษส่วนที่เท่ากันได้ถูกต้องครบถ้วนทุกข้อ (4 คะแนน)",
          "หาเศษส่วนที่เท่ากันได้ถูกต้องเป็นส่วนใหญ่ ผิดพลาดเล็กน้อย 1 ข้อ (3 คะแนน)",
          "เข้าใจหลักการแต่คิดเลขผิดพลาดบางส่วน ต้องมีคำแนะนำเสริม (2 คะแนน)",
          "ยังไม่เข้าใจหลักการของเศษส่วนที่เท่ากัน (1 คะแนน)"
        ]
      },
      {
        name: "2. ทักษะกระบวนการและการแก้ปัญหา (P)",
        levels: [
          "ปฏิบัติกิจกรรมพับกระดาษแบ่งส่วนได้แม่นยำและแก้ปัญหาได้คล่องแคล่ว (4 คะแนน)",
          "ปฏิบัติกิจกรรมได้เรียบร้อยตามลำดับขั้นตอน (3 คะแนน)",
          "ปฏิบัติได้เมื่อมีเพื่อนหรือครูคอยชี้แนะเป็นระยะ (2 คะแนน)",
          "ยังไม่สามารถปฏิบัติกิจกรรมได้สำเร็จ (1 คะแนน)"
        ]
      },
      {
        name: "3. คุณลักษณะอันพึงประสงค์และการทำงานร่วมกัน (A)",
        levels: [
          "กระตือรือร้น ช่วยเหลือเพื่อนร่วมชั้นอย่างสม่ำเสมอตลอดกิจกรรม (4 คะแนน)",
          "ให้ความร่วมมือและทำงานในหน้าที่ของตนเสร็จสมบูรณ์ (3 คะแนน)",
          "ร่วมกิจกรรมเมื่อครูตักเตือนหรือกระตุ้น (2 คะแนน)",
          "ไม่ให้ความร่วมมือในกิจกรรมการเรียนรู้ (1 คะแนน)"
        ]
      }
    ]
  });

  // Load history count on init
  useEffect(() => {
    fetchHistoryList();
    const savedKey = localStorage.getItem("kruchuai_gemini_key");
    if (savedKey) setCustomApiKey(savedKey);
  }, []);

  const fetchHistoryList = async () => {
    try {
      const res = await fetch(`${API_BASE}/plans/history?limit=15`);
      if (res.ok) {
        const json = await res.json();
        setHistoryList(json.plans || []);
      }
    } catch (e) {
      console.warn("Could not fetch history list");
    }
  };

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3800);
  };

  const applyPreset = (pSubject: string, pGrade: string, pIsMulti: boolean, pSecondGrade: string, pTopic: string, pLowTech: boolean) => {
    setSubject(pSubject);
    setGrade(pGrade);
    setIsMultiGrade(pIsMulti);
    setSecondGrade(pSecondGrade);
    setTopic(pTopic);
    setIsLowTech(pLowTech);
    setQuizAnswers({});
    showToast(`✨ โหลดแม่แบบ: ${pTopic} เรียบร้อยแล้ว`);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setQuizAnswers({});

    try {
      const res = await fetch(`${API_BASE}/plans/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          grade_level: grade,
          is_multi_grade: isMultiGrade,
          second_grade: secondGrade,
          topic,
          duration_minutes: Number(minutes),
          low_resource_mode: isLowTech,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setDocData({
            ...json.data,
            title: `แผนการจัดการเรียนรู้: ${json.data.topic}`,
          });
          showToast(`⚡ AI ร่างเอกสาร "${json.data.topic}" สำเร็จแล้ว!`);
        }
      } else {
        showToast("⚠️ ไม่สามารถเรียก Backend API ได้ (สลับเป็นโหมดพรีวิว)");
      }
    } catch (err) {
      console.warn("Backend API not reachable", err);
      showToast("⚠️ เชื่อมต่อ Backend ขัดข้อง แสดงผลในโหมด Client Preview");
    } finally {
      setLoading(false);
      setActiveTab("plan");
    }
  };

  const handleSaveToDB = async () => {
    try {
      const res = await fetch(`${API_BASE}/plans/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_data: docData }),
      });
      if (res.ok) {
        showToast("💾 บันทึกแผนการสอนลงคลังเรียบร้อยแล้ว!");
        fetchHistoryList();
      } else {
        showToast("❌ บันทึกไม่สำเร็จ โปรดตรวจสอบ Backend");
      }
    } catch (e) {
      showToast("❌ เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล");
    }
  };

  const handleDownloadDocx = async () => {
    try {
      const res = await fetch(`${API_BASE}/export/docx`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_data: docData }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `KruChuai_${docData.topic || topic}.docx`;
        a.click();
        URL.revokeObjectURL(url);
        showToast("📥 ดาวน์โหลดไฟล์ Word (.docx) สำเร็จแล้ว!");
      } else {
        showToast("❌ ส่งออกไฟล์ Word ไม่สำเร็จ");
      }
    } catch (e) {
      alert("ดาวน์โหลดไฟล์ Word ไม่สำเร็จ กรุณาตรวจสอบว่า Backend API เปิดอยู่");
    }
  };

  const handleCopyAll = () => {
    try {
      let fullText = `${docData.title}\nกลุ่มสาระ: ${docData.subject} | ชั้น: ${docData.grade_level} | เวลา: ${docData.duration_minutes} นาที\n`;
      fullText += `ตัวชี้วัด สพฐ.: ${docData.standard_code || "-"} (${docData.standard_desc || ""})\n\n`;
      fullText += `[จุดประสงค์การเรียนรู้]\n` + docData.objectives?.join("\n") + "\n\n";
      fullText += `[สื่อและอุปกรณ์]\n${docData.materials}\n\n`;
      fullText += `[กิจกรรม 4 ขั้นตอน]\n`;
      docData.steps?.forEach((s: any) => {
        fullText += `${s.phase} (${s.minutes} นาที)\nครู: ${s.teacher}\nนักเรียน: ${s.students}\n\n`;
      });
      navigator.clipboard.writeText(fullText);
      showToast("📋 คัดลอกเนื้อหาทั้งหมดลงคลิปบอร์ดแล้ว!");
    } catch (e) {
      showToast("❌ คัดลอกข้อความไม่สำเร็จ");
    }
  };

  const handleSaveApiKey = () => {
    localStorage.setItem("kruchuai_gemini_key", customApiKey);
    setShowApiKeyModal(false);
    showToast("🔑 บันทึก Gemini API Key สำหรับเบราว์เซอร์นี้แล้ว");
  };

  return (
    <main className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      {/* Toast Notification */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 backdrop-blur text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs border border-slate-700 animate-bounce">
          <span className="text-base">🔔</span>
          <span className="font-medium">{statusMessage}</span>
        </div>
      )}

      {/* Top Header Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-800 text-white flex items-center justify-center font-bold text-2xl shadow-md ring-2 ring-blue-100">
              📝
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold font-title text-blue-950 tracking-tight">ครูช่วยร่าง</h1>
                <span className="text-xs bg-emerald-100 text-emerald-900 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>v1.0 Production Studio</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                AI ผู้ช่วยครูโรงเรียนขนาดเล็ก ร่างแผนการสอน ใบงาน 3 ระดับ และข้อสอบในคลิกเดียว
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => { setShowHistory(true); fetchHistoryList(); }}
              className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-xl transition border border-indigo-200 font-semibold shadow-sm"
            >
              <span>📚 คลังแผนของฉัน</span>
              <span className="px-1.5 py-0.2 bg-indigo-200 text-indigo-900 text-[10px] rounded-full font-bold">
                {historyList.length}
              </span>
            </button>

            <button
              onClick={() => setShowApiKeyModal(true)}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition border border-slate-300 font-medium"
            >
              <span>⚙️ AI API</span>
              <span className={`w-2 h-2 rounded-full ${customApiKey ? "bg-emerald-500" : "bg-blue-500"}`}></span>
            </button>

            <button
              onClick={handleSaveToDB}
              className="flex items-center space-x-1 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl transition shadow-sm font-semibold"
            >
              <span>💾</span>
              <span>บันทึกแผน</span>
            </button>

            <button
              onClick={handleDownloadDocx}
              className="flex items-center space-x-1 px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl transition shadow-sm font-semibold"
            >
              <span>📥</span>
              <span>ดาวน์โหลด Word</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition border border-slate-300 font-medium"
            >
              <span>🖨️</span>
              <span>พิมพ์ A4</span>
            </button>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 w-full"></div>
      </header>

      {/* Hero Onboarding & Preset Quick Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 no-print w-full">
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden border border-blue-800">
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-900">
                  ✨ แพลตฟอร์มช่วยครูโรงเรียนขนาดเล็ก
                </span>
                <span className="text-xs text-blue-200 hidden sm:inline">• Studio Mode: แผนการสอนและใบงานพร้อมใช้งานในคลิกเดียว</span>
              </div>
              <span className="text-xs text-blue-300">คลิกข้อความในเอกสารขวามือเพื่อพิมพ์แก้ไขได้ทันที</span>
            </div>

            {/* 3-Step Simple Flow */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="flex items-center space-x-2.5 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center font-bold">1</div>
                <div>
                  <p className="font-bold text-white">1. เลือกบริบทห้องเรียน</p>
                  <p className="text-blue-200 text-[11px]">เลือกวิชา ชั้น หรือเปิดโหมดสอนควบ</p>
                </div>
              </div>
              <div className="flex items-center space-x-2.5 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                <div className="w-7 h-7 rounded-lg bg-blue-400 text-slate-900 flex items-center justify-center font-bold">2</div>
                <div>
                  <p className="font-bold text-white">2. กดสร้างด้วย AI</p>
                  <p className="text-blue-200 text-[11px]">ได้แผน, ใบงาน 3 ระดับ, ข้อสอบ, Rubric</p>
                </div>
              </div>
              <div className="flex items-center space-x-2.5 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                <div className="w-7 h-7 rounded-lg bg-emerald-400 text-slate-900 flex items-center justify-center font-bold">3</div>
                <div>
                  <p className="font-bold text-white">3. ปรับแก้ & สั่งพิมพ์/โหลด Word</p>
                  <p className="text-blue-200 text-[11px]">จัดหน้า A4 สารบรรณราชการทันที</p>
                </div>
              </div>
            </div>

            {/* 1-Click Presets */}
            <div className="pt-2 border-t border-blue-800/80 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-blue-300 font-semibold flex items-center gap-1">
                <span>⚡ ทดลองคลิกแม่แบบยอดนิยม:</span>
              </span>
              <button
                onClick={() => applyPreset("คณิตศาสตร์", "ป.4", true, "ป.3", "เศษส่วนที่เท่ากัน", true)}
                className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg border border-white/20 transition font-medium flex items-center gap-1"
              >
                <span>🏫</span>
                <span>สอนควบ ป.3 + ป.4 (เศษส่วน)</span>
              </button>
              <button
                onClick={() => applyPreset("วิทยาศาสตร์และเทคโนโลยี", "ป.2", false, "ป.3", "ส่วนประกอบและหน้าที่ของพืช", true)}
                className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg border border-white/20 transition font-medium flex items-center gap-1"
              >
                <span>📶</span>
                <span>ไร้เน็ต/ไร้จอ (พืชรอบตัว ป.2)</span>
              </button>
              <button
                onClick={() => applyPreset("ภาษาไทย", "ป.1", false, "ป.2", "การประสมสระเสียงยาว (อา อี อู)", true)}
                className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg border border-white/20 transition font-medium flex items-center gap-1"
              >
                <span>📖</span>
                <span>อ่านเขียนเบื้องต้น (สระเสียงยาว ป.1)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Form: Classroom Setup */}
        <div className="lg:col-span-4 space-y-4 no-print">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm border-t-4 border-t-blue-900 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="font-title text-base font-bold text-slate-800 flex items-center space-x-2">
                <span>📋</span>
                <span>ตั้งค่าห้องเรียน & ตัวชี้วัด</span>
              </h2>
              <span className="text-[11px] bg-blue-50 text-blue-900 px-2 py-0.5 rounded font-semibold">Step 1</span>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">กลุ่มสาระการเรียนรู้</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:bg-white transition text-slate-800 font-medium"
                >
                  <option value="คณิตศาสตร์">คณิตศาสตร์</option>
                  <option value="วิทยาศาสตร์และเทคโนโลยี">วิทยาศาสตร์และเทคโนโลยี</option>
                  <option value="ภาษาไทย">ภาษาไทย</option>
                  <option value="ภาษาอังกฤษ">ภาษาอังกฤษ</option>
                  <option value="สังคมศึกษา ศาสนา และวัฒนธรรม">สังคมศึกษา ศาสนา และวัฒนธรรม</option>
                  <option value="สุขศึกษาและพลศึกษา">สุขศึกษาและพลศึกษา</option>
                  <option value="ศิลปะ">ศิลปะ</option>
                  <option value="การงานอาชีพ">การงานอาชีพ</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ระดับชั้นหลัก</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:bg-white transition text-slate-800 font-medium"
                >
                  <option value="ป.1">ประถมศึกษาปีที่ 1 (ป.1)</option>
                  <option value="ป.2">ประถมศึกษาปีที่ 2 (ป.2)</option>
                  <option value="ป.3">ประถมศึกษาปีที่ 3 (ป.3)</option>
                  <option value="ป.4">ประถมศึกษาปีที่ 4 (ป.4)</option>
                  <option value="ป.5">ประถมศึกษาปีที่ 5 (ป.5)</option>
                  <option value="ป.6">ประถมศึกษาปีที่ 6 (ป.6)</option>
                </select>
              </div>

              {/* Multi-Grade Option Card */}
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer font-bold text-blue-950">
                  <input
                    type="checkbox"
                    checked={isMultiGrade}
                    onChange={(e) => setIsMultiGrade(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>🏫 โหมดสอนควบหลายชั้น (Multi-Grade)</span>
                </label>
                <p className="text-[11px] text-blue-800 leading-snug">
                  AI จะจัดตาราง 4 ขั้นแบบสลับบทบาท (สอนกลุ่มหนึ่ง มอบหมายงานอีกกลุ่มหนึ่ง)
                </p>
                {isMultiGrade && (
                  <div className="pt-2 border-t border-blue-200/80">
                    <label className="block text-[11px] font-semibold text-blue-900 mb-1">ชั้นเรียนที่นำมาควบสอนร่วม:</label>
                    <select
                      value={secondGrade}
                      onChange={(e) => setSecondGrade(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-medium text-slate-800"
                    >
                      <option value="ป.3">ประถมศึกษาปีที่ 3</option>
                      <option value="ป.4">ประถมศึกษาปีที่ 4</option>
                      <option value="ป.5">ประถมศึกษาปีที่ 5</option>
                      <option value="ป.6">ประถมศึกษาปีที่ 6</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">หัวข้อบทเรียน</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:bg-white transition text-slate-800 font-medium"
                  placeholder="เช่น การบวกเศษส่วน, การสังเคราะห์ด้วยแสง"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">เวลาสอน (นาที)</label>
                  <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">{minutes} นาที</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[50, 60, 100].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMinutes(m)}
                      className={`py-1.5 rounded-lg font-semibold transition border ${minutes === m ? "bg-blue-900 text-white border-blue-900 shadow-sm" : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"}`}
                    >
                      {m} นาที
                    </button>
                  ))}
                </div>
              </div>

              {/* Low-Tech Option Card */}
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1">
                <label className="flex items-center space-x-2 cursor-pointer font-bold text-amber-950">
                  <input
                    type="checkbox"
                    checked={isLowTech}
                    onChange={(e) => setIsLowTech(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>📶 โหมดอุปกรณ์และเน็ตจำกัด (Low-tech)</span>
                </label>
                <p className="text-[11px] text-amber-800 leading-snug">
                  เน้นใช้วัสดุรอบตัว กระดานดำ และบัตรกิจกรรมกระดาษ แทนการพึ่งจอหรือเน็ต
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-title font-bold rounded-xl shadow-lg transition flex items-center justify-center space-x-2 text-sm tracking-wide"
              >
                {loading ? (
                  <>
                    <span className="animate-spin inline-block mr-2">🌀</span>
                    <span>AI กำลังประมวลผลเอกสาร...</span>
                  </>
                ) : (
                  <>
                    <span>⚡ สั่งสร้างชุดเอกสาร AI (4-in-1 Suite)</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RAG Standard & Engine Info Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <span>🎯 ตัวชี้วัด สพฐ.:</span>
              </span>
              <span className="font-mono bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                {docData.standard_code || "ตรวจจับอัตโนมัติ"}
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              "{docData.standard_desc || "สืบค้นตรงตามหลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน 2551"}"
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">AI Engine:</span>
              <span className="font-semibold text-emerald-800">{docData.ai_provider || "Active"}</span>
            </div>
          </div>
        </div>

        {/* Right Output View: Document Studio Viewer */}
        <div className="lg:col-span-8 space-y-4">
          {/* Navigation Tab Bar */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 shadow-sm no-print">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setActiveTab("plan")}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${activeTab === "plan" ? "bg-blue-900 text-white shadow" : "bg-slate-50 hover:bg-slate-100 text-slate-700"}`}
              >
                <span>📖</span>
                <span>1. แผนการสอน (4 ขั้น)</span>
              </button>
              <button
                onClick={() => setActiveTab("worksheets")}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${activeTab === "worksheets" ? "bg-blue-900 text-white shadow" : "bg-slate-50 hover:bg-slate-100 text-slate-700"}`}
              >
                <span>📝</span>
                <span>2. ใบงาน 3 ระดับ</span>
              </button>
              <button
                onClick={() => setActiveTab("quiz")}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${activeTab === "quiz" ? "bg-blue-900 text-white shadow" : "bg-slate-50 hover:bg-slate-100 text-slate-700"}`}
              >
                <span>❓</span>
                <span>3. แบบทดสอบวัดผล</span>
              </button>
              <button
                onClick={() => setActiveTab("rubric")}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${activeTab === "rubric" ? "bg-blue-900 text-white shadow" : "bg-slate-50 hover:bg-slate-100 text-slate-700"}`}
              >
                <span>📊</span>
                <span>4. เกณฑ์ประเมิน (Rubric)</span>
              </button>
            </div>

            {/* Quick Actions for Active Tab */}
            <div className="flex items-center space-x-1 text-xs pr-1">
              <button
                onClick={handleCopyAll}
                className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition"
                title="คัดลอกข้อความทั้งหมด"
              >
                <span>📋</span>
                <span className="hidden sm:inline">คัดลอก</span>
              </button>
            </div>
          </div>

          {/* Skeleton Loader during AI generation */}
          {loading ? (
            <div className="paper-sheet rounded-3xl p-8 sm:p-12 space-y-6 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-8 bg-blue-100 rounded w-3/4"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2"></div>
              </div>
              <div className="space-y-4 pt-6">
                <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                <div className="h-16 bg-slate-50 border border-slate-100 rounded-2xl"></div>
                <div className="h-48 bg-slate-50 border border-slate-100 rounded-2xl"></div>
              </div>
              <p className="text-center text-slate-400 text-xs pt-4 font-medium">
                ⚡ กำลังประมวลผลผ่าน RAG ตัวชี้วัด สพฐ. และ Google Gemini AI...
              </p>
            </div>
          ) : (
            /* Real Paper A4 Sheet (Studio Canvas) */
            <div className="paper-sheet rounded-3xl p-6 sm:p-10 relative text-xs space-y-6">
              {/* Header Document */}
              <div className="notebook-spine pl-5 pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 tracking-wider">
                    เอกสารการจัดการเรียนรู้ราชการ (A4)
                  </span>
                  <span className="text-[11px] text-slate-400 no-print flex items-center gap-1">
                    <span>✏️</span>
                    <span>คลิกแก้ไขข้อความได้โดยตรง</span>
                  </span>
                </div>
                <h2
                  contentEditable
                  suppressContentEditableWarning
                  className="text-2xl font-bold font-title text-slate-900 mt-2 hover:bg-blue-50/50 rounded px-1 transition"
                >
                  {docData.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                  <span>กลุ่มสาระ: <strong className="text-slate-800">{docData.subject}</strong></span>
                  <span>•</span>
                  <span>ระดับชั้น: <strong className="text-slate-800">{docData.grade_level}</strong></span>
                  <span>•</span>
                  <span>เวลา: <strong className="text-slate-800">{docData.duration_minutes} นาที</strong></span>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                    {docData.low_resource_mode ? "โหมดอุปกรณ์จำกัด (Low-tech)" : "ห้องเรียนปกติ"}
                  </span>
                </div>
              </div>

              {/* TAB 1: แผนการสอน 4 ขั้น */}
              {activeTab === "plan" && (
                <div className="space-y-6 animate-fade-in">
                  {/* Timeline Visual Progress Bar (Diffit / MagicSchool style) */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                      <span>⏳ สัดส่วนเวลาการสอน Active Learning:</span>
                      <span className="font-mono text-blue-900">{docData.duration_minutes} นาที</span>
                    </div>
                    <div className="flex h-3 rounded-full overflow-hidden bg-slate-200">
                      <div className="bg-amber-400 text-[9px] text-amber-950 font-bold flex items-center justify-center" style={{ width: "15%" }} title="ขั้นนำ 15%">นำ</div>
                      <div className="bg-blue-600 text-[9px] text-white font-bold flex items-center justify-center" style={{ width: "35%" }} title="ขั้นสอน 35%">สอน</div>
                      <div className="bg-emerald-500 text-[9px] text-white font-bold flex items-center justify-center" style={{ width: "35%" }} title="ขั้นปฏิบัติ 35%">ฝึก</div>
                      <div className="bg-indigo-600 text-[9px] text-white font-bold flex items-center justify-center" style={{ width: "15%" }} title="ขั้นสรุป 15%">สรุป</div>
                    </div>
                  </div>

                  {/* จุดประสงค์ */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-xs">🎯</span>
                      <span>จุดประสงค์การเรียนรู้ (Learning Objectives)</span>
                    </h4>
                    <ul className="space-y-1.5 text-slate-700 pl-2">
                      {docData.objectives?.map((obj: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-900 font-bold">•</span>
                          <span contentEditable suppressContentEditableWarning className="flex-1 hover:bg-blue-50/50 rounded px-1">
                            {obj}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* สื่อและอุปกรณ์ */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-xs">📦</span>
                      <span>สื่อและอุปกรณ์การจัดการเรียนรู้</span>
                    </h4>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 hover:bg-blue-50/50 transition"
                    >
                      {docData.materials}
                    </div>
                  </div>

                  {/* ตาราง 4 ขั้นตอน */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-900 flex items-center justify-center text-xs">⏳</span>
                      <span>ตารางการจัดกิจกรรมการเรียนรู้ 4 ขั้นตอน (Active Learning)</span>
                    </h4>
                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-100 text-slate-800 border-b border-slate-200">
                          <tr>
                            <th className="p-3 w-36 font-semibold">ขั้นตอน</th>
                            <th className="p-3 w-20 text-center font-semibold">เวลา</th>
                            <th className="p-3 font-semibold">บทบาทครูและนักเรียน</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {docData.steps?.map((step: any, i: number) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition">
                              <td className="p-3 font-bold text-slate-900 align-top">
                                {step.phase}
                              </td>
                              <td className="p-3 text-center align-top font-mono font-bold text-blue-900 bg-blue-50/40">
                                {step.minutes}น.
                              </td>
                              <td className="p-3 align-top text-slate-700 space-y-2">
                                <p>
                                  <strong className="text-blue-950">ครู:</strong>{" "}
                                  <span contentEditable suppressContentEditableWarning className="hover:bg-blue-50/50 rounded px-1">
                                    {step.teacher}
                                  </span>
                                </p>
                                <p>
                                  <strong className="text-emerald-900">นักเรียน:</strong>{" "}
                                  <span contentEditable suppressContentEditableWarning className="hover:bg-blue-50/50 rounded px-1">
                                    {step.students}
                                  </span>
                                </p>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ใบงาน 3 ระดับ (Diffit-Style Printable Modular Kits) */}
              {activeTab === "worksheets" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-xs">📝</span>
                      <span>ชุดใบงานจำแนก 3 ระดับ (Differentiated Worksheets)</span>
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium">สอดคล้องหลักการ Differentiated Instruction</span>
                  </div>

                  <div className="space-y-6">
                    {docData.worksheets?.levels?.map((ws: any, i: number) => {
                      const borderColor = i === 0 ? "border-emerald-300 bg-emerald-50/30" : i === 1 ? "border-blue-300 bg-blue-50/30" : "border-purple-300 bg-purple-50/30";
                      const badgeBg = i === 0 ? "bg-emerald-100 text-emerald-900" : i === 1 ? "bg-blue-100 text-blue-900" : "bg-purple-100 text-purple-900";
                      
                      return (
                        <div key={i} className={`p-5 rounded-2xl border-2 ${borderColor} space-y-4 shadow-sm`}>
                          {/* Student Sheet Header for Kids */}
                          <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
                            <div>
                              <span>ชื่อ-นามสกุล: ............................................................................</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span>ชั้น: <strong>{docData.grade_level}</strong></span>
                              <span>เลขที่: ............</span>
                              <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">คะแนน: _____ / 10</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <span>{ws.name}</span>
                            </span>
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${badgeBg}`}>
                              ระดับความสามารถ {i + 1}
                            </span>
                          </div>

                          <p contentEditable suppressContentEditableWarning className="text-slate-600 text-xs italic">
                            คำชี้แจง: {ws.instructions}
                          </p>

                          <div className="pt-1 space-y-2.5 text-slate-800">
                            {ws.items?.map((item: any, idx: number) => (
                              <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                                <p contentEditable suppressContentEditableWarning className="font-medium">
                                  {item.q}
                                </p>
                                <div className="text-[11px] text-emerald-800 pt-1 border-t border-slate-100 flex items-center justify-between">
                                  <span><strong>แนวคำตอบ / เฉลย:</strong> {item.a}</span>
                                  <span className="text-[10px] text-slate-400 no-print">คลิกพิมพ์แก้ไขโจทย์ได้</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: แบบทดสอบ (Interactive Quiz Station) */}
              {activeTab === "quiz" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-900 flex items-center justify-center text-xs">❓</span>
                      <span>แบบทดสอบวัดผลการเรียนรู้ (Interactive Assessment Station)</span>
                    </h4>
                    <span className="text-[11px] text-slate-500">คลิกทดลองตอบเพื่อตรวจทานเฉลย</span>
                  </div>

                  <div className="space-y-5">
                    {docData.quiz?.map((qItem: any, i: number) => {
                      const userChoice = quizAnswers[i];
                      const isAnswered = userChoice !== undefined;
                      const isCorrect = userChoice === qItem.answer;

                      return (
                        <div key={i} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 shadow-xs">
                          <p className="font-bold text-slate-900 text-sm">
                            ข้อที่ {i + 1}: <span contentEditable suppressContentEditableWarning>{qItem.q}</span>
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                            {qItem.choices?.map((ch: string, cIdx: number) => {
                              const isThisCorrect = cIdx === qItem.answer;
                              const isThisSelected = userChoice === cIdx;

                              let btnStyle = "bg-white border-slate-200 text-slate-700 hover:bg-slate-100";
                              if (isAnswered) {
                                if (isThisCorrect) {
                                  btnStyle = "bg-emerald-100 text-emerald-950 border-emerald-400 font-bold ring-2 ring-emerald-400";
                                } else if (isThisSelected) {
                                  btnStyle = "bg-rose-100 text-rose-950 border-rose-400 font-bold";
                                }
                              }

                              return (
                                <button
                                  key={cIdx}
                                  type="button"
                                  onClick={() => setQuizAnswers({ ...quizAnswers, [i]: cIdx })}
                                  className={`p-3 rounded-xl text-xs font-medium border text-left transition flex items-center justify-between ${btnStyle}`}
                                >
                                  <span>{ch}</span>
                                  {isAnswered && isThisCorrect && (
                                    <span className="text-[10px] text-emerald-800 bg-emerald-200 px-1.5 py-0.5 rounded font-bold">
                                      ✓ คำตอบถูกต้อง
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                          
                          {/* Explanation Box */}
                          <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                            <p className="font-bold text-blue-900">💡 คำอธิบายเชิงเหตุผลทางวิชาการ:</p>
                            <p>{qItem.why}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: Rubric */}
              {activeTab === "rubric" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-900 flex items-center justify-center text-xs">📊</span>
                      <span>เกณฑ์การประเมินผลการเรียนรู้ (Scoring Rubric K-P-A)</span>
                    </h4>
                    <span className="text-[11px] text-slate-500">เกณฑ์มาตรฐาน 4 ระดับคุณภาพ</span>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-100 text-slate-800 border-b border-slate-200 text-xs">
                        <tr>
                          <th className="p-3 w-40 font-semibold">ประเด็นการประเมิน</th>
                          <th className="p-3 font-semibold text-emerald-900 bg-emerald-50/50">ระดับ 4 (ดีมาก)</th>
                          <th className="p-3 font-semibold text-blue-900 bg-blue-50/50">ระดับ 3 (ดี)</th>
                          <th className="p-3 font-semibold text-amber-900 bg-amber-50/50">ระดับ 2 (พอใช้)</th>
                          <th className="p-3 font-semibold text-rose-900 bg-rose-50/50">ระดับ 1 (ปรับปรุง)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-xs">
                        {docData.rubric?.map((rItem: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition">
                            <td className="p-3 font-bold text-slate-900 align-top">
                              {rItem.name}
                            </td>
                            {rItem.levels?.map((lvl: string, lIdx: number) => (
                              <td key={lIdx} className="p-3 text-slate-700 align-top text-[11px] leading-relaxed">
                                {lvl}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: คลังแผนการสอนของฉัน */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in no-print">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>📚</span>
                <span>คลังแผนการสอนของฉัน (ที่บันทึกไว้ในระบบ)</span>
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 text-xs pr-1">
              {historyLoading ? (
                <p className="text-center py-10 text-slate-400">กำลังโหลดรายการแผน...</p>
              ) : historyList.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <p className="text-3xl">📭</p>
                  <p className="font-semibold">ยังไม่มีแผนที่บันทึกไว้ในคลัง</p>
                  <p className="text-[11px]">คลิกปุ่ม "💾 บันทึกแผน" ด้านบน เพื่อเก็บแผนนี้ไว้ดูย้อนหลัง</p>
                </div>
              ) : (
                historyList.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 rounded-2xl flex items-center justify-between transition gap-3"
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{item.topic}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        {item.subject} | ชั้น {item.grade_level} | เวลา {item.duration_minutes} นาที
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (item.full_plan_json) {
                          setDocData(item.full_plan_json);
                          setSubject(item.subject || "คณิตศาสตร์");
                          setTopic(item.topic || "");
                          setShowHistory(false);
                          showToast(`📂 เปิดแผน "${item.topic}" เรียบร้อยแล้ว`);
                        }
                      }}
                      className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-semibold shadow-sm text-xs transition shrink-0"
                    >
                      เปิดแผนนี้
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ตั้งค่า AI API Key */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in no-print">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>⚙️</span>
                <span>ตั้งค่า Google Gemini API Key</span>
              </h3>
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                ระบบเชื่อมต่อ <strong>Google Gemini 1.5 Flash</strong> อัตโนมัติ หากคุณมี API Key ของตนเอง สามารถใส่เพื่อทดสอบได้ทันที (คีย์จะถูกเก็บในเบราว์เซอร์ของคุณอย่างปลอดภัย):
              </p>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gemini API Key:</label>
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 font-mono text-xs"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                *หากปล่อยว่าง ระบบจะใช้ค่าคอนฟิกจาก Backend หรือสลับไปใช้ Heuristic Engine แทน
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveApiKey}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-semibold text-xs shadow-sm transition"
              >
                บันทึกการตั้งค่า
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
