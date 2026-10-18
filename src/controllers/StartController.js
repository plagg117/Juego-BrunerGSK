/**
 * Controlador de la pantalla de inicio.
 *
 * Muestra el prólogo y después la elección de personaje, y avisa con
 * `onChoose` cuando el jugador decide con quién jugar (o pide que sea al azar).
 * No empieza la partida: eso lo hace quien recibe el aviso.
 */
export class StartController {
  #view;
  #story;
  #characters;
  #onChoose = () => {};

  /**
   * @param {Object} config
   * @param {import("../views/StartView.js").StartView} config.view
   * @param {Object} config.story - Datos de story.json (prólogo y textos de la elección).
   * @param {{id: string, name: string, personality: string}[]} config.characters
   */
  constructor({ view, story, characters }) {
    this.#view = view;
    this.#story = story;
    this.#characters = characters;
  }

  /**
   * Registra la función que se ejecuta al elegir personaje.
   * @param {(playerId: string|undefined) => void} handler - Recibe el id elegido,
   *   o undefined si el jugador pidió que sea al azar.
   */
  onChoose(handler) {
    this.#onChoose = handler;
  }

  /**
   * Muestra la pantalla de inicio.
   * @param {Object} [options]
   * @param {boolean} [options.skipPrologue=false] - Va directo a la elección
   *   (por ejemplo, al jugar de nuevo).
   */
  show({ skipPrologue = false } = {}) {
    if (skipPrologue) {
      this.#showSelection();
      return;
    }
    this.#view.showPrologue(
      {
        title: this.#story.title,
        paragraphs: this.#story.prologue,
        continueLabel: this.#story.continueLabel,
      },
      () => this.#showSelection()
    );
  }

  #showSelection() {
    const { title, text, randomLabel } = this.#story.characterSelection;
    this.#view.showCharacterSelection(
      { title, text, randomLabel, characters: this.#characters },
      {
        onSelect: (characterId) => this.#choose(characterId),
        onRandom: () => this.#choose(undefined),
      }
    );
  }

  /** @param {string|undefined} playerId */
  #choose(playerId) {
    this.#view.hide();
    this.#onChoose(playerId);
  }
}