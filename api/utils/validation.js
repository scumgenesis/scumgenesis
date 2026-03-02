/**
 * Validação e regex para nomes de log admin.
 * Proteção contra path traversal (ex.: ../../arquivo-proibido.log) e nomes inválidos.
 */

export const ADMIN_LOG_REGEX = /^admin_.*\.log$/;

/**
 * Caracteres e sequências que indicam path (traversal ou absoluto/relativo).
 * Impede acessar arquivos fora do diretório de logs (ex.: ../, ..\, /, \).
 */
function containsPathComponents(str) {
  return str.includes('..') || str.includes('/') || str.includes('\\');
}

/**
 * Verifica se o nome do arquivo é permitido (admin_*.log) e seguro.
 * @param {string} filename - nome do arquivo (apenas nome, sem path)
 * @returns {boolean}
 */
export function isValidAdminLogFilename(filename) {
  if (typeof filename !== 'string' || filename.length === 0) return false;

  if (containsPathComponents(filename)) return false;

  try {
    const decoded = decodeURIComponent(filename);
    if (decoded !== filename && containsPathComponents(decoded)) return false;
  } catch (_) {
    return false;
  }

  return ADMIN_LOG_REGEX.test(filename);
}
