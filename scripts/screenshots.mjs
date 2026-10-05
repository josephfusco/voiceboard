// Screenshots every example in docs/examples.json against the local build, then rewrites the
// README gallery (featured examples) and docs/gallery.md (all of them) between the examples
// markers. Run with `npm run screenshots`.
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const LIVE = 'https://voiceboardgames.com/board/';
const PORT = 8767;
const LOCAL = `http://127.0.0.1:${PORT}/`;
// Pages load at the live address (so on-screen phrases show it) but are served from the local build.
const SHOWN = 'https://voiceboardgames.com/board/';
const serveLocally = (context) => context.route('https://voiceboardgames.com/**', async (route) => {
	const { pathname, search } = new URL(route.request().url());
	route.fulfill({ response: await route.fetch({ url: `${LOCAL}${pathname.replace(/^\/board\/?/, '').replace(/^\//, '')}${search}` }) });
});
const root = new URL('../', import.meta.url);
const examples = JSON.parse(readFileSync(new URL('docs/examples.json', root), 'utf8'));

export const slug = (title) => title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'example';
const image = (example, i) => `docs/screenshots/${String(i + 1).padStart(2, '0')}-${slug(example.title)}.jpg`;

// featured keeps only the examples marked featured; dir is the folder the gallery's file lives in.
export const gallery = (list, { featured = false, dir = '' } = {}) => {
	const shown = list.map((example, i) => ({ example, i })).filter(({ example }) => !featured || example.featured);
	const cell = ({ example, i }) => {
		const url = LIVE + example.query;
		const src = image(example, i).slice(dir.length);
		return `<td width="50%" valign="top"><a href="${url}"><img src="${src}" alt="${example.title}"></a><br><a href="${url}">${example.title}</a></td>`;
	};
	const rows = [];
	for (let i = 0; i < shown.length; i += 2) rows.push(`<tr>${cell(shown[i])}${shown[i + 1] ? cell(shown[i + 1]) : '<td></td>'}</tr>`);
	return `<table>\n${rows.join('\n')}\n</table>`;
};

export const galleries = (list) => [
	{ file: 'README.md', table: gallery(list, { featured: true }) },
	{ file: 'docs/gallery.md', table: gallery(list, { dir: 'docs/' }) },
];
const MARKERS = /<!-- examples:start -->[\s\S]*<!-- examples:end -->/;

if (import.meta.url === `file://${process.argv[1]}`) {
	const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: root.pathname, stdio: 'ignore' });
	await new Promise((resolve) => setTimeout(resolve, 800));
	const browser = await chromium.launch();
	try {
		for (const [i, example] of examples.entries()) {
			// A fresh device per example; half-scale keeps the images light (960x600 of a 1920x1200 screen).
			const context = await browser.newContext({ viewport: { width: 1920, height: 1200 }, deviceScaleFactor: 0.5, locale: 'en-US', colorScheme: example.colorScheme ?? 'light' });
			await serveLocally(context);
			const page = await context.newPage();
			await page.clock.setFixedTime(new Date('2026-10-03T10:30:00'));
			for (const seed of example.seed ?? []) await page.goto(SHOWN + seed);
			await page.goto(SHOWN + example.query);
			await page.waitForSelector('#board.board');
			await page.waitForTimeout(example.query.includes('fx=confetti') ? 1200 : example.query.includes('roll=') ? 900 : 400);
			await page.screenshot({ path: new URL(image(example, i), root).pathname, type: 'jpeg', quality: 82 });
			await context.close();
			console.log(`✓ ${example.title}`);
		}
	} finally {
		await browser.close();
		server.kill();
	}

	for (const { file, table } of galleries(examples)) {
		const path = new URL(file, root);
		writeFileSync(path, readFileSync(path, 'utf8').replace(MARKERS, `<!-- examples:start -->\n${table}\n<!-- examples:end -->`));
	}
}
