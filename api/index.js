/**
 * Entry point - carrega env da pasta api, inicia servidor.
 * Graceful shutdown em SIGTERM.
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config as loadEnv } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: join(__dirname, '.env') });

import app from './app.js';
import config from './config/config.js';

let server;

server = app.listen(config.port, () => {
  console.log(`[server] Proxy de logs rodando na porta ${config.port}`);
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      console.log('[server] Servidor encerrado');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (err) => {
  console.error(err);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  if (server) server.close();
});
