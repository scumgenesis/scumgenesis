import { withCache } from './cache';
import { getErrorMessage } from './errors';

const API_ROOT = (import.meta.env.VITE_API_URL ?? '/logs').replace(/\/logs\/?$/, '') || '';
const LOOT_BASE = `${API_ROOT}/loot`;

export interface PresetItem {
  name: string;
  type: 'file' | 'directory';
  /** Data da última modificação (ISO) quando disponível */
  lastModified?: string | null;
}

export interface PresetDirectory {
  name: string;
  type: 'directory';
  items: PresetItem[];
}

export interface PresetsOverrideResponse {
  directories: PresetDirectory[];
}

export async function fetchPresetsOverride(): Promise<PresetsOverrideResponse> {
  return withCache('loot-presets-override', async () => {
    const res = await fetch(`${LOOT_BASE}/presets/override`);
    if (!res.ok) {
      const message = await getErrorMessage(res, 'Erro ao carregar Presets/Override.');
      throw new Error(message);
    }
    return res.json();
  });
}
