/**
 * Controlador de la grabadora.
 *
 * Conecta el modelo Cassette con CassetteView y aplica las reglas de las
 * reproducciones: empezar la cinta desde el inicio gasta una, continuar
 * tras una pausa no. No conoce el papel: otros controladores le piden
 * castigos con `penalize()` y le preguntan cuándo se terminó de escuchar.
 */
export class CassetteController {
  #cassette;
  #view;
  #firstListenDone = false;
  #onFirstListenFinished = () => {};

  /**
   * @param {import("../models/Cassette.js").Cassette} cassette
   * @param {import("../views/CassetteView.js").CassetteView} view
   */
  constructor(cassette, view) {
    this.#cassette = cassette;
    this.#view = view;
  }

  /** Dibuja la grabadora y conecta sus eventos. */
  start() {
    this.#view.render({
      title: this.#cassette.title,
      audioSrc: this.#cassette.audioSrc,
      playsLeft: this.#cassette.playsLeft,
    });
    this.#view.onPlay(() => this.#handlePlay());
    this.#view.onEnded(() => this.#handleEnded());
  }

  /**
   * Registra la función que se ejecuta la primera vez que la grabación
   * se escucha completa (por ejemplo, para mostrar el papel).
   * @param {() => void} handler
   */
  onFirstListenFinished(handler) {
    this.#onFirstListenFinished = handler;
  }

  /** Libera los recursos de la grabadora: detiene el audio. */
  dispose() {
    this.#view.stop();
  }

  /** Quita una reproducción como castigo por un error del jugador. */
  penalize() {
    this.#cassette.losePlay();
    this.#view.updatePlaysLeft(this.#cassette.playsLeft);
    this.#view.showMessage(
      this.#cassette.isWorn
        ? "Por el error, la cinta se gastó."
        : "Por el error, la cinta perdió una reproducción."
    );
  }

  #handlePlay() {
    if (this.#view.isAtStart) {
      if (!this.#cassette.registerPlay()) {
        this.#view.showMessage("La cinta está gastada.");
        return;
      }
      this.#view.updatePlaysLeft(this.#cassette.playsLeft);
    }
    this.#view.play();
  }

  #handleEnded() {
    if (!this.#firstListenDone) {
      this.#firstListenDone = true;
      this.#onFirstListenFinished();
    }
  }
}