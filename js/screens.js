// Building blocks and screens any game can reuse.
import { h } from './dom.js';

export const header = ({ t, n, of }) => h('header', 'bar',
	h('span', 'bar-title', t),
	n > 0 && h('span', null, `Question ${n}${of > 0 ? ` of ${of}` : ''}`));

export const scoreStrip = ({ p }) => p.length > 0 && h('footer', 'strip',
	p.map(({ name, score }) => h('span', 'chip', h('span', 'muted', name), score)));

const scoreboard = (final) => (state) => {
	const sorted = [...state.p].sort((a, b) => b.score - a.score);
	const top = sorted[0]?.score;
	const leaders = sorted.filter((p) => p.score === top);
	let heading = 'Scoreboard';
	if (final) heading = !leaders.length ? 'Game over' : leaders.length > 1 ? "It's a tie!" : `${leaders[0].name} wins!`;

	return [
		header(state),
		h('section', 'stage',
			h('h1', 'question', heading),
			h('ol', `scores count-${sorted.length}`, sorted.map(({ name, score }) =>
				h('li', `card score-row${final && score === top ? ' is-leader' : ''}`,
					h('span', null, name), h('span', 'score-value', score))))),
	];
};

const idle = ({ t }) => [
	h('section', 'stage', h('h1', 'question', t), h('p', 'muted', 'Ask Grok to start a game')),
];

export const sharedScreens = { score: scoreboard(false), end: scoreboard(true), idle };
