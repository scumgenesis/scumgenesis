/**
 * Cliente SFTP - encapsula conexão e operações com ssh2-sftp-client.
 * Usado quando o servidor é SFTP (ex.: sftp://host:8822).
 * Garante timeout, fechamento de conexão e não expõe credenciais em erros.
 */

import SftpClient from 'ssh2-sftp-client';

const FTP_TIMEOUT_MS = Number(process.env.FTP_TIMEOUT) || 30000;

/**
 * Cria e conecta cliente SFTP com credenciais do .env.
 * FTP_HOST pode ser "host" ou "host:porta" (ex.: 138.199.5.114:8822).
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
 * Lista arquivos no diretório configurado (FTP_DIR).
 * @param {SftpClient} client - cliente já conectado
 * @returns {Promise<Array<{ name: string, type: string, modifyTime: number }>>} lista de entradas
 */
export async function listFiles(client) {
  const dir = process.env.FTP_DIR || '/';
  return client.list(dir);
}

/**
 * Lista entradas (arquivos e diretórios) em um path remoto.
 * @param {SftpClient} client - cliente já conectado
 * @param {string} remotePath - path absoluto no SFTP (ex.: /pasta/Config/WindowsServer/Loot/Spawners/Presets/Override)
 * @returns {Promise<Array<{ name: string, type: string, size?: number, modifyTime?: number }>>} lista de entradas
 */
export async function listDir(client, remotePath) {
  return client.list(remotePath);
}

/**
 * Baixa o arquivo remoto para um buffer (usa get() do cliente; evita race no cleanup do stream).
 * @param {SftpClient} client - cliente já conectado
 * @param {string} filename - nome do arquivo (apenas nome, não path completo)
 * @returns {Promise<Buffer>}
 */
export function getFile(client, filename) {
  const dir = process.env.FTP_DIR || '/';
  const remotePath = dir.endsWith('/') ? `${dir}${filename}` : `${dir}/${filename}`;
  return client.get(remotePath);
}
