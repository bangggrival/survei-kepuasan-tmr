"use client";

import React, { useState } from "react";
import {
  DashboardMetrics,
  DimensionScore,
  JABATAN_OPTIONS,
  SurveyResponse,
  SURVEY_SECTIONS,
} from "@/lib/constants";
import {
  PeriodCalendarPicker,
  PeriodFilterState,
} from "./PeriodCalendarPicker";
import { UiConfirmModal } from "./UiConfirmModal";
import {
  Award,
  Users,
  CheckCircle2,
  TrendingUp,
  Download,
  Zap,
  Fuel,
  Truck,
  Building2,
  Filter,
  BarChart3,
  PieChart,
  BadgeCheck,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ListFilter,
  ArrowUpDown,
  RefreshCw,
  Layers,
  Target,
  ShieldCheck,
  Printer,
} from "lucide-react";

interface DashboardViewProps {
  metrics: DashboardMetrics;
  responses: SurveyResponse[];
  allResponsesCount?: number;
  onResetPeriodToAll?: () => void;
  filterJabatan: string;
  onFilterJabatanChange: (jabatan: string) => void;
  currentPeriod: PeriodFilterState;
  onPeriodChange: (period: PeriodFilterState) => void;
  onRefreshData: () => Promise<void>;
  lastRefreshed?: string;
  isLoading: boolean;
  onPrintProgram?: (sectionId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  responses,
  allResponsesCount = 0,
  onResetPeriodToAll,
  filterJabatan,
  onFilterJabatanChange,
  currentPeriod,
  onPeriodChange,
  onRefreshData,
  lastRefreshed,
  isLoading,
  onPrintProgram,
}) => {
  const [tableSearch, setTableSearch] = useState("");
  const [indicatorViewMode, setIndicatorViewMode] = useState<"table" | "cards">("table");
  const [isIndicatorTableOpen, setIsIndicatorTableOpen] = useState(false);
  const [isEmptyExportModalOpen, setIsEmptyExportModalOpen] = useState(false);
  const [chartTab, setChartTab] = useState<"dimensions" | "jabatan">("jabatan");

  const jabatanBreakdown = React.useMemo(() => {
    return JABATAN_OPTIONS.map((jab) => {
      const filteredJab = responses.filter((r) => r.jabatan === jab);
      const count = filteredJab.length;
      if (count === 0) {
        return { jabatan: jab, count: 0, avg: 0, ikm: 0 };
      }
      let totalSum = 0;
      let totalQuestions = 0;
      filteredJab.forEach((r) => {
        Object.values(r.answers).forEach((val) => {
          totalSum += val;
          totalQuestions++;
        });
      });
      const avg = totalQuestions > 0 ? totalSum / totalQuestions : 0;
      const ikm = avg * 25;
      return {
        jabatan: jab,
        count,
        avg: Number(avg.toFixed(2)),
        ikm: Number(ikm.toFixed(2)),
      };
    });
  }, [responses]);

  const sortedQuestions = React.useMemo(() => {
    return [...metrics.questionStats].sort((a, b) => b.avg - a.avg);
  }, [metrics.questionStats]);

  const topQuestions = sortedQuestions.slice(0, 3);
  const lowestQuestions = [...sortedQuestions].reverse().slice(0, 3);

  const handleExportCsv = () => {
    if (responses.length === 0) {
      setIsEmptyExportModalOpen(true);
      return;
    }

    const questionList = metrics.questionStats;
    const headers = [
      "ID",
      "Timestamp",
      "Nama Pegawai",
      "NIP/NRK",
      "Jabatan",
      "Saran / Masukan",
      ...questionList.map((q) => `Q${q.num}_${q.id}`),
    ];

    const rows = responses.map((r) => [
      r.id,
      r.timestamp,
      `"${(r.nama || "").replace(/"/g, '""')}"`,
      `"${r.nip || ""}"`,
      `"${r.jabatan || ""}"`,
      `"${(r.saran || "").replace(/"/g, '""')}"`,
      ...questionList.map((q) => r.answers[q.id] || ""),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Rekap_IKM_TMR_${currentPeriod.quarter}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDimensionIcon = (iconName: string) => {
    switch (iconName) {
      case "zap":
        return <Zap size={18} color="#059669" />;
      case "fuel":
        return <Fuel size={18} color="#d97706" />;
      case "truck":
        return <Truck size={18} color="#2563eb" />;
      case "building-2":
      default:
        return <Building2 size={18} color="#7c3aed" />;
    }
  };

  const totalRatingCount =
    metrics.ratingDistribution.sts +
    metrics.ratingDistribution.ts +
    metrics.ratingDistribution.s +
    metrics.ratingDistribution.ss;

  const ssPct =
    totalRatingCount > 0
      ? ((metrics.ratingDistribution.ss / totalRatingCount) * 100).toFixed(1)
      : "0";
  const sPct =
    totalRatingCount > 0
      ? ((metrics.ratingDistribution.s / totalRatingCount) * 100).toFixed(1)
      : "0";
  const tsPct =
    totalRatingCount > 0
      ? ((metrics.ratingDistribution.ts / totalRatingCount) * 100).toFixed(1)
      : "0";
  const stsPct =
    totalRatingCount > 0
      ? ((metrics.ratingDistribution.sts / totalRatingCount) * 100).toFixed(1)
      : "0";

  // Filter indicator table items
  const filteredQuestionStats = metrics.questionStats.filter(
    (q) =>
      !tableSearch ||
      q.text.toLowerCase().includes(tableSearch.toLowerCase()) ||
      q.sectionShortTitle.toLowerCase().includes(tableSearch.toLowerCase()) ||
      `q${q.num}`.includes(tableSearch.toLowerCase())
  );

  return (
    <section className="tab-pane active" id="pane-dashboard">
      {/* Responsive Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="filter-left">
          {/* External Calendar / Period Picker Component */}
          <PeriodCalendarPicker
            currentPeriod={currentPeriod}
            onPeriodChange={onPeriodChange}
          />

          {/* Jabatan Selector */}
          <div className="filter-group">
            <Filter size={15} color="#64748b" />
            <label htmlFor="filter-jabatan" className="filter-label">
              Jabatan:
            </label>
            <select
              id="filter-jabatan"
              className="select-filter"
              value={filterJabatan}
              onChange={(e) => onFilterJabatanChange(e.target.value)}
            >
              <option value="all">Semua Jabatan ({responses.length})</option>
              {JABATAN_OPTIONS.map((jab) => (
                <option key={jab} value={jab}>
                  {jab}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Empty State: Period Empty vs Database Empty */}
      {responses.length === 0 && allResponsesCount > 0 && (
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "12px",
            padding: "1rem 1.25rem",
            marginBottom: "1.25rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Filter size={18} color="#b45309" />
            <div>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#92400e" }}>
                Tidak ada responden pada {currentPeriod.label}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#78350f" }}>
                Terdapat {allResponsesCount} data responden pada periode lainnya.
              </div>
            </div>
          </div>

          {onResetPeriodToAll && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onResetPeriodToAll}
              style={{ fontWeight: 600 }}
            >
              <Layers size={14} />
              <span>Tampilkan Seluruh Data ({allResponsesCount})</span>
            </button>
          )}
        </div>
      )}

      {/* Empty State: Database Empty */}
      {responses.length === 0 && allResponsesCount === 0 && (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "1.25rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>
            Belum Ada Data Responden Kuesioner
          </div>
          <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "4px" }}>
            Data analitik kepuasan layanan akan otomatis terisi setelah pegawai mengisi formulir kuesioner.
          </div>
        </div>
      )}

      {/* Top 4 KPI Cards */}
      <div className="kpi-grid">
        {/* IKM Final Card */}
        <div className="kpi-card highlight">
          <div className="kpi-header">
            <span className="kpi-label">Indeks Kepuasan (IKM)</span>
            <div className="kpi-icon">
              <Award size={18} color="#ffffff" />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value tabular-nums" id="kpi-ikm-val">
              {metrics.ikmFinal.toFixed(1)}
            </span>
            <span style={{ fontSize: "1.05rem", opacity: 0.85, fontWeight: 700 }}>/ 100</span>
          </div>

          {/* Mini Progress Track */}
          <div className="kpi-meter-track">
            <div
              className="kpi-meter-fill"
              style={{ width: `${Math.min(100, Math.max(0, metrics.ikmFinal))}%` }}
            />
          </div>

          <div className="kpi-subtext" style={{ marginTop: "0.65rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className={`ikm-badge ${metrics.mutu.cssClass}`} id="kpi-ikm-badge">
              Mutu {metrics.mutu.predikat} • {metrics.mutu.label}
            </span>
            <span style={{ fontSize: "0.72rem", opacity: 0.85, fontFamily: "var(--font-mono)" }}>
              NRR: {(metrics.ikmFinal / 25).toFixed(2)} (x25)
            </span>
          </div>
        </div>

        {/* Total Responden */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Jumlah Responden</span>
            <div className="kpi-icon">
              <Users size={16} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value tabular-nums" id="kpi-resp-total">
              {metrics.totalResponses}
            </span>
            <span style={{ fontSize: "0.85rem", color: "var(--slate-500)", fontWeight: 600 }}>Pegawai</span>
          </div>
          <div className="kpi-meter-track" style={{ background: "var(--slate-100)" }}>
            <div
              className="kpi-meter-fill"
              style={{ width: "100%", background: "#059669" }}
            />
          </div>
          <div className="kpi-subtext" style={{ marginTop: "0.65rem" }}>
            <span>Pegawai terdaftar mengisi kuesioner</span>
          </div>
        </div>

        {/* Persentase Kepuasan */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Tingkat Kepuasan</span>
            <div className="kpi-icon">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value tabular-nums" id="kpi-satisfaction-pct">
              {metrics.satisfactionPct}%
            </span>
          </div>
          <div className="kpi-meter-track" style={{ background: "var(--slate-100)" }}>
            <div
              className="kpi-meter-fill"
              style={{
                width: `${metrics.satisfactionPct}%`,
                background: "var(--gov-primary-600)",
              }}
            />
          </div>
          <div className="kpi-subtext" style={{ marginTop: "0.65rem" }}>
            <span>Akumulasi respon Setuju & Sangat Setuju</span>
          </div>
        </div>

        {/* Nilai Rata-rata Tertimbang (NRR) */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Nilai Rata-Rata (NRR)</span>
            <div className="kpi-icon">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value tabular-nums">
              {metrics.averageScale4.toFixed(2)}
            </span>
            <span style={{ fontSize: "0.85rem", color: "var(--slate-500)", fontWeight: 600 }}>/ 4.00</span>
          </div>
          <div className="kpi-meter-track" style={{ background: "var(--slate-100)" }}>
            <div
              className="kpi-meter-fill"
              style={{
                width: `${Math.min(100, (metrics.averageScale4 / 4.0) * 100)}%`,
                background: "#0284c7",
              }}
            />
          </div>
          <div className="kpi-subtext" style={{ marginTop: "0.65rem" }}>
            <span>Skala nilai baku instrumen survei</span>
          </div>
        </div>
      </div>

      {/* 4 Dimension Summary Section */}
      <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
            Capaian 4 Dimensi Urusan Penunjang
          </h3>
          <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
            Evaluasi Berdasarkan Standar Pelayanan Prima BLUD TMR
          </span>
        </div>
      </div>

      <div className="dimension-summary-grid" id="dimension-cards-container">
        {metrics.dimScores.map((d) => {
          const fillWidth = Math.min(100, Math.round((d.avg / 4) * 100));
          const predikatLabel = d.ikm >= 88.31 ? "Sangat Baik" : d.ikm >= 76.61 ? "Baik" : d.ikm >= 65.0 ? "Kurang Baik" : "Tidak Baik";
          const badgeBg = d.ikm >= 88.31 ? "#d1fae5" : d.ikm >= 76.61 ? "#dbeafe" : "#fef3c7";
          const badgeColor = d.ikm >= 88.31 ? "#065f46" : d.ikm >= 76.61 ? "#1e40af" : "#92400e";

          return (
            <div key={d.sec.id} className="dimension-card">
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="dim-code">{d.sec.code}</span>
                  {getDimensionIcon(d.sec.icon)}
                </div>
                <div className="dim-name">{d.sec.shortTitle}</div>
              </div>
              <div>
                <div className="dim-score-row">
                  <div>
                    <span className="dim-score">{d.avg}</span>
                    <span className="dim-scale"> / 4.0</span>
                  </div>
                  <span
                    style={{
                      fontSize: "0.74rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: badgeBg,
                      color: badgeColor,
                    }}
                  >
                    IKM {d.ikm} • {predikatLabel}
                  </span>
                </div>
                <div className="dim-bar">
                  <div
                    className="dim-bar-fill"
                    style={{
                      width: `${fillWidth}%`,
                      backgroundColor:
                        d.ikm >= 88.31 ? "#059669" : d.ikm >= 76.61 ? "#2563eb" : "#d97706",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Analytics Grid: Enhanced Interactive Visualizations */}
      <div className="charts-grid-2x2">
        {/* Chart 1: Interactive Dimensional Comparison or Cross-Jabatan Breakdown */}
        <div className="chart-card">
          <div className="chart-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <BarChart3 size={18} color="#059669" />
              <div>
                <div className="chart-title">
                  {chartTab === "dimensions" ? "Komparasi 4 Bidang Layanan (IKM)" : "Komparasi Kepuasan per Jabatan"}
                </div>
                <div className="chart-subtitle">
                  {chartTab === "dimensions"
                    ? "Perbandingan capaian nilai tertimbang 4 program kegiatan penunjang"
                    : "Analisis tingkat kepuasan antar tingkatan jabatan pegawai"}
                </div>
              </div>
            </div>

            {/* Toggle view tabs */}
            <div className="chart-view-toggle" style={{ display: "inline-flex", background: "#f1f5f9", padding: "3px", borderRadius: "8px", gap: "2px" }}>
              <button
                type="button"
                onClick={() => setChartTab("dimensions")}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "0.74rem",
                  fontWeight: chartTab === "dimensions" ? 700 : 500,
                  background: chartTab === "dimensions" ? "#ffffff" : "transparent",
                  color: chartTab === "dimensions" ? "var(--gov-primary-700)" : "#64748b",
                  boxShadow: chartTab === "dimensions" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <BarChart3 size={13} />
                <span>4 Bidang Layanan</span>
              </button>

              <button
                type="button"
                onClick={() => setChartTab("jabatan")}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "0.74rem",
                  fontWeight: chartTab === "jabatan" ? 700 : 500,
                  background: chartTab === "jabatan" ? "#ffffff" : "transparent",
                  color: chartTab === "jabatan" ? "var(--gov-primary-700)" : "#64748b",
                  boxShadow: chartTab === "jabatan" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <Users size={13} />
                <span>Kategori Jabatan</span>
              </button>
            </div>
          </div>

          {/* View Tab 1: Vertical Bar Columns for 4 Dimensions */}
          {chartTab === "dimensions" && (
            <div style={{ padding: "1rem 0 0.5rem 0", width: "100%", overflowX: "hidden" }}>
              <div
                className="dimensions-bars-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "0.85rem",
                  alignItems: "flex-end",
                  height: "220px",
                  position: "relative",
                  paddingBottom: "2.75rem",
                  borderBottom: "1.5px solid #e2e8f0",
                }}
              >
                {/* Benchmark Target Line (3.50 / 87.5% - Standar Pelayanan Prima Mutu A) */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: `${(3.5 / 4.0) * 180 + 44}px`,
                    borderTop: "1.5px dashed var(--gov-primary-600)",
                    zIndex: 2,
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <span
                    style={{
                      background: "#f0fdf4",
                      color: "var(--gov-primary-800)",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      padding: "1px 6px",
                      borderRadius: "4px",
                      border: "1px solid #bbf7d0",
                      transform: "translateY(-50%)",
                    }}
                  >
                    Target Mutu A: 3.50
                  </span>
                </div>

                {metrics.dimScores.map((d) => {
                  const heightPx = Math.max(20, Math.round((d.avg / 4.0) * 170));
                  const isTop = metrics.bestDim?.sec.id === d.sec.id;

                  return (
                    <div
                      key={d.sec.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        height: "100%",
                        justifyContent: "flex-end",
                        position: "relative",
                        minWidth: 0,
                      }}
                    >
                      {/* Value Pill on top of column */}
                      <div
                        style={{
                          marginBottom: "0.4rem",
                          textAlign: "center",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <span className="dim-bar-column-score" style={{ fontSize: "0.86rem", fontWeight: 800, color: "#0f172a" }}>
                          {d.avg.toFixed(2)}
                        </span>
                        <span
                          className="dim-bar-column-badge"
                          style={{
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            padding: "1px 5px",
                            borderRadius: "4px",
                            background: d.ikm >= 88.31 ? "#d1fae5" : "#dbeafe",
                            color: d.ikm >= 88.31 ? "#065f46" : "#1e40af",
                          }}
                        >
                          IKM {d.ikm.toFixed(1)}
                        </span>
                      </div>

                      {/* Vertical Column Bar */}
                      <div
                        style={{
                          width: "70%",
                          maxWidth: "52px",
                          height: `${heightPx}px`,
                          background: isTop
                            ? "linear-gradient(180deg, #059669 0%, #10b981 100%)"
                            : "linear-gradient(180deg, #0284c7 0%, #38bdf8 100%)",
                          borderRadius: "8px 8px 3px 3px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.08)",
                          transition: "height 0.4s ease",
                        }}
                      />

                      {/* Label below bar */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          textAlign: "center",
                          width: "100%",
                          height: "36px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span
                          className="dim-bar-column-title"
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            color: "#334155",
                            lineHeight: 1.2,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                          title={d.sec.title}
                        >
                          {d.sec.shortTitle}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem", fontSize: "0.74rem", color: "#64748b" }}>
                <span>*Nilai baku PermenPAN-RB No. 14 / 2017 (Skala 1.00 s/d 4.00)</span>
                <span style={{ fontWeight: 600, color: "var(--gov-primary-700)" }}>
                  Dimensi Unggulan: {metrics.bestDim?.sec.shortTitle || "-"}
                </span>
              </div>
            </div>
          )}

          {/* View Tab 2: Cross-Jabatan Breakdown */}
          {chartTab === "jabatan" && (
            <div style={{ padding: "0.75rem 0", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {jabatanBreakdown.map((jb) => {
                const barWidth = jb.avg > 0 ? (jb.avg / 4.0) * 100 : 0;
                return (
                  <div key={jb.jabatan} style={{ background: "#f8fafc", padding: "0.75rem 0.9rem", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1e293b" }}>
                          {jb.jabatan}
                        </span>
                        <span style={{ fontSize: "0.7rem", color: "#64748b", background: "#ffffff", padding: "1px 6px", borderRadius: "999px", border: "1px solid #e2e8f0" }}>
                          {jb.count} Pegawai
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span style={{ fontSize: "0.86rem", fontWeight: 800, color: "var(--gov-primary-700)" }}>
                          {jb.avg > 0 ? `${jb.avg.toFixed(2)} / 4.00` : "Belum Ada"}
                        </span>
                        {jb.ikm > 0 && (
                          <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", background: "#d1fae5", color: "#065f46" }}>
                            IKM {jb.ikm.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ height: "10px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${barWidth}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, #059669 0%, #34d399 100%)",
                          borderRadius: "999px",
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chart 2: Interactive SVG Donut Ring Chart for Likert Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <PieChart size={18} color="var(--gov-primary-600)" />
              <div>
                <div className="chart-title">Distribusi Pilihan Skala Likert (Donut Chart)</div>
                <div className="chart-subtitle">
                  Proporsi akumulasi dari seluruh jawaban butir kuesioner
                </div>
              </div>
            </div>
          </div>

          <div
            className="donut-chart-container"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              flexWrap: "wrap",
              gap: "1rem",
              padding: "0.75rem 0",
            }}
          >
            {/* SVG Donut Ring */}
            <div style={{ position: "relative", width: "140px", height: "140px", flexShrink: 0 }}>
              <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
                {/* Background Ring */}
                <circle
                  cx="70"
                  cy="70"
                  r="52"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="15"
                />
                {(() => {
                  const r = 52;
                  const c = 2 * Math.PI * r; // ~326.72
                  const total = totalRatingCount || 1;

                  const ssLen = (metrics.ratingDistribution.ss / total) * c;
                  const sLen = (metrics.ratingDistribution.s / total) * c;
                  const tsLen = (metrics.ratingDistribution.ts / total) * c;
                  const stsLen = (metrics.ratingDistribution.sts / total) * c;

                  let offset = 0;
                  const arcs = [
                    { len: ssLen, color: "#059669", key: "ss" },
                    { len: sLen, color: "#10b981", key: "s" },
                    { len: tsLen, color: "#f59e0b", key: "ts" },
                    { len: stsLen, color: "#ef4444", key: "sts" },
                  ];

                  return arcs.map((arc) => {
                    const currentOffset = offset;
                    offset += arc.len;
                    if (arc.len <= 0) return null;
                    return (
                      <circle
                        key={arc.key}
                        cx="70"
                        cy="70"
                        r={r}
                        fill="transparent"
                        stroke={arc.color}
                        strokeWidth="15"
                        strokeDasharray={`${arc.len} ${c - arc.len}`}
                        strokeDashoffset={-currentOffset}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dasharray 0.5s ease" }}
                      />
                    );
                  });
                })()}
              </svg>

              {/* Center Donut Text */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: "1.25rem", fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>
                  {metrics.satisfactionPct}%
                </span>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--gov-primary-700)", marginTop: "2px" }}>
                  Kepuasan
                </span>
              </div>
            </div>

            {/* Legend breakdown list */}
            <div style={{ flex: 1, minWidth: "160px", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#059669", display: "inline-block" }} />
                  <span style={{ fontWeight: 600, color: "#1e293b" }}>Sangat Setuju (SS - 4)</span>
                </div>
                <strong style={{ color: "#059669" }}>
                  {metrics.ratingDistribution.ss} ({ssPct}%)
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                  <span style={{ fontWeight: 600, color: "#1e293b" }}>Setuju (S - 3)</span>
                </div>
                <strong style={{ color: "var(--gov-primary-700)" }}>
                  {metrics.ratingDistribution.s} ({sPct}%)
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
                  <span style={{ fontWeight: 600, color: "#1e293b" }}>Tidak Setuju (TS - 2)</span>
                </div>
                <strong style={{ color: "#f59e0b" }}>
                  {metrics.ratingDistribution.ts} ({tsPct}%)
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
                  <span style={{ fontWeight: 600, color: "#1e293b" }}>Sangat Tdk Setuju (STS - 1)</span>
                </div>
                <strong style={{ color: "#ef4444" }}>
                  {metrics.ratingDistribution.sts} ({stsPct}%)
                </strong>
              </div>

              <div style={{ borderTop: "1px dashed #e2e8f0", paddingTop: "0.4rem", display: "flex", justifyContent: "space-between", fontSize: "0.74rem", color: "#64748b" }}>
                <span>Total Suara Terdata:</span>
                <strong>{totalRatingCount} Respon</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 3: Top 3 Keunggulan Layanan (Nilai Tertinggi) */}
        <div className="chart-card">
          <div className="chart-header">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Award size={18} color="#059669" />
              <div>
                <div className="chart-title">3 Indikator Keunggulan Layanan Tertinggi</div>
                <div className="chart-subtitle">
                  Aspek sarana dan pelayanan dengan tingkat apresiasi pegawai tertinggi
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", padding: "0.5rem 0" }}>
            {topQuestions.map((q, idx) => (
              <div
                key={q.id}
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "8px",
                  padding: "0.65rem 0.85rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      background: "#16a34a",
                      color: "#ffffff",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    #{idx + 1}
                  </span>
                  <div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#14532d" }}>
                      Q{q.num}. {q.text}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#166534" }}>
                      {q.sectionShortTitle}
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: "0.84rem",
                    fontWeight: 800,
                    color: "#15803d",
                    background: "#ffffff",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    border: "1px solid #86efac",
                    flexShrink: 0,
                  }}
                >
                  {q.avg.toFixed(2)} / 4.0
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: Top 3 Area Peningkatan & Supervisi */}
        <div className="chart-card">
          <div className="chart-header">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Zap size={18} color="#d97706" />
              <div>
                <div className="chart-title">3 Indikator Area Fokus Peningkatan Layanan</div>
                <div className="chart-subtitle">
                  Aspek yang memerlukan perhatian dan penyempurnaan fasilitas kerja
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", padding: "0.5rem 0" }}>
            {lowestQuestions.map((q, idx) => (
              <div
                key={q.id}
                style={{
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: "8px",
                  padding: "0.65rem 0.85rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      background: "#d97706",
                      color: "#ffffff",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    !{idx + 1}
                  </span>
                  <div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#78350f" }}>
                      Q{q.num}. {q.text}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#92400e" }}>
                      {q.sectionShortTitle}
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: "0.84rem",
                    fontWeight: 800,
                    color: "#b45309",
                    background: "#ffffff",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    border: "1px solid #fcd34d",
                    flexShrink: 0,
                  }}
                >
                  {q.avg.toFixed(2)} / 4.0
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 20 Indikator Kuesioner Detailed Table & Mobile Card View */}
      <div className="table-card" style={{ marginBottom: "2rem" }}>
        <div
          className="table-toolbar"
          style={{ cursor: "pointer", userSelect: "none" }}
          onClick={() => setIsIndicatorTableOpen(!isIndicatorTableOpen)}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Rincian Analisis {metrics.questionStats.length} Indikator Evaluasi Layanan
              </h4>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "999px",
                  background: isIndicatorTableOpen ? "#dcfce7" : "#f1f5f9",
                  color: isIndicatorTableOpen ? "#15803d" : "#475569",
                }}
              >
                {isIndicatorTableOpen ? "Terbuka" : "Diringkas"}
              </span>
            </div>
            <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
              Nilai Rata-rata Tertimbang (NRR) & Konversi IKM per Butir Kuesioner
            </span>
          </div>

          <div
            style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            {isIndicatorTableOpen && (
              <div className="search-input-box" style={{ width: "240px" }}>
                <span className="search-icon-pos">
                  <ListFilter size={15} />
                </span>
                <input
                  type="text"
                  className="search-input"
                  style={{ padding: "0.45rem 1.8rem 0.45rem 2.2rem", fontSize: "0.82rem" }}
                  placeholder="Cari butir indikator..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                />
                {tableSearch && (
                  <button
                    type="button"
                    onClick={() => setTableSearch("")}
                    style={{
                      position: "absolute",
                      right: "0.5rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--slate-400)",
                      display: "flex",
                      alignItems: "center",
                    }}
                    title="Hapus pencarian"
                  >
                    <RefreshCw size={12} />
                  </button>
                )}
              </div>
            )}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsIndicatorTableOpen(!isIndicatorTableOpen)}
              style={{ fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
            >
              {isIndicatorTableOpen ? (
                <>
                  <ChevronUp size={15} />
                  <span>Tutup Tabel</span>
                </>
              ) : (
                <>
                  <ChevronDown size={15} />
                  <span>Buka Tabel Lengkap ({metrics.questionStats.length} Butir)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {isIndicatorTableOpen && (
          <>
            {/* Scroll helper pill for mobile screens */}
            <div className="mobile-scroll-hint">
              <span>Geser ke samping untuk melihat nilai lengkap</span>
              <ChevronRight size={14} />
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: "60px" }}>No</th>
                    <th style={{ width: "190px" }}>Dimensi</th>
                    <th>Uraian Indikator Kuesioner</th>
                    <th style={{ width: "120px", textAlign: "center" }}>Skor NRR</th>
                    <th style={{ width: "120px", textAlign: "center" }}>IKM</th>
                    <th style={{ width: "160px" }}>Distribusi Suara</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuestionStats.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                        Tidak ada butir indikator kuesioner yang sesuai dengan pencarian &ldquo;{tableSearch}&rdquo;.
                      </td>
                    </tr>
                  ) : (
                    filteredQuestionStats.map((q) => (
                      <tr key={q.id}>
                        <td style={{ fontWeight: 800, color: "var(--gov-primary-700)" }}>Q{q.num}</td>
                        <td>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              background: "#f1f5f9",
                              color: "#475569",
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {q.sectionShortTitle}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500, color: "#1e293b", lineHeight: 1.4, minWidth: "260px" }}>
                          {q.text}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 8px",
                              borderRadius: "6px",
                              fontWeight: 800,
                              fontSize: "0.85rem",
                              background: q.avg >= 3.5 ? "#d1fae5" : q.avg >= 3.0 ? "#dbeafe" : "#fef3c7",
                              color: q.avg >= 3.5 ? "#065f46" : q.avg >= 3.0 ? "#1e40af" : "#92400e",
                            }}
                          >
                            {q.avg}
                          </span>
                        </td>
                        <td style={{ textAlign: "center", fontWeight: 800, color: "#0f172a" }}>
                          {q.ikm}
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              gap: "4px",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              color: "#64748b",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <span title="Sangat Setuju" style={{ color: "#047857" }}>
                              SS:{q.counts[4] || 0}
                            </span>
                            <span>•</span>
                            <span title="Setuju" style={{ color: "#10b981" }}>
                              S:{q.counts[3] || 0}
                            </span>
                            <span>•</span>
                            <span title="Tidak Setuju" style={{ color: "#f59e0b" }}>
                              TS:{q.counts[2] || 0}
                            </span>
                            <span>•</span>
                            <span title="Sangat Tidak Setuju" style={{ color: "#ef4444" }}>
                              STS:{q.counts[1] || 0}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <UiConfirmModal
        isOpen={isEmptyExportModalOpen}
        title="Tidak Ada Data Responden"
        message="Belum ada data responden kuesioner yang tersedia untuk diekspor pada periode ini."
        subMessage="Silakan pastikan ada data survei yang telah diisi oleh pegawai atau ubah filter periode yang dipilih."
        confirmText="Mengerti"
        cancelText="Tutup"
        type="info"
        onConfirm={() => setIsEmptyExportModalOpen(false)}
        onCancel={() => setIsEmptyExportModalOpen(false)}
      />
    </section>
  );
};
