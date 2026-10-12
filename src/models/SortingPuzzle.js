import { shuffle } from "../utils/shuffle.js";

/**
 * Modelo del rompecabezas de clasificación: el jugador coloca fichas
 * en categorías y el modelo comprueba cuántas acertó.
 *
 * No toca la pantalla. Las categorías correctas nunca se exponen
 * en `items`; solo se revelan (con su explicación) al llamar a `check()`.
 */
export class SortingPuzzle {
  #id;
  #title;
  #instructions;
  #categories;
  #items;
  #passScore;
  #random;
  #placements = new Map();
  #attempts = 0;
  #solved = false;

  /**
   * @param {Object} data - Un objeto de sorting.json.
   * @param {string} data.id
   * @param {string} [data.title]
   * @param {string} [data.instructions]
   * @param {{id: string, label: string}[]} data.categories
   * @param {{id: string, text: string, category: string, explanation?: string}[]} data.items
   * @param {number} [data.passScore] - Aciertos necesarios (por defecto, todos).
   * @param {Object} [options]
   * @param {() => number} [options.random=Math.random] - Se puede reemplazar en pruebas.
   */
  constructor(
    { id, title = "", instructions = "", categories, items, passScore },
    { random = Math.random } = {}
  ) {
    if (!id) {
      throw new Error("SortingPuzzle: falta el campo 'id'.");
    }
    if (!Array.isArray(categories) || categories.length < 2) {
      throw new Error("SortingPuzzle: se necesitan al menos 2 categorías.");
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("SortingPuzzle: se necesita al menos una ficha.");
    }

    const categoryIds = new Set(categories.map((category) => category.id));
    for (const item of items) {
      if (!categoryIds.has(item.category)) {
        throw new Error(
          `SortingPuzzle: la ficha "${item.id}" usa la categoría inexistente "${item.category}".`
        );
      }
    }

    const required = passScore ?? items.length;
    if (!Number.isInteger(required) || required < 1 || required > items.length) {
      throw new Error("SortingPuzzle: 'passScore' debe estar entre 1 y el total de fichas.");
    }

    this.#id = id;
    this.#title = title;
    this.#instructions = instructions;
    this.#categories = categories.map((category) => ({ ...category }));
    this.#passScore = required;
    this.#random = random;
    this.#items = shuffle(
      items.map((item) => ({ ...item })),
      random
    );
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

  /** Categorías disponibles (copia). */
  get categories() {
    return this.#categories.map((category) => ({ ...category }));
  }

  /** Fichas en su orden actual, con la categoría donde el jugador las puso. */
  get items() {
    return this.#items.map((item) => ({
      id: item.id,
      text: item.text,
      placedIn: this.#placements.get(item.id) ?? null,
    }));
  }

  /** Aciertos necesarios para superar el rompecabezas. */
  get passScore() {
    return this.#passScore;
  }

  /** Veces que el jugador ha comprobado su respuesta. */
  get attempts() {
    return this.#attempts;
  }

  /** Indica si el rompecabezas ya se superó. */
  get isSolved() {
    return this.#solved;
  }

  /** Indica si todas las fichas están colocadas. */
  get allPlaced() {
    return this.#placements.size === this.#items.length;
  }

  /**
   * Coloca (o mueve) una ficha en una categoría.
   * @param {string} itemId
   * @param {string} categoryId
   * @returns {boolean} false si el rompecabezas ya estaba resuelto.
   */
  place(itemId, categoryId) {
    this.#assertItem(itemId);
    this.#assertCategory(categoryId);

    if (this.#solved) {
      return false;
    }
    this.#placements.set(itemId, categoryId);
    return true;
  }

  /**
   * Saca una ficha de su categoría.
   * @param {string} itemId
   */
  unplace(itemId) {
    this.#assertItem(itemId);
    if (!this.#solved) {
      this.#placements.delete(itemId);
    }
  }

  /**
   * Comprueba la clasificación. Cuenta como un intento.
   * @returns {{
   *   correctCount: number,
   *   total: number,
   *   passed: boolean,
   *   results: {itemId: string, correct: boolean, explanation: string}[]
   * }}
   */
  check() {
    if (!this.allPlaced) {
      throw new Error("SortingPuzzle: coloca todas las fichas antes de comprobar.");
    }

    this.#attempts += 1;

    const results = this.#items.map((item) => ({
      itemId: item.id,
      correct: this.#placements.get(item.id) === item.category,
      explanation: item.explanation ?? "",
    }));
    const correctCount = results.filter((result) => result.correct).length;
    const passed = correctCount >= this.#passScore;

    if (passed) {
      this.#solved = true;
    }

    return { correctCount, total: this.#items.length, passed, results };
  }

  /**
   * Limpia las fichas colocadas y las mezcla de nuevo.
   * Conserva el conteo de intentos.
   */
  reshuffle() {
    this.#placements.clear();
    this.#items = shuffle(this.#items, this.#random);
  }

  /** @param {string} itemId */
  #assertItem(itemId) {
    if (!this.#items.some((item) => item.id === itemId)) {
      throw new Error(`SortingPuzzle: no existe la ficha "${itemId}".`);
    }
  }

  /** @param {string} categoryId */
  #assertCategory(categoryId) {
    if (!this.#categories.some((category) => category.id === categoryId)) {
      throw new Error(`SortingPuzzle: no existe la categoría "${categoryId}".`);
    }
  }
}