import * as lootService from '../services/loot.service.js';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const listPresetsOverride = async (req, res) => {
  const directories = await lootService.listPresetsOverride();
  res.json({ directories });
};
