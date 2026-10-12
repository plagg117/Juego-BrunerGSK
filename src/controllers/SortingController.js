/**
 * Controlador del clasificador de fichas.
 *
 * Conecta el modelo SortingPuzzle con SortingView: traduce las acciones del
 * jugador en cambios del modelo y vuelve a pintar la vista con el estado
 * resultante. Avisa con `onComplete` cuando el jugador supera el rompecabezas.
 */
export class SortingController {
  #puzzle;
  #view;
  #onComplete = () => {};

  /**
   * @param {import("../models/SortingPuzzle.js").SortingPuzzle} puzzle
   * @param {import("../views/SortingView.js").SortingView} view
   */
  constructor(puzzle, view) {
    this.#puzzle = puzzle;
    this.#view = view;
  }

  /** Dibuja el rompecabezas y conecta sus eventos. */
  start() {
    this.#view.render({
      title: this.#puzzle.title,
      instructions: this.#puzzle.instructions,
      categories: this.#puzzle.categories,
      items: this.#puzzle.items,
    });

    this.#view.onPlace((itemId, categoryId) => {
      this.#puzzle.place(itemId, categoryId);
      this.#repaint();
    });
    this.#view.onUnplace((itemId) => {
      this.#puzzle.unplace(itemId);
      this.#repaint();
    });
    this.#view.onCheck(() => this.#handleCheck());
    this.#view.onRetry(() => this.#handleRetry());
  }

  /** Muestra el rompecabezas. */
  show() {
    this.#view.setVisible(true);
  }

  /** Oculta el rompecabezas. */
  hide() {
    this.#view.setVisible(false);
  }

  /**
   * Registra la función que se ejecuta cuando el jugador supera el rompecabezas.
   * @param {() => void} handler
   */
  onComplete(handler) {
    this.#onComplete = handler;
  }

  /** Vuelve a pintar la vista con el estado actual del modelo. */
  #repaint() {
    this.#view.refresh(this.#puzzle.items);
    this.#view.setCheckEnabled(this.#puzzle.allPlaced);
  }

  #handleCheck() {
    const result = this.#puzzle.check();

    this.#view.showResults(result.results, { passed: result.passed });
    this.#view.showMessage(
      result.passed
        ? `¡Superado! ${result.correctCount} de ${result.total} correctas.`
        : `${result.correctCount} de ${result.total} correctas. Necesitas ${this.#puzzle.passScore}.`
    );

    if (result.passed) {
      this.#onComplete();
    }
  }

  #handleRetry() {
    this.#puzzle.reshuffle();
    this.#repaint();
    this.#view.showMessage("Las fichas se mezclaron de nuevo.");
  }
}