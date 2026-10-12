/**
 * Modelo de un cassette del juego.
 *
 * Guarda los datos de la cinta y controla cuántas reproducciones quedan.
 * No sabe nada de la pantalla ni del audio: reproducir el sonido es
 * trabajo de la vista y del controlador.
 */
export class Cassette {
  #id;
  #title;
  #audioSrc;
  #maxPlays;
  #transcript;
  #playsUsed = 0;

  /**
   * @param {Object} data - Un objeto de cassettes.json.
   * @param {string} data.id - Identificador único (ej. "cassette-01").
   * @param {string} data.title - Título de la grabación.
   * @param {string} data.audio - Ruta del archivo de audio.
   * @param {number} data.maxPlays - Reproducciones permitidas.
   * @param {string[]} [data.transcript] - Frases de la grabación.
   */
  constructor({ id, title = "", audio, maxPlays, transcript = [] }) {
    if (!id || !audio) {
      throw new Error("Cassette: faltan los campos 'id' o 'audio'.");
    }
    if (!Number.isInteger(maxPlays) || maxPlays < 1) {
      throw new Error("Cassette: 'maxPlays' debe ser un entero mayor a 0.");
    }

    this.#id = id;
    this.#title = title;
    this.#audioSrc = audio;
    this.#maxPlays = maxPlays;
    this.#transcript = [...transcript];
  }

  /**
   * Crea un Cassette a partir de un objeto de datos.
   * @param {Object} data - Un objeto de cassettes.json.
   * @returns {Cassette}
   */
  static fromData(data) {
    return new Cassette(data);
  }

  get id() {
    return this.#id;
  }

  get title() {
    return this.#title;
  }

  get audioSrc() {
    return this.#audioSrc;
  }

  /** Copia de la transcripción, para que nadie la modifique desde fuera. */
  get transcript() {
    return [...this.#transcript];
  }

  /** Reproducciones que todavía se pueden usar. */
  get playsLeft() {
    return Math.max(this.#maxPlays - this.#playsUsed, 0);
  }

  /** Indica si la cinta ya no se puede reproducir. */
  get isWorn() {
    return this.playsLeft === 0;
  }

  /**
   * Registra una reproducción.
   * @returns {boolean} true si se pudo reproducir, false si la cinta está gastada.
   */
  registerPlay() {
    if (this.isWorn) {
      return false;
    }
    this.#playsUsed += 1;
    return true;
  }

  /** Quita una reproducción como penalización por un error del jugador. */
  losePlay() {
    if (!this.isWorn) {
      this.#playsUsed += 1;
    }
  }
}