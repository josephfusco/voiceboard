// Building blocks and screens any game can reuse.
import { h } from './dom.js';
import { num, t } from './i18n.js';
import qrcode from './vendor/qrcode.js';

const progress = ({ n, of }) => n > 0 && (of > 0 ? t('questionOf', { n: num(n), of: num(of) }) : t('question', { n: num(n) }));

export const header = (state, label = progress(state)) => h('header', 'bar',
	h('span', 'bar-title', state.t),
	label && h('span', null, label));

// up=Name highlights whose turn it is.
export const scoreStrip = ({ p, up = '' }) => p.length > 0 && h('footer', 'strip',
	p.map(({ name, score }) => h('span', `chip${name.toLowerCase() === up.toLowerCase() ? ' is-up' : ''}`, h('span', 'muted', name), num(score))));

// What to tell the assistant to start an app, using this site's own address.
export const say = (app) => t('open', { host: location.host, phrase: app.phrase });

// r=Sam -> "Sam got it!", r=none -> "Nobody got it".
export const verdict = (r) => r && h('div', 'verdict', r.toLowerCase() === 'none' ? t('nobody') : t('gotIt', { name: r }));

export const answerCard = (answer) => h('div', 'card choice is-correct', answer);

// A quiet sign-off on the final screen only; opens in a new tab so the game stays on screen.
const credit = () => {
	const link = h('a', 'credit', t('madeBy', { name: 'Joe Fusco' }));
	Object.assign(link, { href: 'https://josephfus.co', target: '_blank', rel: 'noopener' });
	return link;
};

// On the final screen of a recorded game (a session code, served by WordPress), a QR code opens the recap on a phone.
const recap = ({ code }) => {
	if (!code || !document.querySelector('meta[name="voiceboard-api"]')) return null;
	const qr = qrcode(0, 'M');
	qr.addData(`${location.origin}${location.pathname.replace(/\/?$/, '/')}journey/${code}`);
	qr.make();
	const image = h('img', 'recap-qr');
	Object.assign(image, { src: qr.createDataURL(5, 2), alt: t('recapScan') });
	return h('figure', 'recap', image, h('figcaption', 'muted', t('recapScan')));
};

const scoreboard = (final) => (state) => {
	const sorted = [...state.p].sort((a, b) => b.score - a.score);
	const top = sorted[0]?.score;
	const leaders = sorted.filter((p) => p.score === top);
	let heading = t('scoreboard');
	if (final) heading = !leaders.length ? t('gameOver') : leaders.length > 1 ? t('tie') : t('wins', { name: leaders[0].name });

	return [
		header(state, null),
		h('section', 'stage',
			h('h1', 'question', heading),
			h('ol', `scores count-${sorted.length}`, sorted.map(({ name, score }) =>
				h('li', `card score-row${final && score === top ? ' is-leader' : ''}`,
					h('span', null, name), h('span', 'score-value', num(score)))))),
		final && recap(state),
		final && credit(),
	];
};

const idle = ({ t: title, app }) => [
	h('section', 'stage', h('h1', 'question', title), h('p', 'muted', app.phrase ? t('say', { phrase: say(app) }) : t('askAssistant'))),
];

// st=next&up=Joe: whose turn it is. When they say "ready", the host opens the question with a timer,
// so the question and the countdown appear together.
const next = (state) => [
	header(state),
	h('section', 'stage next', h('p', 'eyebrow', t('nextUp')), h('h1', 'question', state.up || '…'), h('p', 'muted', t('sayReady'))),
	scoreStrip(state),
];

export const sharedScreens = { score: scoreboard(false), end: scoreboard(true), idle, next };
