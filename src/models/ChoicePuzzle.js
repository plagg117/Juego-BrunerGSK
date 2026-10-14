import { shuffle } from "../utils/shuffle.js";

/**
 * Valida y copia los datos de una escena.
 * @param {Object} scene
 * @returns {Object} Copia de la escena lista para usar.
 */
function createScene(scene) {
  const { id, narration = "", question, options, correctOption, explanation = "" } = scene;

  if (!id || !question) {
    throw new Error("ChoicePuzzle: cada escena necesita 'id' y 'question'.");
  }
  if (!Array.isArray(options) || options.length < 2) {
    throw new Error(`ChoicePuzzle: la escena "${id}" necesita al menos 2 opciones.`);
  }

  const optionIds = new Set(options.map((option) => option.id));
  if (optionIds.size !== options.length) {
    throw new Error(`ChoicePuzzle: la escena "${id}" tiene opciones con ids repetidos.`);
  }
  if (!optionIds.has(correctOption)) {
    throw new Error(`ChoicePuzzle: la escena "${id}" usa una opción correcta inexistente.`);
  }

  return {
    id,
    narration,
    question,
    options: options.map((option) => ({ ...option })),
    correctOption,
    explanation,
  };
}

/**
 * Modelo de un reto de escenas con opciones: una serie de situaciones,
 * cada una con una pregunta de opción múltiple.
 *
 * Flujo: se responde la escena actual con `answer()`, se lee la explicación
 * y se avanza con `next()`. Al responder la última escena, el reto termina
 * y `result` indica si se superó. Si no, `restart()` vuelve a empezar.
 *
 * No toca la pantalla. La opción correcta nunca se expone en `currentScene`;
 * solo se revela en la respuesta de `answer()`.
 */
export class ChoicePuzzle {
  #id;
  #title;
  #instructions;
  #passScore;
  #random;
  #scenes;
  #index = 0;
  #answers = [];

  /**
   * @param {Object} data - Un objeto de choices.json.
   * @param {string} data.id
   * @param {string} [data.title]
   * @param {string} [data.instructions]
   * @param {Object[]} data.scenes
   * @param {number} [data.passScore] - Aciertos necesarios (por defecto, todos).
   * @param {Object} [options]
   * @param {() => number} [options.random=Math.random] - Se puede reemplazar en pruebas.
   */
  constructor(
    { id, title = "", instructions = "", scenes, passScore },
    { random = Math.random } = {}
  ) {
    if (!id) {
      throw new Error("ChoicePuzzle: falta el campo 'id'.");
    }
    if (!Array.isArray(scenes) || scenes.length === 0) {
      throw new Error("ChoicePuzzle: se necesita al menos una escena.");
    }

    const required = passScore ?? scenes.length;
    if (!Number.isInteger(required) || required < 1 || required > scenes.length) {
      throw new Error("ChoicePuzzle: 'passScore' debe estar entre 1 y el total de escenas.");
    }

    this.#id = id;
    this.#title = title;
    this.#instructions = instructions;
    this.#passScore = required;
    this.#random = random;
    this.#scenes = scenes.map(createScene);
    this.#shuffleOptions();
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

  /** Aciertos necesarios para superar el reto. */
  get passScore() {
    return this.#passScore;
  }

  /** Cantidad total de escenas. */
  get total() {
    return this.#scenes.length;
  }

  /**
   * Escena actual, sin revelar cuál es la opción correcta.
   * Cuando el reto termina, sigue devolviendo la última escena.
   * @returns {{id: string, number: number, total: number, narration: string,
   *   question: string, options: {id: string, text: string}[]}}
   */
  get currentScene() {
    const scene = this.#scenes[this.#index];
    return {
      id: scene.id,
      number: this.#index + 1,
      total: this.#scenes.length,
      narration: scene.narration,
      question: scene.question,
      options: scene.options.map((option) => ({ ...option })),
    };
  }

  /** Indica si la escena actual ya fue respondida. */
  get isCurrentAnswered() {
    return this.#answers[this.#index] !== undefined;
  }

  /** Indica si ya se respondió la última escena. */
  get isFinished() {
    return this.#index === this.#scenes.length - 1 && this.isCurrentAnswered;
  }

  /** Cantidad de escenas respondidas correctamente hasta ahora. */
  get correctCount() {
    return this.#answers.filter((answer) => answer?.correct).length;
  }

  /**
   * Resultado final, o null si el reto no ha terminado.
   * @returns {{correctCount: number, total: number, passed: boolean}|null}
   */
  get result() {
    if (!this.isFinished) {
      return null;
    }
    return {
      correctCount: this.correctCount,
      total: this.#scenes.length,
      passed: this.correctCount >= this.#passScore,
    };
  }

  /**
   * Responde la escena actual.
   * @param {string} optionId
   * @returns {{correct: boolean, correctOptionId: string, explanation: string}}
   * @throws {Error} Si la escena ya fue respondida o la opción no existe.
   */
  answer(optionId) {
    if (this.isCurrentAnswered) {
      throw new Error("ChoicePuzzle: esta escena ya fue respondida.");
    }

    const scene = this.#scenes[this.#index];
    if (!scene.options.some((option) => option.id === optionId)) {
      throw new Error(`ChoicePuzzle: no existe la opción "${optionId}".`);
    }

    const correct = optionId === scene.correctOption;
    this.#answers[this.#index] = { optionId, correct };

    return {
      correct,
      correctOptionId: scene.correctOption,
      explanation: scene.explanation,
    };
  }

  /**
   * Avanza a la siguiente escena.
   * @returns {boolean} false si ya era la última.
   * @throws {Error} Si la escena actual todavía no se respondió.
   */
  next() {
    if (!this.isCurrentAnswered) {
      throw new Error("ChoicePuzzle: responde la escena antes de avanzar.");
    }
    if (this.isFinished) {
      return false;
    }
    this.#index += 1;
    return true;
  }

  /** Vuelve a empezar desde la primera escena, con las opciones mezcladas. */
  restart() {
    this.#index = 0;
    this.#answers = [];
    this.#shuffleOptions();
  }

  /** Mezcla el orden de las opciones de cada escena. */
  #shuffleOptions() {
    this.#scenes.forEach((scene) => {
      scene.options = shuffle(scene.options, this.#random);
    });
  }
}