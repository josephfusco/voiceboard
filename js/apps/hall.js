// Hall of Fame: finished games remembered on this screen.
import { apps } from '../registry.js';
import { h } from '../dom.js';
import { header } from '../screens.js';
import { lang, num, t } from '../i18n.js';

const row = ({ app, players, at }) => {
	const [winner] = [...players].sort((a, b) => b.score - a.score);
	const date = new Date(at).toLocaleDateString(lang, { month: 'short', day: 'numeric' });
	return h('li', 'card score-row',
		h('span', null, winner.name, h('span', 'muted', ` · ${apps.get(app)?.title ?? app}`)),
		h('span', 'muted', `${num(winner.score)} · ${date}`));
};

const hall = (state) => [
	header(state, null),
	h('section', 'stage',
		h('h1', 'question', state.history.length ? t('recentWinners') : t('noGames')),
		state.history.length > 0 && h('ol', 'scores', state.history.slice(0, 6).map(row))),
];

apps.register('hall', {
	title: t('hall.title'),
	icon: ['M8 4h8v5a4 4 0 0 1-8 0z', 'M8 6H5a3 3 0 0 0 3 4', 'M16 6h3a3 3 0 0 1-3 4', 'M12 13v4', 'M9 20h6'],
	system: true,
	params: {},
	screens: { hall },
	pick: () => 'hall',
});
