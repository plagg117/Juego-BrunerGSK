/**
 * Crea un elemento con una clase y, opcionalmente, un texto.
 * Usa `textContent`, así que el texto nunca se interpreta como HTML.
 *
 * @param {string} tag - Nombre de la etiqueta (ej. "div").
 * @param {string} className - Clase CSS del elemento.
 * @param {string} [text] - Texto del elemento.
 * @returns {HTMLElement}
 */
export function createElement(tag, className, text = "") {
  const element = document.createElement(tag);
  element.className = className;
  if (text) {
    element.textContent = text;
  }
  return element;
}

/**
 * Crea un botón con una clase y una función para el clic.
 *
 * @param {string} text - Texto del botón.
 * @param {string} className - Clase CSS del botón.
 * @param {() => void} onClick - Función que se ejecuta al pulsarlo.
 * @returns {HTMLButtonElement}
 */
export function createButton(text, className, onClick) {
  const button = createElement("button", className, text);
  button.type = "button";
  button.addEventListener("click", onClick);
  return button;
}