import { pickHint } from "../utils/hints.js";

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
  #hints;
  #onComplete = () => {};
  #onMistake = () => {};

  /**
   * @param {import("../models/ChoicePuzzle.js").ChoicePuzzle} puzzle
   * @param {import("../views/ChoiceView.js").ChoiceView} view
   * @param {Object} [options]
   * @param {string[]} [options.hints] - Textos de pista, del más suave al más explícito.
   */
  constructor(puzzle, view, { hints = [] } = {}) {
    this.#puzzle = puzzle;
    this.#view = view;
    this.#hints = hints;
  }

  /**
   * Devuelve la pista del nivel indicado. En los niveles 2 y 3, además,
   * descarta una opción incorrecta de la escena actual (si todavía hay alguna)
   * y el texto describe lo que se descartó.
   * @param {number} level - Nivel de pista (1 a 3).
   * @returns {string|null} El texto, o null si no hay pistas para esta actividad.
   */
  getHint(level) {
    if (level >= 2 && !this.#puzzle.isCurrentAnswered) {
      const removedId = this.#puzzle.discardWrongOption();
      if (removedId !== null) {
        this.#view.removeOption(removedId);
        return this.#puzzle.currentScene.options.length === 1
          ? "Descarté las opciones incorrectas: queda la correcta."
          : "Descarté una opción incorrecta.";
      }
    }
    return pickHint(this.#hints, level);
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

  /**
   * Registra la función que se ejecuta cuando el jugador elige una opción incorrecta.
   * @param {() => void} handler
   */
  onMistake(handler) {
    this.#onMistake = handler;
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
    if (!result.correct) {
      this.#onMistake();
    }
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