/**
 * Controlador de una sala.
 *
 * Coordina los controladores de cada actividad y decide el orden:
 *   1. Se escucha el cassette.
 *   2. Si la sala tiene papel, aparece al terminar de escuchar por primera
 *      vez, y el reto final aparece al completarlo. Si no tiene papel, el
 *      reto final aparece directamente al terminar de escuchar.
 *   3. Al superar el reto final, la sala queda completa.
 *
 * El papel es opcional: no todas las salas lo tienen.
 * El reto final puede ser de cualquier tipo (clasificador, escenas con
 * opciones...). Solo necesita un controlador con `start()`, `show()`,
 * `hide()` y `onComplete()`.
 * También conecta las reglas entre actividades: una oración bloqueada en
 * el papel le quita una reproducción al cassette.
 */
export class RoomController {
  #room;
  #view;
  #cassette;
  #paper;
  #challenge;
  #messages;
  #onComplete = () => {};

  /**
   * @param {Object} config
   * @param {{id: string, name: string, intro?: string}} config.room - Datos de rooms.json.
   * @param {import("../views/RoomView.js").RoomView} config.view
   * @param {import("./CassetteController.js").CassetteController} config.cassetteController
   * @param {import("./PaperController.js").PaperController|null} [config.paperController]
   *   Controlador del papel. Si es null, la sala no tiene papel.
   * @param {{start: Function, show: Function, hide: Function, onComplete: Function}} config.challengeController
   *   Controlador del reto final (SortingController, ChoiceController...).
   * @param {Object} config.messages - Textos que se muestran al avanzar.
   * @param {string} config.messages.cassetteSolved - Al terminar la parte del cassette
   *   (completar el papel o, si no hay papel, escuchar la grabación).
   * @param {string} config.messages.roomSolved - Al completar la sala.
   */
  constructor({
    room,
    view,
    cassetteController,
    paperController = null,
    challengeController,
    messages,
  }) {
    this.#room = room;
    this.#view = view;
    this.#cassette = cassetteController;
    this.#paper = paperController;
    this.#challenge = challengeController;
    this.#messages = messages;
  }

  /** Dibuja la sala y conecta las actividades entre sí. */
  start() {
    this.#view.render({ name: this.#room.name, intro: this.#room.intro });

    this.#cassette.start();
    this.#challenge.start();
    this.#challenge.hide();

    if (this.#paper) {
      this.#paper.start();
      this.#paper.hide();
    }

    this.#cassette.onFirstListenFinished(() => this.#handleCassetteListened());

    this.#paper?.onLockedSentence(() => this.#cassette.penalize());
    this.#paper?.onComplete(() => this.#showChallenge());

    this.#challenge.onComplete(() => {
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

  /** Qué ocurre al escuchar el cassette completo por primera vez. */
  #handleCassetteListened() {
    if (this.#paper) {
      this.#paper.show();
      this.#view.showMessage("Aparece un papel junto a la grabadora. Complétalo con lo que escuchaste.");
    } else {
      this.#showChallenge();
    }
  }

  /** Muestra el reto final y el mensaje de avance. */
  #showChallenge() {
    this.#challenge.show();
    this.#view.showMessage(this.#messages.cassetteSolved);
  }
}