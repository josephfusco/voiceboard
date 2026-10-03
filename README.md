# Car Game Board

A static, client-side game board for the Tesla in-car browser. Grok hosts by voice and opens a new URL each turn; the page renders whatever state the query string describes. No backend.

## URL format

Shared by every game:

| Param | Meaning | Example |
|---|---|---|
| `g` | Game (default `trivia`) | `trivia` |
| `st` | Screen (inferred if omitted) | `ask` |
| `t` | Title / category | `Space` |
| `n` / `of` | Question number / total | `3` / `10` |
| `p` | Up to 6 players and scores | `Joe:200,Sam:100` |

Trivia (`st` = `ask`, `reveal`, `score`, `end`):

| Param | Meaning | Example |
|---|---|---|
| `q` | Question | `Which planet has the most moons?` |
| `c` | Choices, pipe-separated (up to 6; omit for open-ended) | `Jupiter\|Saturn\|Uranus\|Neptune` |
| `a` | Answer: `1`-`6`, `A`-`F`, or the text itself | `B` |
| `r` | Who got it right, or `none` | `Sam` |

```
/?st=ask&t=Space&n=3&of=10&q=Which+planet+has+the+most+moons%3F&c=Jupiter|Saturn|Uranus|Neptune&p=Joe:200,Sam:100
/?st=reveal&t=Space&n=3&of=10&q=Which+planet+has+the+most+moons%3F&c=Jupiter|Saturn|Uranus|Neptune&a=B&r=Sam&p=Joe:200,Sam:200
/?st=end&t=Space&p=Joe:300,Sam:500
```

Bad input degrades gracefully: double-encoded values are decoded, bad scores become 0, and a missing or unknown `st` is inferred.

## Structure

```
index.html          shell + plain-HTML hosting instructions for assistants that don't run JS
board.css           light/dark styling for the car screen
js/main.js          boot: read URL -> look up game -> render the screen it picks
js/registry.js      keyed registry; games register themselves on import
js/params.js        typed param parsers and readParams(search, schema)
js/dom.js           h() element builder
js/screens.js       shared header, score strip, scoreboard, idle screens
js/games/trivia.js  trivia params, screens, and screen picker
```

### Adding a game

Create `js/games/<name>.js`, register it, and import it from `main.js`:

```js
games.register('name', {
	title: 'Display title',
	params: { x: text },                  // merged with the shared params
	screens: { ...sharedScreens, play },  // each screen: (state) => nodes
	pick: (state) => 'play',              // which screen to show
});
```

## Local preview

```sh
php -S 127.0.0.1:8765   # or: npx serve
```
