# Los papeles: tres mecánicas distintas

El papel aparece solo en algunas salas (Sala 1, Sala 3 y despacho final) y cada vez es de un tipo diferente, para que no se repita.

| Sala | Tipo de papel | Campo `type` | Estado |
|------|---------------|--------------|--------|
| 1. El laboratorio | Completar oraciones | `cloze` | Hecho y jugable |
| 3. El aula | Encontrar el error | `errorHunt` | Datos listos (abajo); falta el código |
| Despacho final | Unir conceptos y definiciones | `match` | Datos listos (en `cassette-06`); falta el código |

Mientras no esté el código nuevo, la **Sala 3 sigue usando el papel de completar** (el que ya funciona). Cuando se construya el tipo `errorHunt`, se sustituye el bloque `paper` del `cassette-03` por el de este documento.

Si el campo `type` no aparece en un papel, se considera `cloze`. Si el tipo no está implementado, el juego muestra un mensaje claro en vez de fallar en silencio.

## Qué tienen en común

Los tres papeles se comportan igual hacia el exterior, para que `RoomController` no tenga que distinguirlos:

- `start()`, `show()` y `hide()`
- `onComplete(handler)`: se completó el papel
- Un aviso de **castigo** cuando el jugador falla de más (hoy se llama `onLockedSentence`; al sumar los nuevos tipos conviene renombrarlo `onPenalty`). Quien lo recibe es `RoomController`, que le quita una reproducción al cassette.

## 1. Completar oraciones (`cloze`)

Ya implementado. Una oración con un espacio en blanco y un banco de palabras; dos intentos por oración. Al bloquearse una oración, el cassette pierde una reproducción.

## 2. Encontrar el error (`errorHunt`) — Sala 3

**Cómo se juega:** la hoja muestra apuntes de un compañero sobre lo que dijo la grabación. Algunas afirmaciones son falsas porque contradicen lo escuchado. El jugador marca las que cree falsas y pulsa «Comprobar».

**Reglas propuestas:**

- Si las marcas coinciden con las afirmaciones falsas, se completa el papel.
- Si no, se indica cuántas afirmaciones están bien clasificadas (sin decir cuáles) y se pierde una reproducción del cassette.
- Se puede reintentar.

**Datos para `cassette-03`** (sustituirían al bloque `paper` actual cuando exista el código):

```json
"paper": {
  "type": "errorHunt",
  "title": "Apuntes de un compañero, con errores",
  "instructions": "Estos apuntes resumen la grabación, pero algunas afirmaciones son falsas. Marca las que contradicen lo que se dijo.",
  "statements": [
    {
      "id": "e3-1",
      "text": "La psicología científica confía plenamente en lo que la gente dice sobre sí misma.",
      "isFalse": true,
      "explanation": "La grabación dice lo contrario: la psicología científica desconfía de los estados subjetivos."
    },
    {
      "id": "e3-2",
      "text": "Según Bruner, decir y hacer constituyen una unidad inseparable.",
      "isFalse": false,
      "explanation": "Es la idea central de la grabación."
    },
    {
      "id": "e3-3",
      "text": "La psicología cultural se ocupa de la conducta pura, sin considerar la intención.",
      "isFalse": true,
      "explanation": "Se ocupa de la acción: la conducta con intención, situada en un escenario cultural."
    },
    {
      "id": "e3-4",
      "text": "El significado de una acción se interpreta según lo que sus actores dicen que pretenden.",
      "isFalse": false,
      "explanation": "Así lo explica la grabación, con el ejemplo de alguien que dice «lo siento» al empujar sin querer."
    },
    {
      "id": "e3-5",
      "text": "Una psicología sensible a la cultura debe basarse solo en lo que la gente hace.",
      "isFalse": true,
      "explanation": "Debe basarse también en lo que la gente dice que hace y en lo que dice que la llevó a hacerlo."
    },
    {
      "id": "e3-6",
      "text": "Decir «lo siento» al empujar sin querer muestra que lo que se dice da sentido a lo que se hace.",
      "isFalse": false,
      "explanation": "Es el ejemplo que usa la grabación."
    }
  ]
}
```

**Código nuevo necesario:** `models/ErrorHuntSheet.js`, `views/ErrorHuntView.js` y `controllers/ErrorHuntController.js`, más una entrada en `PAPER_TYPES` de `main.js`.

## 3. Unir conceptos (`match`) — despacho final

**Cómo se juega:** dos columnas, conceptos a la izquierda y definiciones a la derecha. El jugador elige un concepto y después la definición que le corresponde. Si acierta, el par queda unido; si no, cuenta como error.

**Reglas propuestas:**

- Un par correcto queda bloqueado.
- Cada 3 errores seguidos, el cassette pierde una reproducción.
- Se completa al unir los 6 pares.

**Datos:** ya están en `cassette-06` (campo `paper`, con `type: "match"` y la lista `pairs`).

**Código nuevo necesario:** `models/MatchSheet.js`, `views/MatchView.js` y `controllers/MatchController.js`, más una entrada en `PAPER_TYPES` de `main.js`.

## Orden recomendado para construirlos

1. `errorHunt` (Sala 3): es el más sencillo y completa una sala que ya es jugable.
2. `match` (despacho final): lo necesita el final del juego.