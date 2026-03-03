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
