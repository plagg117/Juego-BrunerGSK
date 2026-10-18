# Sala 1: El laboratorio

**Sección del texto:** I (pp. 19-27), *El estudio apropiado del hombre*, en *Actos de significado* (J. Bruner).
**Concepto central:** la Revolución Cognitiva buscaba recuperar la mente y poner el *significado* en el centro de la psicología, pero derivó hacia el *procesamiento de información* y la computación como metáfora de la mente.

## Flujo de la sala

1. **Apertura:** el jugador despierta en el laboratorio (texto en `rooms.json`, campo `intro`).
2. **Cassette:** encuentra la grabadora y escucha el cassette (máximo 3 reproducciones).
3. **Papel:** completa 4 oraciones con un banco de palabras. Si acierta todas, el candado emite una luz verde.
4. **Clasificador:** en el ordenador, ordena 8 fichas en dos cajones (significado / procesamiento). Necesita al menos 6 aciertos.
5. **Salida:** la puerta se abre y se libera al compañero que `GameState` asignó a esta sala, salvo que ya se haya perdido por superar el límite de errores (3).

## Archivos de datos

| Archivo | Contenido |
|---------|-----------|
| `src/data/rooms.json` | Datos de todas las salas (solo la 1 está completa) |
| `src/data/cassettes.json` | Cassette 01: transcripción y papel con oraciones |
| `src/data/sorting.json` | Clasificador de fichas |
| `assets/audio/cassette-01.mp3` | Audio por grabar (ver abajo) |

## Cassette 01: guion de la grabación

Voz del profesor: pausada, grave, cortés, con un tono amenazante que crece al final. Se puede grabar con tu propia voz o con un generador de voz, y añadirle un efecto de cinta antigua con Audacity (ruido de fondo suave, un poco de eco y ecualización apagada).

1. Bienvenidos, mis queridos estudiantes. Pónganse cómodos... aunque no tienen mucha opción.
2. Hace décadas nació la Revolución Cognitiva con una meta noble: recuperar la mente en las ciencias humanas, después de un largo y frío invierno de objetivismo.
3. Lo que se buscaba era poner el significado en el centro de la psicología. No los estímulos y las respuestas. No la conducta que se puede observar. El significado.
4. Pero algo salió mal. Con el tiempo, el interés se desplazó del significado a la información, y la construcción de significado fue reemplazada por su procesamiento.
5. Y fíjense bien: la información es indiferente al significado. Al sistema le da igual si guarda sonetos de Shakespeare o cifras al azar.
6. La nueva metáfora dominante de la mente fue el ordenador. Y lo que importaba ya no era qué significaba algo, sino si era computable.
7. Yo, por supuesto, me quedé con la mente-máquina. Es más limpia. Nunca se pregunta qué significa nada.
8. Presten atención, porque esa puerta no se abrirá si no demuestran que han entendido.

Duración estimada: entre 60 y 75 segundos.

## Papel para completar

| # | Oración | Respuesta | Distractores |
|---|---------|-----------|--------------|
| 1 | La Revolución Cognitiva buscaba recuperar la ___ en las ciencias humanas. | mente | conducta, memoria |
| 2 | El concepto que se quería poner en el centro de la psicología era el ___. | significado | estímulo, impulso |
| 3 | Con el tiempo, la construcción de significado fue reemplazada por el ___ de la información. | procesamiento | descubrimiento, rechazo |
| 4 | La nueva metáfora dominante de la mente fue el ___. | ordenador | reflejo, símbolo |

Cada respuesta aparece en el audio, así que el papel premia la atención al cassette.

## Clasificador de fichas

**Significado:** estudiar cómo se construye sentido al encontrarse con el mundo, centrarse en las actividades simbólicas, poder enfrentarse a la vaguedad y la polisemia, preguntarse cómo está organizado el mundo en la mente de un fundamentalista islámico.

**Procesamiento de información:** ser indiferente a lo que se almacena, necesitar planificación previa y reglas precisas, considerar informativo lo que reduce las alternativas, preguntarse cómo enviar datos de control a un vehículo en órbita.

Cada ficha tiene una explicación breve (campo `explanation`) que se muestra después de responder. Es la parte que refuerza el aprendizaje.

## Pistas progresivas (andamiaje)

| Nivel | Papel | Clasificador |
|-------|-------|--------------|
| 1 | «Piensa en lo que decía la grabadora al principio.» | «Pregúntate: ¿esta ficha habla de sentido o de reglas y datos?» |
| 2 | Se resalta la frase del cassette donde aparece la respuesta. | Se descartan dos fichas ya correctas. |
| 3 | Se revela la primera letra de la palabra. | Se coloca una ficha de forma automática. |

Las pistas pueden asociarse a la habilidad del compañero que se libere en esta sala.

## Reglas de errores (propuesta inicial)

- Cada oración del papel permite 2 intentos. Al fallar el segundo, se bloquea esa oración y se pierde una reproducción del cassette.
- En el clasificador, cada error resta tiempo o un intento. Con menos de 6 aciertos, las fichas se mezclan de nuevo.
- Estos valores deben ajustarse al probar el juego.

## Implementación MVC (referencia)

| Capa | Archivo sugerido | Responsabilidad |
|------|------------------|-----------------|
| Modelo | `models/Cassette.js` | Controla reproducciones restantes y estado de la cinta |
| Modelo | `models/ClozeSheet.js` | Valida respuestas del papel |
| Modelo | `models/SortingPuzzle.js` | Valida la clasificación y calcula el puntaje |
| Vista | `views/CassetteView.js` | Grabadora con botones de reproducir, pausa y rebobinar |
| Vista | `views/PaperView.js` | Hoja con espacios y banco de palabras |
| Vista | `views/SortingView.js` | Fichas y dos cajones (se colocan con botones) |
| Vista | `views/RoomView.js` | Nombre de la sala, narración de entrada y mensajes de progreso |
| Controlador | `controllers/CassetteController.js` | Reglas de las reproducciones y aviso al terminar de escuchar |
| Controlador | `controllers/PaperController.js` | Valida el papel y avisa de oraciones bloqueadas |
| Controlador | `controllers/SortingController.js` | Conecta el clasificador con su vista |
| Controlador | `controllers/RoomController.js` | Orquesta el flujo de la sala y conecta las actividades entre sí |

## Notas

- Los textos del cassette y las fichas son paráfrasis del capítulo, escritas para el juego.
- Los nombres de los compañeros están pendientes de definir.