// Records the chess demo from the same voice script the end-to-end test uses: each line appears as a caption,
// the mock assistant opens the next URL, and a passenger taps a piece once to see its moves.
// Run with `npm run demo-video` (needs ffmpeg). Writes docs/chess-demo.gif.
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from '@playwright/test';
import { VOICE_SCRIPT, mockAssistant } from '../tests/scripts/chess-game.js';

const PORT = 8768;
const root = new URL('../', import.meta.url).pathname;
const size = { width: 1280, height: 800 };
const dir = mkdtempSync(join(tmpdir(), 'voiceboard-video-'));

const caption = (page, { speaker, says }) => page.evaluate(([who, text]) => {
	const box = document.createElement('div');
	box.style.cssText = 'position:fixed;left:50%;top:5vh;translate:-50% 0;z-index:9;padding:1.2vh 2vw;border-radius:999px;background:#171a20e6;color:#fff;font:600 2.6vh system-ui;white-space:nowrap';
	box.textContent = `🎙 ${who}: “${text}”`;
	document.body.append(box);
}, [speaker, says]);

const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
await new Promise((resolve) => setTimeout(resolve, 800));
const browser = await chromium.launch();
try {
	const context = await browser.newContext({ viewport: size, recordVideo: { dir, size }, colorScheme: 'light' });
	const page = await context.newPage();
	const assistant = mockAssistant();
	for (const [i, line] of VOICE_SCRIPT.entries()) {
		await page.goto(`http://127.0.0.1:${PORT}/${assistant(line)}`);
		await page.waitForSelector('.chess-board');
		await caption(page, line);
		await page.waitForTimeout(1500);
		if (i === 6) {
			// A passenger taps White's knight to see where it can go.
			await caption(page, { speaker: 'Passenger', says: '(taps the knight on b1)' });
			await page.locator('[data-square="b1"]').click();
			await page.waitForTimeout(1500);
		}
	}
	await page.waitForTimeout(2000);
	await context.close();
} finally {
	await browser.close();
	server.kill();
}

const video = join(dir, readdirSync(dir).find((f) => f.endsWith('.webm')));
const gif = join(root, 'docs/chess-demo.gif');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', video, '-vf', 'fps=6,scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=48:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle', gif]);
rmSync(dir, { recursive: true, force: true });
console.log(`Wrote ${gif}`);
