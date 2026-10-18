import { createElement, createButton } from "../utils/dom.js";

/** Símbolo con el que se tapan los dígitos cuando el código se oculta. */
const MASK_CHARACTER = "•";

/**
 * Vista de la prueba de memoria.
 *
 * Muestra un código en una pantalla durante unos segundos, lo oculta y
 * entonces pide al jugador que lo escriba. Controla el tiempo de exposición
 * (es parte de cómo se muestra), pero no valida nada: avisa con `onSubmit`
 * y `onContinue`, y el modelo MemoryPuzzle decide si la respuesta es correcta.
 */
export class MemoryView {
  #container;
  #timer = null;
  #progress = null;
  #intro = null;
  #codeBox = null;
  #timerBar = null;
  #inputRow = null;
  #input = null;
  #submitButton = null;
  #feedback = null;
  #continueButton = null;
  #statusLabel = null;
  #handlers = {
    submit: () => {},
    continue: () => {},
  };

  /**
   * @param {HTMLElement} container - Elemento donde se dibujará la prueba.
   */
  constructor(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("MemoryView: se necesita un elemento HTML como contenedor.");
    }
    this.#container = container;
  }

  /**
   * Dibuja la estructura de la prueba (título, pantalla y teclado).
   * Cada prueba se muestra después con `showRound()`.
   * @param {Object} data
   * @param {string} data.title
   * @param {string} data.instructions
   */
  render({ title, instructions }) {
    this.#clearTimer();

    const section = createElement("section", "memory");
    section.setAttribute("aria-label", title);

    this.#progress = createElement("p", "memory__progress");
    this.#intro = createElement("p", "memory__intro");

    this.#codeBox = createElement("div", "memory__code");
    this.#timerBar = createElement("div", "memory__timer");
    this.#timerBar.append(createElement("div", "memory__timer-fill"));
    const screen = createElement("div", "memory__screen");
    screen.append(this.#codeBox, this.#timerBar);

    this.#inputRow = this.#createInputRow();
    this.#inputRow.hidden = true;

    this.#feedback = createElement("p", "memory__feedback");
    this.#feedback.hidden = true;

    this.#continueButton = createButton("Continuar", "memory__button", () =>
      this.#handlers.continue()
    );
    this.#continueButton.hidden = true;

    this.#statusLabel = createElement("p", "memory__status");
    this.#statusLabel.setAttribute("role", "status");
    this.#statusLabel.setAttribute("aria-live", "polite");

    section.append(
      createElement("h2", "memory__title", title),
      createElement("p", "memory__instructions", instructions),
      this.#progress,
      this.#intro,
      screen,
      this.#inputRow,
      this.#feedback,
      this.#continueButton,
      this.#statusLabel
    );
    this.#container.replaceChildren(section);
  }

  /**
   * Registra la función que se ejecuta al enviar la respuesta.
   * @param {(value: string) => void} handler
   */
  onSubmit(handler) {
    this.#handlers.submit = handler;
  }

  /**
   * Registra la función que se ejecuta al pulsar el botón de continuar.
   * @param {() => void} handler
   */
  onContinue(handler) {
    this.#handlers.continue = handler;
  }

  /**
   * Muestra u oculta la prueba.
   * @param {boolean} isVisible
   */
  setVisible(isVisible) {
    this.#container.hidden = !isVisible;
  }

  /**
   * Muestra el código de una prueba y lo oculta pasado el tiempo indicado.
   * @param {Object} round
   * @param {number} round.number - Número de la prueba (desde 1).
   * @param {number} round.total - Total de pruebas.
   * @param {string} round.intro
   * @param {string[]} round.groups - Bloques del código.
   * @param {number} round.showSeconds - Segundos que se ve el código.
   */
  showRound({ number, total, intro, groups, showSeconds }) {
    this.#clearTimer();

    this.#progress.textContent = `Prueba ${number} de ${total}`;
    this.#intro.textContent = intro;
    this.#showGroups(groups);
    this.#codeBox.classList.remove("is-hidden");

    this.#timerBar.hidden = false;
    const fill = this.#timerBar.children[0];
    fill.style.setProperty("--duration", `${showSeconds}s`);
    fill.classList.remove("is-running");
    void fill.offsetWidth; // reinicia la animación
    fill.classList.add("is-running");

    this.#input.value = "";
    this.#input.disabled = false;
    this.#submitButton.disabled = false;
    this.#inputRow.hidden = true;
    this.#feedback.hidden = true;
    this.#feedback.classList.remove("is-correct", "is-incorrect");
    this.#continueButton.hidden = true;

    this.showMessage(`Memoriza el código. Se ocultará en ${showSeconds} segundos.`);
    this.#timer = setTimeout(() => this.#hideCode(groups), showSeconds * 1000);
  }

  /**
   * Muestra si la respuesta fue correcta, revela el código y ofrece continuar.
   * @param {Object} answer
   * @param {boolean} answer.correct
   * @param {string} answer.expected - Código correcto, con los bloques separados.
   * @param {string[]} answer.expectedGroups
   * @param {string} answer.explanation
   * @param {Object} outcome
   * @param {string|null} outcome.actionLabel - Texto del botón de continuar, o null si no hay.
   */
  showFeedback({ correct, expected, expectedGroups, explanation }, { actionLabel }) {
    this.#clearTimer();
    this.#showGroups(expectedGroups);
    this.#codeBox.classList.remove("is-hidden");
    this.#timerBar.hidden = true;

    this.#input.disabled = true;
    this.#submitButton.disabled = true;

    const verdict = correct ? "¡Correcto!" : `Incorrecto. El código era ${expected}.`;
    this.#feedback.textContent = `${verdict} ${explanation}`.trim();
    this.#feedback.classList.toggle("is-correct", correct);
    this.#feedback.classList.toggle("is-incorrect", !correct);
    this.#feedback.hidden = false;

    if (actionLabel) {
      this.#continueButton.textContent = actionLabel;
      this.#continueButton.hidden = false;
      this.#continueButton.focus();
    } else {
      this.#continueButton.hidden = true;
    }
  }

  /** Cancela la cuenta atrás pendiente (por ejemplo, al cambiar de sala). */
  dispose() {
    this.#clearTimer();
  }

  /**
   * Muestra un mensaje de estado bajo la prueba.
   * @param {string} text
   */
  showMessage(text) {
    if (this.#statusLabel) {
      this.#statusLabel.textContent = text;
    }
  }

  /** @returns {HTMLElement} Fila con el campo de texto y el botón de comprobar. */
  #createInputRow() {
    const row = createElement("div", "memory__input-row");

    this.#input = createElement("input", "memory__input");
    this.#input.type = "text";
    this.#input.setAttribute("inputmode", "numeric");
    this.#input.setAttribute("autocomplete", "off");
    this.#input.setAttribute("aria-label", "Código que viste");
    this.#input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        this.#handlers.submit(this.#input.value);
      }
    });

    this.#submitButton = createButton("Comprobar", "memory__button", () =>
      this.#handlers.submit(this.#input.value)
    );

    row.append(this.#input, this.#submitButton);
    return row;
  }

  /** @param {string[]} groups */
  #showGroups(groups) {
    this.#codeBox.replaceChildren(
      ...groups.map((group) => createElement("span", "memory__group", group))
    );
    this.#codeBox.setAttribute("aria-label", `Código: ${groups.join(", ")}`);
  }

  /**
   * Tapa el código y muestra el campo para escribirlo.
   * @param {string[]} groups
   */
  #hideCode(groups) {
    this.#codeBox.replaceChildren(
      ...groups.map((group) =>
        createElement("span", "memory__group", MASK_CHARACTER.repeat(group.length))
      )
    );
    this.#codeBox.setAttribute("aria-label", "Código oculto");
    this.#codeBox.classList.add("is-hidden");
    this.#timerBar.hidden = true;

    this.#inputRow.hidden = false;
    this.#input.focus();
    this.showMessage("El código se ocultó. Escríbelo de memoria.");
  }

  #clearTimer() {
    if (this.#timer !== null) {
      clearTimeout(this.#timer);
      this.#timer = null;
    }
  }
}