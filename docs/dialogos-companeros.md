# Diálogos de los compañeros

Los compañeros hablan **en texto**, dentro del panel de estado (no en cassettes). Cada frase es de un personaje, está escrita desde su personalidad y su postura frente al texto, y se dirige al jugador por su nombre (`{player}`).

## Por qué en texto y no en cassette

- El personaje que juega y el compañero de cada sala **cambian en cada partida**; un audio grabado no puede decir quién es quién.
- Haría falta una grabación por personaje y sala, con cinco voces distintas.
- Así el cassette sigue siendo solo la voz del profesor.

## Cuándo hablan

| Momento | Quién habla | Qué dice |
|---------|-------------|----------|
| Al empezar una sala (1 a 4) | El compañero que está en juego en esa sala | Una frase sobre el tema de la sala, desde su postura |
| Al perderse (superar el límite de errores) | El compañero que se pierde | Su despedida |
| Al completar la sala sin perderlo | El compañero rescatado | Su agradecimiento |

Las salas 5 y final no tienen compañero en juego, así que allí no habla nadie.

## Las frases

Datos en `src/data/dialogues.json`. En cada frase, `{player}` es el nombre del personaje que juega.

### Gabriela

| Momento | Frase |
|---------|-------|
| Al empezar la sala 1 | {player}, escucha bien la grabación y anota todo. Lo que se puede medir se puede comprobar. |
| Al empezar la sala 2 | Estudiar solo al individuo es medir con media regla. Aquí hay que mirar el contexto, {player}. |
| Al empezar la sala 3 | Lo que alguien dice y lo que hace deben coincidir. Si no, algo esconde, {player}. |
| Al empezar la sala 4 | Respira y agrupa. Siete elementos, más o menos dos: es lo que podemos retener, {player}. Usa bloques. |
| Al salvarse | Gracias, {player}. Sigamos juntos: yo tomo nota de todo lo que veamos. |
| Al perderse | Sigue sin mí, {player}. Anota todo. No te detengas. |

### Felipe

| Momento | Frase |
|---------|-------|
| Al empezar la sala 1 | Una mente es un procesador, ¿no? Aunque este profesor me da mala espina, {player}: demasiado entusiasmo para ser un simple programa. |
| Al empezar la sala 2 | Cultura, cultura... ¿cómo se mide eso, {player}? Aun así, no me río: nadie piensa solo, ni siquiera yo. |
| Al empezar la sala 3 | Siempre dije que lo que la gente cuenta de sí misma es puro cuento. Aquí empiezo a dudar, {player}. |
| Al empezar la sala 4 | Un buen sistema de codificación vale más que una buena memoria. Divide el código, {player}. |
| Al salvarse | No lo diré dos veces: gracias, {player}. Ahora sí tengo curiosidad por saber qué quiere este tipo. |
| Al perderse | Parece que sí era algo más que un programa, {player}. Sal de aquí. |

### Karen

| Momento | Frase |
|---------|-------|
| Al empezar la sala 1 | No me importa cuántos datos procese: lo que cuenta es qué significa estar aquí, {player}. |
| Al empezar la sala 2 | Nadie piensa solo, {player}: todo lo que sabemos nos lo dieron otros. Eso quiere que entendamos. |
| Al empezar la sala 3 | Dime «lo siento» mientras me empujas y sabré cómo interpretar el empujón, {player}. Las dos cosas van juntas. |
| Al empezar la sala 4 | Mi abuela guardaba los teléfonos como si fueran canciones. Convierte el código en algo con sentido, {player}. |
| Al salvarse | Qué alivio, {player}. Cada cosa que aprendimos ahí dentro nos acerca a la salida. |
| Al perderse | No dejes de preguntarte qué significa todo esto, {player}. Prométemelo. |

### Mariana

| Momento | Frase |
|---------|-------|
| Al empezar la sala 1 | ¿Y si todo esto depende de cómo se mire? No sé... ¡dime que tienes un plan, {player}! |
| Al empezar la sala 2 | Todo depende de dónde se mire, ¿verdad? Ay, ¿por qué siempre me toca la puerta con más cerraduras? |
| Al empezar la sala 3 | Cuando me pongo nerviosa digo una cosa y hago otra. ¿Eso también cuenta, {player}? |
| Al empezar la sala 4 | Uno, dos, tres... ¡se me olvida! ¿Era de tres en tres, {player}? |
| Al salvarse | ¡Estoy libre! Gracias, {player}. Prometo no desmayarme... demasiado. |
| Al perderse | ¡{player}, no me dejes! ¡No, por favor! |

### Sofía

| Momento | Frase |
|---------|-------|
| Al empezar la sala 1 | Fíjate en lo que hace el doctor, no en lo que dice. Ahí está la pista, {player}. |
| Al empezar la sala 2 | Mira los huecos de los estantes, {player}. Alguien sacó libros de aquí hace tiempo. |
| Al empezar la sala 3 | Mira lo que hacen y escucha lo que dicen que hacen. Las dos cosas, {player}. |
| Al empezar la sala 4 | Mientras él habla, cuenta sus pausas. Los bloques están en el ritmo, {player}. |
| Al salvarse | Gracias. Te vi resolverlo. Quédate cerca, {player}: algo no cuadra en este edificio. |
| Al perderse | Lo vi venir, {player}. Mira lo que hace, no lo que dice. |

## Cómo editarlas

- Cada personaje necesita las seis frases (cuatro de sala, `rescued` y `lost`); si falta alguna, ese momento queda sin diálogo.
- La única marca permitida es `{player}`.
- Evita pronombres y adjetivos que marquen género al hablar de otro personaje: cada uno puede ser el jugador o un compañero en cualquier partida.

## Implementación

- `views/HudView.js` dibuja el cuadro de diálogo (`showDialogue`).
- `controllers/GameController.js` elige la frase y pone el nombre del jugador.
- `factories/roomFactory.js` carga `dialogues.json` junto con los demás datos.