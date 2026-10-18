# Reglas de errores y compañeros

Esta es la regla que decide quién se salva. El código que la aplica es el modelo `GameState` (`src/models/GameState.js`).

## La regla

Cada sala tiene un **límite de errores**. Cuando el jugador comete más errores que ese límite, el profesor se lleva al **compañero de esa sala**. Si no lo supera, ese compañero queda libre al completar la sala.

- El límite se tolera: con límite 3, los errores 1 a 3 no tienen consecuencia y el **cuarto** hace que se pierda el compañero.
- Un compañero se pierde **una sola vez**: seguir equivocándose no pierde a nadie más.
- Perder al compañero **no bloquea la sala**: el jugador puede seguir y completarla.
- Los errores de una sala no se arrastran a la siguiente.

## Límites por sala

Están en el campo `errorLimit` de `src/data/rooms.json`. Son una propuesta inicial, para ajustar al probar el juego.

| Sala | Límite | Compañero en juego |
|------|--------|--------------------|
| 1. El laboratorio | 3 | Sí |
| 2. La biblioteca | 3 | Sí |
| 3. El aula | 4 | Sí |
| 4. El sótano | 3 | Sí |
| 5. La sala de espejos | sin límite (`null`) | No |
| Despacho final | sin límite (`null`) | No |

La Sala 3 tiene un límite mayor porque suma dos retos que pueden fallar (el papel de encontrar el error y cinco escenas). Las salas 5 y final no ponen a nadie en juego: los errores se cuentan, pero no se pierde a nadie.

## Qué cuenta como un error

Cada actividad informa de sus errores al coordinador de la sala, que los registra en `GameState`.

| Actividad | Qué cuenta como error |
|-----------|-----------------------|
| Papel de completar (Sala 1) | Una oración que se bloquea (dos intentos fallidos en ella) |
| Papel de encontrar el error (Sala 3) | Cada comprobación fallida |
| Papel de unir (despacho final) | Cada vez que se acumulan 3 errores seguidos |
| Clasificador (salas 1 y 2) | Cada comprobación con menos aciertos que el mínimo |
| Escenas con opciones (salas 3, 5 y final) | Cada respuesta incorrecta |
| Prueba de memoria (Sala 4) | Cada fallo en una prueba obligatoria (la prueba 1 es una demostración y no cuenta) |

Los papeles, además, le quitan una reproducción al cassette cada vez que cuentan un error. Los retos finales (clasificador, escenas y memoria) solo suman el error, sin tocar el cassette.

## Quién es el compañero de cada sala

Al empezar la partida, `GameState`:

1. Fija al jugador: el personaje que se elija, o uno al azar.
2. Reparte a los otros cuatro personajes entre las salas 1 a 4, en orden aleatorio.

Así cada partida cambia: no siempre se pone en juego a la misma persona en la misma sala.

## Los finales

- **Final A: todos salvos.** No se perdió ningún compañero.
- **Final B: algunos salvos.** Se perdió al menos un compañero.

El final se calcula al completar la última sala. `GameState` entrega el tipo de final, los compañeros que se salvaron y los que se perdieron.

## Cómo se aplica en el código

- Cada actividad avisa de sus errores: los papeles con `onPenalty`, y los retos finales con `onMistake`.
- `RoomController` reúne esos avisos y los emite hacia afuera con `onError`.
- `GameController` recibe cada error, se lo pasa a `GameState.registerError()` y muestra el aviso en el panel de estado:
  - «Quedan N errores antes de que el profesor se lleve a X».
  - «¡Cuidado! Un error más y el profesor se lleva a X».
  - «El profesor se lleva a X», cuando se supera el límite.
- Al completar una sala, se avisa de si el compañero se salvó o se perdió, y aparece el botón para pasar a la siguiente.
- Tras la última sala se muestra el final A o B.

## Cómo probarlo

La dirección admite dos parámetros opcionales, útiles mientras se ajustan los límites:

- `index.html?player=felipe`: juega con ese personaje (si no, se elige uno al azar).
- `index.html?room=room-03`: empieza en esa sala. Las anteriores cuentan como superadas y sus compañeros como salvados.

Se pueden combinar: `index.html?player=karen&room=room-04`.

## Estado

- Hecho: el modelo `GameState` (con pruebas), los datos (`characters.json` y `errorLimit` en `rooms.json`), el panel de estado, el controlador de la partida, el avance automático entre salas, la pantalla de inicio, los nombres en los textos y las pantallas de los finales.
- Por hacer: las pistas progresivas, los textos definitivos de los finales y la revelación del motivo del profesor.