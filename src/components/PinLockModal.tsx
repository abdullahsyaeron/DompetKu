'use client';

import React, { useState } from 'react';
import { Lock, Delete, ShieldAlert, KeyRound } from 'lucide-react';

interface PinLockModalProps {
  correctPin: string;
  onUnlocked: () => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({ correctPin, onUnlocked }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);

      if (nextPin === correctPin) {
        setTimeout(() => {
          onUnlocked();
        }, 120);
      } else if (nextPin.length === correctPin.length && nextPin !== correctPin) {
        setError(true);
        setTimeout(() => {
          setPin('');
        }, 400);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="apple-card max-w-xs w-full p-6 text-center rounded-[20px]">
        <div className="h-12 w-12 rounded-[14px] bg-[var(--color-primary-soft)] text-[var(--color-primary)] mx-auto flex items-center justify-center mb-3">
          <Lock className="h-5 w-5" />
        </div>

        <h2 className="text-sm font-semibold text-[var(--color-text)] tracking-tight">Kunci Keamanan</h2>
        <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
          Ketik Master PIN untuk membuka
        </p>

        {/* PIN Indicators */}
        <div className={`my-5 flex justify-center items-center gap-2.5 ${error ? 'animate-bounce' : ''}`}>
          {Array.from({ length: Math.max(4, correctPin.length) }).map((_, i) => (
            <div
              key={i}
              className={`h-3.5 w-3.5 rounded-full transition-all duration-200 ${
                i < pin.length
                  ? error
                    ? 'bg-[var(--color-danger-text)] border border-[var(--color-danger-text)] scale-110'
                    : 'bg-[var(--color-primary)] border border-[var(--color-primary)] scale-110'
                  : 'bg-[var(--color-surface-2)] border border-[var(--color-border)]'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="mb-3 text-xs font-medium text-[var(--color-danger-text)] flex items-center justify-center gap-1">
            <ShieldAlert className="h-3.5 w-3.5" /> PIN salah, coba lagi
          </p>
        )}

        {/* Tactile Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-[220px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="h-14 w-14 rounded-full bg-[var(--color-surface-2)] hover:bg-[var(--color-border-soft)] active:scale-95 text-lg font-semibold text-[var(--color-text)] font-tabular border border-[var(--color-border-soft)] flex items-center justify-center mx-auto transition-all cursor-pointer"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-14 w-14 rounded-full text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] flex items-center justify-center mx-auto transition-colors cursor-pointer"
          >
            Hapus
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-14 w-14 rounded-full bg-[var(--color-surface-2)] hover:bg-[var(--color-border-soft)] active:scale-95 text-lg font-semibold text-[var(--color-text)] font-tabular border border-[var(--color-border-soft)] flex items-center justify-center mx-auto transition-all cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-14 w-14 rounded-full bg-[var(--color-surface-2)] hover:bg-[var(--color-border-soft)] active:scale-95 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] border border-[var(--color-border-soft)] flex items-center justify-center mx-auto transition-all cursor-pointer"
            aria-label="Backspace"
          >
            <Delete className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 pt-3 border-t border-[var(--color-border-soft)]">
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] flex items-center justify-center gap-1 mx-auto transition-colors cursor-pointer"
          >
            <KeyRound className="h-3 w-3" /> {showHint ? 'Tutup bantuan' : 'Bantuan PIN'}
          </button>
          {showHint && (
            <p className="mt-2 text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface-2)] p-2 rounded-[var(--radius-sm)] border border-[var(--color-border-soft)] font-mono">
              PIN default demo: <strong className="text-[var(--color-text)]">{correctPin}</strong>. Dapat diganti di Setelan.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
