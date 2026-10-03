import { readFileSync, readdirSync } from 'node:fs';
import { test, expect } from './fixtures.js';
import { PARAMS } from './params.js';
import { LOCALES } from '../js/locales.js';

// The README must keep up with the code: parameters, languages, and files.
const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');

test.describe('README stays in sync', () => {
	test.skip(({ boardPath }) => boardPath !== '/', 'file check; run once');

	test('documents every URL parameter', () => {
		expect(PARAMS.filter((key) => !readme.includes(`\`${key}\``))).toEqual([]);
	});

	test('names every supported language', () => {
		const names = new Intl.DisplayNames(['en'], { type: 'language' });
		expect(Object.keys(LOCALES).map((code) => names.of(code)).filter((name) => !readme.includes(name))).toEqual([]);
	});

	test('lists every source file or folder', () => {
		const root = new URL('../', import.meta.url);
		const entries = [
			...['voiceboard.php', 'index.html', 'llms.txt', 'board.css'],
			...readdirSync(new URL('js/', root), { withFileTypes: true }).map((e) => `js/${e.name}${e.isDirectory() ? '/' : ''}`),
			...readdirSync(new URL('includes/', root)).map((name) => `includes/${name}`),
		];
		expect(entries.filter((entry) => !readme.includes(entry))).toEqual([]);
	});
});
