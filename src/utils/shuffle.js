/**
 * Mezcla un arreglo con el algoritmo Fisher-Yates y devuelve una copia.
 * El arreglo original no se modifica.
 *
 * @template T
 * @param {T[]} items - Elementos a mezclar.
 * @param {() => number} [random=Math.random] - Función que devuelve un
 *   número entre 0 y 1. Se puede reemplazar para hacer pruebas predecibles.
 * @returns {T[]} Copia mezclada.
 */
export function shuffle(items, random = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}