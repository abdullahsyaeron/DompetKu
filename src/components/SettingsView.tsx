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
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text)]">Setelan Aplikasi</h2>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Keamanan Master PIN, tema tampilan, cadangan data, dan sinkronisasi
        </p>
      </div>

      {/* 1. Theme Switcher */}
      <div className="apple-card p-6 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-[10px] bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
            <Palette className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
              Tema Tampilan
            </h3>
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              Pilih mode tampilan sesuai kenyamanan Anda
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          {[
            { id: 'system', label: 'Otomatis Sistem', icon: Monitor },
            { id: 'light', label: 'Terang (Light)', icon: Sun },
            { id: 'dark', label: 'Gelap (Dark)', icon: Moon },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = themeMode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSetTheme(item.id as 'light' | 'dark' | 'system')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white font-semibold rounded-[var(--radius-md)] shadow-sm'
                    : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border-soft)] rounded-[var(--radius-md)] hover:text-[var(--color-text)]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Master PIN */}
      <div className="apple-card p-6 space-y-3.5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-[10px] bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
            <KeyRound className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Ganti Master PIN</h3>
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              PIN saat ini: <span className="font-mono text-[var(--color-text)]">{appData.pinHash}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePin} className="space-y-3 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">
                PIN Lama
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                required
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value)}
                className="apple-input text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">
                PIN Baru (4-6 Digit)
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                required
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className="apple-input text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">
                Konfirmasi PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                required
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                className="apple-input text-xs font-mono"
              />
            </div>
          </div>

          {pinMessage && (
            <p
              className={`text-xs ${
                pinMessage.error ? 'text-[var(--color-danger-text)]' : 'text-[var(--color-success-text)]'
              }`}
            >
              {pinMessage.text}
            </p>
          )}

          <button
            type="submit"
            className="apple-btn apple-btn-primary h-9 px-4 text-xs"
          >
            Simpan PIN Baru
          </button>
        </form>
      </div>

      {/* 3. Cloud Supabase */}
      <div className="apple-card p-6 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-[10px] bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
              <Cloud className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text)]">Koneksi Database Cloud</h3>
              <p className="text-[11px] text-[var(--color-text-secondary)]">
                {isSupabaseConfigured
                  ? 'Supabase aktif terhubung.'
                  : 'Berjalan di penyimpanan lokal offline.'}
              </p>
            </div>
          </div>
          <span
            className={`apple-badge text-[11px] ${
              isSupabaseConfigured
                ? 'apple-badge-success'
                : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border-soft)]'
            }`}
          >
            {isSupabaseConfigured ? 'Terkoneksi' : 'Lokal Offline'}
          </span>
        </div>

        <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] border border-[var(--color-border-soft)] space-y-2 text-xs text-[var(--color-text)]">
          <p className="font-medium text-[var(--color-text)]">Integrasi Supabase Cloud:</p>
          <ol className="list-decimal list-inside space-y-1 text-[var(--color-text-secondary)] text-[11px]">
            <li>Buat project di <strong className="text-[var(--color-text)]">supabase.com</strong>.</li>
            <li>Salin URL & Anon Key ke file <code className="text-[var(--color-text)]">.env.local</code>.</li>
            <li>Eksekusi skema SQL di SQL Editor Supabase untuk migrasi tabel.</li>
          </ol>
          <button
            type="button"
            onClick={handleCopySql}
            className="apple-btn apple-btn-secondary h-8 px-3 text-xs gap-1.5 cursor-pointer mt-1"
          >
            {copiedSql ? <Check className="h-3.5 w-3.5 text-[var(--color-success-text)]" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedSql ? 'Skema SQL Disalin' : 'Salin Skema SQL'}
          </button>
        </div>
      </div>

      {/* 4. Backup and Reset */}
      <div className="apple-card p-6 space-y-3.5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-[10px] bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Cadangan & Reset Data</h3>
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              Ekspor file JSON atau kelola data aplikasi
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={handleExportJson}
            className="apple-btn apple-btn-secondary gap-2 text-xs cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Cadangkan (Ekspor JSON)
          </button>

          <label className="apple-btn apple-btn-secondary gap-2 text-xs cursor-pointer">
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
            className="apple-btn apple-btn-secondary gap-2 text-xs cursor-pointer"
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
            className="apple-btn text-xs font-semibold gap-2 bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border border-[var(--color-danger-text)]/20 hover:bg-[var(--color-danger-bg)]/80 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            Kosongkan Seluruh Data
          </button>
        </div>
      </div>

      {/* 5. PWA Installation */}
      <div className="apple-card p-6 space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-[10px] bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
            <Smartphone className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Install di Layar Utama HP</h3>
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              Gunakan mode layar penuh layaknya aplikasi native
            </p>
          </div>
        </div>

        <div className="text-[11px] text-[var(--color-text-secondary)] space-y-1.5 leading-relaxed pt-1">
          <p>
            <strong className="text-[var(--color-text)]">Android</strong>: Buka menu Chrome (titik tiga) lalu pilih <span className="text-[var(--color-text)]">&quot;Install app&quot;</span> atau <span className="text-[var(--color-text)]">&quot;Tambahkan ke Layar Utama&quot;</span>.
          </p>
          <p>
            <strong className="text-[var(--color-text)]">iOS</strong>: Buka menu Bagikan Safari (ikon kotak panah ke atas) lalu pilih <span className="text-[var(--color-text)]">&quot;Add to Home Screen&quot;</span>.
          </p>
        </div>
      </div>
    </div>
  );
};
