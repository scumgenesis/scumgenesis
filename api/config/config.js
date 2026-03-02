/**
 * Variáveis de ambiente e configuração.
 * Carregar dotenv antes (feito em index.js).
 */

export const port = Number(process.env.PORT) || 3000;
export const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
export const env = process.env.NODE_ENV || 'development';

export const sftpConcurrency = Number(process.env.SFTP_CONCURRENCY) || 3;

export const rateLimitMax = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 2;
export const rateLimitListMax = Number(process.env.RATE_LIMIT_LIST_MAX_REQUESTS) || 30;
export const rateLimitWindowSeconds = Number(process.env.RATE_LIMIT_WINDOW_SECONDS) || 60;

/** Tamanho máximo de um arquivo de log para download (bytes). Padrão 5 MB. */
export const maxLogFileSizeBytes =
  (Number(process.env.LOG_MAX_FILE_SIZE_MB) || 5) * 1024 * 1024;

export function getSpawnersOverridePath() {
  if (process.env.FTP_PRESETS_OVERRIDE_PATH) {
    return process.env.FTP_PRESETS_OVERRIDE_PATH.replace(/\/+$/, '');
  }

  const ftpDir = process.env.FTP_DIR || '';
  const firstSegment = ftpDir.split('/').filter(Boolean)[0];
  
  if (!firstSegment) {
    return '/Config/WindowsServer/Loot/Spawners/Presets/Override';
  }

  return `/${firstSegment}/Config/WindowsServer/Loot/Spawners/Presets/Override`;
}

export default { port, corsOrigin, env, sftpConcurrency, rateLimitMax, rateLimitListMax, rateLimitWindowSeconds, maxLogFileSizeBytes, getSpawnersOverridePath };
