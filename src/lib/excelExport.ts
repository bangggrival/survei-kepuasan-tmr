import ExcelJS from "exceljs";
import { OfficialRecapReport } from "./officialRecap";
import { SurveyResponse, ALL_QUESTIONS } from "./constants";

/**
 * Generate official .xlsx workbook compliant with PermenPAN-RB No. 14 / 2017 & DKI Jakarta Dinas format
 */
export async function generateOfficialSpreadsheetXlsx(
  report: OfficialRecapReport,
  rawResponses?: SurveyResponse[],
  customQuestions?: { id: string; num: number; text: string }[]
): Promise<Blob> {
  const activeQuestions = customQuestions && customQuestions.length > 0 ? customQuestions : ALL_QUESTIONS;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "UP Taman Margasatwa Ragunan";
  workbook.lastModifiedBy = "Sistem Evaluasi IKM TMR";
  workbook.created = new Date();
  workbook.modified = new Date();

  // ==========================================
  // SHEET 1: REKAPITULASI MATRIKS PERMENPAN-RB
  // ==========================================
  const ws = workbook.addWorksheet("Matriks Rekapitulasi IKM", {
    pageSetup: {
      orientation: "landscape",
      paperSize: 9, // A4
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    },
    views: [{ showGridLines: true }],
  });

  // Set column widths
  ws.columns = [
    { key: "no", width: 5 }, // A
    { key: "unsur", width: 52 }, // B
    { key: "skala1", width: 8 }, // C
    { key: "skala2", width: 8 }, // D
    { key: "skala3", width: 8 }, // E
    { key: "skala4", width: 8 }, // F
    { key: "jml_resp", width: 14 }, // G
    { key: "bobot1", width: 8 }, // H
    { key: "bobot2", width: 8 }, // I
    { key: "bobot3", width: 8 }, // J
    { key: "bobot4", width: 8 }, // K
    { key: "jml_bobot", width: 12 }, // L
    { key: "nrr", width: 12 }, // M
    { key: "hasil_akhir", width: 14 }, // N
    { key: "skala_akhir", width: 10 }, // O
  ];

  // Helper styles
  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: "thin", color: { argb: "FFCBD5E1" } },
    left: { style: "thin", color: { argb: "FFCBD5E1" } },
    bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
    right: { style: "thin", color: { argb: "FFCBD5E1" } },
  };

  const headerFill: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0D9488" }, // Teal 600
  };

  const subHeaderFill: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF0FDFA" }, // Teal 50
  };

  const sectionHeaderFill: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE2E8F0" }, // Slate 200
  };

  const grandTotalFill: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFCCFBF1" }, // Teal 100
  };

  // Header Title Lines (Baris 1 - 3)
  const title1 = ws.addRow([report.title.toUpperCase()]);
  ws.mergeCells(`A1:O1`);
  title1.getCell(1).font = { name: "Arial", size: 13, bold: true, color: { argb: "FF0F172A" } };
  title1.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
  title1.height = 24;

  const title2 = ws.addRow([report.subTitle.toUpperCase()]);
  ws.mergeCells(`A2:O2`);
  title2.getCell(1).font = { name: "Arial", size: 11, bold: true, color: { argb: "FF0D9488" } };
  title2.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
  title2.height = 20;

  const title3 = ws.addRow([report.instansi.toUpperCase()]);
  ws.mergeCells(`A3:O3`);
  title3.getCell(1).font = { name: "Arial", size: 10, bold: true, color: { argb: "FF475569" } };
  title3.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
  title3.height = 18;

  ws.addRow([]); // Blank row 4

  // Table Column Headers (Row 5 & 6)
  // Row 5
  const r5 = ws.addRow([
    "NO",
    "UNSUR PELAYANAN / INDIKATOR KEGIATAN",
    "SKALA PENILAIAN",
    "",
    "",
    "",
    "JUMLAH RESPONDEN",
    "NILAI BOBOT",
    "",
    "",
    "",
    "JUMLAH NILAI",
    "RATA-RATA (NRR)",
    "HASIL AKHIR",
    "SKALA",
  ]);
  r5.height = 24;

  // Row 6
  const r6 = ws.addRow([
    "",
    "",
    "1",
    "2",
    "3",
    "4",
    "",
    "1",
    "2",
    "3",
    "4",
    "",
    "",
    "",
    "",
  ]);
  r6.height = 20;

  // Merge headers in row 5 & 6
  ws.mergeCells("A5:A6");
  ws.mergeCells("B5:B6");
  ws.mergeCells("C5:F5"); // Skala Penilaian
  ws.mergeCells("G5:G6"); // Jumlah Responden
  ws.mergeCells("H5:K5"); // Nilai Bobot
  ws.mergeCells("L5:L6"); // Jumlah Nilai
  ws.mergeCells("M5:M6"); // Rata-rata
  ws.mergeCells("N5:N6"); // Hasil Akhir
  ws.mergeCells("O5:O6"); // Skala

  // Style Header Cells
  [5, 6].forEach((rowNum) => {
    const row = ws.getRow(rowNum);
    for (let c = 1; c <= 15; c++) {
      const cell = row.getCell(c);
      cell.fill = headerFill;
      cell.font = { name: "Arial", size: 9, bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = thinBorder;
    }
  });

  // Populate Section Data Rows
  report.sections.forEach((sec) => {
    // Section Title Row
    const secRow = ws.addRow([sec.num, `${sec.code} - ${sec.title}`]);
    const secRowNum = secRow.number;
    ws.mergeCells(`B${secRowNum}:O${secRowNum}`);
    secRow.height = 22;

    secRow.getCell(1).font = { name: "Arial", size: 9, bold: true, color: { argb: "FF0F172A" } };
    secRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    secRow.getCell(1).fill = sectionHeaderFill;
    secRow.getCell(1).border = thinBorder;

    secRow.getCell(2).font = { name: "Arial", size: 9, bold: true, color: { argb: "FF0F766E" } };
    secRow.getCell(2).alignment = { horizontal: "left", vertical: "middle" };
    secRow.getCell(2).fill = sectionHeaderFill;
    secRow.getCell(2).border = thinBorder;

    const firstItemRow = ws.rowCount + 1;

    sec.rows.forEach((qRow, rowIdx) => {
      const row = ws.addRow([
        "",
        `  ${qRow.letter}. ${qRow.text}`,
        qRow.counts[1],
        qRow.counts[2],
        qRow.counts[3],
        qRow.counts[4],
        qRow.totalResponden,
        qRow.weighted[1],
        qRow.weighted[2],
        qRow.weighted[3],
        qRow.weighted[4],
        qRow.totalNilaiBobot,
        Number(qRow.nrr.toFixed(2)),
        rowIdx === 0 ? Number(sec.hasilAkhirDimensi.toFixed(2)) : "",
        rowIdx === 0 ? sec.skalaPembulatan : "",
      ]);
      row.height = 20;

      // Styling question cells
      for (let c = 1; c <= 15; c++) {
        const cell = row.getCell(c);
        cell.border = thinBorder;
        cell.font = { name: "Arial", size: 9 };

        if (c === 2) {
          cell.alignment = { horizontal: "left", vertical: "middle" };
        } else if (c >= 3 && c <= 12) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.numFmt = "#,##0";
        } else if (c === 13 || c === 14) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.numFmt = "0.00";
          cell.font = { name: "Arial", size: 9, bold: true };
        } else if (c === 15) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.font = { name: "Arial", size: 9, bold: true, color: { argb: "FF0F766E" } };
        }
      }
    });

    const lastItemRow = ws.rowCount;
    if (lastItemRow >= firstItemRow) {
      ws.mergeCells(`N${firstItemRow}:N${lastItemRow}`);
      ws.mergeCells(`O${firstItemRow}:O${lastItemRow}`);
      const mergedCellN = ws.getCell(`N${firstItemRow}`);
      mergedCellN.alignment = { horizontal: "center", vertical: "middle" };
      mergedCellN.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF0D9488" } };
      mergedCellN.fill = subHeaderFill;

      const mergedCellO = ws.getCell(`O${firstItemRow}`);
      mergedCellO.alignment = { horizontal: "center", vertical: "middle" };
      mergedCellO.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF0D9488" } };
      mergedCellO.fill = subHeaderFill;
    }
  });

  // Grand Total Overall Row
  const totalRow = ws.addRow([
    "",
    "RATA-RATA KESELURUHAN PROGRAM PENUNJANG (IKM)",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    Number(report.overallNRR.toFixed(2)),
    Number(report.overallNRR.toFixed(2)),
    Number(report.overallNRR.toFixed(2)),
    report.overallSkala,
  ]);
  const trNum = totalRow.number;
  ws.mergeCells(`B${trNum}:K${trNum}`);
  totalRow.height = 24;

  for (let c = 1; c <= 15; c++) {
    const cell = totalRow.getCell(c);
    cell.fill = grandTotalFill;
    cell.border = thinBorder;
    cell.font = { name: "Arial", size: 9.5, bold: true, color: { argb: "FF0F172A" } };
    if (c === 2) {
      cell.alignment = { horizontal: "center", vertical: "middle" };
    } else if (c >= 12 && c <= 14) {
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.numFmt = "0.00";
      cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF0F766E" } };
    } else if (c === 15) {
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.font = { name: "Arial", size: 11, bold: true, color: { argb: "FF0D9488" } };
    }
  }

  // Blank spacing
  ws.addRow([]);
  ws.addRow([]);

  // Official Signatures Block (2 Pejabat Penandatangan)
  const sigStartRow = ws.rowCount + 1;
  ws.addRow(["", "Mengetahui,"]);
  ws.addRow(["", "Kepala Unit Pengelola Taman Margasatwa Ragunan", "", "", "", "", "", "", "", "", "Ka. Sub Bagian Tata Usaha Unit Pengelola"]);
  ws.addRow(["", "Dinas Pertamanan dan Hutan Kota Provinsi DKI Jakarta", "", "", "", "", "", "", "", "", "Taman Margasatwa Ragunan"]);
  ws.addRow([]);
  ws.addRow([]);
  ws.addRow([]);
  ws.addRow(["", report.pejabatPengesah.nama, "", "", "", "", "", "", "", "", report.pejabatTataUsaha.nama]);
  ws.addRow(["", `NIP. ${report.pejabatPengesah.nip}`, "", "", "", "", "", "", "", "", `NIP. ${report.pejabatTataUsaha.nip}`]);

  // Style signature titles
  ws.getCell(`B${sigStartRow}`).font = { name: "Arial", size: 9.5, bold: true };
  ws.getCell(`B${sigStartRow + 1}`).font = { name: "Arial", size: 9, bold: true };
  ws.getCell(`K${sigStartRow + 1}`).font = { name: "Arial", size: 9, bold: true };
  ws.getCell(`B${sigStartRow + 2}`).font = { name: "Arial", size: 8.5, color: { argb: "FF64748B" } };
  ws.getCell(`K${sigStartRow + 2}`).font = { name: "Arial", size: 8.5, color: { argb: "FF64748B" } };

  // Style signature names
  ws.getCell(`B${sigStartRow + 6}`).font = { name: "Arial", size: 9.5, bold: true, underline: true };
  ws.getCell(`K${sigStartRow + 6}`).font = { name: "Arial", size: 9.5, bold: true, underline: true };
  ws.getCell(`B${sigStartRow + 7}`).font = { name: "Arial", size: 9 };
  ws.getCell(`K${sigStartRow + 7}`).font = { name: "Arial", size: 9 };

  // ==========================================
  // SHEET 2: DATA MENTAH RESPONDEN (JIKA ADA)
  // ==========================================
  if (rawResponses && rawResponses.length > 0) {
    const rawWs = workbook.addWorksheet("Data Responden Pegawai", {
      views: [{ showGridLines: true }],
    });

    rawWs.columns = [
      { header: "ID Responden", key: "id", width: 14 },
      { header: "Nama Lengkap Pegawai", key: "nama", width: 28 },
      { header: "NIP / NRK", key: "nip", width: 22 },
      { header: "Kategori Jabatan", key: "jabatan", width: 24 },
      { header: "Waktu Pengisian", key: "timestamp", width: 20 },
      { header: "Rata-rata Skor", key: "avg", width: 14 },
      { header: "Saran & Masukan", key: "saran", width: 36 },
      ...activeQuestions.map((q) => ({
        header: `Q${q.num} (${q.id})`,
        key: q.id,
        width: 10,
      })),
    ];

    // Style Header Row
    const headerRow = rawWs.getRow(1);
    headerRow.height = 24;
    headerRow.eachCell((cell) => {
      cell.fill = headerFill;
      cell.font = { name: "Arial", size: 9.5, bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = thinBorder;
    });

    // Add Respondent Rows
    rawResponses.forEach((r) => {
      const vals = Object.values(r.answers);
      const avg = vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : "0.00";

      const rowValues: Record<string, string | number> = {
        id: r.id,
        nama: r.nama,
        nip: r.nip,
        jabatan: r.jabatan,
        timestamp: new Date(r.timestamp).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        avg: Number(avg),
        saran: r.saran || "-",
      };

      ALL_QUESTIONS.forEach((q) => {
        rowValues[q.id] = r.answers[q.id] || "";
      });

      const row = rawWs.addRow(rowValues);
      row.height = 19;
      row.eachCell((cell, colNum) => {
        cell.border = thinBorder;
        cell.font = { name: "Arial", size: 9 };
        if (colNum === 1 || colNum === 3 || colNum === 5) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        } else if (colNum === 6) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.font = { name: "Arial", size: 9, bold: true, color: { argb: "FF0D9488" } };
          cell.numFmt = "0.00";
        } else if (colNum > 7) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        }
      });
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/**
 * Export raw respondents directly to .xlsx format
 */
export async function generateRawResponsesXlsx(
  responses: SurveyResponse[],
  customQuestions?: { id: string; num: number; text: string }[]
): Promise<Blob> {
  const activeQuestions = customQuestions && customQuestions.length > 0 ? customQuestions : ALL_QUESTIONS;
  const workbook = new ExcelJS.Workbook();
  const rawWs = workbook.addWorksheet("Data Responden Pegawai", {
    views: [{ showGridLines: true }],
  });

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: "thin", color: { argb: "FFCBD5E1" } },
    left: { style: "thin", color: { argb: "FFCBD5E1" } },
    bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
    right: { style: "thin", color: { argb: "FFCBD5E1" } },
  };

  const headerFill: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0D9488" },
  };

  rawWs.columns = [
    { header: "ID Responden", key: "id", width: 14 },
    { header: "Nama Lengkap Pegawai", key: "nama", width: 28 },
    { header: "NIP / NRK", key: "nip", width: 22 },
    { header: "Kategori Jabatan", key: "jabatan", width: 24 },
    { header: "Waktu Pengisian", key: "timestamp", width: 20 },
    { header: "Rata-rata Skor", key: "avg", width: 14 },
    { header: "Saran & Masukan", key: "saran", width: 36 },
    ...activeQuestions.map((q) => ({
      header: `Q${q.num} (${q.id})`,
      key: q.id,
      width: 10,
    })),
  ];

  const headerRow = rawWs.getRow(1);
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = { name: "Arial", size: 9.5, bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = thinBorder;
  });

  responses.forEach((r) => {
    const vals = Object.values(r.answers);
    const avg = vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : "0.00";

    const rowValues: Record<string, string | number> = {
      id: r.id,
      nama: r.nama,
      nip: r.nip,
      jabatan: r.jabatan,
      timestamp: new Date(r.timestamp).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      avg: Number(avg),
      saran: r.saran || "-",
    };

    ALL_QUESTIONS.forEach((q) => {
      rowValues[q.id] = r.answers[q.id] || "";
    });

    const row = rawWs.addRow(rowValues);
    row.height = 19;
    row.eachCell((cell, colNum) => {
      cell.border = thinBorder;
      cell.font = { name: "Arial", size: 9 };
      if (colNum === 1 || colNum === 3 || colNum === 5) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else if (colNum === 6) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.font = { name: "Arial", size: 9, bold: true, color: { argb: "FF0D9488" } };
        cell.numFmt = "0.00";
      } else if (colNum > 7) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      }
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
