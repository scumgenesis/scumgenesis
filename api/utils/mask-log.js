/**
 * Máscara para dados sensíveis em linhas de log (Steam ID e coordenadas X,Y,Z).
 * O nome do jogador após os dois pontos não é mascarado.
 * Não oculta todos os caracteres: mantém início/fim visíveis no Steam ID e nas coordenadas.
 */

const STEAM_ID_LENGTH = 17;
const STEAM_ID_VISIBLE_START = 4;
const STEAM_ID_VISIBLE_END = 4;

/**
 * Mascara Steam ID mostrando os primeiros e últimos dígitos.
 * Ex.: 76562222222203949 → 7656********03949
 */
function maskSteamId(id) {
  if (id.length !== STEAM_ID_LENGTH) return '*'.repeat(STEAM_ID_LENGTH);
  const start = id.slice(0, STEAM_ID_VISIBLE_START);
  const end = id.slice(-STEAM_ID_VISIBLE_END);
  const mid = '*'.repeat(STEAM_ID_LENGTH - STEAM_ID_VISIBLE_START - STEAM_ID_VISIBLE_END);
  return start + mid + end;
}

/**
 * Substitui apenas o Steam ID (17 dígitos) por versão mascarada; o nome após ':' fica visível.
 * Ex.: 76561199086420187:GENESIS BOT(4) → 7656********0187:GENESIS BOT(4)
 */
function maskSteamIdsAndNames(text) {
  // Regex limitada: 17 dígitos fixos, nome sem quantificadores aninhados (safe).
  return text.replace(
    // eslint-disable-next-line security/detect-unsafe-regex -- Steam ID fixo (17), nome delimitado por caracteres seguros
    /(\d{17}):([^'"`\u2018\u2019\u201c\u201d()]+)(\(\d+\))?/g,
    (_, steamId, name, parens) => {
      const maskedId = maskSteamId(steamId);
      return `${maskedId}:${name}${parens || ''}`;
    }
  );
}

const COORD_VISIBLE_START = 3;
const COORD_VISIBLE_END = 2;

/**
 * Mascara um valor numérico (coordenada) mostrando os primeiros e últimos caracteres.
 * Ex.: -489593.344 → -489***44   ou   880.680 → 880***80
 */
function maskCoordValue(value) {
  const s = String(value);
  if (s.length <= COORD_VISIBLE_START + COORD_VISIBLE_END) return '***';
  const start = s.slice(0, COORD_VISIBLE_START);
  const end = s.slice(-COORD_VISIBLE_END);
  return start + '***' + end;
}

/**
 * Substitui valores de coordenadas X=, Y=, Z= mantendo alguns dígitos visíveis.
 */
function maskCoordinates(text) {
  return text
    .replace(/X=(-?[\d.]+)/g, (_, num) => 'X=' + maskCoordValue(num))
    .replace(/Y=(-?[\d.]+)/g, (_, num) => 'Y=' + maskCoordValue(num))
    .replace(/Z=(-?[\d.]+)/g, (_, num) => 'Z=' + maskCoordValue(num));
}

/**
 * Aplica máscaras a uma única linha de log (Steam ID e coordenadas; nome visível).
 * @param {string} line - Uma linha de texto
 * @returns {string} Linha com dados sensíveis mascarados
 */
function maskLogLine(line) {
  if (typeof line !== 'string') return line;
  return maskCoordinates(maskSteamIdsAndNames(line));
}

/**
 * Aplica todas as máscaras ao conteúdo de log, processando linha a linha.
 * Cada linha é mascarada na linha (Steam ID e coordenadas; nome do jogador visível).
 * Remove BOM UTF-8 se existir.
 * @param {string} content - Conteúdo bruto do arquivo de log (em memória)
 * @returns {string} Conteúdo com Steam IDs e coordenadas mascarados (linha a linha)
 */
export function maskLogContent(content) {
  if (typeof content !== 'string') return content;
  let normalized = content.startsWith('\uFEFF') ? content.slice(1) : content;
  const lines = normalized.split(/\r?\n/);
  const maskedLines = lines.map((line) => maskLogLine(line));
  return maskedLines.join('\n');
}
