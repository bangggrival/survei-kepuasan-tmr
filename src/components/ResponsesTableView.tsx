"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ALL_QUESTIONS, JABATAN_OPTIONS, LIKERT_OPTIONS, SURVEY_SECTIONS, SurveyResponse, SurveySection } from "@/lib/constants";
import { Search, Eye, Trash2, X, MessageSquare, Clock, ChevronRight, ChevronLeft, Filter, Download, Users, FileSpreadsheet } from "lucide-react";
import { UiConfirmModal } from "./UiConfirmModal";
import { generateRawResponsesXlsx } from "@/lib/excelExport";

interface ResponsesTableViewProps {
  responses: SurveyResponse[];
  sections?: SurveySection[];
  onDeleteResponse: (id: string) => Promise<void>;
  onClearAllResponses?: () => void | Promise<void>;
  isLoading: boolean;
}

export const ResponsesTableView: React.FC<ResponsesTableViewProps> = ({
  responses,
  sections,
  onDeleteResponse,
  onClearAllResponses,
  isLoading,
}) => {
  const activeSections = sections && sections.length > 0 ? sections : SURVEY_SECTIONS;
  const activeQuestions = useMemo(() => {
    return activeSections.flatMap((s) => s.questions.map((q) => ({
      ...q,
      sectionTitle: s.title,
      sectionShortTitle: s.shortTitle || s.title,
    })));
  }, [activeSections]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterJabatan, setFilterJabatan] = useState("all");
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nama: string } | null>(null);
  const [isExportingXlsx, setIsExportingXlsx] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Filter responses by search query and jabatan
  const filtered = useMemo(() => {
    return responses.filter((r) => {
      const matchesJabatan = filterJabatan === "all" || r.jabatan === filterJabatan;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.nama.toLowerCase().includes(q) ||
        r.nip.toLowerCase().includes(q) ||
        (r.saran && r.saran.toLowerCase().includes(q));
      return matchesJabatan && matchesSearch;
    });
  }, [responses, filterJabatan, searchQuery]);

  // Reset page to 1 whenever search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterJabatan]);

  const totalItems = filtered.length;
  const totalPages = pageSize === -1 ? 1 : Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedResponses = pageSize === -1
    ? filtered
    : filtered.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);
  const startIdx = totalItems === 0 ? 0 : (safeCurrentPage - 1) * (pageSize === -1 ? totalItems : pageSize) + 1;
  const endIdx = pageSize === -1 ? totalItems : Math.min(safeCurrentPage * pageSize, totalItems);

  const handleDelete = (id: string, nama: string) => {
    setDeleteTarget({ id, nama });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeletingId(deleteTarget.id);
    try {
      await onDeleteResponse(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setIsDeletingId(null);
    }
  };

  const getRoleClass = (jabatan: string) => {
    switch (jabatan) {
      case "Pejabat Administrator":
        return "role-pill admin";
      case "Pejabat Pengawas":
        return "role-pill pengawas";
      case "Jabatan Pelaksana":
        return "role-pill pelaksana";
      case "Jabatan Fungsional":
        return "role-pill fungsional";
      default:
        return "role-pill";
    }
  };

  const calculateIndividualAverage = (answers: Record<string, number>) => {
    const vals = Object.values(answers);
    if (vals.length === 0) return 0;
    const sum = vals.reduce((a, b) => a + b, 0);
    return (sum / vals.length).toFixed(2);
  };

  const handleExportRawCsv = () => {
    const headers = [
      "ID",
      "Nama Pegawai",
      "NIP / NRK",
      "Jabatan",
      "Waktu Input",
      "Rata-rata",
      "Saran & Masukan",
      ...activeQuestions.map((q) => `Q${q.num}_${q.id}`),
    ];

    const rows = filtered.map((r) => {
      const avg = calculateIndividualAverage(r.answers);
      const qVals = activeQuestions.map((q) => r.answers[q.id] || "");
      return [
        `"${r.id}"`,
        `"${r.nama.replace(/"/g, '""')}"`,
        `"${r.nip}"`,
        `"${r.jabatan}"`,
        `"${new Date(r.timestamp).toISOString()}"`,
        `"${avg}"`,
        `"${(r.saran || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
        ...qVals,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.map((h) => `"${h}"`).join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Data_Responden_Survei_TMR_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportRawXlsx = async () => {
    try {
      setIsExportingXlsx(true);
      const blob = await generateRawResponsesXlsx(filtered, activeQuestions);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Data_Responden_Survei_TMR_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Gagal ekspor Excel:", err);
      setExportError("Sistem gagal memproses ekspor file Excel responden (.xlsx). Pastikan izin unduhan pada peramban aktif dan silakan coba kembali.");
    } finally {
      setIsExportingXlsx(false);
    }
  };

  return (
    <section className="tab-pane active" id="pane-responses">
      <div className="table-card">
        {/* Responsive Table Toolbar */}
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="search-input-box">
              <span className="search-icon-pos">
                <Search size={15} />
              </span>
              <input
                type="text"
                className="search-input"
                placeholder="Cari nama, NIP, atau saran..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <Filter size={14} color="#64748b" />
              <select
                className="select-filter"
                value={filterJabatan}
                onChange={(e) => setFilterJabatan(e.target.value)}
              >
                <option value="all">Semua Jabatan ({responses.length})</option>
                {JABATAN_OPTIONS.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-toolbar-right" style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            {onClearAllResponses && responses.length > 0 && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onClearAllResponses}
                title="Hapus seluruh data responden di database"
                style={{ color: "#b91c1c", borderColor: "#fecaca", background: "#fef2f2" }}
              >
                <Trash2 size={14} color="#dc2626" />
                <span>Kosongkan Semua Data</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleExportRawXlsx}
              disabled={filtered.length === 0 || isExportingXlsx}
              title="Unduh data responden lengkap (20 butir kuesioner) ke file Excel .xlsx"
            >
              <FileSpreadsheet size={14} />
              <span>{isExportingXlsx ? "Menyiapkan..." : "Ekspor Excel (.xlsx)"}</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleExportRawCsv}
              disabled={responses.length === 0}
              title="Unduh data mentah responden ke format CSV"
            >
              <Download size={14} />
              <span>Ekspor CSV</span>
            </button>

            <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
              Menampilkan <strong>{filtered.length}</strong> dari {responses.length} Responden
            </div>
          </div>
        </div>

        {/* Scroll Helper Hint for Mobile */}
        <div className="mobile-scroll-hint">
          <span>Geser tabel ke samping untuk melihat detail responden</span>
          <ChevronRight size={14} />
        </div>

        {/* Table Container */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "90px" }}>ID</th>
                <th style={{ width: "220px" }}>Nama & NIP Pegawai</th>
                <th style={{ width: "180px" }}>Jabatan</th>
                <th style={{ width: "100px", textAlign: "center" }}>Rata-rata</th>
                <th>Saran / Masukan</th>
                <th style={{ width: "140px" }}>Waktu Input</th>
                <th style={{ width: "110px", textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state" style={{ padding: "3.5rem 1.5rem", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem" }}>
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          background: "#f0fdf4",
                          color: "var(--gov-primary-600)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: "0.25rem",
                          border: "1px solid #bbf7d0",
                        }}
                      >
                        <Users size={24} />
                      </div>
                      <strong style={{ fontSize: "1rem", color: "#0f172a" }}>
                        {responses.length === 0
                          ? "Data Pengisi Kuesioner Masih Kosong"
                          : "Tidak Ditemukan Responden yang Cocok"}
                      </strong>
                      <p style={{ fontSize: "0.82rem", color: "#64748b", maxWidth: "420px", margin: 0, lineHeight: 1.5 }}>
                        {responses.length === 0
                          ? "Seluruh data pengisi telah dikosongkan. Basis data siap menerima respon pengisian baru dari pegawai secara otomatis."
                          : "Silakan ubah kata kunci pencarian atau ganti filter jabatan untuk menemukan data."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedResponses.map((r) => {
                  const avg = calculateIndividualAverage(r.answers);
                  const dateStr = new Date(r.timestamp).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  const getInitials = (name: string) => {
                    const parts = name.trim().split(" ");
                    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
                    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                  };

                  return (
                    <tr key={r.id}>
                      <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--primary-700)" }}>
                        {r.id}
                      </td>
                      <td>
                        <div className="table-user-cell-wrap">
                          <div className="user-avatar-badge">
                            {getInitials(r.nama)}
                          </div>
                          <div className="table-user-cell">
                            <span className="table-user-name">{r.nama}</span>
                            <span className="table-user-nip">NIP: {r.nip}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={getRoleClass(r.jabatan)}>{r.jabatan}</span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span
                          style={{
                            fontWeight: 800,
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "0.85rem",
                            background: Number(avg) >= 3.5 ? "#d1fae5" : "#e0f2fe",
                            color: Number(avg) >= 3.5 ? "#065f46" : "#0369a1",
                          }}
                        >
                          {avg}
                        </span>
                      </td>
                      <td style={{ maxWidth: "260px" }}>
                        <span
                          style={{
                            fontSize: "0.82rem",
                            color: r.saran ? "#334155" : "#94a3b8",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {r.saran || "— Tidak ada catatan saran —"}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.78rem", color: "#64748b" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <Clock size={12} />
                          <span>{dateStr}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "inline-flex", gap: "0.35rem" }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: "0.3rem 0.5rem" }}
                            onClick={() => setSelectedResponse(r)}
                            title="Lihat Detail Jawaban"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger-outline btn-sm"
                            style={{ padding: "0.3rem 0.5rem" }}
                            onClick={() => handleDelete(r.id, r.nama)}
                            disabled={isDeletingId === r.id}
                            title="Hapus Data Responden Ini"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modern Enterprise Pagination Bar */}
        {totalItems > 0 && (
          <div
            className="table-pagination"
            style={{
              padding: "0.85rem 1.25rem",
              borderTop: "1px solid var(--border-color)",
              background: "#ffffff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.75rem",
              fontSize: "0.82rem",
            }}
          >
            <div className="table-pagination-info" style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <span style={{ color: "#64748b" }}>
                Menampilkan <strong>{startIdx}</strong> - <strong>{endIdx}</strong> dari <strong>{totalItems}</strong> responden
              </span>

              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ color: "#64748b", fontSize: "0.78rem" }}>Baris per halaman:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="select-filter"
                  style={{
                    padding: "3px 22px 3px 8px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    background: "#f8fafc",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: "#334155",
                    cursor: "pointer",
                  }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={-1}>Semua</option>
                </select>
              </div>
            </div>

            {totalPages > 1 && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage <= 1}
                  style={{ padding: "0.3rem 0.55rem" }}
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft size={14} />
                  <span>Sebelumnya</span>
                </button>

                <div style={{ display: "inline-flex", gap: "0.25rem" }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const isCur = p === safeCurrentPage;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setCurrentPage(p)}
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "6px",
                          border: isCur ? "1px solid var(--gov-primary-700)" : "1px solid #e2e8f0",
                          background: isCur ? "var(--gov-primary-700)" : "#ffffff",
                          color: isCur ? "#ffffff" : "#475569",
                          fontWeight: isCur ? 800 : 600,
                          fontSize: "0.78rem",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage >= totalPages}
                  style={{ padding: "0.3rem 0.55rem" }}
                  title="Halaman Selanjutnya"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Answer Detail Modal */}
      {selectedResponse && (
        <div className="modal-backdrop" onClick={() => setSelectedResponse(null)}>
          <div className="modal-dialog wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--gov-primary-700)", fontWeight: 700 }}>
                  Detail Responden ({selectedResponse.id})
                </span>
                <h3 className="modal-title">{selectedResponse.nama}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedResponse(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Profile Summary Card */}
              <div className="modal-profile-summary">
                <div>
                  <span className="profile-summary-label">NIP / NRK:</span>
                  <strong className="profile-summary-val">{selectedResponse.nip}</strong>
                </div>
                <div>
                  <span className="profile-summary-label">Jabatan:</span>
                  <span className={getRoleClass(selectedResponse.jabatan)}>{selectedResponse.jabatan}</span>
                </div>
                <div>
                  <span className="profile-summary-label">Rata-rata Skor:</span>
                  <strong style={{ fontSize: "0.95rem", color: "var(--gov-primary-700)" }}>
                    {calculateIndividualAverage(selectedResponse.answers)} / 4.00
                  </strong>
                </div>
              </div>

              {/* Saran Box */}
              {selectedResponse.saran && (
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "8px",
                    padding: "1rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--gov-primary-800)", fontWeight: 700, fontSize: "0.82rem", marginBottom: "0.3rem" }}>
                    <MessageSquare size={14} />
                    <span>Saran & Masukan Pegawai:</span>
                  </div>
                  <p style={{ fontSize: "0.88rem", color: "var(--gov-primary-900)", fontStyle: "italic", lineHeight: 1.5 }}>
                    &ldquo;{selectedResponse.saran}&rdquo;
                  </p>
                </div>
              )}

              {/* 4 Dimension Questions Breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {activeSections.map((sec) => (
                  <div
                    key={sec.id}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "0.75rem 1rem",
                        background: "#f1f5f9",
                        borderBottom: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                      }}
                    >
                      <strong style={{ fontSize: "0.85rem", color: "#1e293b" }}>{sec.title}</strong>
                      <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", color: "#64748b" }}>
                        {sec.code}
                      </span>
                    </div>

                    <div style={{ padding: "0.75rem 1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {sec.questions.map((q) => {
                        const val = selectedResponse.answers[q.id];
                        const opt = LIKERT_OPTIONS.find((o) => o.value === val);

                        return (
                          <div
                            key={q.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "1rem",
                              fontSize: "0.82rem",
                              borderBottom: "1px dashed #f1f5f9",
                              paddingBottom: "0.5rem",
                              flexWrap: "wrap",
                            }}
                          >
                            <span style={{ color: "#334155", flex: 1, minWidth: "200px" }}>
                              <strong>Q{q.num}.</strong> {q.text}
                            </span>
                            <span
                              style={{
                                flexShrink: 0,
                                padding: "3px 10px",
                                borderRadius: "6px",
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                background: opt ? opt.bg : "#f1f5f9",
                                color: opt ? opt.color : "#475569",
                              }}
                            >
                              Skor {val}: {opt ? opt.label : "-"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedResponse(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom UI/UX Confirmation Modal: Hapus Data Responden */}
      <UiConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Data Responden"
        message={`Apakah Anda yakin ingin menghapus data hasil kuesioner dari ${deleteTarget?.nama} (${deleteTarget?.id})?`}
        subMessage="Data responden yang dihapus tidak dapat dipulihkan kembali dari basis data."
        confirmText="Ya, Hapus Data"
        cancelText="Batal"
        type="danger"
        isLoading={isDeletingId !== null}
      />

      {/* Custom UI/UX Notification Modal: Gagal Ekspor */}
      <UiConfirmModal
        isOpen={exportError !== null}
        onClose={() => setExportError(null)}
        onConfirm={() => setExportError(null)}
        title="Gagal Ekspor Data Responden"
        message={exportError || ""}
        confirmText="Tutup"
        type="info"
      />
    </section>
  );
};
