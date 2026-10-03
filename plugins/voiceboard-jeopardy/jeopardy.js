// A Jeopardy-style board: categories across the top, clue values down each column. A Voiceboard module.
import { addStrings, answerCard, apps, flag, h, header, int, list, num, players, scoreStrip, sharedScreens, t, text, verdict } from 'voiceboard';

addStrings({
	en: { "categories.title": "Categories", "categories.description": "Pick a category and a value. Answers in the form of a question.", "categories.phrase": "host Jeopardy", "dailyDouble": "Daily Double", "finalRound": "Final round", "wagered": "{name} wagered {n}", "value": "${n}" },
	es: { "categories.title": "Categorías", "categories.description": "Elige una categoría y un valor. Responde en forma de pregunta.", "categories.phrase": "presenta Jeopardy", "dailyDouble": "Doble diario", "finalRound": "Ronda final", "wagered": "{name} apostó {n}", "value": "{n}" },
	fr: { "categories.title": "Catégories", "categories.description": "Choisissez une catégorie et une valeur. Répondez sous forme de question.", "categories.phrase": "anime un Jeopardy", "dailyDouble": "Double mise", "finalRound": "Manche finale", "wagered": "{name} a misé {n}", "value": "{n}" },
	de: { "categories.title": "Kategorien", "categories.description": "Wähle eine Kategorie und einen Wert. Antworte in Frageform.", "categories.phrase": "moderiere Jeopardy", "dailyDouble": "Doppelter Einsatz", "finalRound": "Finalrunde", "wagered": "{name} setzt {n}", "value": "{n}" },
	pt: { "categories.title": "Categorias", "categories.description": "Escolha uma categoria e um valor. Responda em forma de pergunta.", "categories.phrase": "apresente Jeopardy", "dailyDouble": "Aposta dupla", "finalRound": "Rodada final", "wagered": "{name} apostou {n}", "value": "{n}" },
	ja: { "categories.title": "カテゴリー", "categories.description": "カテゴリーと点数を選び、質問の形で答えます。", "categories.phrase": "ジェパディを進行して", "dailyDouble": "デイリーダブル", "finalRound": "ファイナルラウンド", "wagered": "{name}さんの賭け金 {n}", "value": "{n}" },
	zh: { "categories.title": "分类", "categories.description": "选择一个分类和分值，以问题形式作答。", "categories.phrase": "主持 Jeopardy", "dailyDouble": "每日双倍", "finalRound": "决赛轮", "wagered": "{name}下注 {n}", "value": "{n}" },
	ar: { "categories.title": "الفئات", "categories.description": "اختر فئة وقيمة، وأجب بصيغة سؤال.", "categories.phrase": "قدّم Jeopardy", "dailyDouble": "الرهان المضاعف", "finalRound": "الجولة النهائية", "wagered": "راهن {name} بـ {n}", "value": "{n}" },
	he: { "categories.title": "קטגוריות", "categories.description": "בוחרים קטגוריה וערך ועונים בצורת שאלה.", "categories.phrase": "להנחות ג׳פרדי", "dailyDouble": "הימור כפול", "finalRound": "סבב אחרון", "wagered": "ההימור של {name}: {n}", "value": "{n}" },
});

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
				!used && t('value', { n: num(value) }));
		})));
	grid.style.setProperty('--cols', cats.length);

	return [header(state, null), h('section', 'stage', grid), scoreStrip(state)];
};

const clueScreen = ({ reveal = false, final = false } = {}) => (state) => {
	const { cats, v, at, q, a, r, dd, w } = state;
	const label = final ? t('finalRound') : at && [cats[at.col], v[at.row] && t('value', { n: num(v[at.row]) })].filter(Boolean).join(' · ');
	const shown = reveal || (final && a);

	return [
		header(state, label),
		h('section', 'stage clue',
			dd && !shown && h('p', 'eyebrow', t('dailyDouble')),
			h('h1', 'question', q),
			shown && a && answerCard(a),
			shown && verdict(r),
			final && shown && w.length > 0 && h('p', 'muted wagers', w.map(({ name, score }) => t('wagered', { name, n: num(score) })).join(' · '))),
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
	title: t('categories.title'),
	description: t('categories.description'),
	phrase: t('categories.phrase'),
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
