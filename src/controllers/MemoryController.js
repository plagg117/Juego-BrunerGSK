import { pickHint } from "../utils/hints.js";

/**
 * Controlador de la prueba de memoria.
 *
 * Conecta el modelo MemoryPuzzle con MemoryView. La primera prueba empieza
 * cuando el reto se muestra (`show()`), no antes: si empezara al crearse, el
 * código se ocultaría mientras el reto todavía está escondido y el jugador
 * no llegaría a verlo.
 *
 * Cumple la misma interfaz que los demás retos finales (`start`, `show`,
 * `hide` y `onComplete`), así que una sala puede usarlo como reto final.
 */
export class MemoryController {
  #puzzle;
  #view;
  #hints;
  #onComplete = () => {};
  #onMistake = () => {};
  #roundStarted = false;
  #pendingAction = null;

  /**
   * @param {import("../models/MemoryPuzzle.js").MemoryPuzzle} puzzle
   * @param {import("../views/MemoryView.js").MemoryView} view
   * @param {Object} [options]
   * @param {string[]} [options.hints] - Textos de pista, del más suave al más explícito.
   */
  constructor(puzzle, view, { hints = [] } = {}) {
    this.#puzzle = puzzle;
    this.#view = view;
    this.#hints = hints;
  }

  /**
   * Devuelve el texto de la pista del nivel indicado.
   * @param {number} level - Nivel de pista (1 a 3).
   * @returns {string|null} El texto, o null si no hay pistas para esta actividad.
   */
  getHint(level) {
    return pickHint(this.#hints, level);
  }

  /** Dibuja la estructura de la prueba y conecta sus eventos. */
  start() {
    this.#view.render({
      title: this.#puzzle.title,
      instructions: this.#puzzle.instructions,
    });
    this.#view.onSubmit((value) => this.#handleSubmit(value));
    this.#view.onContinue(() => this.#handleContinue());
  }

  /** Muestra el reto. La primera vez, también empieza la primera prueba. */
  show() {
    this.#view.setVisible(true);
    if (!this.#roundStarted) {
      this.#roundStarted = true;
      this.#showCurrentRound();
    }
  }

  /** Oculta el reto. */
  hide() {
    this.#view.setVisible(false);
  }

  /**
   * Registra la función que se ejecuta cuando el jugador supera la última prueba.
   * @param {() => void} handler
   */
  onComplete(handler) {
    this.#onComplete = handler;
  }

  /**
   * Registra la función que se ejecuta cuando el jugador falla una prueba
   * obligatoria (la demostración no cuenta).
   * @param {() => void} handler
   */
  onMistake(handler) {
    this.#onMistake = handler;
  }

  /** Libera los recursos de la prueba: cancela la cuenta atrás. */
  dispose() {
    this.#view.dispose();
  }

  #showCurrentRound() {
    this.#view.showRound(this.#puzzle.currentRound);
  }

  /** @param {string} value - Texto escrito por el jugador. */
  #handleSubmit(value) {
    if (this.#puzzle.isCurrentAnswered) {
      return;
    }
    if (!/\d/.test(value)) {
      this.#view.showMessage("Escribe el código que viste.");
      return;
    }

    const result = this.#puzzle.submit(value);

    if (result.retry) {
      this.#pendingAction = () => this.#showCurrentRound();
      this.#view.showFeedback(result, { actionLabel: "Intentar de nuevo" });
      this.#onMistake();
    } else if (result.isLast) {
      this.#pendingAction = null;
      this.#view.showFeedback(result, { actionLabel: null });
      this.#onComplete();
    } else {
      this.#pendingAction = () => {
        this.#puzzle.next();
        this.#showCurrentRound();
      };
      this.#view.showFeedback(result, { actionLabel: "Siguiente prueba" });
    }
  }

  #handleContinue() {
    const action = this.#pendingAction;
    this.#pendingAction = null;
    action?.();
  }
}