# Textos del juego y marcas de nombres

Los textos que ve el jugador viven en archivos de datos, no en el código. Algunos llevan **marcas** entre llaves, como `{player}`, que el juego reemplaza por los nombres reales de la partida.

## Dónde está cada texto

| Texto | Archivo | Campo |
|-------|---------|-------|
| Título del juego, prólogo y textos de la elección de personaje | `src/data/story.json` | `title`, `prologue`, `characterSelection` |
| Finales A y B | `src/data/story.json` | `endings.A`, `endings.B` |
| Revelación del motivo del profesor | `src/data/story.json` | `revelation` |
| Frases de los compañeros | `src/data/dialogues.json` | `characters` (ver `docs/dialogos-companeros.md`) |
| Narración de entrada de cada sala | `src/data/rooms.json` | `intro` |
| Frase del compañero que está en juego en la sala | `src/data/rooms.json` | `companionIntro` |
| Personajes (nombre, personalidad, postura) | `src/data/characters.json` | |
| Guion de cada cassette | `src/data/cassettes.json` | `transcript` |
| Pistas de cada actividad | `cassettes.json` (dentro de `paper`), `sorting.json`, `choices.json` y `memory.json` | `hints` |

## Marcas disponibles

| Marca | Se reemplaza por | Dónde se puede usar |
|-------|------------------|---------------------|
| `{player}` | Nombre del personaje que juega | `intro` de las salas y finales |
| `{companion}` | Nombre del compañero que está en juego en esa sala | `intro` y `companionIntro` (solo en las salas 1 a 4) |
| `{companions}` | Los cuatro compañeros, como «A, B, C y D» | `intro` de las salas |
| `{survivors}` | Compañeros que salieron contigo (o «ninguno») | Finales |
| `{lost}` | Compañeros que se perdieron (o «ninguno») | Finales |

Una marca desconocida se deja tal cual en pantalla, para que se note el error al probar.

## Cómo se arma la narración de una sala

1. Se toma el `intro` de la sala.
2. Si la sala tiene un compañero en juego, se le suma el `companionIntro`.
3. Se reemplazan las marcas por los nombres de la partida.

## Reglas para escribir con marcas

- **Evita pronombres y adjetivos que marquen género** al hablar de un compañero (el/la, atado/atada, lo/la). Los cinco personajes pueden ser cualquiera de las salas, y el nombre `{companion}` cambia en cada partida.
- Las marcas solo funcionan en los textos que pasan por el juego: **los audios de los cassettes no pueden llevar nombres**.
- Si una marca se usa en una sala que no tiene compañero en juego (salas 5 y final), quedará vacía o sin reemplazar. Para esas salas usa solo `{player}`.

## Borradores de los finales

Los finales A y B y la revelación de `story.json` son **borradores**. Ambos finales dejan abierto el paradero del Dr. Jhon Alexander. Basta con editar los párrafos de `endings` y de `revelation` para cambiarlos.