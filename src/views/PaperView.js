/** Marca que indica dónde va el espacio en blanco dentro de una oración. */
const BLANK_MARKER = "___";

/** Texto que se muestra en un espacio todavía vacío. */
const EMPTY_BLANK_TEXT = "________";

/** Milisegundos que dura el aviso visual de una respuesta incorrecta. */
const WRONG_FLASH_MS = 600;

/**
 * Vista del papel con oraciones por completar.
 *
 * Muestra las oraciones y un banco de palabras. El jugador elige una palabra
 * y luego pulsa el espacio donde quiere ponerla. La vista avisa con `onFill`,
 * pero no valida nada: eso lo hace el modelo ClozeSheet a través del controlador.
 */
export class PaperView {
  #container;
  #sentences = new Map();
  #wordButtons = new Map();
  #statusLabel = null;
  #selectedWord = null;
  #onFill = () => {};

  /**
   * @param {HTMLElement} container - Elemento donde se dibujará el papel.
   */
  constructor(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("PaperView: se necesita un elemento HTML como contenedor.");
    }
    this.#container = container;
  }

  /**
   * Dibuja el papel.
   * @param {Object} data
   * @param {string} data.title
   * @param {string} data.instructions
   * @param {{id: string, text: string, status: string, attemptsLeft: number}[]} data.sentences
   * @param {string[]} data.wordBank
   */
  render({ title, instructions, sentences, wordBank }) {
    this.#sentences.clear();
    this.#wordButtons.clear();
    this.#selectedWord = null;

    const section = document.createElement("section");
    section.className = "paper";
    section.setAttribute("aria-label", "Papel para completar");

    const heading = document.createElement("h2");
    heading.className = "paper__title";
    heading.textContent = title;

    const intro = document.createElement("p");
    intro.className = "paper__instructions";
    intro.textContent = instructions;

    const list = document.createElement("ol");
    list.className = "paper__sentences";
    sentences.forEach((sentence) => list.append(this.#createSentence(sentence)));

    this.#statusLabel = document.createElement("p");
    this.#statusLabel.className = "paper__status";
    this.#statusLabel.setAttribute("role", "status");
    this.#statusLabel.setAttribute("aria-live", "polite");

    section.append(heading, intro, list, this.#createBank(wordBank), this.#statusLabel);
    this.#container.replaceChildren(section);
  }

  /**
   * Registra la función que se ejecuta cuando el jugador intenta
   * poner una palabra en un espacio.
   * @param {(sentenceId: string, word: string) => void} handler
   */
  onFill(handler) {
    this.#onFill = handler;
  }

  /**
   * Muestra u oculta el papel.
   * @param {boolean} isVisible
   */
  setVisible(isVisible) {
    this.#container.hidden = !isVisible;
  }

  /**
   * Actualiza una oración después de un intento.
   * @param {string} sentenceId
   * @param {Object} result
   * @param {"pending"|"correct"|"locked"} result.status
   * @param {number} result.attemptsLeft
   * @param {string|null} [result.answer] - Respuesta correcta (solo si ya está resuelta).
   */
  updateSentence(sentenceId, { status, attemptsLeft, answer = null }) {
    const item = this.#sentences.get(sentenceId);
    if (!item) {
      return;
    }

    if (status === "correct") {
      this.#resolveBlank(item, answer, "is-correct");
      this.#wordButtons.get(answer)?.setAttribute("disabled", "");
      this.showMessage("¡Correcto!");
    } else if (status === "locked") {
      this.#resolveBlank(item, answer, "is-locked");
      this.showMessage("Demasiados errores: esa oración quedó bloqueada.");
    } else {
      item.attempts.textContent = this.#attemptsText(attemptsLeft);
      item.blank.classList.add("is-wrong");
      setTimeout(() => item.blank.classList.remove("is-wrong"), WRONG_FLASH_MS);
      this.showMessage("Esa no es. Intenta con otra palabra.");
    }

    this.#clearSelection();
  }

  /**
   * Muestra un mensaje de estado bajo el papel.
   * @param {string} text
   */
  showMessage(text) {
    if (this.#statusLabel) {
      this.#statusLabel.textContent = text;
    }
  }

  /**
   * @param {{id: string, text: string, status: string, attemptsLeft: number}} sentence
   * @returns {HTMLLIElement}
   */
  #createSentence({ id, text, attemptsLeft }) {
    const item = document.createElement("li");
    item.className = "paper__sentence";
    item.dataset.id = id;

    const [before, after = ""] = text.split(BLANK_MARKER);

    const blank = document.createElement("button");
    blank.type = "button";
    blank.className = "paper__blank";
    blank.textContent = EMPTY_BLANK_TEXT;
    blank.setAttribute("aria-label", "Espacio en blanco");
    blank.addEventListener("click", () => this.#handleBlankClick(id));

    const attempts = document.createElement("small");
    attempts.className = "paper__attempts";
    attempts.textContent = this.#attemptsText(attemptsLeft);

    item.append(document.createTextNode(before), blank, document.createTextNode(after), attempts);
    this.#sentences.set(id, { blank, attempts });
    return item;
  }

  /**
   * @param {string[]} words
   * @returns {HTMLElement}
   */
  #createBank(words) {
    const bank = document.createElement("div");
    bank.className = "paper__bank";
    bank.setAttribute("role", "group");
    bank.setAttribute("aria-label", "Banco de palabras");

    words.forEach((word) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "paper__word";
      button.textContent = word;
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => this.#handleWordClick(word));
      this.#wordButtons.set(word, button);
      bank.append(button);
    });
    return bank;
  }

  /** @param {string} word */
  #handleWordClick(word) {
    const wasSelected = this.#selectedWord === word;
    this.#clearSelection();

    if (!wasSelected) {
      this.#selectedWord = word;
      const button = this.#wordButtons.get(word);
      button.classList.add("is-selected");
      button.setAttribute("aria-pressed", "true");
      this.showMessage(`Palabra elegida: ${word}. Ahora pulsa un espacio en blanco.`);
    }
  }

  /** @param {string} sentenceId */
  #handleBlankClick(sentenceId) {
    if (this.#selectedWord === null) {
      this.showMessage("Primero elige una palabra del banco.");
      return;
    }
    this.#onFill(sentenceId, this.#selectedWord);
  }

  /** Quita la palabra seleccionada, si hay alguna. */
  #clearSelection() {
    if (this.#selectedWord !== null) {
      const button = this.#wordButtons.get(this.#selectedWord);
      button.classList.remove("is-selected");
      button.setAttribute("aria-pressed", "false");
      this.#selectedWord = null;
    }
  }

  /**
   * Muestra la respuesta en el espacio y lo bloquea.
   * @param {{blank: HTMLButtonElement, attempts: HTMLElement}} item
   * @param {string|null} answer
   * @param {string} stateClass
   */
  #resolveBlank(item, answer, stateClass) {
    item.blank.textContent = answer ?? EMPTY_BLANK_TEXT;
    item.blank.classList.add(stateClass);
    item.blank.disabled = true;
    item.attempts.textContent = "";
  }

  /**
   * @param {number} attemptsLeft
   * @returns {string}
   */
  #attemptsText(attemptsLeft) {
    return ` (intentos: ${attemptsLeft})`;
  }
}