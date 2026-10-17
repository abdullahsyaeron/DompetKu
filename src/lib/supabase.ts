import { createClient } from '@supabase/supabase-js';
import { AppData } from '@/types/finance';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * SQL Schema siap pakai untuk pengguna di Supabase Dashboard (SQL Editor)
 */
export const supabaseSchemaSql = `-- 1. Buat tabel penyimpanan data aplikasi
CREATE TABLE IF NOT EXISTS app_data (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  payload JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Aktifkan Row Level Security (RLS) & Berikan Akses Publik (Anon)
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all" ON app_data;
CREATE POLICY "Allow anon all" ON app_data FOR ALL TO anon USING (true) WITH CHECK (true);

-- 3. Aktifkan Realtime Sinkronisasi Antar-Perangkat
ALTER PUBLICATION supabase_realtime ADD TABLE app_data;
`;

/**
 * Ambil data aplikasi terbaru dari Supabase Cloud
 */
export async function fetchCloudAppData(): Promise<AppData | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('app_data')
      .select('payload')
      .eq('id', 'primary')
      .maybeSingle();

    if (error || !data || !data.payload) {
      return null;
    }
    return data.payload as AppData;
  } catch (err) {
    console.error('Gagal mengambil data dari Supabase:', err);
    return null;
  }
}

/**
 * Simpan data aplikasi ke Supabase Cloud
 */
export async function syncCloudAppData(data: AppData): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('app_data').upsert({
      id: 'primary',
      payload: data,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error('Gagal menyimpan ke Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error sinkronisasi Supabase:', err);
    return false;
  }
}

/**
 * Berlangganan (listen) perubahan real-time dari perangkat lain
 */
export function subscribeCloudAppData(
  onUpdate: (data: AppData) => void
): () => void {
  if (!isSupabaseConfigured || !supabase) {
    return () => {};
  }

  try {
    const channel = supabase
      .channel('realtime:app_data')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_data',
          filter: 'id=eq.primary',
        },
        (payload) => {
          if (payload.new && (payload.new as { payload?: AppData }).payload) {
            onUpdate((payload.new as { payload: AppData }).payload);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.error('Error realtime Supabase:', err);
    return () => {};
  }
}
