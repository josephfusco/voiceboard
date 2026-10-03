// Reports each screen to WordPress when the plugin serves the board: sessions, the URL log, and presence.
// Static hosting has no API meta tag, so nothing is sent.
import { carId } from './store.js';
import { lang } from './i18n.js';

const api = document.querySelector('meta[name="voiceboard-api"]')?.content;
const HEARTBEAT = 60_000;

// The answer as text for the transcript: a letter or number picks from the choices.
const answerText = ({ a = '', c = [] }) => {
	const letter = 'ABCDEF'.indexOf(a.toUpperCase());
	const index = a.length === 1 && letter >= 0 ? letter : /^\d+$/.test(a) ? a - 1 : -1;
	return c[index] ?? a;
};

export const report = (state, screen, diag) => {
	if (!api) return;
	const car = carId();
	const body = (beat) => JSON.stringify({
		car,
		code: state.code,
		beat,
		query: location.search.slice(1),
		diag,
		state: { app: state.app.name, screen, title: state.t, n: state.n, of: state.of, q: state.q ?? '', a: answerText(state), r: state.r ?? '', up: state.up, players: state.p, lang },
	});
	const send = (beat) => fetch(`${api}ping`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body(beat), keepalive: true }).catch(() => {});

	send(false);
	const timer = setInterval(() => document.visibilityState === 'visible' && send(true), HEARTBEAT);
	addEventListener('pagehide', () => {
		clearInterval(timer);
		navigator.sendBeacon(`${api}bye`, new Blob([JSON.stringify({ car, code: state.code })], { type: 'application/json' }));
	});
};
