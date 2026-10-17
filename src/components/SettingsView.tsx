'use client';

import React, { useState } from 'react';
import {
  KeyRound,
  Database,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Cloud,
  Check,
  Copy,
  Smartphone,
  Palette,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { AppData } from '@/types/finance';
import { supabaseSchemaSql, isSupabaseConfigured } from '@/lib/supabase';

export interface SettingsViewProps {
  appData: AppData;
  onUpdatePin: (newPin: string) => void;
  onResetDummyData: () => void;
  onResetEmptyData: () => void;
  onImportData: (importedData: AppData) => void;
  themeMode: 'light' | 'dark' | 'system';
  onSetTheme: (mode: 'light' | 'dark' | 'system') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  appData,
  onUpdatePin,
  onResetDummyData,
  onResetEmptyData,
  onImportData,
  themeMode,
  onSetTheme,
}) => {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMessage, setPinMessage] = useState<{ text: string; error: boolean } | null>(null);

  const [copiedSql, setCopiedSql] = useState(false);

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPin !== appData.pinHash) {
      setPinMessage({ text: 'PIN lama salah!', error: true });
      return;
    }
    if (newPin.length < 4 || newPin.length > 6) {
      setPinMessage({ text: 'PIN baru harus 4-6 digit angka!', error: true });
      return;
    }
    if (newPin !== confirmPin) {
      setPinMessage({ text: 'Konfirmasi PIN tidak cocok!', error: true });
      return;
    }

    onUpdatePin(newPin);
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    setPinMessage({ text: 'PIN berhasil diperbarui!', error: false });
    setTimeout(() => setPinMessage(null), 3000);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(appData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup_dompetku_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && Array.isArray(parsed.wallets) && Array.isArray(parsed.transactions)) {
            onImportData(parsed);
            alert('Data backup berhasil dipulihkan!');
          } else {
            alert('Format file JSON tidak valid.');
          }
        } catch {
          alert('Gagal membaca file JSON.');
        }
      };
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(supabaseSchemaSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-6 pb-36">
      {/* View Header */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-[var(--color-text)]">
          Setelan
        </h2>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
          Preferensi tema, keamanan PIN, sinkronisasi cloud, dan cadangan data
        </p>
      </div>

      {/* Group 1: Tema Tampilan */}
      <div className="apple-card p-5 sm:p-6 space-y-4 rounded-[20px]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border-soft)] flex items-center justify-center text-[var(--color-primary)] shrink-0">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)]">
              Tema Tampilan
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Pilih mode tampilan antarmuka aplikasi
            </p>
          </div>
        </div>

        {/* Apple Segmented Control */}
        <div className="p-1 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border-soft)] grid grid-cols-1 sm:grid-cols-3 gap-1">
          {[
            { id: 'system', label: 'Otomatis Sistem', icon: Monitor },
            { id: 'light', label: 'Terang', icon: Sun },
            { id: 'dark', label: 'Gelap', icon: Moon },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = themeMode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSetTheme(item.id as 'light' | 'dark' | 'system')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs transition-all apple-press cursor-pointer rounded-lg ${
                  isActive
                    ? 'bg-[var(--color-surface)] text-[var(--color-primary)] font-semibold shadow-sm border border-[var(--color-border-soft)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] font-medium'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Group 2: Master PIN */}
      <div className="apple-card p-5 sm:p-6 space-y-4 rounded-[20px]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border-soft)] flex items-center justify-center text-[var(--color-primary)] shrink-0">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text)]">
                Master PIN
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Keamanan akses buka kunci aplikasi
              </p>
            </div>
          </div>
          <div className="apple-badge bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border-soft)] font-mono text-[11px]">
            PIN: {appData.pinHash}
          </div>
        </div>

        <form onSubmit={handleChangePin} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                PIN Lama
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                required
                placeholder="••••••"
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value)}
                className="apple-input text-xs font-mono tracking-wider"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                PIN Baru (4-6 Digit)
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                required
                placeholder="••••••"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className="apple-input text-xs font-mono tracking-wider"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                Konfirmasi PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                required
                placeholder="••••••"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                className="apple-input text-xs font-mono tracking-wider"
              />
            </div>
          </div>

          {pinMessage && (
            <div
              className={`text-xs p-3 rounded-xl border ${
                pinMessage.error
                  ? 'text-[var(--color-danger-text)] bg-[var(--color-danger-bg)] border-[var(--color-danger-text)]/20'
                  : 'text-[var(--color-success-text)] bg-[var(--color-success-bg)] border-[var(--color-success-text)]/20'
              }`}
            >
              {pinMessage.text}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="apple-btn apple-btn-primary h-9 px-4 text-xs apple-press"
            >
              Simpan PIN Baru
            </button>
          </div>
        </form>
      </div>

      {/* Group 3: Koneksi Database Cloud */}
      <div className="apple-card p-5 sm:p-6 space-y-4 rounded-[20px]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border-soft)] flex items-center justify-center text-[var(--color-primary)] shrink-0">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text)]">
                Koneksi Database Cloud
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                {isSupabaseConfigured
                  ? 'Supabase aktif terhubung untuk sinkronisasi'
                  : 'Berjalan di penyimpanan lokal offline'}
              </p>
            </div>
          </div>
          <span
            className={`apple-badge ${
              isSupabaseConfigured
                ? 'apple-badge-success'
                : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border-soft)]'
            }`}
          >
            {isSupabaseConfigured ? 'Terkoneksi' : 'Lokal Offline'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border-soft)] space-y-2.5 text-xs text-[var(--color-text)]">
          <p className="font-semibold text-[var(--color-text)]">Integrasi Supabase Cloud:</p>
          <ol className="list-decimal list-inside space-y-1.5 text-[var(--color-text-secondary)] text-[11px] leading-relaxed">
            <li>Buat project di <strong className="text-[var(--color-text)]">supabase.com</strong>.</li>
            <li>Salin URL & Anon Key ke file <code className="text-[var(--color-text)] font-mono">.env.local</code>.</li>
            <li>Eksekusi skema SQL di SQL Editor Supabase untuk migrasi tabel.</li>
          </ol>
          <div className="pt-1">
            <button
              type="button"
              onClick={handleCopySql}
              className="apple-btn apple-btn-secondary h-8 px-3.5 text-xs gap-1.5 apple-press cursor-pointer"
            >
              {copiedSql ? (
                <Check className="h-3.5 w-3.5 text-[var(--color-success-text)]" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copiedSql ? 'Skema SQL Disalin' : 'Salin Skema SQL'}
            </button>
          </div>
        </div>
      </div>

      {/* Group 4: Cadangan & Reset Data */}
      <div className="apple-card p-5 sm:p-6 space-y-4 rounded-[20px]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border-soft)] flex items-center justify-center text-[var(--color-primary)] shrink-0">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)]">
              Cadangan & Reset Data
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Ekspor file JSON atau kelola data aplikasi
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={handleExportJson}
            className="apple-btn apple-btn-secondary gap-2 text-xs apple-press cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Cadangkan (Ekspor JSON)
          </button>

          <label className="apple-btn apple-btn-secondary gap-2 text-xs apple-press cursor-pointer">
            <Upload className="h-4 w-4" />
            Pulihkan (Impor JSON)
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              if (confirm('Muat ulang data contoh demo? Data aktif akan digantikan.')) {
                onResetDummyData();
              }
            }}
            className="apple-btn apple-btn-secondary gap-2 text-xs apple-press cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            Muat Data Contoh Demo
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm('Kosongkan seluruh data aplikasi? Anda akan memulai dari database kosong murni.')) {
                onResetEmptyData();
              }
            }}
            className="apple-btn text-xs font-semibold gap-2 bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border border-[var(--color-danger-text)]/20 hover:bg-[var(--color-danger-bg)]/80 apple-press cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            Kosongkan Seluruh Data
          </button>
        </div>
      </div>

      {/* Group 5: Install di Layar Utama HP */}
      <div className="apple-card p-5 sm:p-6 space-y-4 rounded-[20px]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border-soft)] flex items-center justify-center text-[var(--color-primary)] shrink-0">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)]">
              Install di Layar Utama HP
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Gunakan mode layar penuh layaknya aplikasi native
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border-soft)] text-xs text-[var(--color-text-secondary)] space-y-2 leading-relaxed">
          <p>
            <strong className="text-[var(--color-text)] font-semibold">Android</strong>: Buka menu Chrome (titik tiga) lalu pilih <span className="text-[var(--color-text)]">&quot;Install app&quot;</span> atau <span className="text-[var(--color-text)]">&quot;Tambahkan ke Layar Utama&quot;</span>.
          </p>
          <p>
            <strong className="text-[var(--color-text)] font-semibold">iOS</strong>: Buka menu Bagikan Safari (ikon kotak panah ke atas) lalu pilih <span className="text-[var(--color-text)]">&quot;Add to Home Screen&quot;</span>.
          </p>
        </div>
      </div>
    </div>
  );
};
