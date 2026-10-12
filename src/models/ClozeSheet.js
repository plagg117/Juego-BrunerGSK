import { shuffle } from "../utils/shuffle.js";

/** Intentos permitidos por oración antes de bloquearla. */
const DEFAULT_MAX_ATTEMPTS = 2;

/** Estados posibles de una oración. */
const STATUS = Object.freeze({
  PENDING: "pending",
  CORRECT: "correct",
  LOCKED: "locked",
});

/**
 * Normaliza un texto para compararlo: sin espacios extra,
 * en minúsculas y sin tildes ("Estímulo " -> "estimulo").
 * @param {string} text
 * @returns {string}
 */
function normalize(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Crea el registro interno de una oración a partir de los datos del JSON.
 * @param {Object} sentence
 * @returns {Object}
 */
function createEntry({ id, text, answer, acceptedAnswers = [], distractors = [] }) {
  if (!id || !text || !answer) {
    throw new Error("ClozeSheet: cada oración necesita 'id', 'text' y 'answer'.");
  }
  return {
    id,
    text,
    answer,
    distractors: [...distractors],
    accepted: new Set([answer, ...acceptedAnswers].map(normalize)),
    attemptsUsed: 0,
    status: STATUS.PENDING,
  };
}

/**
 * Modelo del papel con oraciones por completar.
 *
 * Valida las respuestas del jugador, cuenta los intentos de cada oración
 * y sabe cuándo el papel está completo. No toca la pantalla ni el cassette:
 * si una oración se bloquea, el controlador decide qué penalización aplicar.
 */
export class ClozeSheet {
  #title;
  #instructions;
  #maxAttempts;
  #entries;
  #wordBank;

  /**
   * @param {Object} paper - El campo "paper" de un cassette en cassettes.json.
   * @param {string} [paper.title]
   * @param {string} [paper.instructions]
   * @param {Object[]} paper.sentences
   * @param {Object} [options]
   * @param {number} [options.maxAttempts=2] - Intentos por oración.
   * @param {() => number} [options.random=Math.random] - Se puede reemplazar en pruebas.
   */
  constructor(
    { title = "", instructions = "", sentences },
    { maxAttempts = DEFAULT_MAX_ATTEMPTS, random = Math.random } = {}
  ) {
    if (!Array.isArray(sentences) || sentences.length === 0) {
      throw new Error("ClozeSheet: se necesita al menos una oración.");
    }

    this.#title = title;
    this.#instructions = instructions;
    this.#maxAttempts = maxAttempts;
    this.#entries = new Map(
      sentences.map((sentence) => [sentence.id, createEntry(sentence)])
    );

    const words = new Set();
    for (const entry of this.#entries.values()) {
      words.add(entry.answer);
      entry.distractors.forEach((word) => words.add(word));
    }
    this.#wordBank = shuffle([...words], random);
  }

  get title() {
    return this.#title;
  }

  get instructions() {
    return this.#instructions;
  }

  /** Palabras disponibles (respuestas y distractores), mezcladas. */
  get wordBank() {
    return [...this.#wordBank];
  }

  /** Datos de cada oración para mostrar, sin revelar las respuestas. */
  get sentences() {
    return [...this.#entries.values()].map((entry) => ({
      id: entry.id,
      text: entry.text,
      status: entry.status,
      attemptsLeft: this.#maxAttempts - entry.attemptsUsed,
    }));
  }

  /** Cantidad de oraciones resueltas correctamente. */
  get correctCount() {
    return [...this.#entries.values()].filter(
      (entry) => entry.status === STATUS.CORRECT
    ).length;
  }

  /** Indica si todas las oraciones están correctas. */
  get isComplete() {
    return this.correctCount === this.#entries.size;
  }

  /** Indica si alguna oración se bloqueó por demasiados errores. */
  get hasLockedSentences() {
    return [...this.#entries.values()].some(
      (entry) => entry.status === STATUS.LOCKED
    );
  }

  /**
   * Intenta completar una oración con una palabra.
   * @param {string} sentenceId
   * @param {string} word
   * @returns {{status: string, correct: boolean, locked: boolean, attemptsLeft: number}}
   */
  fill(sentenceId, word) {
    const entry = this.#getEntry(sentenceId);

    if (entry.status === STATUS.PENDING) {
      if (entry.accepted.has(normalize(word))) {
        entry.status = STATUS.CORRECT;
      } else {
        entry.attemptsUsed += 1;
        if (entry.attemptsUsed >= this.#maxAttempts) {
          entry.status = STATUS.LOCKED;
        }
      }
    }

    return {
      status: entry.status,
      correct: entry.status === STATUS.CORRECT,
      locked: entry.status === STATUS.LOCKED,
      attemptsLeft: this.#maxAttempts - entry.attemptsUsed,
    };
  }

  /**
   * Devuelve la respuesta de una oración ya resuelta o bloqueada.
   * Mientras siga pendiente devuelve null, para no filtrar la respuesta.
   * @param {string} sentenceId
   * @returns {string|null}
   */
  getAnswer(sentenceId) {
    const entry = this.#getEntry(sentenceId);
    return entry.status === STATUS.PENDING ? null : entry.answer;
  }

  /** Reinicia todas las oraciones para volver a intentarlo. */
  reset() {
    for (const entry of this.#entries.values()) {
      entry.attemptsUsed = 0;
      entry.status = STATUS.PENDING;
    }
  }

  /**
   * Busca una oración o lanza un error si no existe.
   * @param {string} sentenceId
   * @returns {Object}
   */
  #getEntry(sentenceId) {
    const entry = this.#entries.get(sentenceId);
    if (!entry) {
      throw new Error(`ClozeSheet: no existe la oración "${sentenceId}".`);
    }
    return entry;
  }
}