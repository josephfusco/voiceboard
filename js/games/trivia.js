import { apps } from '../registry.js';
import { h } from '../dom.js';
import { list, text } from '../params.js';
import { t } from '../i18n.js';
import { answerCard, header, scoreStrip, sharedScreens, verdict } from '../screens.js';

const LETTERS = 'ABCDEF';

// Accepts "2", "B", or the choice text itself; -1 if it can't be resolved.
const answerIndex = (a, choices) => {
	if (/^[a-f]$/i.test(a)) return LETTERS.indexOf(a.toUpperCase());
	if (/^\d+$/.test(a)) return a - 1;
	return choices.findIndex((c) => c.toLowerCase() === a.toLowerCase());
};

const questionScreen = (reveal) => (state) => {
	const { q, c, a, r } = state;
	const index = reveal && a ? answerIndex(a, c) : -1;
	const correct = index < c.length ? index : -1;
	const mark = (i) => (correct < 0 ? '' : i === correct ? ' is-correct' : ' is-dim');

	return [
		header(state),
		h('section', 'stage',
			h('h1', 'question', q),
			c.length > 0 && h('ol', `choices count-${c.length}`, c.map((choice, i) =>
				h('li', `card choice${mark(i)}`, h('span', 'muted', LETTERS[i]), choice))),
			// Open-ended, or an answer that matches no choice: show the answer itself.
			reveal && a && correct < 0 && answerCard(a),
			reveal && verdict(r)),
		scoreStrip(state),
	];
};

const screens = { ...sharedScreens, ask: questionScreen(false), reveal: questionScreen(true) };

apps.register('trivia', {
	title: t('trivia.title'),
	description: t('trivia.description'),
	phrase: t('trivia.phrase'),
	icon: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M9.5 9.2a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.4v.6', 'M12 16.8v.2'],
	params: { q: text, c: (v) => list(v).slice(0, LETTERS.length), a: text, r: text },
	screens,
	// Use st when it names a screen; otherwise infer one from what's in the URL.
	pick: ({ st, q, a, p }) => {
		if (!q && st !== 'end') return p.length ? 'score' : 'idle';
		return Object.hasOwn(screens, st) ? st : a ? 'reveal' : 'ask';
	},
});
