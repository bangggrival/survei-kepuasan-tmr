import { Pool } from "pg";
import { SurveyResponse, SurveySection, SURVEY_SECTIONS } from "./constants";
import { getCurrentPeriodInfo } from "./periodUtils";
import fs from "fs";
import path from "path";

// In-memory or file-backed fallback storage
const FALLBACK_FILE_PATH = path.join(process.cwd(), "data", "responses.json");
const CONFIG_FILE_PATH = path.join(process.cwd(), "data", "survey_config.json");

let memoryResponses: SurveyResponse[] = [];
let memorySurveyConfig: SurveySection[] | null = null;

// Ensure fallback file exists or can be read
function loadFallbackResponses(): SurveyResponse[] {
  try {
    if (fs.existsSync(FALLBACK_FILE_PATH)) {
      const data = fs.readFileSync(FALLBACK_FILE_PATH, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryResponses = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Could not read fallback file, using memory storage:", err);
  }
  return memoryResponses;
}

function saveFallbackResponses(responses: SurveyResponse[]): void {
  memoryResponses = responses;
  try {
    const dir = path.dirname(FALLBACK_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(responses, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not persist to fallback file, kept in memory:", err);
  }
}

// PostgreSQL Pool instance (singleton in globalThis for Next.js hot-reload)
declare global {
  // eslint-disable-next-line no-var
  var __postgresPool: Pool | undefined;
}

let pool: Pool | null = null;
let isPostgresInitialized = false;

export function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL;
}

export function getPgPool(): Pool | null {
  const dbUrl = getDatabaseUrl();
  if (!dbUrl) {
    return null;
  }

  if (!global.__postgresPool) {
    global.__postgresPool = new Pool({
      connectionString: dbUrl,
      ssl:
        dbUrl.includes("sslmode=require") ||
        dbUrl.includes("neon.tech") ||
        dbUrl.includes("supabase.co") ||
        dbUrl.includes("supabase.com") ||
        dbUrl.includes("pooler.supabase")
          ? { rejectUnauthorized: false }
          : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000,
    });
  }
  pool = global.__postgresPool;
  return pool;
}

/**
 * Initialize PostgreSQL Schema
 */
export async function initPostgresSchema(): Promise<boolean> {
  const p = getPgPool();
  if (!p) return false;

  try {
    const client = await p.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS responses (
          id VARCHAR(50) PRIMARY KEY,
          timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          nama VARCHAR(150) NOT NULL,
          nip VARCHAR(50) NOT NULL,
          jabatan VARCHAR(100) NOT NULL,
          saran TEXT,
          answers JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS survey_config (
          id VARCHAR(50) PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_responses_jabatan ON responses(jabatan);
        CREATE INDEX IF NOT EXISTS idx_responses_nip ON responses(nip);
        CREATE INDEX IF NOT EXISTS idx_responses_nama ON responses(nama);
        CREATE INDEX IF NOT EXISTS idx_responses_timestamp ON responses(timestamp);
        CREATE INDEX IF NOT EXISTS idx_responses_nip_timestamp ON responses(nip, timestamp);
        CREATE INDEX IF NOT EXISTS idx_responses_created_at ON responses(created_at DESC);
      `);

      // Seed survey_config if empty
      const checkConfig = await client.query(`SELECT COUNT(*) FROM survey_config WHERE id = 'active_sections'`);
      if (parseInt(checkConfig.rows[0].count, 10) === 0) {
        await client.query(
          `INSERT INTO survey_config (id, data) VALUES ('active_sections', $1) ON CONFLICT (id) DO NOTHING`,
          [JSON.stringify(SURVEY_SECTIONS)]
        );
      }

      isPostgresInitialized = true;
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("PostgreSQL initialization error:", err);
    return false;
  }
}

/**
 * Check DB Status for Health Badge
 */
export async function getDbStatus(): Promise<{
  connected: boolean;
  provider: "postgresql" | "fallback";
  databaseUrlConfigured: boolean;
  totalRecords: number;
  message: string;
  host?: string;
  error?: string;
}> {
  const dbUrl = getDatabaseUrl();
  const isConfigured = Boolean(dbUrl);

  if (!isConfigured) {
    const fallbackList = loadFallbackResponses();
    return {
      connected: false,
      provider: "fallback",
      databaseUrlConfigured: false,
      totalRecords: fallbackList.length,
      message: "DATABASE_URL belum dikonfigurasi. Menggunakan penyimpanan lokal sementara.",
    };
  }

  const p = getPgPool();
  if (!p) {
    const fallbackList = loadFallbackResponses();
    return {
      connected: false,
      provider: "fallback",
      databaseUrlConfigured: true,
      totalRecords: fallbackList.length,
      message: "Gagal membuat pool PostgreSQL.",
    };
  }

  try {
    if (!isPostgresInitialized) {
      await initPostgresSchema();
    }
    const client = await p.connect();
    try {
      const res = await client.query("SELECT COUNT(*) as count, current_database() as dbname, version() as ver FROM responses");
      const count = parseInt(res.rows[0].count, 10);
      return {
        connected: true,
        provider: "postgresql",
        databaseUrlConfigured: true,
        totalRecords: count,
        message: `Terhubung ke PostgreSQL Database Produksi: ${res.rows[0].dbname}`,
        host: dbUrl ? dbUrl.split("@")[1]?.split("/")[0] : undefined,
      };
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const fallbackList = loadFallbackResponses();
    return {
      connected: false,
      provider: "fallback",
      databaseUrlConfigured: true,
      totalRecords: fallbackList.length,
      message: "Koneksi ke PostgreSQL terputus. Menggunakan failover lokal.",
      error: errorMsg,
    };
  }
}

/**
 * Get all responses
 */
export async function getAllResponses(options?: {
  jabatan?: string;
  search?: string;
}): Promise<SurveyResponse[]> {
  const p = getPgPool();
  const dbUrl = getDatabaseUrl();

  if (p && dbUrl) {
    try {
      if (!isPostgresInitialized) {
        await initPostgresSchema();
      }
      const client = await p.connect();
      try {
        let query = "SELECT id, timestamp, nama, nip, jabatan, saran, answers, created_at FROM responses WHERE 1=1";
        const params: (string | number)[] = [];

        if (options?.jabatan && options.jabatan !== "all") {
          params.push(options.jabatan);
          query += ` AND jabatan = $${params.length}`;
        }

        if (options?.search && options.search.trim()) {
          params.push(`%${options.search.trim().toLowerCase()}%`);
          const idx = params.length;
          query += ` AND (LOWER(nama) LIKE $${idx} OR LOWER(nip) LIKE $${idx} OR LOWER(saran) LIKE $${idx})`;
        }

        query += " ORDER BY timestamp DESC, created_at DESC";

        const res = await client.query(query, params);
        return res.rows.map(row => ({
          id: row.id,
          timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : String(row.timestamp),
          nama: row.nama,
          nip: row.nip,
          jabatan: row.jabatan,
          saran: row.saran || "",
          answers: typeof row.answers === "string" ? JSON.parse(row.answers) : row.answers,
          createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
        }));
      } finally {
        client.release();
      }
    } catch (err) {
      console.error("PostgreSQL query error, falling back to memory:", err);
    }
  }

  // Fallback storage
  let items = loadFallbackResponses();
  if (options?.jabatan && options.jabatan !== "all") {
    items = items.filter(r => r.jabatan === options.jabatan);
  }
  if (options?.search && options.search.trim()) {
    const s = options.search.trim().toLowerCase();
    items = items.filter(
      r =>
        r.nama.toLowerCase().includes(s) ||
        r.nip.toLowerCase().includes(s) ||
        (r.saran && r.saran.toLowerCase().includes(s))
    );
  }
  return items;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchType?: "exact_nama_and_nip" | "nip_matched";
  existing?: SurveyResponse;
  periodLabel: string;
  quarterLabel: string;
  quarterRoman: string;
  year: number;
  message?: string;
}

/**
 * Validasi Pencegahan Pengisian Ganda (Zero Duplicate Submissions)
 * Sesuai Standar Birokrasi:
 * 1. Ruang Lingkup Periode: Opsi A (1 kali per Triwulan / Tahun Anggaran Berjalan)
 * 2. Kunci Identitas Penentu: Mencakup Nama Lengkap + NIP / NRK Pegawai
 */
export async function findDuplicateResponse(
  nip: string,
  nama?: string,
  targetDate: Date = new Date()
): Promise<DuplicateCheckResult> {
  const cleanNip = nip ? nip.trim() : "";
  const cleanNama = nama ? nama.trim() : "";
  const periodInfo = getCurrentPeriodInfo(targetDate);
  const startIso = `${periodInfo.startDate}T00:00:00.000Z`;
  const endIso = `${periodInfo.endDate}T23:59:59.999Z`;

  const emptyResult: DuplicateCheckResult = {
    isDuplicate: false,
    periodLabel: periodInfo.fullPeriodLabel,
    quarterLabel: periodInfo.quarterLabel,
    quarterRoman: periodInfo.quarterRoman,
    year: periodInfo.year,
  };

  if (!cleanNip) return emptyResult;

  const p = getPgPool();
  const dbUrl = getDatabaseUrl();

  if (p && dbUrl) {
    try {
      if (!isPostgresInitialized) {
        await initPostgresSchema();
      }
      const client = await p.connect();
      try {
        const res = await client.query(
          `SELECT id, timestamp, nama, nip, jabatan, saran, answers, created_at
           FROM responses
           WHERE timestamp >= $1::timestamptz 
             AND timestamp <= $2::timestamptz
             AND (
               LOWER(TRIM(nip)) = LOWER(TRIM($3))
               OR ($4 <> '' AND LOWER(TRIM(nama)) = LOWER(TRIM($4)) AND LOWER(TRIM(nip)) = LOWER(TRIM($3)))
             )
           ORDER BY created_at DESC LIMIT 1`,
          [startIso, endIso, cleanNip, cleanNama]
        );

        if (res.rows.length > 0) {
          const row = res.rows[0];
          const existing: SurveyResponse = {
            id: row.id,
            timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : String(row.timestamp),
            nama: row.nama,
            nip: row.nip,
            jabatan: row.jabatan,
            saran: row.saran || "",
            answers: typeof row.answers === "string" ? JSON.parse(row.answers) : row.answers,
            createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
          };

          const submitDate = new Date(existing.timestamp).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          const isSameNama = cleanNama && existing.nama.trim().toLowerCase() === cleanNama.toLowerCase();
          const matchType: "exact_nama_and_nip" | "nip_matched" = isSameNama
            ? "exact_nama_and_nip"
            : "nip_matched";

          let message = "";
          if (isSameNama) {
            message = `Pegawai atas nama "${existing.nama}" (NIP/NRK: ${existing.nip}) telah terdaftar mengisi kuesioner pada ${periodInfo.quarterLabel} TA ${periodInfo.year} (No. Registrasi: ${existing.id}, tercatat pada ${submitDate}). Setiap pegawai hanya dapat berpartisipasi 1 (satu) kali per triwulan.`;
          } else {
            message = `NIP/NRK "${cleanNip}" telah terdaftar atas nama "${existing.nama}" pada ${periodInfo.quarterLabel} TA ${periodInfo.year} (No. Registrasi: ${existing.id}, tercatat ${submitDate}). Setiap pegawai hanya dapat berpartisipasi 1 (satu) kali per triwulan.`;
          }

          return {
            isDuplicate: true,
            matchType,
            existing,
            periodLabel: periodInfo.fullPeriodLabel,
            quarterLabel: periodInfo.quarterLabel,
            quarterRoman: periodInfo.quarterRoman,
            year: periodInfo.year,
            message,
          };
        }
        return emptyResult;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error("PostgreSQL findDuplicateResponse error, checking fallback:", err);
    }
  }

  // Fallback storage check (File JSON / Memory)
  const fallback = loadFallbackResponses();
  const startTime = new Date(startIso).getTime();
  const endTime = new Date(endIso).getTime();

  const matched = fallback.find((r) => {
    const t = new Date(r.timestamp).getTime();
    if (t < startTime || t > endTime) return false;
    const sameNip = r.nip.trim().toLowerCase() === cleanNip.toLowerCase();
    const sameNama = cleanNama && r.nama.trim().toLowerCase() === cleanNama.toLowerCase();
    return sameNip || (sameNama && sameNip);
  });

  if (matched) {
    const submitDate = new Date(matched.timestamp).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const isSameNama = cleanNama && matched.nama.trim().toLowerCase() === cleanNama.toLowerCase();
    const matchType: "exact_nama_and_nip" | "nip_matched" = isSameNama
      ? "exact_nama_and_nip"
      : "nip_matched";

    let message = "";
    if (isSameNama) {
      message = `Pegawai atas nama "${matched.nama}" (NIP/NRK: ${matched.nip}) telah terdaftar mengisi kuesioner pada ${periodInfo.quarterLabel} TA ${periodInfo.year} (No. Registrasi: ${matched.id}, tercatat pada ${submitDate}). Setiap pegawai hanya dapat berpartisipasi 1 (satu) kali per triwulan.`;
    } else {
      message = `NIP/NRK "${cleanNip}" telah terdaftar atas nama "${matched.nama}" pada ${periodInfo.quarterLabel} TA ${periodInfo.year} (No. Registrasi: ${matched.id}, tercatat ${submitDate}). Setiap pegawai hanya dapat berpartisipasi 1 (satu) kali per triwulan.`;
    }

    return {
      isDuplicate: true,
      matchType,
      existing: matched,
      periodLabel: periodInfo.fullPeriodLabel,
      quarterLabel: periodInfo.quarterLabel,
      quarterRoman: periodInfo.quarterRoman,
      year: periodInfo.year,
      message,
    };
  }

  return emptyResult;
}

/**
 * Find response by NIP/NRK (Backwards compatibility helper)
 */
export async function findResponseByNip(nip: string, nama?: string): Promise<SurveyResponse | null> {
  const result = await findDuplicateResponse(nip, nama);
  return result.isDuplicate && result.existing ? result.existing : null;
}

/**
 * Create a new response
 */
export async function createResponse(newResp: Omit<SurveyResponse, "id" | "timestamp">): Promise<SurveyResponse> {
  const p = getPgPool();
  const dbUrl = getDatabaseUrl();

  const currentList = await getAllResponses();
  const nextNum = currentList.length + 1;
  const id = `RESP-${String(nextNum).padStart(3, "0")}`;
  const timestamp = new Date().toISOString();

  const record: SurveyResponse = {
    id,
    timestamp,
    nama: newResp.nama,
    nip: newResp.nip,
    jabatan: newResp.jabatan,
    saran: newResp.saran || "",
    answers: newResp.answers,
  };

  if (p && dbUrl) {
    try {
      if (!isPostgresInitialized) {
        await initPostgresSchema();
      }
      const client = await p.connect();
      try {
        await client.query(
          `INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [record.id, record.timestamp, record.nama, record.nip, record.jabatan, record.saran, JSON.stringify(record.answers)]
        );
        return record;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error("PostgreSQL insert error, saving to fallback:", err);
    }
  }

  // Fallback store
  const fallbackList = loadFallbackResponses();
  const updated = [record, ...fallbackList];
  saveFallbackResponses(updated);
  return record;
}

/**
 * Delete a response
 */
export async function deleteResponse(id: string): Promise<boolean> {
  const p = getPgPool();
  const dbUrl = getDatabaseUrl();

  if (p && dbUrl) {
    try {
      const client = await p.connect();
      try {
        const res = await client.query("DELETE FROM responses WHERE id = $1", [id]);
        return (res.rowCount || 0) > 0;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error("PostgreSQL delete error:", err);
    }
  }

  const fallbackList = loadFallbackResponses();
  const updated = fallbackList.filter(r => r.id !== id);
  saveFallbackResponses(updated);
  return true;
}

/**
 * Clear all responses (wipe database responses table and fallback storage)
 */
export async function clearAllResponses(): Promise<boolean> {
  const p = getPgPool();
  const dbUrl = getDatabaseUrl();

  if (p && dbUrl) {
    try {
      if (!isPostgresInitialized) {
        await initPostgresSchema();
      }
      const client = await p.connect();
      try {
        await client.query("TRUNCATE TABLE responses");
      } finally {
        client.release();
      }
    } catch (err) {
      console.error("PostgreSQL truncate error:", err);
    }
  }

  saveFallbackResponses([]);
  memoryResponses = [];
  return true;
}

/**
 * Fallback helpers for Survey Config (Kode Program & Pertanyaan)
 */
export function loadFallbackSurveyConfig(): SurveySection[] {
  if (memorySurveyConfig && memorySurveyConfig.length > 0) {
    return memorySurveyConfig;
  }
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memorySurveyConfig = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Could not read fallback config file:", err);
  }
  memorySurveyConfig = SURVEY_SECTIONS;
  return SURVEY_SECTIONS;
}

export function saveFallbackSurveyConfig(sections: SurveySection[]): void {
  memorySurveyConfig = sections;
  try {
    const dir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(sections, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not persist to fallback config file:", err);
  }
}

/**
 * Get active survey sections & questions (PostgreSQL or fallback)
 */
export async function getSurveyConfig(): Promise<SurveySection[]> {
  const p = getPgPool();
  const dbUrl = getDatabaseUrl();

  if (p && dbUrl) {
    try {
      await initPostgresSchema();
      const client = await p.connect();
      try {
        const res = await client.query("SELECT data FROM survey_config WHERE id = 'active_sections'");
        if (res.rows.length > 0 && Array.isArray(res.rows[0].data)) {
          return res.rows[0].data as SurveySection[];
        }
      } finally {
        client.release();
      }
    } catch (err) {
      console.error("PostgreSQL getSurveyConfig error, using fallback:", err);
    }
  }

  return loadFallbackSurveyConfig();
}

/**
 * Save updated survey sections & questions
 */
export async function saveSurveyConfig(sections: SurveySection[]): Promise<boolean> {
  saveFallbackSurveyConfig(sections);

  const p = getPgPool();
  const dbUrl = getDatabaseUrl();

  if (p && dbUrl) {
    try {
      await initPostgresSchema();
      const client = await p.connect();
      try {
        await client.query(
          `INSERT INTO survey_config (id, data, updated_at)
           VALUES ('active_sections', $1, NOW())
           ON CONFLICT (id) DO UPDATE SET data = $1, updated_at = NOW()`,
          [JSON.stringify(sections)]
        );
        return true;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error("PostgreSQL saveSurveyConfig error:", err);
    }
  }

  return true;
}

/**
 * Reset survey sections & questions to standard defaults
 */
export async function resetSurveyConfig(): Promise<SurveySection[]> {
  await saveSurveyConfig(SURVEY_SECTIONS);
  return SURVEY_SECTIONS;
}
