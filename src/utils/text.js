/**
 * Reemplaza marcas como {player} por los valores indicados.
 * Las marcas que no tienen valor se dejan tal cual, para que se noten.
 *
 * @param {string} text - Texto con marcas entre llaves.
 * @param {Object<string, string>} values - Valor de cada marca.
 * @returns {string}
 * @example fillPlaceholders("Hola, {player}", { player: "Karen" }) // "Hola, Karen"
 */
export function fillPlaceholders(text, values) {
  return text.replace(/\{(\w+)\}/g, (match, key) =>
    Object.hasOwn(values, key) ? String(values[key]) : match
  );
}

/**
 * Une nombres en una frase: «A», «A y B», «A, B y C».
 *
 * @param {string[]} names
 * @returns {string} Cadena vacía si no hay nombres.
 */
export function joinNames(names) {
  if (names.length === 0) {
    return "";
  }
  if (names.length === 1) {
    return names[0];
  }
  return `${names.slice(0, -1).join(", ")} y ${names.at(-1)}`;
}