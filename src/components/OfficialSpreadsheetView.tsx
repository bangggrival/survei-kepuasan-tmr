"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SurveyResponse, SurveySection } from "@/lib/constants";
import { computeOfficialRecap, OfficialRecapReport, SectionRecapGroup } from "@/lib/officialRecap";
import { generateOfficialSpreadsheetXlsx } from "@/lib/excelExport";
import { PrintSelectorModal } from "./PrintSelectorModal";
import { UiConfirmModal } from "./UiConfirmModal";
import {
  Download,
  Printer,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet,
  Filter,
  CheckCircle2,
  Award,
} from "lucide-react";

interface OfficialSpreadsheetViewProps {
  responses: SurveyResponse[];
  sections?: SurveySection[];
  periodLabel?: string;
  isLoading?: boolean;
  selectedSectionId?: string;
  onSelectSectionId?: (sectionId: string) => void;
  onOpenPrintModal?: () => void;
}

export const OfficialSpreadsheetView: React.FC<OfficialSpreadsheetViewProps> = ({
  responses,
  sections,
  periodLabel,
  isLoading,
  selectedSectionId,
  onSelectSectionId,
}) => {
  const [internalSectionId, setInternalSectionId] = useState<string>("all");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isExportingXlsx, setIsExportingXlsx] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const activeSectionId = selectedSectionId !== undefined ? selectedSectionId : internalSectionId;
  const setSectionId = onSelectSectionId || setInternalSectionId;

  const report: OfficialRecapReport = computeOfficialRecap(responses, sections, periodLabel);

  const activeSection = report.sections.find((s) => s.id === activeSectionId);
  const isSingleSection = activeSectionId !== "all" && Boolean(activeSection);
  const displayedSections: SectionRecapGroup[] = isSingleSection && activeSection ? [activeSection] : report.sections;

  const handlePrintTrigger = (secId: string = activeSectionId) => {
    setSectionId(secId);
    setIsPrintModalOpen(false);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleExportSpreadsheetXlsx = async () => {
    try {
      setIsExportingXlsx(true);
      const activeYear = new Date().getFullYear();
      const cleanPeriod = (periodLabel || "Triwulan").replace(/[^a-zA-Z0-9]/g, "_");
      const activeQuestions = sections ? sections.flatMap((s) => s.questions) : undefined;

      if (isSingleSection && activeSection) {
        // Generate tailored report for single section
        const singleReport: OfficialRecapReport = {
          ...report,
          subTitle: `SUB-KEGIATAN: ${activeSection.code} - ${activeSection.title.toUpperCase()}`,
          sections: [activeSection],
          overallNRR: activeSection.hasilAkhirDimensi,
          overallIKM: activeSection.ikmDimensi,
          overallSkala: activeSection.skalaPembulatan,
        };
        const blob = await generateOfficialSpreadsheetXlsx(singleReport, responses, activeQuestions);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const cleanCode = activeSection.code.replace(/[^a-zA-Z0-9]/g, "_");
        link.download = `Matriks_IKM_${cleanCode}_TA${activeYear}_${cleanPeriod}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        const blob = await generateOfficialSpreadsheetXlsx(report, responses, activeQuestions);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Matriks_IKM_TMR_PermenPANRB_TA${activeYear}_${cleanPeriod}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Gagal mengekspor file Excel .xlsx:", err);
      setExportError("Sistem gagal memproses ekspor file Excel (.xlsx). Pastikan izin unduhan pada peramban aktif dan silakan coba kembali.");
    } finally {
      setIsExportingXlsx(false);
    }
  };

  /**
   * Export CSV dengan format standar PermenPAN-RB (Seluruh program atau khusus program aktif)
   */
  const handleExportSpreadsheetCsv = () => {
    const csvRows: string[] = [];
    const activeYear = new Date().getFullYear();
    const cleanPeriod = (periodLabel || "Triwulan").replace(/[^a-zA-Z0-9]/g, "_");

    if (isSingleSection && activeSection) {
      csvRows.push(`"${report.title}",,,,,,,,,,,,,,`);
      csvRows.push(`"SUB-KEGIATAN: ${activeSection.code} - ${activeSection.title}",,,,,,,,,,,,,,`);
      csvRows.push(`"${report.instansi}",,,,,,,,,,,,,,`);
      csvRows.push(`,,,,,,,,,,,,,,`);

      csvRows.push(`,,Skala,,,,Jumlah Responden,Nilai,,,,,,Hasil Akhir,Skala`);
      csvRows.push(`,,1,2,3,4,,1,2,3,4,Jumlah,Rata-rata,,`);

      csvRows.push(`1,"${activeSection.code} ${activeSection.title}",,,,,,,,,,,,,`);

      activeSection.rows.forEach((row, rowIdx) => {
        const isFirst = rowIdx === 0;
        const hasilAkhirStr = isFirst ? `"${activeSection.hasilAkhirDimensi.toFixed(2).replace(".", ",")}"` : `""`;
        const skalaStr = isFirst ? `${activeSection.skalaPembulatan}` : `""`;

        csvRows.push(
          `,"${row.letter}. ${row.text}",${row.counts[1]},${row.counts[2]},${row.counts[3]},${row.counts[4]},${row.totalResponden},${row.weighted[1]},${row.weighted[2]},${row.weighted[3]},${row.weighted[4]},${row.totalNilaiBobot},"${row.nrr.toFixed(2).replace(".", ",")}",${hasilAkhirStr},${skalaStr}`
        );
      });

      csvRows.push(`,,,,,,,,,,,,,,`);
      csvRows.push(
        `,"RATA-RATA NILAI SUB-KEGIATAN (IKM ${activeSection.code})",,,,,,,,,,"${activeSection.hasilAkhirDimensi.toFixed(2).replace(".", ",")}","${activeSection.hasilAkhirDimensi.toFixed(2).replace(".", ",")}","${activeSection.skalaPembulatan}"`
      );
      csvRows.push(`,,,,,,,,,,,,,,`);

      csvRows.push(`,Mengetahui,,,,,,,,,,,,,`);
      csvRows.push(`,Kepala Unit Pengelola,,,,,,,,,,Ka. Sub Bagian Tata Usaha Unit Pengelola,,,`);
      csvRows.push(`,Taman Margasatwa Ragunan,,,,,,,,,,Taman Margasatwa Ragunan,,,`);
      csvRows.push(`,Dinas Pertamanan dan Hutan Kota,,,,,,,,,,Dinas Pertamanan dan Hutan Kota,,,`);
      csvRows.push(`,Provinsi DKI Jakarta,,,,,,,,,,Provinsi DKI Jakarta,,,`);
      csvRows.push(`,,,,,,,,,,,,,,`);
      csvRows.push(`,,,,,,,,,,,,,,`);
      csvRows.push(`,,,,,,,,,,,,,,`);
      csvRows.push(`,"${report.pejabatPengesah.nama}",,,,,,,,,,,"${report.pejabatTataUsaha.nama}",,`);
      csvRows.push(`,NIP.${report.pejabatPengesah.nip},,,,,,,,,,,NIP.${report.pejabatTataUsaha.nip},,`);

      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      const cleanCode = activeSection.code.replace(/[^a-zA-Z0-9]/g, "_");
      link.setAttribute(
        "download",
        `Rekap_IKM_${cleanCode}_TA${activeYear}_${cleanPeriod}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Header Title Rows (Baris 1 - 3)
      csvRows.push(`"${report.title}",,,,,,,,,,,,,,`);
      csvRows.push(`"${report.subTitle}",,,,,,,,,,,,,,`);
      csvRows.push(`"${report.instansi}",,,,,,,,,,,,,,`);
      csvRows.push(`,,,,,,,,,,,,,,`);

      // Column Headers (Baris 5 - 6)
      csvRows.push(`,,Skala,,,,Jumlah Responden,Nilai,,,,,,Hasil Akhir,Skala`);
      csvRows.push(`,,1,2,3,4,,1,2,3,4,Jumlah,Rata-rata,,`);

      // Section Data Rows (Seksi 1 s/d 4)
      report.sections.forEach((sec) => {
        csvRows.push(`${sec.num},"${sec.code} ${sec.title}",,,,,,,,,,,,,`);

        sec.rows.forEach((row, rowIdx) => {
          const isFirst = rowIdx === 0;
          const hasilAkhirStr = isFirst ? `"${sec.hasilAkhirDimensi.toFixed(2).replace(".", ",")}"` : `""`;
          const skalaStr = isFirst ? `${sec.skalaPembulatan}` : `""`;

          csvRows.push(
            `,"${row.letter}. ${row.text}",${row.counts[1]},${row.counts[2]},${row.counts[3]},${row.counts[4]},${row.totalResponden},${row.weighted[1]},${row.weighted[2]},${row.weighted[3]},${row.weighted[4]},${row.totalNilaiBobot},"${row.nrr.toFixed(2).replace(".", ",")}",${hasilAkhirStr},${skalaStr}`
          );
        });

        csvRows.push(`,,,,,,,,,,,,,,`);
      });

      // Baris Grand Total Keseluruhan IKM
      csvRows.push(
        `,"RATA-RATA KESELURUHAN PROGRAM PENUNJANG (IKM)",,,,,,,,,,"${report.overallNRR.toFixed(2).replace(".", ",")}","${report.overallNRR.toFixed(2).replace(".", ",")}","${report.overallSkala}"`
      );
      csvRows.push(`,,,,,,,,,,,,,,`);

      // Section Tanda Tangan Resmi
      csvRows.push(`,Mengetahui,,,,,,,,,,,,,`);
      csvRows.push(`,Kepala Unit Pengelola,,,,,,,,,,Ka. Sub Bagian Tata Usaha Unit Pengelola,,,`);
      csvRows.push(`,Taman Margasatwa Ragunan,,,,,,,,,,Taman Margasatwa Ragunan,,,`);
      csvRows.push(`,Dinas Pertamanan dan Hutan Kota,,,,,,,,,,Dinas Pertamanan dan Hutan Kota,,,`);
      csvRows.push(`,Provinsi DKI Jakarta,,,,,,,,,,Provinsi DKI Jakarta,,,`);
      csvRows.push(`,,,,,,,,,,,,,,`);
      csvRows.push(`,,,,,,,,,,,,,,`);
      csvRows.push(`,,,,,,,,,,,,,,`);
      csvRows.push(`,"${report.pejabatPengesah.nama}",,,,,,,,,,,"${report.pejabatTataUsaha.nama}",,`);
      csvRows.push(`,NIP.${report.pejabatPengesah.nip},,,,,,,,,,,NIP.${report.pejabatTataUsaha.nip},,`);

      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `Rekap_Penilaian_Kuisioner_TMR_TA${activeYear}_${cleanPeriod}_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <section className="tab-pane active" id="pane-official-sheet">
      {/* Official Sheet Actions Toolbar (Clean, Responsive & Flexible) */}
      <div className="official-toolbar no-print">
        <div className="official-toolbar-left" style={{ display: "flex", alignItems: "center", gap: "0.85rem", flexWrap: "wrap" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", fontSize: "0.82rem", fontWeight: 700, color: "var(--slate-800)" }}>
            <FileSpreadsheet size={16} color="var(--gov-primary-700)" />
            <span>Matriks IKM PermenPAN-RB No. 14 / 2017</span>
          </div>

          {/* Selector Pilihan Dokumen Kode Program */}
          <div className="filter-group" style={{ margin: 0 }}>
            <Filter size={14} color="#64748b" />
            <label htmlFor="select-matrix-program" className="filter-label" style={{ fontWeight: 700 }}>
              Dokumen:
            </label>
            <select
              id="select-matrix-program"
              className="select-filter"
              value={activeSectionId}
              onChange={(e) => setSectionId(e.target.value)}
              style={{ minWidth: "min(260px, 100%)", maxWidth: "100%" }}
            >
              <option value="all">Semua Kode Program (Lengkap 4 Bidang)</option>
              {report.sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.shortTitle} (IKM {s.ikmDimensi.toFixed(1)})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="official-toolbar-actions">
          {/* Cetak Dokumen Aktif yang sedang Ditampilkan */}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => window.print()}
            title={
              isSingleSection && activeSection
                ? `Cetak Dokumen PDF untuk Kode Program ${activeSection.code}`
                : "Cetak Dokumen PDF Rekapitulasi Lengkap"
            }
          >
            <Printer size={14} />
            <span>
              {isSingleSection && activeSection
                ? `Cetak PDF (${activeSection.code})`
                : "Cetak Dokumen PDF"}
            </span>
          </button>

          {/* Ekspor Spreadsheet Excel (.xlsx asli ber-styling) */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleExportSpreadsheetXlsx}
            disabled={isExportingXlsx}
            title={
              isSingleSection && activeSection
                ? `Ekspor Excel khusus Kode Program ${activeSection.code}`
                : "Ekspor seluruh matriks ke file Excel .xlsx"
            }
          >
            <FileSpreadsheet size={14} />
            <span>{isExportingXlsx ? "Menyiapkan..." : "Ekspor Excel (.xlsx)"}</span>
          </button>

          {/* Ekspor CSV standar */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleExportSpreadsheetCsv}
            title="Unduh data matriks ini ke file CSV standar"
          >
            <Download size={14} />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Official Spreadsheet Matrix Document Sheet */}
      <div className="official-sheet-card" id="official-printable-matrix">
        {/* Document Official Header */}
        <div className="sheet-doc-header">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.25rem", marginBottom: "0.5rem" }}>
            <div style={{ flexShrink: 0 }}>
              <Image
                src="/assets/ragunan-emblem-square.png"
                alt="Logo UP Taman Margasatwa Ragunan"
                width={52}
                height={52}
                priority
                style={{ objectFit: "contain" }}
              />
            </div>
            {isSingleSection && activeSection ? (
              <div style={{ textAlign: "center" }}>
                <div className="sheet-doc-title">
                  REKAP PENILAIAN INDEKS KEPUASAN MASYARAKAT (IKM) PER KODE PROGRAM
                </div>
                <div className="sheet-doc-subtitle" style={{ color: "var(--gov-primary-700)", fontWeight: 800 }}>
                  SUB-KEGIATAN: {activeSection.code} — {activeSection.title.toUpperCase()}
                </div>
                <div className="sheet-doc-agency">
                  {report.instansi} • UNIT PENGELOLA TAMAN MARGASATWA RAGUNAN
                </div>
                <div style={{ fontSize: "7.5pt", color: "#475569", marginTop: "3px", fontWeight: 600 }}>
                  {report.title} • {report.periode} • STANDAR PERMENPAN-RB NO. 14 / 2017 • TOTAL RESPONDEN: {report.totalRespondenGlobal} PEGAWAI
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <div className="sheet-doc-title">
                  {report.title}
                </div>
                <div className="sheet-doc-subtitle">
                  {report.subTitle}
                </div>
                <div className="sheet-doc-agency">
                  {report.instansi} • UNIT PENGELOLA TAMAN MARGASATWA RAGUNAN
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scroll Helper Hint for Mobile */}
        <div className="mobile-scroll-hint no-print">
          <span>Geser tabel ke kanan untuk melihat rincian nilai bobot & hasil akhir</span>
          <ChevronRight size={14} />
        </div>

        {/* Table Structure matching Google Sheets 2-Tier Header */}
        <div className="sheet-table-responsive">
          <table className="sheet-matrix-table">
            <thead>
              {/* Row 1 Header */}
              <tr className="matrix-header-top">
                <th rowSpan={2} style={{ width: "45px" }}>No</th>
                <th rowSpan={2} style={{ minWidth: "320px" }}>Kegiatan / Indikator Pertanyaan</th>
                <th colSpan={4} className="matrix-header-group">Skala</th>
                <th rowSpan={2} style={{ width: "85px" }}>Jumlah Responden</th>
                <th colSpan={6} className="matrix-header-group">Nilai</th>
                <th rowSpan={2} style={{ width: "95px" }}>Hasil Akhir</th>
                <th rowSpan={2} style={{ width: "65px" }}>Skala</th>
              </tr>
              {/* Row 2 Header: 1 2 3 4 sub-columns */}
              <tr className="matrix-header-sub">
                <th style={{ width: "40px" }}>1</th>
                <th style={{ width: "40px" }}>2</th>
                <th style={{ width: "40px" }}>3</th>
                <th style={{ width: "40px" }}>4</th>
                <th style={{ width: "45px" }}>1</th>
                <th style={{ width: "45px" }}>2</th>
                <th style={{ width: "45px" }}>3</th>
                <th style={{ width: "45px" }}>4</th>
                <th style={{ width: "65px" }}>Jumlah</th>
                <th style={{ width: "80px" }}>Rata-rata</th>
              </tr>
            </thead>
            <tbody>
              {displayedSections.map((sec, secDisplayIdx) => (
                <React.Fragment key={sec.id}>
                  {/* Section Title Header Row */}
                  <tr className="section-title-row">
                    <td className="sec-num-cell">{isSingleSection ? 1 : sec.num}</td>
                    <td colSpan={14} className="sec-title-cell">
                      <strong>{sec.code} {sec.title}</strong>
                    </td>
                  </tr>

                  {/* 5 Indicator Questions Rows (a, b, c, d, e) */}
                  {sec.rows.map((row, rowIdx) => {
                    const isFirstRow = rowIdx === 0;

                    return (
                      <tr key={`${sec.id}-row-${row.num}`} className="indicator-row">
                        <td className="empty-no-cell" />
                        <td className="question-desc-cell">
                          <span className="q-letter">{row.letter}.</span> {row.text}
                        </td>

                        {/* Frequency Counts (Skala 1 - 4) */}
                        <td className="num-cell">{row.counts[1]}</td>
                        <td className="num-cell">{row.counts[2]}</td>
                        <td className="num-cell">{row.counts[3]}</td>
                        <td className="num-cell">{row.counts[4]}</td>

                        {/* Total Responden for this row */}
                        <td className="num-cell highlight-gray">{row.totalResponden}</td>

                        {/* Weighted Values (Counts * Scale: 1, 2, 3, 4) */}
                        <td className="num-cell">{row.weighted[1]}</td>
                        <td className="num-cell">{row.weighted[2]}</td>
                        <td className="num-cell">{row.weighted[3]}</td>
                        <td className="num-cell">{row.weighted[4]}</td>

                        {/* Total Nilai Bobot (Jumlah) */}
                        <td className="num-cell highlight-gray">{row.totalNilaiBobot}</td>

                        {/* Nilai Rata-rata per Butir (Rata-rata / NRR) */}
                        <td className="num-cell highlight-nrr">
                          {row.nrr.toFixed(2).replace(".", ",")}
                        </td>

                        {/* Hasil Akhir per Kegiatan (Merged Cell for all rows in section) */}
                        {isFirstRow && (
                          <td rowSpan={sec.rows.length} className="num-cell merged-final-cell">
                            <strong>{sec.hasilAkhirDimensi.toFixed(2).replace(".", ",")}</strong>
                          </td>
                        )}

                        {/* Skala Pembulatan (Merged Cell for all rows in section) */}
                        {isFirstRow && (
                          <td rowSpan={sec.rows.length} className="num-cell merged-scale-cell">
                            <strong>{sec.skalaPembulatan}</strong>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}

              {/* Total Recap Row */}
              {isSingleSection && activeSection ? (
                <tr className="grand-total-row">
                  <td colSpan={11} style={{ textAlign: "right", paddingRight: "1rem" }}>
                    <strong>RATA-RATA NILAI SUB-KEGIATAN ({activeSection.code}):</strong>
                  </td>
                  <td className="num-cell highlight-grand">
                    <strong>{activeSection.hasilAkhirDimensi.toFixed(2).replace(".", ",")}</strong>
                  </td>
                  <td className="num-cell highlight-grand">
                    <strong>{activeSection.hasilAkhirDimensi.toFixed(2).replace(".", ",")}</strong>
                  </td>
                  <td className="num-cell highlight-grand">
                    <strong>{activeSection.skalaPembulatan}</strong>
                  </td>
                </tr>
              ) : (
                <tr className="grand-total-row">
                  <td colSpan={11} style={{ textAlign: "right", paddingRight: "1rem" }}>
                    <strong>RATA-RATA KESELURUHAN PROGRAM PENUNJANG (IKM):</strong>
                  </td>
                  <td className="num-cell highlight-grand">
                    <strong>{report.overallNRR.toFixed(2).replace(".", ",")}</strong>
                  </td>
                  <td className="num-cell highlight-grand">
                    <strong>{report.overallNRR.toFixed(2).replace(".", ",")}</strong>
                  </td>
                  <td className="num-cell highlight-grand">
                    <strong>{report.overallSkala}</strong>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Executive GovTech KPI Summary Box for Single Program Print */}
        {isSingleSection && activeSection && (
          <div
            className="program-kpi-summary-box"
            style={{
              marginTop: "1.25rem",
              marginBottom: "1.25rem",
              padding: "0.85rem 1.15rem",
              background: "#f0fdf4",
              border: "1.5px solid #bbf7d0",
              borderRadius: "10px",
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.74rem", color: "#64748b", fontWeight: 600 }}>Nilai Rata-rata (NRR)</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                {activeSection.hasilAkhirDimensi.toFixed(2)} <span style={{ fontSize: "0.75rem", color: "#64748b" }}>/ 4.00</span>
              </div>
            </div>
            <div className="kpi-box-divider" style={{ width: "1px", height: "30px", background: "#bbf7d0" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.74rem", color: "#64748b", fontWeight: 600 }}>Indeks Kepuasan (IKM x25)</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--gov-primary-700)" }}>
                {activeSection.ikmDimensi.toFixed(1)} <span style={{ fontSize: "0.75rem", color: "var(--gov-primary-800)" }}>/ 100</span>
              </div>
            </div>
            <div className="kpi-box-divider" style={{ width: "1px", height: "30px", background: "#bbf7d0" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.74rem", color: "#64748b", fontWeight: 600 }}>Mutu Pelayanan BLUD</div>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#166534" }}>
                Mutu {activeSection.mutuPredikat} ({activeSection.mutuLabel})
              </div>
            </div>
            <div className="kpi-box-divider" style={{ width: "1px", height: "30px", background: "#bbf7d0" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.74rem", color: "#64748b", fontWeight: 600 }}>Responden Kedinasan</div>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#334155" }}>
                {report.totalRespondenGlobal} Pegawai Terverifikasi
              </div>
            </div>
          </div>
        )}

        {/* Official 2-Column Signature Section (Persis Format Google Sheet) */}
        <div
          className="sheet-signatures"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2rem",
            marginTop: isSingleSection ? "1.5rem" : "2.5rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          {/* Penandatangan 1: Kepala Unit Pengelola (Kiri) */}
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: "0.85rem", color: "#475569", marginBottom: "0.2rem" }}>Mengetahui,</div>
            <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#0f172a" }}>
              {report.pejabatPengesah.jabatan}
            </div>
            <div style={{ fontSize: "0.82rem", color: "#64748b", whiteSpace: "pre-line", lineHeight: 1.4 }}>
              {report.pejabatPengesah.instansi}
            </div>

            {/* Official Signature Stamp Space */}
            <div style={{ height: "85px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div
                style={{
                  width: "200px",
                  height: "65px",
                  border: "1.5px dashed #cbd5e1",
                  borderRadius: "8px",
                  background: "#fafbfc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontStyle: "italic" }}>
                  [ Tanda Tangan & Cap Dinas ]
                </span>
              </div>
            </div>

            <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", textDecoration: "underline" }}>
              {report.pejabatPengesah.nama}
            </div>
            <div style={{ fontSize: "0.8rem", fontFamily: "var(--font-mono)", color: "#475569", marginTop: "2px" }}>
              NIP. {report.pejabatPengesah.nip}
            </div>
          </div>

          {/* Penandatangan 2: Ka. Sub Bagian Tata Usaha (Kanan) */}
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: "0.85rem", color: "#475569", marginBottom: "0.2rem" }}>&nbsp;</div>
            <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#0f172a" }}>
              {report.pejabatTataUsaha.jabatan}
            </div>
            <div style={{ fontSize: "0.82rem", color: "#64748b", whiteSpace: "pre-line", lineHeight: 1.4 }}>
              {report.pejabatTataUsaha.instansi}
            </div>

            {/* Official Signature Stamp Space */}
            <div style={{ height: "85px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div
                style={{
                  width: "200px",
                  height: "65px",
                  border: "1.5px dashed #cbd5e1",
                  borderRadius: "8px",
                  background: "#fafbfc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontStyle: "italic" }}>
                  [ Tanda Tangan & Cap Dinas ]
                </span>
              </div>
            </div>

            <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", textDecoration: "underline" }}>
              {report.pejabatTataUsaha.nama}
            </div>
            <div style={{ fontSize: "0.8rem", fontFamily: "var(--font-mono)", color: "#475569", marginTop: "2px" }}>
              NIP. {report.pejabatTataUsaha.nip}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Dialog Cetak Dokumen PDF */}
      <PrintSelectorModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        sections={report.sections}
        onPrint={handlePrintTrigger}
        onPreview={(secId) => {
          setSectionId(secId);
          setIsPrintModalOpen(false);
        }}
        periodLabel={periodLabel}
        overallIKM={report.overallIKM}
      />

      {/* Custom UI/UX Notification Modal: Gagal Ekspor */}
      <UiConfirmModal
        isOpen={Boolean(exportError)}
        title="Gagal Ekspor Dokumen"
        message={exportError || ""}
        type="info"
        confirmText="Tutup"
        onConfirm={() => setExportError(null)}
        onClose={() => setExportError(null)}
      />
    </section>
  );
};
