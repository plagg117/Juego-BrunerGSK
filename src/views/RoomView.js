/**
 * Vista de la sala: muestra su nombre, la narración de entrada y los
 * mensajes de progreso. No contiene lógica del juego.
 */
export class RoomView {
  #container;
  #statusLabel = null;

  /**
   * @param {HTMLElement} container - Elemento donde se dibujará la sala.
   */
  constructor(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("RoomView: se necesita un elemento HTML como contenedor.");
    }
    this.#container = container;
  }

  /**
   * Dibuja el encabezado de la sala.
   * @param {Object} data
   * @param {string} data.name - Nombre de la sala.
   * @param {string} [data.intro] - Narración de entrada.
   */
  render({ name, intro = "" }) {
    const section = document.createElement("section");
    section.className = "room";
    section.setAttribute("aria-label", name);

    const heading = document.createElement("h2");
    heading.className = "room__name";
    heading.textContent = name;

    const introText = document.createElement("p");
    introText.className = "room__intro";
    introText.textContent = intro;

    this.#statusLabel = document.createElement("p");
    this.#statusLabel.className = "room__status";
    this.#statusLabel.setAttribute("role", "status");
    this.#statusLabel.setAttribute("aria-live", "polite");

    section.append(heading, introText, this.#statusLabel);
    this.#container.replaceChildren(section);
  }

  /**
   * Muestra un mensaje de progreso.
   * @param {string} text
   */
  showMessage(text) {
    if (this.#statusLabel) {
      this.#statusLabel.textContent = text;
      this.#statusLabel.classList.remove("is-complete");
    }
  }

  /**
   * Muestra el mensaje de sala completada, con un estilo destacado.
   * @param {string} text
   */
  showCompletion(text) {
    this.showMessage(text);
    this.#statusLabel?.classList.add("is-complete");
  }
}