/**
 * Fábrica de salas.
 *
 * Reúne todo lo necesario para convertir los datos de una sala en un
 * RoomController listo para usar: cargar los archivos de datos, elegir el
 * tipo de papel y de reto final que corresponden, y limpiar la pantalla al
 * cambiar de sala. Para añadir un tipo nuevo de reto o de papel basta con
 * agregarlo a CHALLENGE_TYPES o a PAPER_TYPES.
 */
import { loadJson } from "../utils/loadJson.js";

import { Cassette } from "../models/Cassette.js";
import { ClozeSheet } from "../models/ClozeSheet.js";
import { ErrorHuntSheet } from "../models/ErrorHuntSheet.js";
import { MatchSheet } from "../models/MatchSheet.js";
import { SortingPuzzle } from "../models/SortingPuzzle.js";
import { ChoicePuzzle } from "../models/ChoicePuzzle.js";
import { MemoryPuzzle } from "../models/MemoryPuzzle.js";

import { RoomView } from "../views/RoomView.js";
import { CassetteView } from "../views/CassetteView.js";
import { PaperView } from "../views/PaperView.js";
import { ErrorHuntView } from "../views/ErrorHuntView.js";
import { MatchView } from "../views/MatchView.js";
import { SortingView } from "../views/SortingView.js";
import { ChoiceView } from "../views/ChoiceView.js";
import { MemoryView } from "../views/MemoryView.js";

import { RoomController } from "../controllers/RoomController.js";
import { CassetteController } from "../controllers/CassetteController.js";
import { PaperController } from "../controllers/PaperController.js";
import { ErrorHuntController } from "../controllers/ErrorHuntController.js";
import { MatchController } from "../controllers/MatchController.js";
import { SortingController } from "../controllers/SortingController.js";
import { ChoiceController } from "../controllers/ChoiceController.js";
import { MemoryController } from "../controllers/MemoryController.js";

/** Contenedores del HTML donde se dibuja una sala. */
const ROOM_CONTAINERS = [
  "#room-container",
  "#cassette-container",
  "#paper-container",
  "#sorting-container",
  "#choice-container",
  "#memory-container",
];

/** Tipo de papel que se usa si los datos no indican otro. */
const DEFAULT_PAPER_TYPE = "cloze";

/**
 * Tipos de papel que puede tener un cassette. Todos se dibujan en el mismo
 * contenedor, porque una sala tiene como máximo un papel.
 */
const PAPER_TYPES = {
  cloze: (paper) =>
    new PaperController(new ClozeSheet(paper), new PaperView(select("#paper-container")), {
      hints: paper.hints,
    }),
  errorHunt: (paper) =>
    new ErrorHuntController(
      new ErrorHuntSheet(paper),
      new ErrorHuntView(select("#paper-container")),
      { hints: paper.hints }
    ),
  match: (paper) =>
    new MatchController(new MatchSheet(paper), new MatchView(select("#paper-container")), {
      hints: paper.hints,
    }),
};

/**
 * Tipos de reto final que puede tener una sala. Cada uno indica en qué
 * archivo están sus datos y cómo se arma su controlador.
 */
const CHALLENGE_TYPES = [
  {
    file: "src/data/sorting.json",
    create: (data) =>
      new SortingController(new SortingPuzzle(data), new SortingView(select("#sorting-container")), {
        hints: data.hints,
      }),
  },
  {
    file: "src/data/choices.json",
    create: (data) =>
      new ChoiceController(new ChoicePuzzle(data), new ChoiceView(select("#choice-container")), {
        hints: data.hints,
      }),
  },
  {
    file: "src/data/memory.json",
    create: (data) =>
      new MemoryController(new MemoryPuzzle(data), new MemoryView(select("#memory-container")), {
        hints: data.hints,
      }),
  },
];

/**
 * Busca un elemento del HTML o lanza un error si no existe.
 * @param {string} selector
 * @returns {HTMLElement}
 */
export function select(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`No se encontró el elemento "${selector}" en el HTML.`);
  }
  return element;
}

/**
 * Carga todos los archivos de datos del juego.
 * @returns {Promise<{characters: Object[], story: Object, dialogues: Object, rooms: Object[], cassettes: Object[], challengeLists: Object[][]}>}
 */
export async function loadGameData() {
  const [characters, story, dialogues, rooms, cassettes, ...challengeLists] = await Promise.all([
    loadJson("src/data/characters.json"),
    loadJson("src/data/story.json"),
    loadJson("src/data/dialogues.json"),
    loadJson("src/data/rooms.json"),
    loadJson("src/data/cassettes.json"),
    ...CHALLENGE_TYPES.map((type) => loadJson(type.file)),
  ]);
  return { characters, story, dialogues, rooms, cassettes, challengeLists };
}

/**
 * Vacía los contenedores de la sala anterior y los vuelve a mostrar.
 * Los contenedores que no existan en el HTML se ignoran.
 */
export function clearRoomContainers() {
  for (const selector of ROOM_CONTAINERS) {
    const container = document.querySelector(selector);
    if (container) {
      container.replaceChildren();
      container.hidden = false;
    }
  }
}

/**
 * Crea el RoomController de una sala a partir de los datos del juego.
 * @param {{id: string, puzzles: string[]}} room - Datos de rooms.json.
 * @param {{cassettes: Object[], challengeLists: Object[][]}} data - Resultado de loadGameData().
 * @returns {RoomController}
 */
export function createRoomController(room, { cassettes, challengeLists }) {
  const cassetteData = findCassette(cassettes, room);
  const challenge = findChallenge(challengeLists, room);

  return new RoomController({
    room,
    view: new RoomView(select("#room-container")),
    cassetteController: new CassetteController(
      Cassette.fromData(cassetteData),
      new CassetteView(select("#cassette-container"))
    ),
    paperController: createPaperController(cassetteData),
    challengeController: challenge.type.create(challenge.data),
    messages: {
      cassetteSolved: cassetteData.feedback.correct,
      roomSolved: challenge.data.feedback.correct,
    },
  });
}

/**
 * Crea el controlador del papel, si el cassette lo tiene.
 * @param {{id: string, paper?: Object}} cassetteData
 * @returns {Object|null}
 */
function createPaperController(cassetteData) {
  const { paper } = cassetteData;
  if (!paper) {
    return null;
  }

  const type = paper.type ?? DEFAULT_PAPER_TYPE;
  const create = PAPER_TYPES[type];
  if (!create) {
    throw new Error(`El papel de "${cassetteData.id}" es del tipo "${type}", que no existe.`);
  }
  return create(paper);
}

/**
 * Busca el cassette que pertenece a una sala.
 * @param {{id: string}[]} cassettes
 * @param {{id: string, puzzles: string[]}} room
 * @returns {Object}
 */
function findCassette(cassettes, room) {
  const found = cassettes.find((item) => room.puzzles.includes(item.id));
  if (!found) {
    throw new Error(`La sala "${room.id}" no tiene cassette.`);
  }
  return found;
}

/**
 * Busca el reto final de una sala entre todos los tipos de reto.
 * @param {Object[][]} challengeLists - Una lista de datos por cada tipo de CHALLENGE_TYPES.
 * @param {{id: string, puzzles: string[]}} room
 * @returns {{data: Object, type: {create: Function}}}
 */
function findChallenge(challengeLists, room) {
  for (const [index, list] of challengeLists.entries()) {
    const data = list.find((item) => room.puzzles.includes(item.id));
    if (data) {
      return { data, type: CHALLENGE_TYPES[index] };
    }
  }
  throw new Error(`La sala "${room.id}" no tiene reto final.`);
}