import { chromium } from '@playwright/test';
const [url, out, w = '1440', h = '900'] = process.argv.slice(2);
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: +w, height: +h } })).newPage();
await p.goto(url, { waitUntil: 'networkidle' }); await p.screenshot({ path: out, fullPage: true }); await b.close();
