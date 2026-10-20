import { MAX_HINT_LEVEL } from "../utils/hints.js";

/** Pista que se da mientras el jugador todavía no ha escuchado el cassette. */
const CASSETTE_STAGE_HINT = "Escucha la grabación hasta el final: ahí está lo que necesitas para seguir.";

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
 * También conecta las reglas entre actividades: un castigo del papel
 * (por ejemplo, una oración bloqueada) le quita una reproducción al cassette.
 *
 * Atiende las pistas con `requestHint()`. El nivel de pista sube con cada
 * petición dentro de una etapa (cassette, papel o reto final) y se reinicia al
 * cambiar de etapa.
 *
 * Informa de cada error del jugador con `onError`, venga del papel o del reto
 * final. Qué consecuencias tiene un error (perder a un compañero, por ejemplo)
 * lo decide quien escucha ese aviso, no la sala.
 */
export class RoomController {
  #room;
  #view;
  #cassette;
  #paper;
  #challenge;
  #messages;
  #onComplete = () => {};
  #onError = () => {};
  #stage = "cassette";
  #hintLevel = 0;

  /**
   * @param {Object} config
   * @param {{id: string, name: string, intro?: string}} config.room - Datos de rooms.json.
   * @param {import("../views/RoomView.js").RoomView} config.view
   * @param {import("./CassetteController.js").CassetteController} config.cassetteController
   * @param {{start: Function, show: Function, hide: Function, onComplete: Function, onPenalty: Function}|null} [config.paperController]
   *   Controlador del papel (de cualquier tipo). Si es null, la sala no tiene papel.
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

    this.#paper?.onPenalty(() => {
      this.#cassette.penalize();
      this.#onError();
    });
    this.#paper?.onComplete(() => this.#showChallenge());

    this.#challenge.onMistake?.(() => this.#onError());
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

  /**
   * Registra la función que se ejecuta con cada error del jugador en la sala.
   * @param {() => void} handler
   */
  onError(handler) {
    this.#onError = handler;
  }

  /** Libera los recursos de la sala (audio y cuentas atrás) al cambiar de sala. */
  dispose() {
    this.#cassette.dispose?.();
    this.#paper?.dispose?.();
    this.#challenge.dispose?.();
  }

  /**
   * Pide una pista para lo que el jugador tiene delante ahora. El nivel sube
   * con cada petición dentro de la misma etapa, hasta el máximo.
   * @returns {{text: string, level: number, maxLevel: number}|null} La pista, o null
   *   si no hay ninguna disponible (en ese caso no cambia el nivel).
   */
  requestHint() {
    const level = Math.min(this.#hintLevel + 1, MAX_HINT_LEVEL);
    let text;
    if (this.#stage === "cassette") {
      text = CASSETTE_STAGE_HINT;
    } else {
      const activity = this.#stage === "paper" ? this.#paper : this.#challenge;
      text = activity?.getHint?.(level) ?? null;
    }

    if (text === null) {
      return null;
    }
    this.#hintLevel = level;
    return { text, level, maxLevel: MAX_HINT_LEVEL };
  }

  /**
   * Cambia de etapa y reinicia el nivel de pista.
   * @param {"cassette"|"paper"|"challenge"} stage
   */
  #setStage(stage) {
    this.#stage = stage;
    this.#hintLevel = 0;
  }

  /** Qué ocurre al escuchar el cassette completo por primera vez. */
  #handleCassetteListened() {
    if (this.#paper) {
      this.#setStage("paper");
      this.#paper.show();
      this.#view.showMessage("Aparece un papel junto a la grabadora. Complétalo con lo que escuchaste.");
    } else {
      this.#showChallenge();
    }
  }

  /** Muestra el reto final y el mensaje de avance. */
  #showChallenge() {
    this.#setStage("challenge");
    this.#challenge.show();
    this.#view.showMessage(this.#messages.cassetteSolved);
  }
}