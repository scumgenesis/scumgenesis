/**
 * Rate limiters para rotas da API.
 * downloadRateLimiter: download de log (ex.: GET /logs/admin/:file)
 * listRateLimiter: listagens (ex.: GET /logs/admin, GET /loot/presets/override)
 */

import rateLimit from 'express-rate-limit';
import config from '../config/config.js';

const message = { error: 'Muitas requisições. Tente novamente mais tarde.', code: 'TOO_MANY_REQUESTS' };
const handler = (req, res, next, options) => {
  res.status(429).json(options.message);
};

export const downloadRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowSeconds * 1000,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message,
  handler,
});

export const listRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowSeconds * 1000,
  max: config.rateLimitListMax,
  standardHeaders: true,
  legacyHeaders: false,
  message,
  handler,
});
