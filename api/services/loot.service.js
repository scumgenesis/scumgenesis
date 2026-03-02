/**
 * Serviço de loot - orquestra cache e fonte (SFTP).
 * Presets/Override: primeiro tenta cache (TTL 1h); em caso de miss, busca no SFTP e preenche o cache.
 */

import { getCachedPresetsOverride, setPresetsOverride } from '../models/loot-cache.model.js';
import { fetchSpawnersPresetsOverride } from '../models/spawners-presets.model.js';

/**
 * Lista diretórios e arquivos em Presets/Override: retorna do cache se válido, senão busca no SFTP e armazena no cache.
 * @returns {Promise<Array<{ name: string, type: 'directory', items: Array<{ name: string, type: 'directory'|'file' }> }>>}
 */
export async function listPresetsOverride() {
  const cached = getCachedPresetsOverride();
  if (cached) return cached;

  const data = await fetchSpawnersPresetsOverride();
  setPresetsOverride(data);
  return data;
}
