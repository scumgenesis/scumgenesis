const LISTING_TTL_MS = 10 * 60 * 1000;
const FILE_TTL_NEWEST_MS = 10 * 60 * 1000;
const FILE_TTL_OLD_MS = 60 * 60 * 1000;

/** @type {Map<number, { data: Array<{ name: string, size: number, lastModified: string|null, lastAccess: string|null }>, fetchedAt: number }>} */
const listingByDays = new Map();

/** @type {Map<string, { buffer: Buffer, fetchedAt: number, isNewest: boolean }>} */
const fileBuffers = new Map();

/**
 * @param {number} days - dias usados na listagem
 * @returns {Array<{ name: string, size: number, lastModified: string|null, lastAccess: string|null }> | null}
 */
export function getCachedListing(days) {
  const entry = listingByDays.get(days);
  if (!entry || Date.now() - entry.fetchedAt >= LISTING_TTL_MS) return null;
  return entry.data;
}

/**
 * @param {number} days
 * @param {Array<{ name: string, size: number, lastModified: string|null, lastAccess: string|null }>} data
 */
export function setListing(days, data) {
  listingByDays.set(days, { data, fetchedAt: Date.now() });
}

/**
 * @param {number} [days=7]
 * @returns {string | null}
 */
export function getNewestFilenameFromListing(days = 7) {
  const entry = listingByDays.get(days);
  if (!entry || !entry.data.length) return null;
  return entry.data[0].name;
}

/**
 * @param {string} filename
 * @param {boolean} _isNewest - se é o arquivo de log mais recente
 * @returns {Buffer | null}
 */
export function getCachedFile(filename, _isNewest) {
  const entry = fileBuffers.get(filename);
  if (!entry) return null;
  const ttl = entry.isNewest ? FILE_TTL_NEWEST_MS : FILE_TTL_OLD_MS;
  if (Date.now() - entry.fetchedAt >= ttl) return null;
  return entry.buffer;
}

/**
 * @param {string} filename
 * @param {Buffer} buffer
 * @param {boolean} isNewest
 */
export function setFile(filename, buffer, isNewest) {
  fileBuffers.set(filename, { buffer, fetchedAt: Date.now(), isNewest });
}
