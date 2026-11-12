"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { SurveyWizard } from "@/components/SurveyWizard";
import { SurveyPageHeader } from "@/components/SurveyPageHeader";
import { AdminLoginModal } from "@/components/AdminLoginModal";
import { SurveyResponse, SurveySection } from "@/lib/constants";
import { getCurrentPeriodInfo, getOfficialPeriodSubtitle } from "@/lib/periodUtils";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Clock,
  FileCheck2,
  Lock,
} from "lucide-react";

export default function HomePage() {
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [sections, setSections] = useState<SurveySection[]>([]);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "warning" | "error";
  } | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/survey-config");
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setSections(data.data);
        }
      } catch (e) {
        console.error("Gagal memuat konfigurasi soal survei:", e);
      }
    };
    fetchConfig();
  }, []);

  const showToast = (
    text: string,
    type: "success" | "warning" | "error" = "success"
  ) => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSurveySubmitted = (newResp: SurveyResponse) => {
    showToast(
      `Jawaban survei Anda berhasil disimpan dengan ID ${newResp.id}! Terima kasih atas partisipasi Anda.`,
      "success"
    );
  };

  return (
    <>
      {/* Top Header - Respondent View */}
      <Header
        role="respondent"
        onOpenAdminLogin={() => setIsAdminModalOpen(true)}
      />

      {/* Main Content Area: Pure Survey Experience */}
      <main className="app-main" style={{ paddingBottom: "3rem" }}>
        <div className="survey-container">
          {/* Official Survey Title & Dynamic Period Subtitle */}
          <SurveyPageHeader />

          {/* Survey Wizard Multi-Step Form */}
          <SurveyWizard
            onSurveySubmitted={handleSurveySubmitted}
            showDashboardButton={false}
            sections={sections.length > 0 ? sections : undefined}
          />
        </div>
      </main>

      {/* Clean Minimalist Footer */}
      <footer style={{ padding: "2rem 1rem 3rem", textAlign: "center", fontSize: "0.78rem", color: "#94a3b8" }}>
        <div>Unit Pengelola Taman Margasatwa Ragunan • Dinas Pertamanan dan Hutan Kota Provinsi DKI Jakarta</div>
        <div style={{ marginTop: "0.25rem", fontSize: "0.72rem", color: "#cbd5e1" }}>
          Standar Evaluasi PermenPAN-RB No. 14 / 2017
        </div>
      </footer>

      {/* Admin Login Modal (Triggered by Header / Footer Button) */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />

      {/* Global Toast Alert */}
      {toastMessage && (
        <div className="toast-container">
          <div className={`toast ${toastMessage.type}`}>
            {toastMessage.type === "success" && <CheckCircle2 size={16} />}
            {toastMessage.type === "warning" && <AlertTriangle size={16} />}
            {toastMessage.type === "error" && <XCircle size={16} />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </>
  );
}
