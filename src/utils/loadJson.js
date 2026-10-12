/**
 * Carga un archivo JSON y devuelve su contenido.
 *
 * @param {string} path - Ruta relativa al index.html (ej. "src/data/rooms.json").
 * @returns {Promise<any>} El contenido del archivo ya convertido a objeto.
 * @throws {Error} Si el archivo no se puede cargar.
 */
export async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`No se pudo cargar "${path}" (código ${response.status}).`);
  }
  return response.json();
}