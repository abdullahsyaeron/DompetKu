# Spesifikasi Desain: Siklus Keuangan Bulanan & Grafik Kondisi Finansial

Dokumen spesifikasi arsitektur dan UI/UX untuk fitur pengaturan tanggal mulai siklus bulanan (cut-off gajian), pemantauan indikator kesehatan finansial, serta visualisasi grafik komparasi arus kas 6 siklus terakhir berbasis Apple HIG di aplikasi DompetKu.

---

## 1. Latar Belakang & Tujuan
Banyak pengguna mengelola keuangan pribadi berdasarkan siklus penerimaan gaji (misal setiap tanggal 25) daripada bulan kalender murni (tanggal 1 s/d 30/31). Tanpa siklus yang dapat dikustomisasi, pemantauan pengeluaran dan pemasukan menjadi tidak akurat terhadap cashflow nyata.

### Tujuan Utama:
1. **Pengaturan Siklus Fleksibel**: Pengguna dapat menentukan tanggal mulai siklus bulanan (angka 1–31, default 1) di menu Setelan.
2. **Kalkulasi Cashflow Berdasarkan Siklus**: Seluruh perhitungan arus kas siklus aktif dan riwayat siklus sebelumnya disesuaikan dengan rentang tanggal cut-off gajian.
3. **Indikator Kesehatan Finansial Bulanan**: Menampilkan evaluasi kondisi keuangan secara instan (Surplus Sehat, Waspada, Defisit) beserta rasio tabungan (*savings rate*).
4. **Grafik Batang Komparasi 6 Siklus (Pure SVG/CSS)**: Visualisasi tren perbandingan pemasukan vs pengeluaran 6 siklus terakhir tanpa dependensi pustaka chart pihak ketiga (Ponytail brutal simplicity, zero overhead).
5. **Navigasi Siklus Interaktif**: Kemudahan melihat performa keuangan siklus-siklus sebelumnya melalui tombol panah navigasi `<` dan `>`.
6. **Sinkronisasi Otomatis**: Tersimpan di `localStorage` dan tersinkron ke **Supabase Cloud**.

---

## 2. Model Data

### Ekstensi Tipe `AppData` (`src/types/finance.ts`)
```ts
export interface AppData {
  isPinEnabled: boolean;
  pinHash: string;
  billingCycleStartDay?: number; // 1 s/d 31 (default: 1)
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  templates: QuickTemplate[];
}
```

Jika `billingCycleStartDay` bernilai `undefined` atau tidak diatur, aplikasi secara default menggunakan nilai `1` (awal bulan kalender biasa).

---

## 3. Logika & Kalkulasi Tanggal Siklus (`src/lib/financeCalculations.ts`)

### 3.1. Penentuan Rentang Tanggal Siklus (`getBillingCycleRange`)
Fungsi murni untuk menentukan tanggal mulai dan selesai dari siklus berdasarkan tanggal referensi, `cycleStartDay`, dan `cycleOffset` (0 untuk siklus saat ini, -1 untuk siklus lalu, dst).

```ts
export interface BillingCycleRange {
  startDate: Date;
  endDate: Date;
  label: string; // misal: "25 Sep 2026 – 24 Okt 2026"
  shortLabel: string; // misal: "Okt '26" atau "25/09 - 24/10"
  cycleKey: string; // misal: "2026-10"
}

export function getBillingCycleRange(
  referenceDate: Date = new Date(),
  cycleStartDay: number = 1,
  cycleOffset: number = 0
): BillingCycleRange
```

**Aturan Penentuan Tanggal:**
- Jika `cycleStartDay === 1`:
  - Mulai: Tanggal 1 jam 00:00:00 dari bulan berjalan.
  - Selesai: Hari terakhir jam 23:59:59 dari bulan berjalan.
- Jika `cycleStartDay > 1` (misal tanggal 25):
  - Jika tanggal sekarang $\ge$ 25: Siklus aktif berjalan dari tanggal 25 bulan ini s/d tanggal 24 bulan depan jam 23:59:59.
  - Jika tanggal sekarang $<$ 25: Siklus aktif berjalan dari tanggal 25 bulan lalu s/d tanggal 24 bulan ini jam 23:59:59.
- `cycleOffset` menggeser bulan siklus ke masa lalu (-1, -2, ...) atau masa depan (+1).
- Penanganan otomatis jika bulan tertentu tidak memiliki tanggal 31 (misal Februari atau bulan 30 hari).

### 3.2. Indikator Kesehatan Finansial (`calculateCycleHealth`)
```ts
export interface CycleFinancialSummary {
  income: number;
  expense: number;
  net: number;
  savingsRate: number; // Persentase (net / income * 100)
  status: 'surplus' | 'warning' | 'deficit';
  statusLabel: string;
  statusColor: string; // token CSS / class
}
```

**Kriteria Status:**
1. **Defisit** (`net < 0`):
   - Pengeluaran melampaui pemasukan.
   - Status: `🔴 Defisit` (Badge merah: `apple-badge-danger`).
2. **Waspada** (`net >= 0` dan `savingsRate < 20%`):
   - Arus kas positif tetapi penyisihan tabungan di bawah ambang aman 20%.
   - Status: `🟡 Waspada` (Badge oranye/kuning: `apple-badge-warning`).
3. **Surplus Sehat** (`savingsRate >= 20%`):
   - Arus kas positif kuat dengan rasio tabungan $\ge 20\%$.
   - Status: `🟢 Surplus Sehat (+X% tersimpan)` (Badge hijau: `apple-badge-success`).

### 3.3. Riwayat 6 Siklus Terakhir (`getHistoricalCyclesCashflow`)
Fungsi loop yang menghasilkan array 6 objek siklus (dari -5 hingga 0) untuk bahan visualisasi grafik batang:
```ts
export interface HistoricalCycleData {
  range: BillingCycleRange;
  summary: CycleFinancialSummary;
  isCurrent: boolean;
}
```

---

## 4. Desain Antarmuka (UI/UX)

### 4.1. Kartu Kesehatan Finansial & Grafik di Beranda (`DashboardView.tsx`)
Ditempatkan tepat di bawah kartu Apple Titanium dan pill tombol aksi cepat.

1. **Header Siklus & Navigasi**:
   - Ikon kalender & judul: `Kondisi Keuangan & Siklus`.
   - Kontrol navigasi Apple Inset:
     - Tombol `<` (mundur ke siklus sebelumnya).
     - Rentang tanggal: `25 Sep 2026 – 24 Okt 2026` (font tabular, tebal).
     - Tombol `>` (maju ke siklus berikutnya, nonaktif jika sudah di siklus berjalan).
2. **Status Finansial & Strip 3 Metrik**:
   - Badge Apple HIG dinamis: `Surplus Sehat (+35% tersimpan)` / `Waspada` / `Defisit`.
   - Grid 3 kolom elegan:
     - **Pemasukan**: Hijau Apple (`#34C759`), nominal terformat.
     - **Pengeluaran**: Merah Apple (`#FF3B30`), nominal terformat.
     - **Tabungan Bersih**: Biru Apple (`#0071E3`), nominal mendukung sensor privasi mata (`Rp ••••••••`).
3. **Grafik Batang Komparasi 6 Siklus (Pure SVG/CSS)**:
   - Desain terinspirasi dari Apple Health & Apple Wallet Cashflow.
   - 6 kolom siklus horizontal.
   - Tiap kolom memiliki 2 batang vertikal berdampingan:
     - Batang Hijau (Pemasukan).
     - Batang Merah (Pengeluaran).
     - Tinggi batang diskalakan secara proporsional terhadap nilai transaksi maksimum.
   - Label sumbu X: Nama singkat bulan/siklus (misal `Mei`, `Jun`, `Jul`, `Agu`, `Sep`, `Okt`).
   - Highlight pada batang siklus yang sedang aktif dipilih.
   - Interaksi: Tooltip tap/hover menampilkan rincian nominal pemasukan & pengeluaran siklus tersebut.

### 4.2. Pengaturan Tanggal Siklus di Menu Setelan (`SettingsView.tsx`)
Ditempatkan di bagian Setelan sebagai kartu mandiri *"Siklus Keuangan Bulanan"*.

- Form kontrol Apple Inset:
  - Input angka atau dropdown 1 s/d 31: `Tanggal Mulai Siklus (Gajian)`.
  - Keterangan dinamis: *Contoh: "Diatur tanggal 25. Siklus aktif: 25 Sep 2026 – 24 Okt 2026."*
  - Tombol simpan `apple-btn-primary`.
  - Tersinkron instan ke state aplikasi dan Supabase Cloud.

---

## 5. Rencana Pengujian (Test-Driven Development)

Menambahkan unit test baru di `test/cycle.test.mjs`:
1. `getBillingCycleRange`:
   - Memastikan pemotongan tanggal 1 s/d 31 berjalan akurat.
   - Memastikan pemotongan custom (misal tanggal 25) menghitung rentang tanggal 25 bulan lalu s/d 24 bulan ini.
   - Memastikan `cycleOffset = -1` menghasilkan tanggal siklus bulan sebelumnya.
2. `calculateCycleHealth`:
   - Menguji pengelompokan Defisit jika `expense > income`.
   - Menguji status Waspada jika rasio tabungan $< 20\%$.
   - Menguji status Surplus Sehat jika rasio tabungan $\ge 20\%$.
3. `getHistoricalCyclesCashflow`:
   - Memastikan menghasilkan tepat 6 data siklus berurutan.

---

## 6. Disiplin & Filosofi Arsitektur (Ponytail & Caveman)
- **Zero Heavy Dependencies**: Tidak menggunakan chartjs/recharts/d3. Visualisasi batang dibuat 100% dengan SVG/CSS kustom yang sangat efisien dan ringan.
- **Offline & Cloud Resilient**: Tersimpan di `localStorage` dan `app_data` Supabase tanpa migrasi tabel yang rentan rusak.
- **Konsistensi Tipografi & Token**: Disiplin font Helvetica, hairline border 1px solid, dan skema warna dual-theme Apple (Light `#F5F5F7` & True Black `#000000`).
