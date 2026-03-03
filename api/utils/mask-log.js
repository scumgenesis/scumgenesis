const STEAM_ID_LENGTH = 17;
const STEAM_ID_VISIBLE_START = 4;
const STEAM_ID_VISIBLE_END = 4;

function maskSteamId(id) {
  if (id.length !== STEAM_ID_LENGTH) return '*'.repeat(STEAM_ID_LENGTH);
  const start = id.slice(0, STEAM_ID_VISIBLE_START);
  const end = id.slice(-STEAM_ID_VISIBLE_END);
  const mid = '*'.repeat(STEAM_ID_LENGTH - STEAM_ID_VISIBLE_START - STEAM_ID_VISIBLE_END);
  return start + mid + end;
}

function maskSteamIdsAndNames(text) {
  return text.replace(
    /* eslint-disable-next-line security/detect-unsafe-regex */
    /(\d{17}):([^'"`\u2018\u2019\u201c\u201d()]+)(\(\d+\))?/g,
    (_, steamId, name, parens) => {
      const maskedId = maskSteamId(steamId);
      return `${maskedId}:${name}${parens || ''}`;
    }
  );
}

function maskStandaloneSteamIds(text) {
  return text.replace(
    /* eslint-disable-next-line security/detect-unsafe-regex */
    /\b(\d{17})\b/g,
    (_, steamId) => maskSteamId(steamId)
  );
}

const COORD_VISIBLE_START = 3;
const COORD_VISIBLE_END = 2;

function maskCoordValue(value) {
  const s = String(value);
  if (s.length <= COORD_VISIBLE_START + COORD_VISIBLE_END) return '***';
  const start = s.slice(0, COORD_VISIBLE_START);
  const end = s.slice(-COORD_VISIBLE_END);
  return start + '***' + end;
}

function maskCoordinates(text) {
  return text
    .replace(/X=(-?[\d.]+)/g, (_, num) => 'X=' + maskCoordValue(num))
    .replace(/Y=(-?[\d.]+)/g, (_, num) => 'Y=' + maskCoordValue(num))
    .replace(/Z=(-?[\d.]+)/g, (_, num) => 'Z=' + maskCoordValue(num));
}

/**
 * @param {string} line - Uma linha de texto
 * @returns {string} Linha com dados sensíveis mascarados
 */
function maskLogLine(line) {
  if (typeof line !== 'string') return line;
  return maskCoordinates(maskStandaloneSteamIds(maskSteamIdsAndNames(line)));
}

/**
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
