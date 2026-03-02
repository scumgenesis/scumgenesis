/**
 * Cache em memória para listagem Presets/Override (loot).
 * TTL: 1 hora.
 */

const PRESETS_OVERRIDE_TTL_MS = 60 * 60 * 1000; // 1 hora

/** @type {{ data: Array<{ name: string, type: 'directory', items: Array<{ name: string, type: 'directory'|'file' }> }>, fetchedAt: number } | null} */
let presetsOverrideEntry = null;

/**
 * Retorna a listagem Presets/Override em cache se ainda válida (TTL 1h).
 * @returns {Array<{ name: string, type: 'directory', items: Array<{ name: string, type: 'directory'|'file' }> }> | null}
 */
export function getCachedPresetsOverride() {
  if (!presetsOverrideEntry || Date.now() - presetsOverrideEntry.fetchedAt >= PRESETS_OVERRIDE_TTL_MS) {
    return null;
  }
  return presetsOverrideEntry.data;
}

/**
 * Armazena listagem Presets/Override no cache.
 * @param {Array<{ name: string, type: 'directory', items: Array<{ name: string, type: 'directory'|'file' }> }>} data
 */
export function setPresetsOverride(data) {
  presetsOverrideEntry = { data, fetchedAt: Date.now() };
}
