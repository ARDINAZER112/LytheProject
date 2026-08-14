-- ============================================================
-- Migration: Link public.users to Supabase Auth (auth.users)
-- Jalankan di Supabase SQL Editor SEBELUM pakai flow register/login baru.
-- ============================================================

-- 1. Tambah kolom penghubung ke auth.users (Supabase Auth).
--    Ini yang bikin OTP email verifikasi & reset password berfungsi,
--    karena Supabase hanya kirim email untuk baris yang benar-benar
--    ada di auth.users.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Password sekarang dikelola & di-hash oleh Supabase Auth,
--    bukan disimpan plaintext lagi di tabel ini. Longgarkan constraint-nya.
ALTER TABLE public.users
  ALTER COLUMN password DROP NOT NULL;

-- 3. (Opsional tapi disarankan) index buat lookup profile by auth_id.
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_id);

-- ============================================================
-- CATATAN SETUP DI SUPABASE DASHBOARD (WAJIB, tidak bisa lewat SQL):
--
-- 1. Buka Authentication → Providers → Email.
--    Pastikan "Confirm email" AKTIF (supaya signup butuh verifikasi).
--
-- 2. Buka Authentication → Emails → Templates → "Confirm signup"
--    dan "Reset password". Pastikan template pakai variabel
--    {{ .Token }} (6 digit OTP), BUKAN {{ .ConfirmationURL }}
--    (itu magic link, bukan kode OTP). Contoh isi email:
--
--      Kode verifikasi Anda: {{ .Token }}
--
-- 3. Kalau mau, atur juga rate limit & durasi kadaluarsa OTP di
--    Authentication → Rate Limits.
--
-- 4. Untuk akun admin demo (admin@jaringlokal.com), tetap ditangani
--    lewat fallback lokal di kode (tidak butuh baris di auth.users).
--    Kalau mau login admin lewat Supabase Auth juga, buat manual
--    lewat Authentication → Users → Add user, lalu isi auth_id-nya
--    di baris admin pada tabel public.users.
-- ============================================================
