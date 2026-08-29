# 🗄️ Supabase PostgreSQL Connection & Marketplace Setup Guide

Everything has been configured for your project **AerLaut** (`https://zkywxhgcdkixufpxlnwi.supabase.co`).

---

## 🔑 Your Active Credentials (`.env.local`)

```env
VITE_SUPABASE_URL=https://zkywxhgcdkixufpxlnwi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📜 Database Schema & Seed Data (Satu File SQL)

Semua skema tabel (`users`, `stores`, `products`, `orders`, `user_logs`), trigger, kebijakan RLS, realtime, dan data contoh sekarang digabung jadi **satu file saja**: [`database.sql`](./database.sql) di root project ini.

Cara pakai:

- **Project Supabase baru / kosong** → jalankan seluruh isi `database.sql` dari atas ke bawah di [Supabase SQL Editor](https://supabase.com/dashboard/project/zkywxhgcdkixufpxlnwi/sql/new).
- **Database yang sudah berjalan** (tabel sudah ada, ini yang dipakai project AerLaut sekarang) → cukup jalankan bagian **"BAGIAN 5: SEED DATA DEMO"** di bagian bawah file tersebut. Bagian ini aman dijalankan berkali-kali (pakai `WHERE NOT EXISTS`, tidak akan membuat data ganda).


---

## 👥 How to View Registered Accounts, Stores & Activity Logs

- Go to **[Supabase Table Editor](https://supabase.com/dashboard/project/zkywxhgcdkixufpxlnwi/editor)**.
- Select **`users`**, **`stores`**, **`products`**, **`orders`**, or **`user_logs`** tables.
