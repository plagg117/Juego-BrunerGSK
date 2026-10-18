import { createElement, createButton } from "../utils/dom.js";

/**
 * Vista del papel «encontrar el error».
 *
 * Muestra las afirmaciones como botones que se marcan o desmarcan como
 * falsas. Avisa de lo que hace el jugador (`onToggle`, `onCheck`), pero no
 * sabe cuáles afirmaciones son falsas: eso lo conoce solo el modelo, y
 * únicamente se lo entrega al controlador cuando el papel queda resuelto.
 */
export class ErrorHuntView {
  #container;
  #buttons = new Map();
  #explanations = new Map();
  #checkButton = null;
  #statusLabel = null;
  #handlers = {
    toggle: () => {},
    check: () => {},
  };

  /**
   * @param {HTMLElement} container - Elemento donde se dibujará el papel.
   */
  constructor(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("ErrorHuntView: se necesita un elemento HTML como contenedor.");
    }
    this.#container = container;
  }

  /**
   * Dibuja el papel.
   * @param {Object} data
   * @param {string} data.title
   * @param {string} data.instructions
   * @param {{id: string, text: string, marked: boolean}[]} data.statements
   */
  render({ title, instructions, statements }) {
    this.#buttons.clear();
    this.#explanations.clear();

    const section = createElement("section", "errorhunt");
    section.setAttribute("aria-label", title);

    const list = createElement("ul", "errorhunt__list");
    statements.forEach((statement) => list.append(this.#createItem(statement)));

    this.#checkButton = createButton("Comprobar", "errorhunt__button", () =>
      this.#handlers.check()
    );

    this.#statusLabel = createElement("p", "errorhunt__status");
    this.#statusLabel.setAttribute("role", "status");
    this.#statusLabel.setAttribute("aria-live", "polite");

    section.append(
      createElement("h2", "errorhunt__title", title),
      createElement("p", "errorhunt__instructions", instructions),
      list,
      this.#checkButton,
      this.#statusLabel
    );
    this.#container.replaceChildren(section);
  }

  /**
   * Registra la función que se ejecuta al marcar o desmarcar una afirmación.
   * @param {(statementId: string) => void} handler
   */
  onToggle(handler) {
    this.#handlers.toggle = handler;
  }

  /**
   * Registra la función que se ejecuta al pulsar «Comprobar».
   * @param {() => void} handler
   */
  onCheck(handler) {
    this.#handlers.check = handler;
  }

  /**
   * Muestra u oculta el papel.
   * @param {boolean} isVisible
   */
  setVisible(isVisible) {
    this.#container.hidden = !isVisible;
  }

  /**
   * Refleja si una afirmación está marcada como falsa.
   * @param {string} statementId
   * @param {boolean} marked
   */
  setMarked(statementId, marked) {
    const button = this.#buttons.get(statementId);
    if (button) {
      button.classList.toggle("is-marked", marked);
      button.setAttribute("aria-pressed", String(marked));
    }
  }

  /**
   * Revela qué afirmaciones eran falsas, con su explicación, y bloquea el papel.
   * @param {{id: string, isFalse: boolean, explanation: string}[]} results
   */
  showSolved(results) {
    for (const { id, isFalse, explanation } of results) {
      const button = this.#buttons.get(id);
      const note = this.#explanations.get(id);
      if (!button || !note) {
        continue;
      }
      button.classList.remove("is-marked");
      button.classList.add(isFalse ? "is-false" : "is-true");
      note.textContent = explanation;
      note.hidden = explanation === "";
    }

    this.#buttons.forEach((button) => {
      button.disabled = true;
    });
    this.#checkButton.hidden = true;
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
   * @param {{id: string, text: string, marked: boolean}} statement
   * @returns {HTMLLIElement}
   */
  #createItem({ id, text, marked }) {
    const item = createElement("li", "errorhunt__item");

    const button = createButton(text, "errorhunt__statement", () => this.#handlers.toggle(id));
    button.setAttribute("aria-pressed", "false");
    this.#buttons.set(id, button);

    const note = createElement("p", "errorhunt__explanation");
    note.hidden = true;
    this.#explanations.set(id, note);

    item.append(button, note);
    this.setMarked(id, marked);
    return item;
  }
}