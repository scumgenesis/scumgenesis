const PRESETS_OVERRIDE_TTL_MS = 60 * 60 * 1000;

/** @type {{ data: Array<{ name: string, type: 'directory', items: Array<{ name: string, type: 'directory'|'file', lastModified?: string|null }> }>, fetchedAt: number } | null} */
let presetsOverrideEntry = null;

/**
 * @returns {Array<{ name: string, type: 'directory', items: Array<{ name: string, type: 'directory'|'file', lastModified?: string|null }> }> | null}
 */
export function getCachedPresetsOverride() {
  if (
    !presetsOverrideEntry ||
    Date.now() - presetsOverrideEntry.fetchedAt >= PRESETS_OVERRIDE_TTL_MS
  ) {
    return null;
  }
  return presetsOverrideEntry.data;
}

/**
 * @param {Array<{ name: string, type: 'directory', items: Array<{ name: string, type: 'directory'|'file', lastModified?: string|null }> }>} data
 */
export function setPresetsOverride(data) {
  presetsOverrideEntry = { data, fetchedAt: Date.now() };
}
