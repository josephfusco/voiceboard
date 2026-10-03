// Launcher: every registered game as a tile, with the phrase that starts it.
import { apps } from '../registry.js';
import { appLink, h, icon } from '../dom.js';
import { say } from '../screens.js';

const greeting = () => {
	const hour = new Date().getHours();
	return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
};

const tile = (app) => appLink(app.name, 'card tile',
	icon(app.icon),
	h('strong', null, app.title),
	h('span', 'muted', app.description),
	h('span', 'tile-say', `“${say(app)}”`));

const home = () => [
	h('header', 'bar', h('span', 'bar-title', greeting())),
	h('section', 'stage',
		h('h1', 'question', 'What should we play?'),
		h('div', 'launcher', apps.list().filter((a) => !a.system).map(tile))),
];

apps.register('home', {
	title: 'Home',
	icon: ['M4 4h6v6H4z', 'M14 4h6v6h-6z', 'M4 14h6v6H4z', 'M14 14h6v6h-6z'],
	system: true,
	dock: 'bottom',
	params: {},
	screens: { home },
	pick: () => 'home',
});
