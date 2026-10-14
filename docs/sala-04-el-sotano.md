# Sala 4: El sótano

**Sección del texto:** IV (pp. 35-38), *El estudio apropiado del hombre*, en *Actos de significado* (J. Bruner).
**Concepto central:** la biología es una *restricción* de la acción humana, no su causa. La cultura inventa herramientas (como los *chunks* de la memoria) que superan los límites naturales.

## Flujo de la sala

1. **Apertura:** una escalera baja a un sótano sin ventanas, con una puerta metálica con teclado numérico (texto en `rooms.json`, campo `intro`).
2. **Cassette:** escucha la grabación 4, «Los límites» (máximo 3 reproducciones). Esta sala **no tiene papel**.
3. **Prueba de memoria:** al terminar de escuchar, la pantalla muestra códigos numéricos que hay que recordar y escribir en el teclado (tres pruebas).
4. **Salida:** la puerta metálica se abre y se libera a un compañero (`student-04`, por definir).

## Por qué el cassette importa aquí

La grabación explica la técnica de agrupar en bloques (*chunks*), que es justo lo que el jugador necesita para superar la prueba. Sin escucharla, la última prueba (12 dígitos) es casi imposible.

## Archivos de datos

| Archivo | Contenido |
|---------|-----------|
| `src/data/rooms.json` | Sala `room-04`: narración de entrada y lista de actividades |
| `src/data/cassettes.json` | `cassette-04`: transcripción (sin papel) |
| `src/data/memory.json` | `memory-01`: las tres pruebas de memoria (archivo nuevo) |
| `assets/audio/cassette-04.mp3` | Audio por grabar (ver guion) |

## Cassette 04: guion de la grabación

Voz del profesor: más grave y despacioso, casi didáctico, como quien disfruta teniendo a sus alumnos en un lugar sin salida.

1. Bajaron al sótano. Aquí no hay ventanas, así que no se distraigan con el paisaje.
2. Durante mucho tiempo se creyó que la cultura era solo una capa superpuesta sobre una naturaleza humana determinada por la biología, y que las causas de la conducta estaban en ese sustrato.
3. Bruner sostiene otra cosa: las verdaderas causas de la acción humana son la cultura y la búsqueda de significado dentro de ella. La biología es, como mucho, una restricción o una condición.
4. Un motor no es la causa por la que van en coche al supermercado. Sin motor no llegarían, pero el motor no decide qué compran.
5. Y esas restricciones son también un reto para la invención cultural. Las herramientas de una cultura son prótesis que permiten superar los límites naturales del funcionamiento humano.
6. Un ejemplo famoso: la memoria inmediata. George Miller observó que solo podemos retener siete elementos, más o menos dos.
7. Pero los seres humanos inventaron sistemas de codificación, como los números octales o los trucos mnemotécnicos. Gracias a ellos pasamos de retener unidades mínimas a retener bloques, los llamados chunks.
8. La biología pone límites, pero no para siempre. Pónganlo a prueba: esa puerta se abre con un código de memoria.

## La prueba de memoria

Un código numérico se muestra unos segundos y luego se oculta; el jugador lo escribe de memoria. Los códigos se generan al azar cada vez, así que no se pueden memorizar de una partida a otra.

| Prueba | Dígitos | Presentación | Tiempo | Obligatoria | Lo que enseña |
|--------|---------|--------------|--------|-------------|---------------|
| 1 | 9 | Sueltos (sin agrupar) | 4 s | No | Nueve unidades superan el «siete más o menos dos» |
| 2 | 9 | En 3 bloques de 3 | 4 s | Sí | Agrupar convierte nueve unidades en tres |
| 3 | 12 | En 4 bloques de 3 | 5 s | Sí | Con bloques, doce dígitos son solo cuatro unidades |

Reglas (propuesta inicial, por ajustar al probar el juego):

- La prueba 1 es una demostración: se muestre acierto o error, se explica y se pasa a la siguiente.
- En las pruebas obligatorias, un error muestra un código nuevo y se repite la prueba.
- Tras cada prueba se muestra una explicación breve con la página del texto (campo `explanation`).
- La sala se completa al superar la prueba 3.

## Código nuevo necesario

Esta sala necesita una mecánica propia:

| Capa | Archivo | Responsabilidad |
|------|---------|-----------------|
| Modelo | `models/MemoryPuzzle.js` | Genera los códigos, valida la respuesta y lleva el avance entre pruebas |
| Vista | `views/MemoryView.js` | Muestra el código con cuenta atrás, lo oculta y ofrece el teclado |
| Controlador | `controllers/MemoryController.js` | Conecta ambos y avisa al superar la prueba final |

Además, hay que añadir el tipo de reto a la lista `CHALLENGE_TYPES` de `main.js`.

## Pistas progresivas (andamiaje)

| Nivel | Prueba de memoria |
|-------|-------------------|
| 1 | «Recuerda lo que dijo la grabación sobre los bloques.» |
| 2 | El código se muestra un segundo más. |
| 3 | Se muestra el primer bloque junto al teclado. |

## Notas

- Los textos del cassette y de las pruebas son paráfrasis del capítulo, escritas para el juego.
- Estado: datos y guion listos; falta construir la mecánica de memoria.