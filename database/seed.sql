-- =============================================================================
-- Seed Data PostgreSQL: Survei Kepuasan Layanan UP TMR
-- Data Master Responden (33 Responden Sampel Bersih/Fiktif) & Konfigurasi Kuesioner
-- =============================================================================

BEGIN;

-- 1. Seed Konfigurasi Seksi & Pertanyaan
INSERT INTO survey_config (id, data, updated_at)
VALUES (
  'active_sections',
  '[{"id":"sec_1","code":"23.28.01.1.08.02","title":"Penyediaan Jasa Komunikasi, Sumber Daya Air dan Listrik","shortTitle":"Komunikasi, Air & Listrik (TALI)","icon":"zap","questions":[{"id":"q1","num":1,"text":"Kecukupan kebutuhan penerangan ditiap bulan lingkup TMR"},{"id":"q2","num":2,"text":"Kecepatan dan ketepatan dalam proses pembayaran tagihan TALI setiap bulan"},{"id":"q3","num":3,"text":"Kemudahan dalam mendapatkan Akses TALI"},{"id":"q4","num":4,"text":"Kesigapan petugas dalam melayani pengaduan"},{"id":"q5","num":5,"text":"Kualitas Penyediaan Jasa Komunikasi, Sumber Daya Air dan Listrik sudah sesuai dengan yang di harapkan"}]},{"id":"sec_2","code":"3.28.01.1.06.07","title":"Penyediaan Bahan/Material","shortTitle":"Bahan/Material & BBM","icon":"fuel","questions":[{"id":"q6","num":6,"text":"Kecukupan dalam mendapatkan Bahan bakar minyak disetiap unit kendaraan yang ada di TMR"},{"id":"q7","num":7,"text":"Kecepatan dan ketepatan dalam proses pembayaran tagihan Bahan bakar minyak setiap bulan"},{"id":"q8","num":8,"text":"Kemudahan dalam mendapatkan Akses Pengisian Bahan bakar minyak Kendaraan atau peralatan"},{"id":"q9","num":9,"text":"Kualitas Penyediaan Bahan bakar minyak sudah sesuai dengan yang di harapkan"},{"id":"q10","num":10,"text":"Ketepatan waktu pengadaan Bahan bakar minyak"}]},{"id":"sec_3","code":"3.28.01.1.09.0002","title":"Penyediaan Jasa Pemeliharaan Biaya Pemeliharaan, Pajak dan Perizinan Kendaraan Dinas Operasional atau Lapangan","shortTitle":"Pemeliharaan & Pajak Kendaraan","icon":"truck","questions":[{"id":"q11","num":11,"text":"Kecukupan atau pemanfaatan setiap Unit Kendaraan Operasional yang dimiliki UP Taman Margasatwa Ragunan"},{"id":"q12","num":12,"text":"Ketepatan proses pembayaran tagihan pajak kendaraan dinas operasional di Taman Margasatwa Ragunan"},{"id":"q13","num":13,"text":"Kemudahan dalam melakukan aktivitas dengan menggunakan kendaraan dinas roda dua maupun roda empat"},{"id":"q14","num":14,"text":"Kesesuaian pemanfaatan aset khususnya kendaraan dinas yang dimiliki Taman Margasatwa Ragunan"},{"id":"q15","num":15,"text":"Peningkatan efektivitas dan efisiensi biaya operasional kendaraan dalam pelaksanaan pemeliharaan berkala"}]},{"id":"sec_4","code":"3.28.01.1.10.0001","title":"Pelayanan dan Penunjang Pelayanan BLUD","shortTitle":"Pelayanan & Penunjang BLUD","icon":"building-2","questions":[{"id":"q16","num":16,"text":"Kemampuan petugas dalam melaksanakan atau memberikan pelayanan kedinasan"},{"id":"q17","num":17,"text":"Kemudahan prosedur dalam perencanaan anggaran BLUD"},{"id":"q18","num":18,"text":"Fleksibilitas dalam pola pengelolaan keuangan BLUD"},{"id":"q19","num":19,"text":"Kualitas sarana dan prasarana dalam penunjang pelayanan"},{"id":"q20","num":20,"text":"Penyelenggaraan fungsi organisasi dalam rangka pemberian layanan yang bermutu, berkesinambungan dan berdaya saing"}]}]'::jsonb,
  NOW()
)
ON CONFLICT (id) DO UPDATE 
SET data = EXCLUDED.data, updated_at = NOW();

-- 2. Seed Respon Survei (33 Record)
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-033', '2026-11-10T02:26:01.715Z', 'Andi Pratama', '198501012010011001', 'Jabatan Pelaksana', '', '{"q1":4,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":4,"q14":4,"q15":4,"q16":4,"q17":4,"q18":4,"q19":4,"q20":4}'::jsonb, '2026-11-10T02:26:01.715Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-032', '2026-11-10T02:26:01.688Z', 'Budi Santoso', '198602022011011002', 'Jabatan Pelaksana', '', '{"q1":4,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":4,"q14":4,"q15":4,"q16":4,"q17":4,"q18":4,"q19":4,"q20":4}'::jsonb, '2026-11-10T02:26:01.688Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-001', '2025-09-24T10:59:49Z', 'Citra Dewi Lestari', '198703032012012003', 'Jabatan Pelaksana', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":4,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":4,"q14":4,"q15":4,"q16":4,"q17":4,"q18":4,"q19":4,"q20":4}'::jsonb, '2025-09-24T10:59:49Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-002', '2025-09-24T11:00:26Z', 'Dimas Setiawan', '198804042013011004', 'Jabatan Pelaksana', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":4,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":4,"q14":4,"q15":4,"q16":4,"q17":4,"q18":4,"q19":4,"q20":4}'::jsonb, '2025-09-24T11:00:26Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-003', '2025-09-24T11:02:25Z', 'Eka Putri Handayani', '198905052014012005', 'Jabatan Pelaksana', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":4,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":4,"q14":4,"q15":4,"q16":4,"q17":4,"q18":4,"q19":4,"q20":4}'::jsonb, '2025-09-24T11:02:25Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-004', '2025-09-24T11:06:51Z', 'Fajar Nugraha', '199006062015011006', 'Jabatan Pelaksana', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":4,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":4,"q14":4,"q15":4,"q16":4,"q17":4,"q18":4,"q19":4,"q20":4}'::jsonb, '2025-09-24T11:06:51Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-005', '2025-09-24T11:07:03Z', 'Gita Permatasari', '199107072016012007', 'Pejabat Pengawas', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":4,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":4,"q14":4,"q15":4,"q16":4,"q17":4,"q18":4,"q19":4,"q20":4}'::jsonb, '2025-09-24T11:07:03Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-006', '2025-09-24T11:07:17Z', 'Hadi Wijaya', '199208082017011008', 'Jabatan Pelaksana', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":4,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":4,"q14":4,"q15":4,"q16":4,"q17":4,"q18":4,"q19":4,"q20":4}'::jsonb, '2025-09-24T11:07:17Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-007', '2025-09-24T11:08:32Z', 'Indah Kusuma', '199309092018012009', 'Jabatan Pelaksana', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":4,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":4,"q14":4,"q15":4,"q16":4,"q17":4,"q18":4,"q19":4,"q20":4}'::jsonb, '2025-09-24T11:08:32Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-008', '2025-09-24T11:12:52Z', 'Joko Prasetyo', '199410102019011010', 'Pejabat Pengawas', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":4,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":4,"q14":4,"q15":4,"q16":4,"q17":4,"q18":4,"q19":4,"q20":4}'::jsonb, '2025-09-24T11:12:52Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-009', '2025-09-24T11:14:39Z', 'Kartika Sari', '199511112020012011', 'Jabatan Fungsional', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":3,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":4,"q14":4,"q15":4,"q16":4,"q17":4,"q18":4,"q19":4,"q20":4}'::jsonb, '2025-09-24T11:14:39Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-010', '2025-09-24T11:14:49Z', 'Luki Hermawan', '198512122010011012', 'Jabatan Pelaksana', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":4,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":4,"q14":4,"q15":4,"q16":4,"q17":4,"q18":4,"q19":4,"q20":4}'::jsonb, '2025-09-24T11:14:49Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-011', '2025-09-24T11:17:15Z', 'Mega Utami', '198601132011012013', 'Jabatan Pelaksana', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":4,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":4,"q14":4,"q15":4,"q16":4,"q17":4,"q18":4,"q19":4,"q20":4}'::jsonb, '2025-09-24T11:17:15Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-012', '2025-09-24T11:19:59Z', 'Nanang Supriatna', '198702142012011014', 'Jabatan Pelaksana', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":3,"q2":3,"q3":3,"q4":3,"q5":3,"q6":3,"q7":3,"q8":3,"q9":3,"q10":3,"q11":3,"q12":3,"q13":3,"q14":3,"q15":3,"q16":4,"q17":3,"q18":3,"q19":3,"q20":3}'::jsonb, '2025-09-24T11:19:59Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-013', '2025-09-24T11:22:01Z', 'Okta Viani', '198803152013012015', 'Jabatan Pelaksana', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":4,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":4,"q14":4,"q15":4,"q16":4,"q17":4,"q18":4,"q19":4,"q20":4}'::jsonb, '2025-09-24T11:22:01Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-014', '2025-09-24T11:22:27Z', 'Pandu Wicaksono', '198904162014011016', 'Jabatan Pelaksana', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":4,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":4,"q14":4,"q15":4,"q16":4,"q17":4,"q18":4,"q19":4,"q20":4}'::jsonb, '2025-09-24T11:22:27Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-015', '2025-09-24T11:28:31Z', 'Qori Amalia', '199005172015012017', 'Jabatan Pelaksana', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":4,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":4,"q14":4,"q15":4,"q16":4,"q17":4,"q18":4,"q19":4,"q20":4}'::jsonb, '2025-09-24T11:28:31Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-016', '2025-09-24T11:30:23Z', 'Rian Hidayat', '199106182016011018', 'Jabatan Pelaksana', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":3,"q2":4,"q3":3,"q4":4,"q5":3,"q6":4,"q7":4,"q8":3,"q9":4,"q10":3,"q11":3,"q12":4,"q13":3,"q14":3,"q15":3,"q16":4,"q17":4,"q18":3,"q19":3,"q20":4}'::jsonb, '2025-09-24T11:30:23Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-017', '2025-09-24T11:35:07Z', 'Siti Rahmawati', '199207192017012019', 'Pejabat Pengawas', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":4,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":4,"q14":4,"q15":4,"q16":4,"q17":4,"q18":4,"q19":4,"q20":4}'::jsonb, '2025-09-24T11:35:07Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-018', '2025-09-24T11:35:33Z', 'Teguh Santoso', '199308202018011020', 'Jabatan Pelaksana', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":4,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":4,"q14":4,"q15":4,"q16":4,"q17":4,"q18":4,"q19":4,"q20":4}'::jsonb, '2025-09-24T11:35:33Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-019', '2025-09-24T11:37:53Z', 'Utami Ningsih', '199409212019012021', 'Jabatan Pelaksana', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":4,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":4,"q14":4,"q15":4,"q16":4,"q17":4,"q18":4,"q19":4,"q20":4}'::jsonb, '2025-09-24T11:37:53Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-020', '2025-09-24T11:43:48Z', 'Vina Anggraini', '199510222020012022', 'Jabatan Pelaksana', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":4,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":4,"q14":4,"q15":4,"q16":4,"q17":4,"q18":4,"q19":4,"q20":4}'::jsonb, '2025-09-24T11:43:48Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-021', '2025-09-24T11:47:31Z', 'Wahyu Kurniawan', '198611232011011023', 'Jabatan Pelaksana', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":4,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":4,"q14":4,"q15":4,"q16":4,"q17":4,"q18":4,"q19":4,"q20":4}'::jsonb, '2025-09-24T11:47:31Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-022', '2025-09-24T11:47:52Z', 'Xenia Maulida', '198712242012012024', 'Jabatan Pelaksana', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":4,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":4,"q14":4,"q15":4,"q16":4,"q17":4,"q18":4,"q19":4,"q20":4}'::jsonb, '2025-09-24T11:47:52Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-023', '2025-09-24T11:50:49Z', 'Yoga Pratama', '198801252013011025', 'Jabatan Pelaksana', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":4,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":4,"q14":4,"q15":4,"q16":4,"q17":4,"q18":4,"q19":4,"q20":4}'::jsonb, '2025-09-24T11:50:49Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-024', '2025-09-24T12:00:34Z', 'Zulfa Safitri', '198902262014012026', 'Jabatan Pelaksana', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":4,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":3,"q14":4,"q15":4,"q16":4,"q17":4,"q18":4,"q19":4,"q20":4}'::jsonb, '2025-09-24T12:00:34Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-025', '2025-09-24T12:41:15Z', 'Arya Danendra', '199003272015011027', 'Jabatan Pelaksana', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":4,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":4,"q14":4,"q15":4,"q16":4,"q17":4,"q18":4,"q19":4,"q20":4}'::jsonb, '2025-09-24T12:41:15Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-026', '2025-09-24T18:40:53Z', 'Bagas Saputra', '199104282016011028', 'Jabatan Pelaksana', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":4,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":4,"q14":4,"q15":4,"q16":4,"q17":4,"q18":3,"q19":4,"q20":4}'::jsonb, '2025-09-24T18:40:53Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-027', '2025-09-25T9:24:15Z', 'Cantika Maharani', '199205292017012029', 'Jabatan Fungsional', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":4,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":4,"q14":4,"q15":4,"q16":4,"q17":4,"q18":4,"q19":4,"q20":4}'::jsonb, '2025-09-25T9:24:15Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-028', '2025-09-25T12:50:17Z', 'Doni Firmansyah', '199306302018011030', 'Jabatan Pelaksana', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":3,"q2":3,"q3":4,"q4":3,"q5":3,"q6":3,"q7":3,"q8":3,"q9":4,"q10":3,"q11":4,"q12":3,"q13":3,"q14":4,"q15":3,"q16":3,"q17":3,"q18":3,"q19":3,"q20":3}'::jsonb, '2025-09-25T12:50:17Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-029', '2025-09-25T14:03:53Z', 'Elsa Novitasari', '199407312019012031', 'Jabatan Pelaksana', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":4,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":4,"q14":4,"q15":4,"q16":4,"q17":4,"q18":4,"q19":4,"q20":4}'::jsonb, '2025-09-25T14:03:53Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-030', '2025-09-25T14:24:47Z', 'Fikri Ramadhan', '199508012020011032', 'Jabatan Fungsional', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":4,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":4,"q14":4,"q15":4,"q16":4,"q17":4,"q18":4,"q19":4,"q20":4}'::jsonb, '2025-09-25T14:24:47Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO responses (id, timestamp, nama, nip, jabatan, saran, answers, created_at)
VALUES ('RESP-031', '2025-09-25T14:26:25Z', 'Ghaisan Althaf', '199609022021011033', 'Jabatan Fungsional', 'Pelayanan sarana dan prasarana penunjang UP Taman Margasatwa Ragunan secara umum sudah sangat memadai dan berjalan dengan baik.', '{"q1":4,"q2":4,"q3":4,"q4":4,"q5":4,"q6":4,"q7":4,"q8":4,"q9":4,"q10":4,"q11":4,"q12":4,"q13":4,"q14":4,"q15":4,"q16":4,"q17":4,"q18":4,"q19":4,"q20":4}'::jsonb, '2025-09-25T14:26:25Z')
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- Verifikasi jumlah data
SELECT count(*) AS total_responses FROM responses;
