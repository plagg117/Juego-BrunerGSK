/**
 * Vista de la grabadora de cassettes.
 *
 * Dibuja la grabadora, maneja el elemento de audio y avisa cuando el jugador
 * pulsa "Reproducir". No contiene reglas del juego: no sabe cuántas
 * reproducciones permite la cinta. Eso lo decide el controlador consultando
 * al modelo Cassette.
 */
export class CassetteView {
  #container;
  #audio = new Audio();
  #root = null;
  #deck = null;
  #playsLabel = null;
  #statusLabel = null;
  #onPlay = () => {};
  #onEnded = () => {};

  /**
   * @param {HTMLElement} container - Elemento donde se dibujará la grabadora.
   */
  constructor(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("CassetteView: se necesita un elemento HTML como contenedor.");
    }
    this.#container = container;
    this.#audio.preload = "auto";

    this.#audio.addEventListener("ended", () => {
      this.#setPlaying(false);
      this.showMessage("La grabación terminó.");
      this.#onEnded();
    });
    this.#audio.addEventListener("error", () => {
      this.#setPlaying(false);
      this.showMessage("No se pudo cargar el audio.");
    });
  }

  /**
   * Dibuja la grabadora.
   * @param {Object} data
   * @param {string} data.title - Título de la grabación.
   * @param {string} data.audioSrc - Ruta del archivo de audio.
   * @param {number} data.playsLeft - Reproducciones restantes.
   */
  render({ title, audioSrc, playsLeft }) {
    this.#audio.pause();

    const section = document.createElement("section");
    section.className = "cassette-player";
    section.setAttribute("aria-label", "Grabadora de cassettes");

    const heading = document.createElement("h2");
    heading.className = "cassette-player__title";
    heading.textContent = title;

    this.#deck = this.#createDeck();

    this.#playsLabel = document.createElement("p");
    this.#playsLabel.className = "cassette-player__plays";

    this.#statusLabel = document.createElement("p");
    this.#statusLabel.className = "cassette-player__status";
    this.#statusLabel.setAttribute("role", "status");
    this.#statusLabel.setAttribute("aria-live", "polite");

    section.append(
      heading,
      this.#deck,
      this.#createControls(),
      this.#playsLabel,
      this.#statusLabel
    );

    this.#root = section;
    this.#container.replaceChildren(section);

    this.#audio.src = audioSrc;
    this.updatePlaysLeft(playsLeft);
  }

  /**
   * Registra la función que se ejecuta cuando el jugador pulsa "Reproducir".
   * @param {() => void} handler
   */
  onPlay(handler) {
    this.#onPlay = handler;
  }

  /**
   * Registra la función que se ejecuta cuando el audio llega al final.
   * @param {() => void} handler
   */
  onEnded(handler) {
    this.#onEnded = handler;
  }

  /**
   * Indica si la cinta está al inicio (o terminó). Reproducir desde ahí
   * cuenta como una reproducción nueva; continuar tras una pausa, no.
   * @returns {boolean}
   */
  get isAtStart() {
    return this.#audio.ended || this.#audio.currentTime === 0;
  }

  /** Reproduce el audio desde donde esté. */
  async play() {
    try {
      await this.#audio.play();
      this.#setPlaying(true);
      this.showMessage("Reproduciendo...");
    } catch {
      this.#setPlaying(false);
      this.showMessage("No se pudo reproducir el audio.");
    }
  }

  /** Pausa el audio sin perder la posición. */
  pause() {
    if (this.#audio.paused) {
      return;
    }
    this.#audio.pause();
    this.#setPlaying(false);
    this.showMessage("En pausa.");
  }

  /** Rebobina la cinta hasta el inicio. */
  rewind() {
    this.#audio.pause();
    this.#audio.currentTime = 0;
    this.#setPlaying(false);
    this.showMessage("Cinta rebobinada.");
  }

  /**
   * Actualiza el contador de reproducciones.
   * @param {number} playsLeft
   */
  updatePlaysLeft(playsLeft) {
    if (!this.#playsLabel || !this.#root) {
      return;
    }
    this.#playsLabel.textContent = `Reproducciones restantes: ${playsLeft}`;
    this.#root.classList.toggle("is-worn", playsLeft === 0);
  }

  /**
   * Muestra un mensaje de estado bajo la grabadora.
   * @param {string} text
   */
  showMessage(text) {
    if (this.#statusLabel) {
      this.#statusLabel.textContent = text;
    }
  }

  /** @returns {HTMLElement} Dibujo decorativo de la cinta con dos carretes. */
  #createDeck() {
    const deck = document.createElement("div");
    deck.className = "cassette-deck";
    deck.setAttribute("aria-hidden", "true");

    for (let i = 0; i < 2; i += 1) {
      const reel = document.createElement("div");
      reel.className = "cassette-deck__reel";
      deck.append(reel);
    }
    return deck;
  }

  /** @returns {HTMLElement} Botones de reproducir, pausar y rebobinar. */
  #createControls() {
    const controls = document.createElement("div");
    controls.className = "cassette-player__controls";

    controls.append(
      this.#createButton("▶ Reproducir", () => this.#onPlay()),
      this.#createButton("⏸ Pausar", () => this.pause()),
      this.#createButton("⏪ Rebobinar", () => this.rewind())
    );
    return controls;
  }

  /**
   * @param {string} text
   * @param {() => void} onClick
   * @returns {HTMLButtonElement}
   */
  #createButton(text, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cassette-player__button";
    button.textContent = text;
    button.addEventListener("click", onClick);
    return button;
  }

  /** @param {boolean} isPlaying */
  #setPlaying(isPlaying) {
    this.#deck?.classList.toggle("is-playing", isPlaying);
  }
}