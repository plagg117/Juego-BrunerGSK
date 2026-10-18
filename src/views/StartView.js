import { createElement, createButton } from "../utils/dom.js";

/**
 * Vista de la pantalla de inicio: primero el prólogo y después la elección
 * del personaje. No contiene lógica: avisa de lo que hace el jugador con las
 * funciones que recibe, y el controlador decide qué sigue.
 */
export class StartView {
  #container;

  /**
   * @param {HTMLElement} container - Elemento donde se dibujará la pantalla.
   */
  constructor(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("StartView: se necesita un elemento HTML como contenedor.");
    }
    this.#container = container;
  }

  /**
   * Muestra el título del juego y el prólogo.
   * @param {Object} prologue
   * @param {string} prologue.title
   * @param {string[]} prologue.paragraphs
   * @param {string} prologue.continueLabel - Texto del botón para continuar.
   * @param {() => void} onContinue
   */
  showPrologue({ title, paragraphs, continueLabel }, onContinue) {
    const section = createElement("section", "start");
    section.setAttribute("aria-label", "Prólogo");

    const story = createElement("div", "start__story");
    paragraphs.forEach((paragraph) =>
      story.append(createElement("p", "start__paragraph", paragraph))
    );

    const button = createButton(continueLabel, "start__button", onContinue);
    section.append(createElement("h1", "start__title", title), story, button);

    this.#container.hidden = false;
    this.#container.replaceChildren(section);
    button.focus();
  }

  /**
   * Muestra a los cinco personajes para elegir con quién jugar.
   * @param {Object} selection
   * @param {string} selection.title
   * @param {string} selection.text
   * @param {string} selection.randomLabel - Texto del botón de elegir al azar.
   * @param {{id: string, name: string, personality: string}[]} selection.characters
   * @param {Object} handlers
   * @param {(characterId: string) => void} handlers.onSelect
   * @param {() => void} handlers.onRandom
   */
  showCharacterSelection({ title, text, randomLabel, characters }, { onSelect, onRandom }) {
    const section = createElement("section", "start");
    section.setAttribute("aria-label", title);

    const list = createElement("div", "start__characters");
    list.setAttribute("role", "group");
    list.setAttribute("aria-label", "Personajes");
    characters.forEach(({ id, name, personality }) => {
      const card = createButton("", "start__character", () => onSelect(id));
      card.append(
        createElement("span", "start__character-name", name),
        createElement("span", "start__character-trait", personality)
      );
      list.append(card);
    });

    const random = createButton(randomLabel, "start__button", onRandom);

    section.append(
      createElement("h1", "start__title", title),
      createElement("p", "start__text", text),
      list,
      random
    );

    this.#container.hidden = false;
    this.#container.replaceChildren(section);
  }

  /** Oculta y vacía la pantalla de inicio. */
  hide() {
    this.#container.replaceChildren();
    this.#container.hidden = true;
  }
}