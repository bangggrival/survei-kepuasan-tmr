/**
 * Sistem Otomasi Periode Triwulan & Tahun Anggaran (Zero-Maintenance)
 * Unit Pengelola Taman Margasatwa Ragunan
 * 
 * Modul ini secara otomatis menentukan Tahun Anggaran dan Triwulan berjalan
 * berdasarkan kalender waktu nyata (real-time system clock) tanpa memerlukan
 * penyetelan manual setiap pergantian triwulan maupun pergantian tahun.
 */

export interface PeriodInfo {
  year: number;
  month: number; // 1-12
  quarterNum: 1 | 2 | 3 | 4;
  quarterCode: "TW-1" | "TW-2" | "TW-3" | "TW-4";
  quarterRoman: "I" | "II" | "III" | "IV";
  quarterLabel: string; // e.g. "Triwulan III"
  monthRangeLabel: string; // e.g. "Jul - Sep"
  pickerLabel: string; // e.g. "Triwulan III (Jul - Sep 2026)"
  fullPeriodLabel: string; // e.g. "Tahun Anggaran 2026 Triwulan III"
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
}

export interface PeriodPreset {
  label: string;
  quarter: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}

/**
 * Konversi angka triwulan (1..4) ke angka Romawi
 */
export function toRomanQuarter(q: number): "I" | "II" | "III" | "IV" {
  switch (q) {
    case 1:
      return "I";
    case 2:
      return "II";
    case 3:
      return "III";
    case 4:
    default:
      return "IV";
  }
}

/**
 * Rentang bulan untuk tiap triwulan
 */
export function getQuarterMonthRange(q: number): { label: string; startMonth: string; endMonth: string; endDay: string } {
  switch (q) {
    case 1:
      return { label: "Jan - Mar", startMonth: "01", endMonth: "03", endDay: "31" };
    case 2:
      return { label: "Apr - Jun", startMonth: "04", endMonth: "06", endDay: "30" };
    case 3:
      return { label: "Jul - Sep", startMonth: "07", endMonth: "09", endDay: "30" };
    case 4:
    default:
      return { label: "Okt - Des", startMonth: "10", endMonth: "12", endDay: "31" };
  }
}

/**
 * Dapatkan informasi lengkap periode triwulan dan tahun berjalan secara otomatis.
 * Jika parameter date tidak diberikan, otomatis menggunakan waktu saat ini (new Date()).
 */
export function getCurrentPeriodInfo(targetDate: Date = new Date()): PeriodInfo {
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1; // 1-12
  const quarterNum = (Math.ceil(month / 3) || 1) as 1 | 2 | 3 | 4;
  const quarterCode = `TW-${quarterNum}` as "TW-1" | "TW-2" | "TW-3" | "TW-4";
  const quarterRoman = toRomanQuarter(quarterNum);
  const range = getQuarterMonthRange(quarterNum);

  const startDate = `${year}-${range.startMonth}-01`;
  const endDate = `${year}-${range.endMonth}-${range.endDay}`;

  return {
    year,
    month,
    quarterNum,
    quarterCode,
    quarterRoman,
    quarterLabel: `Triwulan ${quarterRoman}`,
    monthRangeLabel: range.label,
    pickerLabel: `Triwulan ${quarterRoman} (${range.label} ${year})`,
    fullPeriodLabel: `Tahun Anggaran ${year} Triwulan ${quarterRoman}`,
    startDate,
    endDate,
  };
}

/**
 * Menghasilkan daftar presets periode secara dinamis untuk tahun tertentu.
 * Otomatis memuat 4 Triwulan (TW-1 s/d TW-4) dan opsi Seluruh TA.
 */
export function getDynamicPeriodPresets(year: number = new Date().getFullYear()): PeriodPreset[] {
  const current = getCurrentPeriodInfo();

  const presets: PeriodPreset[] = [
    {
      label: `Triwulan IV (Okt - Des ${year})`,
      quarter: "TW-4",
      startDate: `${year}-10-01`,
      endDate: `${year}-12-31`,
      isCurrent: current.year === year && current.quarterNum === 4,
    },
    {
      label: `Triwulan III (Jul - Sep ${year})`,
      quarter: "TW-3",
      startDate: `${year}-07-01`,
      endDate: `${year}-09-30`,
      isCurrent: current.year === year && current.quarterNum === 3,
    },
    {
      label: `Triwulan II (Apr - Jun ${year})`,
      quarter: "TW-2",
      startDate: `${year}-04-01`,
      endDate: `${year}-06-30`,
      isCurrent: current.year === year && current.quarterNum === 2,
    },
    {
      label: `Triwulan I (Jan - Mar ${year})`,
      quarter: "TW-1",
      startDate: `${year}-01-01`,
      endDate: `${year}-03-31`,
      isCurrent: current.year === year && current.quarterNum === 1,
    },
    {
      label: `Seluruh TA ${year}`,
      quarter: "ALL",
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
    },
  ];

  return presets;
}

/**
 * Format Kode Registrasi Bukti Tanda Terima Survei:
 * Contoh: TMR/IKM/2026/TW3/RESP-038
 */
export function generateSurveyRegistrationCode(responseId: string, targetDate: Date = new Date()): string {
  const period = getCurrentPeriodInfo(targetDate);
  return `TMR/IKM/${period.year}/TW${period.quarterNum}/${responseId}`;
}

/**
 * Struktur Detail Header Resmi Kuesioner & Dashboard:
 * Memisahkan komponen Nama Program, Periode Waktu, dan Instansi secara terstruktur (Clean Hierarchy).
 */
export interface OfficialHeaderInfo {
  programName: string;
  periodLabel: string;
  agencyName: string;
  parentAgency: string;
  year: number;
  quarterRoman: string;
  fullFormattedSubtitle: string;
}

export function getOfficialHeaderDetails(period?: {
  quarter?: string;
  startDate?: string;
  endDate?: string;
  label?: string;
}): OfficialHeaderInfo {
  const current = getCurrentPeriodInfo();
  let year = current.year;
  let quarterRoman = current.quarterRoman;

  if (period?.startDate) {
    const yr = parseInt(period.startDate.slice(0, 4), 10);
    if (!isNaN(yr) && yr > 2000) year = yr;
  }

  let isAll = false;
  if (period?.quarter) {
    if (period.quarter === "TW-1") quarterRoman = "I";
    else if (period.quarter === "TW-2") quarterRoman = "II";
    else if (period.quarter === "TW-3") quarterRoman = "III";
    else if (period.quarter === "TW-4") quarterRoman = "IV";
    else if (period.quarter === "ALL") isAll = true;
  }

  const periodLabel = isAll
    ? `Tahun Anggaran ${year}`
    : `Tahun Anggaran ${year} • Triwulan ${quarterRoman}`;

  return {
    programName: "Program Penunjang Urusan Pemerintahan Daerah Provinsi",
    periodLabel,
    agencyName: "Unit Pengelola Taman Margasatwa Ragunan",
    parentAgency: "Dinas Pertamanan dan Hutan Kota Provinsi DKI Jakarta",
    year,
    quarterRoman,
    fullFormattedSubtitle: `${periodLabel} • Unit Pengelola Taman Margasatwa Ragunan`,
  };
}

/**
 * Format Subjudul Resmi Kuesioner & Dashboard:
 * Menghasilkan teks dinamis sesuai Tahun Anggaran dan Triwulan berjalan atau yang dipilih.
 * Contoh: "PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH PROVINSI TAHUN ANGGARAN 2026 TRIWULAN I UNIT PENGELOLA TAMAN MARGASATWA RAGUNAN DINAS PERTAMANAN DAN HUTAN KOTA PROVINSI DKI JAKARTA"
 */
export function getOfficialPeriodSubtitle(period?: {
  quarter?: string;
  startDate?: string;
  endDate?: string;
  label?: string;
}): string {
  const details = getOfficialHeaderDetails(period);
  return `${details.programName.toUpperCase()} ${details.periodLabel.toUpperCase().replace(" • ", " ")} ${details.agencyName.toUpperCase()} ${details.parentAgency.toUpperCase()}`;
}
