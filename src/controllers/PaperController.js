/** Milisegundos que se muestra el resultado antes de reiniciar un papel fallido. */
const RESTART_DELAY_MS = 2500;

/**
 * Controlador del papel con oraciones por completar.
 *
 * Conecta el modelo ClozeSheet con PaperView. No conoce la grabadora:
 * cuando una oración se bloquea solo avisa con `onLockedSentence`, y quien
 * coordina la sala decide qué castigo aplicar.
 */
export class PaperController {
  #sheet;
  #view;
  #onLockedSentence = () => {};
  #onComplete = () => {};

  /**
   * @param {import("../models/ClozeSheet.js").ClozeSheet} sheet
   * @param {import("../views/PaperView.js").PaperView} view
   */
  constructor(sheet, view) {
    this.#sheet = sheet;
    this.#view = view;
  }

  /** Dibuja el papel y conecta sus eventos. */
  start() {
    this.#render();
    this.#view.onFill((sentenceId, word) => this.#handleFill(sentenceId, word));
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
   * Registra la función que se ejecuta cuando una oración se bloquea
   * por demasiados errores.
   * @param {() => void} handler
   */
  onLockedSentence(handler) {
    this.#onLockedSentence = handler;
  }

  /**
   * Registra la función que se ejecuta cuando todas las oraciones
   * están correctas.
   * @param {() => void} handler
   */
  onComplete(handler) {
    this.#onComplete = handler;
  }

  #render() {
    this.#view.render({
      title: this.#sheet.title,
      instructions: this.#sheet.instructions,
      sentences: this.#sheet.sentences,
      wordBank: this.#sheet.wordBank,
    });
  }

  /**
   * @param {string} sentenceId
   * @param {string} word
   */
  #handleFill(sentenceId, word) {
    const result = this.#sheet.fill(sentenceId, word);

    this.#view.updateSentence(sentenceId, {
      status: result.status,
      attemptsLeft: result.attemptsLeft,
      answer: this.#sheet.getAnswer(sentenceId),
    });

    if (result.locked) {
      this.#onLockedSentence();
    }

    if (this.#sheet.isComplete) {
      this.#view.showMessage("¡Papel completo!");
      this.#onComplete();
    } else if (this.#allResolved()) {
      this.#scheduleRestart();
    }
  }

  /** @returns {boolean} true si ninguna oración sigue pendiente. */
  #allResolved() {
    return this.#sheet.sentences.every((sentence) => sentence.status !== "pending");
  }

  /**
   * Si todas las oraciones están resueltas pero alguna quedó bloqueada,
   * el papel no se puede completar: se deja ver el resultado un momento
   * y luego se reinicia para volver a intentarlo.
   */
  #scheduleRestart() {
    this.#view.showMessage("Hubo oraciones bloqueadas. El papel se reiniciará.");
    setTimeout(() => {
      this.#sheet.reset();
      this.#render();
      this.#view.showMessage("Papel reiniciado. Inténtalo de nuevo.");
    }, RESTART_DELAY_MS);
  }
}