// Boot: read the URL, resolve the app, merge in remembered state, render, then layer effects.
import { apps, effects } from './registry.js';
import { common, readParams } from './params.js';
import { sync } from './store.js';
import { dock } from './dock.js';
import { dir, lang, t } from './i18n.js';
import { report } from './report.js';

// Registration order is sidebar order.
import './games/trivia.js';
import './games/categories.js';
import './apps/hall.js';
import './apps/home.js';
import './effects/confetti.js';
import './effects/timer.js';

const search = location.search;
const { g } = readParams(search, { g: common.g });

// No params or an unknown app opens home; params without g are a trivia game.
const app = apps.get(g) ?? apps.get(!g && search.length > 1 ? 'trivia' : 'home');

const schema = Object.assign({}, common, app.params, ...effects.list().map((e) => e.params));
const state = sync(readParams(search, schema), { app: app.name, search });
state.t ||= app.title;
state.app = app;
const screen = app.pick(state);

Object.assign(document.documentElement, { lang, dir });
document.documentElement.dataset.theme = state.theme;
document.getElementById('dock').setAttribute('aria-label', t('apps'));
document.getElementById('dock').replaceChildren(...dock(app, state.theme).flat());

const board = document.getElementById('board');
board.className = `board app-${app.name} state-${screen}`;
board.replaceChildren(...app.screens[screen](state).filter(Boolean));
effects.list().filter((e) => e.active(state)).forEach((e) => e.mount(board, state));

document.title = state.q || state.t;

// What the board had to fix or ignore in this URL, for the URL log.
const diag = [
	...[...new URLSearchParams(search).keys()].filter((key) => !Object.hasOwn(schema, key)).map((key) => `unknown param: ${key}`),
	g && !apps.has(g) && `unknown app: ${g}`,
	state.st && state.st !== screen && `asked for ${state.st}, showed ${screen}`,
	/%25[\da-f]{2}/i.test(search) && 'double-encoded',
	search.length > 2000 && `long URL: ${search.length} characters`,
].filter(Boolean);
report(state, screen, diag);
