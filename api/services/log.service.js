/**
 * Serviço de logs - orquestra cache e fonte (SFTP).
 * Fluxo:
 * 1. Carregar o ficheiro na memória (baixado do FTP).
 * 2. Ler linha a linha e aplicar a máscara NA LINHA.
 * 3. Guardar todo o conteúdo pós-máscara na memória (cache).
 * 4. Devolver ao utilizador o conteúdo da memória (stream do buffer em cache).
 */

import { Readable } from 'stream';
import { isValidAdminLogFilename } from '../utils/validation.js';
import { maskLogContent } from '../utils/mask-log.js';
import { bufferToUtf8String } from '../utils/buffer-encoding.js';
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
 * Baixa o ficheiro do FTP, aplica máscara linha a linha e devolve o conteúdo.
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

  const { buffer: rawBuffer, newestFilename } = await fetchAdminLogFile(filename);

  const contentInMemory = bufferToUtf8String(rawBuffer);
  const maskedContent = maskLogContent(contentInMemory);
  const maskedBuffer = Buffer.from(maskedContent, 'utf8');

  setFile(filename, maskedBuffer, newestFilename === filename);

  return { stream: Readable.from(maskedBuffer), client: null };
}
