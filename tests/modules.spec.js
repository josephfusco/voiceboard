import { readFileSync, readdirSync } from 'node:fs';
import { test, expect } from './fixtures.js';

// Modules are the proof the APIs are enough: they may only use the public 'voiceboard' import and core hooks.
const root = new URL('../plugins/', import.meta.url);
const modules = readdirSync(root, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
const read = (path) => readFileSync(new URL(path, root), 'utf8');

test.describe('modules', () => {
	test.skip(({ boardPath }) => boardPath !== '/', 'file check; run once');

	for (const name of modules) {
		test(`${name} is a standalone plugin that guards against loading twice`, () => {
			const php = read(`${name}/${name}.php`);
			expect(php).toMatch(/Plugin Name:\s+Voiceboard /);
			expect(php).toContain('Requires Plugins:  voiceboard');
			expect(php).toMatch(/if \( defined\( 'VOICEBOARD_[A-Z]+' \) \)/);
		});

		test(`${name} uses only the public JavaScript API (plus its own files)`, () => {
			for (const file of readdirSync(new URL(`${name}/`, root)).filter((f) => f.endsWith('.js'))) {
				const imports = [...read(`${name}/${file}`).matchAll(/from '([^']+)'/g)].map((m) => m[1]);
				expect(imports.filter((source) => source !== 'voiceboard' && !source.startsWith('./')), file).toEqual([]);
			}
		});
	}
});

test('the WordPress board loads every module in order', async ({ request, boardPath }) => {
	test.skip(boardPath !== '/board/', 'plugin only');
	const html = await (await request.get(boardPath)).text();
	const list = html.match(/name="voiceboard-modules" content="([^"]*)"/)[1].split(' ').map((url) => url.split('/plugins/').pop().split('?')[0]);
	expect(list).toEqual(['voiceboard-trivia/trivia.js', 'voiceboard-jeopardy/jeopardy.js', 'voiceboard-chess/chess.js', 'voiceboard-effects/confetti.js', 'voiceboard-effects/timer.js']);
	expect(html).toMatch(/"voiceboard":"\/wp-content\/plugins\/voiceboard\/js\/voiceboard\.js\?v=\d+"/);
});

test('every script and stylesheet the board loads is versioned', async ({ request, boardPath }) => {
	test.skip(boardPath !== '/board/', 'plugin only');
	const html = await (await request.get(boardPath)).text();
	expect(html).toMatch(/src="\/wp-content\/plugins\/voiceboard\/js\/main\.js\?v=\d+"/);
	expect(html).toMatch(/href="\/wp-content\/plugins\/voiceboard\/board\.css\?v=\d+"/);
	const map = JSON.parse(html.match(/<script type="importmap">(.*?)<\/script>/)[1]).imports;
	expect(map['/wp-content/plugins/voiceboard/js/i18n.js']).toMatch(/\?v=\d+$/);
	expect(map['/wp-content/plugins/voiceboard/plugins/voiceboard-chess/vendor/chess.js']).toMatch(/\?v=\d+$/);
});
