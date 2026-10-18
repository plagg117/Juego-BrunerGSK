# Sala 2: La biblioteca

**Sección del texto:** II (pp. 27-31), *El estudio apropiado del hombre*, en *Actos de significado* (J. Bruner).
**Concepto central:** la cultura tiene un papel *constitutivo* en la mente humana. Bruner da tres razones para ponerla en el centro de la psicología: una razón metodológica, el carácter público y compartido del significado, y la psicología popular.

## Flujo de la sala

1. **Apertura:** el jugador entra a una biblioteca silenciosa (texto en `rooms.json`, campo `intro`).
2. **Cassette:** escucha la grabación 2, «Las tres razones» (máximo 3 reproducciones).
3. **Las tres cerraduras:** al terminar de escuchar, se enciende una luz sobre la puerta del fondo y aparece el clasificador. Hay que clasificar 9 fichas en tres cerraduras, una por cada razón. Se necesitan al menos 7 aciertos.
4. **Salida:** la puerta se abre y se libera al compañero asignado a esta sala, salvo que ya se haya perdido por superar el límite de errores (3).

Esta sala **no tiene papel**: el cassette lleva directamente al reto. El papel aparece solo en algunas salas para no repetirse (ver `docs/historia.md`). Las oraciones que tenía están guardadas en `docs/papel-reservado.md`.

Esta sala **no necesita código nuevo**: reutiliza el clasificador de la Sala 1, que ahora tiene tres categorías en vez de dos.

## Archivos de datos

| Archivo | Contenido |
|---------|-----------|
| `src/data/rooms.json` | Sala `room-02`: narración de entrada y lista de actividades |
| `src/data/cassettes.json` | `cassette-02`: transcripción (sin papel) |
| `src/data/sorting.json` | `sorting-02`: las tres cerraduras |
| `assets/audio/cassette-02.mp3` | Audio por grabar (ver guion) |

## Cassette 02: guion de la grabación

Voz del profesor: la misma de la Sala 1, pero más confiada. Ahora sabe que sus estudiantes siguen vivos y se burla con cortesía. Al hablar de la psicología popular, su tono se vuelve desdeñoso.

1. Veo que siguen vivos. Qué perseverancia. Bienvenidos a mi biblioteca.
2. Una pregunta, mientras recuperan el aliento: ¿de dónde sacaron las palabras con las que piensan? ¿Las inventaron ustedes?
3. Los psicólogos hemos tenido la costumbre de pensar desde puntos de vista individualistas. Estudiábamos cómo cada persona adquiría el lenguaje y los símbolos, igual que un organismo se adapta a su entorno. Pero esos sistemas simbólicos ya estaban allí, arraigados en el lenguaje y la cultura.
4. Primera razón: es imposible construir la psicología humana basándose solo en el individuo. Como decía Geertz, no hay una naturaleza humana al margen de la cultura.
5. Segunda razón: al participar en la cultura, el significado se hace público y compartido. Nadie aprende a vivir con otros practicando a solas.
6. Tercera razón: la psicología popular, la explicación que da la cultura de qué hace que los seres humanos funcionen. Creencias, deseos, intenciones... Yo las encuentro, digamos, poco rigurosas.
7. Tres razones, tres cerraduras. Esa puerta no se abrirá hasta que sepan cuál es cuál.

## Las tres cerraduras

Cada cerradura corresponde a una de las razones que da Bruner. Hay 9 fichas, tres por cerradura.

**Cerradura 1: razón metodológica** (el argumento constitutivo)
- No se puede construir la psicología humana basándose solo en el individuo.
- Las potencialidades mentales del ser humano se realizan a través de la cultura, no al margen de ella.
- Los seres humanos no terminan en su propia piel: son una expresión de la cultura.

**Cerradura 2: significado público**
- El niño entra en la vida de su grupo participando en un proceso público, no con ejercicios privados.
- Incluso los secretos, una vez revelados, resultan públicamente interpretables.
- Existen formas de discurso compartidas para negociar las diferencias de significado e interpretación.

**Cerradura 3: psicología popular**
- Es la explicación que da la cultura de qué hace que los seres humanos funcionen.
- Se ocupa de las creencias, los deseos, las intenciones y los compromisos.
- Las leyes, las instituciones educativas y las estructuras familiares sirven para inculcarla.

Cada ficha tiene una explicación breve (campo `explanation`) que se muestra después de comprobar.

## Pistas progresivas (andamiaje)

| Nivel | Cerraduras |
|-------|------------|
| 1 | «Pregúntate: ¿esta ficha habla del método, de lo público o de las creencias y deseos?» |
| 2 | Se descartan dos fichas ya correctas. |
| 3 | Se coloca una ficha de forma automática. |

## Reglas de errores

Propuesta inicial, por ajustar al probar el juego:

- En las cerraduras, con menos de 7 aciertos las fichas se mezclan de nuevo.
- Como no hay papel, el cassette sirve para escuchar las tres razones y volver a consultarlas mientras se clasifica (sus reproducciones son limitadas).

## Notas

- Los textos del cassette y las fichas son paráfrasis del capítulo, escritas para el juego.
- La postura del profesor frente a la psicología popular (la considera poco rigurosa) prepara la confrontación final de la sala VI, donde el capítulo defiende que debe ser explicada y no descalificada.
- El compañero de esta sala lo asigna `GameState` al empezar la partida, según el personaje elegido por el jugador (ver `docs/reglas-de-errores.md`).