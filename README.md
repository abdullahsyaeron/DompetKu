# DompetKu — Personal Finance & Cashflow Planner

Aplikasi perencanaan keuangan pribadi, alokasi anggaran (*zero-based budgeting*), pelacakan transaksi multi-dompet, dan target tabungan dengan desain elegan berbasis **Apple Human Interface Guidelines (HIG)** (iOS 17/18 & macOS Sequoia).

---

## Fitur Utama

- **Apple HIG Design & Typography**: Menggunakan sistem layout Inset-Grouped, kartu Titanium satin sheen, hairline borders 1px, angka tabular, dan tipografi disiplin **Helvetica**.
- **Dual-Theme Support**: Tema Light (`#F5F5F7`) dan True Black Dark (`#000000`/`#1C1C1E`) yang tersinkronisasi otomatis dengan preferensi sistem macOS/iOS.
- **Privacy Mode (Sensor Saldo)**: Fitur privasi cerdas yang hanya menyensor nilai saldo akun dan total kekayaan (`Rp ••••••••`), sementara catatan transaksi operasional dan limit anggaran tetap terbaca di ruang publik.
- **Multi-Wallet & Rekening**: Kelola dompet kas tunai, rekening bank (BCA, Mandiri, dll.), hingga e-wallet dengan kartu bertumpuk ala Apple Wallet.
- **Transaksi Terkelompok Tanggal**: Daftar transaksi dengan pengelompokan tanggal otomatis (*Hari Ini*, *Kemarin*, *Bulan/Tahun*), kontrol segmen (*Semua / Pengeluaran / Pemasukan / Transfer*), dan pencarian instan.
- **Anggaran & Target Finansial**: Pemantauan kuota pengeluaran dinamis per kategori (*Aman*, *Waspada*, *Melebihi Batas*) dan tabungan tujuan dengan persentase progres.
- **Keamanan PIN & Biometrik**: Kunci akses PIN 4-6 digit dengan layar keypad Apple Passcode.
- **Offline-First & Cloud Ready**: Berjalan 100% lokal di browser menggunakan `localStorage`, ekspor/impor cadangan JSON, serta dukungan integrasi Supabase Database Cloud.
- **Progressive Web App (PWA)**: Dapat diinstal langsung ke Layar Utama (*Home Screen*) Android dan iOS layaknya aplikasi native.

---

## Teknologi

- **Framework**: [Next.js](https://nextjs.org/) (App Router & Turbopack)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & CSS Custom Properties
- **Ikon**: [Lucide React](https://lucide.dev/)
- **Database**: Offline `localStorage` + Skema [Supabase](https://supabase.com/) PostgreSQL

---

## Memulai Proyek Secara Lokal

1. **Clone repositori**:
   ```bash
   git clone <URL_REPOSITORI_ANDA>
   cd quirky-mendeleev
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan server pengembangan**:
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

4. **Menjalankan Unit Test**:
   ```bash
   npm test
   ```

5. **Build Produksi**:
   ```bash
   npm run build
   ```

---

## Panduan Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com) dan masuk menggunakan akun GitHub Anda.
2. Klik **Add New...** > **Project**.
3. Pilih repositori **DompetKu** dari daftar GitHub Anda.
4. Pada konfigurasi framework, biarkan default (**Next.js**).
5. Klik **Deploy**. Aplikasi akan otomatis online dan mendapatkan URL HTTPS publik.

---

## Lisensi

Proyek ini dibuat untuk kebutuhan personal finance tracking. Bebas dikembangkan lebih lanjut.
