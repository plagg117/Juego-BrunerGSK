# Historia: El Seminario de Bruner

Documento de referencia de la historia del juego. Reúne lo ya decidido y lo que sigue pendiente.

## Premisa

Cinco estudiantes son invitados a un seminario especial de Psicología cognitiva a cargo del Dr. Jhon Alexander. Quedan encerrados en un edificio aislado en el campo, y solo pueden salir si demuestran que entendieron el texto de Bruner *El estudio apropiado del hombre* (cap. 1 de *Actos de significado*), resolviendo acertijos y respondiendo preguntas.

- **Tono:** thriller psicológico. El miedo viene de la voz y las insinuaciones del profesor más que de la violencia explícita.
- **Lugar:** un edificio solitario en medio del campo, sin señal de celular.
- **Motivo del profesor:** se mantiene en misterio hasta el final.

## El profesor

**Dr. Jhon Alexander.** Cordial, muy inteligente y pausado. Se comunica con los estudiantes a través de grabaciones en cassette. Defiende una visión de la mente como máquina (ver Sala 1) y trata a las personas como si fueran información que se procesa.

## Los estudiantes

Uno de estos cinco es el jugador, que elige quién ser al comenzar. Los otros cuatro pasan a ser sus compañeros.

| Personaje | Personalidad | Postura frente al texto |
|-----------|--------------|-------------------------|
| **Gabriela** | Líder analítica, mantiene la calma | Defiende la ciencia rigurosa y la medición |
| **Felipe** | Escéptico y sarcástico, el de tecnología | Ve la mente como computadora y desconfía de lo subjetivo |
| **Karen** | Empática y creativa | Entiende a las personas por el significado y la cultura |
| **Mariana** | Nerviosa, reacciona rápido y se angustia fácil | Relativista: «todo depende del punto de vista» |
| **Sofía** | Callada y muy observadora | Se fija en lo que la gente hace más que en lo que dice |

Notas:

- El personaje predeterminado se elige al azar entre los cinco.
- Las posturas conectan con las secciones del capítulo y sirven para que los diálogos entre compañeros repasen el contenido.
- Mariana tiene una postura nueva (relativismo), pensada como gancho para la Sala 5.

### Narración

La narración va en segunda persona («despiertas...») para que funcione con cualquier personaje. En los diálogos se usa el nombre del personaje elegido.

## Prólogo

> Hace una semana llegó la invitación: un seminario especial de Psicología cognitiva, cupos limitados, a cargo del Dr. Jhon Alexander. Solo cinco estudiantes fueron elegidos.
>
> El bus los dejó frente a un edificio solitario, en medio del campo. Sin señal en los celulares. El doctor los recibió con una sonrisa y una cena larga, y habló de la mente como si la conociera por dentro.
>
> Esa noche, al terminar el último café, todo se volvió borroso.
>
> Ahora despiertas en una sala blanca. Las puertas están cerradas. Sobre la mesa hay una grabadora y un cassette con una etiqueta: «Escucha con atención».

## Estructura del juego

Cinco salas y el despacho final, en el orden del capítulo. El detalle de cada sala está en `src/data/rooms.json` y, para la Sala 1, en `docs/sala-01-el-laboratorio.md`.

| # | Sala | Sección del texto |
|---|------|-------------------|
| 1 | El laboratorio | I |
| 2 | La biblioteca | II |
| 3 | El aula | III |
| 4 | El sótano | IV |
| 5 | La sala de espejos | V |
| ★ | El despacho del profesor | VI |

### El papel después del cassette

El papel **no aparece en todas las salas** y cada vez es de un tipo distinto, para que no se repita (decisión confirmada):

- **Sala 1:** completar oraciones.
- **Sala 3:** encontrar el error.
- **Despacho final:** unir conceptos con definiciones (repaso).
- **Salas 2, 4 y 5:** sin papel. El cassette lleva directamente al reto, y el reto usa lo que se dice en la grabación.

El detalle de cada tipo está en `docs/papeles-nuevos.md`.

## Finales

Hay dos finales:

- **Final A: todos salvos.** Ningún compañero se perdió y salen todos.
- **Final B: algunos salvos.** Se perdió al menos un compañero y salen solo los que quedaron.

**Propuesta (por ajustar al probar el juego):** cada sala tiene un límite de errores. Si el jugador lo supera, el profesor se lleva al compañero de esa sala. El final depende de cuántos compañeros llegan al despacho.

## Pendiente por definir

- Motivo del profesor y la revelación en el despacho final.
- Pistas sobre ese motivo repartidas en los cassettes y en cada sala.
- Qué compañero se libera en cada sala, según el personaje que elija el jugador.
- Reglas definitivas de errores y pérdida de compañeros.
- Texto de cada final.
- Guiones de las salas 2 a 5 y del despacho final.