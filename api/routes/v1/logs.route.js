/**
 * Rotas de logs - proxy admin.
 * GET /logs/admin -> lista arquivos
 * GET /logs/admin/:file -> download em stream (com rate limit)
 */

import { Router } from 'express';
import { catchAsync } from '../../utils/catch-async.js';
import * as logController from '../../controllers/log.controller.js';
import { downloadRateLimiter, listRateLimiter } from '../../middlewares/rate-limit.middleware.js';

const router = Router();

router.get('/admin', listRateLimiter, catchAsync(logController.listAdminLogs));
router.get('/admin/:file', downloadRateLimiter, catchAsync(logController.getAdminLogStream));

export default router;
