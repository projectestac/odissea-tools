/**
 * Parseja el text de la capçalera 'cookie' d'una petició HTTP
 * @param {string} cookieStr - Cadena de text a parsejar
 * @param {string} domain -  Domini per al qual s'ha enviat la cadena
 * @param {object*} options - Opcions diverses. Veure el codi.
 * @returns object[] - Matriu d'objectes amb la informació de cada cookie
 */
export function parseCookieString(cookieStr, domain, options = {}) {
  const { path = '/', decode = true } = options;
  const result = [];
  const cookies = cookieStr.split(';').map(p => p.trim());
  cookies.forEach(cookie => {
    let parts = cookie.split('=').map(p => p.trim());
    if (parts.length === 2) {
      if (decode)
        parts = parts.map(decodeURIComponent);
      result.push({
        name: parts[0],
        value: parts[1],
        domain,
        path,
      });
    }
  });
  return result;
}