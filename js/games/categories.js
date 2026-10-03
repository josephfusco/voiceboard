// A Jeopardy-style board: categories across the top, clue values down each column.
import { apps } from '../registry.js';
import { h } from '../dom.js';
import { flag, int, list, players, text } from '../params.js';
import { answerCard, header, scoreStrip, sharedScreens, verdict } from '../screens.js';

const COLUMNS = 'ABCDEF';
const VALUES = [200, 400, 600, 800, 1000];

// "B3" -> { col: 1, row: 2 }; spreadsheet-style so the host can track it easily.
const cell = (v) => {
	const match = /^([a-f])([1-9])$/i.exec(v.trim());
	return match ? { col: COLUMNS.indexOf(match[1].toUpperCase()), row: match[2] - 1 } : null;
};
const cells = (v) => v.split(/[|,\s]+/).map(cell).filter(Boolean);
const same = (a, b) => a && b && a.col === b.col && a.row === b.row;

const boardScreen = (state) => {
	const { cats, v, u, at } = state;
	const grid = h('div', 'grid',
		cats.map((cat) => h('div', 'grid-cat', cat)),
		v.map((value, row) => cats.map((_, col) => {
			const spot = { col, row };
			const used = u.some((x) => same(x, spot));
			return h('div', `card grid-cell${used ? ' is-used' : ''}${same(at, spot) ? ' is-current' : ''}`,
				!used && `$${value}`);
		})));
	grid.style.setProperty('--cols', cats.length);

	return [header(state, null), h('section', 'stage', grid), scoreStrip(state)];
};

const clueScreen = ({ reveal = false, final = false } = {}) => (state) => {
	const { cats, v, at, q, a, r, dd, w } = state;
	const label = final ? 'Final round' : at && [cats[at.col], v[at.row] && `$${v[at.row]}`].filter(Boolean).join(' · ');
	const shown = reveal || (final && a);

	return [
		header(state, label),
		h('section', 'stage clue',
			dd && !shown && h('p', 'eyebrow', 'Daily Double'),
			h('h1', 'question', q),
			shown && a && answerCard(a),
			shown && verdict(r),
			final && shown && w.length > 0 && h('p', 'muted wagers', w.map(({ name, score }) => `${name} wagered ${score}`).join(' · '))),
		scoreStrip(state),
	];
};

const screens = {
	...sharedScreens,
	board: boardScreen,
	clue: clueScreen(),
	reveal: clueScreen({ reveal: true }),
	final: clueScreen({ final: true }),
};

apps.register('categories', {
	title: 'Categories',
	description: 'Pick a category and a value. Answers in the form of a question.',
	phrase: "Let's play Jeopardy",
	icon: ['M4 4h16v16H4z', 'M4 9.3h16M4 14.7h16M9.3 4v16M14.7 4v16'],
	params: {
		cats: (v) => list(v).slice(0, COLUMNS.length),
		v: (raw) => {
			const values = list(raw).map(int).filter(Boolean);
			return (values.length ? values : VALUES).slice(0, 9);
		},
		u: cells,
		at: (v) => cell(v),
		q: text,
		a: text,
		r: text,
		dd: flag,
		w: players,
	},
	screens,
	pick: ({ st, q, a, cats, p }) => {
		if (Object.hasOwn(screens, st)) return st;
		if (q) return a ? 'reveal' : 'clue';
		return cats.length ? 'board' : p.length ? 'score' : 'idle';
	},
}, { alias: ['jeopardy', 'board'] });
