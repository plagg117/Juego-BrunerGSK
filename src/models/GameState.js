import { shuffle } from "../utils/shuffle.js";

/** Estados posibles de un compañero. */
export const COMPANION_STATUS = Object.freeze({
  CAPTIVE: "captive",
  RESCUED: "rescued",
  LOST: "lost",
  SAFE: "safe",
});

/** Pistas que se permiten en cada sala si los datos no indican otra cosa. */
const DEFAULT_HINTS_PER_ROOM = 3;

/**
 * Valida y copia los datos de una sala.
 * @param {Object} room
 * @returns {Object}
 */
function createRoom(room) {
  const { id, order, errorLimit = null, hints = DEFAULT_HINTS_PER_ROOM } = room;
  if (!id || !Number.isFinite(order)) {
    throw new Error("GameState: cada sala necesita 'id' y 'order'.");
  }
  if (errorLimit !== null && (!Number.isInteger(errorLimit) || errorLimit < 0)) {
    throw new Error(`GameState: la sala "${id}" tiene un 'errorLimit' inválido.`);
  }
  if (!Number.isInteger(hints) || hints < 0) {
    throw new Error(`GameState: la sala "${id}" tiene un número de pistas inválido.`);
  }
  return { ...room, errorLimit, hints };
}

/**
 * Estado de una partida: quién es el jugador, qué compañero está en juego
 * en cada sala, cuántos errores se llevan, en qué sala se va y cómo termina.
 *
 * Reglas:
 * - El jugador es uno de los personajes (el que se indique o uno al azar).
 *   Los demás son sus compañeros.
 * - Cada sala con `errorLimit` tiene un compañero en juego. Los compañeros se
 *   reparten entre esas salas en orden aleatorio.
 * - Cada error en la sala actual se registra con `registerError()`. Al superar
 *   el límite de la sala, el profesor se lleva a su compañero (una sola vez).
 * - Al completar una sala, su compañero queda rescatado salvo que ya se haya
 *   perdido.
 * - Cada sala permite un número limitado de pistas (`hints`). Pedir una pista
 *   gasta una de ellas, pero no cuenta como error.
 * - La partida termina al completar la última sala. El final es A (todos
 *   salvos) si no se perdió a nadie, y B (algunos salvos) si se perdió a alguien.
 *
 * No toca la pantalla ni los retos: solo guarda el estado y aplica las reglas.
 */
export class GameState {
  #characters;
  #rooms;
  #random;
  #player = null;
  #companionByRoom = new Map();
  #errors = new Map();
  #hintsUsed = new Map();
  #lost = new Set();
  #rescued = new Set();
  #completed = new Set();
  #index = 0;
  /** Compañeros que no quedaron asignados a ninguna sala (no corren riesgo). */
  #unassigned = [];

  /**
   * @param {Object} data
   * @param {{id: string, name: string}[]} data.characters - Personajes (characters.json).
   * @param {{id: string, order: number, errorLimit?: number|null}[]} data.rooms - Salas (rooms.json).
   * @param {Object} [options]
   * @param {() => number} [options.random=Math.random] - Se puede reemplazar en pruebas.
   */
  constructor({ characters, rooms }, { random = Math.random } = {}) {
    if (!Array.isArray(characters) || characters.length < 2) {
      throw new Error("GameState: se necesitan al menos 2 personajes.");
    }
    const ids = new Set();
    for (const character of characters) {
      if (!character.id || !character.name) {
        throw new Error("GameState: cada personaje necesita 'id' y 'name'.");
      }
      if (ids.has(character.id)) {
        throw new Error(`GameState: el personaje "${character.id}" está repetido.`);
      }
      ids.add(character.id);
    }
    if (!Array.isArray(rooms) || rooms.length === 0) {
      throw new Error("GameState: se necesita al menos una sala.");
    }

    this.#characters = characters.map((character) => ({ ...character }));
    this.#rooms = rooms.map(createRoom).sort((a, b) => a.order - b.order);
    this.#random = random;
  }

  /**
   * Empieza una partida nueva (descarta cualquier avance anterior).
   * @param {Object} [options]
   * @param {string} [options.playerId] - Personaje que juega; si falta, se elige al azar.
   * @param {string} [options.startRoomId] - Sala en la que se empieza. Las anteriores
   *   se dan por completadas (y sus compañeros por rescatados). Sirve para probar el juego.
   * @returns {Object} El personaje que juega.
   * @throws {Error} Si el personaje o la sala indicados no existen.
   */
  start({ playerId, startRoomId } = {}) {
    const startIndex =
      startRoomId === undefined ? 0 : this.#rooms.findIndex((room) => room.id === startRoomId);
    if (startIndex === -1) {
      throw new Error(`GameState: no existe la sala "${startRoomId}".`);
    }

    let player;
    if (playerId === undefined) {
      player = this.#characters[Math.floor(this.#random() * this.#characters.length)];
    } else {
      player = this.#characters.find((character) => character.id === playerId);
      if (!player) {
        throw new Error(`GameState: no existe el personaje "${playerId}".`);
      }
    }

    this.#player = player;
    this.#companionByRoom.clear();
    this.#errors.clear();
    this.#hintsUsed.clear();
    this.#lost.clear();
    this.#rescued.clear();
    this.#completed.clear();
    this.#index = 0;

    const pool = shuffle(
      this.#characters.filter((character) => character.id !== player.id),
      this.#random
    );
    for (const room of this.#rooms) {
      if (room.errorLimit !== null && pool.length > 0) {
        this.#companionByRoom.set(room.id, pool.shift());
      }
    }
    this.#unassigned = pool;

    for (let i = 0; i < startIndex; i += 1) {
      const room = this.#rooms[i];
      this.#completed.add(room.id);
      const companion = this.#companionByRoom.get(room.id);
      if (companion) {
        this.#rescued.add(companion.id);
      }
    }
    this.#index = startIndex;
    return { ...player };
  }

  /** Indica si ya empezó una partida. */
  get isStarted() {
    return this.#player !== null;
  }

  /** Personaje que juega, o null si todavía no empezó la partida. */
  get player() {
    return this.#player ? { ...this.#player } : null;
  }

  /**
   * Compañeros con su sala y su estado actual.
   * @returns {{id: string, name: string, roomId: string|null, status: string}[]}
   */
  get companions() {
    this.#assertStarted();
    const assigned = this.#rooms
      .filter((room) => this.#companionByRoom.has(room.id))
      .map((room) => ({ character: this.#companionByRoom.get(room.id), roomId: room.id }));
    const safe = this.#unassigned.map((character) => ({ character, roomId: null }));

    return [...assigned, ...safe].map(({ character, roomId }) => ({
      ...character,
      roomId,
      status: this.#statusOf(character, roomId),
    }));
  }

  /**
   * Sala actual, con su número y el total de salas.
   * @returns {Object}
   */
  get currentRoom() {
    this.#assertStarted();
    return { ...this.#rooms[this.#index], number: this.#index + 1, total: this.#rooms.length };
  }

  /** Indica si ya se completaron todas las salas. */
  get isFinished() {
    return this.isStarted && this.#completed.size === this.#rooms.length;
  }

  /** Pistas que quedan en la sala actual. */
  get hintsLeft() {
    this.#assertStarted();
    const room = this.#rooms[this.#index];
    return Math.max(room.hints - (this.#hintsUsed.get(room.id) ?? 0), 0);
  }

  /** Pistas que permite la sala actual. */
  get hintsTotal() {
    this.#assertStarted();
    return this.#rooms[this.#index].hints;
  }

  /**
   * Gasta una pista de la sala actual. No cuenta como error.
   * @returns {number} Pistas que quedan.
   * @throws {Error} Si no quedan pistas o la partida ya terminó.
   */
  useHint() {
    this.#assertPlaying();
    if (this.hintsLeft === 0) {
      throw new Error("GameState: ya no quedan pistas en esta sala.");
    }
    const room = this.#rooms[this.#index];
    this.#hintsUsed.set(room.id, (this.#hintsUsed.get(room.id) ?? 0) + 1);
    return this.hintsLeft;
  }

  /**
   * Compañero que está en juego en una sala, o null si no tiene.
   * @param {string} roomId
   * @returns {Object|null}
   */
  companionOf(roomId) {
    this.#assertStarted();
    const companion = this.#companionByRoom.get(roomId);
    return companion ? { ...companion } : null;
  }

  /**
   * Errores acumulados en una sala.
   * @param {string} roomId
   * @returns {number}
   */
  errorsIn(roomId) {
    return this.#errors.get(roomId) ?? 0;
  }

  /**
   * Registra un error en la sala actual. Si supera el límite de la sala,
   * el compañero de esa sala se pierde (solo la primera vez).
   * @returns {{roomId: string, errors: number, limit: number|null,
   *   remaining: number|null, lostCompanion: Object|null}}
   * `lostCompanion` solo viene lleno en el error que provoca la pérdida.
   */
  registerError() {
    this.#assertPlaying();
    const room = this.#rooms[this.#index];
    const errors = this.errorsIn(room.id) + 1;
    this.#errors.set(room.id, errors);

    const companion = this.#companionByRoom.get(room.id) ?? null;
    let lostCompanion = null;
    if (
      room.errorLimit !== null &&
      errors > room.errorLimit &&
      companion &&
      !this.#lost.has(companion.id)
    ) {
      this.#lost.add(companion.id);
      lostCompanion = { ...companion };
    }

    return {
      roomId: room.id,
      errors,
      limit: room.errorLimit,
      remaining: room.errorLimit === null ? null : Math.max(room.errorLimit - errors, 0),
      lostCompanion,
    };
  }

  /**
   * Marca la sala actual como completada. Su compañero queda rescatado,
   * salvo que ya se haya perdido.
   * @returns {{room: Object, rescued: Object|null, lost: Object|null, isLast: boolean}}
   * @throws {Error} Si la sala ya estaba completada.
   */
  completeRoom() {
    this.#assertPlaying();
    const room = this.#rooms[this.#index];
    if (this.#completed.has(room.id)) {
      throw new Error(`GameState: la sala "${room.id}" ya estaba completada.`);
    }
    this.#completed.add(room.id);

    const companion = this.#companionByRoom.get(room.id) ?? null;
    let rescued = null;
    let lost = null;
    if (companion) {
      if (this.#lost.has(companion.id)) {
        lost = { ...companion };
      } else {
        this.#rescued.add(companion.id);
        rescued = { ...companion };
      }
    }

    return {
      room: { ...room },
      rescued,
      lost,
      isLast: this.#index === this.#rooms.length - 1,
    };
  }

  /**
   * Pasa a la siguiente sala.
   * @returns {Object|null} La nueva sala actual, o null si era la última.
   * @throws {Error} Si la sala actual todavía no está completada.
   */
  advance() {
    this.#assertStarted();
    if (!this.#completed.has(this.#rooms[this.#index].id)) {
      throw new Error("GameState: completa la sala antes de avanzar.");
    }
    if (this.#index === this.#rooms.length - 1) {
      return null;
    }
    this.#index += 1;
    return this.currentRoom;
  }

  /**
   * Final de la partida, o null si todavía no termina.
   * - "A": todos salvos.
   * - "B": algunos salvos (se perdió al menos un compañero).
   * @returns {{type: "A"|"B", player: Object, survivors: Object[], lost: Object[]}|null}
   */
  get ending() {
    if (!this.isFinished) {
      return null;
    }
    const companions = this.companions;
    const lost = companions.filter((companion) => companion.status === COMPANION_STATUS.LOST);
    const survivors = companions.filter((companion) => companion.status !== COMPANION_STATUS.LOST);
    return {
      type: lost.length === 0 ? "A" : "B",
      player: this.player,
      survivors,
      lost,
    };
  }

  /**
   * @param {Object} character
   * @param {string|null} roomId
   * @returns {string}
   */
  #statusOf(character, roomId) {
    if (roomId === null) {
      return COMPANION_STATUS.SAFE;
    }
    if (this.#lost.has(character.id)) {
      return COMPANION_STATUS.LOST;
    }
    return this.#rescued.has(character.id) ? COMPANION_STATUS.RESCUED : COMPANION_STATUS.CAPTIVE;
  }

  #assertStarted() {
    if (!this.isStarted) {
      throw new Error("GameState: la partida todavía no empezó (llama a start()).");
    }
  }

  #assertPlaying() {
    this.#assertStarted();
    if (this.isFinished) {
      throw new Error("GameState: la partida ya terminó.");
    }
  }
}