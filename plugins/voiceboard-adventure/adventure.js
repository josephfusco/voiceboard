// Adventure: the assistant narrates, the board keeps the facts. Characters, a scene card, and dice the board
// rolls itself (seeded by the session code and roll number, so a reload never re-rolls). A Voiceboard module.
import { addStrings, apps, h, header, int, list, sharedScreens, t, text } from 'voiceboard';

document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet', href: new URL(`./adventure.css${new URL(import.meta.url).search}`, import.meta.url).href }));

const L = (title, description, phrase, rolls, success, fail, exits, seen) =>
	({ 'adventure.title': title, 'adventure.description': description, 'adventure.phrase': phrase, 'adventure.rolls': rolls, 'adventure.success': success, 'adventure.fail': fail, 'adventure.exits': exits, 'adventure.seen': seen });
addStrings({
	en: L('Adventure', 'A story game with the car as narrator: characters, dice, and a journey.', 'run an adventure', '{name} rolls {dice}', 'Success!', 'Failed', 'Exits', 'You see'),
	es: L('Aventura', 'Un juego de historia con el coche como narrador: personajes, dados y un viaje.', 'dirige una aventura', '{name} tira {dice}', '¡Éxito!', 'Fallo', 'Salidas', 'Ves'),
	fr: L('Aventure', 'Un jeu d’histoire avec la voiture comme narratrice : personnages, dés et un voyage.', 'mène une aventure', '{name} lance {dice}', 'Réussite !', 'Échec', 'Sorties', 'Vous voyez'),
	de: L('Abenteuer', 'Ein Erzählspiel mit dem Auto als Erzähler: Figuren, Würfel und eine Reise.', 'leite ein Abenteuer', '{name} würfelt {dice}', 'Erfolg!', 'Fehlschlag', 'Ausgänge', 'Du siehst'),
	pt: L('Aventura', 'Um jogo de história com o carro como narrador: personagens, dados e uma jornada.', 'conduza uma aventura', '{name} rola {dice}', 'Sucesso!', 'Falhou', 'Saídas', 'Você vê'),
	ja: L('アドベンチャー', '車が語り手になる物語ゲーム。キャラクター、ダイス、そして旅。', 'アドベンチャーを進行して', '{name}が{dice}を振る', '成功！', '失敗', '出口', '見えるもの'),
	zh: L('冒险', '由汽车担任叙述者的故事游戏：角色、骰子和一段旅程。', '主持一场冒险', '{name}掷{dice}', '成功！', '失败', '出口', '你看到'),
	ar: L('مغامرة', 'لعبة قصصية تكون فيها السيارة هي الراوي: شخصيات ونرد ورحلة.', 'أدر مغامرة', '{name} يرمي {dice}', 'نجاح!', 'فشل', 'المخارج', 'ترى'),
	he: L('הרפתקה', 'משחק סיפור שבו הרכב הוא המספר: דמויות, קוביות ומסע.', 'להנחות הרפתקה', '{name} מטיל {dice}', 'הצלחה!', 'כישלון', 'יציאות', 'אתם רואים'),
});

// Each class sets starting health and the bonus it adds to rolls of each stat.
export const CLASSES = {
	fighter: { icon: '⚔️', hp: 12, str: 3, dex: 1, int: 0 },
	rogue: { icon: '🗡️', hp: 10, str: 1, dex: 3, int: 1 },
	wizard: { icon: '🔮', hp: 8, str: 0, dex: 1, int: 3 },
	cleric: { icon: '✨', hp: 10, str: 1, dex: 0, int: 2 },
	ranger: { icon: '🏹', hp: 10, str: 1, dex: 2, int: 1 },
};

// ch=Joe:fighter:12/12,Sam:rogue:7/10 -> characters. Health is current/max; it defaults to the class's full health.
const characters = (v) => v.split(',').map((entry) => {
	const [name = '', cls = 'fighter', health = ''] = entry.split(':').map((s) => s.trim());
	const role = CLASSES[cls.toLowerCase()] ? cls.toLowerCase() : 'fighter';
	const [hp, max] = health.split('/').map((n) => parseInt(n, 10));
	const full = max || CLASSES[role].hp;
	return { name, role, hp: Number.isNaN(hp) ? full : Math.max(0, Math.min(hp, full)), max: full };
}).filter((c) => c.name).slice(0, 6);

// inv=Joe:sword|torch;Sam:lockpicks -> { joe: ['sword', 'torch'], sam: ['lockpicks'] }
const inventory = (v) => Object.fromEntries(v.split(';').map((entry) => {
	const [name, items = ''] = entry.split(':');
	return [name.trim().toLowerCase(), list(items)];
}).filter(([name]) => name));

// roll=d20+3, 2d6, d20-1. Up to ten dice of up to 100 sides.
const dice = (v) => {
	const m = v.replace(/\s/g, '').toLowerCase().match(/^(\d{0,2})d(\d{1,3})([+-]\d{1,2})?$/);
	if (!m) return null;
	return { count: Math.min(Number(m[1] || 1), 10), sides: Math.min(Number(m[2]), 100), bonus: Number(m[3] || 0), label: v.replace(/\s/g, '') };
};

// The same session code, roll number, and dice always give the same result.
const seeded = (seed) => {
	let x = [...seed].reduce((a, c) => Math.imul(a ^ c.charCodeAt(0), 2654435761) >>> 0, 2166136261);
	return () => {
		x = Math.imul(x ^ (x >>> 15), 2246822507) >>> 0;
		x = Math.imul(x ^ (x >>> 13), 3266489909) >>> 0;
		return ((x ^= x >>> 16) >>> 0) / 4294967296;
	};
};

const rollDice = (spec, seed) => {
	const next = seed ? seeded(seed) : Math.random;
	const faces = Array.from({ length: spec.count }, () => 1 + Math.floor(next() * spec.sides));
	return { faces, total: faces.reduce((a, b) => a + b, 0) + spec.bonus };
};

const sheet = (c, items, active) => h('div', `card adv-character${active ? ' is-up' : ''}`,
	h('div', 'adv-name', h('span', 'adv-class', CLASSES[c.role].icon), c.name, h('span', 'muted adv-role', c.role)),
	h('div', 'adv-hp', h('span', 'adv-hp-bar', h('span', 'adv-hp-fill')), `${c.hp}/${c.max}`),
	items?.length > 0 && h('div', 'adv-items', items.map((item) => h('span', 'adv-item', item))));

const party = (state) => h('footer', 'adv-party', state.ch.map((c) => {
	const card = sheet(c, state.inv[c.name.toLowerCase()], c.name.toLowerCase() === (state.for || state.up).toLowerCase());
	card.style.setProperty('--hp', `${Math.round((c.hp / c.max) * 100)}%`);
	return card;
}));

const scene = (state) => [
	header(state, null),
	h('section', 'stage adv-scene',
		h('h1', 'question', state.loc || state.t),
		state.see.length > 0 && h('p', 'adv-line', h('span', 'muted', `${t('adventure.seen')}: `), state.see.join(' · ')),
		state.ex.length > 0 && h('div', 'adv-exits', h('span', 'muted', t('adventure.exits')), state.ex.map((exit) => h('span', 'chip', exit)))),
	party(state),
];

const roll = (state) => {
	const { spec, result } = state.rolled;
	const pass = state.vs ? result.total >= state.vs : null;
	return [
		header(state, state.loc || null),
		h('section', 'stage adv-roll',
			h('p', 'eyebrow', t('adventure.rolls', { name: state.for || '…', dice: spec.label })),
			h('div', 'adv-dice', result.faces.map((face) => h('span', 'adv-die', face))),
			h('p', 'adv-total', String(result.total), state.vs > 0 && h('span', 'muted', ` / ${state.vs}`)),
			pass !== null && h('p', `adv-verdict ${pass ? 'is-pass' : 'is-fail'}`, t(pass ? 'adventure.success' : 'adventure.fail'))),
		party(state),
	];
};

const screens = { ...sharedScreens, scene, roll };

apps.register('adventure', {
	title: t('adventure.title'),
	description: t('adventure.description'),
	phrase: t('adventure.phrase'),
	icon: ['M12 3 20 7.5v9L12 21l-8-4.5v-9z', 'M12 3v18', 'M4 7.5l8 4.5 8-4.5'],
	params: { ch: characters, inv: inventory, loc: text, see: list, ex: list, roll: dice, for: text, vs: int, rn: int },
	screens,
	pick: (state) => {
		if (state.roll) {
			const seed = state.code ? `${state.code}:${state.rn}:${state.roll.label}:${state.for}` : '';
			state.rolled = { spec: state.roll, result: rollDice(state.roll, seed) };
		}
		const r = state.rolled;
		// Plain text for the transcript: who's in the party, where they are, and the last roll.
		state.note = [
			`Adventure. Party: ${state.ch.map((c) => `${c.name} (${c.role}, ${c.hp}/${c.max} HP${state.inv[c.name.toLowerCase()]?.length ? `, carrying ${state.inv[c.name.toLowerCase()].join(', ')}` : ''})`).join('; ') || 'none yet'}.`,
			state.loc && `Location: ${state.loc}.`,
			r && `${state.for || 'Someone'} rolled ${r.spec.label}: ${r.result.faces.join('+')}${r.spec.bonus ? (r.spec.bonus > 0 ? `+${r.spec.bonus}` : r.spec.bonus) : ''} = ${r.result.total}${state.vs ? ` against ${state.vs}, ${r.result.total >= state.vs ? 'success' : 'failure'}` : ''}.`,
		].filter(Boolean).join(' ');
		if (Object.hasOwn(screens, state.st)) return state.st;
		return state.roll ? 'roll' : 'scene';
	},
});
