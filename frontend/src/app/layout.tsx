import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ครูช่วยร่าง (KruChuai) - ผู้ช่วยครูลดงานเอกสารด้วย AI สำหรับโรงเรียนขนาดเล็ก",
  description: "ระบบ AI ช่วยร่างแผนการสอน ใบงาน 3 ระดับ แบบทดสอบ และ Rubric ประเมินผล ผูกตัวชี้วัด สพฐ.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Mali:wght@500;600;700&family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-slate-50 text-slate-800 min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
