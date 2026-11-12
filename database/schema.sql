-- =============================================================================
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
