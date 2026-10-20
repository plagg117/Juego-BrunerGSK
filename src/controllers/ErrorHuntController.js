import { pickHint } from "../utils/hints.js";

/**
 * Controlador del papel «encontrar el error».
 *
 * Conecta el modelo ErrorHuntSheet con ErrorHuntView. No conoce la grabadora:
 * cuando el jugador falla al comprobar solo avisa con `onPenalty`, y quien
 * coordina la sala decide qué castigo aplicar.
 *
 * Cumple la misma interfaz que los demás tipos de papel (`start`, `show`,
 * `hide`, `onComplete`, `onPenalty`).
 */
export class ErrorHuntController {
  #sheet;
  #view;
  #hints;
  #onComplete = () => {};
  #onPenalty = () => {};

  /**
   * @param {import("../models/ErrorHuntSheet.js").ErrorHuntSheet} sheet
   * @param {import("../views/ErrorHuntView.js").ErrorHuntView} view
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
      statements: this.#sheet.statements,
    });
    this.#view.onToggle((statementId) => this.#handleToggle(statementId));
    this.#view.onCheck(() => this.#handleCheck());
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
   * Registra la función que se ejecuta cuando el papel queda resuelto.
   * @param {() => void} handler
   */
  onComplete(handler) {
    this.#onComplete = handler;
  }

  /**
   * Registra la función que se ejecuta cuando el jugador falla al comprobar.
   * @param {() => void} handler
   */
  onPenalty(handler) {
    this.#onPenalty = handler;
  }

  /** @param {string} statementId */
  #handleToggle(statementId) {
    const marked = this.#sheet.toggle(statementId);
    this.#view.setMarked(statementId, marked);
  }

  #handleCheck() {
    const result = this.#sheet.check();

    if (result.solved) {
      this.#view.showSolved(result.results);
      this.#view.showMessage("¡Papel completo! Ya sabes cuáles eran los errores.");
      this.#onComplete();
      return;
    }

    this.#view.showMessage(
      `${result.correctCount} de ${result.total} afirmaciones bien clasificadas. Vuelve a escuchar la grabación.`
    );
    this.#onPenalty();
  }
}