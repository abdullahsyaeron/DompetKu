import { AppData } from '@/types/finance';
import { initialDummyData, emptyData } from './initialData';

const STORAGE_KEY = 'quirky_finance_app_data';

export const loadAppData = (): AppData => {
  if (typeof window === 'undefined') {
    return initialDummyData;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDummyData));
      return initialDummyData;
    }
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error('Failed to parse localStorage data:', err);
    return initialDummyData;
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

export const resetToDummyData = (): AppData => {
  saveAppData(initialDummyData);
  return initialDummyData;
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
