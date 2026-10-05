// Reports each screen to WordPress when the plugin serves the board: sessions, the URL log, and presence.
// Static hosting has no API meta tag, so nothing is sent.
import { carId } from './store.js';
import { lang } from './i18n.js';

const api = document.querySelector('meta[name="voiceboard-api"]')?.content;
// Every two minutes keeps a board inside Presence's 150-second window.
const HEARTBEAT = 120_000;
// If the server says slow down or fails, stop reporting for a while. The game never depends on it.
const QUIET = 'voiceboard-quiet-until';
const quiet = () => Number(sessionStorage.getItem(QUIET) || 0) > Date.now();
const backOff = () => { try { sessionStorage.setItem(QUIET, String(Date.now() + 5 * 60_000)); } catch {} };

// The answer as text for the transcript: a letter or number picks from the choices.
const answerText = ({ a = '', c = [] }) => {
	const letter = 'ABCDEF'.indexOf(a.toUpperCase());
	const index = a.length === 1 && letter >= 0 ? letter : /^\d+$/.test(a) ? a - 1 : -1;
	return c[index] ?? a;
};

export const report = (state, screen, diag) => {
	if (!api || quiet()) return;
	const car = carId();
	const body = (beat) => JSON.stringify({
		car,
		code: state.code,
		beat,
		query: location.search.slice(1),
		diag,
		state: { app: state.app.name, screen, title: state.t, n: state.n, of: state.of, q: state.q ?? '', a: answerText(state), r: state.r ?? '', up: state.up, note: state.note ?? '', players: state.p, lang },
	});
	const send = (beat) => !quiet() && fetch(`${api}ping`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body(beat), keepalive: true })
		.then((response) => (response.status === 429 || response.status >= 500) && backOff())
		.catch(backOff);

	send(false);
	const timer = setInterval(() => document.visibilityState === 'visible' && send(true), HEARTBEAT);
	addEventListener('pagehide', () => {
		clearInterval(timer);
		navigator.sendBeacon(`${api}bye`, new Blob([JSON.stringify({ car, code: state.code })], { type: 'application/json' }));
	});
};
