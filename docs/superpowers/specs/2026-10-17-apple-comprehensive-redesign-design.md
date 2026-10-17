# Spesifikasi Desain: Redesign Komprehensif Apple HIG & iOS Wallet Architecture

- **Tanggal**: 2026-10-17
- **Peran**: Senior UI/UX Designer (Apple Design Philosophy)
- **Status**: Draft Spec untuk Review Pengguna

---

## 1. Executive Summary & Design Read

> **Design Read**: Redesign antarmuka komprehensif untuk aplikasi web manajemen keuangan pribadi (PWA) mengadopsi standar resmi **Apple Human Interface Guidelines (HIG)** dan arketipe **Apple Wallet & Inset-Grouped Lists**. Desain mengutamakan kesederhanaan brutal, kejelasan visual tinggi, tipografi **Helvetica** berdisiplin ketat, permukaan solid (zero frosted glass kabut), dan mikro-interaksi pegas haptik (*tactile spring physics*).

### Konfigurasi Tiga Parameter (Dials):
- **`DESIGN_VARIANCE: 6`** — Keteraturan struktural Apple, konsisten, terkontrol, tanpa kekacauan visual.
- **`MOTION_INTENSITY: 5`** — Transisi lembut 160–200ms `cubic-bezier(0.25, 0.1, 0.25, 1)`, efek tekan `active:scale-[0.97]`.
- **`VISUAL_DENSITY: 3`** — Lapang, ruang bernapas cukup, hierarki teks tajam dan intuitif.

---

## 2. Refinement Perilaku Tombol Privasi (Eye Icon)

Berdasarkan temuan pengguna, sebelumnya penekanan ikon mata menyembunyikan seluruh angka termasuk arus kas dan riwayat transaksi, membuat aplikasi sulit dibaca.

### Aturan Privasi Baru:
1. **Nilai yang Disembunyikan (`Rp ••••••••`)**:
   - Saldo Total Likuid pada kartu utama Beranda.
   - Saldo masing-masing dompet/rekening pada menu Dompet.
   - Saldo terkumpul pada menu Target Finansial.
2. **Nilai yang Tetap Ditampilkan (Operasional & Analisis)**:
   - Nominal pengeluaran & pemasukan pada riwayat transaksi.
   - Plafon kuota anggaran bulanan dan persentase terpakai.
   - Nominal template transaksi kilat.

*Hasil:* Pengguna dapat leluasa menggunakan aplikasi di tempat umum tanpa mengekspos total kekayaan/tabungan pribadi, namun tetap dapat memantau catatan belanja harian.

---

## 3. Sistem Desain & Token Apple

### 3.1 Palet Warna & Permukaan Solid (Tanpa Efek Kaca Kabut)
| Token | Light Mode | Dark Mode | Fungsi |
|---|---|---|---|
| `--color-bg` | `#F5F5F7` (Parchment) | `#000000` (True Black) | Kanvas latar belakang utama |
| `--color-surface` | `#FFFFFF` (Pure Canvas) | `#1C1C1E` (Tile Gray 6) | Permukaan kartu utama & sheet |
| `--color-surface-2` | `#F6F7F9` (Soft Pearl) | `#2C2C2E` (Tile Gray 5) | Wadah elemen sekunder & kontrol |
| `--color-primary` | `#0071E3` (Action Blue) | `#2997FF` (Dark Action Blue) | Elemen interaktif, fokus, tombol primer |
| `--color-border-soft` | `#E5E5EA` (Hairline) | `rgba(255, 255, 255, 0.12)` | Garis pemisah 1px solid |
| `--color-text` | `#1D1D1F` (Apple Ink) | `#F5F5F7` | Teks primer |
| `--color-text-secondary`| `#6E6E73` | `#A1A1A6` | Label, metadata, caption |
| Status: Sukses | `#34C759` (Teks `#137A3A`) | `#34C759` | Pemasukan, status anggaran aman |
| Status: Bahaya | `#FF3B30` (Teks `#B42318`) | `#FF453A` | Pengeluaran, anggaran overlimit |
| Status: Peringatan | `#FF9500` (Teks `#8A5A00`) | `#FFD60A` | Peringatan mendekati batas |

### 3.2 Tipografi Helvetica
- **Stack**: `"Helvetica", "Helvetica Neue", Arial, sans-serif`.
- **Display Headings**: Tracking `-0.025em`, font-weight `600`, line-height `1.15`.
- **Angka Finansial**: Wajib mengaktifkan `font-tabular` (`font-variant-numeric: tabular-nums`) agar karakter angka memiliki lebar monospaced identik dan tidak bergeser saat nilai berubah.
- **Section Headers**: Huruf kapital kecil `text-[12px] font-semibold tracking-wider text-[var(--color-text-secondary)]`.

### 3.3 Sudut & Elevasi
- Radius Kartu Utama: `18px` (`rounded-[18px]`).
- Radius Tombol & Input: `12px` (`rounded-[12px]`).
- Radius Modal Sheet: `24px` di desktop, `rounded-t-[28px]` di mobile.
- Radius Kapsul: `9999px` (`rounded-full`).
- Elevasi: Flat dengan hairline border 1px dan bayangan mikro soft `0 1px 3px rgba(0,0,0,0.04)`.

---

## 4. Rincian Desain Seluruh Menu (Komprehensif)

### 4.1 Navigasi: Header & Bottom Bar
- **Header**:
  - Tinggi 56px, latar solid `.apple-navbar`, border-bottom hairline.
  - Brand mark `DK` monogram dalam rounded square mini (Apple app icon style).
  - Kontrol atas: Status storage pill, Eye privacy toggle, Theme toggle, App lock toggle.
- **Bottom Bar**:
  - Tinggi 64px, posisi fixed dengan `pb-safe`.
  - 6 tab: Beranda, Transaksi, Anggaran, Dompet, Target, Setelan.
  - Ikon line berketebalan 2px dengan active state berupa background kapsul lembut warna primary soft.

### 4.2 Menu 1: Beranda (`DashboardView.tsx`)
1. **Kartu Saldo Titanium Apple Card**:
   - Proporsi kartu fisik (rasio ~1.8 : 1) dengan gradien satin titanium Apple monokrom.
   - Glyph chip kartu minimalis di kiri atas, label "DK TITANIUM" dan status "Personal".
   - Angka Saldo Likuiditas utama besar (32px–36px) Helvetica bold.
   - Strip bawah kartu: Pemasukan bulan ini vs Pengeluaran bulan ini dalam badge kontras lembut.
2. **Action Pills Bar**:
   - 3 tombol kapsul haptik: `+ Pengeluaran` (aksen merah lembut), `+ Pemasukan` (aksen hijau lembut), `Transfer` (aksen biru lembut).
   - Efek sentuh `active:scale-[0.97]`.
3. **Template Cepat Horizontal Carousel**:
   - Chip horizontal berlatar putih dengan dot warna transaksi untuk pencatatan 1-ketuk.
4. **Ringkasan Anggaran & Target**:
   - Dual widget berdampingan dengan progress bar rounded tipis 6px.
5. **Daftar 5 Transaksi Terkini Inset-Grouped**:
   - Menggunakan format grup kartu inset dengan hairline divider antar transaksi.

### 4.3 Menu 2: Transaksi (`TransactionsView.tsx`)
1. **Pill Search Bar & Filter**:
   - Input pencarian berbentuk kapsul (`rounded-full`) dengan padding `pl-10 pr-4 h-11`, ikon kaca pembesar terisolasi (`pointer-events-none`).
   - Dropdown pilihan dompet bersudut membulat selaras.
2. **Apple Segmented Control**:
   - Slider tersegmentasi: `Semua`, `Pengeluaran`, `Pemasukan`, `Transfer`.
   - Latar belakang abu-abu netral dengan thumb pill putih/dark yang meluncur mulus.
3. **Inset-Grouped Lists Berdasarkan Tanggal**:
   - Transaksi dikelompokkan per section: **Hari Ini**, **Kemarin**, dan nama bulan/tahun.
   - Masing-masing section berupa kartu membulat (18px) berisi daftar transaksi dengan garis pemisah hairline yang tidak menabrak ikon kategori melingkar.
   - Kolom nama dan catatan diproteksi `truncate` dan `min-w-0` agar tidak menimpa nominal.

### 4.4 Menu 3: Anggaran (`BudgetsView.tsx`)
1. **Plafon Anggaran Bulanan Hero Card**:
   - Ringkasan total kuota belanja dan sisa anggaran.
   - Progress bar Apple dengan warna dinamis (Biru < 80%, Oranye 80-100%, Merah > 100%).
2. **Grid Kuota Kategori Inset**:
   - Kartu kategori dengan ikon inisial huruf, rincian terpakai vs batas, badge kapsul Apple (Aman / Waspada / Melebihi Batas), tombol Atur Kuota, dan tombol Ubah/Hapus.

### 4.5 Menu 4: Dompet (`WalletsView.tsx`)
1. **Akumulasi Saldo**:
   - Ringkasan total kekayaan dalam dompet.
2. **Koleksi Kartu Dompet & Rekening**:
   - Ditata mirip tumpukan kartu Apple Wallet: Bank Account, Digital Wallet, Cash Vault.
   - Menampilkan saldo rekening, 4 digit terakhir nomor kartu/rekening (`•••• 8821`), dan tombol aksi cepat transfer.

### 4.6 Menu 5: Target Finansial (`GoalsView.tsx`)
1. **Akumulasi Tabungan**:
   - Total progres pencapaian dana darurat dan tabungan masa depan.
2. **Kartu Target Finansial**:
   - Target nama, kategori, tenggat tanggal, persentase ketercapaian, dan tombol "+ Tabung" untuk setoran kilat dari dompet yang dipilih.

### 4.7 Menu 6: Setelan (`SettingsView.tsx`)
- Mengadopsi struktur *Apple Settings Inset Grouped Table*:
  - **Grup 1: Tampilan** — Segmented control tema (*Otomatis Sistem*, *Terang*, *Gelap*).
  - **Grup 2: Keamanan** — Form penggantian Master PIN 4–6 digit.
  - **Grup 3: Sinkronisasi Cloud** — Status koneksi Supabase & tombol salin skema SQL.
  - **Grup 4: Manajemen Data** — Ekspor/Impor file JSON, muat data demo, kosongkan database.
  - **Grup 5: Informasi Aplikasi** — Panduan instalasi PWA di Android & iOS.

### 4.8 Modals: Apple Bottom Sheet Dialogs
- **Perilaku Transisi**:
  - Di layar mobile: Meluncur ke atas dari bawah layar (*detent sheet*) dengan *drag handle bar* di puncak modal dan sudut `rounded-t-[28px]`.
  - Di layar desktop: Tampil sebagai sheet window elegan terpusat (`max-w-lg`, `rounded-[22px]`).
- **Header Navigasi iOS**:
  - Tombol teks **Batal** di kiri atas.
  - Judul modal di tengah (`text-base font-semibold text-[var(--color-text)]`).
  - Tombol **Selesai / Simpan** di kanan atas dengan gaya teks biru Action Blue tebal.
- **Form Input Transaksi**:
  - Input nominal besar Helvetica dengan prefix `Rp` permanen.
  - Quick amount pills (+10rb, +50rb, +100rb, +500rb).
  - Segmented type tabs (Pengeluaran, Pemasukan, Transfer).
  - Pemilihan dompet, kategori, dan catatan opsional.
- **PIN Lock Screen**:
  - Passcode screen Apple dengan indikator titik lingkaran yang berkedip dan membal saat salah, serta keypad numerik bulat taktil.

---

## 5. Rencana Verifikasi & Disiplin Ponytail

1. **Unit Testing**:
   - Memastikan 10/10 pengujian (`test/finance.test.mjs` dan `test/theme.test.mjs`) tetap 100% lulus.
2. **ESLint & TypeScript**:
   - `npm run lint` menghasilkan 0 error dan 0 warning.
3. **Production Build**:
   - `npm run build` sukses terkompilasi melalui Turbopack tanpa ada hydration mismatch.
4. **Validasi Interaktif**:
   - Uji klik privacy toggle mata (memastikan saldo tersembunyi, arus kas transaksi tetap terbaca).
   - Uji seluruh modal bottom sheet di mobile dan desktop.
