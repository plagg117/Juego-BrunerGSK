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

import { RoomView } from "./views/RoomView.js";
import { CassetteView } from "./views/CassetteView.js";
import { PaperView } from "./views/PaperView.js";
import { SortingView } from "./views/SortingView.js";

import { RoomController } from "./controllers/RoomController.js";
import { CassetteController } from "./controllers/CassetteController.js";
import { PaperController } from "./controllers/PaperController.js";
import { SortingController } from "./controllers/SortingController.js";

/** Sala que se carga al iniciar (por ahora solo la 1 está completa). */
const ROOM_ID = "room-01";

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
 * Busca el dato de una actividad que pertenece a una sala.
 * @param {{id: string}[]} items - Lista de datos (cassettes o clasificadores).
 * @param {{id: string, puzzles: string[]}} room
 * @param {string} label - Nombre de la actividad, para el mensaje de error.
 * @returns {Object}
 */
function findForRoom(items, room, label) {
  const found = items.find((item) => room.puzzles.includes(item.id));
  if (!found) {
    throw new Error(`La sala "${room.id}" no tiene ${label}.`);
  }
  return found;
}

async function startGame() {
  const [rooms, cassettes, sortings] = await Promise.all([
    loadJson("src/data/rooms.json"),
    loadJson("src/data/cassettes.json"),
    loadJson("src/data/sorting.json"),
  ]);

  const room = rooms.find((item) => item.id === ROOM_ID);
  if (!room) {
    throw new Error(`No existe la sala "${ROOM_ID}" en rooms.json.`);
  }
  const cassetteData = findForRoom(cassettes, room, "cassette");
  const sortingData = findForRoom(sortings, room, "clasificador");

  const roomController = new RoomController({
    room,
    view: new RoomView(select("#room-container")),
    cassetteController: new CassetteController(
      Cassette.fromData(cassetteData),
      new CassetteView(select("#cassette-container"))
    ),
    paperController: new PaperController(
      new ClozeSheet(cassetteData.paper),
      new PaperView(select("#paper-container"))
    ),
    sortingController: new SortingController(
      new SortingPuzzle(sortingData),
      new SortingView(select("#sorting-container"))
    ),
    messages: {
      paperSolved: cassetteData.feedback.correct,
      roomSolved: sortingData.feedback.correct,
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