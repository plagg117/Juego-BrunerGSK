# Pistas progresivas

Cada sala permite un número limitado de pistas (campo `hints` de `rooms.json`, hoy 3 por sala). El jugador las pide con el botón «Pedir pista» del panel de estado.

## Cómo funcionan

- **Presupuesto por sala.** Pedir una pista gasta una de las de la sala. Al pasar a la siguiente sala el presupuesto se renueva.
- **No cuentan como error.** Pedir pistas no acerca a perder a un compañero.
- **Tres niveles por etapa.** Cada sala tiene tres etapas: *cassette*, *papel* (si lo hay) y *reto final*. En cada etapa, cada petición sube el nivel (1: orientación, 2: más concreta, 3: casi la respuesta). El nivel se reinicia al cambiar de etapa y, una vez en 3, se queda en 3.
- **Si no hay pista para ese momento**, no se gasta nada y se avisa.
- **Antes de escuchar el cassette**, la pista es siempre la misma: escuchar la grabación hasta el final.
- **En las escenas con opciones (salas 3, 5 y final)**, los niveles 2 y 3 además **descartan una opción incorrecta** de la escena actual. Con el nivel 3 de una escena puede quedar solo la correcta. Los descartes no pasan a la escena siguiente.

## Ajustar

- El número de pistas de una sala se cambia en `src/data/rooms.json` (campo `hints`). Con `0` la sala no tiene pistas; para pistas casi ilimitadas basta con un número alto.
- Los textos están en los archivos de datos, en el campo `hints` de cada actividad (una lista de tres textos, del más suave al más explícito). Los papeles los llevan dentro de su campo `paper`.

## Textos de las pistas

| Sala | Actividad | Nivel 1 | Nivel 2 | Nivel 3 |
|------|-----------|---------|---------|---------|
| El laboratorio | Papel (completar) | Piensa en lo que decía la grabación al principio: la meta original de la Revolución Cognitiva. | Las respuestas son palabras clave de la grabación: mente, significado, procesamiento y ordenador. Falta decidir cuál va en cada oración. | Empieza por la oración sobre la meta original: se quería recuperar la mente y poner el significado en el centro de la psicología. |
| El laboratorio | Clasificador | Pregúntate: ¿esta ficha habla de dar sentido al mundo o de reglas y datos? | Procesamiento de información: reglas precisas, planificación previa, reducir alternativas, ser indiferente a lo almacenado y el vehículo en órbita. | Significado: construir sentido, actividades simbólicas, vaguedad y polisemia, y la mente de un fundamentalista. Las otras cuatro son de procesamiento. |
| La biblioteca | Tres cerraduras | Pregúntate: ¿esta ficha habla del método, de lo público o de las creencias y deseos? | Razón metodológica: no basta con estudiar al individuo, la mente se realiza a través de la cultura. Significado público: se comparte y se negocia, hasta los secretos se interpretan. | Psicología popular: la explicación de la cultura sobre cómo funcionan las personas (creencias, deseos, intenciones) y las instituciones que la inculcan: leyes, educación y familia. |
| El aula | Papel (encontrar el error) | Fíjate en cuándo el profesor expone la postura que critica Bruner y cuándo la que defiende. | Hay exactamente tres afirmaciones falsas. | Desconfía de las que dicen «confía plenamente», «conducta pura, sin considerar la intención» y «solo en lo que la gente hace». |
| El aula | Escenas | Recuerda la idea central de la grabación: decir y hacer van juntos y se interpretan juntos. | Descarta las opciones que separan lo que se dice de lo que se hace. | La respuesta correcta es la que une lo dicho, lo hecho y la intención. |
| El sótano | Prueba de memoria | Recuerda lo que dijo la grabación sobre los bloques (chunks): es más fácil retener pocos bloques que muchos dígitos sueltos. | Agrupa mentalmente los dígitos de tres en tres, aunque aparezcan juntos. | Repite los bloques en voz baja, uno detrás de otro, mientras el código está en pantalla. |
| La sala de espejos | Los espejos | Piensa en lo que dijo la grabación sobre perspectivas, compromisos y pluralismo. | Descarta las respuestas que son absolutas o que renuncian a opinar. | La correcta pide ser consciente de la propia perspectiva y de la de los demás, y negociar las diferencias. |
| El despacho del profesor | Papel (unir) | Cada concepto corresponde a una sala del juego: acuérdate de qué aprendiste en cada una. | Procesamiento de información y Argumento constitutivo son de las salas 1 y 2; Acción situada, de la 3. | Restricción biológica es la de los chunks (sala 4) y Constructivismo la de los espejos (sala 5). |
| El despacho del profesor | Debate | Recuerda la conclusión del capítulo: la psicología popular debe ser explicada, no descalificada. | Descarta las réplicas que aceptan eliminar o ignorar lo cultural. | La correcta defiende que las creencias y la cultura son parte esencial de cómo se vive juntos. |

En las escenas, los textos de los niveles 2 y 3 que ves aquí solo se muestran si ya no hay opciones que descartar; mientras haya, la pista describe lo que se descartó («Descarté una opción incorrecta»).

## Implementación

| Pieza | Responsabilidad |
|-------|-----------------|
| `utils/hints.js` | Elige el texto según el nivel y define el nivel máximo |
| `models/GameState.js` | Lleva el presupuesto de pistas de cada sala (`hintsLeft`, `useHint()`) |
| `controllers/RoomController.js` | Lleva la etapa y el nivel, y pide la pista a la actividad que corresponde (`requestHint()`) |
| Controladores de papeles y retos | Dan el texto de su pista con `getHint(nivel)` |
| `models/ChoicePuzzle.js`, `views/ChoiceView.js` | Descartan opciones incorrectas (`discardWrongOption()`, `removeOption()`) |
| `controllers/GameController.js` | Recibe la petición del botón, gasta la pista y la muestra |
| `views/HudView.js` | Botón «Pedir pista» y texto de la pista |