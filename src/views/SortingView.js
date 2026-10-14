import { createElement, createButton } from "../utils/dom.js";

/**
 * Vista del rompecabezas de clasificación.
 *
 * Muestra fichas sin clasificar y un cajón por categoría. El jugador elige
 * una ficha y pulsa «Colocar aquí» en el cajón que corresponda. La vista solo
 * avisa de lo que hace el jugador (`onPlace`, `onUnplace`, `onCheck`,
 * `onRetry`); no guarda el estado de la partida. Después de cada acción, el
 * controlador consulta al modelo SortingPuzzle y vuelve a pintar con `refresh()`.
 */
export class SortingView {
  #container;
  #root = null;
  #pool = null;
  #binLists = new Map();
  #pieces = new Map();
  #selectedId = null;
  #returnButton = null;
  #checkButton = null;
  #retryButton = null;
  #statusLabel = null;
  #handlers = {
    place: () => {},
    unplace: () => {},
    check: () => {},
    retry: () => {},
  };

  /**
   * @param {HTMLElement} container - Elemento donde se dibujará el rompecabezas.
   */
  constructor(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("SortingView: se necesita un elemento HTML como contenedor.");
    }
    this.#container = container;
  }

  /**
   * Dibuja el rompecabezas completo.
   * @param {Object} data
   * @param {string} data.title
   * @param {string} data.instructions
   * @param {{id: string, label: string}[]} data.categories
   * @param {{id: string, text: string, placedIn: string|null}[]} data.items
   */
  render({ title, instructions, categories, items }) {
    this.#binLists.clear();

    const section = createElement("section", "sorting");
    section.setAttribute("aria-label", "Clasificador de fichas");

    this.#pool = createElement("div", "sorting__pool");
    this.#pool.setAttribute("role", "group");
    this.#pool.setAttribute("aria-label", "Fichas sin clasificar");

    const bins = createElement("div", "sorting__bins");
    categories.forEach((category) => bins.append(this.#createBin(category)));

    this.#returnButton = createButton("↩ Devolver ficha", "sorting__button", () =>
      this.#handleReturnClick()
    );
    this.#checkButton = createButton("Comprobar", "sorting__button sorting__button--main", () =>
      this.#handlers.check()
    );
    this.#retryButton = createButton(
      "Mezclar y reintentar",
      "sorting__button sorting__button--main",
      () => this.#handlers.retry()
    );

    const actions = createElement("div", "sorting__actions");
    actions.append(this.#returnButton, this.#checkButton, this.#retryButton);

    this.#statusLabel = createElement("p", "sorting__status");
    this.#statusLabel.setAttribute("role", "status");
    this.#statusLabel.setAttribute("aria-live", "polite");

    section.append(
      createElement("h2", "sorting__title", title),
      createElement("p", "sorting__instructions", instructions),
      createElement("p", "sorting__label", "Fichas sin clasificar"),
      this.#pool,
      bins,
      actions,
      this.#statusLabel
    );

    this.#root = section;
    this.#container.replaceChildren(section);
    this.refresh(items);
  }

  /**
   * Vuelve a pintar las fichas según el estado actual del modelo.
   * Quita la selección, los resultados y el mensaje anterior.
   * @param {{id: string, text: string, placedIn: string|null}[]} items
   */
  refresh(items) {
    this.#pool.replaceChildren();
    this.#binLists.forEach((list) => list.replaceChildren());
    this.#pieces.clear();
    this.#selectedId = null;

    for (const item of items) {
      const piece = this.#createPiece(item);
      this.#pieces.set(item.id, piece);
      const target = (item.placedIn !== null && this.#binLists.get(item.placedIn)) || this.#pool;
      target.append(piece.element);
    }

    this.#setInteractive(true);
    this.#checkButton.hidden = false;
    this.#checkButton.disabled = true;
    this.#retryButton.hidden = true;
    this.#updateReturnButton();
    this.showMessage("");
  }

  /**
   * Registra la función que se ejecuta al colocar una ficha en un cajón.
   * @param {(itemId: string, categoryId: string) => void} handler
   */
  onPlace(handler) {
    this.#handlers.place = handler;
  }

  /**
   * Registra la función que se ejecuta al devolver una ficha a las sin clasificar.
   * @param {(itemId: string) => void} handler
   */
  onUnplace(handler) {
    this.#handlers.unplace = handler;
  }

  /**
   * Registra la función que se ejecuta al pulsar «Comprobar».
   * @param {() => void} handler
   */
  onCheck(handler) {
    this.#handlers.check = handler;
  }

  /**
   * Registra la función que se ejecuta al pulsar «Mezclar y reintentar».
   * @param {() => void} handler
   */
  onRetry(handler) {
    this.#handlers.retry = handler;
  }

  /**
   * Muestra u oculta el rompecabezas.
   * @param {boolean} isVisible
   */
  setVisible(isVisible) {
    this.#container.hidden = !isVisible;
  }

  /**
   * Activa o desactiva el botón «Comprobar».
   * @param {boolean} enabled
   */
  setCheckEnabled(enabled) {
    this.#checkButton.disabled = !enabled;
  }

  /**
   * Muestra el resultado de cada ficha con su explicación y bloquea el tablero.
   * Si no se superó, aparece el botón para reintentar.
   * @param {{itemId: string, correct: boolean, explanation: string}[]} results
   * @param {Object} outcome
   * @param {boolean} outcome.passed
   */
  showResults(results, { passed }) {
    for (const { itemId, correct, explanation } of results) {
      const piece = this.#pieces.get(itemId);
      if (!piece) {
        continue;
      }
      piece.button.classList.add(correct ? "is-correct" : "is-incorrect");
      piece.explanation.textContent = explanation;
      piece.explanation.hidden = explanation === "";
    }

    this.#clearSelection();
    this.#setInteractive(false);
    this.#returnButton.disabled = true;
    this.#checkButton.hidden = true;
    this.#retryButton.hidden = passed;
  }

  /**
   * Muestra un mensaje de estado bajo el rompecabezas.
   * @param {string} text
   */
  showMessage(text) {
    if (this.#statusLabel) {
      this.#statusLabel.textContent = text;
    }
  }

  /**
   * @param {{id: string, label: string}} category
   * @returns {HTMLElement}
   */
  #createBin({ id, label }) {
    const bin = createElement("div", "sorting__bin");
    bin.dataset.id = id;

    const target = createButton("Colocar aquí", "sorting__bin-target", () =>
      this.#handleBinClick(id)
    );
    target.setAttribute("aria-label", `Colocar la ficha elegida en ${label}`);

    const list = createElement("div", "sorting__bin-items");
    this.#binLists.set(id, list);

    bin.append(createElement("h3", "sorting__bin-title", label), target, list);
    return bin;
  }

  /**
   * @param {{id: string, text: string, placedIn: string|null}} item
   * @returns {{element: HTMLElement, button: HTMLButtonElement, explanation: HTMLElement, placed: boolean}}
   */
  #createPiece({ id, text, placedIn }) {
    const element = createElement("div", "sorting__piece");

    const button = createButton(text, "sorting__item", () => this.#selectPiece(id));
    button.setAttribute("aria-pressed", "false");

    const explanation = createElement("p", "sorting__explanation");
    explanation.hidden = true;

    element.append(button, explanation);
    return { element, button, explanation, placed: placedIn !== null };
  }

  /** @param {string} id */
  #selectPiece(id) {
    const wasSelected = this.#selectedId === id;
    this.#clearSelection();

    if (!wasSelected) {
      const piece = this.#pieces.get(id);
      this.#selectedId = id;
      piece.button.classList.add("is-selected");
      piece.button.setAttribute("aria-pressed", "true");
      this.showMessage(
        piece.placed
          ? "Ficha elegida. Pulsa «Colocar aquí» en otro cajón o «Devolver ficha»."
          : "Ficha elegida. Pulsa «Colocar aquí» en el cajón que corresponda."
      );
    }
    this.#updateReturnButton();
  }

  /** Quita la selección actual, si la hay. */
  #clearSelection() {
    if (this.#selectedId !== null) {
      const piece = this.#pieces.get(this.#selectedId);
      piece?.button.classList.remove("is-selected");
      piece?.button.setAttribute("aria-pressed", "false");
      this.#selectedId = null;
    }
  }

  /** @param {string} categoryId */
  #handleBinClick(categoryId) {
    if (this.#selectedId === null) {
      this.showMessage("Primero elige una ficha.");
      return;
    }
    this.#handlers.place(this.#selectedId, categoryId);
  }

  #handleReturnClick() {
    if (this.#selectedId !== null) {
      this.#handlers.unplace(this.#selectedId);
    }
  }

  /** «Devolver ficha» solo sirve si la ficha elegida ya está en un cajón. */
  #updateReturnButton() {
    const piece = this.#selectedId === null ? null : this.#pieces.get(this.#selectedId);
    this.#returnButton.disabled = !piece?.placed;
  }

  /**
   * Activa o desactiva las fichas y los botones de los cajones.
   * @param {boolean} isInteractive
   */
  #setInteractive(isInteractive) {
    this.#root
      .querySelectorAll(".sorting__item, .sorting__bin-target")
      .forEach((button) => {
        button.disabled = !isInteractive;
      });
  }
}