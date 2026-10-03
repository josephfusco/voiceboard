// Boot: read the URL, look up the game in the registry, render the screen it picks.
import { games } from './registry.js';
import { common, readParams } from './params.js';
import './games/trivia.js';

const DEFAULT_GAME = 'trivia';

const { g } = readParams(location.search, { g: common.g });
const name = games.has(g) ? g : DEFAULT_GAME;
const game = games.get(name);

const state = readParams(location.search, { ...common, ...game.params });
state.t ||= game.title;
const screen = game.pick(state);

const board = document.getElementById('board');
board.className = `board game-${name} state-${screen}`;
board.replaceChildren(...game.screens[screen](state).filter(Boolean));
document.title = state.q || state.t;
