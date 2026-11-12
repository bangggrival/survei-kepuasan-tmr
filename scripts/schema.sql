-- =============================================================================
-- Skema Database PostgreSQL untuk Survei Kepuasan Layanan & Executive Dashboard
-- Unit Pengelola Taman Margasatwa Ragunan - Dinas Pertamanan & Hutan Kota DKI Jakarta
-- Standar PermenPAN-RB No. 14 / 2017
-- =============================================================================

-- 1. Buat Tabel responses
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

-- 2. Index untuk akselerasi query analitik dan filter
CREATE INDEX IF NOT EXISTS idx_responses_jabatan ON responses(jabatan);
CREATE INDEX IF NOT EXISTS idx_responses_created_at ON responses(created_at DESC);

-- 3. Komentar Kolom untuk Dokumentasi Tata Kelola Data
COMMENT ON TABLE responses IS 'Tabel rekapitulasi data responden survei indeks kepuasan layanan UP TMR';
COMMENT ON COLUMN responses.id IS 'Nomor unik id responden (e.g. RESP-001)';
COMMENT ON COLUMN responses.nama IS 'Nama lengkap responden pegawai';
COMMENT ON COLUMN responses.nip IS 'NIP atau NRK responden';
COMMENT ON COLUMN responses.jabatan IS 'Kategori jabatan responden (Administrator, Pengawas, Pelaksana, Fungsional)';
COMMENT ON COLUMN responses.saran IS 'Saran masukan perbaikan layanan penunjang urusan pemerintahan';
COMMENT ON COLUMN responses.answers IS 'JSON object nilai 20 indikator kuesioner (q1 sampai q20 skala 1-4)';
