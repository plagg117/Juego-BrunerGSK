# Sala 3: El aula

**Sección del texto:** III (pp. 31-35), *El estudio apropiado del hombre*, en *Actos de significado* (J. Bruner).
**Concepto central:** la psicología cultural no separa lo que la gente *dice* de lo que *hace*. Decir y hacer son una unidad funcionalmente inseparable, y lo que le interesa a esta psicología es la *acción situada* (conducta con intención, en un escenario cultural), no la conducta aislada.

## Flujo de la sala

1. **Apertura:** el jugador entra a un aula con un pizarrón que dice «Lo que dicen no es lo que hacen» (texto en `rooms.json`, campo `intro`).
2. **Cassette:** escucha la grabación 3, «Decir y hacer» (máximo 3 reproducciones).
3. **Papel:** completa 4 oraciones con un banco de palabras. Si acierta todas, el proyector se enciende.
4. **Escenas:** interpreta 5 escenas, cada una con 3 opciones. Necesita al menos 4 aciertos.
5. **Salida:** una puerta que antes no estaba se abre y se libera a un compañero (`student-03`, por definir).

## Acertijo nuevo: las escenas

A diferencia de las salas 1 y 2, el último reto no es un clasificador. Es una serie de **escenas** breves (una situación cotidiana y una pregunta de opción múltiple). El jugador elige la interpretación que defendería Bruner, y después de cada respuesta ve una explicación con la página del texto.

Este tipo de reto necesita **código nuevo** (modelo, vista y controlador). Como es genérico, se reutilizará en otras salas con otra presentación.

## Archivos de datos

| Archivo | Contenido |
|---------|-----------|
| `src/data/rooms.json` | Sala `room-03`: narración de entrada y lista de actividades |
| `src/data/cassettes.json` | `cassette-03`: transcripción y papel |
| `src/data/choices.json` | `choices-01`: las cinco escenas (archivo nuevo) |
| `assets/audio/cassette-03.mp3` | Audio por grabar (ver guion) |

## Cassette 03: guion de la grabación

Voz del profesor: como un docente que disfruta dar clase. Presenta la postura que critica Bruner con entusiasmo, y se incomoda al llegar a la respuesta.

1. Bienvenidos al aula. Siéntense, como en cualquier clase. Hoy toca hablar de las objeciones.
2. La psicología científica desconfía de los estados subjetivos. Dice que lo que la gente cuenta sobre sí misma no es de fiar, que lo real es lo que hace.
3. Y hay estudios que muestran que la gente ni siquiera sabe explicar por qué elige lo que elige. Delicioso, ¿verdad?
4. El texto de Bruner responde con una idea que a mí, lo confieso, me incomoda: decir y hacer constituyen una unidad inseparable.
5. Una psicología que mira la cultura debe basarse no solo en lo que la gente hace, sino también en lo que dice que hace, y en lo que dice que la llevó a hacerlo.
6. El significado de una acción solo puede interpretarse en función de lo que sus actores dicen que pretenden. Piensen en alguien que dice «lo siento» mientras empuja a otro sin querer.
7. Por eso la psicología cultural no se ocupa de la conducta, sino de la acción: la conducta con intención, situada en un escenario cultural.
8. Veamos ahora si saben interpretar una escena. Les advierto: observo cada respuesta.

## Papel para completar

> **Cambio previsto:** el papel de esta sala pasará de «completar oraciones» a «encontrar el error», para que no sea la misma mecánica que la Sala 1. Los datos del nuevo papel están en `docs/papeles-nuevos.md`. Mientras no exista el código de ese tipo, la sala sigue usando el papel de completar que se describe a continuación.


| # | Oración | Respuesta | Distractores |
|---|---------|-----------|--------------|
| 1 | Decir y hacer constituyen una unidad funcionalmente ___. | inseparable | contradictoria, opcional |
| 2 | Una psicología sensible a la cultura debe basarse también en lo que la gente ___ que hace. | dice | oculta, ignora |
| 3 | El significado de una acción solo puede interpretarse en función de lo que los actores dicen que ___. | pretenden | recuerdan, temen |
| 4 | La psicología cultural no se ocupa de la conducta, sino de la ___. | acción | emoción, memoria |

Cada respuesta aparece en el audio.

## Las cinco escenas

| # | Escena | Respuesta correcta | Idea del texto |
|---|--------|--------------------|----------------|
| 1 | Alguien te empuja y dice «Lo siento» | Lo que dice da sentido al acto | El acto se interpreta según lo que el actor dice que pretendía (p. 34) |
| 2 | Un compañero te hiere y dice «No quise ofenderte» | Averiguar si el acto coincide con lo que pretendía | Si fue involuntario se exonera; si fue a propósito se intenta razonar (p. 33) |
| 3 | Dos personas firman un contrato y una no cumple | Se examina la relación entre lo dicho y lo hecho | Las leyes contractuales versan sobre esa relación (p. 33) |
| 4 | Un amigo te llama «tonto» sonriendo, en una broma | El significado depende de la acción en que ocurre | La palabra se determina por el tren de acción (p. 33) |
| 5 | Un compañero propone ignorar lo que la gente dice | Decir y hacer son una unidad inseparable | Separarlos es mala filosofía, antropología y psicología (p. 34) |

Cada escena tiene 3 opciones y una explicación breve que se muestra tras responder. La escena 5 sirve de gancho con las posturas de los compañeros (el escéptico, por ejemplo, podría decirla).

## Pistas progresivas (andamiaje)

| Nivel | Papel | Escenas |
|-------|-------|---------|
| 1 | «Piensa en el ejemplo del empujón y el "lo siento".» | «Pregúntate: ¿qué diría quien separa lo que se dice de lo que se hace?» |
| 2 | Se resalta la frase del cassette donde aparece la respuesta. | Se descarta una opción incorrecta. |
| 3 | Se revela la primera letra de la palabra. | Se descartan las dos opciones incorrectas. |

## Reglas de errores

Propuesta inicial, por ajustar al probar el juego:

- Una oración bloqueada en el papel le quita una reproducción al cassette (igual que en las salas anteriores).
- En las escenas no hay bloqueo: tras cada respuesta se muestra la explicación y se pasa a la siguiente. Con menos de 4 aciertos, las escenas vuelven a empezar.

## Implementación MVC (referencia)

| Capa | Archivo | Responsabilidad |
|------|---------|-----------------|
| Modelo | `models/ChoicePuzzle.js` | Escena actual, respuestas, aciertos y resultado; mezcla las opciones |
| Vista | `views/ChoiceView.js` | Narración, pregunta, opciones, explicación y resultado |
| Controlador | `controllers/ChoiceController.js` | Conecta el modelo con la vista y avisa al superar el reto |

`RoomController` no conoce el tipo de reto final: acepta cualquier controlador con `start()`, `show()`, `hide()` y `onComplete()`. Por eso la sala 3 usa `ChoiceController` y las salas 1 y 2 usan `SortingController`, sin cambiar el coordinador.

## Notas

- Los textos del cassette y de las escenas son paráfrasis del capítulo, escritas para el juego.
- La postura del profesor (desconfía de lo que la gente dice) lo muestra como representante de la psicología que Bruner critica, y prepara la confrontación final.
- El nombre del compañero que se libera depende del personaje elegido por el jugador (pendiente).