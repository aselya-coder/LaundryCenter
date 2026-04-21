# LaundryCenter - Sistem Manajemen Laundry Terintegrasi

LaundryCenter adalah platform manajemen bisnis laundry yang menghubungkan **Pusat Laundry** dengan berbagai **Mitra Toko**. Sistem ini dirancang untuk memantau operasional secara real-time, mengelola keuangan, dan memberikan transparansi kepada pelanggan melalui fitur pelacakan order.

## 🚀 Fitur Utama

- **Multi-Role Access**: Dashboard khusus untuk Administrator (Pusat) dan Mitra.
- **Real-time Order Tracking**: Pelanggan dapat melacak status cucian melalui kode unik atau QR Code.
- **Manajemen Keuangan**: Kalkulasi otomatis omzet, biaya operasional, komisi mitra, dan profit bersih.
- **Ekspor Laporan**: Generate laporan keuangan ke format Excel secara instan.
- **Cetak Struk Termal**: Dukungan pencetakan struk untuk mitra saat menerima order baru.
- **Self-Healing Data**: Sistem otomatis memperbaiki status pembayaran untuk order yang sudah selesai.

## 🛠️ Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management & Data Fetching**: TanStack Query (React Query)
- **Backend & Database**: Supabase (Auth, PostgreSQL, Realtime)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Utility**: ExcelJS, Date-fns, Framer Motion

## 📂 Struktur Project

```
src/
├── components/     # Komponen UI reusable (Shadcn & Custom)
├── hooks/          # Custom React hooks
├── lib/            # Konfigurasi Supabase, Types, dan Utilities
└── pages/          # Halaman aplikasi
    ├── admin/      # Fitur khusus Administrator
    ├── mitra/      # Fitur khusus Mitra
    └── ...         # Halaman publik (Login, Tracking, dll)
```

## ⚙️ Cara Instalasi

1. **Clone repository**
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Konfigurasi Environment**
   Buat file `.env` di root directory dan isi dengan kredensial Supabase Anda:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. **Jalankan Aplikasi**
   ```bash
   npm run dev
   ```

## 📝 Catatan Pengembangan Selanjutnya

1. **Otomasi Auth**: Menggunakan Supabase Edge Functions untuk sinkronisasi pembuatan User Auth dan Profile.
2. **Notifikasi WhatsApp**: Integrasi API gateway untuk notifikasi status ke pelanggan.
3. **Payment Gateway**: Integrasi Midtrans/Xendit untuk pembayaran digital via QRIS.
4. **Master Data Satuan**: Standarisasi item layanan satuan agar lebih rapi.

---
Dikembangkan dengan ❤️ untuk efisiensi bisnis laundry.
