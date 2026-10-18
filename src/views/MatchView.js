import { createElement, createButton } from "../utils/dom.js";

/** Milisegundos que dura el aviso visual de una unión incorrecta. */
const WRONG_FLASH_MS = 600;

/**
 * Vista del papel «unir conceptos».
 *
 * Muestra dos columnas de botones: conceptos y definiciones. El jugador
 * elige uno de cada columna, en cualquier orden. La vista avisa con
 * `onPair(termId, definitionId)`, pero no valida nada: eso lo hace el modelo
 * MatchSheet a través del controlador.
 */
export class MatchView {
  #container;
  #buttons = { term: new Map(), definition: new Map() };
  #selected = null;
  #statusLabel = null;
  #onPair = () => {};

  /**
   * @param {HTMLElement} container - Elemento donde se dibujará el papel.
   */
  constructor(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("MatchView: se necesita un elemento HTML como contenedor.");
    }
    this.#container = container;
  }

  /**
   * Dibuja el papel.
   * @param {Object} data
   * @param {string} data.title
   * @param {string} data.instructions
   * @param {{id: string, text: string, matched: boolean}[]} data.terms
   * @param {{id: string, text: string, matched: boolean}[]} data.definitions
   */
  render({ title, instructions, terms, definitions }) {
    this.#buttons.term.clear();
    this.#buttons.definition.clear();
    this.#selected = null;

    const section = createElement("section", "match");
    section.setAttribute("aria-label", title);

    const columns = createElement("div", "match__columns");
    columns.append(
      this.#createColumn("Conceptos", "term", terms),
      this.#createColumn("Definiciones", "definition", definitions)
    );

    this.#statusLabel = createElement("p", "match__status");
    this.#statusLabel.setAttribute("role", "status");
    this.#statusLabel.setAttribute("aria-live", "polite");

    section.append(
      createElement("h2", "match__title", title),
      createElement("p", "match__instructions", instructions),
      columns,
      this.#statusLabel
    );
    this.#container.replaceChildren(section);
  }

  /**
   * Registra la función que se ejecuta al elegir un concepto y una definición.
   * @param {(termId: string, definitionId: string) => void} handler
   */
  onPair(handler) {
    this.#onPair = handler;
  }

  /**
   * Muestra u oculta el papel.
   * @param {boolean} isVisible
   */
  setVisible(isVisible) {
    this.#container.hidden = !isVisible;
  }

  /**
   * Marca un par como unido y bloquea sus dos botones.
   * @param {string} termId
   * @param {string} definitionId
   * @param {number} label - Número que identifica el par en ambas columnas.
   */
  showMatched(termId, definitionId, label) {
    for (const [side, id] of [["term", termId], ["definition", definitionId]]) {
      const button = this.#buttons[side].get(id);
      if (button) {
        this.#markMatched(button, label);
      }
    }
  }

  /**
   * Avisa de que una unión fue incorrecta, con un destello breve.
   * @param {string} termId
   * @param {string} definitionId
   */
  showMistake(termId, definitionId) {
    const buttons = [this.#buttons.term.get(termId), this.#buttons.definition.get(definitionId)];
    buttons.forEach((button) => button?.classList.add("is-wrong"));
    setTimeout(() => buttons.forEach((button) => button?.classList.remove("is-wrong")), WRONG_FLASH_MS);
  }

  /**
   * Muestra un mensaje de estado bajo el papel.
   * @param {string} text
   */
  showMessage(text) {
    if (this.#statusLabel) {
      this.#statusLabel.textContent = text;
    }
  }

  /**
   * @param {string} heading
   * @param {"term"|"definition"} side
   * @param {{id: string, text: string, matched: boolean}[]} items
   * @returns {HTMLElement}
   */
  #createColumn(heading, side, items) {
    const column = createElement("div", "match__column");
    column.setAttribute("role", "group");
    column.setAttribute("aria-label", heading);
    column.append(createElement("h3", "match__heading", heading));

    items.forEach(({ id, text }) => {
      const button = createButton(text, `match__item match__item--${side}`, () =>
        this.#handleClick(side, id)
      );
      button.setAttribute("aria-pressed", "false");
      this.#buttons[side].set(id, button);
      column.append(button);
    });
    return column;
  }

  /**
   * Elegir un botón de la misma columna cambia la selección; elegir uno de
   * la otra columna intenta formar el par.
   * @param {"term"|"definition"} side
   * @param {string} id
   */
  #handleClick(side, id) {
    const current = this.#selected;

    if (current && current.side !== side) {
      const termId = side === "term" ? id : current.id;
      const definitionId = side === "definition" ? id : current.id;
      this.#clearSelection();
      this.#onPair(termId, definitionId);
      return;
    }

    const wasSame = current && current.id === id;
    this.#clearSelection();
    if (!wasSame) {
      this.#select(side, id);
    }
  }

  /**
   * @param {"term"|"definition"} side
   * @param {string} id
   */
  #select(side, id) {
    const button = this.#buttons[side].get(id);
    this.#selected = { side, id };
    button.classList.add("is-selected");
    button.setAttribute("aria-pressed", "true");
    this.showMessage(
      side === "term"
        ? "Concepto elegido. Ahora elige su definición."
        : "Definición elegida. Ahora elige su concepto."
    );
  }

  /** Quita la selección actual, si la hay. */
  #clearSelection() {
    if (this.#selected) {
      const button = this.#buttons[this.#selected.side].get(this.#selected.id);
      button?.classList.remove("is-selected");
      button?.setAttribute("aria-pressed", "false");
      this.#selected = null;
    }
  }

  /**
   * @param {HTMLButtonElement} button
   * @param {number} label
   */
  #markMatched(button, label) {
    button.classList.remove("is-selected", "is-wrong");
    button.classList.add("is-matched");
    button.setAttribute("aria-pressed", "false");
    button.dataset.label = String(label);
    button.disabled = true;
  }
}