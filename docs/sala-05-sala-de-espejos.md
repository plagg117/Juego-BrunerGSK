# Sala 5: La sala de espejos

**Sección del texto:** V (pp. 38-44), *El estudio apropiado del hombre*, en *Actos de significado* (J. Bruner).
**Concepto central:** cómo evitar el relativismo sin caer en el absolutismo. El constructivismo (el conocimiento es correcto o incorrecto según la perspectiva), el pragmatismo (preguntar a qué compromete una creencia), los valores como algo comunal y el pluralismo viable.

## Flujo de la sala

1. **Apertura:** una sala llena de espejos, cada uno con una frase escrita con vaho (texto en `rooms.json`, campo `intro`).
2. **Cassette:** escucha la grabación 5, «Perspectivas» (máximo 3 reproducciones). Esta sala **no tiene papel**.
3. **Los espejos:** al terminar de escuchar, aparecen cinco espejos, cada uno con una pregunta. Se necesitan al menos 4 aciertos.
4. **Salida:** uno de los espejos se abre como una puerta.

Esta sala **no necesita código nuevo**: usa el mismo motor de escenas con opciones que la Sala 3, con otra narración y otro tema. Ya se puede jugar con `index.html?room=room-05`.

## Archivos de datos

| Archivo | Contenido |
|---------|-----------|
| `src/data/rooms.json` | Sala `room-05`: narración de entrada y lista de actividades |
| `src/data/cassettes.json` | `cassette-05`: transcripción (sin papel) |
| `src/data/choices.json` | `choices-02`: los cinco espejos |
| `assets/audio/cassette-05.mp3` | Audio por grabar (ver guion) |

## Cassette 05: guion de la grabación

Voz del profesor: elegante y reflexivo, con un deje de ironía; aquí discute como en un seminario, seguro de sí mismo.

1. Bienvenidos a la sala de espejos. Mírense bien: cada uno ve algo distinto.
2. Aparece entonces el problema del relativismo. Si la cultura da forma a la mente, ¿no quedamos encerrados en un relativismo sin escapatoria?
3. Bruner propone cambiar la pregunta. Lo importante no es si lo que conocemos es absoluto o relativo, sino reconocer que el conocimiento es correcto o incorrecto según la perspectiva que adoptamos.
4. Eso es el constructivismo. No significa que todo valga: significa ser conscientes de nuestra propia perspectiva y de la de los demás.
5. El pragmatismo ayuda. En lugar de preguntar si una frase capta bien la cuestión, pregunten qué supondría creerla, o a qué se comprometerían si la creyeran.
6. Con los valores pasa igual: no son impulsos aislados ni cálculos de utilidad. Son comunales, y se entienden desde las formas de vida de una comunidad.
7. Y si los valores chocan, lo único que cabe esperar es un pluralismo viable, respaldado por la voluntad de negociar nuestras diferencias.
8. Veamos si saben hacerle las preguntas correctas a su propio reflejo.

## Los cinco espejos

| # | Espejo | Respuesta correcta | Idea del texto |
|---|--------|--------------------|----------------|
| 1 | «La Historia es la crónica de la lucha de clases» | «¿A qué me estaría comprometiendo si la creyese?» | Preguntas pragmáticas en vez de «¿capta la cuestión?» (p. 40) |
| 2 | Un informe dice que un grupo «tiene menos valía intelectual» | «¿Qué tipo de resultado es ese y qué significan rendimiento y valía?» | Cuestionar el significado de «valía intelectual» (p. 40) |
| 3 | «Si el conocimiento depende de la perspectiva, todo vale» | Ser conscientes de la propia perspectiva y de la de los demás | El constructivismo no es «todo vale» (pp. 39-41) |
| 4 | ¿De dónde vienen los valores? | Son comunales: cobran sentido en una comunidad cultural | Valores como algo comunal (pp. 41-43) |
| 5 | Valores que chocan entre sí | Un pluralismo viable con voluntad de negociar | Pluralismo en lugar de valor absoluto (p. 43) |

Cada espejo tiene 3 opciones y una explicación breve que se muestra tras responder. El espejo 5 funciona como el dilema final de la sala.

## Pistas progresivas (andamiaje)

| Nivel | Espejos |
|-------|---------|
| 1 | «Piensa en lo que dijo la grabación sobre perspectivas y compromisos.» |
| 2 | Se descarta una opción incorrecta. |
| 3 | Se descartan las dos opciones incorrectas. |

## Notas

- Los textos del cassette y de los espejos son paráfrasis del capítulo, escritas para el juego.
- El campo `rescues` queda en `null` a propósito: se había pensado que esta sala sea el reto personal del jugador (pendiente de definir cómo se resuelve con el personaje elegido al azar).
- La sala usa el mismo motor que la Sala 3. Si quieres una mecánica más distinta, una alternativa es **armar la pregunta pragmática** ordenando fragmentos de frase; implicaría construir otra mecánica nueva.