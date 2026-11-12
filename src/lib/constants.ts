/**
 * Types & Constants for UP Taman Margasatwa Ragunan Survey & Executive Dashboard
 * Standar PermenPAN-RB No. 14 / 2017 - Tahun Anggaran 2026 Triwulan III
 */

export interface Question {
  id: string;
  num: number;
  text: string;
}

export interface SurveySection {
  id: string;
  code: string;
  title: string;
  shortTitle: string;
  icon: "zap" | "fuel" | "truck" | "building-2";
  questions: Question[];
}

export interface LikertOption {
  value: number;
  label: string;
  short: string;
  color: string;
  bg: string;
}

export interface SurveyResponse {
  id: string;
  timestamp: string;
  nama: string;
  nip: string;
  jabatan: string;
  saran?: string;
  answers: Record<string, number>;
  createdAt?: string;
}

export interface DimensionScore {
  sec: SurveySection;
  avg: number;
  ikm: number;
  nrrWeighted: number;
}

export interface QuestionStat {
  id: string;
  num: number;
  text: string;
  sectionShortTitle: string;
  avg: number;
  ikm: number;
  counts: Record<number, number>;
}

export interface DashboardMetrics {
  totalResponses: number;
  averageScale4: number;
  ikmFinal: number;
  mutu: {
    predikat: "A" | "B" | "C" | "D";
    label: string;
    cssClass: string;
    description: string;
  };
  satisfactionPct: number;
  bestDim: DimensionScore | null;
  lowestDim: DimensionScore | null;
  dimScores: DimensionScore[];
  questionStats: QuestionStat[];
  ratingDistribution: {
    sts: number;
    ts: number;
    s: number;
    ss: number;
  };
}

import { getCurrentPeriodInfo } from "./periodUtils";

export const SURVEY_METADATA = {
  title: "KUESIONER INDEKS KEPUASAN LAYANAN",
  subTitle: "PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH PROVINSI",
  get fullOfficialSubtitle() {
    const p = getCurrentPeriodInfo();
    return `PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH PROVINSI TAHUN ANGGARAN ${p.year} TRIWULAN ${p.quarterRoman} UNIT PENGELOLA TAMAN MARGASATWA RAGUNAN DINAS PERTAMANAN DAN HUTAN KOTA PROVINSI DKI JAKARTA`;
  },
  get period() {
    return getCurrentPeriodInfo().fullPeriodLabel;
  },
  agency: "Unit Pengelola Taman Margasatwa Ragunan",
  department: "Dinas Pertamanan dan Hutan Kota Provinsi DKI Jakarta",
  legalBasis: "PermenPAN-RB No. 14 Tahun 2017",
};

export const JABATAN_OPTIONS = [
  "Pejabat Administrator",
  "Pejabat Pengawas",
  "Jabatan Pelaksana",
  "Jabatan Fungsional"
] as const;

export const LIKERT_OPTIONS: LikertOption[] = [
  { value: 1, label: "Sangat Tidak Setuju", short: "STS", color: "#EF4444", bg: "#FEE2E2" },
  { value: 2, label: "Tidak Setuju", short: "TS", color: "#F59E0B", bg: "#FEF3C7" },
  { value: 3, label: "Setuju", short: "S", color: "#10B981", bg: "#D1FAE5" },
  { value: 4, label: "Sangat Setuju", short: "SS", color: "#047857", bg: "#A7F3D0" }
];

export const SURVEY_SECTIONS: SurveySection[] = [
  {
    id: "sec_1",
    code: "23.28.01.1.08.02",
    title: "Penyediaan Jasa Komunikasi, Sumber Daya Air dan Listrik",
    shortTitle: "Komunikasi, Air & Listrik (TALI)",
    icon: "zap",
    questions: [
      { id: "q1", num: 1, text: "Kecukupan kebutuhan penerangan ditiap bulan lingkup TMR" },
      { id: "q2", num: 2, text: "Kecepatan dan ketepatan dalam proses pembayaran tagihan TALI setiap bulan" },
      { id: "q3", num: 3, text: "Kemudahan dalam mendapatkan Akses TALI" },
      { id: "q4", num: 4, text: "Kesigapan petugas dalam melayani pengaduan" },
      { id: "q5", num: 5, text: "Kualitas Penyediaan Jasa Komunikasi, Sumber Daya Air dan Listrik sudah sesuai dengan yang di harapkan" }
    ]
  },
  {
    id: "sec_2",
    code: "3.28.01.1.06.07",
    title: "Penyediaan Bahan/Material",
    shortTitle: "Bahan/Material & BBM",
    icon: "fuel",
    questions: [
      { id: "q6", num: 6, text: "Kecukupan dalam mendapatkan Bahan bakar minyak disetiap unit kendaraan yang ada di TMR" },
      { id: "q7", num: 7, text: "Kecepatan dan ketepatan dalam proses pembayaran tagihan Bahan bakar minyak setiap bulan" },
      { id: "q8", num: 8, text: "Kemudahan dalam mendapatkan Akses Pengisian Bahan bakar minyak Kendaraan atau peralatan" },
      { id: "q9", num: 9, text: "Kualitas Penyediaan Bahan bakar minyak sudah sesuai dengan yang di harapkan" },
      { id: "q10", num: 10, text: "Ketepatan waktu pengadaan Bahan bakar minyak" }
    ]
  },
  {
    id: "sec_3",
    code: "3.28.01.1.09.0002",
    title: "Penyediaan Jasa Pemeliharaan Biaya Pemeliharaan, Pajak dan Perizinan Kendaraan Dinas Operasional atau Lapangan",
    shortTitle: "Pemeliharaan & Pajak Kendaraan",
    icon: "truck",
    questions: [
      { id: "q11", num: 11, text: "Kecukupan atau pemanfaatan setiap Unit Kendaraan Operasional yang dimiliki UP Taman Margasatwa Ragunan" },
      { id: "q12", num: 12, text: "Ketepatan proses pembayaran tagihan pajak kendaraan dinas operasional di Taman Margasatwa Ragunan" },
      { id: "q13", num: 13, text: "Kemudahan dalam melakukan aktivitas dengan menggunakan kendaraan dinas roda dua maupun roda empat" },
      { id: "q14", num: 14, text: "Kesesuaian pemanfaatan aset khususnya kendaraan dinas yang dimiliki Taman Margasatwa Ragunan" },
      { id: "q15", num: 15, text: "Peningkatan efektivitas dan efisiensi biaya operasional kendaraan dalam pelaksanaan pemeliharaan berkala" }
    ]
  },
  {
    id: "sec_4",
    code: "3.28.01.1.10.0001",
    title: "Pelayanan dan Penunjang Pelayanan BLUD",
    shortTitle: "Pelayanan & Penunjang BLUD",
    icon: "building-2",
    questions: [
      { id: "q16", num: 16, text: "Kemampuan petugas dalam melaksanakan atau memberikan pelayanan kedinasan" },
      { id: "q17", num: 17, text: "Kemudahan prosedur dalam perencanaan anggaran BLUD" },
      { id: "q18", num: 18, text: "Fleksibilitas dalam pola pengelolaan keuangan BLUD" },
      { id: "q19", num: 19, text: "Kualitas sarana dan prasarana dalam penunjang pelayanan" },
      { id: "q20", num: 20, text: "Penyelenggaraan fungsi organisasi dalam rangka pemberian layanan yang bermutu, berkesinambungan dan berdaya saing" }
    ]
  }
];

export const ALL_QUESTIONS = SURVEY_SECTIONS.flatMap(sec =>
  sec.questions.map(q => ({
    ...q,
    sectionId: sec.id,
    sectionTitle: sec.title,
    sectionShortTitle: sec.shortTitle
  }))
);

export function calculateMetrics(
  responses: SurveyResponse[],
  customSections?: SurveySection[]
): DashboardMetrics {
  const activeSections = customSections && customSections.length > 0 ? customSections : SURVEY_SECTIONS;
  const activeQuestions = activeSections.flatMap((sec) =>
    sec.questions.map((q) => ({
      ...q,
      sectionId: sec.id,
      sectionCode: sec.code,
      sectionTitle: sec.title,
      sectionShortTitle: sec.shortTitle,
    }))
  );

  const total = responses.length;
  if (total === 0) {
    return {
      totalResponses: 0,
      averageScale4: 0,
      ikmFinal: 0,
      mutu: {
        predikat: "D",
        label: "TIDAK BAIK",
        cssClass: "predikat-d",
        description: "Belum ada responden yang mengisi survei."
      },
      satisfactionPct: 0,
      bestDim: null,
      lowestDim: null,
      dimScores: activeSections.map(sec => ({
        sec,
        avg: 0,
        ikm: 0,
        nrrWeighted: 0
      })),
      questionStats: activeQuestions.map(q => ({
        id: q.id,
        num: q.num,
        text: q.text,
        sectionShortTitle: q.sectionShortTitle,
        avg: 0,
        ikm: 0,
        counts: { 1: 0, 2: 0, 3: 0, 4: 0 }
      })),
      ratingDistribution: { sts: 0, ts: 0, s: 0, ss: 0 }
    };
  }

  let grandTotal = 0;
  let totalScoreCount = 0;
  let satisfiedCount = 0;

  const ratingDistribution = { sts: 0, ts: 0, s: 0, ss: 0 };
  const questionMap: Record<string, { sum: number; count: number; counts: Record<number, number> }> = {};

  activeQuestions.forEach(q => {
    questionMap[q.id] = { sum: 0, count: 0, counts: { 1: 0, 2: 0, 3: 0, 4: 0 } };
  });

  responses.forEach(r => {
    activeQuestions.forEach(q => {
      const val = Number(r.answers?.[q.id]);
      if (!isNaN(val) && val >= 1 && val <= 4) {
        grandTotal += val;
        totalScoreCount++;
        questionMap[q.id].sum += val;
        questionMap[q.id].count++;
        questionMap[q.id].counts[val] = (questionMap[q.id].counts[val] || 0) + 1;

        if (val === 1) ratingDistribution.sts++;
        else if (val === 2) ratingDistribution.ts++;
        else if (val === 3) ratingDistribution.s++;
        else if (val === 4) ratingDistribution.ss++;

        if (val >= 3) satisfiedCount++;
      }
    });
  });

  const averageScale4 = totalScoreCount > 0 ? grandTotal / totalScoreCount : 0;
  // PermenPAN-RB No 14/2017: IKM = NRR x 25
  const ikmFinal = averageScale4 * 25;

  let mutu: DashboardMetrics["mutu"] = {
    predikat: "A",
    label: "SANGAT BAIK",
    cssClass: "predikat-a",
    description: "Kinerja pelayanan unit sangat memuaskan dan melampaui standar PermenPAN-RB."
  };

  if (ikmFinal >= 88.31) {
    mutu = {
      predikat: "A",
      label: "SANGAT BAIK",
      cssClass: "predikat-a",
      description: "Kinerja pelayanan unit sangat memuaskan dan melampaui standar PermenPAN-RB."
    };
  } else if (ikmFinal >= 76.61) {
    mutu = {
      predikat: "B",
      label: "BAIK",
      cssClass: "predikat-b",
      description: "Kinerja pelayanan memenuhi standar dan harapan pegawai secara baik."
    };
  } else if (ikmFinal >= 65.0) {
    mutu = {
      predikat: "C",
      label: "KURANG BAIK",
      cssClass: "predikat-c",
      description: "Terdapat beberapa dimensi pelayanan yang memerlukan perbaikan dan tindak lanjut."
    };
  } else {
    mutu = {
      predikat: "D",
      label: "TIDAK BAIK",
      cssClass: "predikat-d",
      description: "Kinerja pelayanan perlu evaluasi menyeluruh dan restrukturisasi operasional."
    };
  }

  const satisfactionPct = totalScoreCount > 0 ? Number(((satisfiedCount / totalScoreCount) * 100).toFixed(1)) : 0;

  const dimScores: DimensionScore[] = activeSections.map(sec => {
    let sum = 0;
    let count = 0;
    responses.forEach(r => {
      sec.questions.forEach(q => {
        const val = Number(r.answers?.[q.id]);
        if (val) {
          sum += val;
          count++;
        }
      });
    });
    const avg = count > 0 ? sum / count : 0;
    return {
      sec,
      avg: Number(avg.toFixed(2)),
      ikm: Number((avg * 25).toFixed(1)),
      nrrWeighted: Number(avg.toFixed(2))
    };
  });

  const sortedDims = [...dimScores].sort((a, b) => b.avg - a.avg);
  const bestDim = sortedDims[0] || null;
  const lowestDim = sortedDims[sortedDims.length - 1] || null;

  const questionStats: QuestionStat[] = activeQuestions.map(q => {
    const qData = questionMap[q.id];
    const avg = qData.count > 0 ? qData.sum / qData.count : 0;
    return {
      id: q.id,
      num: q.num,
      text: q.text,
      sectionShortTitle: q.sectionShortTitle,
      avg: Number(avg.toFixed(2)),
      ikm: Number((avg * 25).toFixed(1)),
      counts: qData.counts
    };
  });

  return {
    totalResponses: total,
    averageScale4: Number(averageScale4.toFixed(2)),
    ikmFinal: Number(ikmFinal.toFixed(1)),
    mutu,
    satisfactionPct,
    bestDim,
    lowestDim,
    dimScores,
    questionStats,
    ratingDistribution
  };
}
