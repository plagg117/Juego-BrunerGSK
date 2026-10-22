/**
 * Punto de entrada del juego.
 * Carga los datos y arma la partida: el estado, el panel de estado, el
 * controlador del juego y la pantalla de inicio.
 *
 * Para probar, la dirección admite dos parámetros opcionales. Con cualquiera
 * de los dos se omite la pantalla de inicio:
 *   ?room=room-03        empieza en esa sala (las anteriores cuentan como completadas)
 *   ?player=felipe       juega con ese personaje (si no, se elige uno al azar)
 */

console.log("Juego cargado correctamente.");

import { GameState } from "./models/GameState.js";
import { HudView } from "./views/HudView.js";
import { EndingView } from "./views/EndingView.js";
import { StartView } from "./views/StartView.js";
import { GameController } from "./controllers/GameController.js";
import { StartController } from "./controllers/StartController.js";
import {
  loadGameData,
  createRoomController,
  clearRoomContainers,
  select,
} from "./factories/roomFactory.js";

async function startGame() {
  const data = await loadGameData();
  const params = new URLSearchParams(window.location.search);
  const playerId = params.get("player") ?? undefined;
  const startRoomId = params.get("room") ?? undefined;

  const hud = new HudView(select("#hud-container"));
  const game = new GameController({
    state: new GameState({ characters: data.characters, rooms: data.rooms }),
    hudView: hud,
    endingView: new EndingView(select("#ending-container")),
    story: data.story,
    dialogues: data.dialogues,
    createRoom: (room) => createRoomController(room, data),
    clearContainers: clearRoomContainers,
  });

  // Modo de prueba: se salta el prólogo y la elección de personaje.
  if (playerId !== undefined || startRoomId !== undefined) {
    game.start({ playerId, startRoomId });
    return;
  }

  const start = new StartController({
    view: new StartView(select("#start-container")),
    story: data.story,
    characters: data.characters,
  });
  start.onChoose((chosenId) => game.start({ playerId: chosenId }));
  game.onRestart(() => {
    hud.setVisible(false);
    start.show({ skipPrologue: true });
  });

  hud.setVisible(false);
  start.show();
}

startGame().catch((error) => {
  console.error(error);
  const message = document.createElement("p");
  message.textContent = "No se pudo iniciar el juego. Revisa la consola para más detalles.";
  document.querySelector("#app")?.append(message);
});