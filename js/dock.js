// CarPlay-style sidebar: clock on top, apps in the middle, home at the bottom.
import { apps } from './registry.js';
import { appLink, h, icon } from './dom.js';
import { THEMES, saveTheme } from './store.js';

const clock = () => {
	const node = h('time', 'dock-clock');
	const tick = () => {
		node.textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M$/i, '');
	};
	tick();
	setInterval(tick, 10_000);
	return node;
};

// Each theme previews itself: angular for Cyber, rounded for Tesla.
const THEME_ICONS = {
	tesla: ['M8 4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4z'],
	cyber: ['M8 3h13v13l-5 5H3V8z', 'M8 3v5H3'],
};
const nextTheme = (theme) => THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];

// Switches the device theme in place; the game on screen is untouched. Shows the theme you'd switch to.
const themeToggle = (theme) => {
	const button = h('button', 'dock-item dock-theme');
	button.type = 'button';
	const show = (current) => {
		const next = nextTheme(current);
		button.replaceChildren(icon(THEME_ICONS[next]));
		button.setAttribute('aria-label', `Switch to ${next[0].toUpperCase()}${next.slice(1)} theme`);
	};
	button.addEventListener('click', () => {
		const next = nextTheme(document.documentElement.dataset.theme);
		document.documentElement.dataset.theme = next;
		saveTheme(next);
		show(next);
	});
	show(theme);
	return button;
};

export const dock = (current, theme) => {
	const item = (app) => {
		const link = appLink(app.name, `dock-item${app === current ? ' is-active' : ''}`, icon(app.icon));
		link.setAttribute('aria-label', app.title);
		return link;
	};
	const all = apps.list();

	return [
		clock(),
		h('div', 'dock-apps', all.filter((a) => a.dock !== 'bottom').map(item)),
		themeToggle(theme),
		all.filter((a) => a.dock === 'bottom').map(item),
	];
};
