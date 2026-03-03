import config from '../config/config.js';

function sendError(res, status, message, code) {
  const body = { error: message, code };
  res.status(status).json(body);
}

export function errorHandler(err, req, res, next) {
  console.error('[error]', err.message);
  if (err.stack && config.env !== 'production') {
    console.error(err.stack);
  }

  if (res.headersSent) {
    return next(err);
  }

  if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
    return sendError(
      res,
      502,
      'Serviço de arquivos temporariamente indisponível. Tente novamente em alguns instantes.',
      'SERVICE_UNAVAILABLE'
    );
  }

  if (err.code === 'SFTP_READ_ERROR') {
    return sendError(
      res,
      502,
      'Falha ao ler arquivo no servidor remoto. Tente novamente.',
      'REMOTE_READ_ERROR'
    );
  }

  if (err.code === 'INVALID_FILENAME') {
    return sendError(res, 403, 'Nome de arquivo não permitido.', 'INVALID_FILENAME');
  }

  if (err.code === 'NOT_FOUND') {
    return sendError(res, 404, 'Arquivo não encontrado.', 'NOT_FOUND');
  }

  if (err.code === 'FILE_TOO_LARGE') {
    return sendError(res, 413, 'Arquivo de log demasiado grande.', 'FILE_TOO_LARGE');
  }

  const message = 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
  const body = { error: message, code: 'INTERNAL_ERROR' };
  if (config.env !== 'production' && err.message) {
    body.detail = err.message;
  }
  res.status(500).json(body);
}
