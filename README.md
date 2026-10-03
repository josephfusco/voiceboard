# Voiceboard

Voiceboard is a game screen for in-car voice assistants. The assistant hosts by voice and opens a new URL at every step, and the page draws whatever the query string describes. Any assistant that can open a link can host, and the design follows in-car interfaces, with a CarPlay-style sidebar.

It ships as a WordPress plugin that serves the board at `/board/`, and it also runs as plain static files.

## Try it

Each link is one screen, exactly as an assistant would open it:

- [Home](https://voiceboard.wpengine.com/): the launcher (the bare domain redirects to the board)
- [Space trivia with a 15-second countdown](https://voiceboard.wpengine.com/board/?g=trivia&st=ask&t=Space&n=3&of=10&q=Which+planet+has+the+most+known+moons%3F&c=Jupiter|Saturn|Uranus|Neptune&p=Joe:200,Sam:100&timer=15)
- [The reveal: Sam got it](https://voiceboard.wpengine.com/board/?g=trivia&st=reveal&t=Space&n=3&of=10&q=Which+planet+has+the+most+known+moons%3F&c=Jupiter|Saturn|Uranus|Neptune&a=B&r=Sam&p=Joe:200,Sam:200)
- [Name that movie in emoji](https://voiceboard.wpengine.com/board/?g=trivia&st=ask&t=Emoji+Movies&q=🦁👑&c=The+Lion+King|Madagascar|Zootopia|Tarzan&timer=20)
- [Open-ended, and nobody got it](https://voiceboard.wpengine.com/board/?g=trivia&st=reveal&t=History&q=Who+was+the+first+person+in+space%3F&a=Yuri+Gagarin&r=none&p=Joe:300,Sam:300)
- [Kids' round: quick math](https://voiceboard.wpengine.com/board/?g=trivia&st=ask&t=Quick+Math&q=7+×+8+%3D+%3F&c=54|56|58|64&p=Mia:2,Leo:3&timer=10)
- [Jeopardy board mid-game](https://voiceboard.wpengine.com/board/?g=jeopardy&st=board&cats=Space|Rivers|80s+Movies|Food|Sports|Words&u=A1,C3,F5,B2&at=D4&p=Joe:400,Sam:-200,Ava:1200)
- [Daily Double!](https://voiceboard.wpengine.com/board/?g=jeopardy&st=clue&cats=Space|Rivers|80s+Movies|Food|Sports|Words&at=B3&q=This+river+flows+through+Cairo&dd=1&timer=10&p=Joe:400,Sam:-200,Ava:1200)
- [Final Jeopardy with wagers](https://voiceboard.wpengine.com/board/?g=jeopardy&st=final&t=Final+Jeopardy&q=This+planet+has+the+tallest+volcano+in+the+solar+system&a=What+is+Mars%3F&r=Ava&w=Joe:400,Ava:1200&p=Joe:0,Ava:2400)
- [Dead heat](https://voiceboard.wpengine.com/board/?g=trivia&st=end&t=Road+Trip+Trivia&p=Joe:500,Sam:500,Ava:300)
- [Six-player finale with confetti](https://voiceboard.wpengine.com/board/?g=trivia&st=end&t=Space&p=Joe:300,Sam:500,Ava:400,Max:250,Lee:450,Kim:100&fx=confetti)
- [Cyber theme: neon Jeopardy board](https://voiceboard.wpengine.com/board/?g=jeopardy&st=board&cats=Robots|Space|Synthwave|Hackers|Neon|Future&u=A1,D2&at=C3&p=Neo:800,Trinity:1200,Morpheus:400&theme=cyber)
- [Cyber theme: final answer, 10 seconds](https://voiceboard.wpengine.com/board/?g=trivia&st=ask&t=Sci-Fi&q=What+year+does+Blade+Runner+take+place%3F&c=2019|2049|2077|2001&timer=10&p=Neo:300,Trinity:400&theme=cyber)
- [Guess the national anthem's country](https://voiceboard.wpengine.com/board/?g=trivia&st=ask&t=Around+the+World&q=Which+country+has+a+national+anthem+with+no+official+lyrics%3F&c=Spain|Brazil|Japan|Canada&p=Mia:0,Leo:0)
- [Road trip: which state is this?](https://voiceboard.wpengine.com/board/?g=trivia&st=ask&t=Road+Trip&q=Which+state+is+home+to+the+Grand+Canyon%3F&c=Utah|Nevada|Arizona|Colorado&timer=15)
- [Emoji food rebus](https://voiceboard.wpengine.com/board/?g=trivia&st=ask&t=Emoji+Food&q=🌭+🔥+⚾&c=Ballpark+frank|Campfire+cookout|Chili+dog|Corn+dog)
- [Dad joke round](https://voiceboard.wpengine.com/board/?g=trivia&st=reveal&t=Dad+Jokes&q=Why+don't+skeletons+fight+each+other%3F&a=They+don't+have+the+guts&r=Dad&add=Dad:100)
- [Category board: 70s, 80s, 90s, 00s](https://voiceboard.wpengine.com/board/?g=jeopardy&st=board&cats=70s|80s|90s|00s&v=100|200|300|400|500&p=Mom:0,Dad:0,Kids:0)
- [Movie quotes, Daily Double, mid-countdown](https://voiceboard.wpengine.com/board/?g=jeopardy&st=clue&cats=Movie+Quotes|Space|Food|Sports&at=A5&q=%22I'll+be+back%22&dd=1&timer=8&p=Mom:600,Dad:400)
- [Kids win: confetti](https://voiceboard.wpengine.com/board/?g=trivia&st=end&t=Animal+Trivia&p=Mia:700,Leo:500,Mom:300&fx=confetti)
- [Hall of Fame](https://voiceboard.wpengine.com/board/?g=hall): winners of games finished in your browser
- [Assistant instructions](https://voiceboard.wpengine.com/llms.txt): what a voice assistant reads to learn the format

Opening these changes the players remembered in your browser, as a real game would.

In the car, say: "Open voiceboard.wpengine.com and host trivia."

## Install

On WordPress, download `voiceboard.zip` from the [latest release](../../releases/latest) and upload it under Plugins → Add New. The board is then live at `/board/`, the home page redirects there, and `/llms.txt` serves the assistant instructions, with nothing to configure. To move the board, change the path under Settings → Reading (leave it blank for the site root) or use the filter:

```php
add_filter( 'voiceboard_path', fn () => 'play' );
```

For static hosting, serve the repo root as it is. There's no build step.

## URL format

These work in every game:

| Param | Meaning | Example |
|---|---|---|
| `g` | App: `trivia`, `jeopardy` (or `categories`), `hall`, `home` | `trivia` |
| `st` | Screen, inferred if omitted | `ask` |
| `t` | Title or category | `Space` |
| `p` | Sets the roster, up to 6 players | `Joe:0,Sam:0` |
| `add` | Score changes against the remembered roster | `Sam:100,Joe:-200` |
| `reset` | `1` clears the remembered roster | `1` |
| `timer` | Countdown in seconds, up to 600 | `15` |
| `fx` | Effects | `confetti` |
| `theme` | `tesla` or `cyber`, remembered on the device | `cyber` |
| `lang` | Language for the board's labels, remembered on the device | `es` |

Trivia screens are `ask`, `reveal`, `score`, and `end`. It reads `q` (question), `c` (choices separated by `|`), `a` (the answer as `B`, `2`, or its text), `r` (who got it, or `none`), and `n`/`of` (progress).

The Jeopardy-style game's screens are `board`, `clue`, `reveal`, `final`, and `end`. It reads `cats` (categories separated by `|`), `v` (clue values, 200 to 1000 by default), `u` (used clues such as `A1,C3`), `at` (the chosen clue), `q` (clue), `a` (response), `r` (who got it), `dd=1` (daily double), and `w` (final wagers).

```
/board/?g=trivia&st=ask&t=Space&n=1&of=5&q=Which+planet+has+the+most+moons%3F&c=Jupiter|Saturn|Uranus|Neptune&p=Joe:0,Sam:0&timer=15
/board/?g=trivia&st=reveal&t=Space&n=1&of=5&q=Which+planet+has+the+most+moons%3F&c=Jupiter|Saturn|Uranus|Neptune&a=B&r=Sam&add=Sam:100
/board/?g=jeopardy&st=board&cats=Space|Rivers|Movies|Food|Sports|Words&u=A1,C3
/board/?g=trivia&st=end&fx=confetti
```

The board tolerates messy input. It decodes values encoded twice, turns bad scores into 0, and opens the home screen for an app it doesn't know. WordPress reserves some query names, so the only overlaps are `p` and `w`, and the plugin tells them apart because the board's values are never numeric.

## Languages

Questions, answers, and names appear in whatever language the assistant sends. The board's own labels come in English, Spanish, French, German, Portuguese, Japanese, Chinese, Arabic, and Hebrew, chosen by `lang=` or else the browser's language, and Arabic and Hebrew switch the layout to right to left. Numbers and times follow the chosen language. To add a language, add its strings to `js/locales.js`.

## Remembered state

The URL decides what's on screen. `localStorage` remembers the roster, so the host can send `add=` instead of every score, along with the last 20 finished games for the Hall of Fame and the theme and language. Reopening a URL never applies its changes twice, and the board sends none of this to the server.

## How an assistant learns the format

The instructions live in one file, `llms.txt`, and the plugin publishes them with the site's own board URL filled in. They're served at `/llms.txt` and embedded in the board's HTML for assistants that read pages without running JavaScript. Because the home page redirects to the board and keeps any parameters, "open example.com and host trivia" reaches the instructions too, and the board shows people that same sentence with its own domain. A test fails if any parameter goes undocumented.

## Structure

```
voiceboard.php        WordPress plugin: serves index.html at /board/ with a <base> to the plugin
index.html            shell (the plugin embeds llms.txt into it)
llms.txt              assistant instructions, single source of truth
board.css             light/dark and Cyber themes, sidebar, screens, effects
js/main.js            boot: URL -> app -> remembered state -> screen -> effects
js/registry.js        keyed registries for apps and effects
js/params.js          typed param parsers and readParams(search, schema)
js/store.js           localStorage roster, history, and device preferences
js/i18n.js            language choice, t() for labels, number formatting
js/locales.js         label translations
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
	title: t('name.title'),               // labels live in js/locales.js
	description: t('name.description'),   // one line for the home tile
	phrase: t('name.phrase'),             // shown as "Open <site> and host name"
	icon: ['M4 4h16v16H4z'],              // 24x24 SVG path data
	params: { x: text },                  // merged with the shared params
	screens: { ...sharedScreens, play },  // each screen: (state) => nodes
	pick: (state) => 'play',              // which screen to show
}, { alias: ['other-name'] });
```

Effects register the same way with `effects.register(name, { params, active(state), mount(board, state) })`.

## Development

```sh
npm install
npx playwright install chromium
npm test              # whole suite against static files and the plugin in WordPress Playground
npm run test:static   # static only, fastest
npm run serve         # static preview on :8766
npm run wp            # WordPress + plugin on :9400, board at /board/
npm run wp:root       # board at the site root with the site theme, on :9401
```

Every push to `main` that passes the tests deploys. Release-please reads conventional commits (`feat:`, `fix:`) and opens a release PR; merging it tags the version, updates `CHANGELOG.md` and the plugin header, and attaches `voiceboard.zip`. Issue labels follow the WordPress/presence-api scheme (`[Type]`, `[Area]`, and workflow labels).
