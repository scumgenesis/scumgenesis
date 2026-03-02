/**
 * Validação e regex para nomes de log admin.
 * Proteção contra path traversal e nomes inválidos.
 */

export const ADMIN_LOG_REGEX = /^admin_.*\.log$/;

/**
 * Verifica se o nome do arquivo é permitido (admin_*.log) e seguro.
 * @param {string} filename - nome do arquivo
 * @returns {boolean}
 */
export function isValidAdminLogFilename(filename) {
  if (typeof filename !== 'string' || filename.length === 0) return false;
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) return false;

  return ADMIN_LOG_REGEX.test(filename);
}
