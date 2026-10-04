# Contributing

## Layout

```
voiceboard.php           core plugin: board, routes, settings, module loading
includes/modules.php     module registry, import map, bundled module loader
includes/screens.php     screen reports: /voiceboard/v1/ping and bye, validation, rate limits, hooks
includes/hardening.php   security headers on Voiceboard's responses
index.html               board shell (the plugin fills in modules and embeds llms.txt)
llms.txt                 core assistant instructions; each module adds its own section
board.css                light/dark and Cyber themes, sidebar, screens, effects
manifest.webmanifest     web app manifest (name, colors, fullscreen); icon.svg is its icon
js/voiceboard.js         the public API modules import as 'voiceboard'
js/main.js               boot: URL -> modules -> app -> remembered state -> screen -> effects -> report
js/registry.js           keyed registries for apps and effects
js/params.js             typed param parsers and readParams(search, schema)
js/dom.js                h() element builder, icons, app links
js/screens.js            shared header, score strip, scoreboard, idle and next screens
js/store.js              localStorage roster, history, device preferences, car ID
js/i18n.js               language choice, t() for labels, addStrings() for modules
js/locales.js            core label translations
js/dock.js               sidebar
js/report.js             reports each screen to the plugin
js/apps/                 built-in Home and Hall of Fame
plugins/                 modules: each folder is a plugin (see plugins/README.md)
```

## Running it

```sh
npm install
npx playwright install chromium
npm test              # whole suite against static files and the plugin in WordPress Playground
npm run test:static   # static only, fastest
npm run serve         # static preview on :8766
npm run wp            # WordPress + plugin on :9400, board at /board/
npm run wp:root       # board at the site root with the site theme, on :9401
```

## Examples and screenshots

The README gallery comes from `docs/examples.json`. After changing it, run `npm run screenshots`. `npm run demo-video` re-records the chess GIF from `tests/scripts/chess-game.js`.

## Releases

Pushes to `main` that pass the tests deploy. Use conventional commits (`feat:`, `fix:`); release-please turns them into a release PR.
