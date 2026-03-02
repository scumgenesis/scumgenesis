/**
 * Controller de loot - camada HTTP.
 * GET /loot/presets/override -> listagem de diretórios e arquivos em Presets/Override no SFTP
 */

import * as lootService from '../services/loot.service.js';

/**
 * Lista diretórios e arquivos em Config/WindowsServer/Loot/Spawners/Presets/Override no SFTP.
 * Resposta em cache por 1h; em miss busca no SFTP.
 * Resposta: { directories: [ { name, type: 'directory', items: [ { name, type: 'file'|'directory' } ] } ] }
 */
export const listPresetsOverride = async (req, res) => {
  const directories = await lootService.listPresetsOverride();
  res.json({ directories });
};
