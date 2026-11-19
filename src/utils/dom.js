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

/**
 * Lleva la pantalla hasta un elemento, con desplazamiento suave (o directo, si
 * la persona prefiere menos movimiento). Útil en el celular, donde lo nuevo
 * suele aparecer fuera de la zona visible.
 *
 * @param {HTMLElement} element - Elemento que debe quedar a la vista.
 */
export function scrollToElement(element) {
  if (typeof element.scrollIntoView !== "function") {
    return;
  }
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  element.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}