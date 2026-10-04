# Voiceboard modules

Everything beyond the core board is a module: each game, the effects, sessions, presence, abilities, and site hardening. Each folder here is a WordPress plugin. Voiceboard loads them automatically, and any of them can be copied to `wp-content/plugins` and run on its own (that copy then takes over from the bundled one). The modules use only the hooks and the JavaScript API listed below, so they double as working examples and as tests of those APIs.

| Module | What it shows |
|---|---|
| `voiceboard-trivia` | A game: screens, params, translated labels, llms instructions |
| `voiceboard-jeopardy` | A game with its own param parsers and aliases (`g=jeopardy`, `g=board`) |
| `voiceboard-effects` | Effects that layer onto any screen (`timer=`, `fx=confetti`) |
| `voiceboard-sessions` | Server side: vetoing and storing screen reports, adding a route, admin screens, an ability |
| `voiceboard-presence` | Reacting to reports and to a board closing |
| `voiceboard-abilities` | Abilities for MCP-capable assistants |
| `voiceboard-hardening` | A small site policy, unrelated to games |

## Writing a game

A game is a PHP file that registers the module and a JavaScript file that registers the app.

`voiceboard-hello/voiceboard-hello.php`:

```php
<?php
/**
 * Plugin Name:      Voiceboard Hello
 * Requires Plugins: voiceboard
 */
defined( 'ABSPATH' ) || exit;

add_action( 'voiceboard_register', static function () {
	voiceboard_register_module( 'hello', array(
		'scripts'      => array( plugins_url( 'hello.js', __FILE__ ) ),
		'instructions' => "## Hello (g=hello)\n\n- q: what to show",
		'order'        => 30,
	) );
} );
```

`voiceboard-hello/hello.js`:

```js
import { addStrings, apps, h, header, sharedScreens, t, text } from 'voiceboard';

addStrings({ en: { 'hello.title': 'Hello', 'hello.description': 'Shows a message.', 'hello.phrase': 'say hello' } });

apps.register('hello', {
	title: t('hello.title'),
	description: t('hello.description'),
	phrase: t('hello.phrase'),
	icon: ['M4 12h16'],
	params: { q: text },
	screens: { ...sharedScreens, show: (state) => [header(state), h('h1', 'question', state.q)] },
	pick: ({ q }) => (q ? 'show' : 'idle'),
});
```

Add the JS path to `<meta name="voiceboard-modules">` in `index.html` too if it should run on static hosting.

## JavaScript API (`import … from 'voiceboard'`)

| Export | Use |
|---|---|
| `apps.register(name, app, { alias })` | Add a game: `title`, `description`, `phrase`, `icon` (SVG paths), `params`, `screens`, `pick(state)`. Set `state.note` in `pick` to give the assistant a plain-text summary in the session transcript. |
| `effects.register(name, effect)` | Add an effect: `params`, `active(state)`, `mount(board, state)` |
| `h`, `icon`, `appLink` | Build elements, line icons, and links to other apps |
| `t`, `num`, `lang`, `dir`, `addStrings` | Translated labels and number formatting |
| `text`, `lower`, `int`, `flag`, `list`, `names`, `players`, `slug` | URL param parsers |
| `header`, `scoreStrip`, `verdict`, `answerCard`, `say`, `sharedScreens` | Shared screen parts; `sharedScreens` gives `score`, `end`, `idle`, `next` |

## PHP hooks

| Hook | Type | Use |
|---|---|---|
| `voiceboard_register` | action | Call `voiceboard_register_module()` here |
| `voiceboard_modules` | filter | Change the module list |
| `voiceboard_import_map` | filter | Add import map entries |
| `voiceboard_instructions` | filter | Change the assembled llms.txt |
| `voiceboard_screen_check` | filter | Return a `WP_Error` to reject a screen report |
| `voiceboard_screen` | action | React to a screen report (`$context`: car, code, has_code, browsing, beat, state, query, diag, browser) |
| `voiceboard_screen_response` | filter | Change the report's reply |
| `voiceboard_leave` | action | A board closed |
| `voiceboard_routes` | filter | Add routes below the board path: `array( 'regex' => callback )` |
| `voiceboard_deactivate` | action | Clean up when Voiceboard is deactivated |
| `voiceboard_load_bundled_module` | filter | Return false to skip a bundled module |
| `voiceboard_path`, `voiceboard_redirect_home` | filter | Board path and the home page redirect |

Helpers for server modules: `voiceboard_url()`, `voiceboard_instructions()`, `voiceboard_clean_code()`, `voiceboard_rate_limited()`, `voiceboard_client()`.
