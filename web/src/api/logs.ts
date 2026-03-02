import { withCache } from './cache';
import { getErrorMessage } from './errors';

const API_BASE = import.meta.env.VITE_API_URL ?? '/logs';

export interface LogFile {
  name: string;
  size: number;
  lastModified: string | null;
  lastAccess: string | null;
}

const CACHE_KEY_LOG_LIST = 'logs-list';

export async function fetchLogList(): Promise<LogFile[]> {
  return withCache(CACHE_KEY_LOG_LIST, async () => {
    const res = await fetch(`${API_BASE}/admin`);
    if (!res.ok) {
      const message = await getErrorMessage(res, 'Erro ao carregar lista.');
      throw new Error(message);
    }
    return res.json();
  });
}

export async function downloadLog(filename: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/${encodeURIComponent(filename)}`);
  if (!res.ok) {
    const message = await getErrorMessage(res, 'Erro ao baixar arquivo.');
    throw new Error(message);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
