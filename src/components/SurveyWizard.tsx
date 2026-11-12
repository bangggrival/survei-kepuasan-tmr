"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ALL_QUESTIONS,
  JABATAN_OPTIONS,
  LIKERT_OPTIONS,
  SURVEY_SECTIONS,
  SurveyResponse,
  SurveySection,
} from "@/lib/constants";
import { getCurrentPeriodInfo, generateSurveyRegistrationCode } from "@/lib/periodUtils";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Printer,
  FileCheck,
  Info,
} from "lucide-react";

interface SurveyWizardProps {
  onSurveySubmitted: (newResp: SurveyResponse) => void;
  onGoToDashboard?: () => void;
  showDashboardButton?: boolean;
  sections?: SurveySection[];
}

export const SurveyWizard: React.FC<SurveyWizardProps> = ({
  onSurveySubmitted,
  onGoToDashboard,
  showDashboardButton = false,
  sections,
}) => {
  const activeSections = sections && sections.length > 0 ? sections : SURVEY_SECTIONS;
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = activeSections.length + 1;

  const [formData, setFormData] = useState({
    nama: "",
    nip: "",
    jabatan: "",
    saran: "",
    answers: {} as Record<string, number>,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [highlightedQuestionId, setHighlightedQuestionId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedData, setSubmittedData] = useState<SurveyResponse | null>(null);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<{
    message: string;
    existingId?: string;
    nama?: string;
    nip?: string;
    quarter?: string;
    year?: number;
    submitDateFormatted?: string;
  } | null>(null);
  const [localSubmissionNotice, setLocalSubmissionNotice] = useState<{
    id: string;
    nama: string;
    nip: string;
    date: string;
  } | null>(null);

  // Periksa catatan pengisian lokal di perangkat (Local Device Memory)
  useEffect(() => {
    try {
      const currentYear = new Date().getFullYear();
      const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
      const storageKey = `tmr_survey_sub_${currentYear}_Q${currentQuarter}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.nama && parsed.nip) {
          setLocalSubmissionNotice(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  /**
   * Pemeriksaan Data Ganda secara Asinkron (Opsi A: Per Periode & Kunci Nama Lengkap + NIP)
   */
  const checkDuplicateSubmission = async (
    nipToCheck: string,
    namaToCheck?: string
  ): Promise<boolean> => {
    const cleanNip = nipToCheck.trim();
    const cleanNama = (namaToCheck || "").trim();

    if (!cleanNip || cleanNip.length < 5) {
      setDuplicateWarning(null);
      return false;
    }

    try {
      setIsCheckingDuplicate(true);
      const url = `/api/responses/check-nip?nip=${encodeURIComponent(cleanNip)}&nama=${encodeURIComponent(cleanNama)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.exists) {
        const warning = {
          message: data.message || "Data Pegawai telah terdaftar mengisi kuesioner pada periode ini.",
          existingId: data.existingId,
          nama: data.nama,
          nip: data.nip,
          quarter: data.quarter,
          year: data.year,
          submitDateFormatted: data.submitDateFormatted,
        };
        setDuplicateWarning(warning);
        return true;
      } else {
        setDuplicateWarning(null);
        return false;
      }
    } catch {
      return false;
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  // Stepper Node Definitions dynamically generated from active sections
  const stepTitles = [
    "Identitas Pegawai",
    ...activeSections.map((s) => s.shortTitle || s.title),
  ];

  const totalQuestions = activeSections.reduce((acc, s) => acc + s.questions.length, 0);
  const answeredCount = Object.keys(formData.answers).length;

  const handleSelectAnswer = (qId: string, val: number) => {
    setFormData((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [qId]: val,
      },
    }));
    setErrorMessage(null);
    if (highlightedQuestionId === qId) {
      setHighlightedQuestionId(null);
    }
  };

  const validateStep = (step: number): boolean => {
    setErrorMessage(null);
    setHighlightedQuestionId(null);

    if (step === 1) {
      if (!formData.nama.trim() || formData.nama.trim().length < 3) {
        setErrorMessage("Mohon masukkan Nama Lengkap Pegawai secara valid (minimal 3 karakter)");
        return false;
      }
      if (!formData.nip.trim() || formData.nip.trim().length < 5) {
        setErrorMessage("Mohon masukkan NIP atau NRK resmi Pegawai (minimal 5 karakter)");
        return false;
      }
      if (duplicateWarning) {
        setErrorMessage(duplicateWarning.message);
        return false;
      }
      if (!formData.jabatan) {
        setErrorMessage("Mohon pilih Kategori Jabatan Pegawai Anda");
        return false;
      }
      return true;
    }

    const sectionIndex = step - 2;
    const currentSection = activeSections[sectionIndex];
    if (currentSection) {
      const unanswered = currentSection.questions.filter((q) => !formData.answers[q.id]);
      if (unanswered.length > 0) {
        const firstMissing = unanswered[0];
        setHighlightedQuestionId(firstMissing.id);
        setErrorMessage(
          `Mohon berikan penilaian untuk pertanyaan nomor Q${firstMissing.num} di bawah ini sebelum melanjutkan.`
        );
        setTimeout(() => {
          const el = document.getElementById(`qitem-${firstMissing.id}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 80);
        return false;
      }
    }

    return true;
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      setErrorMessage(null);
      setHighlightedQuestionId(null);

      if (!formData.nama.trim() || formData.nama.trim().length < 3) {
        setErrorMessage("Mohon masukkan Nama Lengkap Pegawai secara valid (minimal 3 karakter)");
        return;
      }
      if (!formData.nip.trim() || formData.nip.trim().length < 5) {
        setErrorMessage("Mohon masukkan NIP atau NRK resmi Pegawai (minimal 5 karakter)");
        return;
      }
      if (!formData.jabatan) {
        setErrorMessage("Mohon pilih Kategori Jabatan Pegawai Anda");
        return;
      }

      // Verifikasi Asinkron Anti-Duplikasi Periode Berjalan (Opsi A: Nama Lengkap + NIP)
      const isDuplicate = await checkDuplicateSubmission(formData.nip, formData.nama);
      if (isDuplicate) {
        setErrorMessage("Data Pegawai telah terdaftar mengisi kuesioner pada periode ini. Sesuai ketentuan, setiap pegawai hanya dapat mengisi 1 (satu) kali per triwulan.");
        return;
      }
    } else {
      if (!validateStep(currentStep)) return;
    }

    setHighlightedQuestionId(null);
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrev = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menyimpan data kuesioner");
      }

      setSubmittedData(json.data);
      setShowSuccessModal(true);
      onSurveySubmitted(json.data);

      // Simpan catatan bukti pengisian lokal pada peramban perangkat
      try {
        const currentYear = new Date().getFullYear();
        const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
        const storageKey = `tmr_survey_sub_${currentYear}_Q${currentQuarter}`;
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            id: json.data.id,
            nama: json.data.nama,
            nip: json.data.nip,
            date: new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
          })
        );
      } catch {
        // ignore
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan data kuesioner.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      nama: "",
      nip: "",
      jabatan: "",
      saran: "",
      answers: {},
    });
    setCurrentStep(1);
    setShowSuccessModal(false);
  };

  const pct = Math.round((currentStep / totalSteps) * 100);

  return (
    <section className="tab-pane active" id="pane-survey">
      <div className="survey-wrapper">
        {/* Sleek Segmented Stepper */}
        <div className="stepper-card">
          <div className="stepper-header">
            <div className="stepper-title-group">
              <span className="stepper-step-count">
                Langkah {currentStep} dari {totalSteps}
              </span>
              <h3 className="stepper-title">{stepTitles[currentStep - 1]}</h3>
            </div>
            <div className="stepper-meta-group">
              <span className="stepper-pct">{pct}% Selesai</span>
              {currentStep > 1 && (
                <span className="stepper-counter">
                  {answeredCount} dari {totalQuestions} Soal Terisi
                </span>
              )}
            </div>
          </div>

          {/* Segmented Progress Track */}
          <div
            className="segmented-track"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {stepTitles.map((title, idx) => {
              const stepNum = idx + 1;
              const isPast = currentStep > stepNum;
              const isCurrent = currentStep === stepNum;
              return (
                <div
                  key={title}
                  className={`segment-bar ${isCurrent ? "current" : isPast ? "past" : "future"}`}
                  onClick={() => {
                    if (isPast || isCurrent) {
                      setHighlightedQuestionId(null);
                      setErrorMessage(null);
                      setCurrentStep(stepNum);
                    }
                  }}
                  title={`${stepNum}. ${title}`}
                />
              );
            })}
          </div>

          {/* Step Breadcrumbs */}
          <div className="step-breadcrumbs">
            {stepTitles.map((title, idx) => {
              const stepNum = idx + 1;
              const isPast = currentStep > stepNum;
              const isCurrent = currentStep === stepNum;
              const isNavigable = isPast || isCurrent;
              return (
                <button
                  key={title}
                  type="button"
                  disabled={!isNavigable}
                  className={`breadcrumb-step ${isCurrent ? "current" : isPast ? "completed" : "pending"}`}
                  onClick={() => {
                    if (isNavigable) {
                      setHighlightedQuestionId(null);
                      setErrorMessage(null);
                      setCurrentStep(stepNum);
                    }
                  }}
                >
                  <span className="breadcrumb-num">
                    {isPast ? <Check size={11} strokeWidth={3} /> : stepNum}
                  </span>
                  <span className="breadcrumb-label">
                    {idx === 0 ? "Identitas" : `Bagian ${idx}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Survey Form Card */}
        <div className="survey-card">
          {/* Step 1: Identitas Responden */}
          {currentStep === 1 && (
            <div>
              <div className="survey-section-header">
                <div className="section-meta-tag">Formulir Identitas</div>
                <h2 className="section-title">Data Identitas Responden Pegawai</h2>
                <p className="section-instruction">
                  Silakan isi data penugasan kedinasan Anda di UP Taman Margasatwa Ragunan.
                </p>
              </div>

              <div className="survey-card-body">
                {/* Catatan Partisipasi Lokal Perangkat (Shared Device Alert) */}
                {localSubmissionNotice && (
                  <div
                    style={{
                      marginBottom: "1.1rem",
                      padding: "0.75rem 1rem",
                      borderRadius: "10px",
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                    }}
                  >
                    <Info size={16} color="#047857" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: "0.78rem", color: "#065f46", lineHeight: 1.45 }}>
                      Perangkat ini mencatat pengisian kuesioner sebelumnya atas nama <strong>{localSubmissionNotice.nama}</strong> ({localSubmissionNotice.date}). Jika Anda pegawai yang berbeda, silakan isi data Anda di bawah ini.
                    </div>
                    <button
                      type="button"
                      onClick={() => setLocalSubmissionNotice(null)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#047857",
                        cursor: "pointer",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        textDecoration: "underline",
                      }}
                    >
                      Tutup
                    </button>
                  </div>
                )}

                {errorMessage && (
                  <div className="error-banner-alert">
                    <AlertCircle size={18} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="nama">
                    Nama Lengkap Pegawai <span className="required-mark">*</span>
                  </label>
                  <input
                    type="text"
                    id="nama"
                    className={`form-input ${duplicateWarning ? "input-error" : ""}`}
                    placeholder="Contoh: Nama Lengkap Pegawai (Fiktif / Contoh)"
                    value={formData.nama}
                    onBlur={(e) => {
                      if (formData.nip.trim().length >= 5) {
                        checkDuplicateSubmission(formData.nip, e.target.value);
                      }
                    }}
                    onChange={(e) => {
                      setFormData({ ...formData, nama: e.target.value });
                      setErrorMessage(null);
                      if (duplicateWarning) setDuplicateWarning(null);
                    }}
                  />
                  <span className="form-help">Nama lengkap sesuai dengan data kepegawaian resmi</span>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="nip">
                    NIP / NRK Pegawai <span className="required-mark">*</span>
                  </label>
                  <input
                    type="text"
                    id="nip"
                    className={`form-input ${duplicateWarning ? "input-error" : ""}`}
                    placeholder="Contoh: 19xxxxxxxxxxxxxxxx (18 digit NIP / 6 digit NRK)"
                    value={formData.nip}
                    onBlur={(e) => checkDuplicateSubmission(e.target.value, formData.nama)}
                    onChange={(e) => {
                      setFormData({ ...formData, nip: e.target.value });
                      setErrorMessage(null);
                      if (duplicateWarning) setDuplicateWarning(null);
                    }}
                  />
                  {isCheckingDuplicate && (
                    <span style={{ fontSize: "0.74rem", color: "#047857", display: "inline-flex", alignItems: "center", gap: "0.3rem", marginTop: "0.25rem" }}>
                      <span>Memverifikasi status Nama & NIP/NRK...</span>
                    </span>
                  )}
                  {duplicateWarning && (
                    <div
                      className="duplicate-alert-card"
                      style={{
                        marginTop: "0.65rem",
                        padding: "0.85rem 1rem",
                        borderRadius: "10px",
                        background: "#fef2f2",
                        border: "1.5px solid #fecaca",
                        color: "#991b1b",
                        fontSize: "0.82rem",
                        boxShadow: "0 2px 4px rgba(220, 38, 38, 0.06)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.35rem" }}>
                        <AlertTriangle size={17} color="#dc2626" style={{ flexShrink: 0 }} />
                        <strong style={{ fontSize: "0.88rem", color: "#991b1b" }}>
                          Data Pegawai Telah Terdaftar pada Periode Ini
                        </strong>
                      </div>
                      <p style={{ margin: "0 0 0.5rem 0", lineHeight: 1.5, color: "#7f1d1d" }}>
                        {duplicateWarning.message}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.6rem",
                          flexWrap: "wrap",
                          fontSize: "0.74rem",
                          borderTop: "1px dashed #fca5a5",
                          paddingTop: "0.45rem",
                          color: "#991b1b",
                        }}
                      >
                        <span>No. Registrasi: <strong>{duplicateWarning.existingId}</strong></span>
                        <span>•</span>
                        <span>Periode: <strong>{duplicateWarning.quarter} TA {duplicateWarning.year}</strong></span>
                        <span>•</span>
                        <span>Status: <strong>Telah Selesai Dinilai</strong></span>
                      </div>
                    </div>
                  )}
                  <span className="form-help">Nomor Induk Pegawai (18 digit) atau Nomor Registrasi Kepegawaian resmi</span>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Kategori Jabatan Pegawai <span className="required-mark">*</span>
                  </label>
                  <div className="jabatan-radio-group" role="radiogroup" aria-label="Kategori Jabatan Pegawai">
                    {JABATAN_OPTIONS.map((jab) => {
                      const isSelected = formData.jabatan === jab;

                      return (
                        <div
                          key={jab}
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={0}
                          className={`jabatan-radio-card ${isSelected ? "selected" : ""}`}
                          onClick={() => {
                            setFormData({ ...formData, jabatan: jab });
                            setErrorMessage(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === " " || e.key === "Enter") {
                              e.preventDefault();
                              setFormData({ ...formData, jabatan: jab });
                              setErrorMessage(null);
                            }
                          }}
                        >
                          <div className="radio-indicator">
                            <div className="radio-inner-dot" />
                          </div>
                          <span className="jabatan-name">{jab}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2+: Survey Sections Questions */}
          {currentStep >= 2 && currentStep <= totalSteps && (
            <div>
              {(() => {
                const section = activeSections[currentStep - 2];
                if (!section) return null;

                return (
                  <div>
                    <div className="survey-section-header">
                      <div className="section-meta-tag">
                        Sub-Kegiatan Rekening • {section.code}
                      </div>
                      <h2 className="section-title">{section.title}</h2>
                      <p className="section-instruction">
                        Berikan penilaian objektif pada skala 1 (Sangat Tidak Setuju) hingga 4 (Sangat Setuju).
                      </p>
                    </div>

                    <div className="survey-card-body">
                      {errorMessage && (
                        <div className="error-banner-alert">
                          <AlertCircle size={18} />
                          <span>{errorMessage}</span>
                        </div>
                      )}

                      {/* Pertanyaan Indikator Layanan */}
                      {section.questions.map((q) => {
                        const currentAnswer = formData.answers[q.id];
                        const isAnswered = Boolean(currentAnswer);
                        const isHighlighted = highlightedQuestionId === q.id;

                        return (
                          <div
                            key={q.id}
                            tabIndex={0}
                            role="region"
                            aria-label={`Pertanyaan Q${q.num}: ${q.text}`}
                            className={`question-item ${isAnswered ? "answered" : ""} ${
                              isHighlighted ? "unanswered-alert" : ""
                            }`}
                            id={`qitem-${q.id}`}
                            onKeyDown={(e) => {
                              if (["1", "2", "3", "4"].includes(e.key)) {
                                e.preventDefault();
                                handleSelectAnswer(q.id, parseInt(e.key, 10));
                              }
                            }}
                          >
                            <div className="question-header">
                              <div className={`question-badge ${isAnswered ? "answered" : ""}`}>
                                {q.num}
                              </div>
                              <div className="question-text">
                                {q.text} <span className="required-mark">*</span>
                              </div>
                              {isAnswered && (
                                <span className="question-check-pill" title="Pertanyaan sudah terisi">
                                  <Check size={12} strokeWidth={3} />
                                </span>
                              )}
                              {!isAnswered && isHighlighted && (
                                <span className="question-status-badge unanswered">
                                  <AlertCircle size={12} /> Wajib Diisi
                                </span>
                              )}
                            </div>

                            <div
                              className="likert-grid"
                              role="radiogroup"
                              aria-label={`Pilihan penilaian untuk pertanyaan nomor Q${q.num}`}
                            >
                              {LIKERT_OPTIONS.map((opt) => {
                                const isSelected = currentAnswer === opt.value;
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    role="radio"
                                    aria-checked={isSelected}
                                    title={`Pilih nilai ${opt.value}: ${opt.label}`}
                                    className={`likert-btn ${isSelected ? "selected" : ""}`}
                                    onClick={() => handleSelectAnswer(q.id, opt.value)}
                                  >
                                    <span className="likert-score">{opt.value}</span>
                                    <span className="likert-text">{opt.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      {/* Step Terakhir: Optional Saran */}
                      {currentStep === totalSteps && (
                        <div className="form-group" style={{ marginTop: "2rem" }}>
                          <label className="form-label" htmlFor="saran">
                            Saran & Masukan Konstruktif untuk Peningkatan Layanan (Opsional):
                          </label>
                          <textarea
                            id="saran"
                            rows={3}
                            className="form-textarea"
                            placeholder="Tuliskan masukan atau rekomendasi untuk peningkatan kualitas sarana penunjang di UP TMR..."
                            value={formData.saran}
                            onChange={(e) => setFormData({ ...formData, saran: e.target.value })}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Stepper Footer Controls */}
          <div className="survey-footer">
            {currentStep > 1 ? (
              <button type="button" className="btn btn-secondary" onClick={handlePrev}>
                <ArrowLeft size={16} />
                <span>Sebelumnya</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < totalSteps ? (
              <button type="button" className="btn btn-primary btn-next-step" onClick={handleNext}>
                <span className="btn-text-full">Lanjut ke Bagian Selanjutnya</span>
                <span className="btn-text-short">Lanjut</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-submit-survey"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                <Check size={16} strokeWidth={2.5} />
                <span>{isSubmitting ? "Menyimpan Jawaban..." : `Kirim Jawaban Survei (${answeredCount}/${totalQuestions})`}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal: Bukti Tanda Terima Survei Resmi */}
      {showSuccessModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckCircle2 size={22} color="#059669" />
                <h3 className="modal-title">Survei Berhasil Tersimpan!</h3>
              </div>
            </div>
            <div className="modal-body" style={{ textAlign: "center", padding: "1.75rem 1.5rem" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  color: "#16a34a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem auto",
                }}
              >
                <CheckCircle2 size={28} />
              </div>

              <h4 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.35rem" }}>
                Survei Berhasil Disimpan
              </h4>
              <p style={{ fontSize: "0.85rem", color: "#64748b", maxWidth: "440px", margin: "0 auto 1.25rem auto" }}>
                Terima kasih atas partisipasi Anda, {submittedData?.nama}. Respon Anda telah tercatat pada sistem.
              </p>

              {/* Official Receipt Card */}
              <div
                className="survey-success-receipt"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "1.25rem",
                  margin: "0 auto 1.5rem auto",
                  textAlign: "left",
                  maxWidth: "480px",
                  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
                }}
              >
                {/* Receipt Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.85rem",
                    marginBottom: "0.85rem",
                    paddingBottom: "0.85rem",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <Image
                    src="/assets/ragunan-emblem-square.png"
                    alt="Lambang Ragunan"
                    width={40}
                    height={40}
                    style={{ objectFit: "contain", flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.25 }}>
                      UNIT PENGELOLA TAMAN MARGASATWA RAGUNAN
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px" }}>
                      Tanda Terima Kuesioner Kepuasan Layanan
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gap: "0.45rem", fontSize: "0.8rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#64748b" }}>Nomor Registrasi:</span>
                    <strong
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--gov-primary-800)",
                        background: "#f0fdf4",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        border: "1px solid #bbf7d0",
                        fontSize: "0.82rem",
                      }}
                    >
                      {submittedData ? generateSurveyRegistrationCode(submittedData.id) : `TMR/IKM/${new Date().getFullYear()}/RESP-000`}
                    </strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Nama:</span>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>{submittedData?.nama}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>NIP / NRK:</span>
                    <span style={{ fontWeight: 600, color: "#1e293b", fontFamily: "var(--font-mono)" }}>
                      {submittedData?.nip}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Kategori Jabatan:</span>
                    <span style={{ fontWeight: 600, color: "#1e293b" }}>{submittedData?.jabatan}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Waktu Pengisian:</span>
                    <span style={{ color: "#475569" }}>{new Date().toLocaleString("id-ID")} WIB</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => window.print()}
                title="Cetak Tanda Terima"
              >
                <Printer size={14} />
                <span>Cetak Bukti Tanda Terima</span>
              </button>

              {showDashboardButton && onGoToDashboard ? (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setShowSuccessModal(false);
                    onGoToDashboard();
                  }}
                >
                  <FileCheck size={14} />
                  <span>Kembali ke Dashboard IKM</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleResetForm}
                >
                  <CheckCircle2 size={14} />
                  <span>Selesai / Isi Survei Baru</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
