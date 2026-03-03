import { Router } from 'express';
import { catchAsync } from '../../utils/catch-async.js';
import * as lootController from '../../controllers/loot.controller.js';
import { listRateLimiter } from '../../middlewares/rate-limit.middleware.js';

const router = Router();

router.get('/presets/override', listRateLimiter, catchAsync(lootController.listPresetsOverride));

export default router;
