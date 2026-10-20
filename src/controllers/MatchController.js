import { pickHint } from "../utils/hints.js";

/**
 * Controlador del papel «unir conceptos».
 *
 * Conecta el modelo MatchSheet con MatchView. No conoce la grabadora:
 * cuando el jugador acumula demasiados errores seguidos solo avisa con
 * `onPenalty`, y quien coordina la sala decide qué castigo aplicar.
 *
 * Cumple la misma interfaz que los demás tipos de papel (`start`, `show`,
 * `hide`, `onComplete`, `onPenalty`).
 */
export class MatchController {
  #sheet;
  #view;
  #hints;
  #onComplete = () => {};
  #onPenalty = () => {};

  /**
   * @param {import("../models/MatchSheet.js").MatchSheet} sheet
   * @param {import("../views/MatchView.js").MatchView} view
   * @param {Object} [options]
   * @param {string[]} [options.hints] - Textos de pista, del más suave al más explícito.
   */
  constructor(sheet, view, { hints = [] } = {}) {
    this.#sheet = sheet;
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

  /** Dibuja el papel y conecta sus eventos. */
  start() {
    this.#view.render({
      title: this.#sheet.title,
      instructions: this.#sheet.instructions,
      terms: this.#sheet.terms,
      definitions: this.#sheet.definitions,
    });
    this.#view.onPair((termId, definitionId) => this.#handlePair(termId, definitionId));
  }

  /** Muestra el papel. */
  show() {
    this.#view.setVisible(true);
  }

  /** Oculta el papel. */
  hide() {
    this.#view.setVisible(false);
  }

  /**
   * Registra la función que se ejecuta cuando todos los pares están unidos.
   * @param {() => void} handler
   */
  onComplete(handler) {
    this.#onComplete = handler;
  }

  /**
   * Registra la función que se ejecuta cuando el jugador acumula demasiados
   * errores seguidos.
   * @param {() => void} handler
   */
  onPenalty(handler) {
    this.#onPenalty = handler;
  }

  /**
   * @param {string} termId
   * @param {string} definitionId
   */
  #handlePair(termId, definitionId) {
    const result = this.#sheet.pair(termId, definitionId);

    if (result.ignored) {
      return;
    }

    if (result.correct) {
      this.#view.showMatched(termId, definitionId, result.matchedCount);
      if (this.#sheet.isComplete) {
        this.#view.showMessage("¡Todos los conceptos están unidos!");
        this.#onComplete();
      } else {
        this.#view.showMessage(`Correcto. Llevas ${result.matchedCount} de ${this.#sheet.total}.`);
      }
      return;
    }

    this.#view.showMistake(termId, definitionId);
    this.#view.showMessage("Esa pareja no coincide. Prueba con otra.");
    if (result.penalty) {
      this.#onPenalty();
    }
  }
}