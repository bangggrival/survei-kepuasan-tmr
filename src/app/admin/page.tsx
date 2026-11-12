"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { RagunanLogo } from "@/components/RagunanLogo";
import { Header, NavTabType } from "@/components/Header";
import { DashboardView } from "@/components/DashboardView";
import { OfficialSpreadsheetView } from "@/components/OfficialSpreadsheetView";
import { ResponsesTableView } from "@/components/ResponsesTableView";
import { QuestionManagerView } from "@/components/QuestionManagerView";
import { PeriodFilterState } from "@/components/PeriodCalendarPicker";
import { calculateMetrics, DashboardMetrics, SurveyResponse, SurveySection, SURVEY_SECTIONS } from "@/lib/constants";
import { computeOfficialRecap } from "@/lib/officialRecap";
import { getCurrentPeriodInfo, getOfficialPeriodSubtitle } from "@/lib/periodUtils";
import { SurveyPageHeader } from "@/components/SurveyPageHeader";
import { UiConfirmModal } from "@/components/UiConfirmModal";
import { PrintSelectorModal } from "@/components/PrintSelectorModal";
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  AlertCircle,
  ClipboardList,
  Clock,
} from "lucide-react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [pin, setPin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Admin view state
  const [currentTab, setCurrentTab] = useState<NavTabType>("dashboard");
  const [filterJabatan, setFilterJabatan] = useState<string>("all");
  const [currentPeriod, setCurrentPeriod] = useState<PeriodFilterState>(() => {
    const info = getCurrentPeriodInfo();
    return {
      label: info.pickerLabel,
      quarter: info.quarterCode,
      startDate: info.startDate,
      endDate: info.endDate,
    };
  });

  const [allResponses, setAllResponses] = useState<SurveyResponse[]>([]);
  const [sections, setSections] = useState<SurveySection[]>(SURVEY_SECTIONS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>("Baru saja");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [selectedSectionPrint, setSelectedSectionPrint] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "warning" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "warning" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Check initial authentication
  useEffect(() => {
    try {
      const auth = sessionStorage.getItem("tmr_admin_auth");
      if (auth === "true") {
        setIsAuthenticated(true);
      }
    } catch {
      // ignore storage error
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  // Fetch responses from API
  const fetchResponses = useCallback(async (jabatan = filterJabatan) => {
    setIsLoading(true);
    try {
      const url = jabatan === "all" ? "/api/responses" : `/api/responses?jabatan=${encodeURIComponent(jabatan)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAllResponses(data.data);
      }
    } catch (err) {
      console.error("Error fetching responses:", err);
      showToast("Gagal memuat data survei", "error");
    } finally {
      setIsLoading(false);
    }
  }, [filterJabatan]);

  // Fetch dynamic survey configuration (sections & questions)
  const fetchSurveyConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/survey-config");
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setSections(data.data);
      }
    } catch (err) {
      console.error("Error fetching survey config:", err);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchResponses("all");
      fetchSurveyConfig();
    }
  }, [isAuthenticated, fetchResponses, fetchSurveyConfig]);

  const handleSaveConfig = async (newSections: SurveySection[]): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/survey-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", sections: newSections }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSections(data.data);
        showToast("Kode Program & Pertanyaan berhasil diperbarui di database!", "success");
        return true;
      } else {
        throw new Error(data.error || "Gagal menyimpan konfigurasi");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan perubahan";
      showToast(msg, "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetConfig = async (): Promise<SurveySection[]> => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/survey-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSections(data.data);
        showToast("Konfigurasi soal & kode program berhasil dikembalikan ke standar default!", "success");
        return data.data;
      } else {
        throw new Error(data.error || "Gagal mereset konfigurasi");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mereset ke default";
      showToast(msg, "error");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const cleanPin = pin.trim().toLowerCase();

    if (cleanPin === "tmr1864" || cleanPin === "1864") {
      try {
        sessionStorage.setItem("tmr_admin_auth", "true");
        sessionStorage.setItem("tmr_admin_auth_time", new Date().toISOString());
      } catch {
        // ignore
      }
      setIsAuthenticated(true);
      showToast("Selamat datang di Portal Administrator & Pimpinan TMR", "success");
    } else {
      setLoginError("PIN / Kata Sandi salah. Silakan coba kembali.");
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem("tmr_admin_auth");
      sessionStorage.removeItem("tmr_admin_auth_time");
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setPin("");
    showToast("Anda telah keluar dari Portal Administrator", "warning");
  };

  const handleFilterJabatanChange = (jab: string) => {
    setFilterJabatan(jab);
    fetchResponses(jab);
  };

  const filteredByPeriod = useMemo(() => {
    if (!currentPeriod.startDate || !currentPeriod.endDate || currentPeriod.quarter === "ALL") {
      return allResponses;
    }
    const startIso = currentPeriod.startDate.includes("T")
      ? currentPeriod.startDate
      : `${currentPeriod.startDate}T00:00:00`;
    const endIso = currentPeriod.endDate.includes("T")
      ? currentPeriod.endDate
      : `${currentPeriod.endDate}T23:59:59.999`;

    const start = new Date(startIso).getTime();
    const end = new Date(endIso).getTime();

    return allResponses.filter((r) => {
      const t = new Date(r.timestamp).getTime();
      return t >= start && t <= end;
    });
  }, [allResponses, currentPeriod]);

  const handleResetPeriodToAll = () => {
    setCurrentPeriod({
      label: `Seluruh TA ${new Date().getFullYear()}`,
      quarter: "ALL",
      startDate: `${new Date().getFullYear()}-01-01`,
      endDate: `${new Date().getFullYear()}-12-31`,
    });
  };

  const metrics: DashboardMetrics = useMemo(() => {
    return calculateMetrics(filteredByPeriod, sections);
  }, [filteredByPeriod, sections]);

  const officialReport = useMemo(() => {
    return computeOfficialRecap(filteredByPeriod, sections, currentPeriod.label);
  }, [filteredByPeriod, sections, currentPeriod]);

  const handleTriggerPrint = (secId: string = "all") => {
    setSelectedSectionPrint(secId);
    setIsPrintModalOpen(false);
    setTimeout(() => {
      window.print();
    }, 120);
  };

  const handlePreviewProgram = (secId: string) => {
    setSelectedSectionPrint(secId);
    setCurrentTab("officialSheet");
    setIsPrintModalOpen(false);
  };

  const handleRefreshData = async () => {
    try {
      await fetchResponses(filterJabatan);
      const now = new Date();
      setLastRefreshed(
        `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")} WIB`
      );
      showToast("Data analitik survei berhasil diperbarui!", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memperbarui data";
      showToast(msg, "error");
    }
  };

  const handleDeleteResponse = async (id: string) => {
    try {
      const res = await fetch(`/api/responses/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast(`Data responden ${id} berhasil dihapus dari sistem`, "success");
        await fetchResponses(filterJabatan);
      } else {
        throw new Error(data.error);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus data";
      showToast(msg, "error");
    }
  };

  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  const handleClearAllResponses = () => {
    setIsClearAllModalOpen(true);
  };

  const handleConfirmClearAll = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/responses", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("Seluruh data pengisi kuesioner berhasil dikosongkan!", "success");
        await fetchResponses(filterJabatan);
        setIsClearAllModalOpen(false);
      } else {
        throw new Error(data.error);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengosongkan data";
      showToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc", gap: "0.85rem" }}>
        <Image
          src="/assets/ragunan-emblem-square.png"
          alt="Logo Ragunan"
          width={48}
          height={48}
          style={{ objectFit: "contain" }}
        />
        <p style={{ color: "#64748b", fontWeight: 600, fontSize: "0.85rem", margin: 0 }}>Memuat Portal Administrator...</p>
      </div>
    );
  }

  // ==========================================
  // LOGIN SCREEN (UNAUTHENTICATED)
  // ==========================================
  // LOGIN SCREEN (UNAUTHENTICATED)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
        {/* Simple Top Bar */}
        <header className="app-header" style={{ position: "static" }}>
          <div className="header-container">
            <Link href="/" className="header-brand-link" title="Beranda Kuesioner UP TMR">
              <RagunanLogo size={46} showSubtitle={true} />
            </Link>

            <Link
              href="/"
              className="btn btn-secondary btn-sm"
              style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
            >
              <ClipboardList size={14} />
              <span className="btn-text-full">Formulir Kuesioner</span>
              <span className="btn-text-short">Kuesioner</span>
            </Link>
          </div>
        </header>

        {/* Center Login Box - Selaras dengan Konsep Dokumen Kuesioner Resmi */}
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2.5rem 1rem" }}>
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              background: "#ffffff",
              borderRadius: "18px",
              border: "1px solid var(--border-color)",
              boxShadow: "0 10px 30px -5px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)",
              overflow: "hidden",
            }}
          >
            {/* Top Identity Header Card */}
            <div
              style={{
                padding: "2rem 1.75rem 1.25rem 1.75rem",
                textAlign: "center",
                borderBottom: "1px solid var(--border-light)",
                background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
              }}
            >
              <div style={{ display: "inline-block", marginBottom: "0.85rem" }}>
                <Image
                  src="/assets/ragunan-emblem-square.png"
                  alt="Emblem Ragunan"
                  width={60}
                  height={60}
                  style={{ objectFit: "contain" }}
                />
              </div>

              <SurveyPageHeader align="center" compact={true} />
            </div>

            <form onSubmit={handleLogin} style={{ padding: "1.75rem" }}>
              {loginError && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "10px",
                    color: "#b91c1c",
                    fontSize: "0.82rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{loginError}</span>
                </div>
              )}

              <div style={{ marginBottom: "1.25rem" }}>
                <label
                  htmlFor="admin-pin-field"
                  style={{
                    display: "block",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "var(--slate-800)",
                    marginBottom: "0.5rem",
                  }}
                >
                  PIN / Kata Sandi Otorisasi:
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="admin-pin-field"
                    type={showPassword ? "text" : "password"}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Masukkan PIN Admin (contoh: 1864)"
                    required
                    autoFocus
                    style={{
                      width: "100%",
                      padding: "0.85rem 2.8rem 0.85rem 1rem",
                      border: "1.5px solid var(--border-color)",
                      borderRadius: "10px",
                      fontSize: "1rem",
                      fontFamily: "inherit",
                      letterSpacing: showPassword ? "0.05em" : "0.2em",
                      outline: "none",
                      transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--gov-primary-600)";
                      e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--border-color)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "#94a3b8",
                      cursor: "pointer",
                      padding: "4px",
                    }}
                    aria-label={showPassword ? "Sembunyikan PIN" : "Tampilkan PIN"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "0.55rem",
                    flexWrap: "wrap",
                    gap: "0.35rem",
                  }}
                >
                  <span style={{ fontSize: "0.72rem", color: "var(--slate-500)" }}>
                    Khusus Administrator & Pimpinan TMR
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      fontSize: "0.7rem",
                      color: "var(--gov-primary-700)",
                      fontWeight: 600,
                    }}
                  >
                    <ShieldCheck size={13} />
                    <span>Akses Terproteksi</span>
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: "0.85rem",
                  fontSize: "0.92rem",
                  borderRadius: "10px",
                  fontWeight: 700,
                }}
              >
                <span>Masuk ke Dashboard Eksekutif</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div
              style={{
                padding: "1rem 1.75rem",
                background: "var(--slate-50)",
                borderTop: "1px solid var(--border-light)",
                textAlign: "center",
              }}
            >
              <Link
                href="/"
                style={{
                  fontSize: "0.78rem",
                  color: "var(--gov-primary-700)",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                ← Kembali ke Halaman Formulir Kuesioner Pegawai
              </Link>
            </div>
          </div>
        </main>

        <footer style={{ textAlign: "center", padding: "1.25rem", fontSize: "0.75rem", color: "#64748b" }}>
          © 2026 Unit Pengelola Taman Margasatwa Ragunan - Dinas Pertamanan dan Hutan Kota Provinsi DKI Jakarta
        </footer>
      </div>
    );
  }

  // ==========================================
  // AUTHENTICATED ADMIN INTERFACE
  // ==========================================
  return (
    <>
      {/* Admin Executive Header */}
      <Header
        role="admin"
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        totalResponses={allResponses.length}
        onLogoutAdmin={handleLogout}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
      />

      {/* Main Content Area for Admin */}
      <main className="app-main">
        {/* Official Executive Header - Selaras 100% dengan Format Resmi Kuesioner */}
        <div className="no-print" style={{ marginBottom: "1.25rem" }}>
          <SurveyPageHeader currentPeriod={currentPeriod} />
        </div>

        {/* Tab 1: Executive Dashboard IKM */}
        {currentTab === "dashboard" && (
          <div className="no-print">
            <DashboardView
              metrics={metrics}
              responses={filteredByPeriod}
              allResponsesCount={allResponses.length}
              onResetPeriodToAll={handleResetPeriodToAll}
              filterJabatan={filterJabatan}
              onFilterJabatanChange={handleFilterJabatanChange}
              currentPeriod={currentPeriod}
              onPeriodChange={setCurrentPeriod}
              onRefreshData={handleRefreshData}
              lastRefreshed={lastRefreshed}
              isLoading={isLoading}
              onPrintProgram={handleTriggerPrint}
            />
          </div>
        )}

        {/* Tab 2: Format Rekapitulasi Matriks PermenPAN-RB */}
        {currentTab === "officialSheet" && (
          <OfficialSpreadsheetView
            responses={filteredByPeriod}
            sections={sections}
            periodLabel={currentPeriod.label}
            isLoading={isLoading}
            selectedSectionId={selectedSectionPrint}
            onSelectSectionId={setSelectedSectionPrint}
          />
        )}

        {/* Tab 3: Rekap Data Responden */}
        {currentTab === "responses" && (
          <div className="no-print">
            <ResponsesTableView
              responses={allResponses}
              sections={sections}
              onDeleteResponse={handleDeleteResponse}
              onClearAllResponses={handleClearAllResponses}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Tab 4: Kelola Kode Program & Narasi Soal */}
        {currentTab === "manageQuestions" && (
          <div className="no-print">
            <QuestionManagerView
              sections={sections}
              onSaveConfig={handleSaveConfig}
              onResetConfig={handleResetConfig}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Khusus Hasil Cetak: Dokumen resmi yang dicetak (Matriks PermenPAN-RB Semua / Per Kode Program) */}
        {currentTab !== "officialSheet" && (
          <div className="print-matrix-only">
            <OfficialSpreadsheetView
              responses={filteredByPeriod}
              sections={sections}
              periodLabel={currentPeriod.label}
              isLoading={isLoading}
              selectedSectionId={selectedSectionPrint}
              onSelectSectionId={setSelectedSectionPrint}
            />
          </div>
        )}
      </main>

      {/* Clean Minimalist Footer */}
      <footer style={{ padding: "2rem 1rem 3rem", textAlign: "center", fontSize: "0.78rem", color: "#94a3b8" }}>
        <div>Unit Pengelola Taman Margasatwa Ragunan • Dinas Pertamanan dan Hutan Kota Provinsi DKI Jakarta</div>
        <div style={{ marginTop: "0.25rem", fontSize: "0.72rem", color: "#cbd5e1" }}>
          Dashboard Evaluasi PermenPAN-RB No. 14 / 2017
        </div>
      </footer>

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

      {/* Modal Dialog Pilihan Cetak PDF (Seluruh atau Per Kode Program) */}
      <PrintSelectorModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        sections={officialReport.sections}
        onPrint={handleTriggerPrint}
        onPreview={handlePreviewProgram}
        periodLabel={currentPeriod.label}
        overallIKM={officialReport.overallIKM}
      />

      {/* Custom UI/UX Confirmation Modal: Kosongkan Seluruh Data */}
      <UiConfirmModal
        isOpen={isClearAllModalOpen}
        onClose={() => setIsClearAllModalOpen(false)}
        onConfirm={handleConfirmClearAll}
        title="Kosongkan Semua Data Pengisi"
        message="Apakah Anda yakin ingin mengosongkan SELURUH data pengisi kuesioner? Tindakan ini akan menghapus semua respon di database dan tidak dapat dibatalkan."
        subMessage="Setelah dikosongkan, dashboard analitik dan matriks PermenPAN-RB akan kembali ke kondisi bersih untuk periode pengisian baru."
        confirmText="Ya, Kosongkan Semua"
        cancelText="Batal"
        type="danger"
        isLoading={isLoading}
      />
    </>
  );
}
