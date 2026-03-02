/**
 * Serviço de logs - orquestra cache e fonte (SFTP).
 * Listagem e download: primeiro tenta cache; em caso de miss, busca na fonte e preenche o cache.
 */

import { Readable } from 'stream';
import { isValidAdminLogFilename } from '../utils/validation.js';
import config from '../config/config.js';
import {
  getCachedListing,
  setListing,
  getCachedFile,
  setFile,
  getNewestFilenameFromListing,
} from '../models/log-cache.model.js';
import { fetchAdminLogListing, fetchAdminLogFile } from '../models/log-source.model.js';

/**
 * Lista arquivos admin: retorna do cache se válido, senão busca no SFTP e armazena no cache.
 * @param {number} [days=7]
 * @returns {Promise<Array<{ name: string, size: number, lastModified: string|null, lastAccess: string|null }>>}
 */
export async function listAdminLogs(days = 7) {
  const cached = getCachedListing(days);
  if (cached) return cached;

  const data = await fetchAdminLogListing(days);
  setListing(days, data);
  return data;
}

/**
 * Retorna stream do arquivo. Nome deve ser validado antes.
 * @param {string} filename
 * @returns {Promise<{ stream: import('stream').Readable; client: null }>}
 */
export async function getAdminLogStream(filename) {
  if (!isValidAdminLogFilename(filename)) {
    const err = new Error('Nome de arquivo inválido');
    err.code = 'INVALID_FILENAME';
    throw err;
  }

  const isNewest = getNewestFilenameFromListing(7) === filename;
  const cachedBuffer = getCachedFile(filename, isNewest);
  if (cachedBuffer && cachedBuffer.length <= config.maxLogFileSizeBytes) {
    return { stream: Readable.from(cachedBuffer), client: null };
  }

  const { buffer, newestFilename } = await fetchAdminLogFile(filename);
  setFile(filename, buffer, newestFilename === filename);
  return { stream: Readable.from(buffer), client: null };
}
