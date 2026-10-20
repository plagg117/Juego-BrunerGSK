/** Niveles de pista que existen: 1 (orientación), 2 (concreta) y 3 (casi la respuesta). */
export const MAX_HINT_LEVEL = 3;

/**
 * Elige el texto de una pista según su nivel. Si la lista tiene menos textos
 * que niveles, se usa el último disponible.
 *
 * @param {string[]|undefined} hints - Textos de pista, del más suave al más explícito.
 * @param {number} level - Nivel pedido (desde 1).
 * @returns {string|null} El texto, o null si la lista está vacía.
 */
export function pickHint(hints, level) {
  if (!Array.isArray(hints) || hints.length === 0) {
    return null;
  }
  const index = Math.min(Math.max(level, 1), hints.length) - 1;
  return hints[index];
}