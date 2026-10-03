// The board's own labels in the visitor's language: lang= (remembered), then the last choice, then the browser.
import { LOCALES } from './locales.js';
import { loadPreference, savePreference } from './store.js';

const RTL = ['ar', 'he', 'fa', 'ur'];
const supported = (tag) => {
	const base = String(tag ?? '').toLowerCase().split(/[-_]/)[0];
	return Object.hasOwn(LOCALES, base) ? base : null;
};

const requested = supported(new URLSearchParams(location.search).get('lang'));
if (requested) savePreference('lang', requested);

export const lang = requested ?? supported(loadPreference('lang')) ?? supported(navigator.language) ?? 'en';
export const dir = RTL.includes(lang) ? 'rtl' : 'ltr';

export const t = (key, vars = {}) =>
	(LOCALES[lang][key] ?? LOCALES.en[key] ?? key).replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '');

export const num = (n) => new Intl.NumberFormat(lang).format(n);
