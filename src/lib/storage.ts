import { AppData } from '@/types/finance';
import { emptyData } from './initialData';

const STORAGE_KEY = 'quirky_finance_app_data';

export const loadAppData = (): AppData => {
  if (typeof window === 'undefined') {
    return emptyData;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(emptyData));
      return emptyData;
    }
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error('Failed to parse localStorage data:', err);
    return emptyData;
  }
};

export const saveAppData = (data: AppData): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save data to localStorage:', err);
  }
};

export const resetToEmptyData = (): AppData => {
  saveAppData(emptyData);
  return emptyData;
};

export { formatRupiah, maskBalance } from './financeCalculations';

export const formatDateID = (isoString: string): string => {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
};

export const formatTimeID = (isoString: string): string => {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};
