/**
 * Decodificação de buffers para string (UTF-8 / UTF-16).
 * Ficheiros de log do Windows são frequentemente UTF-16 LE (com ou sem BOM).
 * Sem BOM: tenta UTF-16 LE primeiro; se o resultado parecer texto de log válido, usa; senão tenta UTF-8.
 * Pode ser reutilizado por qualquer código que leia ficheiros de texto do FTP/SFTP.
 *
 * @param {Buffer} buffer - buffer bruto do ficheiro
 * @returns {string} conteúdo em string (UTF-8)
 */
export function bufferToUtf8String(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) return '';
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    return buffer.toString('utf16le', 2);
  }
  if (buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
    return buffer.toString('utf16be', 2);
  }
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    return buffer.toString('utf8', 3);
  }
  if (buffer.length >= 4) {
    const asUtf16 = buffer.toString('utf16le');
    const hasCommand = asUtf16.includes('Command:');
    const hasDatePattern = /^\d{4}\.\d{2}\.\d{2}/m.test(asUtf16);
    const hasGameVersion = asUtf16.includes('Game version');
    if (hasCommand || hasDatePattern || hasGameVersion) {
      return asUtf16;
    }
  }
  const asUtf8 = buffer.toString('utf8');
  const looksLikeUtf8 =
    !asUtf8.includes('\u0000') &&
    (asUtf8.includes('Command:') ||
      /^\d{4}\.\d{2}\.\d{2}/m.test(asUtf8) ||
      asUtf8.includes('Game version'));
  if (looksLikeUtf8) return asUtf8;
  return asUtf8;
}
