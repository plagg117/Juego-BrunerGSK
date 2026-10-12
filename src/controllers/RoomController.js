/**
 * Controlador de una sala.
 *
 * Coordina los controladores de cada actividad y decide el orden:
 *   1. Se escucha el cassette.
 *   2. Al terminar de escucharlo por primera vez, aparece el papel.
 *   3. Al completar el papel, aparece el clasificador.
 *   4. Al superar el clasificador, la sala queda completa.
 * También conecta las reglas entre actividades: una oración bloqueada en
 * el papel le quita una reproducción al cassette.
 */
export class RoomController {
  #room;
  #view;
  #cassette;
  #paper;
  #sorting;
  #messages;
  #onComplete = () => {};

  /**
   * @param {Object} config
   * @param {{id: string, name: string, intro?: string}} config.room - Datos de rooms.json.
   * @param {import("../views/RoomView.js").RoomView} config.view
   * @param {import("./CassetteController.js").CassetteController} config.cassetteController
   * @param {import("./PaperController.js").PaperController} config.paperController
   * @param {import("./SortingController.js").SortingController} config.sortingController
   * @param {Object} config.messages - Textos que se muestran al avanzar.
   * @param {string} config.messages.paperSolved - Al completar el papel.
   * @param {string} config.messages.roomSolved - Al completar la sala.
   */
  constructor({ room, view, cassetteController, paperController, sortingController, messages }) {
    this.#room = room;
    this.#view = view;
    this.#cassette = cassetteController;
    this.#paper = paperController;
    this.#sorting = sortingController;
    this.#messages = messages;
  }

  /** Dibuja la sala y conecta las actividades entre sí. */
  start() {
    this.#view.render({ name: this.#room.name, intro: this.#room.intro });

    this.#cassette.start();
    this.#paper.start();
    this.#sorting.start();
    this.#paper.hide();
    this.#sorting.hide();

    this.#cassette.onFirstListenFinished(() => {
      this.#paper.show();
      this.#view.showMessage("Aparece un papel junto a la grabadora. Complétalo con lo que escuchaste.");
    });

    this.#paper.onLockedSentence(() => this.#cassette.penalize());

    this.#paper.onComplete(() => {
      this.#sorting.show();
      this.#view.showMessage(this.#messages.paperSolved);
    });

    this.#sorting.onComplete(() => {
      this.#view.showCompletion(this.#messages.roomSolved);
      this.#onComplete(this.#room);
    });
  }

  /**
   * Registra la función que se ejecuta cuando la sala queda completa.
   * @param {(room: Object) => void} handler - Recibe los datos de la sala.
   */
  onComplete(handler) {
    this.#onComplete = handler;
  }
}