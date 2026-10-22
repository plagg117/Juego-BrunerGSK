# Sala final: El despacho del profesor

**Sección del texto:** VI (pp. 44-45), *El estudio apropiado del hombre*, en *Actos de significado* (J. Bruner).
**Concepto central:** la psicología científica positivista descalifica la psicología popular; Bruner defiende que hay que **explicarla, no descalificarla**. Las imágenes que la psicología ofrece del ser humano influyen en cómo las personas se ven a sí mismas.

## Flujo de la sala

1. **Apertura:** un despacho con una lámpara verde, un escritorio de roble y un retrato sin terminar (texto en `rooms.json`, campo `intro`).
2. **Cassette:** escucha la grabación 6, «Repaso» (máximo 3 reproducciones). Es un repaso de los conceptos de todo el capítulo.
3. **Papel (unir):** une 6 conceptos con sus definiciones. Es el único papel de este tipo en el juego.
4. **Frente a frente:** el jugador debate con la voz del profesor. Cinco afirmaciones del profesor; se necesitan al menos 4 réplicas correctas.
5. **Desenlace:** se abre la puerta del fondo y se aplica el final (todos salvos o algunos salvos).

## Archivos de datos

| Archivo | Contenido |
|---------|-----------|
| `src/data/rooms.json` | Sala `room-final`: narración de entrada y lista de actividades |
| `src/data/cassettes.json` | `cassette-06`: transcripción y papel de unir |
| `src/data/choices.json` | `choices-03`: el debate |
| `assets/audio/cassette-06.mp3` | Audio por grabar (ver guion) |

## Cassette 06: guion de la grabación

Voz del profesor: la más pausada y cercana de todas, casi amable. Resume todo lo aprendido con cierto orgullo y termina con una invitación inquietante.

1. Llegaron hasta mi despacho. Debo admitir que no esperaba tanta perseverancia.
2. Repasemos lo que han aprendido, o lo que fingieron aprender.
3. El procesamiento de información trabaja con entradas precisas y reglas previas, y es indiferente al significado.
4. El argumento constitutivo dice que la mente humana se realiza a través de la cultura: no basta con estudiar al individuo.
5. La psicología popular es la explicación que da una cultura de qué hace que las personas funcionen: creencias, deseos, intenciones.
6. La acción situada es la conducta con intención, dentro de un escenario cultural.
7. La biología es una restricción, no una causa, y la cultura inventa herramientas, como los chunks, para superar esos límites.
8. Y el constructivismo dice que el conocimiento es correcto o incorrecto según la perspectiva que se adopta, sin que eso signifique que todo valga.
9. Ahora, la hoja que tienen delante: únanlos como corresponde. Después hablaremos, frente a frente.

## Papel: unir conceptos con definiciones

El jugador une cada concepto con su definición. Cada concepto corresponde a una sala del juego, así que es un repaso.

| Concepto | Definición | Sala |
|----------|------------|------|
| Procesamiento de información | Opera con entradas precisas y reglas previas, y es indiferente al significado. | 1 |
| Argumento constitutivo | La mente humana se realiza a través de la cultura, así que no basta con estudiar al individuo. | 2 |
| Psicología popular | La explicación que da una cultura de qué hace que las personas funcionen: creencias, deseos e intenciones. | 2 |
| Acción situada | Conducta con intención, dentro de un escenario cultural y de estados intencionales compartidos. | 3 |
| Restricción biológica | Un límite natural, como el de la memoria inmediata, que la cultura puede superar con herramientas como los chunks. | 4 |
| Constructivismo | El conocimiento es correcto o incorrecto según la perspectiva adoptada, sin que por eso todo valga. | 5 |

Este papel usa la mecánica de unir, ya implementada (ver `docs/papeles-nuevos.md`). Cada 3 errores seguidos, el cassette pierde una reproducción.

## El debate (frente a frente)

| # | Afirmación del profesor | Réplica correcta | Página |
|---|-------------------------|------------------|--------|
| 1 | Libertad y dignidad son ilusiones sin valor científico | Son esenciales en el sistema de creencias de una cultura democrática | p. 44 |
| 2 | La psicología debe ocuparse solo de verdades objetivas | Sus verdades son relativas al punto de vista que adopta | p. 45 |
| 3 | La psicología popular son ilusiones tranquilizadoras | Son las creencias e hipótesis de trabajo de la cultura sobre cómo vivir juntos | p. 45 |
| 4 | La mente es una concatenación de reflejos y nada más | Importa: las imágenes de la psicología influyen en cómo la gente se ve a sí misma | pp. 44-45 |
| 5 | ¿Qué hacer con la psicología popular? | Explicarla, no descalificarla | p. 45 |

Usa el mismo motor de escenas con opciones que las salas 3 y 5, así que no necesita código nuevo.

## Finales

- **Final A: todos salvos.** Ningún compañero se perdió durante el juego.
- **Final B: algunos salvos.** Se perdió al menos un compañero.

Ambos finales dependen de la regla de compañeros perdidos (ver `docs/reglas-de-errores.md`). Los textos de los finales todavía no están escritos.

## Pendiente de esta sala

- **La revelación del motivo** ya está escrita: se muestra en la pantalla del final, antes del desenlace (ver `docs/historia.md`). El motivo es el currículo que desapareció y el profesor es un asesino.
- **Dónde se muestra el profesor.** Por ahora solo se oye su voz desde un altavoz; no aparece en persona. Es una decisión abierta.
- **Revisar los textos** de la revelación y de los finales (borradores míos en `src/data/story.json`).
- **Compañeros:** esta sala no pone a nadie en juego (`errorLimit: null`). Al superar el debate se abre la puerta y el final (A o B) depende de a cuántos compañeros se perdió antes (ver `docs/reglas-de-errores.md`).

## Pistas

Las pistas de esta sala (papel de unir y debate) están en `docs/pistas.md`.

## Notas

- Los textos del cassette y del debate son paráfrasis del capítulo, escritas para el juego.
- Las referencias al retrato sin terminar y a la voz en el altavoz son guiños al pasaje de Picasso y a la preocupación de Köhler del propio capítulo.