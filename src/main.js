/**
 * Punto de entrada del juego.
 * Carga los datos, crea los modelos, las vistas y los controladores
 * de una sala y la pone en marcha.
 */

console.log("Juego cargado correctamente");

import { loadJson } from "./utils/loadJson.js";

import { Cassette } from "./models/Cassette.js";
import { ClozeSheet } from "./models/ClozeSheet.js";
import { SortingPuzzle } from "./models/SortingPuzzle.js";
import { ChoicePuzzle } from "./models/ChoicePuzzle.js";

import { RoomView } from "./views/RoomView.js";
import { CassetteView } from "./views/CassetteView.js";
import { PaperView } from "./views/PaperView.js";
import { SortingView } from "./views/SortingView.js";
import { ChoiceView } from "./views/ChoiceView.js";

import { RoomController } from "./controllers/RoomController.js";
import { CassetteController } from "./controllers/CassetteController.js";
import { PaperController } from "./controllers/PaperController.js";
import { SortingController } from "./controllers/SortingController.js";
import { ChoiceController } from "./controllers/ChoiceController.js";

/** Sala que se carga si la dirección no indica otra. */
const DEFAULT_ROOM_ID = "room-01";

/**
 * Tipos de reto final que puede tener una sala. Cada uno indica en qué
 * archivo están sus datos y cómo se arma su controlador.
 */
const CHALLENGE_TYPES = [
  {
    file: "src/data/sorting.json",
    create: (data) =>
      new SortingController(new SortingPuzzle(data), new SortingView(select("#sorting-container"))),
  },
  {
    file: "src/data/choices.json",
    create: (data) =>
      new ChoiceController(new ChoicePuzzle(data), new ChoiceView(select("#choice-container"))),
  },
];

/** Tipo de papel que se usa si los datos no indican otro. */
const DEFAULT_PAPER_TYPE = "cloze";

/**
 * Tipos de papel que puede tener un cassette. Cada uno indica cómo se arma
 * su controlador. Por implementar: "errorHunt" (encontrar el error) y
 * "match" (unir conceptos con definiciones).
 */
const PAPER_TYPES = {
  cloze: (paper) =>
    new PaperController(new ClozeSheet(paper), new PaperView(select("#paper-container"))),
};

/**
 * Busca un elemento del HTML o lanza un error si no existe.
 * @param {string} selector
 * @returns {HTMLElement}
 */
function select(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`No se encontró el elemento "${selector}" en el HTML.`);
  }
  return element;
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
 * Crea el controlador del papel, si el cassette lo tiene.
 * No todas las salas incluyen papel.
 * @param {{paper?: Object}} cassetteData
 * @returns {PaperController|null}
 */
function createPaperController(cassetteData) {
  const { paper } = cassetteData;
  if (!paper) {
    return null;
  }

  const type = paper.type ?? DEFAULT_PAPER_TYPE;
  const create = PAPER_TYPES[type];
  if (!create) {
    throw new Error(
      `El papel de "${cassetteData.id}" es del tipo "${type}", que todavía no está implementado.`
    );
  }
  return create(paper);
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

/**
 * Sala que se debe cargar. Mientras no exista el avance entre salas,
 * se puede elegir con la dirección: index.html?room=room-02
 * @returns {string}
 */
function getRoomId() {
  return new URLSearchParams(window.location.search).get("room") ?? DEFAULT_ROOM_ID;
}

async function startGame() {
  const [rooms, cassettes, ...challengeLists] = await Promise.all([
    loadJson("src/data/rooms.json"),
    loadJson("src/data/cassettes.json"),
    ...CHALLENGE_TYPES.map((type) => loadJson(type.file)),
  ]);

  const roomId = getRoomId();
  const room = rooms.find((item) => item.id === roomId);
  if (!room) {
    throw new Error(`No existe la sala "${roomId}" en rooms.json.`);
  }

  const cassetteData = findCassette(cassettes, room);
  const challenge = findChallenge(challengeLists, room);

  const roomController = new RoomController({
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

  roomController.onComplete((completedRoom) => {
    console.log(`Sala completada: ${completedRoom.name}`);
  });

  roomController.start();
}

startGame().catch((error) => {
  console.error(error);
  const message = document.createElement("p");
  message.textContent = "No se pudo iniciar el juego. Revisa la consola para más detalles.";
  document.querySelector("#app")?.append(message);
});