import { games } from '../registry.js';
import { h } from '../dom.js';
import { list, text } from '../params.js';
import { header, scoreStrip, sharedScreens } from '../screens.js';

const LETTERS = 'ABCDEF';

// Accepts "2", "B", or the choice text itself; -1 if it can't be resolved.
const answerIndex = (a, choices) => {
	if (/^[a-f]$/i.test(a)) return LETTERS.indexOf(a.toUpperCase());
	if (/^\d+$/.test(a)) return a - 1;
	return choices.findIndex((c) => c.toLowerCase() === a.toLowerCase());
};

const questionScreen = (reveal) => (state) => {
	const { q, c, a, r } = state;
	const correct = reveal && a ? answerIndex(a, c) : -1;
	const mark = (i) => (correct < 0 ? '' : i === correct ? ' is-correct' : ' is-dim');
	const verdict = r && (r.toLowerCase() === 'none' ? 'Nobody got it' : `${r} got it!`);

	return [
		header(state),
		h('section', 'stage',
			h('h1', 'question', q),
			c.length > 0 && h('ol', `choices count-${c.length}`, c.map((choice, i) =>
				h('li', `card choice${mark(i)}`, h('span', 'muted', LETTERS[i]), choice))),
			// Open-ended question: show the answer itself.
			reveal && !c.length && a && h('div', 'card choice is-correct', a),
			reveal && verdict && h('div', 'verdict', verdict)),
		scoreStrip(state),
	];
};

const screens = { ...sharedScreens, ask: questionScreen(false), reveal: questionScreen(true) };

games.register('trivia', {
	title: 'Trivia',
	params: { q: text, c: (v) => list(v).slice(0, LETTERS.length), a: text, r: text },
	screens,
	// Use st when it names a screen; otherwise infer one from what's in the URL.
	pick: ({ st, q, a, p }) => {
		if (!q && st !== 'end') return p.length ? 'score' : 'idle';
		return Object.hasOwn(screens, st) ? st : a ? 'reveal' : 'ask';
	},
});
