// Remembers players and finished games in localStorage, so the host can send only what changed.
// The URL still wins: p= replaces the roster, add= adjusts it, reset=1 clears it.
import { MAX_PLAYERS } from './params.js';

const KEY = 'voiceboard';
const HISTORY = 20;
export const THEMES = ['tesla', 'cyber'];

const load = () => {
	try {
		return JSON.parse(localStorage.getItem(KEY)) ?? {};
	} catch {
		return {};
	}
};

const save = (data) => {
	try {
		localStorage.setItem(KEY, JSON.stringify(data));
	} catch {
		// Storage can be unavailable (private mode, quota); the URL alone still works.
	}
};

const apply = (roster, changes) => changes.reduce((list, { name, score }) => {
	const found = list.find((p) => p.name.toLowerCase() === name.toLowerCase());
	return found
		? list.map((p) => (p === found ? { ...p, score: p.score + score } : p))
		: [...list, { name, score }];
}, roster);

export const sync = (state, { app, search }) => {
	const data = { players: [], history: [], ...load() };

	// Reopening the same URL must not apply its changes twice.
	if (data.last !== search) {
		if (state.reset) data.players = [];
		if (state.p.length) data.players = state.p;
		data.players = apply(data.players, state.add).slice(0, MAX_PLAYERS);
		if (state.st === 'end' && data.players.length) {
			data.history = [{ app, players: data.players, at: Date.now() }, ...data.history].slice(0, HISTORY);
		}
		data.last = search;
		save(data);
	}

	// Theme is a device preference: a theme= URL sets it, otherwise the last choice sticks.
	if (THEMES.includes(state.theme) && state.theme !== data.theme) save({ ...data, theme: state.theme });

	return { ...state, p: data.players, history: data.history, theme: THEMES.includes(state.theme) ? state.theme : data.theme ?? THEMES[0] };
};

// Touch-only setting; never part of game state.
export const saveTheme = (theme) => save({ ...load(), theme });
