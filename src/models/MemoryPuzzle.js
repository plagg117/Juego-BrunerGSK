/**
 * Divide un código en bloques (chunks) del tamaño indicado.
 * Con tamaño 0 devuelve el código completo como un único bloque.
 * @param {string} code - Dígitos del código.
 * @param {number} groupSize
 * @returns {string[]}
 */
function splitIntoGroups(code, groupSize) {
  if (groupSize <= 0) {
    return [code];
  }
  const groups = [];
  for (let i = 0; i < code.length; i += groupSize) {
    groups.push(code.slice(i, i + groupSize));
  }
  return groups;
}

/**
 * Valida y copia los datos de una prueba.
 * @param {Object} round
 * @returns {Object}
 */
function createRound(round) {
  const { id, digits, groupSize = 0, showSeconds, required = true, intro = "", explanation = "" } = round;

  if (!id) {
    throw new Error("MemoryPuzzle: cada prueba necesita un 'id'.");
  }
  if (!Number.isInteger(digits) || digits < 1) {
    throw new Error(`MemoryPuzzle: la prueba "${id}" necesita 'digits' entero mayor a 0.`);
  }
  if (!Number.isInteger(groupSize) || groupSize < 0 || groupSize > digits) {
    throw new Error(`MemoryPuzzle: la prueba "${id}" tiene un 'groupSize' inválido.`);
  }
  if (typeof showSeconds !== "number" || !(showSeconds > 0)) {
    throw new Error(`MemoryPuzzle: la prueba "${id}" necesita 'showSeconds' mayor a 0.`);
  }

  return { id, digits, groupSize, showSeconds, required: Boolean(required), intro, explanation };
}

/**
 * Modelo de la prueba de memoria: una serie de pruebas en las que se muestra
 * un código numérico unos segundos y el jugador debe escribirlo de memoria.
 *
 * Cada prueba indica cuántos dígitos tiene, si se muestran sueltos o en
 * bloques y cuánto tiempo se ven. Los códigos se generan al azar.
 *
 * - En una prueba obligatoria, un error genera un código nuevo y hay que
 *   repetirla (`retry`). Solo se avanza al acertar.
 * - En una prueba no obligatoria (una demostración), se avanza se acierte o no.
 * - La serie termina al responder la última prueba.
 *
 * No toca la pantalla ni mide el tiempo: eso lo hace la vista.
 */
export class MemoryPuzzle {
  #id;
  #title;
  #instructions;
  #rounds;
  #random;
  #index = 0;
  #code = "";
  #answered = false;
  #attempts = 0;

  /**
   * @param {Object} data - Un objeto de memory.json.
   * @param {string} data.id
   * @param {string} [data.title]
   * @param {string} [data.instructions]
   * @param {Object[]} data.rounds
   * @param {Object} [options]
   * @param {() => number} [options.random=Math.random] - Se puede reemplazar en pruebas.
   */
  constructor({ id, title = "", instructions = "", rounds }, { random = Math.random } = {}) {
    if (!id) {
      throw new Error("MemoryPuzzle: falta el campo 'id'.");
    }
    if (!Array.isArray(rounds) || rounds.length === 0) {
      throw new Error("MemoryPuzzle: se necesita al menos una prueba.");
    }

    this.#id = id;
    this.#title = title;
    this.#instructions = instructions;
    this.#random = random;
    this.#rounds = rounds.map(createRound);
    this.#code = this.#generateCode();
  }

  get id() {
    return this.#id;
  }

  get title() {
    return this.#title;
  }

  get instructions() {
    return this.#instructions;
  }

  /** Cantidad total de pruebas. */
  get total() {
    return this.#rounds.length;
  }

  /** Veces que el jugador ha enviado una respuesta. */
  get attempts() {
    return this.#attempts;
  }

  /**
   * Prueba actual, con el código ya dividido en bloques para mostrarlo.
   * Cuando la serie termina, sigue devolviendo la última prueba.
   * @returns {{id: string, number: number, total: number, intro: string,
   *   groups: string[], showSeconds: number, required: boolean, digits: number}}
   */
  get currentRound() {
    const round = this.#rounds[this.#index];
    return {
      id: round.id,
      number: this.#index + 1,
      total: this.#rounds.length,
      intro: round.intro,
      groups: splitIntoGroups(this.#code, round.groupSize),
      showSeconds: round.showSeconds,
      required: round.required,
      digits: round.digits,
    };
  }

  /** Indica si la prueba actual ya quedó resuelta. */
  get isCurrentAnswered() {
    return this.#answered;
  }

  /** Indica si ya se respondió la última prueba. */
  get isFinished() {
    return this.#index === this.#rounds.length - 1 && this.#answered;
  }

  /**
   * Envía la respuesta del jugador. Se ignoran los caracteres que no sean dígitos.
   * @param {string} input
   * @returns {{
   *   correct: boolean,
   *   expected: string,
   *   expectedGroups: string[],
   *   explanation: string,
   *   required: boolean,
   *   retry: boolean,
   *   isLast: boolean
   * }} `retry` es true si la prueba es obligatoria y hubo error (el código ya es otro).
   * @throws {Error} Si la prueba actual ya fue resuelta.
   */
  submit(input) {
    if (this.#answered) {
      throw new Error("MemoryPuzzle: esta prueba ya fue respondida.");
    }

    const round = this.#rounds[this.#index];
    const typed = String(input).replace(/\D/g, "");
    const correct = typed === this.#code;
    const expectedGroups = splitIntoGroups(this.#code, round.groupSize);
    const retry = round.required && !correct;

    this.#attempts += 1;
    if (retry) {
      this.#code = this.#generateCode();
    } else {
      this.#answered = true;
    }

    return {
      correct,
      expected: expectedGroups.join(" "),
      expectedGroups,
      explanation: round.explanation,
      required: round.required,
      retry,
      isLast: this.#index === this.#rounds.length - 1,
    };
  }

  /**
   * Pasa a la siguiente prueba, con un código nuevo.
   * @returns {boolean} false si ya era la última.
   * @throws {Error} Si la prueba actual todavía no está resuelta.
   */
  next() {
    if (!this.#answered) {
      throw new Error("MemoryPuzzle: resuelve la prueba antes de avanzar.");
    }
    if (this.isFinished) {
      return false;
    }
    this.#index += 1;
    this.#answered = false;
    this.#code = this.#generateCode();
    return true;
  }

  /**
   * Genera un código aleatorio con los dígitos de la prueba actual.
   * @returns {string}
   */
  #generateCode() {
    const { digits } = this.#rounds[this.#index];
    let code = "";
    for (let i = 0; i < digits; i += 1) {
      code += Math.floor(this.#random() * 10);
    }
    return code;
  }
}