import { createElement, createButton } from "../utils/dom.js";

/**
 * Vista de la pantalla de desenlace. Muestra el título del final, su relato
 * y un botón para jugar de nuevo. Los textos llegan ya listos (con los nombres
 * puestos): la vista solo los dibuja.
 */
export class EndingView {
  #container;

  /**
   * @param {HTMLElement} container - Elemento donde se dibujará el final.
   */
  constructor(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("EndingView: se necesita un elemento HTML como contenedor.");
    }
    this.#container = container;
  }

  /**
   * Muestra el final.
   * @param {Object} ending
   * @param {"A"|"B"} ending.type
   * @param {string} ending.title
   * @param {string[]} ending.paragraphs
   * @param {string} ending.restartLabel - Texto del botón de jugar de nuevo.
   * @param {() => void} onRestart
   */
  show({ type, title, paragraphs, restartLabel }, onRestart) {
    const section = createElement("section", `ending is-${type}`);
    section.setAttribute("aria-label", title);

    const story = createElement("div", "ending__story");
    paragraphs.forEach((paragraph) =>
      story.append(createElement("p", "ending__paragraph", paragraph))
    );

    const button = createButton(restartLabel, "ending__button", onRestart);
    section.append(createElement("h2", "ending__title", title), story, button);

    this.#container.hidden = false;
    this.#container.replaceChildren(section);
    button.focus();
  }

  /** Oculta y vacía el final. */
  hide() {
    this.#container.replaceChildren();
    this.#container.hidden = true;
  }
}