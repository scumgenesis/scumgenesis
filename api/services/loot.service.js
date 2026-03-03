import { getCachedPresetsOverride, setPresetsOverride } from '../models/loot-cache.model.js';
import { fetchSpawnersPresetsOverride } from '../models/spawners-presets.model.js';

/**
 * @returns {Promise<Array<{ name: string, type: 'directory', items: Array<{ name: string, type: 'directory'|'file', lastModified?: string|null }> }>>}
 */
export async function listPresetsOverride() {
  const cached = getCachedPresetsOverride();
  if (cached) return cached;

  const data = await fetchSpawnersPresetsOverride();
  setPresetsOverride(data);
  return data;
}
