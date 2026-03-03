import * as logService from '../services/log.service.js';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const listAdminLogs = async (req, res) => {
  const days = Math.min(Math.max(1, parseInt(req.query.days, 10) || 7), 365);
  const files = await logService.listAdminLogs(days);
  res.json(files);
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getAdminLogStream = async (req, res) => {
  const { file } = req.params;
  const { stream, client } = await logService.getAdminLogStream(file);

  const closeClient = () => {
    if (client) client.end().catch((err) => console.error('[sftp] erro ao fechar:', err.message));
  };

  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${file}"; filename*=UTF-8''${encodeURIComponent(file)}`
  );

  res.on('finish', closeClient);
  res.on('error', closeClient);

  stream.on('error', closeClient);
  stream.pipe(res);
};
