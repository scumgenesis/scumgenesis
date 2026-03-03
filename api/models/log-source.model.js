/**
 * Camada de acesso a dados: listagem e download de logs admin no SFTP.
 * Sem cache - apenas I/O com o SFTP.
 * Usa limite de concorrência (SFTP_CONCURRENCY) e single-flight para evitar
 * múltiplas conexões para o mesmo recurso quando vários usuários pedem ao mesmo tempo.
 */

import pLimit from 'p-limit';
import { createSftpClient, listFiles, getFile } from '../clients/sftp-client.js';
import { isValidAdminLogFilename } from '../utils/validation.js';
import config from '../config/config.js';

const sftpLimit = pLimit(config.sftpConcurrency);

const inFlightListing = new Map();
const inFlightFile = new Map();

/**
 * Converte timestamp do SFTP para ISO. Aceita segundos (até 1e12) ou milissegundos.
 * @param {number} time - segundos ou ms desde epoch
 * @returns {string|null} data em ISO ou null
 */
function toISO(time) {
  if (time == null || time <= 0) return null;
  const ms = time < 1e12 ? time * 1000 : time;
  return new Date(ms).toISOString();
}

/**
 * Lista arquivos admin no SFTP (operação real, uma por vez dentro do limite).
 * @param {number} [days=7]
 */
async function doFetchAdminLogListing(days = 7) {
  const client = await createSftpClient();
  try {
    const files = await listFiles(client);
    const cutoffMs = Date.now() - days * 24 * 60 * 60 * 1000;

    const adminLogs = files
      .filter((f) => f.type === '-' && isValidAdminLogFilename(f.name))
      .filter((f) =>
        f.modifyTime != null
          ? (f.modifyTime < 1e12 ? f.modifyTime * 1000 : f.modifyTime) >= cutoffMs
          : false
      )
      .sort((a, b) => (b.modifyTime ?? 0) - (a.modifyTime ?? 0))
      .map((f) => ({
        name: f.name,
        size: f.size,
        lastModified: toISO(f.modifyTime),
        lastAccess: toISO(f.accessTime),
      }));

    return adminLogs;
  } finally {
    await client.end();
  }
}

/**
 * Lista arquivos admin no SFTP.
 * Requisições concorrentes para o mesmo `days` compartilham uma única operação (single-flight).
 * @param {number} [days=7]
 * @returns {Promise<Array<{ name: string, size: number, lastModified: string|null, lastAccess: string|null }>>}
 */
export async function fetchAdminLogListing(days = 7) {
  const key = `listing:${days}`;
  let promise = inFlightListing.get(key);
  if (promise) return promise;
  promise = sftpLimit(() => doFetchAdminLogListing(days)).finally(() => {
    inFlightListing.delete(key);
  });
  inFlightListing.set(key, promise);
  return promise;
}

/**
 * Baixa o conteúdo do arquivo do SFTP para um buffer (operação real).
 * @param {string} filename - nome validado do arquivo
 */
async function doFetchAdminLogFile(filename) {
  const client = await createSftpClient();
  try {
    const dir = process.env.FTP_DIR || '/';
    const files = await client.list(dir);
    const exists = files.some((f) => f.type === '-' && f.name === filename);

    if (!exists) {
      const err = new Error('Arquivo não encontrado');
      err.code = 'NOT_FOUND';
      throw err;
    }

    const adminByModify = files
      .filter((f) => f.type === '-' && isValidAdminLogFilename(f.name))
      .sort((a, b) => (b.modifyTime ?? 0) - (a.modifyTime ?? 0));
    const newestFilename = adminByModify[0]?.name ?? null;

    const fileEntry = files.find((f) => f.type === '-' && f.name === filename);
    if (
      fileEntry != null &&
      typeof fileEntry.size === 'number' &&
      fileEntry.size > config.maxLogFileSizeBytes
    ) {
      const err = new Error('Arquivo de log demasiado grande');
      err.code = 'FILE_TOO_LARGE';
      throw err;
    }

    let buffer;
    try {
      buffer = await getFile(client, filename);
    } catch (readErr) {
      const err = new Error('Falha ao ler arquivo no servidor remoto');
      err.code = 'SFTP_READ_ERROR';
      err.cause = readErr;
      throw err;
    }

    return { buffer: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer), newestFilename };
  } finally {
    const noop = () => {};
    client.on('error', noop);
    await client.end().catch(noop);
    client.removeListener('error', noop);
  }
}

/**
 * Baixa o conteúdo do arquivo do SFTP para um buffer.
 * Requisições concorrentes para o mesmo arquivo compartilham uma única operação (single-flight).
 * @param {string} filename - nome validado do arquivo
 * @returns {Promise<{ buffer: Buffer, newestFilename: string|null }>}
 * @throws {Error} NOT_FOUND se o arquivo não existir
 * @throws {Error} SFTP_READ_ERROR se a leitura remota falhar (conexão fechada, timeout, etc.)
 */
export async function fetchAdminLogFile(filename) {
  const key = `file:${filename}`;
  let promise = inFlightFile.get(key);
  if (promise) return promise;
  promise = sftpLimit(() => doFetchAdminLogFile(filename)).finally(() => {
    inFlightFile.delete(key);
  });
  inFlightFile.set(key, promise);
  return promise;
}
