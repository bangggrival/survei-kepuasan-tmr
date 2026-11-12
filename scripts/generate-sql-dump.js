const fs = require('fs');
const path = require('path');

const responsesPath = path.join(__dirname, '..', 'data', 'responses.json');
const configPath = path.join(__dirname, '..', 'data', 'survey_config.json');
const dbDir = path.join(__dirname, '..', 'database');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 1. Generate database/schema.sql
const schemaSql = `-- =============================================================================
-- Skema Database PostgreSQL: Survei Kepuasan Layanan UP TMR
-- Sistem Informasi Indeks Kepuasan Layanan Internal
-- Dinas Pertamanan dan Hutan Kota Provinsi DKI Jakarta
-- =============================================================================

-- Pastikan ekstensi UUID dan JSONB tersedia (standar PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabel Konfigurasi Kuesioner (Seksi & Butir Pertanyaan)
CREATE TABLE IF NOT EXISTS survey_config (
  id VARCHAR(50) PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabel Respon Survei Pegawai
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

-- Indexing untuk query analitik, pencarian, dan filter cepat
CREATE INDEX IF NOT EXISTS idx_responses_jabatan ON responses(jabatan);
CREATE INDEX IF NOT EXISTS idx_responses_nip ON responses(nip);
CREATE INDEX IF NOT EXISTS idx_responses_nama ON responses(nama);
CREATE INDEX IF NOT EXISTS idx_responses_timestamp ON responses(timestamp);
CREATE INDEX IF NOT EXISTS idx_responses_nip_timestamp ON responses(nip, timestamp);
CREATE INDEX IF NOT EXISTS idx_responses_created_at ON responses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_responses_answers_gin ON responses USING gin (answers);

COMMENT ON TABLE responses IS 'Tabel pencatatan respon kuesioner kepuasan pegawai UP TMR';
COMMENT ON TABLE survey_config IS 'Tabel konfigurasi butir pertanyaan dan seksi kuesioner dinamis';
`;

fs.writeFileSync(path.join(dbDir, 'schema.sql'), schemaSql, 'utf-8');
console.log('✓ schema.sql berhasil dibuat di folder database/');

// 2. Generate database/seed.sql
const responses = JSON.parse(fs.readFileSync(responsesPath, 'utf-8'));
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

let seedSql = `-- =============================================================================
-- Seed Data PostgreSQL: Survei Kepuasan Layanan UP TMR
-- Data Master Responden (33 Responden Sampel Bersih/Fiktif) & Konfigurasi Kuesioner
-- =============================================================================

BEGIN;

-- 1. Seed Konfigurasi Seksi & Pertanyaan
INSERT INTO survey_config (id, data, updated_at)
VALUES (
  'active_sections',
  '${JSON.stringify(config).replace(/'/g, "''")}'::jsonb,
  NOW()
)
ON CONFLICT (id) DO UPDATE 
SET data = EXCLUDED.data, updated_at = NOW();

-- 2. Seed Respon Survei (${responses.length} Record)
`;

for (const resp of responses) {
  const id = resp.id.replace(/'/g, "''");
  const timestamp = resp.timestamp;
  const nama = resp.nama.replace(/'/g, "''");
  const nip = resp.nip.replace(/'/g, "''");
  const jabatan = resp.jabatan.replace(/'/g, "''");
  const saran = (resp.saran || '').replace(/'/g, "''");
  const answers = JSON.stringify(resp.answers || {}).replace(/'/g, "''");

  seedSql += `INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('${id}', '${timestamp}', '${nama}', '${nip}', '${jabatan}', '${saran}', '${answers}'::jsonb, '${timestamp}')
ON CONFLICT (id) DO NOTHING;
`;
}

seedSql += `
COMMIT;

-- Verifikasi jumlah data
SELECT count(*) AS total_responses FROM responses;
`;

fs.writeFileSync(path.join(dbDir, 'seed.sql'), seedSql, 'utf-8');
console.log(`✓ seed.sql berhasil dibuat di folder database/ (${responses.length} record)`);
