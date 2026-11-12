# Aplikasi Survei Indeks Kepuasan Layanan (IKL)
## Unit Pengelola Taman Margasatwa Ragunan
### Dinas Pertamanan dan Hutan Kota Provinsi DKI Jakarta

Aplikasi web modern berbasis standar e-Government Provinsi DKI Jakarta untuk pengukuran, pengolahan, dan pelaporan **Indeks Kepuasan Layanan (IKL)** Program Penunjang Urusan Pemerintahan Daerah Provinsi.

---

## 🏛️ Fitur Utama

1. **Formulir Kuesioner Interaktif & Responsif (Sisi Responden)**
   - Desain terstandardisasi mengikuti format resmi kuesioner UP TMR.
   - Penomoran 20 butir pertanyaan terbagi dalam 4 seksi program penunjang urusan pemerintahan daerah.
   - Validasi data responden (Nama, NIP, Jabatan).
   - Skala Likert 4 tingkat (Sangat Tidak Setuju, Tidak Setuju, Setuju, Sangat Setuju).
   - Tampilan adaptif mobile-first untuk semua jenis perangkat (Mobile Android/iOS, Tablet, Laptop, dan Desktop).

2. **Dashboard Eksekutif & Analitik (Sisi Administrator)**
   - Ringkasan statistik responden, Nilai Rata-rata per Kategori (NRR), dan Indeks Kepuasan Layanan (IKL).
   - Konversi mutu pelayanan (A = Sangat Baik, B = Baik, C = Kurang Baik, D = Tidak Baik).
   - Distribusi jabatan, filter pencarian, dan visualisasi saran/masukan responden.

3. **Format Rekapitulasi Resmi Sesuai Standar Dinas**
   - Tampilan matriks tabel rekapitulasi data responden 1-ke-1 sesuai template Excel/Spreadsheet resmi UP TMR.
   - Perhitungan otomatis: Jumlah Nilai Per Unsur, Nilai Rata-Rata (NRR), NRR Tertimbang (x 0,05), IKM / IKL (skala 25 - 100), dan Mutu Pelayanan.
   - Kolom legalitas tanda tangan cetak/digital resmi pejabat struktural terkait.

4. **Ekspor & Pelaporan Lengkap**
   - Cetak Laporan Resmi ber-KOP Surat Dinas DKI Jakarta siap cetak PDF / A4.
   - Ekspor data mentah dan format rekap resmi ke format Microsoft Excel (.xlsx) dengan formula styling profesional (ExcelJS).

5. **Manajemen Periode & Konfigurasi**
   - Pemilihan Tahun Anggaran dan Triwulan (I, II, III, IV) secara dinamis.
   - Pengaturan butir pertanyaan dan kategori layanan secara mandiri.

---

## 🛠️ Arsitektur Teknologi

- **Framework**: Next.js 16 (App Router, Turbopack) & React 19
- **Styling**: Tailwind CSS & Lucide Icons
- **Language**: TypeScript
- **Database**: Dual Architecture:
  - **Primary**: PostgreSQL (Neon Serverless, Supabase, Railway, atau Local Docker)
  - **Failover / Offline**: Structured JSON storage (`data/responses.json` & `data/survey_config.json`)
- **Excel Processing**: ExcelJS

---

## 💾 Struktur & Skema Database

Skema SQL dan data awal (seed) tersedia di folder `database/`:
- `database/schema.sql` : Definisi DDL tabel `responses`, `survey_config`, index performa, dan constraints.
- `database/seed.sql` : Data inisialisasi 33 responden sampel dan konfigurasi kuesioner.

### Import Cepat ke Cloud PostgreSQL (Neon / Supabase / Railway):
1. Buka SQL Editor di console database cloud Anda.
2. Salin dan jalankan isi `database/schema.sql`.
3. Salin dan jalankan isi `database/seed.sql`.

---

## 🚀 Panduan Menjalankan & Deploy

### 1. Prasyarat
- Node.js versi 18.x / 20.x ke atas
- npm, yarn, atau pnpm
- Akun Git / GitHub untuk deployment

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Lingkungan (.env.local)
Salin contoh berkas konfigurasi:
```bash
cp .env.example .env.local
```
Isi variabel `DATABASE_URL` dengan string koneksi PostgreSQL Anda:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
```
*(Catatan: Jika `DATABASE_URL` tidak diisi, aplikasi otomatis berjalan dalam mode fallback offline menggunakan `data/responses.json` tanpa error).*

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Akses di peramban:
- **Kuesioner Responden**: [http://localhost:3000](http://localhost:3000)
- **Dashboard Admin**: [http://localhost:3000/admin](http://localhost:3000/admin)

### 5. Build Versi Produksi
```bash
npm run build
npm run start
```

---

## 🌐 Panduan Deploy ke Vercel / Netlify (Gratis & Mudah)

1. **Push repository ini ke GitHub**.
2. Buka [Vercel](https://vercel.com) atau [Netlify](https://netlify.com) dan login dengan akun GitHub Anda.
3. Klik **"Add New Project"** / **"Import Project"**, lalu pilih repository ini.
4. Pada bagian **Environment Variables**, tambahkan:
   - `DATABASE_URL` : *(Connection string dari Neon.tech / Supabase)*
5. Klik **Deploy**. Website akan langsung aktif dalam ~1 menit dan memiliki domain HTTPS publik gratis!
