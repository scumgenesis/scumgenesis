export const ADMIN_LOG_REGEX = /^admin_.*\.log$/;

function containsPathComponents(str) {
  return str.includes('..') || str.includes('/') || str.includes('\\');
}

/**
 * @param {string} filename - nome do arquivo (apenas nome, sem path)
 * @returns {boolean}
 */
export function isValidAdminLogFilename(filename) {
  if (typeof filename !== 'string' || filename.length === 0) return false;

  if (containsPathComponents(filename)) return false;

  try {
    const decoded = decodeURIComponent(filename);
    if (decoded !== filename && containsPathComponents(decoded)) return false;
  } catch {
    return false;
  }

  return ADMIN_LOG_REGEX.test(filename);
}
