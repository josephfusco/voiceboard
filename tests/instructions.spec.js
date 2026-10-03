import { readFileSync } from 'node:fs';
import { test, expect } from './fixtures.js';
import { PARAMS } from './params.js';

// Every URL parameter the board reads must be documented for assistants in llms.txt.

test('llms.txt documents every parameter', async ({ boardPath }) => {
	test.skip(boardPath !== '/', 'file check; run once');
	const text = readFileSync(new URL('../llms.txt', import.meta.url), 'utf8');
	const missing = PARAMS.filter((key) => !new RegExp(`(^- |\\b)${key}[=:]`, 'm').test(text));
	expect(missing).toEqual([]);
});

// WordPress's public query vars (WP::$public_query_vars). Board params may overlap only where the
// plugin knows how to tell them apart: p= and w= are never numeric on the board.
const WP_PUBLIC = ['m', 'p', 'posts', 'w', 'cat', 'withcomments', 'withoutcomments', 's', 'search', 'exact', 'sentence', 'calendar', 'page', 'paged', 'more', 'tb', 'pb', 'author', 'order', 'orderby', 'year', 'monthnum', 'day', 'hour', 'minute', 'second', 'name', 'category_name', 'tag', 'feed', 'author_name', 'pagename', 'page_id', 'error', 'attachment', 'attachment_id', 'subpost', 'subpost_id', 'preview', 'robots', 'favicon', 'taxonomy', 'term', 'cpage', 'post_type', 'embed'];

test('board params avoid reserved WordPress query vars', async ({ boardPath }) => {
	test.skip(boardPath !== '/', 'file check; run once');
	expect(PARAMS.filter((key) => WP_PUBLIC.includes(key))).toEqual(['p', 'w']);
});
