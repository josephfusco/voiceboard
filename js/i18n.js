// The board's own labels in the visitor's language: lang= on this URL, else the browser's language.
// Not remembered, so one link in another language doesn't change every page after it.
import { LOCALES } from './locales.js';

const RTL = ['ar', 'he', 'fa', 'ur'];
const supported = (tag) => {
	const base = String(tag ?? '').toLowerCase().split(/[-_]/)[0];
	return Object.hasOwn(LOCALES, base) ? base : null;
};

export const lang = supported(new URLSearchParams(location.search).get('lang')) ?? supported(navigator.language) ?? 'en';
export const dir = RTL.includes(lang) ? 'rtl' : 'ltr';

export const t = (key, vars = {}) =>
	(LOCALES[lang][key] ?? LOCALES.en[key] ?? key).replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '');

export const num = (n) => new Intl.NumberFormat(lang).format(n);

// Modules add their own labels: addStrings({ en: { 'mygame.title': 'My game' }, es: { ... } }).
export const addStrings = (table) => {
	for (const [code, strings] of Object.entries(table)) Object.assign((LOCALES[code] ??= {}), strings);
};
