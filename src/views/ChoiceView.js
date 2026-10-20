import { createElement, createButton } from "../utils/dom.js";

/**
 * Vista del reto de escenas con opciones.
 *
 * Muestra una escena a la vez: la narración, la pregunta y las opciones.
 * Avisa de lo que hace el jugador (`onAnswer`, `onNext`, `onRetry`), pero no
 * decide si una respuesta es correcta ni cuándo termina el reto: eso lo
 * calcula el modelo ChoicePuzzle y se lo comunica el controlador.
 */
export class ChoiceView {
  #container;
  #progress = null;
  #stage = null;
  #nextButton = null;
  #retryButton = null;
  #statusLabel = null;
  #optionButtons = new Map();
  #explanation = null;
  #handlers = {
    answer: () => {},
    next: () => {},
    retry: () => {},
  };

  /**
   * @param {HTMLElement} container - Elemento donde se dibujará el reto.
   */
  constructor(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("ChoiceView: se necesita un elemento HTML como contenedor.");
    }
    this.#container = container;
  }

  /**
   * Dibuja la estructura del reto (título, instrucciones y botones).
   * Después se muestra cada escena con `showScene()`.
   * @param {Object} data
   * @param {string} data.title
   * @param {string} data.instructions
   */
  render({ title, instructions }) {
    const section = createElement("section", "choice");
    section.setAttribute("aria-label", title);

    this.#progress = createElement("p", "choice__progress");
    this.#stage = createElement("div", "choice__stage");

    this.#nextButton = createButton("Siguiente escena", "choice__button", () =>
      this.#handlers.next()
    );
    this.#retryButton = createButton("Volver a empezar", "choice__button", () =>
      this.#handlers.retry()
    );
    this.#nextButton.hidden = true;
    this.#retryButton.hidden = true;

    const actions = createElement("div", "choice__actions");
    actions.append(this.#nextButton, this.#retryButton);

    this.#statusLabel = createElement("p", "choice__status");
    this.#statusLabel.setAttribute("role", "status");
    this.#statusLabel.setAttribute("aria-live", "polite");

    section.append(
      createElement("h2", "choice__title", title),
      createElement("p", "choice__instructions", instructions),
      this.#progress,
      this.#stage,
      actions,
      this.#statusLabel
    );
    this.#container.replaceChildren(section);
  }

  /**
   * Registra la función que se ejecuta al elegir una opción.
   * @param {(optionId: string) => void} handler
   */
  onAnswer(handler) {
    this.#handlers.answer = handler;
  }

  /**
   * Registra la función que se ejecuta al pulsar «Siguiente escena» o «Ver resultado».
   * @param {() => void} handler
   */
  onNext(handler) {
    this.#handlers.next = handler;
  }

  /**
   * Registra la función que se ejecuta al pulsar «Volver a empezar».
   * @param {() => void} handler
   */
  onRetry(handler) {
    this.#handlers.retry = handler;
  }

  /**
   * Muestra u oculta el reto.
   * @param {boolean} isVisible
   */
  setVisible(isVisible) {
    this.#container.hidden = !isVisible;
  }

  /**
   * Muestra una escena con sus opciones.
   * @param {Object} scene
   * @param {number} scene.number - Número de la escena (desde 1).
   * @param {number} scene.total - Total de escenas.
   * @param {string} scene.narration
   * @param {string} scene.question
   * @param {{id: string, text: string}[]} scene.options
   */
  showScene({ number, total, narration, question, options }) {
    this.#progress.textContent = `Escena ${number} de ${total}`;
    this.#optionButtons.clear();

    const scene = createElement("div", "choice__scene");
    if (narration) {
      scene.append(createElement("p", "choice__narration", narration));
    }
    scene.append(createElement("h3", "choice__question", question));

    const list = createElement("div", "choice__options");
    list.setAttribute("role", "group");
    list.setAttribute("aria-label", "Opciones de respuesta");
    options.forEach(({ id, text }) => {
      const button = createButton(text, "choice__option", () => this.#handlers.answer(id));
      this.#optionButtons.set(id, button);
      list.append(button);
    });

    this.#explanation = createElement("p", "choice__explanation");
    this.#explanation.hidden = true;

    scene.append(list, this.#explanation);
    this.#stage.replaceChildren(scene);

    this.#nextButton.hidden = true;
    this.#retryButton.hidden = true;
    this.showMessage("");
  }

  /**
   * Quita una opción de la escena actual (cuando una pista la descarta).
   * @param {string} optionId
   */
  removeOption(optionId) {
    const button = this.#optionButtons.get(optionId);
    if (button) {
      button.remove();
      this.#optionButtons.delete(optionId);
    }
  }

  /**
   * Muestra el resultado de la respuesta: marca la opción elegida, revela
   * la correcta si hubo error y muestra la explicación.
   * @param {Object} answer
   * @param {string} answer.selectedId - Opción que eligió el jugador.
   * @param {boolean} answer.correct
   * @param {string} answer.correctOptionId
   * @param {string} answer.explanation
   * @param {Object} outcome
   * @param {boolean} outcome.isLast - true si era la última escena.
   */
  showAnswer({ selectedId, correct, correctOptionId, explanation }, { isLast }) {
    this.#optionButtons.forEach((button) => {
      button.disabled = true;
    });

    this.#optionButtons.get(selectedId)?.classList.add(correct ? "is-correct" : "is-incorrect");
    if (!correct) {
      this.#optionButtons.get(correctOptionId)?.classList.add("is-correct");
    }

    this.#explanation.textContent = `${correct ? "¡Correcto!" : "No exactamente."} ${explanation}`;
    this.#explanation.hidden = false;

    this.#nextButton.textContent = isLast ? "Ver resultado" : "Siguiente escena";
    this.#nextButton.hidden = false;
    this.#nextButton.focus();
  }

  /**
   * Muestra el resultado final del reto.
   * @param {{correctCount: number, total: number, passed: boolean}} result
   * @param {Object} options
   * @param {number} options.passScore - Aciertos necesarios para superarlo.
   */
  showResult({ correctCount, total, passed }, { passScore }) {
    const summary = createElement("div", "choice__result");
    summary.append(
      createElement("h3", "choice__question", "Resultado"),
      createElement(
        "p",
        "choice__summary",
        passed
          ? `${correctCount} de ${total} escenas correctas. ¡Reto superado!`
          : `${correctCount} de ${total} escenas correctas. Necesitas ${passScore}.`
      )
    );
    summary.classList.toggle("is-passed", passed);

    this.#progress.textContent = "Resultado";
    this.#stage.replaceChildren(summary);
    this.#nextButton.hidden = true;
    this.#retryButton.hidden = passed;
    if (!passed) {
      this.#retryButton.focus();
    }
  }

  /**
   * Muestra un mensaje de estado bajo el reto.
   * @param {string} text
   */
  showMessage(text) {
    if (this.#statusLabel) {
      this.#statusLabel.textContent = text;
    }
  }
}