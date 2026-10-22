import { fillPlaceholders, joinNames } from "../utils/text.js";

/**
 * Controlador de la partida.
 *
 * Lleva el juego de principio a fin: crea cada sala cuando le toca, recibe los
 * errores del jugador y se los pasa a GameState (que decide si se pierde a un
 * compañero), avisa de lo que ocurre en el panel de estado, pasa de una sala a
 * la siguiente al completarla y muestra el desenlace al terminar.
 *
 * Pone los nombres de los personajes en los textos que lo piden con marcas
 * como {player}, {companion}, {companions}, {survivors} y {lost}.
 *
 * No conoce los retos ni las reglas: las salas las construye `createRoom` y las
 * reglas viven en GameState.
 */
export class GameController {
  #state;
  #hud;
  #endingView;
  #story;
  #dialogues;
  #createRoom;
  #clearContainers;
  #room = null;
  #onRestart = () => this.start();

  /**
   * @param {Object} config
   * @param {import("../models/GameState.js").GameState} config.state
   * @param {import("../views/HudView.js").HudView} config.hudView
   * @param {import("../views/EndingView.js").EndingView} config.endingView
   * @param {Object} config.story - Datos de story.json (textos de los finales).
   * @param {Object} config.dialogues - Datos de dialogues.json (lo que dice cada compañero).
   * @param {(room: Object) => import("./RoomController.js").RoomController} config.createRoom
   *   Crea el controlador de una sala a partir de sus datos.
   * @param {() => void} config.clearContainers - Vacía la pantalla de la sala anterior.
   */
  constructor({ state, hudView, endingView, story, dialogues, createRoom, clearContainers }) {
    this.#state = state;
    this.#hud = hudView;
    this.#endingView = endingView;
    this.#story = story;
    this.#dialogues = dialogues;
    this.#createRoom = createRoom;
    this.#clearContainers = clearContainers;
    this.#hud.onHintRequest(() => this.#handleHintRequest());
  }

  /**
   * Registra la función que se ejecuta al pulsar «Jugar de nuevo».
   * Por defecto empieza otra partida con un personaje al azar.
   * @param {() => void} handler
   */
  onRestart(handler) {
    this.#onRestart = handler;
  }

  /**
   * Empieza una partida nueva y pone en marcha la primera sala.
   * @param {Object} [options]
   * @param {string} [options.playerId] - Personaje que juega; si falta, se elige al azar.
   * @param {string} [options.startRoomId] - Sala en la que se empieza (para pruebas).
   */
  start({ playerId, startRoomId } = {}) {
    this.#state.start({ playerId, startRoomId });
    this.#endingView.hide();
    this.#hud.setVisible(true);
    this.#playCurrentRoom();
  }

  /** Crea y pone en marcha la sala actual, dejando limpia la anterior. */
  #playCurrentRoom() {
    this.#room?.dispose();
    this.#clearContainers();
    this.#hud.hideContinue();
    this.#hud.clearNotice();
    this.#hud.clearHint();
    this.#hud.clearDialogue();

    this.#room = this.#createRoom(this.#roomWithNames(this.#state.currentRoom));
    this.#room.onError(() => this.#handleError());
    this.#room.onComplete(() => this.#handleRoomComplete());
    this.#room.start();

    this.#refreshHud();
    const room = this.#state.currentRoom;
    const companion = this.#state.companionOf(room.id);
    if (companion) {
      this.#say(companion, "room", room.id);
    }
  }

  /**
   * Muestra en el panel lo que dice un compañero.
   * @param {{id: string, name: string}} character
   * @param {"room"|"rescued"|"lost"} key - Qué línea de ese personaje se usa.
   * @param {string} [roomId] - Sala de la que habla (solo para la línea «room»).
   */
  #say(character, key, roomId) {
    const lines = this.#dialogues.characters[character.id];
    const text = key === "room" ? lines?.rooms?.[roomId] : lines?.[key];
    if (!text) {
      return;
    }
    this.#hud.showDialogue({
      speaker: character.name,
      text: fillPlaceholders(text, { player: this.#state.player.name }),
    });
  }

  /**
   * Devuelve la sala con su narración de entrada lista: se le suma la frase
   * del compañero que está en juego (si lo hay) y se ponen los nombres.
   * @param {Object} room
   * @returns {Object}
   */
  #roomWithNames(room) {
    const companion = this.#state.companionOf(room.id);
    const intro = [room.intro, companion ? room.companionIntro : ""].filter(Boolean).join(" ");
    const names = {
      player: this.#state.player.name,
      companion: companion?.name ?? "",
      companions: joinNames(this.#state.companions.map((item) => item.name)),
    };
    return { ...room, intro: fillPlaceholders(intro, names) };
  }

  /**
   * El jugador pide una pista: la sala la da (si hay) y se gasta una del
   * presupuesto de la sala. Si la sala no tiene pista para este momento, no
   * se gasta nada.
   */
  #handleHintRequest() {
    if (this.#state.isFinished || !this.#room) {
      return;
    }
    if (this.#state.hintsLeft === 0) {
      this.#hud.showNotice("Ya no quedan pistas en esta sala.", "warning");
      return;
    }

    const hint = this.#room.requestHint();
    if (!hint) {
      this.#hud.showNotice("Por ahora no hay pistas para esto.", "info");
      return;
    }

    this.#state.useHint();
    this.#hud.showHint(hint.text, hint);
    this.#refreshHud();
  }

  /** Un error del jugador: se registra y se avisa de lo que implica. */
  #handleError() {
    const result = this.#state.registerError();
    this.#refreshHud();

    if (result.lostCompanion) {
      this.#hud.showNotice(`El profesor se lleva a ${result.lostCompanion.name}.`, "bad");
      this.#say(result.lostCompanion, "lost");
      return;
    }

    const companion = this.#state.companionOf(result.roomId);
    if (!companion || result.remaining === null) {
      return;
    }
    this.#hud.showNotice(
      result.remaining === 0
        ? `¡Cuidado! Un error más y el profesor se lleva a ${companion.name}.`
        : `Error. Quedan ${result.remaining} antes de que el profesor se lleve a ${companion.name}.`,
      "warning"
    );
  }

  /** La sala se completó: se rescata a su compañero (si sigue) y se avanza. */
  #handleRoomComplete() {
    const result = this.#state.completeRoom();
    this.#refreshHud();

    if (result.rescued) {
      this.#hud.showNotice(`${result.rescued.name} sale de su celda.`, "good");
      this.#say(result.rescued, "rescued");
    } else if (result.lost) {
      this.#hud.showNotice(`${result.lost.name} ya no está: el profesor se lo llevó.`, "bad");
    } else {
      this.#hud.clearNotice();
    }

    if (result.isLast) {
      this.#showEnding();
      return;
    }
    this.#hud.showContinue("Pasar a la siguiente sala", () => {
      this.#state.advance();
      this.#playCurrentRoom();
    });
  }

  /** Muestra el final (A o B) con los nombres de quienes salieron y de quienes no. */
  #showEnding() {
    const ending = this.#state.ending;
    const texts = this.#story.endings[ending.type];
    const names = {
      player: ending.player.name,
      survivors: joinNames(ending.survivors.map((companion) => companion.name)) || "ninguno",
      lost: joinNames(ending.lost.map((companion) => companion.name)) || "ninguno",
    };

    this.#room?.dispose();
    this.#clearContainers();
    this.#hud.hideContinue();
    this.#hud.hideHints();
    this.#hud.clearDialogue();
    this.#endingView.show(
      {
        type: ending.type,
        revelation: this.#story.revelation,
        title: texts.title,
        paragraphs: texts.paragraphs.map((paragraph) => fillPlaceholders(paragraph, names)),
        restartLabel: this.#story.restartLabel,
      },
      () => {
        this.#endingView.hide();
        this.#onRestart();
      }
    );
  }

  /** Actualiza el panel con el estado actual de la partida. */
  #refreshHud() {
    const room = this.#state.currentRoom;
    this.#hud.render({
      player: this.#state.player,
      companions: this.#state.companions,
      room: { name: room.name, number: room.number, total: room.total },
      errors: this.#state.errorsIn(room.id),
      limit: room.errorLimit,
      hints: { left: this.#state.hintsLeft, total: this.#state.hintsTotal },
    });
  }
}