// CarPlay-style sidebar: clock on top, apps in the middle, home at the bottom.
import { apps } from './registry.js';
import { appLink, h, icon } from './dom.js';

const clock = () => {
	const node = h('time', 'dock-clock');
	const tick = () => {
		node.textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M$/i, '');
	};
	tick();
	setInterval(tick, 10_000);
	return node;
};

export const dock = (current) => {
	const item = (app) => {
		const link = appLink(app.name, `dock-item${app === current ? ' is-active' : ''}`, icon(app.icon));
		link.setAttribute('aria-label', app.title);
		return link;
	};
	const all = apps.list();

	return [
		clock(),
		h('div', 'dock-apps', all.filter((a) => a.dock !== 'bottom').map(item)),
		all.filter((a) => a.dock === 'bottom').map(item),
	];
};
