import { shuffle } from "../utils/shuffle.js";

/** Errores seguidos que se toleran antes de pedir un castigo. */
const DEFAULT_PENALTY_EVERY = 3;

/**
 * Modelo del papel «unir conceptos».
 *
 * Hay dos columnas, conceptos y definiciones, ambas mezcladas por separado.
 * El jugador une un concepto con una definición; si coinciden, el par queda
 * unido. Cada cierto número de errores seguidos se pide un castigo.
 *
 * Los ids de las definiciones son opacos (d1, d2...): no coinciden con los
 * ids de los pares, para que la vista no pueda deducir las respuestas.
 */
export class MatchSheet {
  #title;
  #instructions;
  #terms;
  #definitions;
  #matched = new Set();
  #penaltyEvery;
  #mistakes = 0;
  #streak = 0;

  /**
   * @param {Object} paper - El campo "paper" de un cassette (type "match").
   * @param {string} [paper.title]
   * @param {string} [paper.instructions]
   * @param {{id: string, term: string, definition: string}[]} paper.pairs
   * @param {Object} [options]
   * @param {() => number} [options.random=Math.random] - Se puede reemplazar en pruebas.
   * @param {number} [options.penaltyEvery=3] - Errores seguidos que provocan un castigo.
   */
  constructor(
    { title = "", instructions = "", pairs },
    { random = Math.random, penaltyEvery = DEFAULT_PENALTY_EVERY } = {}
  ) {
    if (!Array.isArray(pairs) || pairs.length < 2) {
      throw new Error("MatchSheet: se necesitan al menos 2 pares.");
    }

    const ids = new Set();
    for (const pair of pairs) {
      if (!pair.id || !pair.term || !pair.definition) {
        throw new Error("MatchSheet: cada par necesita 'id', 'term' y 'definition'.");
      }
      if (ids.has(pair.id)) {
        throw new Error(`MatchSheet: el id "${pair.id}" está repetido.`);
      }
      ids.add(pair.id);
    }
    if (!Number.isInteger(penaltyEvery) || penaltyEvery < 1) {
      throw new Error("MatchSheet: 'penaltyEvery' debe ser un entero mayor a 0.");
    }

    this.#title = title;
    this.#instructions = instructions;
    this.#penaltyEvery = penaltyEvery;
    this.#terms = shuffle(
      pairs.map(({ id, term }) => ({ id, text: term })),
      random
    );
    this.#definitions = shuffle(
      pairs.map(({ id, definition }) => ({ pairId: id, text: definition })),
      random
    ).map((definition, index) => ({ ...definition, id: `d${index + 1}` }));
  }

  get title() {
    return this.#title;
  }

  get instructions() {
    return this.#instructions;
  }

  /** Conceptos en su orden actual. */
  get terms() {
    return this.#terms.map(({ id, text }) => ({
      id,
      text,
      matched: this.#matched.has(id),
    }));
  }

  /** Definiciones en su orden actual, con ids opacos. */
  get definitions() {
    return this.#definitions.map(({ id, pairId, text }) => ({
      id,
      text,
      matched: this.#matched.has(pairId),
    }));
  }

  /** Pares unidos correctamente hasta ahora. */
  get matchedCount() {
    return this.#matched.size;
  }

  /** Total de pares. */
  get total() {
    return this.#terms.length;
  }

  /** Errores cometidos en total. */
  get mistakes() {
    return this.#mistakes;
  }

  /** Indica si todos los pares están unidos. */
  get isComplete() {
    return this.#matched.size === this.#terms.length;
  }

  /**
   * Intenta unir un concepto con una definición.
   * @param {string} termId
   * @param {string} definitionId
   * @returns {{correct: boolean, ignored: boolean, penalty: boolean, matchedCount: number}}
   *   `ignored` es true si alguno de los dos ya estaba unido (no cuenta como error).
   * @throws {Error} Si el concepto o la definición no existen.
   */
  pair(termId, definitionId) {
    if (!this.#terms.some((term) => term.id === termId)) {
      throw new Error(`MatchSheet: no existe el concepto "${termId}".`);
    }
    const definition = this.#definitions.find((item) => item.id === definitionId);
    if (!definition) {
      throw new Error(`MatchSheet: no existe la definición "${definitionId}".`);
    }

    if (this.#matched.has(termId) || this.#matched.has(definition.pairId)) {
      return { correct: false, ignored: true, penalty: false, matchedCount: this.#matched.size };
    }

    if (definition.pairId === termId) {
      this.#matched.add(termId);
      this.#streak = 0;
      return { correct: true, ignored: false, penalty: false, matchedCount: this.#matched.size };
    }

    this.#mistakes += 1;
    this.#streak += 1;
    const penalty = this.#streak >= this.#penaltyEvery;
    if (penalty) {
      this.#streak = 0;
    }
    return { correct: false, ignored: false, penalty, matchedCount: this.#matched.size };
  }
}