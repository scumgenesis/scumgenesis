/**
 * Camada de acesso a dados: listagem do diretório Presets/Override no SFTP.
 * Path: {IP}/Config/WindowsServer/Loot/Spawners/Presets/Override — lista diretórios e, dentro de cada um, os arquivos.
 */

import pLimit from 'p-limit';
import { createSftpClient, listDir } from '../clients/sftp-client.js';
import config, { getSpawnersOverridePath } from '../config/config.js';

const sftpLimit = pLimit(config.sftpConcurrency);

/**
 * Converte timestamp do SFTP para ISO. Aceita segundos (até 1e12) ou milissegundos.
 * @param {number} time - segundos ou ms desde epoch
 * @returns {string|null} data em ISO ou null
 */
function toISO(time) {
  if (time == null || time <= 0) return null;
  const ms = time < 1e12 ? time * 1000 : time;
  return new Date(ms).toISOString();
}

/**
 * Lista diretórios e arquivos em Presets/Override (operação real no SFTP).
 * @returns {Promise<Array<{ name: string, type: 'directory', items: Array<{ name: string, type: 'directory'|'file', lastModified?: string|null }> }>>}
 */
async function doFetchSpawnersPresetsOverride() {
  const client = await createSftpClient();
  try {
    const basePath = getSpawnersOverridePath();
    let entries;

    try {
      entries = await listDir(client, basePath);
    } catch (listErr) {
      const err = new Error('Diretório Presets/Override não encontrado no servidor');

      err.code = 'NOT_FOUND';
      err.cause = listErr;

      throw err;
    }

    const directories = entries.filter((e) => e.type === 'd' && e.name !== '.' && e.name !== '..');

    const result = [];
    for (const dir of directories) {
      const dirPath = basePath.endsWith('/') ? `${basePath}${dir.name}` : `${basePath}/${dir.name}`;
      let items = [];

      try {
        const subEntries = await listDir(client, dirPath);
        items = subEntries
          .filter((e) => e.name !== '.' && e.name !== '..')
          .map((e) => ({
            name: e.name,
            type: e.type === 'd' ? 'directory' : 'file',
            lastModified: toISO(e.modifyTime),
          }));
      } catch (listErr) {
        items = [];
      }

      result.push({
        name: dir.name,
        type: 'directory',
        items,
      });
    }

    return result;
  } finally {
    const noop = () => {};
    
    client.on('error', noop);
    await client.end().catch(noop);

    client.removeListener('error', noop);
  }
}

/**
 * Lista diretórios e arquivos em Presets/Override (respeitando limite de concorrência SFTP).
 * @returns {Promise<Array<{ name: string, type: 'directory', items: Array<{ name: string, type: 'directory'|'file', lastModified?: string|null }> }>>}
 */
export async function fetchSpawnersPresetsOverride() {
  return sftpLimit(() => doFetchSpawnersPresetsOverride());
}
