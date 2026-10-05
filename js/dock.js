// Sidebar: system controls only (clock, Hall of Fame, the ⋮ menu, Home). Games launch from Home, so
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

// Clears this device's players and scores after a confirmation, since it can't be undone.
const newGameDialog = () => {
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
	return () => {
		dialog.returnValue = '';
		dialog.showModal();
		cancel.focus();
	};
};

// The ⋮ menu: theme and New game, kept out of the way of the game. Built on the popover attribute.
const moreMenu = (theme) => {
	const openNewGame = newGameDialog();
	const menu = h('div', 'card dock-menu');
	Object.assign(menu, { id: 'dock-menu', popover: 'auto' });
	menu.setAttribute('role', 'menu');

	const themes = THEMES.map((name) => {
		const option = h('button', 'dock-menu-item', name[0].toUpperCase() + name.slice(1));
		Object.assign(option, { type: 'button' });
		option.setAttribute('role', 'menuitemradio');
		option.setAttribute('aria-checked', String(name === theme));
		option.addEventListener('click', () => {
			document.documentElement.dataset.theme = name;
			saveTheme(name);
			themes.forEach((other) => other.setAttribute('aria-checked', String(other === option)));
			menu.hidePopover();
		});
		return option;
	});
	const newGame = h('button', 'dock-menu-item is-danger', t('newGame'));
	Object.assign(newGame, { type: 'button' });
	newGame.setAttribute('role', 'menuitem');
	newGame.addEventListener('click', () => {
		menu.hidePopover();
		openNewGame();
	});
	menu.append(h('p', 'muted dock-menu-label', t('themeLabel')), ...themes, h('hr'), newGame);

	const button = h('button', 'dock-item dock-more', icon(['M12 4.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z', 'M12 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z', 'M12 16.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z']));
	Object.assign(button, { type: 'button', popoverTargetElement: menu });
	button.setAttribute('aria-label', t('more'));
	button.setAttribute('aria-haspopup', 'menu');
	// Open beside the button.
	menu.addEventListener('toggle', (event) => {
		if (event.newState !== 'open') return;
		const box = button.getBoundingClientRect();
		menu.style.insetInlineStart = `${box.right + 12}px`;
		menu.style.top = `${Math.min(box.top, innerHeight - menu.offsetHeight - 12)}px`;
	});
	document.body.append(menu);
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
		h('div', 'dock-apps', system.filter((a) => a.dock !== 'bottom').map(item), moreMenu(theme)),
		system.filter((a) => a.dock === 'bottom').map(item),
	];
};
