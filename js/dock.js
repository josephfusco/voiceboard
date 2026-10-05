// Sidebar: system controls only (clock, Hall of Fame, New game, theme, Home). Games launch from Home, so
// the sidebar never lists other games while you're playing one.
import { apps } from './registry.js';
import { appLink, h, icon } from './dom.js';
import { THEMES, clearRoster, saveTheme } from './store.js';
import { lang, t } from './i18n.js';

const clock = () => {
	const node = h('time', 'dock-clock');
	const tick = () => {
		node.textContent = new Date().toLocaleTimeString(lang, { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M$/i, '');
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
		button.setAttribute('aria-label', t('switchTheme', { theme: next[0].toUpperCase() + next.slice(1) }));
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

// Clears this device's players and scores after a confirmation, since it can't be undone.
const newGameButton = () => {
	const dialog = h('dialog', 'confirm',
		h('h2', null, t('clearTitle')),
		h('p', 'muted', t('clearBody')),
		h('form', 'confirm-actions',
			h('button', 'button', t('cancel')),
			h('button', 'button is-danger', t('clear'))));
	const [cancel, clear] = dialog.querySelectorAll('button');
	cancel.value = 'cancel';
	clear.value = 'clear';
	dialog.querySelector('form').method = 'dialog';
	dialog.addEventListener('close', () => {
		if (dialog.returnValue === 'clear') {
			clearRoster();
			location.reload();
		}
	});
	document.body.append(dialog);

	const button = h('button', 'dock-item', icon(['M3 12a9 9 0 1 0 3-6.7', 'M3 4v5h5']));
	button.type = 'button';
	button.setAttribute('aria-label', t('newGame'));
	button.addEventListener('click', () => {
		dialog.returnValue = '';
		dialog.showModal();
		cancel.focus();
	});
	return button;
};

export const dock = (current, theme) => {
	const item = (app) => {
		const link = appLink(app.name, `dock-item${app === current ? ' is-active' : ''}`, icon(app.icon));
		link.setAttribute('aria-label', app.title);
		return link;
	};
	const system = apps.list().filter((a) => a.system);

	return [
		clock(),
		h('div', 'dock-apps', system.filter((a) => a.dock !== 'bottom').map(item), newGameButton(), themeToggle(theme)),
		system.filter((a) => a.dock === 'bottom').map(item),
	];
};
