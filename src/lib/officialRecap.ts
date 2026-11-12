import { SURVEY_SECTIONS, SurveyResponse, SurveySection } from "./constants";
import { getCurrentPeriodInfo } from "./periodUtils";

export interface QuestionRecapRow {
  letter: string;
  num: number;
  text: string;
  counts: { 1: number; 2: number; 3: number; 4: number };
  totalResponden: number;
  weighted: { 1: number; 2: number; 3: number; 4: number };
  totalNilaiBobot: number;
  nrr: number; // e.g. 3.95
}

export interface SectionRecapGroup {
  num: number;
  id: string;
  code: string;
  title: string;
  shortTitle: string;
  rows: QuestionRecapRow[];
  hasilAkhirDimensi: number; // average of the 5 NRR rows
  ikmDimensi: number; // hasilAkhirDimensi * 25
  mutuPredikat: string; // e.g. "A" | "B" | "C" | "D"
  mutuLabel: string; // e.g. "Sangat Baik"
  skalaPembulatan: number; // e.g. 4
}

export interface OfficialRecapReport {
  title: string;
  subTitle: string;
  instansi: string;
  periode: string;
  totalRespondenGlobal: number;
  sections: SectionRecapGroup[];
  overallNRR: number; // average of all 4 dimensions
  overallIKM: number; // overallNRR * 25
  overallSkala: number; // rounded
  pejabatPengesah: {
    jabatan: string;
    instansi: string;
    nama: string;
    nip: string;
  };
  pejabatTataUsaha: {
    jabatan: string;
    instansi: string;
    nama: string;
    nip: string;
  };
}

const LETTERS = ["a", "b", "c", "d", "e"];

export function computeOfficialRecap(
  responses: SurveyResponse[],
  customSections?: SurveySection[],
  periodeLabel?: string
): OfficialRecapReport {
  const activeSections = customSections && customSections.length > 0 ? customSections : SURVEY_SECTIONS;
  const totalResp = responses.length;

  const sections: SectionRecapGroup[] = activeSections.map((sec, secIdx) => {
    const rows: QuestionRecapRow[] = sec.questions.map((q, qIdx) => {
      const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };

      responses.forEach((r) => {
        const val = Number(r.answers?.[q.id]);
        if (val >= 1 && val <= 4) {
          counts[val as 1 | 2 | 3 | 4]++;
        }
      });

      const totalResponden = counts[1] + counts[2] + counts[3] + counts[4];

      const weighted = {
        1: counts[1] * 1,
        2: counts[2] * 2,
        3: counts[3] * 3,
        4: counts[4] * 4,
      };

      const totalNilaiBobot = weighted[1] + weighted[2] + weighted[3] + weighted[4];
      const nrr = totalResponden > 0 ? Number((totalNilaiBobot / totalResponden).toFixed(2)) : 0;

      return {
        letter: LETTERS[qIdx] || `${qIdx + 1}`,
        num: q.num,
        text: q.text,
        counts,
        totalResponden,
        weighted,
        totalNilaiBobot,
        nrr,
      };
    });

    const sumNRR = rows.reduce((acc, r) => acc + r.nrr, 0);
    const hasilAkhirDimensi = rows.length > 0 ? Number((sumNRR / rows.length).toFixed(2)) : 0;
    const skalaPembulatan = Math.round(hasilAkhirDimensi);
    const ikmDimensi = Number((hasilAkhirDimensi * 25).toFixed(1));
    const mutuPredikat = ikmDimensi >= 88.31 ? "A" : ikmDimensi >= 76.61 ? "B" : ikmDimensi >= 65.0 ? "C" : "D";
    const mutuLabel = ikmDimensi >= 88.31 ? "Sangat Baik" : ikmDimensi >= 76.61 ? "Baik" : ikmDimensi >= 65.0 ? "Kurang Baik" : "Tidak Baik";

    return {
      num: secIdx + 1,
      id: sec.id,
      code: sec.code,
      title: sec.title,
      shortTitle: sec.shortTitle || sec.title,
      rows,
      hasilAkhirDimensi,
      ikmDimensi,
      mutuPredikat,
      mutuLabel,
      skalaPembulatan,
    };
  });

  const sumDim = sections.reduce((acc, s) => acc + s.hasilAkhirDimensi, 0);
  const overallNRR = sections.length > 0 ? Number((sumDim / sections.length).toFixed(2)) : 0;
  const overallIKM = Number((overallNRR * 25).toFixed(1));
  const overallSkala = Math.round(overallNRR);

  const activePeriod = getCurrentPeriodInfo();
  const qLabel = periodeLabel ? periodeLabel.toUpperCase() : `TRIWULAN ${activePeriod.quarterRoman}`;
  return {
    title: `REKAP PENILAIAN KUISIONER ${qLabel.includes("TRIWULAN") ? qLabel : `TRIWULAN ${activePeriod.quarterRoman}`}`,
    subTitle: `PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH PROVINSI TAHUN ANGGARAN ${activePeriod.year}`,
    instansi: "DINAS PERTAMANAN DAN HUTAN KOTA PROVINSI DKI JAKARTA",
    periode: `TAHUN ANGGARAN ${activePeriod.year}`,
    totalRespondenGlobal: totalResp,
    sections,
    overallNRR,
    overallIKM,
    overallSkala,
    pejabatPengesah: {
      jabatan: "Kepala Unit Pengelola",
      instansi: "Taman Margasatwa Ragunan\nDinas Pertamanan dan Hutan Kota\nProvinsi DKI Jakarta",
      nama: "(Nama Pejabat Pengesah)",
      nip: "19xxxxxxxxxxxxxxxx",
    },
    pejabatTataUsaha: {
      jabatan: "Ka. Sub Bagian Tata Usaha Unit Pengelola",
      instansi: "Taman Margasatwa Ragunan\nDinas Pertamanan dan Hutan Kota\nProvinsi DKI Jakarta",
      nama: "(Nama Ka. Sub Bagian Tata Usaha)",
      nip: "19xxxxxxxxxxxxxxxx",
    },
  };
}
