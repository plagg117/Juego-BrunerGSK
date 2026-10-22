import { createElement, createButton } from "../utils/dom.js";

/** Texto con el que se describe a cada compañero según su estado (sin marcar género). */
const STATUS_TEXT = Object.freeze({
  captive: "espera",
  rescued: "se salvó",
  lost: "se perdió",
  safe: "a salvo",
});

/**
 * Vista del panel de estado de la partida (HUD).
 *
 * Muestra en qué sala se va, quién es el jugador, cómo está cada compañero y
 * cuántos errores lleva la sala. También muestra avisos ("El profesor se lleva
 * a...") y el botón para pasar a la siguiente sala. No contiene reglas: solo dibuja lo que le entrega el controlador.
 */
export class HudView {
  #container;
  #room = null;
  #player = null;
  #companions = null;
  #errors = null;
  #notice = null;
  #dialogue = null;
  #actions = null;
  #hintBar = null;
  #hintButton = null;
  #hint = null;
  #onHintRequest = () => {};

  /**
   * @param {HTMLElement} container - Elemento donde se dibujará el panel.
   */
  constructor(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("HudView: se necesita un elemento HTML como contenedor.");
    }
    this.#container = container;
    this.#build();
  }

  /**
   * Dibuja o actualiza la información de la partida.
   * @param {Object} snapshot
   * @param {{name: string}} snapshot.player
   * @param {{name: string, status: string}[]} snapshot.companions
   * @param {{name: string, number: number, total: number}} snapshot.room
   * @param {number} snapshot.errors - Errores en la sala actual.
   * @param {number|null} snapshot.limit - Errores permitidos, o null si no hay límite.
   * @param {{left: number, total: number}} [snapshot.hints] - Pistas que quedan en la sala.
   */
  render({ player, companions, room, errors, limit, hints }) {
    this.#room.textContent = `Sala ${room.number} de ${room.total} · ${room.name}`;
    this.#player.textContent = `Juegas como ${player.name}`;

    this.#companions.replaceChildren(
      ...companions.map(({ name, status }) => {
        const item = createElement("li", `hud__companion is-${status}`);
        item.append(
          createElement("span", "hud__name", name),
          createElement("span", "hud__status", STATUS_TEXT[status] ?? status)
        );
        return item;
      })
    );

    this.#errors.textContent =
      limit === null
        ? `Errores en esta sala: ${errors}`
        : `Errores en esta sala: ${errors} de ${limit} permitidos`;

    if (hints) {
      this.#hintBar.hidden = false;
      this.#hintButton.textContent = `Pedir pista (quedan ${hints.left} de ${hints.total})`;
      this.#hintButton.disabled = hints.left === 0;
    }
  }

  /**
   * Registra la función que se ejecuta al pulsar «Pedir pista».
   * @param {() => void} handler
   */
  onHintRequest(handler) {
    this.#onHintRequest = handler;
  }

  /**
   * Muestra el texto de una pista.
   * @param {string} text
   * @param {Object} info
   * @param {number} info.level - Nivel de la pista (1 a 3).
   * @param {number} info.maxLevel - Nivel máximo.
   */
  showHint(text, { level, maxLevel }) {
    this.#hint.textContent = `Pista ${level} de ${maxLevel}: ${text}`;
  }

  /** Borra el texto de la pista. */
  clearHint() {
    this.#hint.textContent = "";
  }

  /** Oculta el botón de pedir pistas (por ejemplo, al terminar la partida). */
  hideHints() {
    this.#hintBar.hidden = true;
    this.#hint.textContent = "";
  }

  /**
   * Muestra lo que dice un personaje.
   * @param {Object} line
   * @param {string} line.speaker - Nombre de quien habla.
   * @param {string} line.text - Lo que dice (ya con los nombres puestos).
   */
  showDialogue({ speaker, text }) {
    this.#dialogue.replaceChildren(
      createElement("strong", "hud__speaker", `${speaker}: `),
      createElement("span", "hud__line", `«${text}»`)
    );
  }

  /** Borra el diálogo actual. */
  clearDialogue() {
    this.#dialogue.replaceChildren();
  }

  /**
   * Muestra un aviso.
   * @param {string} text
   * @param {"info"|"warning"|"bad"|"good"} [tone="info"]
   */
  showNotice(text, tone = "info") {
    this.#notice.textContent = text;
    this.#notice.className = `hud__notice is-${tone}`;
  }

  /** Borra el aviso actual. */
  clearNotice() {
    this.#notice.textContent = "";
    this.#notice.className = "hud__notice";
  }

  /**
   * Muestra un botón para continuar (por ejemplo, pasar a la siguiente sala).
   * @param {string} label
   * @param {() => void} handler
   */
  showContinue(label, handler) {
    const button = createButton(label, "hud__button", handler);
    this.#actions.replaceChildren(button);
    button.focus();
  }

  /** Quita el botón de continuar. */
  hideContinue() {
    this.#actions.replaceChildren();
  }

  /**
   * Muestra u oculta el panel.
   * @param {boolean} isVisible
   */
  setVisible(isVisible) {
    this.#container.hidden = !isVisible;
  }

  /** Crea la estructura fija del panel (se hace al crear la vista, para poder usarla enseguida). */
  #build() {
    const section = createElement("section", "hud");
    section.setAttribute("aria-label", "Estado de la partida");

    this.#room = createElement("p", "hud__room");
    this.#player = createElement("p", "hud__player");
    this.#companions = createElement("ul", "hud__companions");
    this.#errors = createElement("p", "hud__errors");

    this.#dialogue = createElement("p", "hud__dialogue");
    this.#dialogue.setAttribute("role", "status");
    this.#dialogue.setAttribute("aria-live", "polite");

    this.#notice = createElement("p", "hud__notice");
    this.#notice.setAttribute("role", "status");
    this.#notice.setAttribute("aria-live", "polite");

    this.#hintButton = createButton("Pedir pista", "hud__hint-button", () => this.#onHintRequest());
    this.#hintBar = createElement("div", "hud__hint-bar");
    this.#hintBar.hidden = true;
    this.#hintBar.append(this.#hintButton);

    this.#hint = createElement("p", "hud__hint");
    this.#hint.setAttribute("role", "status");
    this.#hint.setAttribute("aria-live", "polite");

    this.#actions = createElement("div", "hud__actions");

    section.append(
      this.#room,
      this.#player,
      this.#companions,
      this.#errors,
      this.#dialogue,
      this.#notice,
      this.#hintBar,
      this.#hint,
      this.#actions
    );
    this.#container.replaceChildren(section);
  }
}