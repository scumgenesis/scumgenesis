/**
 * Agregador de rotas v1.
 */

import { Router } from 'express';
import logsRoute from './logs.route.js';
import lootRoute from './loot.route.js';

const router = Router();

router.use('/logs', logsRoute);
router.use('/loot', lootRoute);

export default router;
