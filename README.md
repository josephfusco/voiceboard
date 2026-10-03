# Voiceboard

A screen for in-car voice assistants. Any assistant that can open a URL (Grok, Gemini, Siri, Alexa, ChatGPT…) hosts games by voice and opens a new URL each turn; the page renders whatever the query string describes. Styled to feel native on the Tesla center screen, with a CarPlay-style sidebar.

Ships as a WordPress plugin that serves the board at `/board/`, and also works as plain static files.

## Install

**WordPress:** download `voiceboard.zip` from the [latest release](../../releases/latest), then Plugins → Add New → Upload. The board is live at `https://your-site/board/`. Change the path (blank = site root) under Settings → Reading, or in code:

```php
add_filter( 'voiceboard_path', fn () => 'play' );
```

**Static hosting:** serve the repo root as-is (no build step).

## URL format

Every app:

| Param | Meaning | Example |
|---|---|---|
| `g` | App: `trivia`, `jeopardy` (`categories`), `hall`, `home` | `trivia` |
| `st` | Screen (inferred if omitted) | `ask` |
| `t` | Title / category | `Space` |
| `p` | Set the roster, up to 6 players | `Joe:0,Sam:0` |
| `add` | Score changes against the remembered roster | `Sam:100,Joe:-200` |
| `reset` | `1` clears the remembered roster | `1` |
| `timer` | Countdown seconds (max 600) | `15` |
| `fx` | Effects | `confetti` |

**Trivia** (`st` = `ask`, `reveal`, `score`, `end`): `q` question, `c` choices split by `|`, `a` answer (`B`, `2`, or the text), `r` who got it or `none`, `n`/`of` progress.

**Jeopardy-style** (`st` = `board`, `clue`, `reveal`, `final`, `end`): `cats` categories split by `|`, `v` values (default 200–1000), `u` used clues like `A1,C3`, `at` the chosen clue, `q` clue, `a` response, `r` who got it, `dd=1` daily double, `w` final wagers.

```
/board/?g=trivia&st=ask&t=Space&n=1&of=5&q=Which+planet+has+the+most+moons%3F&c=Jupiter|Saturn|Uranus|Neptune&p=Joe:0,Sam:0&timer=15
/board/?g=trivia&st=reveal&t=Space&n=1&of=5&q=Which+planet+has+the+most+moons%3F&c=Jupiter|Saturn|Uranus|Neptune&a=B&r=Sam&add=Sam:100
/board/?g=jeopardy&st=board&cats=Space|Rivers|Movies|Food|Sports|Words&u=A1,C3
/board/?g=trivia&st=end&fx=confetti
```

Messy input is tolerated: double-encoded values decode, bad scores become 0, unknown apps open home.

## Remembered state

The URL is the source of truth for what's on screen. `localStorage` remembers the roster (so the host can send `add=` instead of every score) and the last 20 finished games (shown in the Hall of Fame). Reopening the same URL never applies its changes twice. Nothing is sent to the server, so page caching is unaffected.

## How an assistant learns the format

`index.html` contains plain-HTML hosting instructions. They're hidden once the board renders, but an assistant that reads the page without running JavaScript sees them, so "open your-site/board and host a trivia game" can work without a prompt.

## Structure

```
voiceboard.php        WordPress plugin: serves index.html at /board/ with a <base> to the plugin
index.html            shell + assistant instructions
board.css             Tesla-style light/dark theme, sidebar, screens, effects
js/main.js            boot: URL -> app -> remembered state -> screen -> effects
js/registry.js        keyed registries for apps and effects
js/params.js          typed param parsers and readParams(search, schema)
js/store.js           localStorage roster and history
js/dock.js            sidebar
js/screens.js         shared header, score strip, scoreboard, idle
js/apps/              home launcher, hall of fame
js/games/             trivia, categories
js/effects/           confetti, timer
```

### Adding a game

Create `js/games/<name>.js` and import it from `main.js` (import order is sidebar order):

```js
apps.register('name', {
	title: 'Display title',
	description: 'One line for the home tile.',
	phrase: "Let's play name",
	icon: ['M4 4h16v16H4z'],              // 24x24 SVG path data
	params: { x: text },                  // merged with the shared params
	screens: { ...sharedScreens, play },  // each screen: (state) => nodes
	pick: (state) => 'play',              // which screen to show
}, { alias: ['other-name'] });
```

Effects work the same way via `effects.register(name, { params, active(state), mount(board, state) })`.

## Development

```sh
npm install
npx playwright install chromium
npm test              # whole suite against static files and the plugin in WordPress Playground
npm run test:static   # static only, fastest
npm run serve         # static preview on :8766
npm run wp            # WordPress + plugin on :9400, board at /board/
```

Tag `v*` to publish a release with `voiceboard.zip`.
