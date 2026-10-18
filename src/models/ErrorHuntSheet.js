import { shuffle } from "../utils/shuffle.js";

/**
 * Modelo del papel «encontrar el error».
 *
 * Contiene una lista de afirmaciones, algunas verdaderas y otras falsas.
 * El jugador marca las que cree falsas y comprueba. Mientras no acierte
 * todas, solo se le dice cuántas están bien clasificadas, sin revelar cuáles;
 * al acertar se revelan las explicaciones.
 *
 * No toca la pantalla. Si el jugador falla, el controlador decide el castigo.
 */
export class ErrorHuntSheet {
  #title;
  #instructions;
  #statements;
  #marked = new Set();
  #attempts = 0;
  #solved = false;

  /**
   * @param {Object} paper - El campo "paper" de un cassette (type "errorHunt").
   * @param {string} [paper.title]
   * @param {string} [paper.instructions]
   * @param {{id: string, text: string, isFalse: boolean, explanation?: string}[]} paper.statements
   * @param {Object} [options]
   * @param {() => number} [options.random=Math.random] - Se puede reemplazar en pruebas.
   */
  constructor({ title = "", instructions = "", statements }, { random = Math.random } = {}) {
    if (!Array.isArray(statements) || statements.length < 2) {
      throw new Error("ErrorHuntSheet: se necesitan al menos 2 afirmaciones.");
    }

    const ids = new Set();
    for (const statement of statements) {
      if (!statement.id || !statement.text || typeof statement.isFalse !== "boolean") {
        throw new Error("ErrorHuntSheet: cada afirmación necesita 'id', 'text' e 'isFalse'.");
      }
      if (ids.has(statement.id)) {
        throw new Error(`ErrorHuntSheet: el id "${statement.id}" está repetido.`);
      }
      ids.add(statement.id);
    }
    if (!statements.some((statement) => statement.isFalse)) {
      throw new Error("ErrorHuntSheet: se necesita al menos una afirmación falsa.");
    }

    this.#title = title;
    this.#instructions = instructions;
    this.#statements = shuffle(
      statements.map((statement) => ({ ...statement, explanation: statement.explanation ?? "" })),
      random
    );
  }

  get title() {
    return this.#title;
  }

  get instructions() {
    return this.#instructions;
  }

  /** Afirmaciones en su orden actual, con su marca. No revela cuáles son falsas. */
  get statements() {
    return this.#statements.map(({ id, text }) => ({
      id,
      text,
      marked: this.#marked.has(id),
    }));
  }

  /** Veces que el jugador ha comprobado su respuesta. */
  get attempts() {
    return this.#attempts;
  }

  /** Indica si el papel ya se resolvió. */
  get isSolved() {
    return this.#solved;
  }

  /**
   * Marca o desmarca una afirmación como falsa.
   * @param {string} statementId
   * @returns {boolean} true si queda marcada.
   * @throws {Error} Si la afirmación no existe.
   */
  toggle(statementId) {
    if (!this.#statements.some((statement) => statement.id === statementId)) {
      throw new Error(`ErrorHuntSheet: no existe la afirmación "${statementId}".`);
    }
    if (this.#solved) {
      return this.#marked.has(statementId);
    }

    if (this.#marked.has(statementId)) {
      this.#marked.delete(statementId);
    } else {
      this.#marked.add(statementId);
    }
    return this.#marked.has(statementId);
  }

  /**
   * Comprueba las marcas. Cuenta como un intento.
   * `results` solo se llena cuando el papel queda resuelto.
   * @returns {{
   *   solved: boolean,
   *   correctCount: number,
   *   total: number,
   *   results: {id: string, isFalse: boolean, explanation: string}[]
   * }}
   */
  check() {
    if (!this.#solved) {
      this.#attempts += 1;
    }

    const correctCount = this.#statements.filter(
      (statement) => this.#marked.has(statement.id) === statement.isFalse
    ).length;
    const total = this.#statements.length;

    if (correctCount === total) {
      this.#solved = true;
    }

    return {
      solved: this.#solved,
      correctCount,
      total,
      results: this.#solved
        ? this.#statements.map(({ id, isFalse, explanation }) => ({ id, isFalse, explanation }))
        : [],
    };
  }
}