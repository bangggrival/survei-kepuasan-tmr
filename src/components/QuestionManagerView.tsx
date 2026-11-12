"use client";

import React, { useState, useEffect } from "react";
import { SurveySection, SURVEY_SECTIONS, LIKERT_OPTIONS } from "@/lib/constants";
import {
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileEdit,
  FileQuestion,
  Layers,
  Zap,
  Fuel,
  Truck,
  Building2,
  Eye,
  Pencil,
  Copy,
  Check,
  Info,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { UiConfirmModal } from "./UiConfirmModal";

interface QuestionManagerViewProps {
  sections: SurveySection[];
  onSaveConfig: (updatedSections: SurveySection[]) => Promise<boolean>;
  onResetConfig: () => Promise<SurveySection[]>;
  isLoading?: boolean;
}

// Icon helper per section
const getSectionIcon = (id: string, size = 20) => {
  switch (id) {
    case "sec_1":
      return <Zap size={size} />;
    case "sec_2":
      return <Fuel size={size} />;
    case "sec_3":
      return <Truck size={size} />;
    case "sec_4":
      return <Building2 size={size} />;
    default:
      return <Layers size={size} />;
  }
};

const getSectionTheme = (id: string) => {
  switch (id) {
    case "sec_1":
      return {
        accent: "#d97706",
        bg: "#fef3c7",
        border: "#fde68a",
        text: "#92400e",
        label: "Daya & Jasa (TALI)",
      };
    case "sec_2":
      return {
        accent: "#e11d48",
        bg: "#ffe4e6",
        border: "#fecdd3",
        text: "#9f1239",
        label: "Energi & BBM",
      };
    case "sec_3":
      return {
        accent: "#2563eb",
        bg: "#dbeafe",
        border: "#bfdbfe",
        text: "#1e40af",
        label: "Armada & Mobilitas",
      };
    case "sec_4":
      return {
        accent: "#059669",
        bg: "#d1fae5",
        border: "#a7f3d0",
        text: "#065f46",
        label: "Fasilitas & Sarpras",
      };
    default:
      return {
        accent: "#059669",
        bg: "#f0fdf4",
        border: "#bbf7d0",
        text: "#065f46",
        label: "Umum",
      };
  }
};

export const QuestionManagerView: React.FC<QuestionManagerViewProps> = ({
  sections,
  onSaveConfig,
  onResetConfig,
  isLoading,
}) => {
  const [localSections, setLocalSections] = useState<SurveySection[]>([]);
  const [activeSectionTab, setActiveSectionTab] = useState<string>("sec_1");
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Simulation state for preview mode
  const [simulatedAnswers, setSimulatedAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    if (sections && sections.length > 0) {
      setLocalSections(JSON.parse(JSON.stringify(sections)));
    } else {
      setLocalSections(JSON.parse(JSON.stringify(SURVEY_SECTIONS)));
    }
  }, [sections]);

  const handleSectionMetaChange = (secId: string, field: "code" | "title" | "shortTitle", val: string) => {
    setLocalSections((prev) =>
      prev.map((s) => (s.id === secId ? { ...s, [field]: val } : s))
    );
    setHasChanges(true);
    setFeedback(null);
  };

  const handleQuestionTextChange = (secId: string, qId: string, text: string) => {
    setLocalSections((prev) =>
      prev.map((s) => {
        if (s.id !== secId) return s;
        return {
          ...s,
          questions: s.questions.map((q) => (q.id === qId ? { ...q, text } : q)),
        };
      })
    );
    setHasChanges(true);
    setFeedback(null);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSave = async () => {
    // Validate required fields
    for (const sec of localSections) {
      if (!sec.code.trim()) {
        setFeedback({ type: "error", text: `Kode Program pada bagian "${sec.title || sec.id}" tidak boleh kosong.` });
        return;
      }
      if (!sec.title.trim()) {
        setFeedback({ type: "error", text: `Judul Program pada bagian "${sec.code}" tidak boleh kosong.` });
        return;
      }
      for (const q of sec.questions) {
        if (!q.text.trim()) {
          setFeedback({ type: "error", text: `Pertanyaan Q${q.num} pada ${sec.shortTitle || sec.code} tidak boleh kosong.` });
          return;
        }
      }
    }

    setIsSaving(true);
    try {
      const ok = await onSaveConfig(localSections);
      if (ok) {
        setHasChanges(false);
        setFeedback({
          type: "success",
          text: "Seluruh konfigurasi Kode Program dan narasi instrumen berhasil disimpan ke basis data.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan perubahan";
      setFeedback({ type: "error", text: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleResetClick = () => {
    setIsResetModalOpen(true);
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      const defaults = await onResetConfig();
      setLocalSections(JSON.parse(JSON.stringify(defaults)));
      setHasChanges(false);
      setFeedback({
        type: "success",
        text: "Konfigurasi instrumen berhasil dikembalikan ke standar awal PermenPAN-RB.",
      });
      setIsResetModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengatur ulang";
      setFeedback({ type: "error", text: msg });
    } finally {
      setIsResetting(false);
    }
  };

  const currentSec = localSections.find((s) => s.id === activeSectionTab) || localSections[0];
  const totalQuestions = localSections.reduce((acc, s) => acc + s.questions.length, 0);
  const currentTheme = currentSec ? getSectionTheme(currentSec.id) : getSectionTheme("sec_1");

  return (
    <section className="tab-pane active" id="pane-manage-questions">
      <div className="studio-wrapper">
        {/* Top Executive Header Card */}
        <div className="studio-header-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "1.25rem",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: "1 1 500px" }}>
              {hasChanges && (
                <div style={{ marginBottom: "0.45rem" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.22rem 0.65rem",
                      background: "#fef3c7",
                      color: "#92400e",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      border: "1px solid #fde68a",
                    }}
                  >
                    <AlertCircle size={12} />
                    Perubahan belum disimpan
                  </span>
                </div>
              )}

              <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.015em" }}>
                Kelola Kode Rekening & Pertanyaan Survei
              </h1>
              <p style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "0.35rem", marginBottom: 0 }}>
                Sesuaikan kode rekening belanja dinas (RKA/DPA), nomenklatur sub-kegiatan, dan 20 butir pertanyaan instrumen kepuasan pegawai.
              </p>
            </div>

            {/* Header Action Tools */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleResetClick}
                disabled={isResetting || isSaving}
                title="Kembalikan seluruh teks ke standar bawaan dinas"
              >
                <RotateCcw size={14} />
                <span>{isResetting ? "Mereset..." : "Reset Standar Baku"}</span>
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSave}
                disabled={isSaving || isResetting}
                style={{
                  background: hasChanges ? "linear-gradient(135deg, #059669, #047857)" : undefined,
                  fontWeight: 700,
                  boxShadow: hasChanges ? "0 4px 14px rgba(5, 150, 105, 0.35)" : undefined,
                }}
              >
                <Save size={15} />
                <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
              </button>
            </div>
          </div>

          {/* Feedback Alert Banner */}
          {feedback && (
            <div
              style={{
                marginTop: "1.25rem",
                padding: "0.75rem 1.15rem",
                borderRadius: "var(--radius-md)",
                fontSize: "0.84rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                background: feedback.type === "success" ? "#f0fdf4" : "#fef2f2",
                border: `1.5px solid ${feedback.type === "success" ? "#bbf7d0" : "#fecaca"}`,
                color: feedback.type === "success" ? "#166534" : "#b91c1c",
              }}
            >
              {feedback.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span style={{ flex: 1 }}>{feedback.text}</span>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "inherit",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textDecoration: "underline",
                }}
              >
                Tutup
              </button>
            </div>
          )}
        </div>

        {/* Master-Detail Studio Layout */}
        <div className="studio-layout">
          {/* LEFT SIDEBAR: 4 Dimension Navigator */}
          <aside className="studio-sidebar">
            <div
              style={{
                background: "#ffffff",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-xl)",
                padding: "1.25rem",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Dimensi Evaluasi ({localSections.length})
                </span>
                <span style={{ fontSize: "0.72rem", background: "#f1f5f9", padding: "2px 8px", borderRadius: "12px", color: "#64748b", fontWeight: 700 }}>
                  20 Butir Soal
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {localSections.map((sec, idx) => {
                  const isActive = sec.id === activeSectionTab;
                  const theme = getSectionTheme(sec.id);
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setActiveSectionTab(sec.id)}
                      className={`studio-nav-card ${isActive ? "active" : ""}`}
                    >
                      <div
                        className="studio-nav-icon"
                        style={{
                          background: isActive ? theme.bg : "#f8fafc",
                          color: isActive ? theme.accent : "#64748b",
                          border: `1px solid ${isActive ? theme.border : "#e2e8f0"}`,
                        }}
                      >
                        {getSectionIcon(sec.id, 20)}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.4rem", marginBottom: "0.2rem" }}>
                          <span style={{ fontSize: "0.72rem", fontWeight: 800, color: isActive ? "var(--gov-primary-700)" : "#64748b", letterSpacing: "0.3px" }}>
                            SEKSI {idx + 1}
                          </span>
                          <span className="studio-nav-badge-code">
                            {sec.code}
                          </span>
                        </div>

                        <div
                          style={{
                            fontSize: "0.84rem",
                            fontWeight: isActive ? 800 : 700,
                            color: isActive ? "#0f172a" : "#334155",
                            lineHeight: 1.3,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {sec.shortTitle || sec.title}
                        </div>

                        <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: isActive ? "var(--gov-primary-600)" : "#94a3b8" }} />
                          <span>{sec.questions.length} Butir Soal Terpasang</span>
                        </div>
                      </div>

                      <ChevronRight
                        size={16}
                        color={isActive ? "var(--gov-primary-600)" : "#cbd5e1"}
                        style={{ flexShrink: 0, marginTop: "0.5rem" }}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Sidebar Quick Fact Widget */}
              <div
                style={{
                  marginTop: "1.25rem",
                  padding: "0.9rem",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.4rem" }}>
                  <Info size={14} color="var(--gov-primary-600)" />
                  <strong style={{ fontSize: "0.76rem", color: "#1e293b" }}>Standar Penilaian IKM</strong>
                </div>
                <p style={{ fontSize: "0.72rem", color: "#64748b", margin: 0, lineHeight: 1.45 }}>
                  Setiap dimensi wajib memuat 5 butir pertanyaan dengan bobot tertimbang merata 0,25 sesuai PermenPAN-RB No. 14 / 2017.
                </p>
              </div>
            </div>
          </aside>

          {/* RIGHT CANVAS: Active Dimension Editor & Live Preview */}
          <main className="studio-canvas">
            {currentSec && (
              <>
                {/* Active Dimension Context Banner */}
                <div className="studio-section-banner">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", minWidth: "260px" }}>
                    <div
                      style={{
                        width: "46px",
                        height: "46px",
                        borderRadius: "12px",
                        background: currentTheme.bg,
                        color: currentTheme.accent,
                        border: `1.5px solid ${currentTheme.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {getSectionIcon(currentSec.id, 24)}
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                          {currentSec.shortTitle || currentSec.title}
                        </h2>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.74rem",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "6px",
                            background: "#f0fdf4",
                            color: "var(--gov-primary-800)",
                            border: "1px solid #bbf7d0",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.35rem",
                          }}
                        >
                          {currentSec.code}
                          <button
                            type="button"
                            onClick={() => handleCopyCode(currentSec.code)}
                            title="Salin Kode Rekening ke Clipboard"
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: 0,
                              color: "inherit",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {copiedCode === currentSec.code ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                          </button>
                        </span>
                      </div>
                      <p style={{ fontSize: "0.78rem", color: "#64748b", margin: "2px 0 0", lineHeight: 1.4 }}>
                        {currentSec.title}
                      </p>
                    </div>
                  </div>

                  {/* Mode Switcher Tabs (Editor vs Live Preview) */}
                  <div
                    style={{
                      display: "flex",
                      background: "#f1f5f9",
                      padding: "3px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setViewMode("edit")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        padding: "0.45rem 0.95rem",
                        borderRadius: "8px",
                        border: "none",
                        fontSize: "0.8rem",
                        fontWeight: viewMode === "edit" ? 800 : 600,
                        background: viewMode === "edit" ? "#ffffff" : "transparent",
                        color: viewMode === "edit" ? "var(--gov-primary-700)" : "#64748b",
                        boxShadow: viewMode === "edit" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                        cursor: "pointer",
                        transition: "all var(--transition-fast)",
                      }}
                    >
                      <Pencil size={14} />
                      <span>Mode Editor</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewMode("preview")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        padding: "0.45rem 0.95rem",
                        borderRadius: "8px",
                        border: "none",
                        fontSize: "0.8rem",
                        fontWeight: viewMode === "preview" ? 800 : 600,
                        background: viewMode === "preview" ? "#ffffff" : "transparent",
                        color: viewMode === "preview" ? "var(--gov-primary-700)" : "#64748b",
                        boxShadow: viewMode === "preview" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                        cursor: "pointer",
                        transition: "all var(--transition-fast)",
                      }}
                    >
                      <Eye size={14} />
                      <span>Pratinjau Pegawai</span>
                      <span
                        style={{
                          fontSize: "0.65rem",
                          background: "#e0f2fe",
                          color: "#0369a1",
                          padding: "1px 6px",
                          borderRadius: "4px",
                          fontWeight: 700,
                        }}
                      >
                        Live
                      </span>
                    </button>
                  </div>
                </div>

                {/* VIEW MODE: EDIT */}
                {viewMode === "edit" ? (
                  <>
                    {/* PANEL 1: Kode Program & Nomenklatur Anggaran */}
                    <div className="studio-panel">
                      <div className="studio-panel-title">
                        <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                          <Layers size={18} color="var(--gov-primary-600)" />
                          <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>
                            Nomenklatur & Kode Rekening Belanja Dinas (RKA / DPA)
                          </strong>
                        </div>
                        <span style={{ fontSize: "0.74rem", color: "#64748b" }}>
                          Parameter Akuntansi Sub-Kegiatan
                        </span>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                          gap: "1.25rem",
                          marginBottom: "1.25rem",
                        }}
                      >
                        {/* Kode Rekening Belanja */}
                        <div className="studio-input-wrap">
                          <label className="studio-input-label">
                            <span>Kode Rekening Belanja Sub-Kegiatan</span>
                            <span style={{ color: "#ef4444" }}>*</span>
                          </label>
                          <div style={{ position: "relative" }}>
                            <input
                              type="text"
                              value={currentSec.code}
                              onChange={(e) => handleSectionMetaChange(currentSec.id, "code", e.target.value)}
                              placeholder="Contoh: 23.28.01.1.08.02"
                              className="studio-input-text studio-input-code"
                            />
                            <button
                              type="button"
                              onClick={() => handleCopyCode(currentSec.code)}
                              style={{
                                position: "absolute",
                                right: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "#f8fafc",
                                border: "1px solid #cbd5e1",
                                borderRadius: "6px",
                                padding: "4px 8px",
                                fontSize: "0.72rem",
                                color: "#475569",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.3rem",
                              }}
                              title="Salin kode"
                            >
                              {copiedCode === currentSec.code ? (
                                <>
                                  <Check size={11} color="#059669" />
                                  <span style={{ color: "#059669", fontWeight: 700 }}>Tersalin</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={11} />
                                  <span>Salin</span>
                                </>
                              )}
                            </button>
                          </div>
                          <span style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.25rem" }}>
                            Digunakan pada header kolom matriks rekapitulasi resmi PermenPAN-RB.
                          </span>
                        </div>

                        {/* Judul Singkat */}
                        <div className="studio-input-wrap">
                          <label className="studio-input-label">
                            <span>Judul Singkat Dimensi Layanan</span>
                            <span style={{ color: "#ef4444" }}>*</span>
                          </label>
                          <input
                            type="text"
                            value={currentSec.shortTitle}
                            onChange={(e) => handleSectionMetaChange(currentSec.id, "shortTitle", e.target.value)}
                            placeholder="Contoh: Komunikasi, Air & Listrik (TALI)"
                            className="studio-input-text"
                            style={{ fontWeight: 600 }}
                          />
                          <span style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.25rem" }}>
                            Ditampilkan pada kartu ringkasan IKM, diagram radar, dan tab instrumen.
                          </span>
                        </div>
                      </div>

                      {/* Judul Lengkap Program */}
                      <div className="studio-input-wrap">
                        <label className="studio-input-label">
                          <span>Judul Program Lengkap (Nama Sub-Kegiatan Kedinasan)</span>
                          <span style={{ color: "#ef4444" }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={currentSec.title}
                          onChange={(e) => handleSectionMetaChange(currentSec.id, "title", e.target.value)}
                          placeholder="Nama lengkap sub kegiatan pelayanan kedinasan"
                          className="studio-input-text"
                          style={{ fontWeight: 600 }}
                        />
                        <span style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.25rem" }}>
                          Dicantumkan pada lembar kuesioner resmi pegawai dan cetak PDF laporan IKM.
                        </span>
                      </div>
                    </div>

                    {/* PANEL 2: Narasi 5 Butir Pertanyaan Evaluasi */}
                    <div className="studio-panel">
                      <div className="studio-panel-title">
                        <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                          <FileQuestion size={18} color="var(--gov-primary-600)" />
                          <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>
                            Naskah 5 Butir Pertanyaan Evaluasi Pelayanan
                          </strong>
                        </div>
                        <span style={{ fontSize: "0.74rem", background: "#f0fdf4", color: "var(--gov-primary-800)", padding: "3px 9px", borderRadius: "12px", fontWeight: 700, border: "1px solid #bbf7d0" }}>
                          Skala Likert Baku 1 s/d 4
                        </span>
                      </div>

                      {/* Good Practice Tip Box */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "0.75rem",
                          padding: "0.85rem 1rem",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: "10px",
                          marginBottom: "1.25rem",
                        }}
                      >
                        <HelpCircle size={16} color="var(--gov-primary-600)" style={{ marginTop: "2px", flexShrink: 0 }} />
                        <div style={{ fontSize: "0.76rem", color: "#475569", lineHeight: 1.5 }}>
                          <strong>Pedoman Penyusunan Pertanyaan:</strong> Gunakan kalimat pernyataan yang tegas, terukur, dan tidak menimbulkan multitafsir. Setiap butir mengukur aspek keandalan, ketepatan waktu, kemudahan akses, ketersediaan sarana, atau ketanggapan petugas.
                        </div>
                      </div>

                      {/* 5 Questions Cards List */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
                        {currentSec.questions.map((q) => (
                          <div key={q.id} className="studio-q-card">
                            <div className="studio-q-header">
                              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                <span className="studio-q-badge">
                                  Q{q.num}
                                </span>
                                <strong style={{ fontSize: "0.86rem", color: "#1e293b" }}>
                                  Butir Pertanyaan Nomor {q.num}
                                </strong>
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontFamily: "var(--font-mono)" }}>
                                  ID: {q.id}
                                </span>
                                <span style={{ fontSize: "0.7rem", color: "#64748b", background: "#f1f5f9", padding: "1px 6px", borderRadius: "4px" }}>
                                  {q.text.length} karakter
                                </span>
                              </div>
                            </div>

                            {/* Question Text Area */}
                            <textarea
                              rows={2}
                              value={q.text}
                              onChange={(e) => handleQuestionTextChange(currentSec.id, q.id, e.target.value)}
                              placeholder={`Tuliskan narasi pertanyaan evaluasi Q${q.num}...`}
                              style={{
                                width: "100%",
                                padding: "0.75rem 0.95rem",
                                fontSize: "0.88rem",
                                color: "#0f172a",
                                lineHeight: 1.5,
                                background: "#ffffff",
                                border: "1.5px solid #cbd5e1",
                                borderRadius: "8px",
                                outline: "none",
                                resize: "vertical",
                                fontFamily: "inherit",
                                transition: "all var(--transition-fast)",
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = "var(--gov-primary-600)";
                                e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.15)";
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = "#cbd5e1";
                                e.target.style.boxShadow = "none";
                              }}
                            />

                            {/* Likert Scale Choices Preview Bar */}
                            <div>
                              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "0.35rem" }}>
                                Opsi Respon Pegawai pada Formulir Survei:
                              </span>
                              <div className="studio-likert-preview-bar">
                                {LIKERT_OPTIONS.map((opt) => (
                                   <div key={opt.value} className="studio-likert-pill">
                                    <span
                                      style={{
                                        width: "16px",
                                        height: "16px",
                                        borderRadius: "50%",
                                        background: "var(--gov-primary-600)",
                                        color: "#ffffff",
                                        fontSize: "0.68rem",
                                        fontWeight: 800,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                      }}
                                    >
                                      {opt.value}
                                    </span>
                                    <span>{opt.label}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  /* VIEW MODE: PRATINJAU TAMPILAN PEGAWAI (LIVE SIMULATION) */
                  <div
                    style={{
                      background: "#ffffff",
                      border: "2px dashed var(--gov-primary-500)",
                      borderRadius: "var(--radius-xl)",
                      padding: "1.75rem",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    {/* Simulation Watermark Banner */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.75rem 1.15rem",
                        background: "#f0fdf4",
                        borderRadius: "10px",
                        border: "1px solid #bbf7d0",
                        marginBottom: "1.5rem",
                        flexWrap: "wrap",
                        gap: "0.75rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <Eye size={18} color="var(--gov-primary-600)" />
                        <div>
                          <strong style={{ fontSize: "0.85rem", color: "var(--gov-primary-800)" }}>
                            Pratinjau Interaktif Layar Pegawai (Responden)
                          </strong>
                          <p style={{ fontSize: "0.74rem", color: "var(--gov-primary-900)", margin: 0 }}>
                            Ini adalah simulasi tampilan formulir yang akan dilihat dan diisi oleh responden di lapangan.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setViewMode("edit")}
                        style={{ fontSize: "0.75rem" }}
                      >
                        <Pencil size={12} />
                        <span>Kembali ke Mode Edit</span>
                      </button>
                    </div>

                    {/* Respondent Section Title Box */}
                    <div
                      style={{
                        padding: "1.25rem 1.5rem",
                        background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                        borderRadius: "12px",
                        border: "1.5px solid #e2e8f0",
                        marginBottom: "1.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                      }}
                    >
                      <div
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "12px",
                          background: currentTheme.bg,
                          color: currentTheme.accent,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          border: `1.5px solid ${currentTheme.border}`,
                        }}
                      >
                        {getSectionIcon(currentSec.id, 26)}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              padding: "2px 7px",
                              borderRadius: "4px",
                              background: "#ffffff",
                              color: "var(--gov-primary-800)",
                              border: "1px solid #cbd5e1",
                            }}
                          >
                            Kode: {currentSec.code}
                          </span>
                          <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
                            5 Butir Pertanyaan
                          </span>
                        </div>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: "0.25rem 0 0" }}>
                          {currentSec.title}
                        </h3>
                      </div>
                    </div>

                    {/* Interactive Simulated Questions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                      {currentSec.questions.map((q) => {
                        const currentAnswer = simulatedAnswers[q.id];
                        return (
                          <div
                            key={q.id}
                            style={{
                              padding: "1.25rem",
                              borderRadius: "12px",
                              border: `1.5px solid ${currentAnswer ? "var(--gov-primary-600)" : "#e2e8f0"}`,
                              background: currentAnswer ? "#f0fdf4" : "#ffffff",
                              transition: "all var(--transition-fast)",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem", marginBottom: "1rem" }}>
                              <span
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "8px",
                                  background: currentAnswer ? "var(--gov-primary-600)" : "#f1f5f9",
                                  color: currentAnswer ? "#ffffff" : "#475569",
                                  fontSize: "0.82rem",
                                  fontWeight: 800,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                {q.num}
                              </span>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontSize: "0.92rem", fontWeight: 600, color: "#0f172a", margin: 0, lineHeight: 1.5 }}>
                                  {q.text}
                                </p>
                              </div>
                            </div>

                            {/* Clickable Likert Buttons */}
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(4, 1fr)",
                                gap: "0.6rem",
                              }}
                            >
                              {LIKERT_OPTIONS.map((opt) => {
                                const isSelected = currentAnswer === opt.value;
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() =>
                                      setSimulatedAnswers((prev) => ({
                                        ...prev,
                                        [q.id]: opt.value,
                                      }))
                                    }
                                    style={{
                                      padding: "0.65rem 0.5rem",
                                      borderRadius: "8px",
                                      border: `1.5px solid ${isSelected ? "var(--gov-primary-600)" : "#cbd5e1"}`,
                                      background: isSelected ? "var(--gov-primary-600)" : "#ffffff",
                                      color: isSelected ? "#ffffff" : "#334155",
                                      cursor: "pointer",
                                      textAlign: "center",
                                      transition: "all var(--transition-fast)",
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      gap: "0.2rem",
                                    }}
                                  >
                                    <span style={{ fontSize: "0.95rem", fontWeight: 800 }}>
                                      {opt.value}
                                    </span>
                                    <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>
                                      {opt.label}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>

        {/* Sticky Executive Floating Bottom Toolbar (Only appears when unsaved changes exist) */}
        {hasChanges && (
          <div className="studio-sticky-bar">
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "#fef3c7",
                  color: "#92400e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: "1px solid #fde68a",
                }}
              >
                <FileEdit size={18} />
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <strong style={{ fontSize: "0.88rem", color: "#0f172a" }}>
                    Perubahan Siap Disimpan
                  </strong>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      padding: "1px 7px",
                      borderRadius: "4px",
                      background: "#fef3c7",
                      color: "#b45309",
                    }}
                  >
                    {localSections.length} Dimensi • {totalQuestions} Pertanyaan
                  </span>
                </div>
                <p style={{ fontSize: "0.74rem", color: "#64748b", margin: 0 }}>
                  Klik &ldquo;Simpan Perubahan ke Database&rdquo; untuk menerapkan konfigurasi ini.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleResetClick}
                disabled={isResetting || isSaving}
              >
                <RotateCcw size={14} />
                <span>Reset Standar Baku</span>
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={isSaving || isResetting}
                style={{
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #059669, #047857)",
                  boxShadow: "0 4px 14px rgba(5, 150, 105, 0.4)",
                }}
              >
                <Save size={16} />
                <span>{isSaving ? "Menyimpan ke Database..." : "Simpan Perubahan ke Database"}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom UI/UX Confirmation Modal: Reset Konfigurasi Instrumen */}
      <UiConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset Konfigurasi Instrumen"
        message={`Apakah Anda yakin ingin mengembalikan seluruh Kode Program dan Narasi Pertanyaan ke standar resmi baku PermenPAN-RB No. 14 / 2017 TA ${new Date().getFullYear()}?`}
        subMessage="Perubahan kustom pada kode rekening belanja dan narasi butir pertanyaan saat ini akan digantikan dengan teks standar bawaan dinas."
        confirmText="Ya, Reset Standar"
        cancelText="Batal"
        type="warning"
        isLoading={isResetting}
      />
    </section>
  );
};
