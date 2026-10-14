/**
 * Controlador del reto de escenas con opciones.
 *
 * Conecta el modelo ChoicePuzzle con ChoiceView: traduce las acciones del
 * jugador en cambios del modelo y le dice a la vista qué mostrar. Avisa con
 * `onComplete` cuando el jugador supera el reto.
 *
 * Cumple la misma interfaz que SortingController (`start`, `show`, `hide` y
 * `onComplete`), así que una sala puede usar cualquiera de los dos como reto final.
 */
export class ChoiceController {
  #puzzle;
  #view;
  #onComplete = () => {};

  /**
   * @param {import("../models/ChoicePuzzle.js").ChoicePuzzle} puzzle
   * @param {import("../views/ChoiceView.js").ChoiceView} view
   */
  constructor(puzzle, view) {
    this.#puzzle = puzzle;
    this.#view = view;
  }

  /** Dibuja el reto, muestra la primera escena y conecta los eventos. */
  start() {
    this.#view.render({
      title: this.#puzzle.title,
      instructions: this.#puzzle.instructions,
    });
    this.#view.showScene(this.#puzzle.currentScene);

    this.#view.onAnswer((optionId) => this.#handleAnswer(optionId));
    this.#view.onNext(() => this.#handleNext());
    this.#view.onRetry(() => this.#handleRetry());
  }

  /** Muestra el reto. */
  show() {
    this.#view.setVisible(true);
  }

  /** Oculta el reto. */
  hide() {
    this.#view.setVisible(false);
  }

  /**
   * Registra la función que se ejecuta cuando el jugador supera el reto.
   * @param {() => void} handler
   */
  onComplete(handler) {
    this.#onComplete = handler;
  }

  /** @param {string} optionId */
  #handleAnswer(optionId) {
    if (this.#puzzle.isCurrentAnswered) {
      return;
    }
    const result = this.#puzzle.answer(optionId);
    this.#view.showAnswer(
      { selectedId: optionId, ...result },
      { isLast: this.#puzzle.isFinished }
    );
  }

  #handleNext() {
    if (this.#puzzle.isFinished) {
      const result = this.#puzzle.result;
      this.#view.showResult(result, { passScore: this.#puzzle.passScore });
      if (result.passed) {
        this.#onComplete();
      }
      return;
    }

    this.#puzzle.next();
    this.#view.showScene(this.#puzzle.currentScene);
  }

  #handleRetry() {
    this.#puzzle.restart();
    this.#view.showScene(this.#puzzle.currentScene);
  }
}