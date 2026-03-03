import SftpClient from 'ssh2-sftp-client';

const FTP_TIMEOUT_MS = Number(process.env.FTP_TIMEOUT) || 30000;

/**
 * @returns {Promise<SftpClient>} cliente conectado
 */
export async function createSftpClient() {
  const hostEnv = process.env.FTP_HOST;
  const user = process.env.FTP_USER;
  const password = process.env.FTP_PASSWORD;

  if (!hostEnv || !user || !password) {
    throw new Error('FTP_HOST, FTP_USER e FTP_PASSWORD são obrigatórios no .env');
  }

  let host = hostEnv;
  let port = Number(process.env.FTP_PORT) || 22;
  if (hostEnv.includes(':')) {
    const [h, p] = hostEnv.split(':');
    host = h;
    port = Number(p) || port;
  }

  const client = new SftpClient();
  await client.connect({
    host,
    port,
    username: user,
    password,
    readyTimeout: FTP_TIMEOUT_MS,
    keepaliveInterval: 15000,
  });

  return client;
}

/**
 * @param {SftpClient} client - cliente já conectado
 * @returns {Promise<Array<{ name: string, type: string, modifyTime: number }>>} lista de entradas
 */
export async function listFiles(client) {
  const dir = process.env.FTP_DIR || '/';
  return client.list(dir);
}

/**
 * @param {SftpClient} client - cliente já conectado
 * @param {string} remotePath - path absoluto no SFTP (ex.: /pasta/Config/WindowsServer/Loot/Spawners/Presets/Override)
 * @returns {Promise<Array<{ name: string, type: string, size?: number, modifyTime?: number }>>} lista de entradas
 */
export async function listDir(client, remotePath) {
  return client.list(remotePath);
}

/**
 * @param {SftpClient} client - cliente já conectado
 * @param {string} filename - nome do arquivo (apenas nome, não path completo)
 * @returns {Promise<Buffer>}
 */
export function getFile(client, filename) {
  const dir = process.env.FTP_DIR || '/';
  const remotePath = dir.endsWith('/') ? `${dir}${filename}` : `${dir}/${filename}`;
  return client.get(remotePath);
}
